import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '../common/enums/user-role.enum';
import { ApplicationStatus } from '@prisma/client';

export interface AdminDashboardStats {
    users: {
        total: number;
        byRole: Record<string, number>;
        newThisMonth: number;
        activeToday: number;
    };
    roleApplications: {
        pending: number;
        approved: number;
        rejected: number;
        totalThisMonth: number;
    };
    conservation: {
        total: number;
        pending: number;
        verified: number;
        rejected: number;
    };
    supplyChain: {
        total: number;
        public: number;
        private: number;
        byStage: Record<string, number>;
    };
    feedback: {
        pending: number;
        approved: number;
        rejected: number;
        averageRating: number;
    };
    system: {
        totalRecords: number;
        ipfsFiles: number;
        blockchainTransactions: number;
        systemHealth: 'healthy' | 'warning' | 'error';
    };
    lastUpdated: string;
}

export interface UserManagementDto {
    id: string;
    address: string;
    email?: string;
    role: UserRole;
    status: string;
    profile?: {
        firstName?: string;
        lastName?: string;
        organization?: string;
    };
    createdAt: Date;
    lastActiveAt?: Date;
    recordCount: number;
}

export interface SystemLogEntry {
    id: string;
    timestamp: Date;
    level: 'info' | 'warning' | 'error';
    action: string;
    adminId: string;
    targetId?: string;
    description: string;
    metadata?: any;
}

@Injectable()
export class AdminService {
    private readonly logger = new Logger(AdminService.name);

    constructor(private prisma: PrismaService) { }

    async getDashboardStats(): Promise<AdminDashboardStats> {
        try {
            const [
                userStats,
                applicationStats,
                conservationStats,
                supplyChainStats,
                feedbackStats,
                systemStats
            ] = await Promise.all([
                this.getUserStatistics(),
                this.getRoleApplicationStatistics(),
                this.getConservationStatistics(),
                this.getSupplyChainStatistics(),
                this.getFeedbackStatistics(),
                this.getSystemStatistics()
            ]);

            return {
                users: userStats,
                roleApplications: applicationStats,
                conservation: conservationStats,
                supplyChain: supplyChainStats,
                feedback: feedbackStats,
                system: systemStats,
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            this.logger.error(`Failed to get dashboard stats: ${error.message}`);
            throw error;
        }
    }

    private async getUserStatistics() {
        const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [total, byRole, newThisMonth] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.groupBy({
                by: ['role'],
                _count: { role: true }
            }),
            this.prisma.user.count({
                where: { createdAt: { gte: oneMonthAgo } }
            })
        ]);

        const roleStats = byRole.reduce((acc, item) => {
            acc[item.role] = item._count.role;
            return acc;
        }, {} as Record<string, number>);

