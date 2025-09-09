import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SourceType, SupplyChainStage, ProductStatus } from './create-supply-chain-record.dto';

export class StageHistoryResponseDto {
  @ApiProperty({
    description: 'Stage history entry ID'
  })
  id: string;

  @ApiProperty({
    description: 'Supply chain stage',
    enum: SupplyChainStage
  })
  stage: SupplyChainStage;

  @ApiPropertyOptional({
    description: 'Location of the stage'
  })
  location?: string;

  @ApiProperty({
    description: 'Timestamp of the stage'
  })
  timestamp: Date;

  @ApiPropertyOptional({
    description: 'Notes about the stage'
  })
  notes?: string;

  @ApiPropertyOptional({
    description: 'Stage-specific data'
  })
  data?: any;

  @ApiPropertyOptional({
    description: 'IPFS hashes of files for this stage'
  })
  fileHashes?: string[];

  @ApiProperty({
    description: 'User who updated this stage'
  })
  user: {
    id: string;
    role: string;
    profile?: {
      firstName?: string;
      lastName?: string;
      organization?: string;
    } | null;
  };
}

export class SupplyChainRecordResponseDto {
  @ApiProperty({
    description: 'Unique record ID'
  })
  id: string;

  @ApiProperty({
    description: 'Unique product identifier'
  })
  productId: string;

  @ApiPropertyOptional({
    description: 'Batch identifier'
  })
  batchId?: string;

  @ApiProperty({
    description: 'Source type of the product',
    enum: SourceType
  })
  sourceType: SourceType;

  @ApiProperty({
    description: 'Scientific name of the species'
  })
  speciesName: string;

  @ApiPropertyOptional({
    description: 'Commercial product name'
  })
  productName?: string;

  @ApiPropertyOptional({
    description: 'Product description'
  })
  productDescription?: string;

  @ApiPropertyOptional({
    description: 'Hatchery stage data'
  })
  hatcheryData?: any;

  @ApiPropertyOptional({
    description: 'Grow-out stage data'
  })
  growOutData?: any;

  @ApiPropertyOptional({
    description: 'Harvest stage data'
  })
  harvestData?: any;

  @ApiPropertyOptional({
    description: 'Fishing stage data'
  })
  fishingData?: any;

  @ApiPropertyOptional({
    description: 'Processing stage data'
  })
  processingData?: any;

  @ApiPropertyOptional({
    description: 'Distribution stage data'
  })
  distributionData?: any;

  @ApiPropertyOptional({
    description: 'Retail stage data'
  })
  retailData?: any;

  @ApiProperty({
    description: 'Current stage in the supply chain',
    enum: SupplyChainStage
  })
  currentStage: SupplyChainStage;

  @ApiProperty({
    description: 'Product status',
    enum: ProductStatus
  })
  productStatus: ProductStatus;

  @ApiPropertyOptional({
    description: 'Product certifications'
  })
  certifications?: string[];

  @ApiPropertyOptional({
    description: 'Quality metrics'
  })
  qualityMetrics?: any;

  @ApiPropertyOptional({
    description: 'IPFS hashes of uploaded files'
  })
  fileHashes?: string[];

  @ApiPropertyOptional({
    description: 'Sustainability score'
  })
  sustainabilityScore?: number;

  @ApiProperty({
    description: 'Whether the product is publicly traceable'
  })
  isPublic: boolean;

  @ApiPropertyOptional({
    description: 'Product tags'
  })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'IPFS hash of complete record data'
  })
  dataHash?: string;

  @ApiPropertyOptional({
    description: 'Blockchain transaction hash'
  })
  blockchainHash?: string;

  @ApiProperty({
    description: 'Record creation timestamp'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Record last update timestamp'
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'User who created the record'
  })
  user: {
    id: string;
    address: string;
    role: string;
    profile?: {
      firstName?: string;
      lastName?: string;
      organization?: string;
    } | null;
  };

  @ApiPropertyOptional({
    description: 'Stage history for this product'
  })
  stageHistory?: StageHistoryResponseDto[];
}
