import { ApiProperty } from '@nestjs/swagger';

export class PublicStatisticsDto {
    @ApiProperty({ description: 'Total number of public products' })
  totalProducts: number;

    @ApiProperty({ description: 'Total number of unique batches' })
    totalBatches: number;

    @ApiProperty({ description: 'Breakdown by source type' })
    sourceTypeBreakdown: Record<string, number>;

    @ApiProperty({ description: 'Breakdown by current stage' })
    stageBreakdown: Record<string, number>;

    @ApiProperty({ description: 'Sustainability statistics' })
    sustainability: {
        averageScore: number;
        totalRated: number;
        scoreDistribution: Record<string, number>;
    };

    @ApiProperty({ description: 'Top species by count' })
    topSpecies: Array<{ species: string; count: number }>;

    @ApiProperty({ description: 'Consumer feedback statistics' })
    consumerFeedback: {
        totalReviews: number;
        averageRating: number;
      recentReviews: number;
  };

    @ApiProperty({ description: 'Recent activity metrics' })
    recentActivity: {
        newProductsThisWeek: number;
        newProductsThisMonth: number;
        activeStageUpdates: number;
    };

    @ApiProperty({ description: 'Last updated timestamp' })
    lastUpdated: string;
}
