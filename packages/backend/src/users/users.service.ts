import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// import { UserRole, UserStatus } from '@prisma/client';

import { UserRole } from '../common/enums/user-role.enum';
import { UserStatus } from '../common/enums/user-status.enum';


import { UserQueryDto } from './dto/user-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';





import { PaginatedResponseDto } from '../common/dto/response.dto';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    /**
     * Get all users with filtering and pagination
     */
    async findAll(query: UserQueryDto) {
        const { page = 1, limit = 10, search, role, status } = query;
        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {};

        if (search) {
            where.OR = [
                { address: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                {
                    profile: {
                        OR: [
                            { firstName: { contains: search, mode: 'insensitive' } },
                            { lastName: { contains: search, mode: 'insensitive' } },
                            { organization: { contains: search, mode: 'insensitive' } },
                        ],
                    },
                },
            ];
        }

        if (role) {
            where.role = role;
        }

        if (status) {
            where.status = status;
        }

        // Get users with pagination
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                include: {
                    profile: true,
                    _count: {
                        select: {
                            roleApplications: true,
                            conservationRecords: true,
                            supplyChainRecords: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.user.count({ where }),
        ]);

        return new PaginatedResponseDto(users, total, page, limit);
    }

    /**
     * Get user by ID
     */
    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                profile: true,
                roleApplications: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
                _count: {
                    select: {
                        roleApplications: true,
                        conservationRecords: true,
                        supplyChainRecords: true,
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    /**
     * Update user (admin only)
     */
    async update(id: string, updateUserDto: UpdateUserDto, adminId: string) {
        const { role, status } = updateUserDto;

        // Check if user exists
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { profile: true },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Prevent self-modification of admin status
        if (user.id === adminId && (role !== undefined || status !== undefined)) {
            throw new ForbiddenException('Cannot modify your own role or status');
        }

        // Update user
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: { role, status },
            include: { profile: true },
        });

        // Log admin action
        await this.prisma.adminAction.create({
            data: {
                adminId,
                targetId: id,
                action: 'UPDATE_USER',
                description: `Updated user role to ${role || user.role} and status to ${status || user.status}`,
                metadata: {
                    previousRole: user.role,
                    newRole: role || user.role,
                    previousStatus: user.status,
                    newStatus: status || user.status,
                },
            },
        });

        return updatedUser;
    }

    /**
     * Suspend user (admin only)
     */
    async suspend(id: string, adminId: string, reason?: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.id === adminId) {
            throw new ForbiddenException('Cannot suspend yourself');
        }

        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: { status: UserStatus.SUSPENDED },
            include: { profile: true },
        });

        // Log admin action
        await this.prisma.adminAction.create({
            data: {
                adminId,
                targetId: id,
                action: 'SUSPEND_USER',
                description: reason || 'User suspended by admin',
                metadata: {
                    previousStatus: user.status,
                    reason,
                },
            },
        });

        return updatedUser;
    }

    /**
     * Activate user (admin only)
     */
    async activate(id: string, adminId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: { status: UserStatus.ACTIVE },
            include: { profile: true },
        });

        // Log admin action
        await this.prisma.adminAction.create({
            data: {
                adminId,
                targetId: id,
                action: 'ACTIVATE_USER',
                description: 'User activated by admin',
                metadata: {
                    previousStatus: user.status,
                },
            },
        });

        return updatedUser;
    }

    /**
     * Get user statistics
     */
    async getStats() {
        const [totalUsers, usersByRole, usersByStatus, recentUsers] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.groupBy({
                by: ['role'],
                _count: true,
            }),
            this.prisma.user.groupBy({
                by: ['status'],
                _count: true,
            }),
            this.prisma.user.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { profile: true },
            }),
        ]);

        return {
            totalUsers,
            usersByRole: usersByRole.reduce((acc, item) => {
                acc[item.role] = item._count;
                return acc;
            }, {}),
            usersByStatus: usersByStatus.reduce((acc, item) => {
                acc[item.status] = item._count;
                return acc;
            }, {}),
            recentUsers,
        };
    }
}