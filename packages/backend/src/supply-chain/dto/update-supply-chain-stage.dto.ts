import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsObject, IsArray, IsBoolean, MaxLength } from 'class-validator';
import { SupplyChainStage } from './create-supply-chain-record.dto';

export class UpdateSupplyChainStageDto {
  @ApiProperty({
    description: 'New stage in the supply chain',
    enum: SupplyChainStage,
    example: SupplyChainStage.PROCESSING
  })
  @IsEnum(SupplyChainStage)
  newStage: SupplyChainStage;

  @ApiPropertyOptional({
    description: 'Location where the stage update occurred',
    example: 'Lagos Processing Facility',
    maxLength: 200
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiPropertyOptional({
    description: 'Notes about the stage update',
    example: 'Quality check passed. Products ready for distribution.',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({
    description: 'Stage-specific data'
  })
  @IsOptional()
  @IsObject()
  stageData?: any;

  @ApiPropertyOptional({
    description: 'IPFS hashes of files related to this stage update'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fileHashes?: string[];

  @ApiPropertyOptional({
    description: 'Whether to update the IPFS data',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  updateIPFS?: boolean;
}
