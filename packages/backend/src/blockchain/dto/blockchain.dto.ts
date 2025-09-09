import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class RecordConservationDataDto {
  @ApiProperty({ description: 'Conservation record ID' })
  @IsString()
  recordId: string;

  @ApiProperty({ description: 'Unique sampling identifier' })
  @IsString()
  samplingId: string;

  @ApiProperty({ description: 'IPFS hash of conservation data' })
  @IsString()
  dataHash: string;

  @ApiProperty({ description: 'IPFS hash of species data', required: false })
  @IsOptional()
  @IsString()
  speciesHash?: string;

  @ApiProperty({ description: 'Researcher user ID' })
  @IsString()
  researcherId: string;

  @ApiProperty({ description: 'Timestamp of record creation', required: false })
  @IsOptional()
  @IsNumber()
  timestamp?: number;
}

export class RecordSupplyChainDataDto {
  @ApiProperty({ description: 'Supply chain record ID' })
  @IsString()
  recordId: string;

  @ApiProperty({ description: 'Unique product identifier' })
  @IsString()
  productId: string;

  @ApiProperty({ description: 'IPFS hash of product data' })
  @IsString()
  dataHash: string;

  @ApiProperty({ description: 'Current stage in supply chain' })
  @IsString()
  stage: string;

  @ApiProperty({ description: 'Previous stage hash for linking', required: false })
  @IsOptional()
  @IsString()
  previousStageHash?: string;

  @ApiProperty({ description: 'User ID who created the record' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Timestamp of record creation', required: false })
  @IsOptional()
  @IsNumber()
  timestamp?: number;
}

export class UpdateSupplyChainStageDto {
  @ApiProperty({ description: 'Product identifier' })
  @IsString()
  productId: string;

  @ApiProperty({ description: 'New stage name' })
  @IsString()
  newStage: string;

  @ApiProperty({ description: 'IPFS hash of stage data' })
  @IsString()
  stageDataHash: string;

  @ApiProperty({ description: 'Previous stage hash' })
  @IsString()
  previousStageHash: string;

  @ApiProperty({ description: 'Location of stage update', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'User ID performing update' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Timestamp of update', required: false })
  @IsOptional()
  @IsNumber()
  timestamp?: number;
}

export class BlockchainTransactionResponseDto {
  @ApiProperty({ description: 'Transaction hash' })
  transactionHash: string;

  @ApiProperty({ description: 'Block number', required: false })
  blockNumber?: number;

  @ApiProperty({ description: 'Gas used for transaction', required: false })
  gasUsed?: string;

  @ApiProperty({ 
    description: 'Transaction status',
    enum: ['pending', 'confirmed', 'failed']
  })
  status: 'pending' | 'confirmed' | 'failed';

  @ApiProperty({ description: 'Block timestamp', required: false })
  timestamp?: number;
}

export class BlockchainRecordResponseDto {
  @ApiProperty({ description: 'Record exists on blockchain' })
  exists: boolean;

  @ApiProperty({ description: 'Record verified status' })
  verified: boolean;

  @ApiProperty({ description: 'Data hash stored on blockchain' })
  dataHash: string;

  @ApiProperty({ description: 'Block number where record was stored' })
  blockNumber: number;

  @ApiProperty({ description: 'Transaction hash' })
  transactionHash: string;

  @ApiProperty({ description: 'Record timestamp' })
  timestamp: number;

  @ApiProperty({ description: 'Creator address' })
  creator: string;

  @ApiProperty({ description: 'Blockchain record ID', required: false })
  recordId?: number;

  @ApiProperty({ description: 'Record status', required: false })
  status?: string;

  @ApiProperty({ description: 'Verifier address', required: false })
  verifier?: string;

  @ApiProperty({ description: 'Verification timestamp', required: false })
  verifiedAt?: number;

  @ApiProperty({ description: 'IPFS hash', required: false })
  ipfsHash?: string;
}


export class BlockchainAnalyticsDto {
  @ApiProperty({ description: 'Total conservation records on blockchain' })
  totalConservationRecords: number;

  @ApiProperty({ description: 'Total supply chain records on blockchain' })
  totalSupplyChainRecords: number;

  @ApiProperty({ description: 'Total verified records' })
  totalVerifiedRecords: number;

  @ApiProperty({ description: 'Total transactions' })
  totalTransactions: number;

  @ApiProperty({ description: 'Average gas used per transaction' })
  averageGasUsed: string;

  @ApiProperty({ description: 'Last block number' })
  lastBlockNumber: number;

  @ApiProperty({ description: 'Network name' })
  networkName: string;

  @ApiProperty({ description: 'Contract address' })
  contractAddress: string;
}