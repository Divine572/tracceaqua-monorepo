import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsObject, 
  IsArray, 
  IsNumber, 
  IsEnum,
  ValidateNested,
  IsNotEmpty,
  MinLength,
  MaxLength
} from 'class-validator';
import { Type, Transform } from 'class-transformer';


// Location Data DTO
export class LocationDataDto {
  @ApiProperty({ description: 'GPS latitude' })
  @IsNumber()
  latitude: number;

  @ApiProperty({ description: 'GPS longitude' })
  @IsNumber()
  longitude: number;

  @ApiProperty({ description: 'Water body name' })
  @IsString()
  @IsNotEmpty()
  waterBody: string;

  @ApiProperty({ description: 'Specific location description' })
  @IsString()
  @IsNotEmpty()
  locationDescription: string;

  @ApiProperty({ description: 'Water depth in meters' })
  @IsNumber()
  waterDepth: number;

  @ApiProperty({ description: 'Water temperature in Celsius' })
  @IsNumber()
  waterTemperature: number;

  @ApiProperty({ description: 'Salinity level' })
  @IsNumber()
  salinity: number;

  @ApiProperty({ description: 'pH level' })
  @IsNumber()
  phLevel: number;

  @ApiProperty({ description: 'Dissolved oxygen level' })
  @IsNumber()
  dissolvedOxygen: number;
}

// Species Data DTO
export class SpeciesDataDto {
  @ApiProperty({ description: 'Scientific name of species' })
  @IsString()
  @IsNotEmpty()
  scientificName: string;

  @ApiProperty({ description: 'Common name of species' })
  @IsString()
  @IsNotEmpty()
  commonName: string;

  @ApiProperty({ description: 'Family classification' })
  @IsString()
  @IsNotEmpty()
  family: string;

  @ApiProperty({ description: 'Total count observed' })
  @IsNumber()
  totalCount: number;

  @ApiProperty({ description: 'Sample size collected' })
  @IsNumber()
  sampleSize: number;

  @ApiProperty({ description: 'Average length in cm' })
  @IsNumber()
  averageLength: number;

  @ApiProperty({ description: 'Average weight in grams' })
  @IsNumber()
  averageWeight: number;

  @ApiProperty({ description: 'Maturity stage', enum: ['juvenile', 'adult', 'spawning'] })
  @IsEnum(['juvenile', 'adult', 'spawning'])
  maturityStage: string;

  @ApiProperty({ description: 'Health status', enum: ['healthy', 'stressed', 'diseased'] })
  @IsEnum(['healthy', 'stressed', 'diseased'])
  healthStatus: string;
}

// Sampling Data DTO
export class SamplingDataDto {
  @ApiProperty({ description: 'Sampling method used' })
  @IsString()
  @IsNotEmpty()
  samplingMethod: string;

  @ApiProperty({ description: 'Gear specifications' })
  @IsString()
  @IsNotEmpty()
  gearSpecs: string;

  @ApiProperty({ description: 'Sampling duration in minutes' })
  @IsNumber()
  samplingDuration: number;

  @ApiProperty({ description: 'Effort expended (hours)' })
  @IsNumber()
  effortHours: number;

  @ApiProperty({ description: 'Weather conditions during sampling' })
  @IsString()
  @IsNotEmpty()
  weatherConditions: string;

  @ApiProperty({ description: 'Sea state conditions' })
  @IsString()
  @IsNotEmpty()
  seaState: string;

  @ApiProperty({ description: 'Tidal conditions' })
  @IsString()
  @IsNotEmpty()
  tidalConditions: string;
}

// Lab Test DTO
export class LabTestDto {
  @ApiProperty({ description: 'Test type' })
  @IsString()
  @IsNotEmpty()
  testType: string;

  @ApiProperty({ description: 'Test results' })
  @IsString()
  @IsNotEmpty()
  results: string;

  @ApiProperty({ description: 'Test units' })
  @IsString()
  @IsNotEmpty()
  units: string;

  @ApiProperty({ description: 'Test date' })
  @IsString()
  testDate: string;

  @ApiProperty({ description: 'Laboratory name' })
  @IsString()
  @IsNotEmpty()
  laboratoryName: string;

  @ApiProperty({ description: 'Reference values', required: false })
  @IsOptional()
  @IsString()
  referenceValues?: string;
}

