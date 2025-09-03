import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
  Delete,
  Req,
  BadRequestException,
  NotFoundException
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { SupplyChainService } from './supply-chain.service';
import { 
  CreateSupplyChainRecordDto, 
  UpdateSupplyChainStageDto, 
  SupplyChainRecordResponseDto,
  ProductTraceabilityDto,
  SourceType,
  SupplyChainStage,
  ProductStatus
} from './dto/create-supply-chain-record.dto';

import { StageHistoryResponseDto } from './dto/stage-history-response.dto';

import { ConsumerFeedbackService } from './consumer-feedback.service';
import { CreateConsumerFeedbackDto, ConsumerFeedbackResponseDto } from './dto/consumer-feedback.dto';
import { PublicStatisticsService } from './public-statistics.service';
import { PublicStatisticsDto } from './dto/public-statistics.dto';

import { QRCodeService } from './qr-code.service';


import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../common/enums/user-role.enum';




@ApiTags('Supply Chain')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('supply-chain')
export class SupplyChainController {
  constructor(private readonly supplyChainService: SupplyChainService,
    private readonly consumerFeedbackService: ConsumerFeedbackService,
    private readonly publicStatisticsService: PublicStatisticsService,
    private readonly qrCodeService: QRCodeService) { }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.FARMER, UserRole.FISHERMAN, UserRole.PROCESSOR, UserRole.TRADER, UserRole.RETAILER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create supply chain record',
    description: 'Create a new supply chain record for tracking seafood products.',
  })
  @ApiResponse({
    status: 201,
    description: 'Supply chain record created successfully',
    type: SupplyChainRecordResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data or duplicate product ID',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async create(
    @Request() req,
    @Body() createSupplyChainRecordDto: CreateSupplyChainRecordDto,
  ): Promise<SupplyChainRecordResponseDto> {
    return this.supplyChainService.create(req.user.id, createSupplyChainRecordDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get supply chain records',
    description: 'Retrieve supply chain records with optional filtering.',
  })
  @ApiQuery({ name: 'sourceType', required: false, enum: SourceType })
  @ApiQuery({ name: 'stage', required: false, enum: SupplyChainStage })
  @ApiQuery({ name: 'isPublic', required: false, type: Boolean })
  @ApiResponse({
    status: 200,
    description: 'Supply chain records retrieved successfully',
    type: [SupplyChainRecordResponseDto],
  })
  async findAll(
    @Request() req,
    @Query('sourceType') sourceType?: SourceType,
    @Query('stage') stage?: SupplyChainStage,
    @Query('isPublic') isPublic?: string,
  ): Promise<SupplyChainRecordResponseDto[]> {
    const isPublicBool = isPublic !== undefined ? isPublic === 'true' : undefined;
    const userId = req.user?.role === UserRole.ADMIN ? undefined : req.user?.id;
    
    return this.supplyChainService.findAll(userId, sourceType, stage, isPublicBool);
  }

  @Get('statistics')
  @ApiOperation({
    summary: 'Get supply chain statistics',
    description: 'Retrieve statistics about supply chain records.',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getStatistics(@Request() req): Promise<any> {
    const userId = req.user?.role === UserRole.ADMIN ? undefined : req.user?.id;
    return this.supplyChainService.getStatistics(userId);
  }

  @Get(':productId')
  @ApiOperation({
    summary: 'Get supply chain record by product ID',
    description: 'Retrieve a specific supply chain record by product ID.',
  })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Supply chain record retrieved successfully',
    type: SupplyChainRecordResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Supply chain record not found',
  })
  async findOne(
    @Param('productId') productId: string,
    @Request() req,
  ): Promise<SupplyChainRecordResponseDto> {
    return this.supplyChainService.findOne(productId, req.user?.id);
  }

  @Patch(':productId/stage')
  @Roles(UserRole.ADMIN, UserRole.FARMER, UserRole.FISHERMAN, UserRole.PROCESSOR, UserRole.TRADER, UserRole.RETAILER)
  @ApiOperation({
    summary: 'Update supply chain stage',
    description: 'Update the current stage of a supply chain record.',
  })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Supply chain stage updated successfully',
    type: SupplyChainRecordResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions for this stage',
  })
  @ApiResponse({
    status: 404,
    description: 'Supply chain record not found',
  })
  async updateStage(
    @Param('productId') productId: string,
    @Request() req,
    @Body() updateSupplyChainStageDto: UpdateSupplyChainStageDto,
  ): Promise<SupplyChainRecordResponseDto> {
    return this.supplyChainService.updateStage(productId, req.user.id, updateSupplyChainStageDto);
  }

  @Patch(':productId/status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update product status',
    description: 'Update the status of a supply chain record. Admin only.',
  })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product status updated successfully',
    type: SupplyChainRecordResponseDto,
  })
  async updateStatus(
    @Param('productId') productId: string,
    @Request() req,
    @Body() statusUpdate: { status: ProductStatus; reason?: string },
  ): Promise<SupplyChainRecordResponseDto> {
    return this.supplyChainService.updateStatus(
      productId,
      req.user.id,
      statusUpdate.status,
      statusUpdate.reason,
    );
  }


  @Get(':productId/history')
