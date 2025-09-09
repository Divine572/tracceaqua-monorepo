import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PublicStatisticsDto } from './dto/public-statistics.dto';

@Injectable()
export class PublicStatisticsService {
    private readonly logger = new Logger(PublicStatisticsService.name);

  constructor(private prisma: PrismaService) {}

  async getPublicStatistics(): Promise<PublicStatisticsDto> {
    try {
      const [
        totalProducts,
          totalBatches,
          sourceTypeStats,
          stageStats,
          sustainabilityStats,
          speciesStats,
        feedbackStats,
          recentActivity
      ] = await Promise.all([
          this.getTotalPublicProducts(),
          this.getTotalBatches(),
          this.getSourceTypeStatistics(),
          this.getStageStatistics(),
          this.getSustainabilityStatistics(),
          this.getSpeciesStatistics(),
          this.getFeedbackStatistics(),
          this.getRecentActivity()
      ]);

            return {
                totalProducts,
                totalBatches,
                sourceTypeBreakdown: sourceTypeStats,
                stageBreakdown: stageStats,
                sustainability: sustainabilityStats,
                topSpecies: speciesStats,
                consumerFeedback: feedbackStats,
                recentActivity,
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            this.logger.error(`Failed to get public statistics: ${error.message}`);
            throw error;
        }
    }

    private async getTotalPublicProducts(): Promise<number> {
        return this.prisma.supplyChainRecord.count({
            where: { isPublic: true }
        });
    }

    private async getTotalBatches(): Promise<number> {
        const result = await this.prisma.supplyChainRecord.findMany({
            where: {
                isPublic: true,
                batchId: { not: null }
            },
            select: { batchId: true },
            distinct: ['batchId']
        });

        return result.length;
    }

    private async getSourceTypeStatistics(): Promise<Record<string, number>> {
        const stats = await this.prisma.supplyChainRecord.groupBy({
            by: ['sourceType'],
            where: { isPublic: true },
            _count: { sourceType: true }
        });

        return stats.reduce((acc, item) => {
            acc[item.sourceType] = item._count.sourceType;
            return acc;
        }, {} as Record<string, number>);
    }

    private async getStageStatistics(): Promise<Record<string, number>> {
        const stats = await this.prisma.supplyChainRecord.groupBy({
            by: ['currentStage'],
            where: { isPublic: true },
            _count: { currentStage: true }
        });

        return stats.reduce((acc, item) => {
            acc[item.currentStage] = item._count.currentStage;
            return acc;
        }, {} as Record<string, number>);
    }

    private async getSustainabilityStatistics(): Promise<{
        averageScore: number;
        totalRated: number;
        scoreDistribution: Record<string, number>;
    }> {
        const [avgResult, allScores] = await Promise.all([
            this.prisma.supplyChainRecord.aggregate({
                where: {
                    isPublic: true,
                    sustainabilityScore: { not: null }
          },
                _avg: { sustainabilityScore: true },
                _count: { sustainabilityScore: true }
            }),
        this.prisma.supplyChainRecord.findMany({
            where: {
                isPublic: true,
                sustainabilityScore: { not: null }
          },
            select: { sustainabilityScore: true }
        })
        ]);

        // Create score distribution (0-20, 21-40, 41-60, 61-80, 81-100)
        const scoreDistribution = allScores.reduce((acc, item) => {
            const score = item.sustainabilityScore!;
            let range: string;
      
          if (score <= 20) range = '0-20';
          else if (score <= 40) range = '21-40';
          else if (score <= 60) range = '41-60';
          else if (score <= 80) range = '61-80';
          else range = '81-100';

          acc[range] = (acc[range] || 0) + 1;
          return acc;
      }, {} as Record<string, number>);

        return {
            averageScore: avgResult._avg.sustainabilityScore || 0,
            totalRated: avgResult._count.sustainabilityScore || 0,
            scoreDistribution
        };
    }

    private async getSpeciesStatistics(): Promise<Array<{ species: string; count: number }>> {
        const stats = await this.prisma.supplyChainRecord.groupBy({
            by: ['speciesName'],
            where: { isPublic: true },
            _count: { speciesName: true },
            orderBy: { _count: { speciesName: 'desc' } },
            take: 10 // Top 10 species
        });

        return stats.map(item => ({
            species: item.speciesName,
            count: item._count.speciesName
        }));
    }

    private async getFeedbackStatistics(): Promise<{
        totalReviews: number;
        averageRating: number;
        recentReviews: number;
    }> {
        const [totalAndAvg, recentCount] = await Promise.all([
            this.prisma.consumerFeedback.aggregate({
                where: { verified: true },
                _count: { id: true },
                _avg: { rating: true }
            }),
            this.prisma.consumerFeedback.count({
                where: {
                    verified: true,
                    createdAt: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                    }
                }
            })
        ]);

      return {
          totalReviews: totalAndAvg._count.id,
          averageRating: totalAndAvg._avg.rating || 0,
          recentReviews: recentCount
      };
  }

    private async getRecentActivity(): Promise<{
        newProductsThisWeek: number;
        newProductsThisMonth: number;
        activeStageUpdates: number;
    }> {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const [newProductsWeek, newProductsMonth, stageUpdates] = await Promise.all([
            this.prisma.supplyChainRecord.count({
                where: {
          isPublic: true,
                    createdAt: { gte: oneWeekAgo }
                }
            }),
            this.prisma.supplyChainRecord.count({
                where: {
                    isPublic: true,
                    createdAt: { gte: oneMonthAgo }
                }
        }),
            this.prisma.supplyChainStageHistory.count({
                where: {
                    timestamp: { gte: oneWeekAgo }
                }
            })
        ]);

        return {
            newProductsThisWeek: newProductsWeek,
            newProductsThisMonth: newProductsMonth,
            activeStageUpdates: stageUpdates
        };
  }

    async getTopRatedProducts(limit: number = 10): Promise<Array<{
        productId: string;
        productName: string;
        averageRating: number;
        reviewCount: number;
    }>> {
        const productsWithRatings = await this.prisma.supplyChainRecord.findMany({
            where: {
                isPublic: true,
                ConsumerFeedback: {
                    some: { verified: true }
                }
        },
            select: {
                productId: true,
                productName: true,
                ConsumerFeedback: {
                    where: { verified: true },
                    select: { rating: true }
                }
            }
        });

        const ratingsData = productsWithRatings
            .map(product => {
                const ratings = product.ConsumerFeedback.map(f => f.rating);
                const averageRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;

                return {
                    productId: product.productId,
                  productName: product.productName || 'Unnamed Product',
                  averageRating: Math.round(averageRating * 10) / 10,
                  reviewCount: ratings.length
              };
          })
          .filter(product => product.reviewCount >= 3) // At least 3 reviews
          .sort((a, b) => b.averageRating - a.averageRating)
          .slice(0, limit);

        return ratingsData;
  }
}
