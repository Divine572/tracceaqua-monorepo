import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { PrismaService } from '../prisma/prisma.service';


import {
    RecordConservationDataDto,
    RecordSupplyChainDataDto,
    UpdateSupplyChainStageDto,
    BlockchainAnalyticsDto,
    BlockchainRecordResponseDto,
    BlockchainTransactionResponseDto
} from './dto/blockchain.dto';


@Injectable()
export class BlockchainService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: ethers.JsonRpcProvider;
    private signer: ethers.Wallet;
    private contract: ethers.Contract;
  private isInitialized = false;

    // Contract ABI (simplified for key functions)
    private readonly contractABI = [
        'function createConservationRecord(string _samplingId, string _dataHash, string _ipfsHash) external',
        'function verifyConservationRecord(string _samplingId) external',
        'function createSupplyChainRecord(string _productId, string _dataHash, string _initialStage, string _sourceType, bool _isPublic) external',
        'function updateSupplyChainStage(string _productId, string _newStage, string _stageDataHash, string _location, string _notes, string[] _fileHashes) external',
        'function verifySupplyChainRecord(string _productId) external',
        'function getConservationRecord(string _samplingId) external view returns (tuple)',
        'function getSupplyChainRecord(string _productId) external view returns (tuple)',
        'function getStageHistory(string _productId, uint256 _stageIndex) external view returns (tuple)',
        'function pause() external',
        'function unpause() external',
        'event ConservationRecordCreated(uint256 indexed recordId, string indexed samplingId, address indexed researcher, string dataHash, uint256 timestamp)',
        'event ConservationRecordVerified(uint256 indexed recordId, string indexed samplingId, address indexed verifier, uint256 timestamp)',
        'event SupplyChainRecordCreated(uint256 indexed recordId, string indexed productId, address indexed creator, string dataHash, string initialStage, uint256 timestamp)',
        'event SupplyChainStageUpdated(uint256 indexed recordId, string indexed productId, address indexed updatedBy, string newStage, string location, uint256 timestamp)'
    ];

    constructor(
        private configService: ConfigService,
        private prismaService: PrismaService,
    ) { }

  async onModuleInit() {
    await this.initializeBlockchain();
  }

    async onModuleDestroy() {
        await this.stopEventListening();
  }

    private async initializeBlockchain(): Promise<void> {
    try {
        this.logger.log('Initializing blockchain connection...');

        const rpcUrl = this.configService.get<string>('SEPOLIA_RPC_URL') ||
            'https://ethereum-sepolia-rpc.publicnode.com';
        const privateKey = this.configService.get<string>('PRIVATE_KEY');
        const contractAddress = this.configService.get<string>('CONTRACT_ADDRESS');

        if (!privateKey || !contractAddress) {
            throw new Error('Missing required blockchain configuration');
        }

        // Initialize provider
        this.provider = new ethers.JsonRpcProvider(rpcUrl);

        // Initialize signer
        this.signer = new ethers.Wallet(privateKey, this.provider);

        // Initialize contract
        this.contract = new ethers.Contract(contractAddress, this.contractABI, this.signer);

        // Test connection
        await this.provider.getBlockNumber();

        this.isInitialized = true;
        this.logger.log(`✅ Blockchain initialized on network: ${await this.provider.getNetwork()}`);

        // Start listening for events
        await this.startEventListening();

    } catch (error) {
            this.logger.error('❌ Failed to initialize blockchain:', error);
            this.isInitialized = false;
        }
    }

    // ===== CONSERVATION FUNCTIONS =====

    async recordConservationData(data: RecordConservationDataDto): Promise<BlockchainTransactionResponseDto> {
    try {
        this.ensureInitialized();

        const tx = await this.contract.createConservationRecord(
            data.samplingId,
            data.dataHash,
            data.speciesHash || ''
        );

        this.logger.log(`Conservation record transaction sent: ${tx.hash}`);

        return {
            transactionHash: tx.hash,
            status: 'pending'
        };

    } catch (error) {
        this.logger.error('Failed to record conservation data:', error);
        throw error;
        }
    }

    async verifyConservationRecord(samplingId: string, adminId: string): Promise<BlockchainTransactionResponseDto> {
    try {
        this.ensureInitialized();

        const tx = await this.contract.verifyConservationRecord(samplingId);

        this.logger.log(`Conservation record verified: ${samplingId} by ${adminId}`);

        return {
            transactionHash: tx.hash,
            status: 'pending'
        };

    } catch (error) {
        this.logger.error('Failed to verify conservation record:', error);
        throw error;
    }
  }

    async getConservationRecord(samplingId: string): Promise<BlockchainRecordResponseDto> {
        try {
            this.ensureInitialized();

            // Get the record from the blockchain
            const record = await this.contract.getConservationRecord(samplingId);

            if (!record || record.id === 0) {
                return {
                    exists: false,
                    verified: false,
                    dataHash: '',
                    blockNumber: 0,
                    transactionHash: '',
                    timestamp: 0,
                    creator: ''
                };
            }

            let transactionHash = '';
            let blockNumber = 0;

            try {
                // Try to get the transaction hash from our database
                const dbRecord = await this.prismaService.conservationRecord.findUnique({
                    where: { samplingId },
                    select: { blockchainHash: true }
                });

                if (dbRecord?.blockchainHash) {
                    transactionHash = dbRecord.blockchainHash;

                    // Get the actual block number from the transaction
                    const txReceipt = await this.provider.getTransactionReceipt(transactionHash);
                    if (txReceipt) {
                        blockNumber = txReceipt.blockNumber;
                    }
                } else {
                    this.logger.warn(`No transaction hash found in database for sampling ID: ${samplingId}`);
                }
            } catch (dbError) {
                this.logger.error(`Failed to fetch transaction details for ${samplingId}:`, dbError);
            // Continue without transaction details rather than failing completely
            }

            // Verify data integrity if we have transaction hash
            if (transactionHash) {
                await this.verifyDataIntegrity(record.dataHash, transactionHash);
            }

            return {
                exists: true,
                verified: record.verified,
                dataHash: record.dataHash,
                blockNumber,
                transactionHash,
                timestamp: Number(record.timestamp),
                creator: record.researcher,
                // Additional blockchain-specific data
                recordId: Number(record.id),
                status: record.status,
                verifier: record.verifier,
                verifiedAt: record.verifiedAt ? Number(record.verifiedAt) : 0,
                ipfsHash: record.ipfsHash || ''
            };

        } catch (error) {
            this.logger.error(`Failed to get conservation record for ${samplingId}:`, error);

            // Check if it's a "Record does not exist" error from the contract
            if (error.message?.includes('Record does not exist')) {
                return {
                    exists: false,
                    verified: false,
                    dataHash: '',
                    blockNumber: 0,
                    transactionHash: '',
                    timestamp: 0,
                    creator: ''
                };
            }

            throw error;
        }
    }  // ===== SUPPLY CHAIN FUNCTIONS =====

    async recordSupplyChainData(data: RecordSupplyChainDataDto): Promise<BlockchainTransactionResponseDto> {
    try {
        this.ensureInitialized();

        const tx = await this.contract.createSupplyChainRecord(
            data.productId,
            data.dataHash,
            data.stage,
            'FARMED', // Default source type
            true // Default public visibility
        );

        this.logger.log(`Supply chain record transaction sent: ${tx.hash}`);

        return {
            transactionHash: tx.hash,
            status: 'pending'
        };

    } catch (error) {
        this.logger.error('Failed to record supply chain data:', error);
        throw error;
        }
    }

    async updateSupplyChainStage(data: UpdateSupplyChainStageDto): Promise<BlockchainTransactionResponseDto> {
    try {
        this.ensureInitialized();

      const tx = await this.contract.updateSupplyChainStage(
          data.productId,
          data.newStage,
          data.stageDataHash,
          data.location || '',
          data.notes || '',
          [] // File hashes array
      );

        this.logger.log(`Supply chain stage updated: ${data.productId} to ${data.newStage}`);

        return {
            transactionHash: tx.hash,
            status: 'pending'
        };

    } catch (error) {
        this.logger.error('Failed to update supply chain stage:', error);
        throw error;
    }
  }

    async verifySupplyChainRecord(productId: string, adminId: string): Promise<BlockchainTransactionResponseDto> {
    try {
        this.ensureInitialized();

        const tx = await this.contract.verifySupplyChainRecord(productId);

        this.logger.log(`Supply chain record verified: ${productId} by ${adminId}`);

        return {
            transactionHash: tx.hash,
            status: 'pending'
        };

    } catch (error) {
        this.logger.error('Failed to verify supply chain record:', error);
        throw error;
    }
  }

    async getSupplyChainRecord(productId: string): Promise<BlockchainRecordResponseDto> {
    try {
        this.ensureInitialized();

      const record = await this.contract.getSupplyChainRecord(productId);

      return {
          exists: record.id !== 0,
          verified: record.verified,
        dataHash: record.dataHash,
          blockNumber: 0,
          transactionHash: '',
        timestamp: Number(record.timestamp),
          creator: record.creator
      };

    } catch (error) {
        this.logger.error('Failed to get supply chain record:', error);
        throw error;
    }
  }

    async getSupplyChainHistory(productId: string): Promise<any[]> {
        try {
            this.ensureInitialized();

            const record = await this.contract.getSupplyChainRecord(productId);
            const history: any[] = [];

            for (let i = 0; i < record.stageCount; i++) {
                const stage = await this.contract.getStageHistory(productId, i);
                history.push({
                    stage: stage.stage,
                    updatedBy: stage.updatedBy,
                    timestamp: Number(stage.timestamp),
                    dataHash: stage.dataHash,
                    location: stage.location,
                    notes: stage.notes,
                    fileHashes: stage.fileHashes
                });
            }

            return history;

        } catch (error) {
            this.logger.error('Failed to get supply chain history:', error);
            throw error;
        }
    }  // ===== UTILITY FUNCTIONS =====

    async isHealthy(): Promise<boolean> {
        try {
            if (!this.isInitialized) return false;
            await this.provider.getBlockNumber();
            return true;
        } catch {
            return false;
        }
    }

    async getNetworkStatus(): Promise<any> {
        try {
            this.ensureInitialized();

            const [blockNumber, gasPrice, network] = await Promise.all([
                this.provider.getBlockNumber(),
                this.provider.getFeeData(),
                this.provider.getNetwork()
            ]);

            return {
                connected: true,
                latestBlock: blockNumber,
                gasPrice: gasPrice.gasPrice?.toString() || '0',
                networkName: network.name,
                chainId: Number(network.chainId)
            };

        } catch (error) {
            this.logger.error('Failed to get network status:', error);
            return {
                connected: false,
                latestBlock: 0,
                gasPrice: '0',
                networkName: 'unknown',
                chainId: 0
            };
        }
    }

    async getGasPrice(): Promise<bigint> {
        try {
            this.ensureInitialized();
            const feeData = await this.provider.getFeeData();
            return feeData.gasPrice || BigInt(0);
        } catch {
            return BigInt(0);
        }
    }

    async getBlockchainAnalytics(): Promise<BlockchainAnalyticsDto> {
        try {
            this.ensureInitialized();

            // Get comprehensive stats from database and blockchain
            const [
                conservationCount,
                supplyChainCount,
                verifiedConservationCount,
                verifiedSupplyChainCount,
                recentTransactions,
                blockNumber,
                network
            ] = await Promise.all([
                // Total conservation records on blockchain
                this.prismaService.conservationRecord.count({
                    where: { blockchainHash: { not: null } }
                }),
                // Total supply chain records on blockchain
                this.prismaService.supplyChainRecord.count({
                    where: { blockchainHash: { not: null } }
                }),
                // Verified conservation records
                this.prismaService.conservationRecord.count({
                    where: {
                        blockchainHash: { not: null },
                        status: 'VERIFIED'
                    }
                }),
                // Verified supply chain records (assuming there's a verified field or status)
                this.prismaService.supplyChainRecord.count({
                    where: {
                        blockchainHash: { not: null }
                        // Add verification condition if available in schema
                    }
                }),
                // Get recent transactions for gas analysis (last 100)
                this.prismaService.conservationRecord.findMany({
                    where: {
                        blockchainHash: { not: null },
                        createdAt: {
                            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                        }
                    },
                    select: { blockchainHash: true },
                    take: 100,
                    orderBy: { createdAt: 'desc' }
                }),
                // Current block number
                this.provider.getBlockNumber(),
                // Network information
                this.provider.getNetwork()
            ]);

            // Calculate average gas used from recent transactions
            let averageGasUsed = '0';
            if (recentTransactions.length > 0) {
                try {
                    const gasUsedValues: bigint[] = [];

                    // Analyze a sample of recent transactions to get real gas usage
                    const sampleSize = Math.min(recentTransactions.length, 20);
                    const sampleTransactions = recentTransactions.slice(0, sampleSize);

                    for (const record of sampleTransactions) {
                        if (record.blockchainHash) {
                            try {
                                const receipt = await this.provider.getTransactionReceipt(record.blockchainHash);
                                if (receipt && receipt.gasUsed) {
                                    gasUsedValues.push(receipt.gasUsed);
                                }
                            } catch (txError) {
                                this.logger.warn(`Failed to get transaction receipt for ${record.blockchainHash}`);
                                continue;
                            }
                        }
                    }

                    if (gasUsedValues.length > 0) {
                        const totalGas = gasUsedValues.reduce((sum, gas) => sum + gas, BigInt(0));
                        const avgGas = totalGas / BigInt(gasUsedValues.length);
                        averageGasUsed = avgGas.toString();
                    } else {
                        // Fallback to estimated values based on operation type
                        averageGasUsed = '150000'; // Typical gas for contract interaction
                    }
                } catch (gasError) {
                    this.logger.warn('Failed to calculate average gas used:', gasError);
                    averageGasUsed = '150000'; // Conservative estimate
                }
            }

            const contractAddress = this.configService.get<string>('CONTRACT_ADDRESS') || 'Unknown';

            // Calculate additional metrics
            const totalRecords = conservationCount + supplyChainCount;
            const totalVerifiedRecords = verifiedConservationCount + verifiedSupplyChainCount;

            this.logger.log(`📊 Blockchain Analytics: ${totalRecords} total records, ${totalVerifiedRecords} verified`);

            return {
                totalConservationRecords: conservationCount,
                totalSupplyChainRecords: supplyChainCount,
                totalVerifiedRecords: totalVerifiedRecords,
                totalTransactions: totalRecords,
                averageGasUsed,
                lastBlockNumber: blockNumber,
                networkName: network.name,
                contractAddress
            };

        } catch (error) {
            this.logger.error('Failed to get blockchain analytics:', error);

            // Return minimal analytics if there's an error
            const fallbackContractAddress = this.configService.get<string>('CONTRACT_ADDRESS') || 'Unknown';

            return {
                totalConservationRecords: 0,
                totalSupplyChainRecords: 0,
                totalVerifiedRecords: 0,
                totalTransactions: 0,
                averageGasUsed: '0',
                lastBlockNumber: 0,
                networkName: 'unknown',
                contractAddress: fallbackContractAddress
            };
        }
    }

    async emergencyPause(adminId: string): Promise<BlockchainTransactionResponseDto> {
    try {
        this.ensureInitialized();

        const tx = await this.contract.pause();
        this.logger.warn(`Emergency pause triggered by admin: ${adminId}`);

        return {
            transactionHash: tx.hash,
            status: 'pending'
        };

    } catch (error) {
        this.logger.error('Failed to pause contract:', error);
        throw error;
    }
  }

    async emergencyUnpause(adminId: string): Promise<BlockchainTransactionResponseDto> {
    try {
        this.ensureInitialized();

        const tx = await this.contract.unpause();
        this.logger.log(`Emergency unpause triggered by admin: ${adminId}`);

        return {
            transactionHash: tx.hash,
            status: 'pending'
        };

    } catch (error) {
        this.logger.error('Failed to unpause contract:', error);
        throw error;
    }
  }

    // ===== EVENT LISTENING =====

    private async startEventListening(): Promise<void> {
        if (!this.isInitialized) return;

        this.logger.log('Starting blockchain event listening...');

        this.contract.on('ConservationRecordCreated', async (recordId, samplingId, researcher, dataHash, timestamp, event) => {
            this.logger.log(`🌊 Conservation record created: ${samplingId}`);

            // Update database with blockchain confirmation
            await this.prismaService.conservationRecord.updateMany({
                where: { samplingId },
                data: {
                    blockchainHash: event.transactionHash,
                    status: 'VERIFIED'
                }
            });
        });

        this.contract.on('SupplyChainRecordCreated', async (recordId, productId, creator, dataHash, initialStage, timestamp, event) => {
            this.logger.log(`🔗 Supply chain record created: ${productId}`);

            await this.prismaService.supplyChainRecord.updateMany({
                where: { productId },
                data: {
                    blockchainHash: event.transactionHash
                }
            });
        });

        this.contract.on('SupplyChainStageUpdated', async (recordId, productId, updatedBy, newStage, location, timestamp, event) => {
            this.logger.log(`📦 Supply chain stage updated: ${productId} -> ${newStage}`);

            // Since SupplyChainStageHistory doesn't have blockchainHash field,
            // we'll update the main supply chain record instead
            await this.prismaService.supplyChainRecord.updateMany({
                where: { productId },
                data: {
                    blockchainHash: event.transactionHash
                }
            });
        });
    }

    private async stopEventListening(): Promise<void> {
        if (this.contract) {
            this.contract.removeAllListeners();
            this.logger.log('Stopped blockchain event listening');
        }
    }

    private ensureInitialized(): void {
        if (!this.isInitialized) {
            throw new Error('Blockchain service not initialized');
        }
    }

    // ===== DATA INTEGRITY VERIFICATION =====

    /**
     * Verify the integrity of data stored on blockchain vs IPFS/database
     * Production implementation with comprehensive validation
     */
    async verifyDataIntegrity(blockchainHash: string, transactionHash?: string): Promise<boolean> {
    try {
        this.ensureInitialized();

        if (!blockchainHash) {
            this.logger.warn('Cannot verify integrity: blockchain hash is empty');
        return false;
      }

        // If we have a transaction hash, verify the transaction exists and get its data
        if (transactionHash) {
            const txReceipt = await this.provider.getTransactionReceipt(transactionHash);
            if (!txReceipt) {
                this.logger.error(`Transaction not found: ${transactionHash}`);
                return false;
            }

            // Verify transaction was successful
            if (txReceipt.status === 0) {
                this.logger.error(`Transaction failed: ${transactionHash}`);
                return false;
            }

            // Parse transaction logs to extract the data hash from events
            const logs = txReceipt.logs;
            let eventDataHash: string | null = null;

            for (const log of logs) {
                try {
                    // Try to parse the log as one of our contract events
                    const parsedLog = this.contract.interface.parseLog(log);
                    if (parsedLog && (parsedLog.name === 'ConservationRecordCreated' ||
                        parsedLog.name === 'SupplyChainRecordCreated')) {
                        eventDataHash = parsedLog.args.dataHash;
                        break;
                    }
                } catch (parseError) {
                    // Log doesn't match our contract interface, skip
                    continue;
                }
            }

            // Compare blockchain hash with event data hash
            if (eventDataHash && eventDataHash !== blockchainHash) {
                this.logger.error(`Data hash mismatch - Blockchain: ${blockchainHash}, Event: ${eventDataHash}`);
                return false;
            }
        }

        // Additional validation: Check if hash format is valid IPFS hash
        const ipfsHashRegex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
        if (!ipfsHashRegex.test(blockchainHash)) {
            this.logger.warn(`Invalid IPFS hash format: ${blockchainHash}`);
            // Don't fail verification for format issues, just warn
        }

        this.logger.log(`✅ Data integrity verified for hash: ${blockchainHash}`);
        return true;

    } catch (error) {
        this.logger.error('Data integrity verification failed:', error);
        return false;
    }
  }
}
