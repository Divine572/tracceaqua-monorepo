import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { FilesService } from '../files/files.service';
import { 
  CreateSupplyChainRecordDto, 
  UpdateSupplyChainStageDto, 
  SupplyChainRecordResponseDto,
  ProductTraceabilityDto,
  SourceType,
  SupplyChainStage,
  ProductStatus
} from './dto/create-supply-chain-record.dto';
import { UserRole } from '../common/enums/user-role.enum';

import { StageHistoryResponseDto } from './dto/stage-history-response.dto';



@Injectable()
export class SupplyChainService {
  private readonly logger = new Logger(SupplyChainService.name);

  constructor(
    private prisma: PrismaService,
    private filesService: FilesService
  ) {}

  async create(userId: string, createDto: CreateSupplyChainRecordDto): Promise<SupplyChainRecordResponseDto> {
    // Verify user has appropriate role
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check role permissions for creating supply chain records
    const allowedRoles = [UserRole.ADMIN, UserRole.FARMER, UserRole.FISHERMAN, UserRole.PROCESSOR, UserRole.TRADER, UserRole.RETAILER];
    if (!allowedRoles.includes(user.role as UserRole)) {
      throw new ForbiddenException('Insufficient permissions to create supply chain records');
    }

    // Check for duplicate product ID
    const existingRecord = await this.prisma.supplyChainRecord.findFirst({
      where: { productId: createDto.productId }
    });

    if (existingRecord) {
      throw new BadRequestException('A product with this ID already exists');
    }

    // Validate stage data matches the initial stage
    this.validateStageData(createDto.initialStage, createDto);
    try {
    // Generate QR code data
    const qrCodeData = this.generateQRCodeData(createDto.productId);

    // Use transaction to create record and initial stage history
    const result = await this.prisma.$transaction(async (prisma) => {
      // 1. Create the supply chain record
      const record = await prisma.supplyChainRecord.create({
        data: {
          userId,
          productId: createDto.productId,
          productName: createDto.productName,
          speciesName: createDto.speciesName,
          sourceType: createDto.sourceType,
          productDescription: createDto.productDescription,
          batchId: createDto.batchId,
          currentStage: createDto.initialStage,
          qrCodeData,
          fileHashes: createDto.fileHashes || [],
          status: ProductStatus.ACTIVE,
          isPublic: createDto.isPublic ?? true,
          qualityGrade: createDto.qualityGrade,
          certifications: createDto.certifications || [],
          
          // Stage-specific data stored as JSON
          hatcheryData: createDto.hatcheryData as any,
          growOutData: createDto.growOutData as any,
          harvestData: createDto.harvestData as any,
          fishingData: createDto.fishingData as any,
          processingData: createDto.processingData as any,
          distributionData: createDto.distributionData as any,
          retailData: createDto.retailData as any,
        },
        include: {
          user: { include: { profile: true } }
        }
      });

      // 2. Create initial stage history entry
      await prisma.supplyChainStageHistory.create({
        data: {
          productId: createDto.productId,
          stage: createDto.initialStage,
          previousStage: null, // No previous stage for initial creation
          updatedBy: userId,
          notes: "Initial product creation",
          stageData: this.extractStageDataFromCreate(createDto) as any,
          fileHashes: createDto.fileHashes || [],
          qualityGrade: createDto.qualityGrade,
          testResults: this.extractTestResultsFromCreate(createDto) as any,
        }
      });

      return record;
    });

    this.logger.log(`Supply chain record created: ${createDto.productId} by ${user.profile?.organization || user.address}`);

    return this.formatRecordResponse(result);

  } catch (error) {
    this.logger.error(`Failed to create supply chain record: ${error.message}`);
    throw new BadRequestException('Failed to create supply chain record: ' + error.message);
  }
}
    
    async updateStage(
        productId: string, 
        userId: string, 
        updateDto: UpdateSupplyChainStageDto
    ): Promise<SupplyChainRecordResponseDto> {
  const record = await this.prisma.supplyChainRecord.findUnique({
    where: { productId },
    include: { 
      user: { include: { profile: true } }
    }
  });

  if (!record) {
    throw new NotFoundException('Supply chain record not found');
  }

  // Check if record is active
  if (record.status !== ProductStatus.ACTIVE) {
    throw new BadRequestException('Cannot update inactive product record');
  }

  // Verify user permissions
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true }
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  // Check if user can update this stage
  if (!this.canUpdateStage(user.role as UserRole, updateDto.stage)) {
    throw new ForbiddenException(`Role ${user.role} cannot update stage ${updateDto.stage}`);
  }

