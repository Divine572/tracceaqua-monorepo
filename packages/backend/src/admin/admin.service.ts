import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    Logger
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FilesService } from '../files/files.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import * as ExcelJS from 'exceljs';
import * as Papa from 'papaparse';

import { UserRole } from '../common/enums/user-role.enum';
import { UserStatus } from '../common/enums/user-status.enum';

import {
    UserSummaryDto,
    SystemStatsDto,
    SystemHealthDto,
    PaginatedLogsDto,
    GetSystemLogsDto,
    AnalyticsQueryDto,
    ExportDataDto,
    BulkUserActionDto,
    ReviewRoleApplicationDto,
    BulkApplicationActionDto,
    SystemConfigDto
} from './dto/admin.dto';


@Injectable()
export class AdminService {
    private readonly logger = new Logger(AdminService.name);

    constructor(
        private readonly prismaService: PrismaService,
        private readonly filesService: FilesService,
        private readonly blockchainService: BlockchainService,
    ) { }

    // ===== USER MANAGEMENT =====

    async getAllUsers(page: number = 1, limit: number = 20, filters?: any): Promise<any> {
        try {
            const skip = (page - 1) * limit;

            const where: any = {};
            if (filters?.role) where.role = filters.role;
            if (filters?.status) where.status = filters.status;
            if (filters?.search) {
                where.OR = [
                    { address: { contains: filters.search, mode: 'insensitive' } },
                    { email: { contains: filters.search, mode: 'insensitive' } },
                    {
                        profile: {
                            OR: [
                                { firstName: { contains: filters.search, mode: 'insensitive' } },
                                { lastName: { contains: filters.search, mode: 'insensitive' } },
                                { organization: { contains: filters.search, mode: 'insensitive' } }
                            ]
                        }
                    }
                ];
            }

            const [total, users] = await Promise.all([
                this.prismaService.user.count({ where }),
                this.prismaService.user.findMany({
                where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                include: {
                    profile: true,
                    _count: {
                        select: {
                            conservationRecords: true,
                            supplyChainRecords: true,
                            roleApplications: true
                        }
                    }
                    }
                })
        ]);

            const totalPages = Math.ceil(total / limit);

            return {
                data: users.map(user => ({
                    id: user.id,
                    address: user.address,
                    email: user.email,
                    role: user.role,
            status: user.status,
                    createdAt: user.createdAt,
                    lastActive: user.updatedAt, // Placeholder
            profile: user.profile ? {
                firstName: user.profile.firstName,
                lastName: user.profile.lastName,
                organization: user.profile.organization
            } : undefined,
                    stats: {
                        conservationRecords: user._count.conservationRecords,
                        supplyChainRecords: user._count.supplyChainRecords,
                        roleApplications: user._count.roleApplications
                    }
                })),
            total,
                page,
                limit,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
        };

        } catch (error) {
            this.logger.error('Failed to get users:', error);
            throw error;
        }
    }

