import {
    Controller,
    Get,
    Post,
    Put,
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
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

import { SupplyChainService } from './supply-chain.service';
// import { ConsumerFeedbackService } from './consumer-feedback.service';
import { QRCodeService } from './qr-code.service';
// import { PublicStatisticsService } from './public-statistics.service';

import {
    SupplyChainStage,
    CreateSupplyChainRecordDto,
    SupplyChainRecordResponseDto,
    UpdateSupplyChainStageDto,
    GetSupplyChainRecordsDto,
    PaginatedSupplyChainResponseDto,
    SourceType,
    GenerateQRCodeDto,
    QRCodeResponseDto,
    ConsumerFeedbackDto,
} from './dto/supply-chain.dto';




@ApiTags('Supply Chain')
@Controller('supply-chain')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SupplyChainController {
    constructor(
        private readonly supplyChainService: SupplyChainService,
        private readonly qrCodeService: QRCodeService,
    ) { }

    // ===== SUPPLY CHAIN RECORDS =====

    @Post()
    @ApiOperation({
        summary: 'Create supply chain record',
        description: 'Create a new supply chain record for a product',
    })
    @ApiConsumes('multipart/form-data')
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Supply chain record created successfully',
        type: SupplyChainRecordResponseDto,
    })
    @UseInterceptors(FilesInterceptor('files', 10))
    @Roles(UserRole.FARMER, UserRole.FISHERMAN, UserRole.PROCESSOR, UserRole.TRADER)
    @UseGuards(RoleGuard)
    async createRecord(
        @Request() req,
        @Body() createDto: CreateSupplyChainRecordDto,
        @UploadedFiles() files?: Express.Multer.File[],
    ): Promise<SupplyChainRecordResponseDto> {
        return this.supplyChainService.createSupplyChainRecord(req.user.id, createDto, files);
    }

    @Get()
    @ApiOperation({
        summary: 'Get all supply chain records',
        description: 'Retrieve all supply chain records with pagination and filtering options',
    })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
    @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'COMPLETED', 'CANCELLED'], description: 'Filter by status' })
    @ApiQuery({ name: 'stage', required: false, enum: SupplyChainStage, description: 'Filter by current stage' })
    @ApiQuery({ name: 'sourceType', required: false, enum: SourceType, description: 'Filter by source type' })
    @ApiQuery({ name: 'species', required: false, type: String, description: 'Filter by species name' })
    @ApiQuery({ name: 'search', required: false, type: String, description: 'Search in product ID, name, species, or batch ID' })
    @ApiQuery({ name: 'creatorId', required: false, type: String, description: 'Filter by creator user ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Supply chain records retrieved successfully',
        type: PaginatedSupplyChainResponseDto,
    })
    async getSupplyChainRecords(
        @Request() req,
        @Query() query: GetSupplyChainRecordsDto,
    ): Promise<PaginatedSupplyChainResponseDto> {
        return this.supplyChainService.getSupplyChainRecords(req.user.id, query);
    }

    @Get(':productId')
    @ApiOperation({
        summary: 'Get supply chain record by product ID',
        description: 'Retrieve a specific supply chain record by product ID',
    })
    @ApiParam({ name: 'productId', description: 'Product ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Supply chain record retrieved successfully',
        type: SupplyChainRecordResponseDto,
    })
    async getRecord(
        @Request() req,
        @Param('productId') productId: string,
    ): Promise<SupplyChainRecordResponseDto> {
        return this.supplyChainService.getSupplyChainRecordByProductId(productId, req.user.id);
    }

    @Put(':productId/stage')
    @ApiOperation({
        summary: 'Update supply chain stage',
        description: 'Update the current stage of a supply chain record',
    })
    @ApiParam({ name: 'productId', description: 'Product ID' })
    @ApiConsumes('multipart/form-data')
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Supply chain stage updated successfully',
        type: SupplyChainRecordResponseDto,
    })
    @UseInterceptors(FilesInterceptor('files', 10))
    @Roles(UserRole.FARMER, UserRole.FISHERMAN, UserRole.PROCESSOR, UserRole.TRADER, UserRole.RETAILER)
    @UseGuards(RoleGuard)
    async updateStage(
        @Request() req,
        @Param('productId') productId: string,
        @Body() updateDto: UpdateSupplyChainStageDto,
        @UploadedFiles() files?: Express.Multer.File[],
    ): Promise<SupplyChainRecordResponseDto> {
        return this.supplyChainService.updateSupplyChainStage(productId, req.user.id, updateDto, files);
    }

    // ===== PUBLIC TRACEABILITY =====

    @Get('public/trace/:productId')
    @ApiOperation({
        summary: 'Trace product publicly',
        description: 'Get public traceability information for a product',
    })
    @ApiParam({ name: 'productId', description: 'Product ID to trace' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Product traceability information retrieved',
    })
    async traceProduct(
        @Param('productId') productId: string,
    ) {
        return this.supplyChainService.traceProduct(productId);
    }

    @Get('public/qr/:productId')
    @ApiOperation({
        summary: 'Generate QR code',
        description: 'Generate QR code for product traceability',
    })
    @ApiParam({ name: 'productId', description: 'Product ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'QR code generated successfully',
    })
    async generateQRCode(
        @Param('productId') productId: string,
        @Body() qrDto: GenerateQRCodeDto
    ): Promise<QRCodeResponseDto> {
        return this.qrCodeService.generateQRCode(productId, qrDto);
    }

    // ===== CONSUMER FEEDBACK =====

    @Post(':productId/feedback')
    @ApiOperation({
        summary: 'Submit consumer feedback',
        description: 'Submit feedback for a traced product',
    })
    @ApiParam({ name: 'productId', description: 'Product ID' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Feedback submitted successfully',
    })
    @HttpCode(HttpStatus.CREATED)
    async submitFeedback(
        @Param('productId') productId: string,
        @Body() feedbackDto: ConsumerFeedbackDto, // Use actual ConsumerFeedbackDto when available
    ): Promise<{ message: string; feedbackId: string }> {
        const feedback = await this.supplyChainService.addConsumerFeedback(
            productId,
            feedbackDto,
        );
        return {
            message: 'Feedback submitted successfully',
            feedbackId: feedback.id,
        };
    }

    @Get(':productId/feedback')
    @ApiOperation({
        summary: 'Get product feedback',
        description: 'Get feedback statistics for a product',
    })
    @ApiParam({ name: 'productId', description: 'Product ID' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getProductFeedback(
        @Request() req,
        @Param('productId') productId: string,
        @Query('page', new ParseIntPipe({ optional: true })) page = 1,
        @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
    ) {
        return this.supplyChainService.getProductFeedback(
            productId,
            true,
            limit,
        );
    }

    // ===== STATISTICS =====

    @Get('statistics/public')
    @ApiOperation({
        summary: 'Get public statistics',
        description: 'Get public statistics about the supply chain',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Public statistics retrieved successfully',
    })
    async getPublicStatistics() {
        return this.supplyChainService.getPublicStatistics();
    }
}