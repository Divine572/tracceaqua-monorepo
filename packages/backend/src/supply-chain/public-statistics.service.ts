import { Injectable } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { PublicStatisticsDto } from './dto/public-statistics.dto';




@Injectable()
export class PublicStatisticsService {
  constructor(private prisma: PrismaService) {}

  async getPublicStatistics(): Promise<PublicStatisticsDto> {
    try {
      const [
        totalProducts,
        publicProducts,
        totalStages,
        totalTraces,
        feedbackStats,
        topSpeciesResult,
        sustainableCount,
        recentProducts
      ] = await Promise.all([
        // Total products in system
        this.prisma.supplyChainRecord.count({
          where: { status: { not: 'DELETED' } }
        }),
        
        // Public products only
        this.prisma.supplyChainRecord.count({
          where: { 
            isPublic: true,
            status: { not: 'DELETED' }
          }
        }),
        
        // Total supply chain stages recorded
        this.prisma.supplyChainStageHistory.count(),
        
        // Total traces (views of products)
        this.prisma.productTrace.count(),
        
        // Consumer feedback statistics
        this.prisma.consumerFeedback.aggregate({
          _count: { id: true },
          _avg: { rating: true },
        }),
        
        // Most common species
        this.prisma.supplyChainRecord.groupBy({
          by: ['speciesName'],
          where: { 
            isPublic: true,
            status: { not: 'DELETED' }
          },
          _count: { speciesName: true },
          orderBy: { _count: { speciesName: 'desc' } },
          take: 1,
        }),
        
        // Products with sustainability certifications
        this.prisma.supplyChainRecord.count({
          where: {
            isPublic: true,
            status: { not: 'DELETED' },
            OR: [
              { certifications: { has: 'SUSTAINABLE_SEAFOOD' } },
              { certifications: { has: 'ORGANIC_AQUACULTURE' } },
              { certifications: { has: 'BAP_CERTIFIED' } },
            ]
          }
        }),
        
        // Recent products for journey time calculation
        this.prisma.supplyChainRecord.findMany({
          where: { 
            isPublic: true,
            status: { not: 'DELETED' },
            createdAt: { 
              gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
            }
          },
          include: {
            stageHistory: {
              orderBy: { updatedAt: 'desc' },
              take: 1,
            }
          },
          take: 100, // Sample size for performance
        })
      ]);

      // Calculate average journey time
      const journeyTimes = recentProducts
        .filter(p => p.stageHistory.length > 0)
        .map(product => {
          const lastStage = product.stageHistory[0];
          const journeyTime = (lastStage.updatedAt.getTime() - product.createdAt.getTime()) / (1000 * 60 * 60 * 24);
          return Math.max(0, journeyTime); // Ensure positive values
        });
      
      const averageJourneyTime = journeyTimes.length > 0
        ? journeyTimes.reduce((sum, time) => sum + time, 0) / journeyTimes.length
        : 14.0; // Default fallback

      // Calculate verification rate
      const totalStagesCount = totalStages || 1;
      const verifiedStages = await this.prisma.supplyChainStageHistory.count({
        where: { 
          blockchainHash: { not: null }, // Consider blockchain hash as verification
        }
      });
      const verificationRate = (verifiedStages / totalStagesCount) * 100;

      const stats: PublicStatisticsDto = {
        totalProducts: publicProducts, // Use public products for consumer-facing stats
        totalStages,
        averageJourneyTime: Number(averageJourneyTime.toFixed(1)),
        verificationRate: Number(verificationRate.toFixed(1)),
        totalTraces: totalTraces || 0,
        averageRating: Number(feedbackStats._avg.rating?.toFixed(1) || 0),
        topSpecies: topSpeciesResult[0]?.speciesName || 'Tilapia',
        sustainableProducts: sustainableCount,
      };

      return stats;
    } catch (error) {
      console.error('Error calculating public statistics:', error);
      
      // Return minimal stats if database queries fail
      const fallbackCount = await this.prisma.supplyChainRecord.count({
        where: { isPublic: true }
      }).catch(() => 0);

      return {
        totalProducts: fallbackCount,
        totalStages: 0,
        averageJourneyTime: 0,
        verificationRate: 0,
        totalTraces: 0,
        averageRating: 0,
        topSpecies: 'Unknown',
        sustainableProducts: 0,
      };
    }
  }

  async recordProductTrace(
    productId: string,
    ipAddress?: string,
    userAgent?: string,
    referer?: string,
    location?: string
  ): Promise<void> {
    try {
      // Verify product exists and is public
      const product = await this.prisma.supplyChainRecord.findFirst({
        where: { 
          productId,
          isPublic: true,
          status: { not: 'DELETED' }
        },
      });

      if (product) {
        await this.prisma.productTrace.create({
          data: {
            productId,
            ipAddress,
            userAgent,
            referer,
            location,
          },
        });
      }
    } catch (error) {
      // Silently fail trace recording to not impact user experience
      console.warn('Failed to record product trace:', error);
    }
  }

  async getFeaturedProducts(limit: number = 6): Promise<any[]> {
    try {
      // Get products with high ratings and multiple traces
      const featuredProducts = await this.prisma.supplyChainRecord.findMany({
        where: {
          isPublic: true,
          status: { not: 'DELETED' },
          traces: { some: {} }, // Has been traced at least once
        },
        include: {
          user: {
            select: { profile: { select: { organization: true } }, role: true }
          },
          consumerFeedback: {
            select: { rating: true },
            take: 10, // Sample for average calculation
          },
          _count: {
            select: { traces: true }
          }
        },
        take: limit * 2, // Get extra to filter and sort
      });

      // Calculate ratings and sort by engagement
      const productsWithStats = featuredProducts.map(product => ({
        productId: product.productId,
        productName: product.productName,
        speciesName: product.speciesName,
        sourceType: product.sourceType,
        qualityGrade: product.qualityGrade,
        certifications: product.certifications,
        creator: {
          organization: product.user?.profile?.organization,
          role: product.user?.role || 'UNKNOWN',
        },
        createdAt: product.createdAt.toISOString(),
        traceCount: product._count.traces,
        averageRating: product.consumerFeedback.length > 0
          ? product.consumerFeedback.reduce((sum, f) => sum + f.rating, 0) / product.consumerFeedback.length
          : 0,
      }));

      // Sort by engagement (traces + rating)
      const sorted = productsWithStats.sort((a, b) => {
        const scoreA = a.traceCount + (a.averageRating * 10);
        const scoreB = b.traceCount + (b.averageRating * 10);
        return scoreB - scoreA;
      });

      return sorted.slice(0, limit);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return [];
    }
  }
}
