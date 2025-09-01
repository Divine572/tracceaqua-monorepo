import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LocationDataDto, SpeciesDataDto, SamplingDataDto, LabTestDto } from './create-conservation-record.dto';

export enum RecordStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  VERIFIED = 'VERIFIED',
  PUBLISHED = 'PUBLISHED',
  REJECTED = 'REJECTED'
}

export class ConservationRecordResponseDto {
  @ApiProperty({ description: 'Unique record ID' })
  id: string;

  @ApiProperty({ description: 'Unique sampling ID' })
  samplingId: string;

  @ApiProperty({ description: 'User ID of the researcher who created this record' })
  userId: string;

  @ApiProperty({ description: 'Location and environmental data' })
  locationData: LocationDataDto;

  @ApiProperty({ description: 'Species identification data' })
  speciesData: SpeciesDataDto;

  @ApiProperty({ description: 'Sampling methodology data' })
  samplingData: SamplingDataDto;

  @ApiPropertyOptional({ description: 'Array of lab test results', type: [LabTestDto] })
  labTests?: LabTestDto[];

  @ApiPropertyOptional({ description: 'Array of uploaded file IPFS hashes' })
  fileHashes?: string[];

  @ApiPropertyOptional({ description: 'Additional researcher notes' })
  researcherNotes?: string;

  @ApiPropertyOptional({ description: 'Weather conditions during sampling' })
  weatherConditions?: string;

  @ApiPropertyOptional({ description: 'Tidal conditions during sampling' })
  tidalConditions?: string;

  @ApiProperty({ description: 'Current status of the record', enum: RecordStatus })
  status: RecordStatus;

  @ApiPropertyOptional({ description: 'IPFS hash of the complete data for blockchain storage' })
  dataHash?: string;

  @ApiPropertyOptional({ description: 'Blockchain transaction hash if recorded' })
  blockchainHash?: string;

  @ApiProperty({ description: 'Record creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Record last update timestamp' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Verification timestamp' })
  verifiedAt?: Date;

  @ApiPropertyOptional({ description: 'Admin who verified this record' })
  verifiedBy?: string;

  @ApiPropertyOptional({ description: 'Verification notes from admin' })
  verificationNotes?: string;

  // Computed fields
  @ApiProperty({ description: 'Researcher profile information' })
  researcher: {
    id: string;
    firstName?: string;
    lastName?: string;
    organization?: string;
  };
}
