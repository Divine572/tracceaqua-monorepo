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
    UseInterceptors,
    UploadedFiles,
    ParseIntPipe,
    ValidationPipe,
    HttpStatus,
    HttpCode,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiConsumes,
    ApiParam,
    ApiQuery,
    ApiBody,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

import { ConservationService } from './conservation.service';

import {
    CreateConservationRecordDto,
    UpdateConservationRecordDto,
    ConservationRecordResponseDto,
    RecordStatus,
} from './dto';

@ApiTags('Conservation')
@Controller('conservation')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ConservationController {
    constructor(private readonly conservationService: ConservationService) { }

    // ===== CONSERVATION RECORDS =====

    @Post()
    @ApiOperation({
        summary: 'Create conservation record',
        description: 'Create a new conservation/research record with file uploads',
    })
    @ApiConsumes('multipart/form-data')
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Conservation record created successfully',
        type: ConservationRecordResponseDto,
    })
    @UseInterceptors(FilesInterceptor('files', 10))
    @Roles(UserRole.RESEARCHER)
    @UseGuards(RoleGuard)
    async createRecord(
        @Request() req,
        @Body() createDto: CreateConservationRecordDto,
        @UploadedFiles() files?: Express.Multer.File[],
    ): Promise<ConservationRecordResponseDto> {
        return this.conservationService.create(req.user.id, createDto);
    }

    @Get()
    @ApiOperation({
        summary: 'Get conservation records',
        description: 'Retrieve conservation records with optional filtering',
    })
    @ApiQuery({ name: 'status', required: false, enum: RecordStatus })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Conservation records retrieved successfully',
        type: [ConservationRecordResponseDto],
    })
    async getRecords(
        @Request() req,
        @Query('status') status?: RecordStatus,
    ): Promise<ConservationRecordResponseDto[]> {
        return this.conservationService.findAll(req.user.id, status);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get conservation record',
        description: 'Retrieve a specific conservation record by ID',
    })
    @ApiParam({ name: 'id', description: 'Record ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Conservation record retrieved successfully',
        type: ConservationRecordResponseDto,
    })
    async getRecord(
        @Request() req,
        @Param('id') id: string,
    ): Promise<ConservationRecordResponseDto> {
        return this.conservationService.findOne(id, req.user.id);
    }

    @Put(':id')
    @ApiOperation({
        summary: 'Update conservation record',
        description: 'Update an existing conservation record',
    })
    @ApiParam({ name: 'id', description: 'Record ID' })
    @ApiConsumes('multipart/form-data')
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Conservation record updated successfully',
        type: ConservationRecordResponseDto,
    })
    @UseInterceptors(FilesInterceptor('files', 10))
    @Roles(UserRole.RESEARCHER)
    @UseGuards(RoleGuard)
    async updateRecord(
        @Request() req,
        @Param('id') id: string,
        @Body() updateDto: UpdateConservationRecordDto,
        @UploadedFiles() files?: Express.Multer.File[],
    ): Promise<ConservationRecordResponseDto> {
        return this.conservationService.update(id, req.user.id, updateDto);
    }

    @Delete(':id')
    @ApiOperation({
        summary: 'Delete conservation record',
        description: 'Delete a conservation record (only if not verified)',
    })
    @ApiParam({ name: 'id', description: 'Record ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Conservation record deleted successfully',
    })
    @Roles(UserRole.RESEARCHER, UserRole.ADMIN)
    @UseGuards(RoleGuard)
    @HttpCode(HttpStatus.OK)
    async deleteRecord(
        @Request() req,
        @Param('id') id: string,
    ): Promise<{ message: string }> {
        await this.conservationService.delete(id, req.user.id);
        return { message: 'Conservation record deleted successfully' };
    }

    // ===== RECORD VERIFICATION (ADMIN ONLY) =====

    @Post(':id/verify')
    @ApiOperation({
        summary: 'Verify conservation record',
        description: 'Verify a conservation record (admin only)',
    })
    @ApiParam({ name: 'id', description: 'Record ID' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                status: {
                    type: 'string',
                    enum: ['VERIFIED', 'REJECTED'],
                    description: 'Verification status'
                },
                verificationNotes: {
                    type: 'string',
                    description: 'Optional verification notes'
                },
            },
            required: ['status'],
        },
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Record verification completed',
        type: ConservationRecordResponseDto,
    })
    @Roles(UserRole.ADMIN)
    @UseGuards(RoleGuard)
    async verifyRecord(
        @Request() req,
        @Param('id') id: string,
        @Body() verificationData: {
            status: 'VERIFIED' | 'REJECTED';
            verificationNotes?: string;
        },
    ): Promise<ConservationRecordResponseDto> {
        return this.conservationService.updateStatus(
            id,
            req.user.id,
            verificationData.status as RecordStatus,
            verificationData.verificationNotes,
        );
    }

    // ===== STATISTICS =====

    @Get('statistics/overview')
    @ApiOperation({
        summary: 'Get conservation statistics',
        description: 'Get overview statistics for conservation records',
    })
    @ApiQuery({ name: 'userId', required: false, type: String })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Conservation statistics retrieved successfully',
    })
    async getStatistics(
        @Request() req,
        @Query('userId') userId?: string,
    ) {
        // Only allow admins to view other users' stats
        const targetUserId = req.user.role === UserRole.ADMIN ? userId : req.user.id;
        return this.conservationService.getStatistics(targetUserId);
    }
}