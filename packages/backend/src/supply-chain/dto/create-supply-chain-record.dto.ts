import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, IsNumber, IsBoolean, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SourceType {
  FARMED = 'FARMED',
  WILD_CAPTURE = 'WILD_CAPTURE'
}

export enum SupplyChainStage {
  // Farmed stages
  HATCHERY = 'HATCHERY',
  GROW_OUT = 'GROW_OUT',
  HARVEST = 'HARVEST',
  
  // Wild capture stages
  FISHING = 'FISHING',
  
  // Common stages
  PROCESSING = 'PROCESSING',
  DISTRIBUTION = 'DISTRIBUTION',
  RETAIL = 'RETAIL'
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  RECALLED = 'RECALLED',
  EXPIRED = 'EXPIRED'
}

// ===== STAGE-SPECIFIC DATA CLASSES =====

export class HatcheryDataDto {
  @ApiProperty({ description: 'Hatchery facility name' })
  @IsString()
  @IsNotEmpty()
  facilityName: string;

  @ApiProperty({ description: 'License number' })
  @IsString()
  @IsNotEmpty()
  licenseNumber: string;

  @ApiProperty({ description: 'Species being hatched' })
  @IsString()
  @IsNotEmpty()
  species: string;

  @ApiProperty({ description: 'Batch size (number of larvae/juveniles)' })
  @IsNumber()
  batchSize: number;

  @ApiProperty({ description: 'Hatchery start date' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ description: 'Feed type used' })
  @IsOptional()
  @IsString()
  feedType?: string;

  @ApiPropertyOptional({ description: 'Water quality parameters' })
  @IsOptional()
  waterQuality?: {
    temperature: number;
    salinity: number;
    pH: number;
    dissolvedOxygen: number;
  };

  @ApiPropertyOptional({ description: 'Survival rate percentage' })
  @IsOptional()
  @IsNumber()
  survivalRate?: number;
}

export class GrowOutDataDto {
  @ApiProperty({ description: 'Grow-out facility name' })
  @IsString()
  @IsNotEmpty()
  facilityName: string;

  @ApiProperty({ description: 'Pond/cage identifier' })
  @IsString()
  @IsNotEmpty()
  pondId: string;

  @ApiProperty({ description: 'Stocking date' })
  @IsDateString()
  stockingDate: string;

  @ApiProperty({ description: 'Initial stocking density (per m²)' })
  @IsNumber()
  stockingDensity: number;

  @ApiProperty({ description: 'Feed conversion ratio' })
  @IsNumber()
  feedConversionRatio: number;

  @ApiPropertyOptional({ description: 'Growth period in days' })
  @IsOptional()
  @IsNumber()
  growthPeriod?: number;

  @ApiPropertyOptional({ description: 'Feeding schedule' })
  @IsOptional()
  @IsString()
  feedingSchedule?: string;

  @ApiPropertyOptional({ description: 'Health management records' })
  @IsOptional()
  healthRecords?: string[];
}

export class HarvestDataDto {
  @ApiProperty({ description: 'Harvest date' })
  @IsDateString()
  harvestDate: string;

  @ApiProperty({ description: 'Harvest method' })
  @IsString()
  @IsNotEmpty()
  harvestMethod: string;

  @ApiProperty({ description: 'Total harvest weight (kg)' })
  @IsNumber()
  totalWeight: number;

  @ApiProperty({ description: 'Average weight per unit (g)' })
  @IsNumber()
  averageWeight: number;

  @ApiProperty({ description: 'Number of units harvested' })
  @IsNumber()
  unitCount: number;

