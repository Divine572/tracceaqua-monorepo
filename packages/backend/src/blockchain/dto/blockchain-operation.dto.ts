import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject } from 'class-validator';

export enum BlockchainOperation {
  CREATE_CONSERVATION = 'create_conservation',
  UPDATE_CONSERVATION = 'update_conservation',
  VERIFY_CONSERVATION = 'verify_conservation',
  CREATE_SUPPLY_CHAIN = 'create_supply_chain',
  UPDATE_SUPPLY_CHAIN_STAGE = 'update_supply_chain_stage',
  VERIFY_SUPPLY_CHAIN = 'verify_supply_chain'
}

export class RecordConservationDataDto {
  @ApiProperty({
    description: 'Unique sampling identifier',
    example: 'SAMPLE-2024-001'
  })
  @IsString()
  @IsNotEmpty()
  samplingId: string;

  @ApiProperty({
    description: 'IPFS hash of the conservation data',
    example: 'QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx'
  })
  @IsString()
  @IsNotEmpty()
  dataHash: string;

  @ApiPropertyOptional({
    description: 'Additional IPFS hash for extended data',
    example: 'QmYyYyYyYyYyYyYyYyYyYyYyYyYyYyYyYyYyYyYyYyYyYy'
  })
  @IsOptional()
  @IsString()
  ipfsHash?: string;
}

export class RecordSupplyChainDataDto {
  @ApiProperty({
    description: 'Unique product identifier',
    example: 'PROD-2024-001'
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'IPFS hash of the supply chain data',
    example: 'QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx'
  })
  @IsString()
  @IsNotEmpty()
  dataHash: string;

  @ApiProperty({
    description: 'Current stage in supply chain',
    example: 'PROCESSING'
  })
  @IsString()
  @IsNotEmpty()
  currentStage: string;

  @ApiPropertyOptional({
    description: 'Source type',
    example: 'FARMED'
  })
  @IsOptional()
  @IsString()
  sourceType?: string;

  @ApiPropertyOptional({
    description: 'Whether the product is publicly traceable',
    example: true
  })
  @IsOptional()
  isPublic?: boolean;
}

export class UpdateSupplyChainStageDto {
  @ApiProperty({
    description: 'Product identifier',
    example: 'PROD-2024-001'
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'New stage in supply chain',
    example: 'DISTRIBUTION'
  })
  @IsString()
  @IsNotEmpty()
  newStage: string;

  @ApiPropertyOptional({
    description: 'IPFS hash of stage-specific data',
    example: 'QmZzZzZzZzZzZzZzZzZzZzZzZzZzZzZzZzZzZzZzZzZzZz'
  })
  @IsOptional()
  @IsString()
  dataHash?: string;

  @ApiPropertyOptional({
    description: 'Location where the stage update occurred',
    example: 'Lagos Distribution Center'
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Notes about the stage update',
    example: 'Products packaged and ready for distribution'
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Array of IPFS file hashes for this stage',
    example: ['QmFile1Hash', 'QmFile2Hash']
  })
  @IsOptional()
  fileHashes?: string[];
}

export class BlockchainTransactionResponseDto {
  @ApiProperty({
    description: 'Blockchain transaction hash',
    example: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  })
  transactionHash: string;

  @ApiProperty({
    description: 'Block number where transaction was mined',
    example: 12345678
  })
  blockNumber: number;

  @ApiProperty({
    description: 'Gas used for the transaction',
    example: '125000'
  })
  gasUsed: string;

  @ApiProperty({
    description: 'Gas price used (in gwei)',
    example: '20'
  })
  gasPrice: string;

  @ApiProperty({
    description: 'Operation that was performed',
    enum: BlockchainOperation
  })
  operation: BlockchainOperation;

  @ApiProperty({
    description: 'Transaction timestamp'
  })
  timestamp: Date;

  @ApiPropertyOptional({
    description: 'Additional operation metadata'
  })
  metadata?: any;
}

export class VerifyDataIntegrityDto {
  @ApiProperty({
    description: 'Data hash to verify',
    example: 'QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx'
  })
  @IsString()
  @IsNotEmpty()
  dataHash: string;

  @ApiProperty({
    description: 'Blockchain transaction hash',
    example: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  })
  @IsString()
  @IsNotEmpty()
  blockchainHash: string;
}

export class GrantRoleDto {
  @ApiProperty({
    description: 'User wallet address',
    example: '0x742d35Cc6635C0532925a3b8D9C9E1F75d4b4986'
  })
  @IsString()
  @IsNotEmpty()
  userAddress: string;

  @ApiProperty({
    description: 'Role to grant',
    example: 'RESEARCHER_ROLE',
    enum: ['RESEARCHER_ROLE', 'FARMER_ROLE', 'FISHERMAN_ROLE', 'PROCESSOR_ROLE', 'TRADER_ROLE', 'RETAILER_ROLE']
  })
  @IsString()
  @IsNotEmpty()
  role: string;
}
