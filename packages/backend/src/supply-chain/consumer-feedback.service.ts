import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConsumerFeedbackDto, ConsumerFeedbackResponseDto, FeedbackStatus } from './dto/consumer-feedback.dto';

export interface FeedbackStatistics {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
  verifiedReviews: number;
  recentReviews: number;
}

export interface ProductRatingSummary {
  productId: string;
  productName: string;
  averageRating: number;
  totalReviews: number;
  lastReviewDate: Date | null;
}

@Injectable()
export class ConsumerFeedbackService {
  private readonly logger = new Logger(ConsumerFeedbackService.name);

  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateConsumerFeedbackDto): Promise<ConsumerFeedbackResponseDto> {
    try {
  // Verify product exists and is public
      const product = await this.prisma.supplyChainRecord.findUnique({
        where: { productId: createDto.productId },
        select: {
          id: true,
          productId: true,
          productName: true,
          isPublic: true,
          productStatus: true
        }
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      if (!product.isPublic) {
        throw new BadRequestException('Product is not available for public feedback');
      }

      if (product.productStatus !== 'ACTIVE') {
        throw new BadRequestException('Cannot provide feedback for inactive products');
      }

      // Validate rating range
      if (createDto.rating < 1 || createDto.rating > 5) {
        throw new BadRequestException('Rating must be between 1 and 5');
      }

      // Check for duplicate feedback from same email (if provided)
      if (createDto.consumerEmail) {
        const existingFeedback = await this.prisma.consumerFeedback.findFirst({
          where: {
            productId: createDto.productId,
            consumerEmail: createDto.consumerEmail
          }
        });

        if (existingFeedback) {
          throw new BadRequestException('You have already provided feedback for this product');
        }
      }

      // Create feedback record
      const feedback = await this.prisma.consumerFeedback.create({
        data: {
          productId: createDto.productId,
          rating: createDto.rating,
          comment: createDto.comment,
          consumerEmail: createDto.consumerEmail,
          consumerName: createDto.consumerName,
          purchaseLocation: createDto.purchaseLocation,
          purchaseDate: createDto.purchaseDate ? new Date(createDto.purchaseDate) : null,
          verified: false, // Will be verified by admin later
          status: FeedbackStatus.PENDING,
          metadata: createDto.metadata || {},
        }
      });

      this.logger.log(`Consumer feedback created for product ${createDto.productId}`);
      return this.mapToResponseDto(feedback);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to create consumer feedback: ${error.message}`);
      throw new BadRequestException('Failed to create feedback');
    }
  }

  async findByProduct(
    productId: string,
    verified: boolean = true,
    limit: number = 50
  ): Promise<ConsumerFeedbackResponseDto[]> {
    const feedback = await this.prisma.consumerFeedback.findMany({
      where: {
        productId,
        verified,
        status: FeedbackStatus.APPROVED
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 100) // Cap at 100 for performance
    });

    return feedback.map(f => this.mapToResponseDto(f));
  }

  async getProductRatings(productId: string): Promise<FeedbackStatistics> {
    const feedback = await this.prisma.consumerFeedback.findMany({
      where: {
        productId,
        verified: true,
        status: FeedbackStatus.APPROVED
      },
      select: {
        rating: true,
        createdAt: true,
        verified: true
      }
    });

    if (feedback.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: {},
        verifiedReviews: 0,
        recentReviews: 0
      };
    }

    const totalRating = feedback.reduce((sum, f) => sum + f.rating, 0);
    const averageRating = totalRating / feedback.length;

    const ratingDistribution = feedback.reduce((dist, f) => {
      dist[f.rating] = (dist[f.rating] || 0) + 1;
      return dist;
    }, {} as Record<number, number>);

    // Count recent reviews (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentReviews = feedback.filter(f => f.createdAt > thirtyDaysAgo).length;

    const verifiedReviews = feedback.filter(f => f.verified).length;

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: feedback.length,
      ratingDistribution,
      verifiedReviews,
      recentReviews
    };
  }

  async getAllProductRatings(limit: number = 20): Promise<ProductRatingSummary[]> {
    // Get products with feedback
    const productsWithFeedback = await this.prisma.supplyChainRecord.findMany({
      where: {
        isPublic: true,
        ConsumerFeedback: {
          some: {
            verified: true,
            status: FeedbackStatus.APPROVED
          }
        }
      },
      select: {
        productId: true,
        productName: true,
        ConsumerFeedback: {
          where: {
            verified: true,
            status: FeedbackStatus.APPROVED
          },
          select: {
            rating: true,
            createdAt: true
          }
        }
      },
      take: limit
    });

    return productsWithFeedback.map(product => {
      const feedback = product.ConsumerFeedback;
      const totalRating = feedback.reduce((sum, f) => sum + f.rating, 0);
      const averageRating = feedback.length > 0 ? totalRating / feedback.length : 0;
      const lastReviewDate = feedback.length > 0
        ? feedback.reduce((latest, f) => f.createdAt > latest ? f.createdAt : latest, feedback[0].createdAt)
        : null;

      return {
        productId: product.productId,
        productName: product.productName || 'Unnamed Product',
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: feedback.length,
        lastReviewDate
      };
    }).sort((a, b) => b.averageRating - a.averageRating);
  }

  async moderateFeedback(
    feedbackId: string,
    adminId: string,
    action: 'approve' | 'reject',
    moderationNotes?: string
  ): Promise<ConsumerFeedbackResponseDto> {
    const feedback = await this.prisma.consumerFeedback.findUnique({
      where: { id: feedbackId }
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    const status = action === 'approve' ? FeedbackStatus.APPROVED : FeedbackStatus.REJECTED;
    const verified = action === 'approve';

    const updatedFeedback = await this.prisma.consumerFeedback.update({
      where: { id: feedbackId },
      data: {
        status,
        verified,
        moderatedBy: adminId,
        moderatedAt: new Date(),
        moderationNotes,
      }
    });

    this.logger.log(`Feedback ${feedbackId} ${action}ed by admin ${adminId}`);
    return this.mapToResponseDto(updatedFeedback);
  }

  async getPendingFeedback(limit: number = 50): Promise<ConsumerFeedbackResponseDto[]> {
    const pendingFeedback = await this.prisma.consumerFeedback.findMany({
      where: {
        status: FeedbackStatus.PENDING
      },
      orderBy: { createdAt: 'asc' }, // Oldest first for FIFO processing
      take: Math.min(limit, 100)
    });

    return pendingFeedback.map(f => this.mapToResponseDto(f));
  }

  async getFeedbackStatistics(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    averageRatingOverall: number;
    feedbackByMonth: Record<string, number>;
  }> {
    const [total, byStatus, avgRating, monthlyData] = await Promise.all([
      this.prisma.consumerFeedback.count(),
      this.prisma.consumerFeedback.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      this.prisma.consumerFeedback.aggregate({
        where: { verified: true },
        _avg: { rating: true }
      }),
      this.prisma.consumerFeedback.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000) // Last 12 months
          }
        },
        select: { createdAt: true }
      })
    ]);

    const statusCounts = byStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<string, number>);

    // Group feedback by month
    const feedbackByMonth = monthlyData.reduce((acc, item) => {
      const monthKey = `${item.createdAt.getFullYear()}-${(item.createdAt.getMonth() + 1).toString().padStart(2, '0')}`;
      acc[monthKey] = (acc[monthKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      pending: statusCounts[FeedbackStatus.PENDING] || 0,
      approved: statusCounts[FeedbackStatus.APPROVED] || 0,
      rejected: statusCounts[FeedbackStatus.REJECTED] || 0,
      averageRatingOverall: avgRating._avg.rating || 0,
      feedbackByMonth
    };
  }

  async deleteOldFeedback(daysOld: number = 365): Promise<number> {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

    const result = await this.prisma.consumerFeedback.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        },
        status: FeedbackStatus.REJECTED // Only delete rejected feedback
      }
    });

    this.logger.log(`Deleted ${result.count} old feedback records`);
    return result.count;
  }

  private mapToResponseDto(feedback: any): ConsumerFeedbackResponseDto {
    return {
      id: feedback.id,
      productId: feedback.productId,
      rating: feedback.rating,
      comment: feedback.comment,
      consumerEmail: feedback.consumerEmail,
      consumerName: feedback.consumerName,
      purchaseLocation: feedback.purchaseLocation,
      purchaseDate: feedback.purchaseDate,
      verified: feedback.verified,
      status: feedback.status,
      moderatedBy: feedback.moderatedBy,
      moderatedAt: feedback.moderatedAt,
      moderationNotes: feedback.moderationNotes,
      metadata: feedback.metadata,
      createdAt: feedback.createdAt
    };
  }
}
