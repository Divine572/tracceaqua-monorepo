import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsObject, 
  IsArray, 
  IsNumber, 
  IsEnum,
  IsBoolean,
  ValidateNested,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsDateString
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

// Enums
export enum SourceType {
  FARMED = 'FARMED',
  WILD_CAPTURE = 'WILD_CAPTURE'
}

export enum SupplyChainStage {
  HATCHERY = 'HATCHERY',
  GROW_OUT = 'GROW_OUT',
  FISHING = 'FISHING',
  HARVEST = 'HARVEST',
  PROCESSING = 'PROCESSING',
  COLD_STORAGE = 'COLD_STORAGE',
  TRANSPORT = 'TRANSPORT',
  RETAIL = 'RETAIL',
  CONSUMER = 'CONSUMER'
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
  RECALLED = 'RECALLED'
}

// Stage-specific DTOs
export class HatcheryDataDto {
  @ApiProperty({ description: 'Species spawned' })
  @IsString()
  @IsNotEmpty()
  speciesSpawned: string;

  @ApiProperty({ description: 'Number of eggs/larvae' })
  @IsNumber()
  eggCount: number;

  @ApiProperty({ description: 'Spawning date' })
  @IsDateString()
  spawningDate: string;

  @ApiProperty({ description: 'Water temperature (°C)' })
  @IsNumber()
  waterTemperature: number;

  @ApiProperty({ description: 'Salinity level' })
  @IsNumber()
  salinity: number;

  @ApiProperty({ description: 'Feed type used' })
  @IsString()
  @IsNotEmpty()
  feedType: string;

  @ApiProperty({ description: 'Survival rate (%)' })
  @IsNumber()
  survivalRate: number;
}

export class GrowOutDataDto {
  @ApiProperty({ description: 'Growing location' })
  @IsString()
  @IsNotEmpty()
  growingLocation: string;

  @ApiProperty({ description: 'Stocking density (per m²)' })
  @IsNumber()
  stockingDensity: number;

  @ApiProperty({ description: 'Growth period (days)' })
  @IsNumber()
  growthPeriod: number;

  @ApiProperty({ description: 'Feed conversion ratio' })
  @IsNumber()
  feedConversionRatio: number;

  @ApiProperty({ description: 'Water quality parameters' })
  @IsObject()
  waterQuality: {
    temperature: number;
    oxygen: number;
    pH: number;
    ammonia: number;
  };

  @ApiProperty({ description: 'Disease treatments', type: [String] })
  @IsArray()
  @IsString({ each: true })
  diseaseTreatments: string[];
}

export class FishingDataDto {
  @ApiProperty({ description: 'Fishing method' })
  @IsString()
  @IsNotEmpty()
  fishingMethod: string;

  @ApiProperty({ description: 'Fishing area coordinates' })
  @IsObject()
  coordinates: {
    latitude: number;
    longitude: number;
  };

  @ApiProperty({ description: 'Water depth (meters)' })
  @IsNumber()
  waterDepth: number;

  @ApiProperty({ description: 'Fishing vessel details' })
  @IsObject()
  vesselDetails: {
    name: string;
    registration: string;
    captain: string;
  };

  @ApiProperty({ description: 'Catch composition', type: [Object] })
  @IsArray()
  catchComposition: {
    species: string;
    quantity: number;
    averageSize: number;
  }[];

  @ApiProperty({ description: 'Sea conditions' })
  @IsString()
  seaConditions: string;
}

export class HarvestDataDto {
  @ApiProperty({ description: 'Harvest method' })
  @IsString()
  @IsNotEmpty()
  harvestMethod: string;

  @ApiProperty({ description: 'Harvest location' })
  @IsString()
  @IsNotEmpty()
  harvestLocation: string;

  @ApiProperty({ description: 'Total weight harvested (kg)' })
  @IsNumber()
  totalWeight: number;

  @ApiProperty({ description: 'Number of pieces' })
  @IsNumber()
  pieceCount: number;

  @ApiProperty({ description: 'Average size (cm)' })
  @IsNumber()
  averageSize: number;

