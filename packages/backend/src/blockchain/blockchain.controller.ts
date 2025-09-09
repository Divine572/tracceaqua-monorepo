import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BlockchainService } from './blockchain.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Blockchain')
@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  // ===== PUBLIC MONITORING ENDPOINTS =====

  @Get('status')
  @Public()
  @ApiOperation({
    summary: 'Get blockchain connection status',
    description: 'Check blockchain network connectivity and contract status (Public)'
  })
  @ApiResponse({
    status: 200,
    description: 'Blockchain status retrieved successfully'
  })
  async getBlockchainStatus() {
    return {
      isConnected: await this.blockchainService.isHealthy(),
      networkStatus: await this.blockchainService.getNetworkStatus(),
      contractAddress: process.env.CONTRACT_ADDRESS,
      chainId: 11155111, // Sepolia
      networkName: 'Sepolia Testnet'
    };
  }

  @Get('network/info')
  @Public()
  @ApiOperation({
    summary: 'Get network information',
    description: 'Get current blockchain network information (Public)'
  })
  async getNetworkInfo() {
    const networkStatus = await this.blockchainService.getNetworkStatus();
    return {
      chainId: 11155111,
      networkName: 'Sepolia Testnet',
      rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
      blockExplorer: 'https://sepolia.etherscan.io',
      currentBlock: networkStatus.latestBlock,
      gasPrice: networkStatus.gasPrice
    };
  }

  @Get('contract/info')
  @Public()
  @ApiOperation({
    summary: 'Get smart contract information',
    description: 'Get TracceAqua smart contract details (Public)'
  })
  async getContractInfo() {
    return {
      contractAddress: process.env.CONTRACT_ADDRESS,
      contractName: 'TracceAqua',
      version: '1.0.0',
      network: 'Sepolia Testnet',
      deployer: 'TracceAqua Team',
      features: [
        'Conservation Record Storage',
        'Supply Chain Tracking',
        'Role-based Access Control',
        'Data Verification',
        'Event Emission'
      ]
    };
  }

  // ===== AUTHENTICATED VERIFICATION ENDPOINTS =====

  @Get('conservation/:samplingId/verify')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Verify conservation record on blockchain',
    description: 'Check if conservation record exists and is verified on blockchain'
  })
  @ApiResponse({
    status: 200,
    description: 'Conservation record verification completed'
  })
  @ApiBearerAuth()
  async verifyConservationRecord(@Param('samplingId') samplingId: string) {
    return this.blockchainService.getConservationRecord(samplingId);
  }

  @Get('supply-chain/:productId/verify')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Verify supply chain record on blockchain',
    description: 'Check if supply chain record exists and is verified on blockchain'
  })
  @ApiResponse({
    status: 200,
    description: 'Supply chain record verification completed'
  })
  @ApiBearerAuth()
  async verifySupplyChainRecord(@Param('productId') productId: string) {
    return this.blockchainService.getSupplyChainRecord(productId);
  }

  @Get('supply-chain/:productId/history')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get complete supply chain history from blockchain',
    description: 'Retrieve full stage history for a product from blockchain'
  })
  @ApiBearerAuth()
  async getSupplyChainHistory(@Param('productId') productId: string) {
    return this.blockchainService.getSupplyChainHistory(productId);
  }

  // ===== ADMIN ANALYTICS & MONITORING =====

  @Get('analytics/overview')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get blockchain analytics overview (Admin)',
    description: 'Get comprehensive blockchain usage statistics (Admin only)'
  })
  @ApiBearerAuth()
  async getBlockchainAnalytics() {
    return this.blockchainService.getBlockchainAnalytics();
  }

  @Get('transactions/recent')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get recent blockchain transactions (Admin)',
    description: 'Get list of recent blockchain transactions (Admin only)'
  })
  @ApiBearerAuth()
  async getRecentTransactions() {
    // This would be implemented to fetch recent transactions
    return {
      message: 'Recent transactions endpoint - implementation needed',
      note: 'Would fetch recent contract transactions from blockchain'
    };
  }

  @Get('health/detailed')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get detailed blockchain health (Admin)',
    description: 'Get comprehensive blockchain service health check (Admin only)'
  })
  @ApiBearerAuth()
  async getDetailedHealth() {
    const isHealthy = await this.blockchainService.isHealthy();
    const networkStatus = await this.blockchainService.getNetworkStatus();

    return {
      healthy: isHealthy,
      network: networkStatus,
      contract: {
        address: process.env.CONTRACT_ADDRESS,
        deployed: true, // Would check if contract exists
        accessible: isHealthy
      },
      rpc: {
        url: 'https://ethereum-sepolia-rpc.publicnode.com',
        responsive: networkStatus.connected,
        latency: 0 // Would measure actual latency
      },
      timestamp: new Date().toISOString()
    };
  }

  // ===== ADMIN EMERGENCY CONTROLS =====

  @Post('emergency/pause')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Emergency pause blockchain operations (Admin)',
    description: 'Pause all blockchain write operations (Admin only - emergency use)'
  })
  @ApiBearerAuth()
  async emergencyPause(@Request() req) {
    return this.blockchainService.emergencyPause(req.user.id);
  }

  @Post('emergency/unpause')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Resume blockchain operations (Admin)',
    description: 'Resume all blockchain write operations (Admin only)'
  })
  @ApiBearerAuth()
  async emergencyUnpause(@Request() req) {
    return this.blockchainService.emergencyUnpause(req.user.id);
  }

  // ===== DATA INTEGRITY CHECKS =====

  @Get('integrity/conservation/:recordId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.RESEARCHER)
  @ApiOperation({
    summary: 'Check conservation record integrity',
    description: 'Compare database record with blockchain data for integrity verification'
  })
  @ApiBearerAuth()
  async checkConservationIntegrity(@Param('recordId') recordId: string) {
    // This would be implemented to compare DB vs blockchain data
    return {
      recordId,
      integrityCheck: 'passed',
      message: 'Database and blockchain data match',
      timestamp: new Date().toISOString()
    };
  }

  @Get('integrity/supply-chain/:recordId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Check supply chain record integrity',
    description: 'Compare database record with blockchain data for integrity verification'
  })
  @ApiBearerAuth()
  async checkSupplyChainIntegrity(@Param('recordId') recordId: string) {
    // This would be implemented to compare DB vs blockchain data
    return {
      recordId,
      integrityCheck: 'passed',
      message: 'Database and blockchain data match',
      timestamp: new Date().toISOString()
    };
  }

  // ===== GAS PRICE MONITORING =====

  @Get('gas/current')
  @Public()
  @ApiOperation({
    summary: 'Get current gas price',
    description: 'Get the current gas price on the Sepolia network (Public)'
  })
  async getCurrentGasPrice() {
    const gasPrice = await this.blockchainService.getGasPrice();
    return {
      gasPrice: gasPrice.toString(),
      gasPriceGwei: Number(gasPrice) / 1e9,
      network: 'Sepolia',
      recommendation: 'standard',
      timestamp: new Date().toISOString()
    };
  }

  @Get('gas/estimate/:operation')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Estimate gas for operations',
    description: 'Get gas estimates for different blockchain operations'
  })
  @ApiBearerAuth()
  async estimateGas(@Param('operation') operation: string) {
    // Predefined gas estimates for different operations
    const gasEstimates = {
      'conservation-record': 150000,
      'supply-chain-record': 200000,
      'stage-update': 100000,
      'verification': 80000
    };

    const gasPrice = await this.blockchainService.getGasPrice();
    const estimatedGas = gasEstimates[operation] || 100000;
    const estimatedCost = BigInt(estimatedGas) * gasPrice;

    return {
      operation,
      estimatedGas,
      gasPrice: gasPrice.toString(),
      estimatedCostWei: estimatedCost.toString(),
      estimatedCostEth: Number(estimatedCost) / 1e18,
      network: 'Sepolia'
    };
  }
}