  // Validate stage progression
  this.validateStageProgression(record.currentStage as SupplyChainStage, updateDto.stage);

  // Validate stage data
  this.validateStageData(updateDto.stage, updateDto);

  // Get previous stage for history tracking
  const previousStage = record.currentStage;

  try {
    // Use Prisma transaction to update both record and create history entry
    const result = await this.prisma.$transaction(async (prisma) => {
      // 1. Update the main supply chain record
      const updatedRecord = await prisma.supplyChainRecord.update({
        where: { productId },
        data: {
          currentStage: updateDto.stage,
          qualityGrade: updateDto.qualityGrade || record.qualityGrade,
          certifications: updateDto.newCertifications ? 
            [...(record.certifications || []), ...updateDto.newCertifications] : 
            record.certifications,
          fileHashes: updateDto.fileHashes ? 
            [...(record.fileHashes || []), ...updateDto.fileHashes] : 
            record.fileHashes,
          
          // Update stage-specific data
          hatcheryData: updateDto.hatcheryData ? updateDto.hatcheryData as any : record.hatcheryData,
          growOutData: updateDto.growOutData ? updateDto.growOutData as any : record.growOutData,
          harvestData: updateDto.harvestData ? updateDto.harvestData as any : record.harvestData,
          fishingData: updateDto.fishingData ? updateDto.fishingData as any : record.fishingData,
          processingData: updateDto.processingData ? updateDto.processingData as any : record.processingData,
          distributionData: updateDto.distributionData ? updateDto.distributionData as any : record.distributionData,
          retailData: updateDto.retailData ? updateDto.retailData as any : record.retailData,
        },
        include: {
          user: { include: { profile: true } }
        }
      });

      // 2. Create stage history entry
      await prisma.supplyChainStageHistory.create({
        data: {
          productId,
          stage: updateDto.stage,
          previousStage,
          updatedBy: userId,
          notes: updateDto.notes,
          stageData: this.extractStageData(updateDto) as any,
          fileHashes: updateDto.fileHashes || [],
          qualityGrade: updateDto.qualityGrade,
          testResults: this.extractTestResults(updateDto) as any,
          // TODO: Add blockchain integration here if needed
          // blockchainHash: await this.recordStageOnBlockchain(productId, updateDto),
        }
      });

      return updatedRecord;
    });

    this.logger.log(`Supply chain stage updated: ${productId} → ${updateDto.stage} by ${user.profile?.organization || user.address}`);

    return this.formatRecordResponse(result);

  } catch (error) {
    this.logger.error(`Failed to update supply chain stage: ${error.message}`);
    throw new BadRequestException('Failed to update supply chain stage: ' + error.message);
  }
}

  async findAll(
    userId?: string,
    sourceType?: SourceType,
    stage?: SupplyChainStage,
    isPublic?: boolean
  ): Promise<SupplyChainRecordResponseDto[]> {
    const user = userId ? await this.prisma.user.findUnique({ where: { id: userId } }) : null;
    
    const whereClause: any = {};

    // If not admin, only show user's own records or public records
    if (!user || user.role !== UserRole.ADMIN) {
      if (userId) {
        whereClause.OR = [
          { userId },
          { isPublic: true }
        ];
      } else {
        whereClause.isPublic = true;
      }
    }

    // Apply filters
    if (sourceType) {
      whereClause.sourceType = sourceType;
    }

    if (stage) {
      whereClause.currentStage = stage;
    }

    if (isPublic !== undefined) {
      whereClause.isPublic = isPublic;
    }

    const records = await this.prisma.supplyChainRecord.findMany({
      where: whereClause,
      include: {
        user: {
          include: { profile: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return records.map(record => this.formatRecordResponse(record));
  }

  async findOne(productId: string, userId?: string): Promise<SupplyChainRecordResponseDto> {
    const record = await this.prisma.supplyChainRecord.findUnique({
      where: { productId },
      include: {
        user: {
          include: { profile: true }
        }
      }
    });

    if (!record) {
      throw new NotFoundException('Supply chain record not found');
    }

    // Check access permissions
    const user = userId ? await this.prisma.user.findUnique({ where: { id: userId } }) : null;
    
    if (!record.isPublic) {
      if (!user || (record.userId !== userId && user.role !== UserRole.ADMIN)) {
        throw new ForbiddenException('Access denied to this product record');
      }
    }

    return this.formatRecordResponse(record);
  }

  async getTraceabilityData(productId: string): Promise<ProductTraceabilityDto> {
  const record = await this.findOne(productId);
  
  // Get REAL stage history from database
  const stageHistory = await this.getStageHistory(productId);

  // Calculate meaningful summary data
  const firstStageDate = stageHistory.length > 0 ? stageHistory[0].updatedAt : record.createdAt;
  const lastUpdateDate = stageHistory.length > 0 ? stageHistory[stageHistory.length - 1].updatedAt : record.updatedAt;

  const summary = {
    totalStages: stageHistory.length,
    currentStageIndex: stageHistory.length - 1,
    daysInSupplyChain: Math.floor((Date.now() - firstStageDate.getTime()) / (1000 * 60 * 60 * 24)),
    lastUpdated: lastUpdateDate,
    totalStakeholders: new Set(stageHistory.map(h => h.updatedBy)).size, // Unique stakeholders
  };

  return {
    product: record,
    stageHistory: stageHistory.map(entry => ({
      stage: entry.stage as SupplyChainStage,
      updatedBy: entry.updatedBy,
      updatedAt: entry.updatedAt,
      notes: entry.notes,
      stakeholder: entry.stakeholder,
    })),
    summary,
  };
}

  async generateQRCode(productId: string): Promise<{ qrCode: string; url: string }> {
    const record = await this.findOne(productId);
    
    if (!record.isPublic) {
      throw new ForbiddenException('Cannot generate QR code for private product');
    }

    const traceUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/trace/${productId}`;
    
    return {
      qrCode: record.qrCodeData || this.generateQRCodeData(productId),
      url: traceUrl,
    };
  }

  async updateStatus(
    productId: string, 
    adminId: string, 
    status: ProductStatus,
    reason?: string
  ): Promise<SupplyChainRecordResponseDto> {
    // Verify admin role
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only administrators can update product status');
    }

    const updatedRecord = await this.prisma.supplyChainRecord.update({
      where: { productId },
      data: { 
        status,
        // Could add reason to a notes field if needed
      },
      include: {
        user: {
          include: { profile: true }
        }
      }
    });

    this.logger.log(`Product status updated: ${productId} → ${status} by admin`);

    return this.formatRecordResponse(updatedRecord);
  }

  async getStatistics(userId?: string): Promise<any> {
    const whereClause = userId ? { userId } : {};

    const [total, bySourceType, byStage, byStatus] = await Promise.all([
      this.prisma.supplyChainRecord.count({ where: whereClause }),
      this.prisma.supplyChainRecord.groupBy({
        by: ['sourceType'],
        where: whereClause,
        _count: { sourceType: true }
      }),
      this.prisma.supplyChainRecord.groupBy({
        by: ['currentStage'],
        where: whereClause,
        _count: { currentStage: true }
      }),
      this.prisma.supplyChainRecord.groupBy({
        by: ['status'],
        where: whereClause,
        _count: { status: true }
      })
    ]);

    return {
      totalRecords: total,
      sourceTypeBreakdown: bySourceType.reduce((acc, item) => {
        acc[item.sourceType] = item._count.sourceType;
        return acc;
      }, {} as Record<string, number>),
      stageBreakdown: byStage.reduce((acc, item) => {
        acc[item.currentStage] = item._count.currentStage;
        return acc;
      }, {} as Record<string, number>),
      statusBreakdown: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {} as Record<string, number>),
    };
  }



  async getStageHistory(productId: string): Promise<StageHistoryResponseDto[]> {
  const record = await this.prisma.supplyChainRecord.findUnique({
    where: { productId },
  });

  if (!record) {
    throw new NotFoundException('Supply chain record not found');
  }

  // Check access permissions for private products
  if (!record.isPublic) {
    throw new ForbiddenException('Product not publicly accessible');
  }

  const stageHistory = await this.prisma.supplyChainStageHistory.findMany({
    where: { productId },
    include: {
      user: {
        include: { profile: true }
      }
    },
    orderBy: { updatedAt: 'asc' } // Chronological order
  });

  return stageHistory.map(entry => ({
    id: entry.id,
    stage: entry.stage,
    previousStage: entry.previousStage,
    updatedBy: entry.updatedBy,
    updatedAt: entry.updatedAt,
    notes: entry.notes,
    stageData: entry.stageData,
    fileHashes: entry.fileHashes || [],
    location: entry.location,
    qualityGrade: entry.qualityGrade,
    testResults: entry.testResults,
    blockchainHash: entry.blockchainHash,
    stakeholder: {
      id: entry.user.id,
      name: entry.user.profile?.firstName && entry.user.profile?.lastName ? 
        `${entry.user.profile.firstName} ${entry.user.profile.lastName}` : undefined,
      organization: entry.user.profile?.organization || null,
      role: entry.user.role,
    }
  }));
}





  // ===== PRIVATE HELPER METHODS =====

  private formatRecordResponse(record: any): SupplyChainRecordResponseDto {
    return {
      id: record.id,
      productId: record.productId,
      productName: record.productName,
      speciesName: record.speciesName,
      userId: record.userId,
      batchId: record.batchId,
      sourceType: record.sourceType as SourceType,
      productDescription: record.productDescription,
      currentStage: record.currentStage as SupplyChainStage,
      qrCodeData: record.qrCodeData,
      fileHashes: record.fileHashes || [],
      dataHash: record.dataHash,
      blockchainHash: record.blockchainHash,
      status: record.status as ProductStatus,
      isPublic: record.isPublic,
      qualityGrade: record.qualityGrade,
      certifications: record.certifications || [],
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      
      // Stage-specific data
      hatcheryData: record.hatcheryData,
      growOutData: record.growOutData,
      harvestData: record.harvestData,
      fishingData: record.fishingData,
      processingData: record.processingData,
      distributionData: record.distributionData,
      retailData: record.retailData,

      creator: {
        id: record.user.id,
        firstName: record.user.profile?.firstName,
        lastName: record.user.profile?.lastName,
        organization: record.user.profile?.organization,
        role: record.user.role,
      }
    };
  }

  private validateStageData(stage: SupplyChainStage, data: any): void {
    switch (stage) {
      case SupplyChainStage.HATCHERY:
        if (!data.hatcheryData) {
          throw new BadRequestException('Hatchery data is required for HATCHERY stage');
        }
        break;
      case SupplyChainStage.GROW_OUT:
        if (!data.growOutData) {
          throw new BadRequestException('Grow-out data is required for GROW_OUT stage');
        }
        break;
      case SupplyChainStage.HARVEST:
        if (!data.harvestData) {
          throw new BadRequestException('Harvest data is required for HARVEST stage');
        }
        break;
      case SupplyChainStage.FISHING:
        if (!data.fishingData) {
          throw new BadRequestException('Fishing data is required for FISHING stage');
        }
        break;
      case SupplyChainStage.PROCESSING:
        if (!data.processingData) {
          throw new BadRequestException('Processing data is required for PROCESSING stage');
        }
        break;
      case SupplyChainStage.DISTRIBUTION:
        if (!data.distributionData) {
          throw new BadRequestException('Distribution data is required for DISTRIBUTION stage');
        }
        break;
      case SupplyChainStage.RETAIL:
        if (!data.retailData) {
          throw new BadRequestException('Retail data is required for RETAIL stage');
        }
        break;
    }
  }

  private validateStageProgression(currentStage: SupplyChainStage, newStage: SupplyChainStage): void {
    const farmedProgression = [
      SupplyChainStage.HATCHERY,
      SupplyChainStage.GROW_OUT,
      SupplyChainStage.HARVEST,
      SupplyChainStage.PROCESSING,
      SupplyChainStage.DISTRIBUTION,
      SupplyChainStage.RETAIL
    ];

    const wildProgression = [
      SupplyChainStage.FISHING,
      SupplyChainStage.PROCESSING,
      SupplyChainStage.DISTRIBUTION,
      SupplyChainStage.RETAIL
    ];

    // Allow legitimate stage progressions
    const currentFarmedIndex = farmedProgression.indexOf(currentStage);
    const newFarmedIndex = farmedProgression.indexOf(newStage);

    const currentWildIndex = wildProgression.indexOf(currentStage);
    const newWildIndex = wildProgression.indexOf(newStage);

    // Check farmed progression
    if (currentFarmedIndex >= 0 && newFarmedIndex >= 0) {
      if (newFarmedIndex <= currentFarmedIndex) {
        throw new BadRequestException('Cannot move backwards in supply chain stages');
      }
    }

    // Check wild progression
    if (currentWildIndex >= 0 && newWildIndex >= 0) {
      if (newWildIndex <= currentWildIndex) {
        throw new BadRequestException('Cannot move backwards in supply chain stages');
      }
    }

    // Check cross-progression validity
    if ((currentFarmedIndex >= 0 && newWildIndex >= 0) || 
        (currentWildIndex >= 0 && newFarmedIndex >= 0)) {
      throw new BadRequestException('Invalid stage transition between farmed and wild capture workflows');
    }
  }

  private canUpdateStage(userRole: UserRole, stage: SupplyChainStage): boolean {
    const stagePermissions: Record<SupplyChainStage, UserRole[]> = {
      [SupplyChainStage.HATCHERY]: [UserRole.ADMIN, UserRole.FARMER],
      [SupplyChainStage.GROW_OUT]: [UserRole.ADMIN, UserRole.FARMER],
      [SupplyChainStage.HARVEST]: [UserRole.ADMIN, UserRole.FARMER],
      [SupplyChainStage.FISHING]: [UserRole.ADMIN, UserRole.FISHERMAN],
      [SupplyChainStage.PROCESSING]: [UserRole.ADMIN, UserRole.PROCESSOR],
      [SupplyChainStage.DISTRIBUTION]: [UserRole.ADMIN, UserRole.TRADER],
      [SupplyChainStage.RETAIL]: [UserRole.ADMIN, UserRole.RETAILER],
    };

    return stagePermissions[stage]?.includes(userRole) || false;
  }

    private generateQRCodeData(productId: string): string {
        const traceUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/trace/${productId}`;
        return JSON.stringify({
        productId,
        traceUrl,
        timestamp: new Date().toISOString(),
        });
    }


    private extractStageData(updateDto: UpdateSupplyChainStageDto): any {
  // Extract only the relevant stage data based on the stage type
  switch (updateDto.stage) {
    case SupplyChainStage.HATCHERY:
      return updateDto.hatcheryData;
    case SupplyChainStage.GROW_OUT:
      return updateDto.growOutData;
    case SupplyChainStage.HARVEST:
      return updateDto.harvestData;
    case SupplyChainStage.FISHING:
      return updateDto.fishingData;
    case SupplyChainStage.PROCESSING:
      return updateDto.processingData;
    case SupplyChainStage.DISTRIBUTION:
      return updateDto.distributionData;
    case SupplyChainStage.RETAIL:
      return updateDto.retailData;
    default:
      return null;
  }
}

private extractTestResults(updateDto: UpdateSupplyChainStageDto): any {
  // Extract test results if present in the stage data
  const stageData = this.extractStageData(updateDto);
  return stageData?.testResults || stageData?.qualityTests || null;
}

private extractStageDataFromCreate(createDto: CreateSupplyChainRecordDto): any {
  // Extract stage data based on initial stage
  switch (createDto.initialStage) {
    case SupplyChainStage.HATCHERY:
      return createDto.hatcheryData;
    case SupplyChainStage.GROW_OUT:
      return createDto.growOutData;
    case SupplyChainStage.HARVEST:
      return createDto.harvestData;
    case SupplyChainStage.FISHING:
      return createDto.fishingData;
    case SupplyChainStage.PROCESSING:
      return createDto.processingData;
    case SupplyChainStage.DISTRIBUTION:
      return createDto.distributionData;
    case SupplyChainStage.RETAIL:
      return createDto.retailData;
    default:
      return null;
  }
}

private extractTestResultsFromCreate(createDto: CreateSupplyChainRecordDto): any {
  const stageData = this.extractStageDataFromCreate(createDto);
  return stageData?.testResults || stageData?.qualityTests || null;
}
    
}
