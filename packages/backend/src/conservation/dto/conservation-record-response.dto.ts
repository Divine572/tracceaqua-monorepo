import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum RecordStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

export class ConservationRecordResponseDto {
  @ApiProperty({
    description: 'Unique record ID',
    example: 'clx1a2b3c4d5e6f7g8h9i0j1'
  })
  id: string;

  @ApiProperty({
    description: 'Unique sampling identifier',
    example: 'SAMPLE-2024-001'
  })
  samplingId: string;

  @ApiProperty({
    description: 'Location and environmental data'
  })
  locationData: any;

  @ApiProperty({
    description: 'Species identification and count data'
  })
  speciesData: any;

  @ApiProperty({
    description: 'Sampling methods and procedures'
  })
  samplingData: any;

  @ApiPropertyOptional({
    description: 'Laboratory test results'
  })
  labTests?: any;

  @ApiPropertyOptional({
    description: 'IPFS hashes of uploaded files'
  })
  fileHashes?: string[];

  @ApiPropertyOptional({
    description: 'Additional notes from the researcher'
  })
  researcherNotes?: string;

  @ApiPropertyOptional({
    description: 'Weather conditions during sampling'
  })
  weatherConditions?: string;

  @ApiPropertyOptional({
    description: 'Tidal conditions during sampling'
  })
  tidalConditions?: string;

  @ApiProperty({
    description: 'Record status',
    enum: RecordStatus,
    example: RecordStatus.SUBMITTED
  })
  status: RecordStatus;

  @ApiPropertyOptional({
    description: 'IPFS hash of complete record data'
  })
  dataHash?: string;

  @ApiPropertyOptional({
    description: 'Blockchain transaction hash'
  })
  blockchainHash?: string;

  @ApiPropertyOptional({
    description: 'Verification timestamp'
  })
  verifiedAt?: Date;

  @ApiPropertyOptional({
    description: 'ID of admin who verified the record'
  })
  verifiedBy?: string;

  @ApiPropertyOptional({
    description: 'Verification notes from admin'
  })
  verificationNotes?: string;

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
}
