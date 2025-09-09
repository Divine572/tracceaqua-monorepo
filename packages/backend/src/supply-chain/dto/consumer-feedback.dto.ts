import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEmail, Min, Max, MaxLength, IsDateString, IsObject, IsEnum } from 'class-validator';

export enum FeedbackStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

export class CreateConsumerFeedbackDto {
    @ApiProperty({
      description: 'Product ID being reviewed',
      example: 'PROD-2024-001'
  })
    @IsString()
    @IsNotEmpty()
    productId: string;

    @ApiProperty({
        description: 'Rating from 1 to 5',
        example: 4,
        minimum: 1,
      maximum: 5
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

    @ApiPropertyOptional({
        description: 'Review comment',
        example: 'Fresh and delicious oysters! Great quality.',
        maxLength: 1000
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;

    @ApiPropertyOptional({
        description: 'Consumer email address',
        example: 'consumer@email.com'
  })
  @IsOptional()
  @IsEmail()
  consumerEmail?: string;

    @ApiPropertyOptional({
        description: 'Consumer name',
        example: 'John Doe',
        maxLength: 100
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  consumerName?: string;

    @ApiPropertyOptional({
        description: 'Where the product was purchased',
        example: 'Lagos Central Market',
        maxLength: 200
  })
  @IsOptional()
  @IsString()
    @MaxLength(200)
    purchaseLocation?: string;

    @ApiPropertyOptional({
        description: 'When the product was purchased',
        example: '2024-06-15'
    })
    @IsOptional()
    @IsDateString()
    purchaseDate?: string;

    @ApiPropertyOptional({
        description: 'Additional metadata',
        example: { source: 'mobile_app', version: '1.0.0' }
    })
    @IsOptional()
    @IsObject()
    metadata?: any;
}

export class ConsumerFeedbackResponseDto {
    @ApiProperty({ description: 'Feedback ID' })
  id: string;

    @ApiProperty({ description: 'Product ID' })
  productId: string;

    @ApiProperty({ description: 'Rating from 1 to 5' })
  rating: number;

    @ApiPropertyOptional({ description: 'Review comment' })
    comment?: string;

    @ApiPropertyOptional({ description: 'Consumer email address' })
    consumerEmail?: string;

    @ApiPropertyOptional({ description: 'Consumer name' })
    consumerName?: string;

    @ApiPropertyOptional({ description: 'Purchase location' })
    purchaseLocation?: string;

    @ApiPropertyOptional({ description: 'Purchase date' })
    purchaseDate?: Date;

    @ApiProperty({ description: 'Whether the feedback is verified' })
    verified: boolean;

    @ApiProperty({
        description: 'Feedback status',
        enum: FeedbackStatus
    })
    status: FeedbackStatus;

    @ApiPropertyOptional({ description: 'Admin who moderated the feedback' })
    moderatedBy?: string;

    @ApiPropertyOptional({ description: 'Moderation timestamp' })
    moderatedAt?: Date;

    @ApiPropertyOptional({ description: 'Moderation notes' })
    moderationNotes?: string;

    @ApiPropertyOptional({ description: 'Additional metadata' })
    metadata?: any;

    @ApiProperty({ description: 'Creation timestamp' })
    createdAt: Date;
}

export class ModerateFeedbackDto {
    @ApiProperty({
      description: 'Moderation action',
      enum: ['approve', 'reject'],
      example: 'approve'
  })
  @IsEnum(['approve', 'reject'])
  action: 'approve' | 'reject';

    @ApiPropertyOptional({
        description: 'Moderation notes',
        example: 'Approved - helpful and appropriate feedback',
        maxLength: 500
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    moderationNotes?: string;
}
