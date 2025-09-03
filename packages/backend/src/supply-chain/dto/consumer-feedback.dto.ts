import { IsNumber, IsOptional, IsString, IsBoolean, Min, Max, IsEmail, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConsumerFeedbackDto {
  @ApiProperty({ 
    description: 'Rating from 1-5', 
    minimum: 1, 
    maximum: 5,
    example: 4
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ 
    description: 'Optional comment from consumer (max 1000 chars)',
    example: 'Great quality fish, very fresh!',
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Comment must be less than 1000 characters' })
  comment?: string;

  @ApiProperty({ 
    description: 'Optional consumer email for follow-up',
    example: 'consumer@example.com',
    required: false
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ 
    description: 'Would the consumer buy this product again',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  wouldBuyAgain?: boolean;

  @ApiProperty({ 
    description: 'Location where feedback was given',
    example: 'Lagos, Nigeria',
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Location must be less than 100 characters' })
  location?: string;
}

export class ConsumerFeedbackResponseDto {
  @ApiProperty({ example: 'clp123abc456def789' })
  id: string;

  @ApiProperty({ example: 'FISH-2024-001' })
  productId: string;

  @ApiProperty({ example: 4 })
  rating: number;

  @ApiProperty({ example: 'Great quality fish!', required: false })
  comment?: string | null;

  @ApiProperty({ example: 'consumer@example.com', required: false })
  email?: string | null;

  @ApiProperty({ example: true, required: false })
  wouldBuyAgain?: boolean | null;

  @ApiProperty({ example: 'Lagos, Nigeria', required: false })
  location?: string | null;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: string;
}

export class FeedbackAggregateDto {
  @ApiProperty({ example: 4.2 })
  averageRating: number;

  @ApiProperty({ example: 127 })
  totalFeedbacks: number;

  @ApiProperty({ 
    example: { "1": 2, "2": 5, "3": 15, "4": 45, "5": 60 },
    description: 'Distribution of ratings 1-5'
  })
  ratingDistribution: { [key: number]: number };

  @ApiProperty({ type: [ConsumerFeedbackResponseDto] })
  feedbacks: ConsumerFeedbackResponseDto[];
}
