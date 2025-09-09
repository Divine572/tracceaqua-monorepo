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
      environment: this.configService.get('app.nodeEnv', 'development'),
      timestamp: new Date().toISOString(),
      documentation: '/docs',
      endpoints: {
        health: '/health',
        stats: '/stats',
        auth: '/api/auth',
        admin: '/api/admin',
        conservation: '/api/conservation',
        supplyChain: '/api/supply-chain',
        files: '/api/files',
        blockchain: '/api/blockchain',
        roleApplications: '/api/role-applications',
      },
      features: {
        blockchain: 'Ethereum Sepolia Testnet',
        ipfs: 'Pinata IPFS Storage',
        authentication: 'JWT + Wallet Signatures',
        roleBasedAccess: 'Multi-role permission system',
        fileUpload: 'IPFS distributed storage',
        qrCodeGeneration: 'Product tracing QR codes',
        consumerFeedback: 'Public product feedback',
        realTimeMonitoring: 'Blockchain event listening',
      },
    };
  }

  async getSystemStats() {
    try {
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
          breakdown: await this.getUserBreakdown(),
        },
        records: {
          conservation: totalConservationRecords,
          supplyChain: totalSupplyChainRecords,
          total: totalConservationRecords + totalSupplyChainRecords,
        },
        applications: {
          total: totalRoleApplications,
          pending: await this.prismaService.roleApplication.count({
            where: { status: 'PENDING' }
          }),
        },
        activity: recentActivity,
        system: {
          uptime: process.uptime(),
          nodeVersion: process.version,
          environment: this.configService.get('app.nodeEnv', 'development'),
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        error: 'Failed to retrieve system statistics',
        timestamp: new Date().toISOString(),
      };
    }
  }

  private async getUserBreakdown() {
    const usersByRole = await this.prismaService.user.groupBy({
      by: ['role'],
      _count: { role: true },
    });

    return usersByRole.reduce((acc, item) => {
      acc[item.role.toLowerCase()] = item._count.role;
      return acc;
    }, {});
  }


  private async getRecentActivity() {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [last24h, last7d] = await Promise.all([
      Promise.all([
        this.prismaService.user.count({ where: { createdAt: { gte: last24Hours } } }),
        this.prismaService.conservationRecord.count({ where: { createdAt: { gte: last24Hours } } }),
        this.prismaService.supplyChainRecord.count({ where: { createdAt: { gte: last24Hours } } }),
      ]),
      Promise.all([
        this.prismaService.user.count({ where: { createdAt: { gte: last7Days } } }),
        this.prismaService.conservationRecord.count({ where: { createdAt: { gte: last7Days } } }),
        this.prismaService.supplyChainRecord.count({ where: { createdAt: { gte: last7Days } } }),
      ]),
    ]);

    return {
      last24Hours: {
        newUsers: last24h[0],
        conservationRecords: last24h[1],
        supplyChainRecords: last24h[2],
      },
      last7Days: {
        newUsers: last7d[0],
        conservationRecords: last7d[1],
        supplyChainRecords: last7d[2],
      },
    };
  }
}