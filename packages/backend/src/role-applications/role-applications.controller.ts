// packages/backend/src/role-applications/role-applications.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    UseInterceptors,
    UploadedFiles,
    Req,
    ParseUUIDPipe,
    ParseIntPipe,
    DefaultValuePipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiConsumes,
    ApiQuery,
    ApiParam,
} from '@nestjs/swagger';
import { RoleApplicationsService } from './role-applications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { ApplicationStatus } from '../common/enums/application-status.enum';
import {
    CreateRoleApplicationDto,
    ReviewApplicationDto,
    UpdateApplicationDto,
    ApplicationFilterDto,
    RoleApplicationResponseDto,
    ApplicationStatsResponseDto,
    PaginatedApplicationResponseDto,
} from './dto';

@ApiTags('Role Applications')
@Controller('role-applications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RoleApplicationsController {
    constructor(private readonly roleApplicationsService: RoleApplicationsService) { }

    /**
     * Submit a new role application
     */
    @Post()
    @ApiOperation({
        summary: 'Submit role application',
        description: 'Submit an application for a professional role with optional document uploads'
    })
    @ApiResponse({
        status: 201,
        description: 'Application submitted successfully',
        type: RoleApplicationResponseDto
    })
    @ApiResponse({ status: 400, description: 'Bad request - validation errors or user already has pending application' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FilesInterceptor('documents', 5)) // Allow up to 5 documents
    async submitApplication(
        @Body() createApplicationDto: CreateRoleApplicationDto,
        @UploadedFiles() documents: Express.Multer.File[],
        @Req() req: any
    ): Promise<RoleApplicationResponseDto> {
        const userId = req.user.id;
        return this.roleApplicationsService.submitApplication(
            userId,
            createApplicationDto,
            documents
        );
    }

    /**
     * Get current user's applications
     */
    @Get('my-applications')
    @ApiOperation({
        summary: 'Get user applications',
        description: 'Get all applications submitted by the current user'
    })
    @ApiResponse({
        status: 200,
        description: 'User applications retrieved successfully',
        type: [RoleApplicationResponseDto]
    })
    async getUserApplications(@Req() req: any): Promise<RoleApplicationResponseDto[]> {
        const userId = req.user.id;
        return this.roleApplicationsService.getUserApplications(userId);
    }

    /**
     * Get all applications (Admin only)
     */
    @Get('admin/all')
    @UseGuards(AdminGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({
        summary: 'Get all applications (Admin)',
        description: 'Get all role applications with filtering and pagination (Admin only)'
    })
    @ApiQuery({ name: 'status', enum: ApplicationStatus, required: false })
    @ApiQuery({ name: 'page', type: 'number', required: false, example: 1 })
    @ApiQuery({ name: 'limit', type: 'number', required: false, example: 10 })
    @ApiResponse({
        status: 200,
        description: 'Applications retrieved successfully',
        type: PaginatedApplicationResponseDto
    })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    async getAllApplications(
        @Query('status') status?: ApplicationStatus,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    ): Promise<PaginatedApplicationResponseDto> {
        return this.roleApplicationsService.getAllApplications(status, page, limit);
    }

    /**
     * Get application by ID
     */
    @Get(':id')
    @ApiOperation({
        summary: 'Get application by ID',
        description: 'Get detailed information about a specific application'
    })
    @ApiParam({ name: 'id', description: 'Application ID' })
    @ApiResponse({
        status: 200,
        description: 'Application retrieved successfully',
        type: RoleApplicationResponseDto
    })
    @ApiResponse({ status: 404, description: 'Application not found' })
    async getApplicationById(
        @Param('id', ParseUUIDPipe) applicationId: string
    ): Promise<RoleApplicationResponseDto> {
        return this.roleApplicationsService.getApplicationById(applicationId);
    }

    /**
     * Review an application (Admin only)
     */
    @Put(':id/review')
    @UseGuards(AdminGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({
        summary: 'Review application (Admin)',
        description: 'Approve or reject a role application (Admin only)'
    })
    @ApiParam({ name: 'id', description: 'Application ID' })
    @ApiResponse({
        status: 200,
        description: 'Application reviewed successfully',
        type: RoleApplicationResponseDto
    })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    @ApiResponse({ status: 404, description: 'Application not found' })
    @ApiResponse({ status: 400, description: 'Application already reviewed' })
    async reviewApplication(
        @Param('id', ParseUUIDPipe) applicationId: string,
        @Body() reviewDto: ReviewApplicationDto,
        @Req() req: any
    ): Promise<RoleApplicationResponseDto> {
        const adminId = req.user.id;
        return this.roleApplicationsService.reviewApplication(
            applicationId,
            adminId,
            reviewDto
        );
    }

    /**
     * Update/resubmit application
     */
    @Put(':id')
    @ApiOperation({
        summary: 'Update application',
        description: 'Update and resubmit a rejected application with new information and documents'
    })
    @ApiParam({ name: 'id', description: 'Application ID' })
    @ApiResponse({
        status: 200,
        description: 'Application updated successfully',
        type: RoleApplicationResponseDto
    })
    @ApiResponse({ status: 403, description: 'Can only update own applications' })
    @ApiResponse({ status: 404, description: 'Application not found' })
    @ApiResponse({ status: 400, description: 'Only rejected applications can be updated' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FilesInterceptor('documents', 5))
    async updateApplication(
        @Param('id', ParseUUIDPipe) applicationId: string,
        @Body() updateDto: UpdateApplicationDto,
        @UploadedFiles() documents: Express.Multer.File[],
        @Req() req: any
    ): Promise<RoleApplicationResponseDto> {
        const userId = req.user.id;
        return this.roleApplicationsService.updateApplication(
            applicationId,
            userId,
            updateDto,
            documents
        );
    }

    /**
     * Withdraw application
     */
    @Delete(':id')
    @ApiOperation({
        summary: 'Withdraw application',
        description: 'Withdraw a pending or rejected application'
    })
    @ApiParam({ name: 'id', description: 'Application ID' })
    @ApiResponse({ status: 200, description: 'Application withdrawn successfully' })
    @ApiResponse({ status: 403, description: 'Can only withdraw own applications' })
    @ApiResponse({ status: 404, description: 'Application not found' })
    @ApiResponse({ status: 400, description: 'Cannot withdraw approved applications' })
    async withdrawApplication(
        @Param('id', ParseUUIDPipe) applicationId: string,
        @Req() req: any
    ): Promise<{ message: string }> {
        const userId = req.user.id;
        await this.roleApplicationsService.withdrawApplication(applicationId, userId);
        return { message: 'Application withdrawn successfully' };
    }

    /**
     * Get application statistics (Admin only)
     */
    @Get('admin/stats')
    @UseGuards(AdminGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({
        summary: 'Get application statistics (Admin)',
        description: 'Get comprehensive statistics about all applications (Admin only)'
    })
    @ApiResponse({
        status: 200,
        description: 'Statistics retrieved successfully',
        type: ApplicationStatsResponseDto
    })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    async getApplicationStats(): Promise<ApplicationStatsResponseDto> {
        return this.roleApplicationsService.getApplicationStats();
    }

    /**
     * Mark application as under review (Admin only)
     */
    @Put(':id/mark-under-review')
    @UseGuards(AdminGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({
        summary: 'Mark application as under review (Admin)',
        description: 'Mark an application as currently being reviewed (Admin only)'
    })
    @ApiParam({ name: 'id', description: 'Application ID' })
    @ApiResponse({
        status: 200,
        description: 'Application marked as under review',
        type: RoleApplicationResponseDto
    })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    @ApiResponse({ status: 404, description: 'Application not found' })
    async markUnderReview(
        @Param('id', ParseUUIDPipe) applicationId: string,
        @Req() req: any
    ): Promise<RoleApplicationResponseDto> {
        const adminId = req.user.id;

        // This is a simple status update - we can handle it in the controller
        const application = await this.roleApplicationsService.getApplicationById(applicationId);

        if (!application) {
            throw new Error('Application not found');
        }

        // Update status to PENDING
        // Note: You would implement this method in the service
        return application; // Placeholder - implement the actual update logic
    }
}