    async updateUserRole(
        adminId: string,
        userId: string,
        newRole: UserRole,
        reason?: string
    ): Promise<UserSummaryDto> {
        try {
            const user = await this.prismaService.user.findUnique({
                where: { id: userId },
                include: { profile: true }
            });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.role === newRole) {
            throw new BadRequestException('User already has this role');
        }

        // Update user role
            const updatedUser = await this.prismaService.user.update({
            where: { id: userId },
                data: {
                    role: newRole,
                    status: 'ACTIVE' // Activate user when role is approved
                },
            include: {
                profile: true,
                _count: {
                    select: {
                        conservationRecords: true,
                        supplyChainRecords: true,
                        roleApplications: true
                    }
                }
            }
        });

            // Log admin action
            await this.logAdminAction(adminId, userId, 'ROLE_UPDATE',
                `Role updated from ${user.role} to ${newRole}`, {
                previousRole: user.role,
                newRole,
                reason
            });

            this.logger.log(`Admin ${adminId} updated user ${userId} role from ${user.role} to ${newRole}`);

            return this.mapUserToSummary(updatedUser);

        } catch (error) {
            this.logger.error('Failed to update user role:', error);
            throw error;
        }
    }

    async updateUserStatus(
        adminId: string,
        userId: string,
        newStatus: UserStatus,
        reason?: string
    ): Promise<UserSummaryDto> {
        try {
            const user = await this.prismaService.user.findUnique({
                where: { id: userId },
                include: { profile: true }
            });

        if (!user) {
            throw new NotFoundException('User not found');
        }

            if (user.role === 'ADMIN' && newStatus !== 'ACTIVE') {
                throw new ForbiddenException('Cannot suspend or ban admin users');
            }

            const updatedUser = await this.prismaService.user.update({
            where: { id: userId },
                data: { status: newStatus as any },
            include: {
                profile: true,
                _count: {
                    select: {
                        conservationRecords: true,
                            supplyChainRecords: true,
                            roleApplications: true
                        }
                    }
                }
            });

            // Log admin action
            await this.logAdminAction(adminId, userId, 'STATUS_UPDATE',
                `Status updated from ${user.status} to ${newStatus}`, {
                previousStatus: user.status,
                newStatus,
                reason
            });

            this.logger.log(`Admin ${adminId} updated user ${userId} status from ${user.status} to ${newStatus}`);

            return this.mapUserToSummary(updatedUser);

        } catch (error) {
            this.logger.error('Failed to update user status:', error);
            throw error;
        }
    }

    async bulkUserAction(
        adminId: string,
        userIds: string[],
        action: 'activate' | 'suspend' | 'delete',
        reason?: string
    ): Promise<{ success: number; failed: number; errors: string[] }> {
        let success = 0;
        let failed = 0;
        const errors: string[] = [];

        for (const userId of userIds) {
            try {
                const user = await this.prismaService.user.findUnique({ where: { id: userId } });
                if (!user) {
                    errors.push(`User ${userId} not found`);
                    failed++;
                    continue;
                }

                if (user.role === 'ADMIN' && action !== 'activate') {
                    errors.push(`Cannot ${action} admin user ${userId}`);
                    failed++;
                    continue;
                }

                switch (action) {
                    case 'activate':
                        await this.prismaService.user.update({
                            where: { id: userId },
                            data: { status: 'ACTIVE' }
                        });
                        break;
                    case 'suspend':
                        await this.prismaService.user.update({
                            where: { id: userId },
                            data: { status: 'SUSPENDED' }
                        });
                        break;
                    case 'delete':
                        await this.prismaService.user.delete({ where: { id: userId } });
                        break;
                }

                await this.logAdminAction(adminId, userId, `BULK_${action.toUpperCase()}`,
                    `Bulk ${action} performed`, { reason });

                success++;

            } catch (error) {
                errors.push(`Failed to ${action} user ${userId}: ${error.message}`);
                failed++;
            }
        }

        this.logger.log(`Bulk ${action} completed: ${success} success, ${failed} failed`);

        return { success, failed, errors };
    }

    // ===== ROLE APPLICATION MANAGEMENT =====

    async getPendingRoleApplications(limit: number = 50): Promise<any[]> {
        try {
            const applications = await this.prismaService.roleApplication.findMany({
                where: { status: 'PENDING' },
                take: limit,
                orderBy: { createdAt: 'asc' },
                include: {
                    user: {
                        include: { profile: true }
                    }
                }
            });

            return applications.map(app => ({
                id: app.id,
                userId: app.userId,
                requestedRole: app.requestedRole,
                status: app.status,
                organization: app.organization,
                licenseNumber: app.licenseNumber,
                businessType: app.businessType,
                experience: app.experience,
                motivation: app.motivation,
                documents: app.documents,
                createdAt: app.createdAt,
                user: {
                    id: app.user.id,
                    address: app.user.address,
                    email: app.user.email,
                    profile: app.user.profile
                }
            }));

        } catch (error) {
            this.logger.error('Failed to get pending applications:', error);
            throw error;
        }
    }

    async reviewRoleApplication(
        adminId: string,
        applicationId: string,
        action: 'approve' | 'reject',
        feedback?: string,
        approvedRole?: UserRole
    ): Promise<any> {
        try {
            const application = await this.prismaService.roleApplication.findUnique({
                where: { id: applicationId },
                include: { user: true }
            });

        if (!application) {
            throw new NotFoundException('Role application not found');
        }

            if (application.status !== 'PENDING') {
            throw new BadRequestException('Application has already been reviewed');
        }

            const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
            const finalRole = approvedRole || application.requestedRole;

        // Update application
            const updatedApplication = await this.prismaService.roleApplication.update({
            where: { id: applicationId },
            data: {
                status: newStatus,
                reviewedBy: adminId,
                adminFeedback: feedback,
                reviewedAt: new Date()
            },
            include: {
                user: { include: { profile: true } }
            }
        });

        // If approved, update user role
        if (action === 'approve') {
            await this.prismaService.user.update({
                where: { id: application.userId },
                data: {
                    role: finalRole,
                    status: 'ACTIVE'
                }
            });
        }

            // Log admin action
            await this.logAdminAction(adminId, application.userId, 'APPLICATION_REVIEW',
                `Application ${action}d for role: ${application.requestedRole}`, {
                applicationId,
                action,
                requestedRole: application.requestedRole,
                approvedRole: finalRole,
                feedback
            });

            this.logger.log(`Admin ${adminId} ${action}d application ${applicationId} for user ${application.userId}`);

        return updatedApplication;

        } catch (error) {
            this.logger.error('Failed to review application:', error);
            throw error;
        }
    }

    // ===== SYSTEM ANALYTICS =====

    async getSystemStats(): Promise<SystemStatsDto> {
        try {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            const [
                userStats,
                conservationStats,
                supplyChainStats,
                applicationStats,
                blockchainStats
            ] = await Promise.all([
                this.getUserStats(startOfMonth),
                this.getConservationStats(startOfMonth),
                this.getSupplyChainStats(startOfMonth),
                this.getApplicationStats(),
                this.getBlockchainStats()
            ]);

            return {
                users: userStats,
                content: {
                    conservationRecords: conservationStats,
                    supplyChainRecords: supplyChainStats,
                    roleApplications: applicationStats
                },
                blockchain: blockchainStats,
                performance: await this.getPerformanceStats(),
                storage: await this.getStorageStats()
            };

        } catch (error) {
            this.logger.error('Failed to get system stats:', error);
            throw error;
        }
    }

    async getAnalytics(query: AnalyticsQueryDto): Promise<any> {
        try {
            const { startDate, endDate, groupBy = 'day', userRole } = query;

            const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to last 30 days
            const end = endDate ? new Date(endDate) : new Date();

            const where: any = {
                createdAt: { gte: start, lte: end }
            };
            if (userRole) where.role = userRole;

            // Get user registrations over time
            const userRegistrations = await this.prismaService.user.groupBy({
                by: ['createdAt'],
                where: {
                    createdAt: { gte: start, lte: end },
                    ...(userRole && { role: userRole })
                },
                _count: { id: true }
            });

            // Get content creation metrics
            const [conservationRecords, supplyChainRecords] = await Promise.all([
                this.prismaService.conservationRecord.groupBy({
                    by: ['createdAt'],
                    where: { createdAt: { gte: start, lte: end } },
                    _count: { id: true }
                }),
                this.prismaService.supplyChainRecord.groupBy({
                    by: ['createdAt'],
                    where: { createdAt: { gte: start, lte: end } },
                    _count: { id: true }
                })
            ]);

            // Get system usage metrics (admin actions as proxy)
            const systemUsage = await this.prismaService.adminAction.groupBy({
                by: ['createdAt'],
                where: { createdAt: { gte: start, lte: end } },
                _count: { id: true }
            });

            // Group data by the requested time period
            const groupData = (data: any[], dateField: string) => {
                const grouped = new Map();

                data.forEach(item => {
                    const date = new Date(item[dateField]);
                    let key: string;

                    if (groupBy === 'day') {
                        key = date.toISOString().split('T')[0];
                    } else if (groupBy === 'week') {
                        const weekStart = new Date(date);
                        weekStart.setDate(date.getDate() - date.getDay());
                        key = weekStart.toISOString().split('T')[0];
                    } else if (groupBy === 'month') {
                        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    } else {
                        key = date.toISOString().split('T')[0];
                    }

                    grouped.set(key, (grouped.get(key) || 0) + item._count.id);
                });

                return Array.from(grouped.entries()).map(([date, count]) => ({
                    date,
                    count
                })).sort((a, b) => a.date.localeCompare(b.date));
            };

            return {
                userRegistrations: groupData(userRegistrations, 'createdAt'),
                contentCreation: {
                    conservation: groupData(conservationRecords, 'createdAt'),
                    supplyChain: groupData(supplyChainRecords, 'createdAt')
                },
                blockchainActivity: await this.getBlockchainActivityData(start, end),
                systemUsage: groupData(systemUsage, 'createdAt'),
                period: {
                    startDate: start,
                    endDate: end,
                    groupBy
                }
            };

        } catch (error) {
            this.logger.error('Failed to get analytics:', error);
            throw error;
        }
    }

    // ===== DATA EXPORT =====

    async exportData(exportDto: ExportDataDto): Promise<Buffer> {
        try {
            const { dataType, format = 'csv', startDate, endDate, includeSensitive = false } = exportDto;

            const where: any = {};
            if (startDate) where.createdAt = { gte: new Date(startDate) };
            if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate) };

            let data: any[] = [];

            switch (dataType) {
                case 'users':
                    data = await this.exportUsers(where, includeSensitive);
                break;
                case 'conservation':
                    data = await this.exportConservationRecords(where);
                break;
                case 'supply_chain':
                    data = await this.exportSupplyChainRecords(where);
                    break;
                case 'feedback':
                    data = await this.exportFeedback(where);
                    break;
                case 'all':
                    // Export all data types - for now return empty
                    data = [];
                    break;
                default:
                    data = [];
                break;
        }

            if (format === 'csv') {
                return Buffer.from(Papa.unparse(data));
            } else if (format === 'xlsx') {
                return this.generateExcelFile(data, dataType);
            } else if (format === 'json') {
                return Buffer.from(JSON.stringify(data, null, 2));
            } else {
                return Buffer.from(Papa.unparse(data)); // Default to CSV
            }

        } catch (error) {
            this.logger.error('Failed to export data:', error);
            throw error;
        }
    }

    // ===== SYSTEM MONITORING =====

    async getSystemHealth(): Promise<SystemHealthDto> {
        try {
            const [databaseHealth, blockchainHealth, ipfsHealth, externalApisHealth] = await Promise.all([
                this.checkDatabaseHealth(),
                this.checkBlockchainHealth(),
                this.checkIPFSHealth(),
                this.checkExternalApisHealth()
            ]);

            const overall = databaseHealth && blockchainHealth && ipfsHealth && externalApisHealth;

            return {
                database: databaseHealth,
                blockchain: blockchainHealth,
                ipfs: ipfsHealth,
                externalApis: externalApisHealth,
                overall,
                uptime: process.uptime(),
                memoryUsage: {
                    used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                    total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                    percentage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100)
                },
                timestamp: new Date()
            };

        } catch (error) {
            this.logger.error('Failed to get system health:', error);
            throw error;
        }
    }

    async getSystemLogs(query: GetSystemLogsDto): Promise<PaginatedLogsDto> {
        try {
            const { page = 1, limit = 50, level, adminId, action, startDate, endDate } = query;
            const skip = (page - 1) * limit;

            const where: any = {};
            if (adminId) where.adminId = adminId;
            if (action) where.action = { contains: action, mode: 'insensitive' };
            if (startDate) where.createdAt = { gte: new Date(startDate) };
            if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate) };

            const [total, logs] = await Promise.all([
                this.prismaService.adminAction.count({ where }),
                this.prismaService.adminAction.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        admin: { include: { profile: true } }
                    }
                })
            ]);

            const totalPages = Math.ceil(total / limit);

            return {
                data: logs.map(log => ({
                    id: log.id,
                    adminId: log.adminId,
                    targetId: log.targetId || undefined,
                    action: log.action,
                    description: log.description || undefined,
                    metadata: log.metadata,
                    createdAt: log.createdAt,
                    admin: {
                        id: log.admin.id,
                        address: log.admin.address,
                        profile: log.admin.profile ? {
                            firstName: log.admin.profile.firstName || undefined,
                            lastName: log.admin.profile.lastName || undefined
                        } : undefined
                    }
                })),
                total,
                page,
                limit,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            };

        } catch (error) {
            this.logger.error('Failed to get system logs:', error);
            throw error;
        }
    }

    // ===== PRIVATE UTILITY METHODS =====

    private async logAdminAction(
        adminId: string,
        targetId: string,
        action: string,
        description?: string,
        metadata?: any
    ): Promise<void> {
        try {
            await this.prismaService.adminAction.create({
                data: {
                    adminId,
                    targetId,
                    action,
                    description,
                    metadata: metadata || {}
                }
            });
        } catch (error) {
            this.logger.error('Failed to log admin action:', error);
        }
    }

    private mapUserToSummary(user: any): UserSummaryDto {
        return {
            id: user.id,
            address: user.address,
            email: user.email,
            role: user.role,
            status: user.status,
            createdAt: user.createdAt,
            lastActive: user.updatedAt,
            profile: user.profile ? {
                firstName: user.profile.firstName,
                lastName: user.profile.lastName,
                organization: user.profile.organization
            } : undefined,
            stats: {
                conservationRecords: user._count?.conservationRecords || 0,
                supplyChainRecords: user._count?.supplyChainRecords || 0,
                roleApplications: user._count?.roleApplications || 0
            }
        };
    }

    private async getUserStats(startOfMonth: Date): Promise<any> {
        const [total, active, pending, suspended, newThisMonth, byRole] = await Promise.all([
            this.prismaService.user.count(),
            this.prismaService.user.count({ where: { status: 'ACTIVE' } }),
            this.prismaService.user.count({ where: { status: UserStatus.PENDING as any } }),
            this.prismaService.user.count({ where: { status: 'SUSPENDED' } }),
            this.prismaService.user.count({ where: { createdAt: { gte: startOfMonth } } }),
            this.prismaService.user.groupBy({
                by: ['role'],
                _count: { role: true }
            })
        ]);

        const roleStats = byRole.reduce((acc, item) => {
            acc[item.role] = item._count.role;
            return acc;
        }, {});

        return {
            total,
            active,
            pending,
            suspended,
            byRole: roleStats,
            newThisMonth
        };
    }

    private async getConservationStats(startOfMonth: Date): Promise<any> {
        const [total, verified, pending, thisMonth] = await Promise.all([
            this.prismaService.conservationRecord.count(),
            this.prismaService.conservationRecord.count({ where: { status: 'VERIFIED' } }),
            this.prismaService.conservationRecord.count({ where: { status: 'SUBMITTED' } }),
            this.prismaService.conservationRecord.count({ where: { createdAt: { gte: startOfMonth } } })
        ]);

        return { total, verified, pending, thisMonth };
    }

    private async getSupplyChainStats(startOfMonth: Date): Promise<any> {
        const [total, active, completed, thisMonth] = await Promise.all([
            this.prismaService.supplyChainRecord.count(),
            this.prismaService.supplyChainRecord.count({ where: { productStatus: 'ACTIVE' } }),
            this.prismaService.supplyChainRecord.count({ where: { productStatus: 'COMPLETED' } }),
            this.prismaService.supplyChainRecord.count({ where: { createdAt: { gte: startOfMonth } } })
        ]);

        return { total, active, completed, thisMonth };
    }

    private async getApplicationStats(): Promise<any> {
        const [total, pending, approved, rejected] = await Promise.all([
            this.prismaService.roleApplication.count(),
            this.prismaService.roleApplication.count({ where: { status: 'PENDING' } }),
            this.prismaService.roleApplication.count({ where: { status: 'APPROVED' } }),
            this.prismaService.roleApplication.count({ where: { status: 'REJECTED' } })
        ]);

        return { total, pending, approved, rejected };
    }

    private async getBlockchainStats(): Promise<any> {
        try {
            // Get actual blockchain statistics
            const analytics = await this.blockchainService.getBlockchainAnalytics();

            return {
                totalTransactions: analytics.totalTransactions || 0,
                successfulTransactions: analytics.totalVerifiedRecords || 0,
                failedTransactions: Math.max(0, (analytics.totalTransactions || 0) - (analytics.totalVerifiedRecords || 0)),
                averageGasUsed: analytics.averageGasUsed || '0',
                lastBlockNumber: analytics.lastBlockNumber || 0,
                totalVerifiedRecords: analytics.totalVerifiedRecords || 0,
                contractAddress: analytics.contractAddress,
                networkName: analytics.networkName || 'sepolia'
            };
        } catch (error) {
            this.logger.warn('Failed to get blockchain stats, returning defaults:', error);
            return {
                totalTransactions: 0,
                successfulTransactions: 0,
                failedTransactions: 0,
                averageGasUsed: '0',
                lastBlockNumber: 0,
                totalVerifiedRecords: 0,
                contractAddress: null,
                networkName: 'sepolia'
            };
        }
    }

    private async checkDatabaseHealth(): Promise<boolean> {
        try {
            await this.prismaService.$queryRaw`SELECT 1`;
            return true;
        } catch {
            return false;
        }
    }

    private async checkBlockchainHealth(): Promise<boolean> {
        try {
            return await this.blockchainService.isHealthy();
        } catch {
            return false;
        }
    }

    private async checkIPFSHealth(): Promise<boolean> {
        try {
            // Check IPFS health by trying to get storage stats
            await this.filesService.getStorageStats();
            return true;
        } catch (error) {
            this.logger.warn('IPFS health check failed:', error);
            return false;
        }
    }

    private async checkExternalApisHealth(): Promise<boolean> {
        try {
            // Check if we can reach external services
            // For now, we'll check if IPFS (Pinata) is accessible through files service
            await this.filesService.getStorageStats();
            return true;
        } catch (error) {
            this.logger.warn('External APIs health check failed:', error);
            return false;
        }
    }

    private async exportUsers(where: any, includeSensitive: boolean): Promise<any[]> {
        const users = await this.prismaService.user.findMany({
            where,
            include: { profile: true }
        });

        return users.map(user => ({
            id: user.id,
            address: includeSensitive ? user.address : '***masked***',
            email: includeSensitive ? user.email : '***masked***',
            role: user.role,
            status: user.status,
            createdAt: user.createdAt,
            firstName: user.profile?.firstName,
            lastName: user.profile?.lastName,
            organization: user.profile?.organization
        }));
    }

    private async exportConservationRecords(where: any): Promise<any[]> {
        const records = await this.prismaService.conservationRecord.findMany({
            where,
            include: { user: { include: { profile: true } } }
        });

        return records.map(record => ({
            id: record.id,
            samplingId: record.samplingId,
            species: record.speciesData?.['scientificName'],
            location: record.locationData?.['locationDescription'],
            status: record.status,
            createdAt: record.createdAt,
            researcher: record.user.profile?.firstName + ' ' + record.user.profile?.lastName
        }));
    }

    private async exportSupplyChainRecords(where: any): Promise<any[]> {
        const records = await this.prismaService.supplyChainRecord.findMany({
            where,
            include: { user: { include: { profile: true } } }
        });

        return records.map(record => ({
            id: record.id,
            productId: record.productId,
            productName: record.productName,
            species: record.speciesName,
            sourceType: record.sourceType,
            currentStage: record.currentStage,
            status: record.productStatus,
            createdAt: record.createdAt,
            creator: record.user.profile?.firstName + ' ' + record.user.profile?.lastName
        }));
    }

    private async exportFeedback(where: any): Promise<any[]> {
        try {
            const feedback = await this.prismaService.consumerFeedback.findMany({
                where,
                include: {
                    supplyChainRecord: {
                        select: {
                            productId: true,
                            productName: true,
                            speciesName: true
                        }
                    }
                }
            });

            return feedback.map(item => ({
                id: item.id,
                productId: item.productId,
                productName: item.supplyChainRecord?.productName,
                species: item.supplyChainRecord?.speciesName,
                rating: item.rating,
                comment: item.comment,
                consumerName: item.consumerName,
                consumerEmail: item.consumerEmail,
                purchaseLocation: item.purchaseLocation,
                purchaseDate: item.purchaseDate,
                verified: item.verified,
                status: item.status,
                createdAt: item.createdAt,
                moderatedAt: item.moderatedAt,
                moderationNotes: item.moderationNotes
            }));
        } catch (error) {
            this.logger.warn('Failed to export feedback, returning empty array:', error);
            return [];
        }
    }

    private async generateExcelFile(data: any[], sheetName: string): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(sheetName);

        if (data.length > 0) {
            // Add headers
            const headers = Object.keys(data[0]);
            worksheet.addRow(headers);

            // Add data rows
            data.forEach(item => {
                worksheet.addRow(Object.values(item));
            });

            // Style headers
            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE0E0E0' }
            };
        }

        return Buffer.from(await workbook.xlsx.writeBuffer());
    }

    private async getStorageStats(): Promise<any> {
        try {
            const storageStats = await this.filesService.getStorageStats();

            // Get additional file count from database
            const conservationRecordsWithFiles = await this.prismaService.conservationRecord.count({
                where: {
                    fileHashes: {
                        isEmpty: false
                    }
                }
            });

            const supplyChainRecordsWithFiles = await this.prismaService.supplyChainRecord.count({
                where: {
                    fileHashes: {
                        isEmpty: false
                    }
                }
            });

            const totalFileRecords = conservationRecordsWithFiles + supplyChainRecordsWithFiles;

            return {
                totalFiles: storageStats.totalFiles || 0,
                totalSize: storageStats.totalSize || 0,
                ipfsHashes: storageStats.ipfsHashes || 0,
                storageUsed: storageStats.storageUsed || 0,
                totalFileRecords
            };
        } catch (error) {
            this.logger.warn('Failed to get storage stats, returning defaults:', error);
            return {
                totalFiles: 0,
                totalSize: 0,
                ipfsHashes: 0,
                storageUsed: 0,
                totalFileRecords: 0
            };
        }
    }

    private async getPerformanceStats(): Promise<any> {
        try {
            // Basic performance metrics
            const memoryUsage = process.memoryUsage();
            const cpuUsage = process.cpuUsage();

            // Get request metrics from recent admin actions (as a proxy for system activity)
            const recentActions = await this.prismaService.adminAction.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                    }
                }
            });

            // Calculate basic throughput
            const throughput = Math.round(recentActions / 24); // actions per hour

            return {
                uptime: Math.round(process.uptime()),
                responseTime: await this.getAverageResponseTime(),
                errorRate: await this.getSystemErrorRate(),
                throughput,
                memoryUsage: {
                    heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
                    heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
                    external: Math.round(memoryUsage.external / 1024 / 1024), // MB
                    rss: Math.round(memoryUsage.rss / 1024 / 1024) // MB
                },
                cpuUsage: {
                    user: Math.round(cpuUsage.user / 1000), // microseconds to milliseconds
                    system: Math.round(cpuUsage.system / 1000)
                },
                recentActivity: recentActions
            };
        } catch (error) {
            this.logger.warn('Failed to get performance stats:', error);
            return {
                uptime: Math.round(process.uptime()),
                responseTime: 0,
                errorRate: 0,
                throughput: 0,
                memoryUsage: {
                    heapUsed: 0,
                    heapTotal: 0,
                    external: 0,
                    rss: 0
                },
                cpuUsage: {
                    user: 0,
                    system: 0
                },
                recentActivity: 0
            };
        }
    }

    private async getBlockchainActivityData(start: Date, end: Date): Promise<any[]> {
        try {
            // Get blockchain activity by checking records with blockchain hashes within date range
            const [conservationActivity, supplyChainActivity] = await Promise.all([
                this.prismaService.conservationRecord.groupBy({
                    by: ['createdAt'],
                    where: {
                        createdAt: { gte: start, lte: end },
                        blockchainHash: { not: null }
                    },
                    _count: { id: true }
                }),
                this.prismaService.supplyChainRecord.groupBy({
                    by: ['createdAt'],
                    where: {
                        createdAt: { gte: start, lte: end },
                        blockchainHash: { not: null }
                    },
                    _count: { id: true }
                })
            ]);

            // Combine and format the data
            const combinedActivity = new Map();

            [...conservationActivity, ...supplyChainActivity].forEach(item => {
                const date = new Date(item.createdAt).toISOString().split('T')[0];
                combinedActivity.set(date, (combinedActivity.get(date) || 0) + item._count.id);
            });

            return Array.from(combinedActivity.entries()).map(([date, count]) => ({
                date,
                count,
                type: 'blockchain_transaction'
            })).sort((a, b) => a.date.localeCompare(b.date));

        } catch (error) {
            this.logger.warn('Failed to get blockchain activity data:', error);
            return [];
        }
    }

    private async getAverageResponseTime(): Promise<number> {
        try {
            // Since we don't have middleware tracking, we'll estimate based on system performance
            const memoryUsage = process.memoryUsage();
            const memoryPressure = memoryUsage.heapUsed / memoryUsage.heapTotal;

            // Simple heuristic: higher memory pressure = slower response times
            // Base response time of 50ms, increased by memory pressure
            const estimatedResponseTime = Math.round(50 + (memoryPressure * 200));

            return estimatedResponseTime;
        } catch (error) {
            this.logger.warn('Failed to calculate response time:', error);
            return 0;
        }
    }

    private async getSystemErrorRate(): Promise<number> {
        try {
            // Get error-related admin actions as a proxy for system errors
            const totalActions = await this.prismaService.adminAction.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                    }
                }
            });

            const errorActions = await this.prismaService.adminAction.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                    },
                    OR: [
                        { action: { contains: 'ERROR', mode: 'insensitive' } },
                        { action: { contains: 'FAILED', mode: 'insensitive' } },
                        { description: { contains: 'error', mode: 'insensitive' } },
                        { description: { contains: 'failed', mode: 'insensitive' } }
                    ]
                }
            });

            // Calculate error rate as percentage
            const errorRate = totalActions > 0 ? Math.round((errorActions / totalActions) * 100) : 0;

            return errorRate;
        } catch (error) {
            this.logger.warn('Failed to calculate error rate:', error);
            return 0;
        }
    }
}