import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsObject, IsBoolean } from 'class-validator';

export enum FileCategory {
  CONSERVATION = 'conservation',
  SUPPLY_CHAIN = 'supply-chain',
  PROFILE = 'profile',
  DOCUMENTS = 'documents'
}

export class FileUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'File to upload'
  })
  file: Express.Multer.File;

  @ApiPropertyOptional({
    description: 'Record ID to associate with the file',
    example: 'SAMPLE-2024-001'
  })
  @IsOptional()
  @IsString()
  recordId?: string;

  @ApiPropertyOptional({
    description: 'File category',
    enum: FileCategory,
    example: FileCategory.CONSERVATION
  })
  @IsOptional()
  @IsEnum(FileCategory)
  category?: FileCategory;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { description: 'Lab test results', quality: 'high' }
  })
  @IsOptional()
  @IsObject()
  metadata?: any;

  @ApiPropertyOptional({
    description: 'Whether to compress the file',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  compress?: boolean;
}

export class BatchFileUploadDto {
  @ApiProperty({
    description: 'Record ID to associate with all files',
    example: 'SAMPLE-2024-001'
  })
  @IsString()
  recordId: string;

  @ApiPropertyOptional({
    description: 'File category for all files',
    enum: FileCategory,
    example: FileCategory.CONSERVATION
  })
  @IsOptional()
  @IsEnum(FileCategory)
  category?: FileCategory;

  @ApiPropertyOptional({
    description: 'Additional metadata for all files',
    example: { batch: 'lab-results-batch-1' }
  })
  @IsOptional()
  @IsObject()
  metadata?: any;

  @ApiPropertyOptional({
    description: 'Whether to compress all files',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  compress?: boolean;
}

export class FileUploadResponseDto {
  @ApiProperty({
    description: 'IPFS hash of the uploaded file',
    example: 'QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx'
  })
  hash: string;

  @ApiProperty({
    description: 'Original filename',
    example: 'lab-results.pdf'
  })
  filename: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024768
  })
  size: number;

  @ApiProperty({
    description: 'MIME type',
    example: 'application/pdf'
  })
  mimeType: string;

  @ApiProperty({
    description: 'Public URL to access the file',
    example: 'https://gateway.pinata.cloud/ipfs/QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx'
  })
  url: string;

  @ApiPropertyOptional({
    description: 'Associated record ID'
  })
  recordId?: string;

  @ApiPropertyOptional({
    description: 'File category'
  })
  category?: string;

  @ApiProperty({
    description: 'Upload timestamp'
  })
  uploadedAt: Date;
}

export class BatchFileUploadResponseDto {
  @ApiProperty({
    description: 'Array of uploaded files',
    type: [FileUploadResponseDto]
  })
  files: FileUploadResponseDto[];

  @ApiProperty({
    description: 'Total size of all files in bytes',
    example: 2048576
  })
  totalSize: number;

  @ApiProperty({
    description: 'Total number of files uploaded',
    example: 3
  })
  totalFiles: number;
}