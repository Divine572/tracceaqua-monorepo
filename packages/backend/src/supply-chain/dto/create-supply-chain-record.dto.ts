import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsObject, IsArray, IsOptional, IsBoolean, IsEnum, IsNumber, Min, Max, MaxLength, MinLength } from 'class-validator';

export enum SourceType {
  FARMED = 'FARMED',
  WILD_CAPTURE = 'WILD_CAPTURE'
}

export enum SupplyChainStage {
  HATCHERY = 'HATCHERY',
  GROW_OUT = 'GROW_OUT',
  HARVEST = 'HARVEST',
  FISHING = 'FISHING',
  PROCESSING = 'PROCESSING',
  DISTRIBUTION = 'DISTRIBUTION',
  RETAIL = 'RETAIL'
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  RECALLED = 'RECALLED',
  EXPIRED = 'EXPIRED',
  SOLD = 'SOLD'
}

export class CreateSupplyChainRecordDto {
  @ApiProperty({
    description: 'Unique product identifier',
    example: 'PROD-2024-001',
    minLength: 5,
    maxLength: 50
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(50)
  productId: string;

  @ApiPropertyOptional({
    description: 'Batch identifier for grouping products',
    example: 'BATCH-2024-Q1-001',
    maxLength: 50
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  batchId?: string;

  @ApiProperty({
    description: 'Source type of the product',
    enum: SourceType,
    example: SourceType.FARMED
  })
  @IsEnum(SourceType)
  sourceType: SourceType;

  @ApiProperty({
    description: 'Scientific name of the species',
    example: 'Crassostrea gasar',
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  speciesName: string;

  @ApiPropertyOptional({
    description: 'Commercial product name',
    example: 'Premium Lagos Oysters',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  productName?: string;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'Fresh oysters from sustainable aquaculture farms in Lagos',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  productDescription?: string;

  @ApiProperty({
    description: 'Current stage in the supply chain',
    enum: SupplyChainStage,
    example: SupplyChainStage.HATCHERY
  })
  @IsEnum(SupplyChainStage)
  currentStage: SupplyChainStage;

  @ApiPropertyOptional({
    description: 'Location information',
    example: 'Lagos State Aquaculture Farm, Nigeria',
    maxLength: 200
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  // Stage-specific data
  @ApiPropertyOptional({
    description: 'Hatchery stage data',
    example: {
      hatcheryName: 'Lagos Hatchery',
      spawningDate: '2024-01-15',
      broodstockSource: 'Local wild stock',
      larvaeCount: 1000000,
      mortalityRate: 0.15,
      feedType: 'Natural phytoplankton',
      waterQuality: {
        temperature: 28,
        salinity: 20,
        pH: 8.1
      }
    }
  })
  @IsOptional()
  @IsObject()
  hatcheryData?: any;

  @ApiPropertyOptional({
    description: 'Grow-out stage data',
    example: {
      farmName: 'Lagos Bay Farm',
      stockingDate: '2024-02-15',
      stockingDensity: 500,
      growthRate: 2.5,
      feedConversionRatio: 1.8,
      mortalityRate: 0.05,
      harvestSize: 75,
      cultureMethod: 'Suspended culture'
    }
  })
  @IsOptional()
  @IsObject()
  growOutData?: any;

  @ApiPropertyOptional({
    description: 'Harvest stage data',
    example: {
      harvestDate: '2024-06-15',
      harvestQuantity: 2500,
      harvestMethod: 'Hand picking',
      qualityGrade: 'Premium',
      shellLength: 85,
      meatYield: 0.12,
      harvestLocation: 'Farm Site A'
    }
  })
  @IsOptional()
  @IsObject()
  harvestData?: any;

  @ApiPropertyOptional({
    description: 'Fishing stage data (for wild-capture)',
    example: {
      fishingDate: '2024-06-15',
      vesselName: 'Lagos Fisher I',
      vesselRegistration: 'LOS-001',
      captainName: 'John Doe',
      fishingMethod: 'Diving',
      catchQuantity: 1000,
      fishingArea: 'Lagos Lagoon Zone A',
      gpsCoordinates: '6.5244, 3.3792'
    }
  })
  @IsOptional()
  @IsObject()
  fishingData?: any;

  @ApiPropertyOptional({
    description: 'Processing stage data',
    example: {
      processingDate: '2024-06-16',
      processingFacility: 'Lagos Seafood Processing',
      processingType: 'Fresh shucking',
      packageType: 'Vacuum sealed',
      packageSize: '500g',
      expiryDate: '2024-06-23',
      storageTemperature: 4,
      qualityChecks: ['Visual inspection', 'Smell test', 'Size grading']
    }
  })
  @IsOptional()
  @IsObject()
  processingData?: any;

  @ApiPropertyOptional({
    description: 'Distribution stage data',
    example: {
      distributionDate: '2024-06-17',
      distributor: 'Lagos Seafood Distributors',
      transportMethod: 'Refrigerated truck',
      temperature: 2,
      destination: 'Lagos Central Market',
      deliveryDate: '2024-06-17',
      trackingNumber: 'TRACK-001'
    }
  })
  @IsOptional()
  @IsObject()
  distributionData?: any;

  @ApiPropertyOptional({
    description: 'Retail stage data',
    example: {
      retailer: 'Fresh Market Lagos',
      receivedDate: '2024-06-17',
      displayMethod: 'Ice display',
      sellByDate: '2024-06-20',
      pricePerKg: 2500,
      inventory: 50
    }
  })
  @IsOptional()
  @IsObject()
  retailData?: any;

  @ApiPropertyOptional({
    description: 'Product certifications',
    example: ['Organic', 'Sustainable Aquaculture', 'HACCP']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];

  @ApiPropertyOptional({
    description: 'Quality metrics',
    example: {
      freshness: 9.5,
      appearance: 9.0,
      smell: 9.2,
      texture: 8.8,
      overallQuality: 9.1
    }
  })
  @IsOptional()
  @IsObject()
  qualityMetrics?: any;

  @ApiPropertyOptional({
    description: 'IPFS hashes of uploaded files',
    example: ['QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fileHashes?: string[];

  @ApiPropertyOptional({
    description: 'Sustainability score (0-100)',
    example: 85,
    minimum: 0,
    maximum: 100
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  sustainabilityScore?: number;

  @ApiPropertyOptional({
    description: 'Whether the product is publicly traceable',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({
    description: 'Product tags for categorization',
    example: ['premium', 'local', 'sustainable']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Whether to upload the complete record data to IPFS',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  uploadToIPFS?: boolean;
}