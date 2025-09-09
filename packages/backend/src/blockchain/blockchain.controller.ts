import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BlockchainService } from './blockchain.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('Blockchain')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Get('stats')
  @ApiOperation({
    summary: 'Get blockchain statistics',
    description: 'Retrieve current blockchain network statistics and contract information'
  })
  @ApiResponse({
    status: 200,
    description: 'Blockchain statistics retrieved successfully'
  })
  async getStats() {
    return this.blockchainService.getBlockchainStats();
  }

  @Get('health')
  @ApiOperation({
    summary: 'Check blockchain service health',
    description: 'Check if the blockchain service is connected and functioning'
  })
  @ApiResponse({
    status: 200,
    description: 'Health status retrieved successfully'
  })
  async getHealth() {
    const isHealthy = await this.blockchainService.isHealthy();
    const status = this.blockchainService.getConnectionStatus();
    
    return {
      healthy: isHealthy,
      ...status,
      timestamp: new Date().toISOString()
    };
  }

  @Get('gas-price')
  @ApiOperation({
    summary: 'Get current gas price',
    description: 'Get the current gas price on the network'
  })
  async getGasPrice() {
    const gasPrice = await this.blockchainService.getGasPrice();
    return { gasPrice: `${gasPrice} gwei` };
  }

  @Get('records/count')
  @ApiOperation({
    summary: 'Get total record counts',
    description: 'Get total conservation and supply chain records on blockchain'
  })
  async getRecordCounts() {
    return this.blockchainService.getRecordCounts();
  }

  @Get('conservation/:samplingId')
  @ApiOperation({
    summary: 'Get conservation record from blockchain',
    description: 'Retrieve a conservation record directly from the blockchain'
  })
  async getConservationRecord(@Param('samplingId') samplingId: string) {
    return this.blockchainService.getConservationRecord(samplingId);
  }

  @Get('supply-chain/:productId')
  @ApiOperation({
    summary: 'Get supply chain record from blockchain',
    description: 'Retrieve a supply chain record directly from the blockchain'
  })
  async getSupplyChainRecord(@Param('productId') productId: string) {
    return this.blockchainService.getSupplyChainRecord(productId);
  }

  @Post('verify-integrity')
  @ApiOperation({
    summary: 'Verify data integrity',
    description: 'Verify that data hasn\'t been tampered with by checking blockchain'
  })
  async verifyIntegrity(@Body() body: { dataHash: string; blockchainHash: string }) {
    const isValid = await this.blockchainService.verifyDataIntegrity(body.dataHash, body.blockchainHash);
    return { valid: isValid };
  }

  @Post('grant-role')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Grant blockchain role to user',
    description: 'Grant a blockchain role to a user (Admin only)'
  })
  async grantRole(@Body() body: { userAddress: string; role: string }) {
    const txHash = await this.blockchainService.grantRole(body.userAddress, body.role);
    return { transactionHash: txHash };
  }

  @Post('revoke-role')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Revoke blockchain role from user',
    description: 'Revoke a blockchain role from a user (Admin only)'
  })
  async revokeRole(@Body() body: { userAddress: string; role: string }) {
    const txHash = await this.blockchainService.revokeRole(body.userAddress, body.role);
    return { transactionHash: txHash };
  }
}
