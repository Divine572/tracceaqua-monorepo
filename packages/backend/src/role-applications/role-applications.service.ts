import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '../common/enums/user-role.enum';
import { UserStatus } from '../common/enums/user-status.enum';
import { ApplicationStatus } from '@prisma/client';
import { CreateRoleApplicationDto } from './dto/create-role-application.dto';
import { ReviewApplicationDto } from './dto/review-application.dto';
import { UpdateApplicationDto } from './dto/update-role-application.dto';


import { FilesService } from '../files/files.service';

@Injectable()
export class RoleApplicationsService {
    constructor(
        private prisma: PrismaService,
        private filesService: FilesService,
    ) { }

    /**
     * Submit a new role application
     */
    async submitApplication(
        userId: string,
        createApplicationDto: CreateRoleApplicationDto,
        documents?: Express.Multer.File[]
    ): Promise<any> {
        console.log('📝 Submitting role application for user:', userId);

        // Check if user exists and can apply
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                roleApplications: {
                    where: {
                        status: {
                            in: [ApplicationStatus.PENDING]
                        }
                    }
                }
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.status !== UserStatus.ACTIVE) {
            throw new BadRequestException('User account is not active');
        }

        // Check if user already has a pending application
        if (user.roleApplications.length > 0) {
            throw new BadRequestException('You already have a pending application');
        }

        // Validate requested role
        if (createApplicationDto.requestedRole === UserRole.ADMIN) {
            throw new BadRequestException('Cannot apply for admin role');
        }

        if (createApplicationDto.requestedRole === UserRole.CONSUMER) {
            throw new BadRequestException('Users are consumers by default');
        }

        // Upload documents to IPFS if provided
        let documentHashes: string[] = [];
        if (documents && documents.length > 0) {
            console.log('📁 Uploading documents to IPFS...');
            try {
                documentHashes = await Promise.all(
                    documents.map(async (file) => {
                        const uploadResult = await this.filesService.uploadFile(file);
                        return uploadResult.hash;
                    })
                );
                console.log('✅ Documents uploaded:', documentHashes);
            } catch (error) {
                console.error('❌ Document upload failed:', error);
                throw new BadRequestException('Failed to upload documents');
            }
        }

        // Create the application
        const application = await this.prisma.roleApplication.create({
            data: {
                userId,
                requestedRole: createApplicationDto.requestedRole,
                organization: createApplicationDto.organization,
                licenseNumber: createApplicationDto.licenseNumber,
                businessType: createApplicationDto.businessType,
                experience: createApplicationDto.experience,
                motivation: createApplicationDto.motivation,
                documents: documentHashes,
                status: ApplicationStatus.PENDING,
            },
            include: {
                user: {
                    include: { profile: true }
                }
            }
        });

        // Update user status to show they have a pending application
        await this.prisma.user.update({
            where: { id: userId },
            data: { status: UserStatus.PENDING }
        });

