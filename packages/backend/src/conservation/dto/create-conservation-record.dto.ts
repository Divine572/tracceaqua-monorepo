import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, IsNumber, IsDateString, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SamplingMethod {
  TRAWLING = 'TRAWLING',
  GILLNET = 'GILLNET',
  HANDLINE = 'HANDLINE',
  TRAP = 'TRAP',
  DIVING = 'DIVING',
  SEINE = 'SEINE',
  OTHER = 'OTHER'
}

export enum WaterBody {
  LAGOS_LAGOON = 'LAGOS_LAGOON',
  LEKKI_LAGOON = 'LEKKI_LAGOON',
  ATLANTIC_OCEAN = 'ATLANTIC_OCEAN',
  NIGER_DELTA = 'NIGER_DELTA',
  CROSS_RIVER = 'CROSS_RIVER',
  OTHER = 'OTHER'
}

export class LocationDataDto {
  @ApiProperty({ description: 'GPS Latitude coordinate' })
  @IsNumber({}, { message: 'Latitude must be a valid number' })
  latitude: number;

  @ApiProperty({ description: 'GPS Longitude coordinate' })
  @IsNumber({}, { message: 'Longitude must be a valid number' })
  longitude: number;

  @ApiProperty({ description: 'Water body/marine zone', enum: WaterBody })
  @IsEnum(WaterBody, { message: 'Invalid water body selected' })
  waterBody: WaterBody;

  @ApiPropertyOptional({ description: 'Additional location description' })
  @IsOptional()
  @IsString()
  locationDescription?: string;

  @ApiProperty({ description: 'Water depth in meters' })
  @IsNumber({}, { message: 'Depth must be a valid number' })
  depth: number;

  @ApiProperty({ description: 'Water temperature in Celsius' })
  @IsNumber({}, { message: 'Temperature must be a valid number' })
  temperature: number;

  @ApiPropertyOptional({ description: 'Salinity level (ppt)' })
  @IsOptional()
  @IsNumber({}, { message: 'Salinity must be a valid number' })
  salinity?: number;

  @ApiPropertyOptional({ description: 'pH level' })
  @IsOptional()
  @IsNumber({}, { message: 'pH must be a valid number' })
  ph?: number;
}

export class SpeciesDataDto {
  @ApiProperty({ description: 'Species common name' })
  @IsString({ message: 'Species name is required' })
  @IsNotEmpty({ message: 'Species name cannot be empty' })
  speciesName: string;

  @ApiPropertyOptional({ description: 'Scientific name if known' })
  @IsOptional()
  @IsString()
  scientificName?: string;

  @ApiProperty({ description: 'Total number of specimens collected' })
  @IsNumber({}, { message: 'Specimen count must be a valid number' })
  @Transform(({ value }) => parseInt(value))
  specimenCount: number;

  @ApiProperty({ description: 'Total weight in grams' })
  @IsNumber({}, { message: 'Total weight must be a valid number' })
  totalWeight: number;

  @ApiPropertyOptional({ description: 'Average length in centimeters' })
  @IsOptional()
  @IsNumber({}, { message: 'Average length must be a valid number' })
  averageLength?: number;

  @ApiPropertyOptional({ description: 'Maturity stage observations' })
  @IsOptional()
  @IsString()
  maturityStage?: string;

  @ApiPropertyOptional({ description: 'Additional species notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class SamplingDataDto {
  @ApiProperty({ description: 'Sampling method used', enum: SamplingMethod })
  @IsEnum(SamplingMethod, { message: 'Invalid sampling method' })
  method: SamplingMethod;

  @ApiProperty({ description: 'Date and time of sampling' })
  @IsDateString({}, { message: 'Invalid sampling date format' })
  samplingDate: string;

  @ApiProperty({ description: 'Duration of sampling in minutes' })
  @IsNumber({}, { message: 'Duration must be a valid number' })
  duration: number;

  @ApiPropertyOptional({ description: 'Gear specifications used' })
  @IsOptional()
  @IsString()
  gearSpecifications?: string;

  @ApiPropertyOptional({ description: 'Mesh size if applicable (mm)' })
  @IsOptional()
  @IsNumber({}, { message: 'Mesh size must be a valid number' })
  meshSize?: number;

  @ApiPropertyOptional({ description: 'Effort description' })
  @IsOptional()
  @IsString()
  effortDescription?: string;

  @ApiPropertyOptional({ description: 'Bycatch observations' })
  @IsOptional()
  @IsString()
  bycatchNotes?: string;
}

export class LabTestDto {
  @ApiProperty({ description: 'Type of test conducted' })
  @IsString({ message: 'Test type is required' })
  @IsNotEmpty({ message: 'Test type cannot be empty' })
  testType: string;

  @ApiProperty({ description: 'Test result value' })
  @IsString({ message: 'Test result is required' })
  @IsNotEmpty({ message: 'Test result cannot be empty' })
  result: string;

  @ApiProperty({ description: 'Unit of measurement' })
  @IsString({ message: 'Unit is required' })
  @IsNotEmpty({ message: 'Unit cannot be empty' })
  unit: string;

  @ApiPropertyOptional({ description: 'Reference range or standard' })
  @IsOptional()
  @IsString()
  referenceRange?: string;

  @ApiPropertyOptional({ description: 'Test method used' })
  @IsOptional()
  @IsString()
  method?: string;

  @ApiProperty({ description: 'Date test was conducted' })
  @IsDateString({}, { message: 'Invalid test date format' })
  testDate: string;

  @ApiPropertyOptional({ description: 'Laboratory or facility name' })
  @IsOptional()
  @IsString()
  laboratory?: string;

  @ApiPropertyOptional({ description: 'Additional test notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateConservationRecordDto {
  @ApiProperty({ description: 'Unique sampling ID' })
  @IsString({ message: 'Sampling ID is required' })
  @IsNotEmpty({ message: 'Sampling ID cannot be empty' })
  samplingId: string;

  @ApiProperty({ description: 'Location and environmental data' })
  @ValidateNested()
  @Type(() => LocationDataDto)
  locationData: LocationDataDto;

  @ApiProperty({ description: 'Species identification data' })
  @ValidateNested()
  @Type(() => SpeciesDataDto)
  speciesData: SpeciesDataDto;

  @ApiProperty({ description: 'Sampling methodology data' })
  @ValidateNested()
  @Type(() => SamplingDataDto)
  samplingData: SamplingDataDto;

  @ApiPropertyOptional({ description: 'Array of lab test results', type: [LabTestDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LabTestDto)
  labTests?: LabTestDto[];

  @ApiPropertyOptional({ description: 'Array of uploaded file IPFS hashes' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fileHashes?: string[];

  @ApiPropertyOptional({ description: 'Additional researcher notes' })
  @IsOptional()
  @IsString()
  researcherNotes?: string;

  @ApiPropertyOptional({ description: 'Weather conditions during sampling' })
  @IsOptional()
  @IsString()
  weatherConditions?: string;

  @ApiPropertyOptional({ description: 'Tidal conditions during sampling' })
  @IsOptional()
  @IsString()
  tidalConditions?: string;
}