  @ApiProperty({ description: 'Quality grade' })
  @IsString()
  @IsNotEmpty()
  qualityGrade: string;

  @ApiProperty({ description: 'Post-harvest handling' })
  @IsString()
  postHarvestHandling: string;
}

export class ProcessingDataDto {
  @ApiProperty({ description: 'Processing facility name' })
  @IsString()
  @IsNotEmpty()
  facilityName: string;

  @ApiProperty({ description: 'Processing method' })
  @IsString()
  @IsNotEmpty()
  processingMethod: string;

  @ApiProperty({ description: 'Processing date' })
  @IsDateString()
  processingDate: string;

  @ApiProperty({ description: 'Input weight (kg)' })
  @IsNumber()
  inputWeight: number;

  @ApiProperty({ description: 'Output weight (kg)' })
  @IsNumber()
  outputWeight: number;

  @ApiProperty({ description: 'Processing yield (%)' })
  @IsNumber()
  processingYield: number;

  @ApiProperty({ description: 'Quality tests performed', type: [Object] })
  @IsArray()
  qualityTests: {
    testType: string;
    result: string;
    standard: string;
    passed: boolean;
  }[];

  @ApiProperty({ description: 'Packaging details' })
  @IsObject()
  packaging: {
    type: string;
    size: string;
    material: string;
    labelInfo: string;
  };
}

export class StorageDataDto {
  @ApiProperty({ description: 'Storage facility' })
  @IsString()
  @IsNotEmpty()
  storageFacility: string;

  @ApiProperty({ description: 'Storage temperature (°C)' })
  @IsNumber()
  storageTemperature: number;

  @ApiProperty({ description: 'Storage method' })
  @IsString()
  @IsNotEmpty()
  storageMethod: string;

  @ApiProperty({ description: 'Storage duration (days)' })
  @IsNumber()
  storageDuration: number;

  @ApiProperty({ description: 'Humidity level (%)' })
  @IsNumber()
  humidityLevel: number;

  @ApiProperty({ description: 'Quality checks during storage', type: [Object] })
  @IsArray()
  qualityChecks: {
    checkDate: string;
    temperature: number;
    quality: string;
    notes: string;
  }[];
}

export class TransportDataDto {
  @ApiProperty({ description: 'Transport method' })
  @IsString()
  @IsNotEmpty()
  transportMethod: string;

  @ApiProperty({ description: 'Vehicle details' })
  @IsObject()
  vehicleDetails: {
    type: string;
    registration: string;
    driver: string;
  };

  @ApiProperty({ description: 'Origin location' })
  @IsString()
  @IsNotEmpty()
  originLocation: string;

  @ApiProperty({ description: 'Destination location' })
  @IsString()
  @IsNotEmpty()
  destinationLocation: string;

  @ApiProperty({ description: 'Transport temperature (°C)' })
  @IsNumber()
  transportTemperature: number;

  @ApiProperty({ description: 'Transport duration (hours)' })
  @IsNumber()
  transportDuration: number;

  @ApiProperty({ description: 'Cold chain monitoring', type: [Object] })
  @IsArray()
  coldChainMonitoring: {
    timestamp: string;
    temperature: number;
    location: string;
  }[];
}