  @ApiPropertyOptional({ description: 'Harvest location' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Quality grade' })
  @IsOptional()
  @IsString()
  qualityGrade?: string;

  @ApiPropertyOptional({ description: 'Storage conditions post-harvest' })
  @IsOptional()
  @IsString()
  storageConditions?: string;
}

export class FishingDataDto {
  @ApiProperty({ description: 'Fishing vessel name' })
  @IsString()
  @IsNotEmpty()
  vesselName: string;

  @ApiProperty({ description: 'Vessel registration number' })
  @IsString()
  @IsNotEmpty()
  vesselRegistration: string;

  @ApiProperty({ description: 'Captain/skipper name' })
  @IsString()
  @IsNotEmpty()
  captainName: string;

  @ApiProperty({ description: 'Fishing date' })
  @IsDateString()
  fishingDate: string;

  @ApiProperty({ description: 'Fishing location (GPS coordinates)' })
  location: {
    latitude: number;
    longitude: number;
    area: string;
  };

  @ApiProperty({ description: 'Fishing method used' })
  @IsString()
  @IsNotEmpty()
  fishingMethod: string;

  @ApiProperty({ description: 'Total catch weight (kg)' })
  @IsNumber()
  totalCatch: number;

  @ApiPropertyOptional({ description: 'Gear specifications' })
  @IsOptional()
  @IsString()
  gearSpecs?: string;

  @ApiPropertyOptional({ description: 'Fishing duration in hours' })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiPropertyOptional({ description: 'Bycatch information' })
  @IsOptional()
  @IsString()
  bycatchNotes?: string;
}





export class ProcessingDataDto {
  @ApiProperty({ description: 'Processing facility name' })
  @IsString()
  @IsNotEmpty()
  facilityName: string;

  @ApiProperty({ description: 'Processing license number' })
  @IsString()
  @IsNotEmpty()
  licenseNumber: string;

  @ApiProperty({ description: 'Processing date' })
  @IsDateString()
  processingDate: string;

  @ApiProperty({ description: 'Processing methods used' })
  @IsArray()
  @IsString({ each: true })
  processingMethods: string[];

  @ApiProperty({ description: 'Input weight (kg)' })
  @IsNumber()
  inputWeight: number;

  @ApiProperty({ description: 'Output weight (kg)' })
  @IsNumber()
  outputWeight: number;

  @ApiProperty({ description: 'Processing yield percentage' })
  @IsNumber()
  yieldPercentage: number;

  @ApiPropertyOptional({ description: 'Packaging type' })
  @IsOptional()
  @IsString()
  packagingType?: string;

  @ApiPropertyOptional({ description: 'Preservation method' })
  @IsOptional()
  @IsString()
  preservationMethod?: string;

  @ApiPropertyOptional({ description: 'Quality control tests performed' })
  @IsOptional()
  @IsArray()
  qualityTests?: string[];

  @ApiPropertyOptional({ description: 'Expiry date' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}





export class DistributionDataDto {
  @ApiProperty({ description: 'Distribution company name' })
  @IsString()
  @IsNotEmpty()
  distributorName: string;

  @ApiProperty({ description: 'Transport vehicle ID' })
  @IsString()
  @IsNotEmpty()
  vehicleId: string;

  @ApiProperty({ description: 'Driver name' })
  @IsString()
  @IsNotEmpty()
  driverName: string;

  @ApiProperty({ description: 'Departure date and time' })
  @IsDateString()
  departureDateTime: string;

  @ApiProperty({ description: 'Arrival date and time' })
  @IsDateString()
  arrivalDateTime: string;

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

  @ApiPropertyOptional({ description: 'Route taken' })
  @IsOptional()
  @IsString()
  route?: string;

  @ApiPropertyOptional({ description: 'Cold chain monitoring data' })
  @IsOptional()
  coldChainData?: {
    minTemp: number;
    maxTemp: number;
    avgTemp: number;
    temperatureBreaches: number;
  };

  @ApiPropertyOptional({ description: 'Delivery confirmation' })
  @IsOptional()
  @IsString()
  deliveryConfirmation?: string;
}


export class RetailDataDto {
  @ApiProperty({ description: 'Retail store name' })
  @IsString()
  @IsNotEmpty()
  storeName: string;

  @ApiProperty({ description: 'Store location/address' })
  @IsString()
  @IsNotEmpty()
  storeLocation: string;

  @ApiProperty({ description: 'Received date' })
  @IsDateString()
  receivedDate: string;

  @ApiProperty({ description: 'Display method' })
  @IsString()
  @IsNotEmpty()
  displayMethod: string;

  @ApiProperty({ description: 'Storage temperature (°C)' })
  @IsNumber()
  storageTemperature: number;

  @ApiProperty({ description: 'Retail price per kg' })
  @IsNumber()
  pricePerKg: number;

  @ApiPropertyOptional({ description: 'Best before date' })
  @IsOptional()
  @IsDateString()
  bestBeforeDate?: string;

  @ApiPropertyOptional({ description: 'Promotional offers' })
  @IsOptional()
  @IsString()
  promotions?: string;

  @ApiPropertyOptional({ description: 'Customer feedback' })
  @IsOptional()
  @IsString()
  customerFeedback?: string;
}




// ===== MAIN DTO CLASSES =====

export class CreateSupplyChainRecordDto {
  @ApiProperty({ description: 'Unique product identifier' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: 'Product name' })
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty({ description: 'Species name' })
  @IsString()
  @IsNotEmpty()
  speciesName: string;

  @ApiProperty({ description: 'Source type', enum: SourceType })
  @IsEnum(SourceType)
  sourceType: SourceType;

  @ApiProperty({ description: 'Initial stage', enum: SupplyChainStage })
  @IsEnum(SupplyChainStage)
  initialStage: SupplyChainStage;

  @ApiPropertyOptional({ description: 'Product description' })
  @IsOptional()
  @IsString()
  productDescription?: string;

  @ApiPropertyOptional({ description: 'Batch identifier for grouping' })
  @IsOptional()
  @IsString()
  batchId?: string;

  @ApiPropertyOptional({ description: 'Initial quality grade' })
  @IsOptional()
  @IsString()
  qualityGrade?: string;

  @ApiPropertyOptional({ description: 'Certifications' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];

  @ApiPropertyOptional({ description: 'File hashes for supporting documents' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fileHashes?: string[];

  @ApiPropertyOptional({ description: 'Whether product is publicly traceable' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  // Stage-specific data (only provide data for the initial stage)
  @ApiPropertyOptional({ description: 'Hatchery data (for FARMED products starting at HATCHERY)' })
  @IsOptional()
  @ValidateNested()
  @Type(() => HatcheryDataDto)
  hatcheryData?: HatcheryDataDto;

  @ApiPropertyOptional({ description: 'Grow-out data (for FARMED products starting at GROW_OUT)' })
  @IsOptional()
  @ValidateNested()
  @Type(() => GrowOutDataDto)
  growOutData?: GrowOutDataDto;

  @ApiPropertyOptional({ description: 'Harvest data (for products starting at HARVEST)' })
  @IsOptional()
  @ValidateNested()
  @Type(() => HarvestDataDto)
  harvestData?: HarvestDataDto;

  @ApiPropertyOptional({ description: 'Fishing data (for WILD_CAPTURE products)' })
  @IsOptional()
  @ValidateNested()
  @Type(() => FishingDataDto)
  fishingData?: FishingDataDto;

  @ApiPropertyOptional({ description: 'Processing data (for products starting at PROCESSING)' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProcessingDataDto)
  processingData?: ProcessingDataDto;

  @ApiPropertyOptional({ description: 'Distribution data (for products starting at DISTRIBUTION)' })
  @IsOptional()
  @ValidateNested()
  @Type(() => DistributionDataDto)
  distributionData?: DistributionDataDto;

  @ApiPropertyOptional({ description: 'Retail data (for products starting at RETAIL)' })
  @IsOptional()
  @ValidateNested()
  @Type(() => RetailDataDto)
  retailData?: RetailDataDto;
}

export class UpdateSupplyChainStageDto {
  @ApiProperty({ description: 'New stage', enum: SupplyChainStage })
  @IsEnum(SupplyChainStage)
  stage: SupplyChainStage;

  @ApiPropertyOptional({ description: 'Stage update notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Quality grade at this stage' })
  @IsOptional()
  @IsString()
  qualityGrade?: string;

  @ApiPropertyOptional({ description: 'Additional certifications obtained' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  newCertifications?: string[];

  @ApiPropertyOptional({ description: 'File hashes for stage documentation' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fileHashes?: string[];

  // Stage-specific data
  @ApiPropertyOptional({ description: 'Hatchery data' })
  @IsOptional()
  @ValidateNested()
  @Type(() => HatcheryDataDto)
  hatcheryData?: HatcheryDataDto;

  @ApiPropertyOptional({ description: 'Grow-out data' })
  @IsOptional()
  @ValidateNested()
  @Type(() => GrowOutDataDto)
  growOutData?: GrowOutDataDto;

  @ApiPropertyOptional({ description: 'Harvest data' })
  @IsOptional()
  @ValidateNested()
  @Type(() => HarvestDataDto)
  harvestData?: HarvestDataDto;

  @ApiPropertyOptional({ description: 'Fishing data' })
  @IsOptional()
  @ValidateNested()
  @Type(() => FishingDataDto)
  fishingData?: FishingDataDto;

  @ApiPropertyOptional({ description: 'Processing data' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProcessingDataDto)
  processingData?: ProcessingDataDto;

  @ApiPropertyOptional({ description: 'Distribution data' })
  @IsOptional()
  @ValidateNested()
  @Type(() => DistributionDataDto)
  distributionData?: DistributionDataDto;

  @ApiPropertyOptional({ description: 'Retail data' })
  @IsOptional()
  @ValidateNested()
  @Type(() => RetailDataDto)
  retailData?: RetailDataDto;
}

// ===== RESPONSE DTO CLASSES =====

export class SupplyChainRecordResponseDto {
  @ApiProperty({ description: 'Record ID' })
  id: string;

  @ApiProperty({ description: 'Product ID' })
  productId: string;

  @ApiProperty({ description: 'Product name' })
  productName: string;

  @ApiProperty({ description: 'Species name' })
  speciesName: string;

  @ApiProperty({ description: 'User ID of creator' })
  userId: string;

  @ApiProperty({ description: 'Batch ID' })
  batchId?: string;

  @ApiProperty({ description: 'Source type', enum: SourceType })
  sourceType: SourceType;

  @ApiProperty({ description: 'Product description' })
  productDescription?: string;

  @ApiProperty({ description: 'Current stage', enum: SupplyChainStage })
  currentStage: SupplyChainStage;

  @ApiProperty({ description: 'QR code data' })
  qrCodeData?: string;

  @ApiProperty({ description: 'File hashes' })
  fileHashes: string[];

  @ApiProperty({ description: 'Data hash for blockchain' })
  dataHash?: string;

  @ApiProperty({ description: 'Blockchain transaction hash' })
  blockchainHash?: string;

  @ApiProperty({ description: 'Record status', enum: ProductStatus })
  status: ProductStatus;

  @ApiProperty({ description: 'Is publicly traceable' })
  isPublic: boolean;

  @ApiProperty({ description: 'Quality grade' })
  qualityGrade?: string;

  @ApiProperty({ description: 'Certifications' })
  certifications: string[];

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  // Stage-specific data
  @ApiPropertyOptional({ description: 'Hatchery data' })
  hatcheryData?: HatcheryDataDto;

  @ApiPropertyOptional({ description: 'Grow-out data' })
  growOutData?: GrowOutDataDto;

  @ApiPropertyOptional({ description: 'Harvest data' })
  harvestData?: HarvestDataDto;

  @ApiPropertyOptional({ description: 'Fishing data' })
  fishingData?: FishingDataDto;

  @ApiPropertyOptional({ description: 'Processing data' })
  processingData?: ProcessingDataDto;

  @ApiPropertyOptional({ description: 'Distribution data' })
  distributionData?: DistributionDataDto;

  @ApiPropertyOptional({ description: 'Retail data' })
  retailData?: RetailDataDto;

  // Creator information
  @ApiProperty({ description: 'Creator profile' })
  creator: {
    id: string;
    firstName?: string;
    lastName?: string;
    organization?: string;
    role: string;
  };
}



export class ProductTraceabilityDto {
  @ApiProperty({ description: 'Product information' })
  product: SupplyChainRecordResponseDto;

  @ApiProperty({ description: 'Stage history' })
  stageHistory: Array<{
    stage: SupplyChainStage;
    updatedBy: string;
    updatedAt: Date;
    notes: string | null;
    stakeholder: {
      id: string;
      name?: string;
      organization: string | null;
      role: string;
    };
  }>;

  @ApiProperty({ description: 'Current status summary' })
  summary: {
    totalStages: number;
    currentStageIndex: number;
    daysInSupplyChain: number;
    lastUpdated: Date;
    totalStakeholders: number; 
  };
}