import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
    Query,
    HttpStatus,
    HttpCode
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiQuery,
    ApiParam,
} from '@nestjs/swagger';
import { ConservationService } from './conservation.service';
import { ConservationRecordResponseDto, RecordStatus } from './dto/conservation-record-response.dto';
import { CreateConservationRecordDto } from './dto/create-conservation-record.dto';
import { UpdateConservationRecordDto } from './dto/update-conservation-record.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('Conservation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('conservation')
export class ConservationController {
    constructor(private readonly conservationService: ConservationService) { }

    @Post()
    @Roles(UserRole.RESEARCHER, UserRole.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Create new conservation record',
        description: 'Create a new conservation sampling record. Only researchers and admins can create records.',
    })
    @ApiResponse({
        status: 201,
        description: 'Conservation record created successfully',
        type: ConservationRecordResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid data or duplicate sampling ID',
    })
    @ApiResponse({
        status: 403,
        description: 'Insufficient permissions',
    })
    async create(
        @Request() req,
        @Body() createConservationRecordDto: CreateConservationRecordDto,
    ): Promise<ConservationRecordResponseDto> {
        return this.conservationService.create(req.user.id, createConservationRecordDto);
    }

    @Get()
    @ApiOperation({
        summary: 'Get conservation records',
        description: 'Retrieve conservation records. Researchers see their own records, admins see all.',
    })
    @ApiQuery({
        name: 'status',
        required: false,
        enum: RecordStatus,
        description: 'Filter by record status',
    })
    @ApiResponse({
        status: 200,
        description: 'Conservation records retrieved successfully',
        type: [ConservationRecordResponseDto],
    })
    async findAll(
        @Request() req,
        @Query('status') status?: RecordStatus,
    ): Promise<ConservationRecordResponseDto[]> {
        // Admins can see all records, others see only their own
        const userId = req.user.role === UserRole.ADMIN ? undefined : req.user.id;
        return this.conservationService.findAll(userId, status);
    }

    @Get('statistics')
    @ApiOperation({
        summary: 'Get conservation statistics',
        description: 'Retrieve statistics about conservation records',
    })
    @ApiResponse({
        status: 200,
        description: 'Statistics retrieved successfully',
    })
    async getStatistics(@Request() req): Promise<any> {
        // Admins see global stats, others see their own stats
        const userId = req.user.role === UserRole.ADMIN ? undefined : req.user.id;
        return this.conservationService.getStatistics(userId);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get conservation record by ID',
        description: 'Retrieve a specific conservation record by ID',
    })
    @ApiParam({
        name: 'id',
        description: 'Conservation record ID',
    })
    @ApiResponse({
        status: 200,
        description: 'Conservation record retrieved successfully',
        type: ConservationRecordResponseDto,
    })
    @ApiResponse({
        status: 404,
        description: 'Conservation record not found',
    })
    async findOne(
        @Param('id') id: string,
        @Request() req,
    ): Promise<ConservationRecordResponseDto> {
        return this.conservationService.findOne(id, req.user.id);
    }

    @Patch(':id')
    @Roles(UserRole.RESEARCHER, UserRole.ADMIN)
    @ApiOperation({
        summary: 'Update conservation record',
        description: 'Update a conservation record. Only the creator or admin can update.',
    })
    @ApiParam({
        name: 'id',
        description: 'Conservation record ID',
    })
    @ApiResponse({
        status: 200,
        description: 'Conservation record updated successfully',
        type: ConservationRecordResponseDto,
    })
    @ApiResponse({
        status: 403,
        description: 'Insufficient permissions',
    })
    @ApiResponse({
        status: 404,
        description: 'Conservation record not found',
    })
    async update(
        @Param('id') id: string,
        @Request() req,
        @Body() updateConservationRecordDto: UpdateConservationRecordDto,
    ): Promise<ConservationRecordResponseDto> {
        return this.conservationService.update(id, req.user.id, updateConservationRecordDto);
    }

    @Patch(':id/status')
    @Roles(UserRole.ADMIN)
    @ApiOperation({
        summary: 'Update record status',
        description: 'Update the status of a conservation record. Admin only.',
    })
    @ApiParam({
        name: 'id',
        description: 'Conservation record ID',
    })
    @ApiResponse({
        status: 200,
        description: 'Record status updated successfully',
        type: ConservationRecordResponseDto,
    })
    async updateStatus(
        @Param('id') id: string,
        @Request() req,
        @Body() statusUpdate: { status: RecordStatus; verificationNotes?: string },
    ): Promise<ConservationRecordResponseDto> {
        return this.conservationService.updateStatus(
            id,
            req.user.id,
            statusUpdate.status,
            statusUpdate.verificationNotes,
        );
    }

    @Delete(':id')
    @Roles(UserRole.RESEARCHER, UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Delete conservation record',
        description: 'Delete a conservation record. Only the creator or admin can delete.',
    })
    @ApiParam({
        name: 'id',
        description: 'Conservation record ID',
    })
    @ApiResponse({
        status: 204,
        description: 'Conservation record deleted successfully',
    })
    @ApiResponse({
        status: 403,
        description: 'Insufficient permissions',
    })
    @ApiResponse({
        status: 404,
        description: 'Conservation record not found',
    })
    async remove(@Param('id') id: string, @Request() req): Promise<void> {
        return this.conservationService.delete(id, req.user.id);
    }
}