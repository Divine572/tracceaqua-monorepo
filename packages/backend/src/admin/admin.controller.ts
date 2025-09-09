import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    Query,
    Request,
    UseGuards,
    HttpCode,
    HttpStatus,
    ParseUUIDPipe,
    Res,
} from '@nestjs/common';
import { Response } from 'express';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

import { AdminService } from './admin.service';
import {
    UpdateUserRoleDto,
    UpdateUserStatusDto,
    BulkUserActionDto,
    ReviewRoleApplicationDto,
    BulkApplicationActionDto,
    AnalyticsQueryDto,
    ExportDataDto,
    GetSystemLogsDto,
    SystemStatsDto,
    SystemHealthDto,
    PaginatedLogsDto,
} from './dto/admin.dto';

@ApiTags('Admin')
    @Controller('admin')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(UserRole.ADMIN)
    @ApiBearerAuth()
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    // ===== USER MANAGEMENT =====

    @Get('users')
    @ApiOperation({
      summary: 'Get all users (Admin)',
      description: 'Get paginated list of all users with filtering options (Admin only)',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false, enum: UserRole })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({
      status: HttpStatus.OK,
      description: 'Users retrieved successfully',
  })
  async getAllUsers(
      @Query('page') page: string = '1',
      @Query('limit') limit: string = '20',
      @Query('role') role?: UserRole,
      @Query('status') status?: string,
      @Query('search') search?: string
  ) {
      const filters = { role, status, search };
      return this.adminService.getAllUsers(parseInt(page), parseInt(limit), filters);
  }

    @Put('users/:userId/role')
    @ApiOperation({
      summary: 'Update user role (Admin)',
      description: 'Update the role of a specific user (Admin only)',
  })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
      status: HttpStatus.OK,
      description: 'User role updated successfully',
  })
  async updateUserRole(
      @Param('userId', ParseUUIDPipe) userId: string,
      @Request() req,
      @Body() updateDto: UpdateUserRoleDto
  ) {
      return this.adminService.updateUserRole(req.user.id, userId, updateDto.role, updateDto.reason);
  }

    @Put('users/:userId/status')
    @ApiOperation({
      summary: 'Update user status (Admin)',
      description: 'Update the status of a specific user (Admin only)',
  })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
      status: HttpStatus.OK,
      description: 'User status updated successfully',
  })
  async updateUserStatus(
      @Param('userId', ParseUUIDPipe) userId: string,
      @Request() req,
      @Body() updateDto: UpdateUserStatusDto
  ) {
      return this.adminService.updateUserStatus(req.user.id, userId, updateDto.status, updateDto.reason);
  }

    @Post('users/bulk-action')
    @ApiOperation({
        summary: 'Perform bulk action on users (Admin)',
        description: 'Perform bulk actions (activate, suspend, delete) on multiple users (Admin only)',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Bulk action completed',
    })
    async bulkUserAction(
        @Request() req,
        @Body() bulkDto: BulkUserActionDto
    ) {
        return this.adminService.bulkUserAction(req.user.id, bulkDto.userIds, bulkDto.action, bulkDto.reason);
    }

    // ===== ROLE APPLICATION MANAGEMENT =====

    @Get('role-applications/pending')
    @ApiOperation({
      summary: 'Get pending role applications (Admin)',
      description: 'Get all pending role applications for admin review (Admin only)',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
      status: HttpStatus.OK,
      description: 'Pending applications retrieved successfully',
  })
  async getPendingApplications(
      @Query('limit') limit: string = '50'
  ) {
      return this.adminService.getPendingRoleApplications(parseInt(limit));
  }

    @Put('role-applications/:applicationId/review')
    @ApiOperation({
      summary: 'Review role application (Admin)',
      description: 'Approve or reject a role application (Admin only)',
  })
  @ApiParam({ name: 'applicationId', description: 'Application ID' })
  @ApiResponse({
      status: HttpStatus.OK,
      description: 'Application reviewed successfully',
  })
  async reviewApplication(
      @Param('applicationId', ParseUUIDPipe) applicationId: string,
      @Request() req,
      @Body() reviewDto: ReviewRoleApplicationDto
  ) {
      return this.adminService.reviewRoleApplication(
          req.user.id,
          applicationId,
        reviewDto.action,
        reviewDto.feedback,
        reviewDto.approvedRole
    );
  }

    @Post('role-applications/bulk-review')
    @ApiOperation({
      summary: 'Bulk review applications (Admin)',
      description: 'Approve or reject multiple applications at once (Admin only)',
  })
  @ApiResponse({
      status: HttpStatus.OK,
      description: 'Bulk review completed',
  })
  async bulkReviewApplications(
      @Request() req,
      @Body() bulkDto: BulkApplicationActionDto
  ) {
      const results: Array<{
          applicationId: string;
          success: boolean;
          result?: any;
          error?: string;
      }> = [];
      
      for (const appId of bulkDto.applicationIds) {
          try {
              const result = await this.adminService.reviewRoleApplication(
                  req.user.id,
                  appId,
                  bulkDto.action,
                  bulkDto.reason
              );
              results.push({ applicationId: appId, success: true, result });
          } catch (error) {
              results.push({ applicationId: appId, success: false, error: error.message });
          }
      }
      return { results };
  }

    // ===== SYSTEM ANALYTICS =====

    @Get('stats')
    @ApiOperation({
        summary: 'Get system statistics (Admin)',
        description: 'Get comprehensive system statistics and metrics (Admin only)',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'System statistics retrieved successfully',
        type: SystemStatsDto,
    })
    async getSystemStats(): Promise<SystemStatsDto> {
        return this.adminService.getSystemStats();
    }

    @Get('analytics')
    @ApiOperation({
        summary: 'Get system analytics (Admin)',
        description: 'Get detailed analytics with custom date ranges and grouping (Admin only)',
    })
    @ApiQuery({ name: 'startDate', required: false, type: String })
    @ApiQuery({ name: 'endDate', required: false, type: String })
    @ApiQuery({ name: 'groupBy', required: false, enum: ['day', 'week', 'month', 'year'] })
    @ApiQuery({ name: 'userRole', required: false, enum: UserRole })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Analytics data retrieved successfully',
    })
    async getAnalytics(@Query() query: AnalyticsQueryDto) {
        return this.adminService.getAnalytics(query);
  }

    // ===== DATA EXPORT =====

    @Post('export')
    @ApiOperation({
      summary: 'Export system data (Admin)',
      description: 'Export system data in various formats (CSV, Excel, JSON) (Admin only)',
  })
  @ApiResponse({
      status: HttpStatus.OK,
      description: 'Data exported successfully',
  })
  async exportData(
      @Body() exportDto: ExportDataDto,
      @Res() res: Response
  ) {
        const data = await this.adminService.exportData(exportDto);

        const filename = `tracceaqua_${exportDto.dataType}_${new Date().toISOString().split('T')[0]}`;
        const extension = exportDto.format || 'csv';

        res.setHeader('Content-Type', this.getContentType(extension));
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.${extension}"`);
        res.send(data);
    }

    // ===== SYSTEM MONITORING =====

    @Get('health')
    @ApiOperation({
        summary: 'Get system health status (Admin)',
        description: 'Get comprehensive system health check (Admin only)',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'System health retrieved successfully',
        type: SystemHealthDto,
    })
    async getSystemHealth(): Promise<SystemHealthDto> {
        return this.adminService.getSystemHealth();
    }

    @Get('logs')
    @ApiOperation({
        summary: 'Get system logs (Admin)',
        description: 'Get paginated system logs and admin actions (Admin only)',
    })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'level', required: false, enum: ['error', 'warn', 'info', 'debug'] })
    @ApiQuery({ name: 'adminId', required: false, type: String })
    @ApiQuery({ name: 'action', required: false, type: String })
    @ApiQuery({ name: 'startDate', required: false, type: String })
    @ApiQuery({ name: 'endDate', required: false, type: String })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'System logs retrieved successfully',
        type: PaginatedLogsDto,
    })
    async getSystemLogs(@Query() query: GetSystemLogsDto): Promise<PaginatedLogsDto> {
        return this.adminService.getSystemLogs(query);
    }

    // ===== EMERGENCY ACTIONS =====

    @Post('emergency/maintenance-mode')
    @ApiOperation({
        summary: 'Enable maintenance mode (Admin)',
        description: 'Enable system maintenance mode (Admin only)',
    })
    @HttpCode(HttpStatus.OK)
    async enableMaintenanceMode(@Request() req) {
        // Implementation would set maintenance mode
        return { message: 'Maintenance mode enabled', enabledBy: req.user.id };
    }

    @Delete('emergency/maintenance-mode')
    @ApiOperation({
      summary: 'Disable maintenance mode (Admin)',
      description: 'Disable system maintenance mode (Admin only)',
  })
  @HttpCode(HttpStatus.OK)
  async disableMaintenanceMode(@Request() req) {
      // Implementation would disable maintenance mode
      return { message: 'Maintenance mode disabled', disabledBy: req.user.id };
  }

    // ===== PRIVATE UTILITIES =====

    private getContentType(format: string): string {
        const mimeTypes = {
            csv: 'text/csv',
            xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            json: 'application/json'
        };
        return mimeTypes[format] || 'application/octet-stream';
    }
}