// Main DTOs
export class CreateSupplyChainRecordDto {
  @ApiProperty({ description: 'Unique product identifier' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  productId: string;

  @ApiProperty({ description: 'Source type', enum: SourceType })
  @IsEnum(SourceType)
  sourceType: SourceType;

  @ApiProperty({ description: 'Species name' })
  @IsString()
  @IsNotEmpty()
  speciesName: string;

  @ApiProperty({ description: 'Product name' })
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiPropertyOptional({ description: 'Product description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  productDescription?: string;

  @ApiPropertyOptional({ description: 'Batch identifier' })
  @IsOptional()
  @IsString()
  batchId?: string;

  @ApiPropertyOptional({ description: 'Hatchery data (for farmed products)', type: HatcheryDataDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => HatcheryDataDto)
  @Transform(({ value }) => typeof value === 'string' ? JSON.parse(value) : value)
  hatcheryData?: HatcheryDataDto;

  @ApiPropertyOptional({ description: 'Grow-out data (for farmed products)', type: GrowOutDataDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => GrowOutDataDto)
  @Transform(({ value }) => typeof value === 'string' ? JSON.parse(value) : value)
  growOutData?: GrowOutDataDto;

  @ApiPropertyOptional({ description: 'Fishing data (for wild capture)', type: FishingDataDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => FishingDataDto)
  @Transform(({ value }) => typeof value === 'string' ? JSON.parse(value) : value)
  fishingData?: FishingDataDto;

  @ApiPropertyOptional({ description: 'Harvest data', type: HarvestDataDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => HarvestDataDto)
  @Transform(({ value }) => typeof value === 'string' ? JSON.parse(value) : value)
  harvestData?: HarvestDataDto;

  @ApiPropertyOptional({ description: 'Processing data', type: ProcessingDataDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProcessingDataDto)
  @Transform(({ value }) => typeof value === 'string' ? JSON.parse(value) : value)
  processingData?: ProcessingDataDto;

  @ApiPropertyOptional({ description: 'Storage data', type: StorageDataDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => StorageDataDto)
  @Transform(({ value }) => typeof value === 'string' ? JSON.parse(value) : value)
  storageData?: StorageDataDto;

  @ApiPropertyOptional({ description: 'Transport data', type: TransportDataDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TransportDataDto)
  @Transform(({ value }) => typeof value === 'string' ? JSON.parse(value) : value)
  transportData?: TransportDataDto;

  @ApiPropertyOptional({ description: 'Location of current operation' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({ description: 'Is record publicly traceable', default: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = true;
}

export class UpdateSupplyChainStageDto {
  @ApiProperty({ description: 'New stage in supply chain', enum: SupplyChainStage })
  @IsEnum(SupplyChainStage)
  newStage: SupplyChainStage;

  @ApiProperty({ description: 'Stage-specific data' })
  @IsObject()
  stageData: any;

  @ApiPropertyOptional({ description: 'Location of stage operation' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Stage-specific notes' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({ description: 'Expected completion date' })
  @IsOptional()
  @IsDateString()
  expectedCompletionDate?: string;
}

export class GenerateQRCodeDto {
  @ApiProperty({ description: 'QR code type', enum: ['trace', 'verify', 'feedback'] })
  @IsEnum(['trace', 'verify', 'feedback'])
  qrType: 'trace' | 'verify' | 'feedback';

  @ApiPropertyOptional({ description: 'Custom display name for QR code' })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiPropertyOptional({ description: 'Expiry date for QR code' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}

export class ConsumerFeedbackDto {
  @ApiProperty({ description: 'Consumer rating (1-5)' })
  @IsNumber()
  @Type(() => Number)
  rating: number;

  @ApiPropertyOptional({ description: 'Consumer comment' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;

  @ApiPropertyOptional({ description: 'Purchase location' })
  @IsOptional()
  @IsString()
  purchaseLocation?: string;

  @ApiPropertyOptional({ description: 'Consumer location' })
  @IsOptional()
  @IsString()
  consumerLocation?: string;
}

// Response DTOs
export class SupplyChainStageHistoryDto {
  @ApiProperty({ description: 'Stage ID' })
  id: string;

  @ApiProperty({ description: 'Stage name' })
  stage: string;

  @ApiProperty({ description: 'User who performed the stage' })
  userId: string;

  @ApiProperty({ description: 'Stage timestamp' })
  timestamp: Date;

  @ApiProperty({ description: 'Stage-specific data' })
  data: any;

  @ApiProperty({ description: 'Location of stage operation' })
  location: string;

  @ApiProperty({ description: 'Stage notes' })
  notes: string;

  @ApiProperty({ description: 'File hashes associated with stage' })
  fileHashes: string[];

  @ApiPropertyOptional({ description: 'Blockchain transaction hash' })
  blockchainHash?: string;

  @ApiProperty({ description: 'User information' })
  user: {
    id: string;
    address: string;
    role: string;
    profile?: {
      firstName?: string;
      lastName?: string;
      organization?: string;
    };
  };
}

export class SupplyChainRecordResponseDto {
  @ApiProperty({ description: 'Record ID' })
  id: string;

  @ApiProperty({ description: 'Product ID' })
  productId: string;

  @ApiProperty({ description: 'User ID of creator' })
  userId: string;

  @ApiPropertyOptional({ description: 'Batch ID' })
  batchId?: string;

  @ApiProperty({ description: 'Source type' })
  sourceType: string;

  @ApiProperty({ description: 'Species name' })
  speciesName: string;

  @ApiProperty({ description: 'Product name' })
  productName: string;

  @ApiPropertyOptional({ description: 'Product description' })
  productDescription?: string;

  @ApiProperty({ description: 'Current stage' })
  currentStage: string;

  @ApiProperty({ description: 'Record status' })
  status: string;

  @ApiProperty({ description: 'Is publicly traceable' })
  isPublic: boolean;

  @ApiPropertyOptional({ description: 'Hatchery data' })
  hatcheryData?: HatcheryDataDto;

  @ApiPropertyOptional({ description: 'Grow-out data' })
  growOutData?: GrowOutDataDto;

  @ApiPropertyOptional({ description: 'Fishing data' })
  fishingData?: FishingDataDto;

  @ApiPropertyOptional({ description: 'Harvest data' })
  harvestData?: HarvestDataDto;

  @ApiPropertyOptional({ description: 'Processing data' })
  processingData?: ProcessingDataDto;

  @ApiPropertyOptional({ description: 'Storage data' })
  storageData?: StorageDataDto;

  @ApiPropertyOptional({ description: 'Transport data' })
  transportData?: TransportDataDto;

  @ApiProperty({ description: 'File hashes' })
  fileHashes: string[];

  @ApiPropertyOptional({ description: 'Data hash for blockchain' })
  dataHash?: string;

  @ApiPropertyOptional({ description: 'Blockchain transaction hash' })
  blockchainHash?: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  @ApiProperty({ description: 'Creator information' })
  user: {
    id: string;
    address: string;
    role: string;
    profile?: {
      firstName?: string;
      lastName?: string;
      organization?: string;
    };
  };

  @ApiProperty({ description: 'Stage history', type: [SupplyChainStageHistoryDto] })
  stageHistory: SupplyChainStageHistoryDto[];

  @ApiPropertyOptional({ description: 'Consumer feedback count' })
  feedbackCount?: number;

  @ApiPropertyOptional({ description: 'Average consumer rating' })
  averageRating?: number;
}

export class QRCodeResponseDto {
  @ApiProperty({ description: 'QR code data/URL' })
  qrCodeData: string;

  @ApiProperty({ description: 'QR code image (base64)' })
  qrCodeImage: string;

  @ApiProperty({ description: 'Tracing URL' })
  tracingUrl: string;

  @ApiProperty({ description: 'QR code ID for tracking' })
  qrCodeId: string;

  @ApiProperty({ description: 'Expiry date' })
  expiryDate?: Date;
}

export class GetSupplyChainRecordsDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Filter by status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by current stage' })
  @IsOptional()
  @IsString()
  stage?: string;

  @ApiPropertyOptional({ description: 'Filter by source type' })
  @IsOptional()
  @IsEnum(SourceType)
  sourceType?: SourceType;

  @ApiPropertyOptional({ description: 'Filter by species' })
  @IsOptional()
  @IsString()
  species?: string;

  @ApiPropertyOptional({ description: 'Search term' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by creator ID' })
  @IsOptional()
  @IsString()
  creatorId?: string;
}

export class PaginatedSupplyChainResponseDto {
  @ApiProperty({ description: 'Supply chain records', type: [SupplyChainRecordResponseDto] })
  data: SupplyChainRecordResponseDto[];

  @ApiProperty({ description: 'Total number of records' })
  total: number;

  @ApiProperty({ description: 'Current page' })
  page: number;

  @ApiProperty({ description: 'Items per page' })
  limit: number;

  @ApiProperty({ description: 'Total pages' })
  totalPages: number;

  @ApiProperty({ description: 'Has next page' })
  hasNext: boolean;

  @ApiProperty({ description: 'Has previous page' })
  hasPrev: boolean;
}