        console.log('✅ Role application submitted successfully');
        return application;
    }

    /**
     * Get all applications for admin review
     */
    async getAllApplications(
        status?: ApplicationStatus,
        page: number = 1,
        limit: number = 10
    ): Promise<any> {
        const skip = (page - 1) * limit;

        const where = status ? { status } : {};

        const [applications, total] = await Promise.all([
            this.prisma.roleApplication.findMany({
                where,
                include: {
                    user: {
                        include: { profile: true }
                    },
                    reviewer: {
                        include: { profile: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.roleApplication.count({ where })
        ]);

        return {
            applications,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1,
            }
        };
    }

    /**
     * Get user's applications
     */
    async getUserApplications(userId: string): Promise<any[]> {
        return this.prisma.roleApplication.findMany({
            where: { userId },
            include: {
                reviewer: {
                    include: { profile: true }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Get application by ID
     */
    async getApplicationById(applicationId: string): Promise<any> {
        const application = await this.prisma.roleApplication.findUnique({
            where: { id: applicationId },
            include: {
                user: {
                    include: { profile: true }
                },
                reviewer: {
                    include: { profile: true }
                }
            }
        });

        if (!application) {
            throw new NotFoundException('Application not found');
        }

        return application;
    }

    /**
     * Review an application (approve/reject)
     */
    async reviewApplication(
        applicationId: string,
        adminId: string,
        reviewDto: ReviewApplicationDto
    ): Promise<any> {
        console.log('🔍 Reviewing application:', applicationId);

        // Get the application
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

        // Verify admin exists
        const admin = await this.prisma.user.findUnique({
            where: { id: adminId }
        });

        if (!admin || admin.role !== UserRole.ADMIN) {
            throw new ForbiddenException('Only admins can review applications');
        }

        // Update application status
        const updatedApplication = await this.prisma.roleApplication.update({
            where: { id: applicationId },
            data: {
                status: reviewDto.approved ? ApplicationStatus.APPROVED : ApplicationStatus.REJECTED,
                reviewedBy: adminId,
                adminFeedback: reviewDto.feedback,
                reviewedAt: new Date(),
            },
            include: {
                user: { include: { profile: true } },
                reviewer: { include: { profile: true } }
            }
        });

        // If approved, update user role
        if (reviewDto.approved) {
            await this.prisma.user.update({
                where: { id: application.userId },
                data: {
                    role: application.requestedRole,
                    status: UserStatus.ACTIVE
                }
            });

            console.log(`✅ User role updated to ${application.requestedRole}`);
        } else {
            // If rejected, revert user role to CONSUMER
            await this.prisma.user.update({
                where: { id: application.userId },
                data: { role: UserRole.CONSUMER }
            });

            console.log('❌ Application rejected, user role reverted to CONSUMER');
        }

        // Log admin action
        await this.prisma.adminAction.create({
            data: {
                adminId,
                targetId: application.userId,
                action: reviewDto.approved ? 'APPROVE_ROLE_APPLICATION' : 'REJECT_ROLE_APPLICATION',
                description: `${reviewDto.approved ? 'Approved' : 'Rejected'} ${application.requestedRole} role application`,
                metadata: {
                    applicationId,
                    requestedRole: application.requestedRole,
                    feedback: reviewDto.feedback,
                }
            }
        });

        console.log('✅ Application review completed');
        return updatedApplication;
    }

    /**
     * Update application (resubmission)
     */
    async updateApplication(
        applicationId: string,
        userId: string,
        updateDto: UpdateApplicationDto,
        documents?: Express.Multer.File[]
    ): Promise<any> {
        // Get the application
        const application = await this.prisma.roleApplication.findUnique({
            where: { id: applicationId },
        });

        if (!application) {
            throw new NotFoundException('Application not found');
        }

        if (application.userId !== userId) {
            throw new ForbiddenException('You can only update your own applications');
        }

        if (application.status !== ApplicationStatus.REJECTED) {
            throw new BadRequestException('Only rejected applications can be updated');
        }

        // Upload new documents if provided
        let newDocumentHashes: string[] = [];
        if (documents && documents.length > 0) {
            console.log('📁 Uploading updated documents to IPFS...');
            try {
                newDocumentHashes = await Promise.all(
                    documents.map(async (file) => {
                        const uploadResult = await this.filesService.uploadFile(file);
                        return uploadResult.hash;
                    })
                );
            } catch (error) {
                console.error('❌ Document upload failed:', error);
                throw new BadRequestException('Failed to upload documents');
            }
        }

        // Combine old and new documents
        const allDocuments = [...application.documents, ...newDocumentHashes];

        // Update the application
        const updatedApplication = await this.prisma.roleApplication.update({
            where: { id: applicationId },
            data: {
                organization: updateDto.organization || application.organization,
                licenseNumber: updateDto.licenseNumber || application.licenseNumber,
                businessType: updateDto.businessType || application.businessType,
                experience: updateDto.experience || application.experience,
                motivation: updateDto.motivation || application.motivation,
                documents: allDocuments,
                status: ApplicationStatus.PENDING,
                reviewedBy: null,
                adminFeedback: null,
                reviewedAt: null,
            },
            include: {
                user: { include: { profile: true } }
            }
        });

        // Update user status back to PENDING
        await this.prisma.user.update({
            where: { id: userId },
            data: { status: UserStatus.PENDING }
        });

        console.log('✅ Application updated and resubmitted');
        return updatedApplication;
    }

    /**
     * Delete/withdraw application
     */
    async withdrawApplication(applicationId: string, userId: string): Promise<void> {
        const application = await this.prisma.roleApplication.findUnique({
            where: { id: applicationId },
        });

        if (!application) {
            throw new NotFoundException('Application not found');
        }

        if (application.userId !== userId) {
            throw new ForbiddenException('You can only withdraw your own applications');
        }

        if (application.status === ApplicationStatus.APPROVED) {
            throw new BadRequestException('Cannot withdraw approved applications');
        }

        // Delete the application
        await this.prisma.roleApplication.delete({
            where: { id: applicationId }
        });

        // Revert user role to CONSUMER
        await this.prisma.user.update({
            where: { id: userId },
            data: { role: UserRole.CONSUMER }
        });

        console.log('✅ Application withdrawn successfully');
    }

    /**
     * Get application statistics for admin dashboard
     */
    async getApplicationStats(): Promise<any> {
        const [
            totalApplications,
            pendingCount,
            approvedCount,
            rejectedCount
        ] = await Promise.all([
            this.prisma.roleApplication.count(),
            this.prisma.roleApplication.count({ where: { status: ApplicationStatus.PENDING } }),
            this.prisma.roleApplication.count({ where: { status: ApplicationStatus.APPROVED } }),
            this.prisma.roleApplication.count({ where: { status: ApplicationStatus.REJECTED } }),
        ]);

        const roleBreakdown = await this.prisma.roleApplication.groupBy({
            by: ['requestedRole'],
            _count: true,
        });

        return {
            total: totalApplications,
            byStatus: {
                pending: pendingCount,
                approved: approvedCount,
                rejected: rejectedCount,
            },
            byRole: roleBreakdown.reduce((acc, item) => {
                acc[item.requestedRole] = item._count;
                return acc;
            }, {} as Record<string, number>),
        };
    }
}