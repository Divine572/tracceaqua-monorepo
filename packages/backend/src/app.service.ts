import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) { }

  getApiInfo() {
    return {
      name: this.configService.get<string>('app.name'),
      version: this.configService.get<string>('app.version'),
      environment: this.configService.get<string>('app.environment'),
      description: 'Blockchain Seafood Traceability System API',
      documentation: '/api/docs',
      health: '/health',
      timestamp: new Date().toISOString(),
    };
  }

  async getHealthStatus() {
    const startTime = Date.now();

    // Check database health
    const isDatabaseHealthy = await this.prisma.isHealthy();

    const responseTime = Date.now() - startTime;

    return {
      status: isDatabaseHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      environment: this.configService.get<string>('app.environment'),
      version: this.configService.get<string>('app.version'),
      services: {
        database: {
          status: isDatabaseHealthy ? 'up' : 'down',
          responseTime: `${responseTime}ms`,
        },
        api: {
          status: 'up',
          uptime: process.uptime(),
        },
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        },
      },
    };
  }
}