        return {
            total,
            byRole: roleStats,
            newThisMonth,
            activeToday: 0 // Would need session tracking to implement
        };
    }

    private async getRoleApplicationStatistics() {
        const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const [byStatus, totalThisMonth] = await Promise.all([
            this.prisma.roleApplication.groupBy({
                by: ['status'],
                _count: { status: true }
            }),
            this.prisma.roleApplication.count({
                where: { createdAt: { gte: oneMonthAgo } }
            })
        ]);

        const statusStats = byStatus.reduce((acc, item) => {
            acc[item.status] = item._count.status;
            return acc;
        }, {} as Record<string, number>);

        return {
            pending: statusStats[ApplicationStatus.PENDING] || 0,
            approved: statusStats[ApplicationStatus.APPROVED] || 0,
            rejected: statusStats[ApplicationStatus.REJECTED] || 0,
            totalThisMonth
        };
    }

    private async getConservationStatistics() {
        const [total, byStatus] = await Promise.all([
            this.prisma.conservationRecord.count(),
            this.prisma.conservationRecord.groupBy({
                by: ['status'],
                _count: { status: true }
            })
        ]);

        const statusStats = byStatus.reduce((acc, item) => {
            acc[item.status] = item._count.status;
            return acc;
        }, {} as Record<string, number>);

        return {
            total,
            pending: statusStats['SUBMITTED'] || 0,
            verified: statusStats['VERIFIED'] || 0,
            rejected: statusStats['REJECTED'] || 0
        };
    }

    private async getSupplyChainStatistics() {
        const [total, publicCount, byStage] = await Promise.all([
            this.prisma.supplyChainRecord.count(),
            this.prisma.supplyChainRecord.count({ where: { isPublic: true } }),
            this.prisma.supplyChainRecord.groupBy({
                by: ['currentStage'],
                _count: { currentStage: true }
            })
        ]);

        const stageStats = byStage.reduce((acc, item) => {
            acc[item.currentStage] = item._count.currentStage;
            return acc;
        }, {} as Record<string, number>);

        return {
            total,
            public: publicCount,
            private: total - publicCount,
            byStage: stageStats
        };
    }

    private async getFeedbackStatistics() {
        const [byStatus, avgRating] = await Promise.all([
            this.prisma.consumerFeedback.groupBy({
                by: ['status'],
                _count: { status: true }
            }),
            this.prisma.consumerFeedback.aggregate({
                where: { verified: true },
                _avg: { rating: true }
            })
        ]);

        const statusStats = byStatus.reduce((acc, item) => {
            acc[item.status] = item._count.status;
            return acc;
        }, {} as Record<string, number>);

        return {
            pending: statusStats['PENDING'] || 0,
            approved: statusStats['APPROVED'] || 0,
            rejected: statusStats['REJECTED'] || 0,
            averageRating: avgRating._avg.rating || 0
        };
    }

    private async getSystemStatistics() {
        const [conservationCount, supplyChainCount] = await Promise.all([
            this.prisma.conservationRecord.count(),
            this.prisma.supplyChainRecord.count()
        ]);

        const totalRecords = conservationCount + supplyChainCount;

        // Count IPFS files (estimate from fileHashes arrays)
        const [conservationFiles, supplyChainFiles] = await Promise.all([
            this.prisma.conservationRecord.findMany({
                select: { fileHashes: true }
            }),
            this.prisma.supplyChainRecord.findMany({
                select: { fileHashes: true }
            })
        ]);

        const ipfsFiles = conservationFiles.reduce((count, record) => {
            return count + (record.fileHashes as string[]).length;
        }, 0) + supplyChainFiles.reduce((count, record) => {
            return count + (record.fileHashes as string[]).length;
        }, 0);

        // Count blockchain transactions (records with blockchainHash)
        const [conservationTx, supplyChainTx] = await Promise.all([
            this.prisma.conservationRecord.count({
                where: { blockchainHash: { not: null } }
            }),
            this.prisma.supplyChainRecord.count({
                where: { blockchainHash: { not: null } }
            })
        ]);

        const blockchainTransactions = conservationTx + supplyChainTx;

        return {
            totalRecords,
            ipfsFiles,
            blockchainTransactions,
            systemHealth: 'healthy' as const // Would implement actual health checks
        };
    }

    async getAllUsers(
        page: number = 1,
        limit: number = 50,
        role?: UserRole,
        status?: string
    ): Promise<{ users: UserManagementDto[]; total: number; pages: number }> {
        const offset = (page - 1) * limit;
        const where: any = {};

        if (role) where.role = role;
        if (status) where.status = status;

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                include: {
                    profile: true,
                    _count: {
                        select: {
                            conservationRecords: true,
                            supplyChainRecords: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset
            }),
            this.prisma.user.count({ where })
        ]);

        const userDtos = users.map(user => ({
            id: user.id,
            address: user.address,
            email: user.email,
            role: user.role as UserRole,
            status: user.status,
            profile: user.profile ? {
                firstName: user.profile.firstName,
                lastName: user.profile.lastName,
                organization: user.profile.organization
            } : undefined,
            createdAt: user.createdAt,
            lastActiveAt: undefined, // Would need session tracking
            recordCount: user._count.conservationRecords + user._count.supplyChainRecords
        }));

        return {
            users: userDtos,
            total,
            pages: Math.ceil(total / limit)
        };
    }

    async updateUserRole(
        adminId: string,
        userId: string,
        newRole: UserRole,
        reason?: string
    ): Promise<UserManagementDto> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true }
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.role === newRole) {
            throw new BadRequestException('User already has this role');
        }

        const oldRole = user.role;

        // Update user role
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: { role: newRole },
            include: {
                profile: true,
                _count: {
                    select: {
                        conservationRecords: true,
                        supplyChainRecords: true
                    }
                }
            }
        });

        // Log the action
        await this.logAdminAction(
            adminId,
            'UPDATE_USER_ROLE',
            userId,
            `Changed user role from ${oldRole} to ${newRole}`,
            { oldRole, newRole, reason }
        );

        this.logger.log(`Admin ${adminId} updated user ${userId} role from ${oldRole} to ${newRole}`);

        return {
            id: updatedUser.id,
            address: updatedUser.address,
            email: updatedUser.email,
            role: updatedUser.role as UserRole,
            status: updatedUser.status,
            profile: updatedUser.profile ? {
                firstName: updatedUser.profile.firstName,
                lastName: updatedUser.profile.lastName,
                organization: updatedUser.profile.organization
            } : undefined,
            createdAt: updatedUser.createdAt,
            recordCount: updatedUser._count.conservationRecords + updatedUser._count.supplyChainRecords
        };
    }

    async updateUserStatus(
        adminId: string,
        userId: string,
        status: 'ACTIVE' | 'SUSPENDED' | 'BANNED',
        reason?: string
    ): Promise<UserManagementDto> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true }
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const oldStatus = user.status;

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: { status },
            include: {
                profile: true,
                _count: {
                    select: {
                        conservationRecords: true,
                        supplyChainRecords: true
                    }
                }
            }
        });

        // Log the action
        await this.logAdminAction(
            adminId,
            'UPDATE_USER_STATUS',
            userId,
            `Changed user status from ${oldStatus} to ${status}`,
            { oldStatus, newStatus: status, reason }
        );

        this.logger.log(`Admin ${adminId} updated user ${userId} status from ${oldStatus} to ${status}`);

        return {
            id: updatedUser.id,
            address: updatedUser.address,
            email: updatedUser.email,
            role: updatedUser.role as UserRole,
            status: updatedUser.status,
            profile: updatedUser.profile ? {
                firstName: updatedUser.profile.firstName,
                lastName: updatedUser.profile.lastName,
                organization: updatedUser.profile.organization
            } : undefined,
            createdAt: updatedUser.createdAt,
            recordCount: updatedUser._count.conservationRecords + updatedUser._count.supplyChainRecords
        };
    }

    async getPendingRoleApplications(limit: number = 50) {
        return this.prisma.roleApplication.findMany({
            where: { status: ApplicationStatus.PENDING },
            include: {
                user: {
                    include: { profile: true }
                }
            },
            orderBy: { createdAt: 'asc' },
            take: limit
        });
    }

    async reviewRoleApplication(
        adminId: string,
        applicationId: string,
        action: 'approve' | 'reject',
        feedback?: string
    ) {
        const application = await this.prisma.roleApplication.findUnique({
            where: { id: applicationId },
            include: { user: true }
        });

        if (!application) {
            throw new NotFoundException('Application not found');
        }

        if (application.status !== ApplicationStatus.PENDING) {
            throw new BadRequestException('Application has already been reviewed');
        }

        const status = action === 'approve' ? ApplicationStatus.APPROVED : ApplicationStatus.REJECTED;

        // Update application
        const updatedApplication = await this.prisma.roleApplication.update({
            where: { id: applicationId },
            data: {
                status,
                reviewedBy: adminId,
                reviewedAt: new Date(),
                adminFeedback: feedback
            },
            include: {
                user: {
                    include: { profile: true }
                }
            }
        });

        // If approved, update user role
        if (action === 'approve') {
            await this.prisma.user.update({
                where: { id: application.userId },
                data: { role: application.requestedRole }
            });
        }

        // Log the action
        await this.logAdminAction(
            adminId,
            `${action.toUpperCase()}_ROLE_APPLICATION`,
            application.userId,
            `${action === 'approve' ? 'Approved' : 'Rejected'} role application for ${application.requestedRole}`,
            { applicationId, requestedRole: application.requestedRole, feedback }
        );

        this.logger.log(`Admin ${adminId} ${action}ed role application ${applicationId}`);

        return updatedApplication;
    }

    async getSystemLogs(
        page: number = 1,
        limit: number = 50,
        level?: 'info' | 'warning' | 'error',
        adminId?: string
    ): Promise<{ logs: SystemLogEntry[]; total: number; pages: number }> {
        const offset = (page - 1) * limit;
        const where: any = {};

        if (level) where.level = level;
        if (adminId) where.adminId = adminId;

        const [logs, total] = await Promise.all([
            this.prisma.adminAction.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset
            }),
            this.prisma.adminAction.count({ where })
        ]);

        const logEntries = logs.map(log => ({
            id: log.id,
            timestamp: log.createdAt,
            level: 'info' as const, // Would need to add level field to schema
            action: log.action,
            adminId: log.adminId,
            targetId: log.targetId,
            description: log.description || '',
            metadata: log.metadata
        }));

        return {
            logs: logEntries,
            total,
            pages: Math.ceil(total / limit)
        };
    }

    async exportSystemData(
        dataType: 'users' | 'conservation' | 'supply_chain' | 'feedback',
        format: 'csv' | 'json' = 'json'
    ) {
        // This would implement data export functionality
        // For now, just return a placeholder
        this.logger.log(`Export requested for ${dataType} in ${format} format`);

        return {
            message: `Export for ${dataType} initiated`,
            format,
            estimatedCompletion: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
            downloadUrl: null // Would generate actual download URL
        };
    }

    async performSystemMaintenance(
        adminId: string,
        maintenanceType: 'cleanup_old_files' | 'rebuild_indexes' | 'verify_data_integrity'
    ) {
        await this.logAdminAction(
            adminId,
            'SYSTEM_MAINTENANCE',
            undefined,
            `Initiated ${maintenanceType} maintenance`,
            { maintenanceType }
        );

        // Implement actual maintenance tasks here
        switch (maintenanceType) {
            case 'cleanup_old_files':
                // Clean up old temporary files, logs, etc.
                break;
            case 'rebuild_indexes':
                // Rebuild database indexes
                break;
            case 'verify_data_integrity':
                // Verify blockchain data integrity
                break;
        }

        this.logger.log(`Admin ${adminId} initiated ${maintenanceType} maintenance`);

        return {
            message: `${maintenanceType} maintenance initiated`,
            estimatedCompletion: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        };
    }

    private async logAdminAction(
        adminId: string,
        action: string,
        targetId?: string,
        description?: string,
        metadata?: any
    ) {
        await this.prisma.adminAction.create({
            data: {
                adminId,
                targetId,
                action,
                description,
                metadata
            }
        });
    }
}

