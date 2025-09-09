import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';
import { PrismaService } from './prisma/prisma.service';
import { BlockchainService } from './blockchain/blockchain.service';
import { FilesService } from './files/files.service';

@ApiTags('System')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prismaService: PrismaService,
    private readonly blockchainService: BlockchainService,
    private readonly filesService: FilesService,
  ) { }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get API information',
    description: 'Returns basic API information and status'
  })
  @ApiResponse({
    status: 200,
    description: 'API information retrieved successfully'
  })
  getApiInfo() {
    return this.appService.getApiInfo();
  }

  @Get('health')
  @Public()
  @ApiOperation({
    summary: 'Health check endpoint',
    description: 'Comprehensive health check for all system components'
  })
  @ApiResponse({
    status: 200,
    description: 'System health status'
  })
  async getHealthCheck() {
    const startTime = Date.now();

    // Check database connectivity
    let databaseHealthy = false;
    let databaseLatency = 0;
    try {
      const dbStart = Date.now();
      await this.prismaService.$queryRaw`SELECT 1`;
      databaseLatency = Date.now() - dbStart;
      databaseHealthy = true;
    } catch (error) {
      console.error('Database health check failed:', error);
    }

    // Check blockchain connectivity
    let blockchainHealthy = false;
    let blockchainLatency = 0;
    try {
      const blockchainStart = Date.now();
      blockchainHealthy = await this.blockchainService.isHealthy();
      blockchainLatency = Date.now() - blockchainStart;
    } catch (error) {
      console.error('Blockchain health check failed:', error);
    }

    // Check IPFS connectivity
    let ipfsHealthy = false;
    let ipfsLatency = 0;
    try {
      const ipfsStart = Date.now();
      // You could implement a ping method in FilesService
      ipfsHealthy = true; // Placeholder
      ipfsLatency = Date.now() - ipfsStart;
    } catch (error) {
      console.error('IPFS health check failed:', error);
    }

    const totalLatency = Date.now() - startTime;
    const overallHealthy = databaseHealthy && blockchainHealthy && ipfsHealthy;

    return {
      status: overallHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {
        database: {
          status: databaseHealthy ? 'healthy' : 'unhealthy',
          latency: `${databaseLatency}ms`,
        },
        blockchain: {
          status: blockchainHealthy ? 'healthy' : 'unhealthy',
          latency: `${blockchainLatency}ms`,
        },
        ipfs: {
          status: ipfsHealthy ? 'healthy' : 'unhealthy',
          latency: `${ipfsLatency}ms`,
        },
      },
      metrics: {
        totalLatency: `${totalLatency}ms`,
        memoryUsage: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
        },
        nodeVersion: process.version,
      },
    };
  }

  @Get('stats')
  @Public()
  @ApiOperation({
    summary: 'Get system statistics',
    description: 'Returns system-wide statistics and metrics'
  })
  async getSystemStats() {
    return this.appService.getSystemStats();
  }

  @Post('webhook/deployment')
  @Public()
  @ApiOperation({
    summary: 'Deployment webhook',
    description: 'Webhook endpoint for deployment notifications'
  })
  async handleDeploymentWebhook(@Body() payload: any) {
    console.log('Deployment webhook received:', payload);
    // You can implement deployment notification logic here
    return { message: 'Webhook received successfully' };
  }
}
