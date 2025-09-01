import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FileUploadResponseDto {
  @ApiProperty({ description: 'IPFS hash (CID) of the uploaded file' })
  hash: string;

  @ApiProperty({ description: 'Public gateway URL to access the file' })
  url: string;

  @ApiProperty({ description: 'Original filename' })
  filename: string;

  @ApiProperty({ description: 'File size in bytes' })
  size: number;

  @ApiProperty({ description: 'File MIME type' })
  mimeType: string;

  @ApiProperty({ description: 'Upload timestamp' })
  uploadedAt: Date;

  @ApiPropertyOptional({ description: 'Associated record ID' })
  recordId?: string;

  @ApiPropertyOptional({ description: 'File category' })
  category?: string;
}




export class BatchFileUploadDto {
  @ApiPropertyOptional({ description: 'Associated record ID for all files' })
  @IsOptional()
  @IsString()
  recordId?: string;

  @ApiPropertyOptional({ description: 'Record type (conservation, supply-chain, etc.)' })
  @IsOptional()
  @IsString()
  recordType?: string;

  @ApiPropertyOptional({ description: 'Batch description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'File categories for each file' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];
}