@ApiOperation({
  summary: 'Get product stage history',
  description: 'Get complete stage transition history for a product.',
})
@ApiParam({ name: 'productId', description: 'Product ID' })
@ApiResponse({
  status: 200,
  description: 'Stage history retrieved successfully',
  type: [StageHistoryResponseDto],
})
async getStageHistory(
  @Param('productId') productId: string,
): Promise<StageHistoryResponseDto[]> {
  return this.supplyChainService.getStageHistory(productId);
}

  @Get(':productId/qr')
  @ApiOperation({
    summary: 'Generate QR code for product',
    description: 'Generate QR code data for a publicly traceable product.',
  })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'QR code generated successfully',
  })
  async generateQRCode(
    @Param('productId') productId: string,
  ): Promise<{ qrCode: string; url: string }> {
    return this.supplyChainService.generateQRCode(productId);
  }

  // PUBLIC ENDPOINTS FOR CONSUMERS



  @Public()
  @Get('trace/:productId/basic')
  @ApiOperation({
    summary: 'Get basic product information',
    description: 'Public endpoint for basic product information (for QR scanning).',
  })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Basic product information retrieved successfully',
  })
  async getBasicProductInfo(
    @Param('productId') productId: string,
  ): Promise<Partial<SupplyChainRecordResponseDto>> {
    const record = await this.supplyChainService.findOne(productId);
    
    // Return only basic public information
    return {
      productId: record.productId,
      productName: record.productName,
      speciesName: record.speciesName,
      sourceType: record.sourceType,
      currentStage: record.currentStage,
      qualityGrade: record.qualityGrade,
      certifications: record.certifications,
      createdAt: record.createdAt,
      creator: {
        organization: record.creator.organization,
        role: record.creator.role,
        id: record.creator.id,
      }
    };
  }






  @Public()
  @Post('trace/:productId/feedback')
  @ApiOperation({
    summary: 'Submit consumer feedback',
    description: 'Public endpoint for consumers to submit feedback about a traced product.',
  })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({
    status: 201,
    description: 'Feedback submitted successfully',
    type: ConsumerFeedbackResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid feedback data',
  })
  async submitConsumerFeedback(
    @Param('productId') productId: string,
    @Body() feedbackDto: CreateConsumerFeedbackDto,
    @Req() req: ExpressRequest,
  ): Promise<ConsumerFeedbackResponseDto> {
    const ipAddress = req.ip || (req.socket?.remoteAddress as string);
    const userAgent = req.get('User-Agent');

    try {
      return await this.consumerFeedbackService.createFeedback(
        productId,
        feedbackDto,
        ipAddress,
        userAgent
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  @Public()
  @Get('trace/:productId/feedback')
  @ApiOperation({
    summary: 'Get consumer feedback for product',
    description: 'Public endpoint to get aggregated consumer feedback for a product.',
  })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Feedback retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async getConsumerFeedback(
    @Param('productId') productId: string,
  ): Promise<{
    averageRating: number;
    totalFeedbacks: number;
    feedbacks: ConsumerFeedbackResponseDto[];
    ratingDistribution: { [key: number]: number };
  }> {
    return await this.consumerFeedbackService.getFeedbackForProduct(productId);
  }

  @Public()
  @Get('public/statistics')
  @ApiOperation({
    summary: 'Get public traceability statistics',
    description: 'Public endpoint for general traceability statistics and metrics.',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    type: PublicStatisticsDto,
  })
  async getPublicStatistics(): Promise<PublicStatisticsDto> {
    return await this.publicStatisticsService.getPublicStatistics();
  }

  @Public()
  @Get('public/featured')
  @ApiOperation({
    summary: 'Get featured traced products',
    description: 'Public endpoint for featured products that showcase traceability.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of products to return (max 20)'
  })
  @ApiResponse({
    status: 200,
    description: 'Featured products retrieved successfully',
  })
  async getFeaturedProducts(
    @Query('limit') limit: string = '6',
  ): Promise<any[]> {
    const limitNum = Math.min(parseInt(limit) || 6, 20); // Cap at 20
    return await this.publicStatisticsService.getFeaturedProducts(limitNum);
  }

  @Public()
  @Get('trace/:productId')
  @ApiOperation({
    summary: 'Get product traceability data',
    description: 'Public endpoint for consumers to trace product journey.',
  })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Traceability data retrieved successfully',
    type: ProductTraceabilityDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found or not public',
  })
  async getTraceabilityData(
    @Param('productId') productId: string,
    @Req() req: ExpressRequest,
  ): Promise<ProductTraceabilityDto> {
    // Record the trace for analytics
    const ipAddress = req.ip || (req.socket?.remoteAddress as string);
    const userAgent = req.get('User-Agent');
    const referer = req.get('Referer');

    await this.publicStatisticsService.recordProductTrace(
      productId,
      ipAddress,
      userAgent,
      referer
    );

    // Get full traceability data
    return await this.supplyChainService.getTraceabilityData(productId);
  }
}
