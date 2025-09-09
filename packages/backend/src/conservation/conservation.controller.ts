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
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
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
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

import { ConservationService } from './conservation.service';
import {
  CreateConservationRecordDto,
  UpdateConservationRecordDto,
  VerifyConservationRecordDto,
  ConservationRecordResponseDto,
  GetConservationRecordsDto,
  PaginatedConservationResponseDto,
} from './dto/conservation.dto';

@ApiTags('Conservation')
@Controller('conservation')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ConservationController {
  constructor(private readonly conservationService: ConservationService) {}

  // ===== CREATE CONSERVATION RECORD =====

  @Post()
  @UseGuards(RoleGuard)
  @Roles(UserRole.RESEARCHER, UserRole.ADMIN)
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiOperation({
    summary: 'Create conservation record',
    description: 'Create a new conservation record with sampling data and optional file uploads',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Conservation record created successfully',
    type: ConservationRecordResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only researchers can create conservation records',
  })
  async createConservationRecord(
    @Request() req,
    @Body() createDto: CreateConservationRecordDto,
    @UploadedFiles() files?: Express.Multer.File[]
  ): Promise<ConservationRecordResponseDto> {
    return this.conservationService.createConservationRecord(req.user.id, createDto, files);
  }

  // ===== GET CONSERVATION RECORDS =====

  @Get()
  @ApiOperation({
    summary: 'Get conservation records',
    description: 'Get paginated list of conservation records with filtering options',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'species', required: false, type: String })
  @ApiQuery({ name: 'researcherId', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Conservation records retrieved successfully',
    type: PaginatedConservationResponseDto,
  })
  async getConservationRecords(
    @Request() req,
    @Query() query: GetConservationRecordsDto
  ): Promise<PaginatedConservationResponseDto> {
    return this.conservationService.getConservationRecords(req.user.id, query);
  }

  // ===== GET SINGLE RECORD =====

  @Get(':id')
  @ApiOperation({
    summary: 'Get conservation record by ID',
    description: 'Get detailed information about a specific conservation record',
  })
  @ApiParam({ name: 'id', description: 'Conservation record ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Conservation record retrieved successfully',
    type: ConservationRecordResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Conservation record not found',
  })
  async getConservationRecordById(
    @Param('id', ParseUUIDPipe) recordId: string,
    @Request() req
  ): Promise<ConservationRecordResponseDto> {
    return this.conservationService.getConservationRecordById(recordId, req.user.id);
  }

  // ===== UPDATE RECORD =====

  @Put(':id')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiOperation({
    summary: 'Update conservation record',
    description: 'Update conservation record data and add additional files',
  })
  @ApiParam({ name: 'id', description: 'Conservation record ID' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Conservation record updated successfully',
    type: ConservationRecordResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied or record already verified',
  })
  async updateConservationRecord(
    @Param('id', ParseUUIDPipe) recordId: string,
    @Request() req,
    @Body() updateDto: UpdateConservationRecordDto,
    @UploadedFiles() files?: Express.Multer.File[]
  ): Promise<ConservationRecordResponseDto> {
    return this.conservationService.updateConservationRecord(recordId, req.user.id, updateDto, files);
  }

  // ===== ADMIN VERIFICATION =====

  @Put(':id/verify')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Verify conservation record (Admin)',
    description: 'Approve or reject a conservation record (Admin only)',
  })
  @ApiParam({ name: 'id', description: 'Conservation record ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Conservation record verification updated successfully',
    type: ConservationRecordResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin access required',
  })
  async verifyConservationRecord(
    @Param('id', ParseUUIDPipe) recordId: string,
    @Request() req,
    @Body() verifyDto: VerifyConservationRecordDto
  ): Promise<ConservationRecordResponseDto> {
    return this.conservationService.verifyConservationRecord(recordId, req.user.id, verifyDto);
  }

  // ===== DELETE RECORD =====

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete conservation record',
    description: 'Delete a conservation record (only drafts and unverified records)',
  })
  @ApiParam({ name: 'id', description: 'Conservation record ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Conservation record deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Cannot delete verified records',
  })
  async deleteConservationRecord(
    @Param('id', ParseUUIDPipe) recordId: string,
    @Request() req
  ): Promise<void> {
    return this.conservationService.deleteConservationRecord(recordId, req.user.id);
  }

  // ===== ADMIN ENDPOINTS =====

  @Get('admin/pending')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get pending conservation records (Admin)',
    description: 'Get all conservation records pending verification (Admin only)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pending records retrieved successfully',
    type: PaginatedConservationResponseDto,
  })
  async getPendingRecords(@Request() req): Promise<PaginatedConservationResponseDto> {
    return this.conservationService.getConservationRecords(req.user.id, { status: 'SUBMITTED' });
  }

  @Get('admin/stats')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get conservation statistics (Admin)',
    description: 'Get comprehensive conservation records statistics (Admin only)',
  })
  async getConservationStats() {
    // Implementation would include various statistics
    return { message: 'Conservation statistics endpoint' };
  }
}
