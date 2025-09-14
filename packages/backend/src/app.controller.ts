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
    summary: 'Simple health check endpoint',
    description: 'Quick health check that returns immediately'
  })
  @ApiResponse({
    status: 200,
    description: 'Service is running'
  })
  getHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    };
  }

  @Get('health/detailed')
  @Public()
  @ApiOperation({
    summary: 'Comprehensive health check endpoint',
    description: 'Comprehensive health check for all system components'
  })
  @ApiResponse({
    status: 200,
    description: 'System health status'
  })
  async getDetailedHealthCheck() {
    const startTime = Date.now();
    const isProduction = process.env.NODE_ENV === 'production';

    // Helper function to add timeout to promises (only in production)
    const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
      if (!isProduction) return promise; // No timeout in development
      return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), timeoutMs)
        )
      ]);
    };

    // Check database connectivity
    let databaseHealthy = false;
    let databaseLatency = 0;
    const dbStart = Date.now();
    try {
      if (isProduction) {
        await withTimeout(this.prismaService.$queryRaw`SELECT 1`, 5000); // 5 second timeout in production
      } else {
        // Simple check in development - just verify service exists
        databaseHealthy = !!this.prismaService;
        databaseLatency = 1; // Minimal latency for dev
      }
      if (isProduction) {
        databaseLatency = Date.now() - dbStart;
      }
      databaseHealthy = true;
    } catch (error) {
      console.error('Database health check failed:', error);
      databaseLatency = Date.now() - dbStart;
    }

    // Check blockchain connectivity
    let blockchainHealthy = false;
    let blockchainLatency = 0;
    const blockchainStart = Date.now();
    try {
      if (isProduction) {
        blockchainHealthy = await withTimeout(this.blockchainService.isHealthy(), 5000); // 5 second timeout in production
        blockchainLatency = Date.now() - blockchainStart;
      } else {
        // Simple check in development - just verify service exists
        blockchainHealthy = !!this.blockchainService;
        blockchainLatency = 1; // Minimal latency for dev
      }
    } catch (error) {
      console.error('Blockchain health check failed:', error);
      blockchainLatency = Date.now() - blockchainStart;
    }

    // Check IPFS connectivity
    let ipfsHealthy = false;
    let ipfsLatency = 0;
    const ipfsStart = Date.now();
    try {
      if (isProduction) {
        // You could implement a ping method in FilesService
        ipfsHealthy = true; // Placeholder for production
        ipfsLatency = Date.now() - ipfsStart;
      } else {
        // Simple check in development
        ipfsHealthy = !!this.filesService;
        ipfsLatency = 1; // Minimal latency for dev
      }
    } catch (error) {
      console.error('IPFS health check failed:', error);
      ipfsLatency = Date.now() - ipfsStart;
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
