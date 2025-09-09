import { Injectable, Logger, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import TracceAquaABI from '../../../contracts/artifacts/contracts/TracceAqua.sol/TracceAqua.json';

export interface BlockchainConfig {
  rpcUrl: string;
  contractAddress?: string;
  privateKey?: string;
  gasPrice?: string;
  gasLimit?: number;
}

export interface ConservationBlockchainData {
  samplingId: string;
  dataHash: string;
  researcher: string;
  timestamp: number;
  verified: boolean;
  verifier?: string;
  verifiedAt?: number;
  status: string;
}

export interface SupplyChainBlockchainData {
  productId: string;
  dataHash: string;
  creator: string;
  timestamp: number;
  currentStage: string;
  stageCount: number;
  verified: boolean;
}

@Injectable()
export class BlockchainService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private wallet: ethers.Wallet;
  private config: BlockchainConfig;
  private isInitialized = false;

  constructor(private configService: ConfigService) {
    this.initializeConfig();
  }

  async onModuleInit() {
    await this.initializeBlockchain();
  }

  private initializeConfig() {
    this.config = {
      rpcUrl: this.configService.get<string>('SEPOLIA_RPC_URL') || 'https://ethereum-sepolia-rpc.publicnode.com',
      contractAddress: this.configService.get<string>('CONTRACT_ADDRESS'),
      privateKey: this.configService.get<string>('DEPLOYER_PRIVATE_KEY'),
      gasPrice: this.configService.get<string>('GAS_PRICE'),
      gasLimit: this.configService.get<number>('GAS_LIMIT') || 500000,
    };
  }

  private async initializeBlockchain() {
    try {
      if (!this.config.contractAddress || !this.config.privateKey) {
        this.logger.warn('Blockchain configuration incomplete. Some features may not work.');
        return;
      }

      this.provider = new ethers.JsonRpcProvider(this.config.rpcUrl);
      this.wallet = new ethers.Wallet(this.config.privateKey, this.provider);
      this.contract = new ethers.Contract(this.config.contractAddress, TracceAquaABI.abi, this.wallet);

      // Test connection
      await this.provider.getBlockNumber();
      this.isInitialized = true;

      this.logger.log('Blockchain service initialized successfully');
      this.logger.log(`Connected to network: ${(await this.provider.getNetwork()).name}`);
      this.logger.log(`Contract address: ${this.config.contractAddress}`);
    } catch (error) {
      this.logger.error('Failed to initialize blockchain service:', error.message);
      this.isInitialized = false;
    }
  }

  private async ensureInitialized() {
    if (!this.isInitialized) {
      throw new InternalServerErrorException('Blockchain service not properly initialized');
    }
  }

  // ===== CONSERVATION FUNCTIONS =====

  async recordConservationData(samplingId: string, dataHash: string): Promise<string> {
    await this.ensureInitialized();
    
    try {
      this.logger.log(`Recording conservation data for sampling ID: ${samplingId}`);
      
      // Estimate gas first
      const gasEstimate = await this.contract.createConservationRecord.estimateGas(samplingId, dataHash);
      const gasLimit = Math.floor(Number(gasEstimate) * 1.2); // 20% buffer
      
      const tx = await this.contract.createConservationRecord(samplingId, dataHash, {
        gasLimit,
        gasPrice: this.config.gasPrice ? ethers.parseUnits(this.config.gasPrice, 'gwei') : undefined
      });
      
      const receipt = await tx.wait();
      
      this.logger.log(`Conservation record created. Transaction hash: ${receipt.hash}`);
      this.logger.log(`Gas used: ${receipt.gasUsed.toString()}`);
      
      return receipt.hash;
    } catch (error) {
      this.logger.error(`Failed to record conservation data: ${error.message}`);
      
      if (error.code === 'CALL_EXCEPTION') {
        if (error.reason?.includes('already exists')) {
          throw new InternalServerErrorException('Sampling ID already exists on blockchain');
        } else if (error.reason?.includes('Not authorized')) {
          throw new InternalServerErrorException('Not authorized to create conservation records');
        }
      }
      
      throw new InternalServerErrorException('Failed to record data on blockchain');
    }
  }

  async updateConservationRecord(samplingId: string, dataHash: string): Promise<string> {
    await this.ensureInitialized();
    
    try {
      this.logger.log(`Updating conservation record for sampling ID: ${samplingId}`);
      
      const gasEstimate = await this.contract.updateConservationRecord.estimateGas(samplingId, dataHash);
      const gasLimit = Math.floor(Number(gasEstimate) * 1.2);
      
      const tx = await this.contract.updateConservationRecord(samplingId, dataHash, {
        gasLimit,
        gasPrice: this.config.gasPrice ? ethers.parseUnits(this.config.gasPrice, 'gwei') : undefined
      });
      
      const receipt = await tx.wait();
      
      this.logger.log(`Conservation record updated. Transaction hash: ${receipt.hash}`);
      return receipt.hash;
    } catch (error) {
      this.logger.error(`Failed to update conservation record: ${error.message}`);
      throw new InternalServerErrorException('Failed to update record on blockchain');
    }
  }

  async verifyConservationRecord(samplingId: string): Promise<string> {
    await this.ensureInitialized();
    
    try {
      this.logger.log(`Verifying conservation record for sampling ID: ${samplingId}`);
      
      const gasEstimate = await this.contract.verifyConservationRecord.estimateGas(samplingId);
      const gasLimit = Math.floor(Number(gasEstimate) * 1.2);
      
      const tx = await this.contract.verifyConservationRecord(samplingId, {
        gasLimit,
        gasPrice: this.config.gasPrice ? ethers.parseUnits(this.config.gasPrice, 'gwei') : undefined
      });
      
      const receipt = await tx.wait();
      
      this.logger.log(`Conservation record verified. Transaction hash: ${receipt.hash}`);
      return receipt.hash;
    } catch (error) {
      this.logger.error(`Failed to verify conservation record: ${error.message}`);
      throw new InternalServerErrorException('Failed to verify record on blockchain');
    }
  }

  async getConservationRecord(samplingId: string): Promise<ConservationBlockchainData> {
    await this.ensureInitialized();
    
    try {
      const record = await this.contract.getConservationRecord(samplingId);
      
      return {
        samplingId: record.samplingId,
        dataHash: record.dataHash,
        researcher: record.researcher,
        timestamp: Number(record.timestamp),
        verified: record.verified,
        verifier: record.verifier !== ethers.ZeroAddress ? record.verifier : undefined,
        verifiedAt: Number(record.verifiedAt) > 0 ? Number(record.verifiedAt) : undefined,
        status: record.status
      };
    } catch (error) {
      this.logger.error(`Failed to get conservation record: ${error.message}`);
      throw new InternalServerErrorException('Failed to retrieve record from blockchain');
    }
  }

  // ===== SUPPLY CHAIN FUNCTIONS =====

  async recordSupplyChainData(productId: string, dataHash: string, currentStage: string): Promise<string> {
    await this.ensureInitialized();
    
    try {
      this.logger.log(`Recording supply chain data for product ID: ${productId}`);
      
      const gasEstimate = await this.contract.createSupplyChainRecord.estimateGas(productId, dataHash, currentStage);
      const gasLimit = Math.floor(Number(gasEstimate) * 1.2);
      
      const tx = await this.contract.createSupplyChainRecord(productId, dataHash, currentStage, {
        gasLimit,
        gasPrice: this.config.gasPrice ? ethers.parseUnits(this.config.gasPrice, 'gwei') : undefined
      });
      
      const receipt = await tx.wait();
      
      this.logger.log(`Supply chain record created. Transaction hash: ${receipt.hash}`);
      this.logger.log(`Gas used: ${receipt.gasUsed.toString()}`);
      
      return receipt.hash;
    } catch (error) {
      this.logger.error(`Failed to record supply chain data: ${error.message}`);
      
      if (error.code === 'CALL_EXCEPTION') {
        if (error.reason?.includes('already exists')) {
          throw new InternalServerErrorException('Product ID already exists on blockchain');
        } else if (error.reason?.includes('No permission')) {
          throw new InternalServerErrorException('Not authorized for this supply chain stage');
        }
      }
      
      throw new InternalServerErrorException('Failed to record data on blockchain');
    }
  }

  async updateSupplyChainStage(
    productId: string, 
    newStage: string, 
    dataHash: string = '', 
    location: string = '', 
    notes: string = ''
  ): Promise<string> {
    await this.ensureInitialized();
    
    try {
      this.logger.log(`Updating supply chain stage for product ID: ${productId} to ${newStage}`);
      
      const gasEstimate = await this.contract.updateSupplyChainStage.estimateGas(
        productId, newStage, dataHash, location, notes
      );
      const gasLimit = Math.floor(Number(gasEstimate) * 1.2);
      
      const tx = await this.contract.updateSupplyChainStage(
        productId, newStage, dataHash, location, notes, {
          gasLimit,
          gasPrice: this.config.gasPrice ? ethers.parseUnits(this.config.gasPrice, 'gwei') : undefined
        }
      );
      
      const receipt = await tx.wait();
      
      this.logger.log(`Supply chain stage updated. Transaction hash: ${receipt.hash}`);
      return receipt.hash;
    } catch (error) {
      this.logger.error(`Failed to update supply chain stage: ${error.message}`);
      throw new InternalServerErrorException('Failed to update stage on blockchain');
    }
  }

  async verifySupplyChainRecord(productId: string): Promise<string> {
    await this.ensureInitialized();
    
    try {
      this.logger.log(`Verifying supply chain record for product ID: ${productId}`);
      
      const gasEstimate = await this.contract.verifySupplyChainRecord.estimateGas(productId);
      const gasLimit = Math.floor(Number(gasEstimate) * 1.2);
      
      const tx = await this.contract.verifySupplyChainRecord(productId, {
        gasLimit,
        gasPrice: this.config.gasPrice ? ethers.parseUnits(this.config.gasPrice, 'gwei') : undefined
      });
      
      const receipt = await tx.wait();
      
      this.logger.log(`Supply chain record verified. Transaction hash: ${receipt.hash}`);
      return receipt.hash;
    } catch (error) {
      this.logger.error(`Failed to verify supply chain record: ${error.message}`);
      throw new InternalServerErrorException('Failed to verify record on blockchain');
    }
  }

  async getSupplyChainRecord(productId: string): Promise<SupplyChainBlockchainData> {
    await this.ensureInitialized();
    
    try {
      const record = await this.contract.getSupplyChainRecord(productId);
      
      return {
        productId: record.productId,
        dataHash: record.dataHash,
        creator: record.creator,
        timestamp: Number(record.timestamp),
        currentStage: record.currentStage,
        stageCount: Number(record.stageCount),
        verified: record.verified
      };
    } catch (error) {
      this.logger.error(`Failed to get supply chain record: ${error.message}`);
      throw new InternalServerErrorException('Failed to retrieve record from blockchain');
    }
  }

  async getSupplyChainStageHistory(productId: string, stageIndex: number): Promise<any> {
    await this.ensureInitialized();
    
    try {
      const stage = await this.contract.getStageHistory(productId, stageIndex);
      
      return {
        stage: stage.stage,
        updatedBy: stage.updatedBy,
        timestamp: Number(stage.timestamp),
        dataHash: stage.dataHash,
        location: stage.location,
        notes: stage.notes
      };
    } catch (error) {
      this.logger.error(`Failed to get stage history: ${error.message}`);
      throw new InternalServerErrorException('Failed to retrieve stage history from blockchain');
    }
  }

  // ===== UTILITY FUNCTIONS =====

  async verifyDataIntegrity(dataHash: string, blockchainHash: string): Promise<boolean> {
    await this.ensureInitialized();
    
    try {
      const tx = await this.provider.getTransaction(blockchainHash);
      if (!tx) {
        this.logger.warn(`Transaction not found: ${blockchainHash}`);
        return false;
      }

      const receipt = await this.provider.getTransactionReceipt(blockchainHash);
      if (!receipt || receipt.status !== 1) {
        this.logger.warn(`Transaction failed or not confirmed: ${blockchainHash}`);
        return false;
      }

      // Parse transaction logs to verify data hash
      const logs = receipt.logs;
      for (const log of logs) {
        try {
          const parsedLog = this.contract.interface.parseLog(log);
          if (parsedLog && parsedLog.args && parsedLog.args.length > 0) {
            // Check if any of the log arguments contain our data hash
            for (const arg of parsedLog.args) {
              if (typeof arg === 'string' && arg === dataHash) {
                return true;
              }
            }
          }
        } catch (parseError) {
          // Ignore parsing errors for logs from other contracts
          continue;
        }
      }

      return false;
    } catch (error) {
      this.logger.error(`Failed to verify data integrity: ${error.message}`);
      return false;
    }
  }

  async getGasPrice(): Promise<string> {
    await this.ensureInitialized();
    
    try {
      const feeData = await this.provider.getFeeData();
      return ethers.formatUnits(feeData.gasPrice || 0, 'gwei');
    } catch (error) {
      this.logger.error(`Failed to get gas price: ${error.message}`);
      throw new InternalServerErrorException('Failed to get gas price');
    }
  }

  async estimateGas(functionName: string, ...args: any[]): Promise<string> {
    await this.ensureInitialized();
    
    try {
      const gasEstimate = await this.contract[functionName].estimateGas(...args);
      return gasEstimate.toString();
    } catch (error) {
      this.logger.error(`Failed to estimate gas for ${functionName}: ${error.message}`);
      throw new InternalServerErrorException('Failed to estimate gas');
    }
  }

  async getBlockchainStats(): Promise<any> {
    await this.ensureInitialized();
    
    try {
      const [blockNumber, feeData, conservationCounter, supplyChainCounter, network] = await Promise.all([
        this.provider.getBlockNumber(),
        this.provider.getFeeData(),
        this.contract.getCurrentConservationCounter(),
        this.contract.getCurrentSupplyChainCounter(),
        this.provider.getNetwork()
      ]);

      return {
        currentBlock: blockNumber,
        gasPrice: ethers.formatUnits(feeData.gasPrice || 0, 'gwei'),
        maxFeePerGas: feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') : null,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') : null,
        totalConservationRecords: conservationCounter.toString(),
        totalSupplyChainRecords: supplyChainCounter.toString(),
        networkId: network.chainId.toString(),
        networkName: network.name,
        contractAddress: this.config.contractAddress,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Failed to get blockchain stats: ${error.message}`);
      throw new InternalServerErrorException('Failed to retrieve blockchain statistics');
    }
  }

  async getRecordCounts(): Promise<{ conservation: number; supplyChain: number }> {
    await this.ensureInitialized();
    
    try {
      const [conservationCount, supplyChainCount] = await this.contract.getRecordCounts();
      
      return {
        conservation: Number(conservationCount),
        supplyChain: Number(supplyChainCount)
      };
    } catch (error) {
      this.logger.error(`Failed to get record counts: ${error.message}`);
      throw new InternalServerErrorException('Failed to retrieve record counts');
    }
  }

  async getUserRecordCount(userAddress: string): Promise<number> {
    await this.ensureInitialized();
    
    try {
      const count = await this.contract.getUserRecordCount(userAddress);
      return Number(count);
    } catch (error) {
      this.logger.error(`Failed to get user record count: ${error.message}`);
      throw new InternalServerErrorException('Failed to retrieve user record count');
    }
  }

  // ===== ADMIN FUNCTIONS =====

  async grantRole(userAddress: string, role: string): Promise<string> {
    await this.ensureInitialized();
    
    try {
      this.logger.log(`Granting role ${role} to user: ${userAddress}`);
      
      const roleHash = ethers.keccak256(ethers.toUtf8Bytes(role));
      const gasEstimate = await this.contract.grantUserRole.estimateGas(userAddress, roleHash);
      const gasLimit = Math.floor(Number(gasEstimate) * 1.2);
      
      const tx = await this.contract.grantUserRole(userAddress, roleHash, {
        gasLimit,
        gasPrice: this.config.gasPrice ? ethers.parseUnits(this.config.gasPrice, 'gwei') : undefined
      });
      
      const receipt = await tx.wait();
      
      this.logger.log(`Role granted. Transaction hash: ${receipt.hash}`);
      return receipt.hash;
    } catch (error) {
      this.logger.error(`Failed to grant role: ${error.message}`);
      throw new InternalServerErrorException('Failed to grant role on blockchain');
    }
  }

  async revokeRole(userAddress: string, role: string): Promise<string> {
    await this.ensureInitialized();
    
    try {
      this.logger.log(`Revoking role ${role} from user: ${userAddress}`);
      
      const roleHash = ethers.keccak256(ethers.toUtf8Bytes(role));
      const gasEstimate = await this.contract.revokeUserRole.estimateGas(userAddress, roleHash);
      const gasLimit = Math.floor(Number(gasEstimate) * 1.2);
      
      const tx = await this.contract.revokeUserRole(userAddress, roleHash, {
        gasLimit,
        gasPrice: this.config.gasPrice ? ethers.parseUnits(this.config.gasPrice, 'gwei') : undefined
      });
      
      const receipt = await tx.wait();
      
      this.logger.log(`Role revoked. Transaction hash: ${receipt.hash}`);
      return receipt.hash;
    } catch (error) {
      this.logger.error(`Failed to revoke role: ${error.message}`);
      throw new InternalServerErrorException('Failed to revoke role on blockchain');
    }
  }

  // ===== HEALTH AND STATUS =====

  async isHealthy(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        return false;
      }
      
      // Test connection by getting current block
      await this.provider.getBlockNumber();
      return true;
    } catch (error) {
      this.logger.error(`Blockchain health check failed: ${error.message}`);
      return false;
    }
  }

  getConnectionStatus(): { 
    initialized: boolean; 
    contractAddress?: string; 
    networkName?: string; 
    blockNumber?: number 
  } {
    return {
      initialized: this.isInitialized,
      contractAddress: this.config.contractAddress,
      networkName: this.provider ? 'Sepolia' : undefined,
      blockNumber: undefined // Would need async call to get current block
    };
  }

  // ===== EVENT LISTENING =====

  async startEventListening(): Promise<void> {
    if (!this.isInitialized) {
      this.logger.warn('Cannot start event listening: blockchain service not initialized');
      return;
    }

    this.logger.log('Starting blockchain event listening...');

    // Listen for conservation record events
    this.contract.on('ConservationRecordCreated', (recordId, samplingId, researcher, dataHash, event) => {
      this.logger.log(`Conservation record created: ${samplingId} by ${researcher}`);
      // You can emit events to other services or update database here
    });

    this.contract.on('ConservationRecordVerified', (recordId, samplingId, verifier, event) => {
      this.logger.log(`Conservation record verified: ${samplingId} by ${verifier}`);
    });

    // Listen for supply chain record events
    this.contract.on('SupplyChainRecordCreated', (recordId, productId, creator, dataHash, initialStage, event) => {
      this.logger.log(`Supply chain record created: ${productId} by ${creator}`);
    });

    this.contract.on('SupplyChainStageUpdated', (recordId, productId, updatedBy, newStage, location, event) => {
      this.logger.log(`Supply chain stage updated: ${productId} to ${newStage} by ${updatedBy}`);
    });

    this.logger.log('Blockchain event listening started successfully');
  }

  async stopEventListening(): Promise<void> {
    if (this.contract) {
      this.contract.removeAllListeners();
      this.logger.log('Stopped blockchain event listening');
    }
  }
}