// Create Conservation Record DTO
export class CreateConservationRecordDto {
  @ApiProperty({ description: 'Unique sampling identifier' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  samplingId: string;

  @ApiProperty({ description: 'Location data', type: LocationDataDto })
  @ValidateNested()
  @Type(() => LocationDataDto)
  @Transform(({ value }) => typeof value === 'string' ? JSON.parse(value) : value)
  locationData: LocationDataDto;

  @ApiProperty({ description: 'Species data', type: SpeciesDataDto })
  @ValidateNested()
  @Type(() => SpeciesDataDto)
  @Transform(({ value }) => typeof value === 'string' ? JSON.parse(value) : value)
  speciesData: SpeciesDataDto;

  @ApiProperty({ description: 'Sampling data', type: SamplingDataDto })
  @ValidateNested()
  @Type(() => SamplingDataDto)
  @Transform(({ value }) => typeof value === 'string' ? JSON.parse(value) : value)
  samplingData: SamplingDataDto;

  @ApiPropertyOptional({ description: 'Lab test results', type: [LabTestDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LabTestDto)
  @Transform(({ value }) => typeof value === 'string' ? JSON.parse(value) : value)
  labTests?: LabTestDto[];

  @ApiPropertyOptional({ description: 'Additional researcher notes' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  researcherNotes?: string;

  @ApiPropertyOptional({ description: 'Weather conditions' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  weatherConditions?: string;

  @ApiPropertyOptional({ description: 'Tidal conditions' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  tidalConditions?: string;
}

// Update Conservation Record DTO
export class UpdateConservationRecordDto {
  @ApiPropertyOptional({ description: 'Location data', type: LocationDataDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDataDto)
  locationData?: LocationDataDto;

  @ApiPropertyOptional({ description: 'Species data', type: SpeciesDataDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SpeciesDataDto)
  speciesData?: SpeciesDataDto;

  @ApiPropertyOptional({ description: 'Sampling data', type: SamplingDataDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SamplingDataDto)
  samplingData?: SamplingDataDto;

  @ApiPropertyOptional({ description: 'Lab test results', type: [LabTestDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LabTestDto)
  labTests?: LabTestDto[];

  @ApiPropertyOptional({ description: 'Additional researcher notes' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  researcherNotes?: string;

  @ApiPropertyOptional({ description: 'Weather conditions' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  weatherConditions?: string;

  @ApiPropertyOptional({ description: 'Tidal conditions' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  tidalConditions?: string;
}

// Admin Verification DTO
export class VerifyConservationRecordDto {
  @ApiProperty({ description: 'Verification action', enum: ['approve', 'reject'] })
  @IsEnum(['approve', 'reject'])
  action: 'approve' | 'reject';

  @ApiPropertyOptional({ description: 'Verification notes' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  verificationNotes?: string;
}

// Response DTOs
export class ConservationRecordResponseDto {
  @ApiProperty({ description: 'Record ID' })
  id: string;

  @ApiProperty({ description: 'Sampling ID' })
  samplingId: string;

  @ApiProperty({ description: 'User ID of researcher' })
  userId: string;

  @ApiProperty({ description: 'Location data' })
  locationData: LocationDataDto;

  @ApiProperty({ description: 'Species data' })
  speciesData: SpeciesDataDto;

  @ApiProperty({ description: 'Sampling data' })
  samplingData: SamplingDataDto;

  @ApiPropertyOptional({ description: 'Lab test results' })
  labTests?: LabTestDto[];

  @ApiProperty({ description: 'File hashes (IPFS)' })
  fileHashes: string[];

  @ApiPropertyOptional({ description: 'Researcher notes' })
  researcherNotes?: string;

  @ApiPropertyOptional({ description: 'Weather conditions' })
  weatherConditions?: string;

  @ApiPropertyOptional({ description: 'Tidal conditions' })
  tidalConditions?: string;

  @ApiProperty({ description: 'Record status' })
  status: string;

  @ApiPropertyOptional({ description: 'Data hash for blockchain' })
  dataHash?: string;

  @ApiPropertyOptional({ description: 'Blockchain transaction hash' })
  blockchainHash?: string;

  @ApiPropertyOptional({ description: 'Verification date' })
  verifiedAt?: Date;

  @ApiPropertyOptional({ description: 'Verified by admin ID' })
  verifiedBy?: string;

  @ApiPropertyOptional({ description: 'Verification notes' })
  verificationNotes?: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  @ApiProperty({ description: 'Researcher information' })
  user: {
    id: string;
    address: string;
    profile?: {
      firstName?: string;
      lastName?: string;
      organization?: string;
    };
  };
}

// Pagination DTO
export class GetConservationRecordsDto {
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

  @ApiPropertyOptional({ description: 'Filter by species' })
  @IsOptional()
  @IsString()
  species?: string;

  @ApiPropertyOptional({ description: 'Filter by researcher ID' })
  @IsOptional()
  @IsString()
  researcherId?: string;

  @ApiPropertyOptional({ description: 'Search term' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class PaginatedConservationResponseDto {
  @ApiProperty({ description: 'Conservation records', type: [ConservationRecordResponseDto] })
  data: ConservationRecordResponseDto[];

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

