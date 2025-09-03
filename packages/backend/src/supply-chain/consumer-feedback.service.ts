import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConsumerFeedbackDto, ConsumerFeedbackResponseDto } from './dto/consumer-feedback.dto';

@Injectable()
export class ConsumerFeedbackService {
  constructor(private prisma: PrismaService) {}

  async createFeedback(
    productId: string,
    feedbackDto: CreateConsumerFeedbackDto,
    ipAddress?: string,
    userAgent?: string
  ): Promise<ConsumerFeedbackResponseDto> {
    // Verify product exists and is public
    const product = await this.prisma.supplyChainRecord.findFirst({
      where: { 
        productId,
        isPublic: true, // Only allow feedback on public products
        status: { not: 'DELETED' }
      },
    });

    

    if (!product) {
      throw new NotFoundException('Product not found or not available for feedback');
    }

    // Validate rating range
    if (feedbackDto.rating < 1 || feedbackDto.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Create feedback record
    const feedback = await this.prisma.consumerFeedback.create({
      data: {
        productId,
        rating: feedbackDto.rating,
        comment: feedbackDto.comment?.trim() || null,
        email: feedbackDto.email?.toLowerCase() || null,
        wouldBuyAgain: feedbackDto.wouldBuyAgain,
        location: feedbackDto.location?.trim() || null,
        ipAddress,
        userAgent,
      },
    });

    return {
      id: feedback.id,
      productId: feedback.productId,
      rating: feedback.rating,
      comment: feedback.comment,
      email: feedback.email,
      wouldBuyAgain: feedback.wouldBuyAgain,
      location: feedback.location,
      createdAt: feedback.createdAt.toISOString(),
    };
  }

  async getFeedbackForProduct(productId: string): Promise<{
    averageRating: number;
    totalFeedbacks: number;
    feedbacks: ConsumerFeedbackResponseDto[];
    ratingDistribution: { [key: number]: number };
  }> {
    // Verify product exists and is public
    const product = await this.prisma.supplyChainRecord.findFirst({
      where: { 
        productId,
        isPublic: true,
        status: { not: 'DELETED' }
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Get all feedback for this product
    const feedbacks = await this.prisma.consumerFeedback.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to recent 50 feedbacks for performance
    });

    // Calculate statistics
    const totalFeedbacks = feedbacks.length;
    const averageRating = totalFeedbacks > 0 
      ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks
      : 0;

    // Calculate rating distribution
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    feedbacks.forEach(feedback => {
      ratingDistribution[feedback.rating]++;
    });

    // Format feedback responses (exclude email for privacy)
    const formattedFeedbacks: ConsumerFeedbackResponseDto[] = feedbacks.map(f => ({
      id: f.id,
      productId: f.productId,
      rating: f.rating,
      comment: f.comment,
      email: null, // Don't expose emails publicly
      wouldBuyAgain: f.wouldBuyAgain,
      location: f.location,
      createdAt: f.createdAt.toISOString(),
    }));

    return {
      averageRating: Number(averageRating.toFixed(1)),
      totalFeedbacks,
      feedbacks: formattedFeedbacks,
      ratingDistribution,
    };
  }

  async getFeedbackStatistics(): Promise<{
    totalFeedbacks: number;
    averageGlobalRating: number;
    topRatedProducts: Array<{ productId: string; productName: string; averageRating: number }>;
  }> {
    const [totalFeedbacks, avgResult, topProducts] = await Promise.all([
      // Total feedback count
      this.prisma.consumerFeedback.count(),
      
      // Global average rating
      this.prisma.consumerFeedback.aggregate({
        _avg: { rating: true },
      }),
      
      // Top rated products (with at least 5 feedbacks)
      this.prisma.consumerFeedback.groupBy({
        by: ['productId'],
        _avg: { rating: true },
        _count: { rating: true },
        having: {
          rating: { _count: { gte: 5 } },
        },
        orderBy: { _avg: { rating: 'desc' } },
        take: 10,
      }),
    ]);

    // Get product details for top rated products
    const productIds = topProducts.map(p => p.productId);
    const productDetails = await this.prisma.supplyChainRecord.findMany({
      where: { 
        productId: { in: productIds },
        isPublic: true 
      },
      select: { productId: true, productName: true },
    });

    const topRatedProducts = topProducts.map(p => {
      const product = productDetails.find(pd => pd.productId === p.productId);
      return {
        productId: p.productId,
        productName: product?.productName || 'Unknown Product',
        averageRating: Number(p._avg.rating?.toFixed(1) || 0),
      };
    });

    return {
      totalFeedbacks,
      averageGlobalRating: Number(avgResult._avg.rating?.toFixed(1) || 0),
      topRatedProducts,
    };
  }
}