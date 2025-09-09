
// packages/backend/src/app.service.ts (Enhanced)
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) { }

  getApiInfo() {
    return {
      name: 'TracceAqua API',
      version: '1.0.0',
      description: 'Blockchain Seafood Traceability System',
      environment: this.configService.get('NODE_ENV', 'development'),
      timestamp: new Date().toISOString(),
      documentation: '/api/docs',
      endpoints: {
        health: '/health',
        stats: '/stats',
        auth: '/api/auth',
        conservation: '/api/conservation',
        supplyChain: '/api/supply-chain',
        files: '/api/files',
        blockchain: '/api/blockchain',
        admin: '/api/admin',
      },
      features: {
        blockchain: true,
        ipfs: true,
        authentication: true,
        roleBasedAccess: true,
        fileUpload: true,
        qrCodeGeneration: true,
        consumerFeedback: true,
      },
    };
  }

  async getSystemStats() {
    const [
      totalUsers,
      totalConservationRecords,
      totalSupplyChainRecords,
      totalRoleApplications,
      recentActivity,
    ] = await Promise.all([
      this.prismaService.user.count(),
      this.prismaService.conservationRecord.count(),
      this.prismaService.supplyChainRecord.count(),
      this.prismaService.roleApplication.count(),
      this.getRecentActivity(),
    ]);

    return {
      users: {
        total: totalUsers,
      },
      records: {
        conservation: totalConservationRecords,
        supplyChain: totalSupplyChainRecords,
        total: totalConservationRecords + totalSupplyChainRecords,
      },
      applications: {
        total: totalRoleApplications,
      },
      activity: recentActivity,
      system: {
        uptime: process.uptime(),
        nodeVersion: process.version,
        environment: this.configService.get('NODE_ENV', 'development'),
        timestamp: new Date().toISOString(),
      },
    };
  }

  private async getRecentActivity() {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      usersLast24h,
      usersLast7d,
      conservationRecordsLast24h,
      supplyChainRecordsLast24h,
      conservationRecordsLast7d,
      supplyChainRecordsLast7d,
    ] = await Promise.all([
      this.prismaService.user.count({
        where: { createdAt: { gte: last24Hours } },
      }),
      this.prismaService.user.count({
        where: { createdAt: { gte: last7Days } },
      }),
      this.prismaService.conservationRecord.count({
        where: { createdAt: { gte: last24Hours } },
      }),
      this.prismaService.supplyChainRecord.count({
        where: { createdAt: { gte: last24Hours } },
      }),
      this.prismaService.conservationRecord.count({
        where: { createdAt: { gte: last7Days } },
      }),
      this.prismaService.supplyChainRecord.count({
        where: { createdAt: { gte: last7Days } },
      }),
    ]);

    return {
      last24Hours: {
        newUsers: usersLast24h,
        newRecords: conservationRecordsLast24h + supplyChainRecordsLast24h,
      },
      last7Days: {
        newUsers: usersLast7d,
        newRecords: conservationRecordsLast7d + supplyChainRecordsLast7d,
      },
    };
  }
}