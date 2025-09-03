import { ApiProperty } from '@nestjs/swagger';

export class PublicStatisticsDto {
  @ApiProperty({ 
    description: 'Total number of products in the system',
    example: 1250
  })
  totalProducts: number;

  @ApiProperty({ 
    description: 'Total number of supply chain stages recorded',
    example: 8500
  })
  totalStages: number;

  @ApiProperty({ 
    description: 'Average journey time in days',
    example: 14.2
  })
  averageJourneyTime: number;

  @ApiProperty({ 
    description: 'Percentage of stages that are verified',
    example: 98.5
  })
  verificationRate: number;

  @ApiProperty({ 
    description: 'Total number of consumer traces performed',
    example: 25000
  })
  totalTraces: number;

  @ApiProperty({ 
    description: 'Average consumer rating across all products',
    example: 4.6
  })
  averageRating: number;

  @ApiProperty({ 
    description: 'Most popular species being traced',
    example: 'Tilapia'
  })
  topSpecies: string;

  @ApiProperty({ 
    description: 'Number of certified sustainable products',
    example: 1120
  })
  sustainableProducts: number;
}
