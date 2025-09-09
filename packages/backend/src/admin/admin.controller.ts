import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('dashboard')
    @ApiOperation({
        summary: 'Get admin dashboard statistics',
        description: 'Retrieve comprehensive dashboard statistics for admin panel'
    })
    @ApiResponse({
        status: 200,
        description: 'Dashboard statistics retrieved successfully'
    })
    async getDashboard() {
        return this.adminService.getDashboardStats();
    }

    @Get('users')
    @ApiOperation({
        summary: 'Get all users',
        description: 'Retrieve paginated list of all users with management information'
    })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'role', required: false, enum: UserRole })
    @ApiQuery({ name: 'status', required: false, type: String })
    async getAllUsers(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '50',
        @Query('role') role?: UserRole,
        @Query('status') status?: string
    ) {
        return this.adminService.getAllUsers(
            parseInt(page),
            parseInt(limit),
            role,
            status
        );
    }

    @Put('users/:userId/role')
    @ApiOperation({
        summary: 'Update user role',
        description: 'Update the role of a specific user'
    })
    @ApiParam({ name: 'userId', description: 'User ID' })
    async updateUserRole(
        @Request() req,
        @Param('userId') userId: string,
        @Body() body: { role: UserRole; reason?: string }
    ) {
        return this.adminService.updateUserRole(
            req.user.id,
            userId,
            body.role,
            body.reason
        );
    }

    @Put('users/:userId/status')
    @ApiOperation({
        summary: 'Update user status',
        description: 'Update the status of a specific user (active, suspended, banned)'
    })
    @ApiParam({ name: 'userId', description: 'User ID' })
    async updateUserStatus(
        @Request() req,
        @Param('userId') userId: string,
        @Body() body: { status: 'ACTIVE' | 'SUSPENDED' | 'BANNED'; reason?: string }
    ) {
        return this.adminService.updateUserStatus(
            req.user.id,
            userId,
            body.status,
            body.reason
        );
    }

    @Get('role-applications/pending')
    @ApiOperation({
        summary: 'Get pending role applications',
        description: 'Retrieve all pending role applications for review'
    })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getPendingApplications(@Query('limit') limit: string = '50') {
        return this.adminService.getPendingRoleApplications(parseInt(limit));
    }

    @Post('role-applications/:applicationId/review')
    @ApiOperation({
        summary: 'Review role application',
        description: 'Approve or reject a role application'
    })
    @ApiParam({ name: 'applicationId', description: 'Application ID' })
    async reviewApplication(
        @Request() req,
        @Param('applicationId') applicationId: string,
        @Body() body: { action: 'approve' | 'reject'; feedback?: string }
    ) {
        return this.adminService.reviewRoleApplication(
            req.user.id,
            applicationId,
            body.action,
            body.feedback
        );
    }

    @Get('logs')
    @ApiOperation({
        summary: 'Get system logs',
        description: 'Retrieve paginated system logs and admin actions'
    })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'level', required: false, enum: ['info', 'warning', 'error'] })
    @ApiQuery({ name: 'adminId', required: false, type: String })
    async getSystemLogs(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '50',
        @Query('level') level?: 'info' | 'warning' | 'error',
        @Query('adminId') adminId?: string
    ) {
        return this.adminService.getSystemLogs(
            parseInt(page),
            parseInt(limit),
            level,
            adminId
        );
    }

    @Post('export')
    @ApiOperation({
        summary: 'Export system data',
        description: 'Export system data in various formats'
    })
    async exportData(
        @Body() body: {
            dataType: 'users' | 'conservation' | 'supply_chain' | 'feedback';
            format?: 'csv' | 'json';
        }
    ) {
        return this.adminService.exportSystemData(body.dataType, body.format);
    }

    @Post('maintenance')
    @ApiOperation({
        summary: 'Perform system maintenance',
        description: 'Initiate various system maintenance tasks'
    })
    async performMaintenance(
        @Request() req,
        @Body() body: {
            maintenanceType: 'cleanup_old_files' | 'rebuild_indexes' | 'verify_data_integrity';
        }
    ) {
        return this.adminService.performSystemMaintenance(
            req.user.id,
            body.maintenanceType
        );
    }
}
