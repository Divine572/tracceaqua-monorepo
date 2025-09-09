import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { FilesService } from '../files/files.service';
import { QRCodeService } from './qr-code.service';
import { createHash } from 'crypto';



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



@Injectable()
export class SupplyChainService {
  private readonly logger = new Logger(SupplyChainService.name);

  // Role-based stage permissions
  private readonly stagePermissions = {
    [SupplyChainStage.HATCHERY]: ['FARMER'],
    [SupplyChainStage.GROW_OUT]: ['FARMER'],
    [SupplyChainStage.FISHING]: ['FISHERMAN'],
    [SupplyChainStage.HARVEST]: ['FARMER', 'FISHERMAN'],
    [SupplyChainStage.PROCESSING]: ['PROCESSOR'],
    [SupplyChainStage.COLD_STORAGE]: ['PROCESSOR', 'TRADER'],
    [SupplyChainStage.TRANSPORT]: ['TRADER', 'RETAILER'],
    [SupplyChainStage.RETAIL]: ['RETAILER'],
    [SupplyChainStage.CONSUMER]: ['RETAILER']
  };

  // Valid stage transitions
  private readonly stageTransitions = {
    [SupplyChainStage.HATCHERY]: [SupplyChainStage.GROW_OUT],
    [SupplyChainStage.GROW_OUT]: [SupplyChainStage.HARVEST],
    [SupplyChainStage.FISHING]: [SupplyChainStage.PROCESSING, SupplyChainStage.HARVEST],
    [SupplyChainStage.HARVEST]: [SupplyChainStage.PROCESSING, SupplyChainStage.COLD_STORAGE],
    [SupplyChainStage.PROCESSING]: [SupplyChainStage.COLD_STORAGE, SupplyChainStage.TRANSPORT],
    [SupplyChainStage.COLD_STORAGE]: [SupplyChainStage.TRANSPORT],
    [SupplyChainStage.TRANSPORT]: [SupplyChainStage.RETAIL],
    [SupplyChainStage.RETAIL]: [SupplyChainStage.CONSUMER]
  };

  constructor(
    private readonly prismaService: PrismaService,
    private readonly blockchainService: BlockchainService,
    private readonly filesService: FilesService,
    private readonly qrCodeService: QRCodeService,
  ) {}

  // ===== CREATE SUPPLY CHAIN RECORD =====

  async createSupplyChainRecord(
    userId: string,
    createDto: CreateSupplyChainRecordDto,
    files?: Express.Multer.File[]
  ): Promise<SupplyChainRecordResponseDto> {
    try {
      this.logger.log(`Creating supply chain record: ${createDto.productId} by user: ${userId}`);

      // 1. Validate user and determine initial stage
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
        include: { profile: true }
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const initialStage = this.determineInitialStage(createDto.sourceType, user.role);
      if (!this.canUserCreateStage(user.role, initialStage)) {
        throw new ForbiddenException(`Role ${user.role} cannot create ${initialStage} stage`);
      }

      // 2. Check if product ID already exists
      const existingRecord = await this.prismaService.supplyChainRecord.findUnique({
        where: { productId: createDto.productId }
      });

      if (existingRecord) {
        throw new BadRequestException('Product ID already exists');
      }

      // 3. Process uploaded files
      let fileHashes: string[] = [];
      if (files && files.length > 0) {
        this.logger.log(`Uploading ${files.length} files to IPFS...`);
        const uploadResults = await this.filesService.uploadFiles(files);
        fileHashes = uploadResults.map(result => result.hash).filter(hash => hash);
      }

      // 4. Create record in database
      const record = await this.prismaService.supplyChainRecord.create({
        data: {
          productId: createDto.productId,
          userId,
          batchId: createDto.batchId,
          sourceType: createDto.sourceType,
          speciesName: createDto.speciesName,
          productName: createDto.productName,
          productDescription: createDto.productDescription,
          currentStage: initialStage,
          productStatus: 'ACTIVE',
          isPublic: createDto.isPublic ?? true,
          hatcheryData: createDto.hatcheryData as any,
          growOutData: createDto.growOutData as any,
          fishingData: createDto.fishingData as any,
          harvestData: createDto.harvestData as any,
          processingData: createDto.processingData as any,
          distributionData: createDto.storageData as any, // Map storageData to distributionData
          // Note: transportData doesn't exist in schema, using distributionData
          fileHashes
        },
        include: {
          user: { include: { profile: true } },
          stageHistory: {
            include: { user: { include: { profile: true } } },
            orderBy: { timestamp: 'asc' }
          }
        }
      });

      // 5. Create initial stage history
      await this.prismaService.supplyChainStageHistory.create({
        data: {
          productId: record.productId,
          stage: initialStage,
          userId,
          timestamp: new Date(),
          data: this.getStageData(createDto, initialStage),
          location: createDto.location || 'Not specified',
          notes: createDto.notes || '',
          fileHashes
        }
      });

      // 6. Generate data hash
      const dataHash = this.generateDataHash({
        productId: record.productId,
        sourceType: record.sourceType,
        speciesName: record.speciesName,
        initialStage,
        timestamp: record.createdAt.getTime(),
        creator: userId
      });

      // 7. Update with data hash
      const updatedRecord = await this.prismaService.supplyChainRecord.update({
        where: { id: record.id },
        data: { dataHash },
        include: {
          user: { include: { profile: true } },
          stageHistory: {
            include: { user: { include: { profile: true } } },
            orderBy: { timestamp: 'asc' }
          }
        }
      });

      // 8. Record on blockchain (async)
      this.recordOnBlockchainAsync(record.id, {
        recordId: record.id,
        productId: record.productId,
        dataHash,
        stage: initialStage,
        userId,
        timestamp: record.createdAt.getTime()
      });

      this.logger.log(`✅ Supply chain record created: ${record.id}`);

      return this.mapToResponseDto(updatedRecord);

    } catch (error) {
      this.logger.error('Failed to create supply chain record:', error);
      throw error;
    }
  }

  // ===== UPDATE SUPPLY CHAIN STAGE =====

  async updateSupplyChainStage(
    userId: string,
    productId: string,
    updateDto: UpdateSupplyChainStageDto,
    files?: Express.Multer.File[]
  ): Promise<SupplyChainRecordResponseDto> {
    try {
      this.logger.log(`Updating supply chain stage: ${productId} to ${updateDto.newStage} by user: ${userId}`);

      // 1. Get existing record
      const record = await this.prismaService.supplyChainRecord.findUnique({
        where: { productId },
        include: {
          stageHistory: { orderBy: { timestamp: 'desc' } },
          user: { include: { profile: true } }
        }
      });

      if (!record) {
        throw new NotFoundException('Supply chain record not found');
      }

      // 2. Validate user and stage transition
      const user = await this.prismaService.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!this.canUserUpdateToStage(user.role, updateDto.newStage, record.currentStage)) {
        throw new ForbiddenException(`Cannot transition from ${record.currentStage} to ${updateDto.newStage}`);
      }

      // 3. Validate stage sequence
      if (!this.isValidStageTransition(record.currentStage, updateDto.newStage)) {
        throw new BadRequestException(`Invalid stage transition from ${record.currentStage} to ${updateDto.newStage}`);
      }

      // 4. Process uploaded files
      let fileHashes: string[] = [];
      if (files && files.length > 0) {
        const uploadResults = await this.filesService.uploadFiles(files);
        fileHashes = uploadResults.map(result => result.hash).filter(hash => hash);
      }

      // 5. Update record
      const updatedRecord = await this.prismaService.supplyChainRecord.update({
        where: { productId },
        data: {
          currentStage: updateDto.newStage,
          ...this.getUpdateDataForStage(updateDto.newStage, updateDto.stageData),
          updatedAt: new Date()
        },
        include: {
          user: { include: { profile: true } },
          stageHistory: {
            include: { user: { include: { profile: true } } },
            orderBy: { timestamp: 'asc' }
          }
        }
      });

      // 6. Add stage history
      await this.prismaService.supplyChainStageHistory.create({
        data: {
          productId: record.productId,
          stage: updateDto.newStage,
          userId,
          timestamp: new Date(),
          data: updateDto.stageData,
          location: updateDto.location || 'Not specified',
          notes: updateDto.notes || '',
          fileHashes
        }
      });

      // 7. Update on blockchain (async)
      const previousStageHash = this.getLastStageHash(record.stageHistory);
      this.updateSupplyChainStageOnBlockchainAsync(productId, {
        productId,
        newStage: updateDto.newStage,
        stageDataHash: this.generateDataHash(updateDto.stageData),
        previousStageHash,
        userId,
        timestamp: Date.now()
      });

      this.logger.log(`✅ Supply chain stage updated: ${productId} -> ${updateDto.newStage}`);

      return this.mapToResponseDto(updatedRecord);

    } catch (error) {
      this.logger.error('Failed to update supply chain stage:', error);
      throw error;
    }
  }

  // ===== GET SUPPLY CHAIN RECORDS =====

  async getSupplyChainRecords(
    userId: string,
    query: GetSupplyChainRecordsDto
  ): Promise<PaginatedSupplyChainResponseDto> {
    try {
      const { page = 1, limit = 10, status, stage, sourceType, species, search, creatorId } = query;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      // If not admin, only show user's own records or public records
      const user = await this.prismaService.user.findUnique({ where: { id: userId } });
      if (user?.role !== 'ADMIN') {
        where.OR = [
          { userId },
          { isPublic: true }
        ];
      }

      if (status) {
        where.status = status;
      }

      if (stage) {
        where.currentStage = stage;
      }

      if (sourceType) {
        where.sourceType = sourceType;
      }

      if (species) {
        where.speciesName = { contains: species, mode: 'insensitive' };
      }

      if (creatorId) {
        where.userId = creatorId;
      }

      if (search) {
        where.OR = [
          { productId: { contains: search, mode: 'insensitive' } },
          { productName: { contains: search, mode: 'insensitive' } },
          { speciesName: { contains: search, mode: 'insensitive' } },
          { batchId: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Get total count and records
      const [total, records] = await Promise.all([
        this.prismaService.supplyChainRecord.count({ where }),
        this.prismaService.supplyChainRecord.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { include: { profile: true } },
            stageHistory: {
              include: { user: { include: { profile: true } } },
              orderBy: { timestamp: 'asc' }
            }
          }
        })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: records.map(record => this.mapToResponseDto(record)),
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      };

    } catch (error) {
      this.logger.error('Failed to get supply chain records:', error);
      throw error;
    }
  }

  // ===== GET SINGLE RECORD =====

  async getSupplyChainRecordByProductId(
    productId: string,
    userId?: string
  ): Promise<SupplyChainRecordResponseDto> {
    try {
      const record = await this.prismaService.supplyChainRecord.findUnique({
        where: { productId },
        include: {
          user: { include: { profile: true } },
          stageHistory: {
            include: { user: { include: { profile: true } } },
            orderBy: { timestamp: 'asc' }
          }
        }
      });

      if (!record) {
        throw new NotFoundException('Supply chain record not found');
      }

      // Check if record is public or user has access
      if (!record.isPublic && userId) {
        const user = await this.prismaService.user.findUnique({ where: { id: userId } });
        if (user?.role !== 'ADMIN' && record.userId !== userId) {
          throw new ForbiddenException('Access denied to this record');
        }
      }

      return this.mapToResponseDto(record);

    } catch (error) {
      this.logger.error('Failed to get supply chain record:', error);
      throw error;
    }
  }

  // ===== QR CODE GENERATION =====

  async generateQRCode(
    userId: string,
    productId: string,
    qrDto: GenerateQRCodeDto
  ): Promise<QRCodeResponseDto> {
    try {
      const record = await this.prismaService.supplyChainRecord.findUnique({
        where: { productId }
      });

      if (!record) {
        throw new NotFoundException('Supply chain record not found');
      }

      // Check permissions
      const user = await this.prismaService.user.findUnique({ where: { id: userId } });
      if (user?.role !== 'ADMIN' && record.userId !== userId) {
        throw new ForbiddenException('Access denied to generate QR code');
      }

      return this.qrCodeService.generateQRCode(productId, qrDto);

    } catch (error) {
      this.logger.error('Failed to generate QR code:', error);
      throw error;
    }
  }

  // ===== CONSUMER FEEDBACK =====

  async addConsumerFeedback(
    productId: string,
    feedbackDto: ConsumerFeedbackDto
  ): Promise<any> {
    try {
      const record = await this.prismaService.supplyChainRecord.findUnique({
        where: { productId }
      });

      if (!record) {
        throw new NotFoundException('Supply chain record not found');
      }

      if (!record.isPublic) {
        throw new ForbiddenException('Feedback not allowed for private records');
      }

      // Store feedback (you'll need to create a feedback table)
      // This is a placeholder implementation

      this.logger.log(`Consumer feedback added for product: ${productId}`);

      return { message: 'Feedback added successfully' };

    } catch (error) {
      this.logger.error('Failed to add consumer feedback:', error);
      throw error;
    }
  }

  // ===== PUBLIC TRACEABILITY METHODS =====

  /**
   * Get public traceability information for a product
   * This method provides detailed information about the product's journey
   */
  async traceProduct(productId: string): Promise<any> {
    try {
      this.logger.log(`Tracing product: ${productId}`);

      const record = await this.prismaService.supplyChainRecord.findUnique({
        where: { productId },
        include: {
          user: {
            include: { profile: true }
          },
          stageHistory: {
            include: { 
              user: { include: { profile: true } }
            },
            orderBy: { timestamp: 'asc' }
          }
        }
      });

      if (!record) {
        throw new NotFoundException('Product not found');
      }

      // Only return data if the record is public or if it's a simple trace request
      if (!record.isPublic) {
        // Return minimal information for private records
        return {
          exists: true,
          public: false,
          productId: record.productId,
          speciesName: record.speciesName,
          productName: record.productName,
          message: 'This product record is private'
        };
      }

      // For public records, return full traceability information
      const traceabilityData = {
        productId: record.productId,
        speciesName: record.speciesName,
        productName: record.productName,
        productDescription: record.productDescription,
        sourceType: record.sourceType,
        currentStage: record.currentStage,
        status: record.productStatus,
        batchId: record.batchId,
        isPublic: record.isPublic,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,

        // Creator information (anonymized for privacy)
        creator: {
          organization: record.user.profile?.organization || 'Not specified',
          role: record.user.role
        },

        // Stage history with detailed journey
        stageHistory: record.stageHistory.map(stage => ({
          stage: stage.stage,
          timestamp: stage.timestamp,
          location: stage.location,
          notes: stage.notes,
          data: stage.data,
          updatedBy: {
            organization: stage.user.profile?.organization || 'Not specified',
            role: stage.user.role
          }
        })),

        // Blockchain verification
        blockchainVerified: !!record.blockchainHash,
        blockchainHash: record.blockchainHash,
        dataHash: record.dataHash,

        // File attachments (if any)
        attachments: record.fileHashes.length,

        // Summary statistics
        totalStages: record.stageHistory.length,
        daysInSupplyChain: Math.floor((new Date().getTime() - record.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      };

      this.logger.log(`✅ Product traced successfully: ${productId}`);
      return traceabilityData;

    } catch (error) {
      this.logger.error(`Failed to trace product ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Get product feedback with pagination
   */
  async getProductFeedback(
    productId: string,
    verified: boolean = true,
    limit: number = 10
  ): Promise<any> {
    try {
      this.logger.log(`Getting feedback for product: ${productId}`);

      // Check if product exists and is public
      const record = await this.prismaService.supplyChainRecord.findUnique({
        where: { productId },
        select: { isPublic: true, productName: true, speciesName: true }
      });

      if (!record) {
        throw new NotFoundException('Product not found');
      }

      if (!record.isPublic) {
        throw new ForbiddenException('Feedback not available for private products');
      }

      // Get feedback from the ConsumerFeedback table
      const feedback = await this.prismaService.consumerFeedback.findMany({
        where: { 
          productId,
          // Add verified filter if needed (assuming there's a verified field)
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          rating: true,
          comment: true,
          consumerName: true,
          purchaseLocation: true,
          purchaseDate: true,
          createdAt: true,
          // Don't expose email for privacy
        }
      });

      // Calculate feedback statistics
      const totalFeedback = feedback.length;
      const averageRating = totalFeedback > 0
        ? feedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedback
        : 0;

      const ratingDistribution = {
        5: feedback.filter(f => f.rating === 5).length,
        4: feedback.filter(f => f.rating === 4).length,
        3: feedback.filter(f => f.rating === 3).length,
        2: feedback.filter(f => f.rating === 2).length,
        1: feedback.filter(f => f.rating === 1).length,
      };

      return {
        productId,
        productName: record.productName,
        speciesName: record.speciesName,
        feedbackSummary: {
          totalFeedback,
          averageRating: Math.round(averageRating * 10) / 10,
          ratingDistribution
        },
        feedback: feedback.map(f => ({
          id: f.id,
          rating: f.rating,
          comment: f.comment,
          consumerName: f.consumerName || 'Anonymous',
          purchaseLocation: f.purchaseLocation,
          purchaseDate: f.purchaseDate,
          createdAt: f.createdAt
        }))
      };

    } catch (error) {
      this.logger.error(`Failed to get product feedback for ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Get public statistics about the supply chain
   */
  async getPublicStatistics(): Promise<any> {
    try {
      this.logger.log('Getting public supply chain statistics');

      const [
        totalPublicProducts,
        totalStages,
        productsBySourceType,
        productsByCurrentStage,
        recentActivity,
        topSpecies
      ] = await Promise.all([
        // Total public products
        this.prismaService.supplyChainRecord.count({
          where: { isPublic: true }
        }),

        // Total stages tracked
        this.prismaService.supplyChainStageHistory.count(),

        // Products by source type
        this.prismaService.supplyChainRecord.groupBy({
          by: ['sourceType'],
          where: { isPublic: true },
          _count: { sourceType: true }
        }),

        // Products by current stage
        this.prismaService.supplyChainRecord.groupBy({
          by: ['currentStage'],
          where: { isPublic: true },
          _count: { currentStage: true }
        }),

        // Recent activity (last 30 days)
        this.prismaService.supplyChainRecord.count({
          where: {
            isPublic: true,
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        }),

        // Top species
        this.prismaService.supplyChainRecord.groupBy({
          by: ['speciesName'],
          where: { isPublic: true },
          _count: { speciesName: true },
          orderBy: { _count: { speciesName: 'desc' } },
          take: 5
        })
      ]);

      // Calculate additional metrics
      const blockchainVerifiedCount = await this.prismaService.supplyChainRecord.count({
        where: {
          isPublic: true,
          blockchainHash: { not: null }
        }
      });

      // Get average time in supply chain
      const completedProducts = await this.prismaService.supplyChainRecord.findMany({
        where: {
          isPublic: true,
          currentStage: SupplyChainStage.CONSUMER
        },
        select: {
          createdAt: true,
          updatedAt: true
        }
      });

      const averageDaysInSupplyChain = completedProducts.length > 0
        ? completedProducts.reduce((sum, product) => {
          const days = Math.floor((product.updatedAt.getTime() - product.createdAt.getTime()) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0) / completedProducts.length
        : 0;

      const statistics = {
        overview: {
          totalPublicProducts,
          totalStages,
          blockchainVerified: blockchainVerifiedCount,
          verificationRate: totalPublicProducts > 0 ? Math.round((blockchainVerifiedCount / totalPublicProducts) * 100) : 0,
          recentActivity,
          averageDaysInSupplyChain: Math.round(averageDaysInSupplyChain)
        },

        sourceTypes: productsBySourceType.map(item => ({
          type: item.sourceType,
          count: item._count.sourceType
        })),

        stageDistribution: productsByCurrentStage.map(item => ({
          stage: item.currentStage,
          count: item._count.currentStage
        })),

        topSpecies: topSpecies.map(item => ({
          species: item.speciesName,
          count: item._count.speciesName
        })),

        // Sustainability metrics
        sustainability: {
          trackedProducts: totalPublicProducts,
          transparencyScore: totalPublicProducts > 0 ? Math.round((totalPublicProducts / (totalPublicProducts + 100)) * 100) : 0, // Placeholder calculation
          avgStagesPerProduct: totalPublicProducts > 0 ? Math.round(totalStages / totalPublicProducts) : 0
        },

        lastUpdated: new Date()
      };

      this.logger.log(`✅ Public statistics retrieved successfully`);
      return statistics;

    } catch (error) {
      this.logger.error('Failed to get public statistics:', error);
      throw error;
    }
  }

  // ===== UTILITY METHODS =====

  private determineInitialStage(sourceType: SourceType, userRole: string): SupplyChainStage {
    if (sourceType === SourceType.FARMED) {
      if (userRole === 'FARMER') {
        return SupplyChainStage.HATCHERY;
      }
    } else if (sourceType === SourceType.WILD_CAPTURE) {
      if (userRole === 'FISHERMAN') {
        return SupplyChainStage.FISHING;
      }
    }

    // Default fallback based on role
    const roleStageMapping = {
      FARMER: SupplyChainStage.HARVEST,
      FISHERMAN: SupplyChainStage.FISHING,
      PROCESSOR: SupplyChainStage.PROCESSING,
      TRADER: SupplyChainStage.TRANSPORT,
      RETAILER: SupplyChainStage.RETAIL
    };

    return roleStageMapping[userRole] || SupplyChainStage.PROCESSING;
  }

  private canUserCreateStage(userRole: string, stage: SupplyChainStage): boolean {
    return this.stagePermissions[stage]?.includes(userRole) || false;
  }

  private canUserUpdateToStage(userRole: string, newStage: SupplyChainStage, currentStage: string): boolean {
    return this.canUserCreateStage(userRole, newStage) &&
      this.isValidStageTransition(currentStage, newStage);
  }

  private isValidStageTransition(currentStage: string, newStage: SupplyChainStage): boolean {
    return this.stageTransitions[currentStage]?.includes(newStage) || false;
  }

  private getStageData(createDto: CreateSupplyChainRecordDto, stage: SupplyChainStage): any {
    const stageDataMapping = {
      [SupplyChainStage.HATCHERY]: createDto.hatcheryData,
      [SupplyChainStage.GROW_OUT]: createDto.growOutData,
      [SupplyChainStage.FISHING]: createDto.fishingData,
      [SupplyChainStage.HARVEST]: createDto.harvestData,
      [SupplyChainStage.PROCESSING]: createDto.processingData,
      [SupplyChainStage.COLD_STORAGE]: createDto.storageData,
      [SupplyChainStage.TRANSPORT]: createDto.transportData
    };

    return stageDataMapping[stage] || {};
  }

  private getUpdateDataForStage(stage: SupplyChainStage, stageData: any): any {
    const updateDataMapping = {
      [SupplyChainStage.HATCHERY]: { hatcheryData: stageData },
      [SupplyChainStage.GROW_OUT]: { growOutData: stageData },
      [SupplyChainStage.FISHING]: { fishingData: stageData },
      [SupplyChainStage.HARVEST]: { harvestData: stageData },
      [SupplyChainStage.PROCESSING]: { processingData: stageData },
      [SupplyChainStage.COLD_STORAGE]: { storageData: stageData },
      [SupplyChainStage.TRANSPORT]: { transportData: stageData }
    };

    return updateDataMapping[stage] || {};
  }

  private getLastStageHash(stageHistory: any[]): string {
    if (stageHistory.length === 0) return '';
    return this.generateDataHash(stageHistory[stageHistory.length - 1]);
  }

  private generateDataHash(data: any): string {
    const dataString = JSON.stringify(data, Object.keys(data).sort());
    return createHash('sha256').update(dataString).digest('hex');
  }

  private mapToResponseDto(record: any): SupplyChainRecordResponseDto {
    return {
      id: record.id,
      productId: record.productId,
      userId: record.userId,
      batchId: record.batchId,
      sourceType: record.sourceType,
      speciesName: record.speciesName,
      productName: record.productName,
      productDescription: record.productDescription,
      currentStage: record.currentStage,
      status: record.productStatus, // Map productStatus to status for API response
      isPublic: record.isPublic,
      hatcheryData: record.hatcheryData,
      growOutData: record.growOutData,
      fishingData: record.fishingData,
      harvestData: record.harvestData,
      processingData: record.processingData,
      storageData: record.distributionData, // Map distributionData back to storageData
      transportData: undefined, // Not available in schema
      fileHashes: record.fileHashes || [],
      dataHash: record.dataHash,
      blockchainHash: record.blockchainHash,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      user: {
        id: record.user.id,
        address: record.user.address,
        role: record.user.role,
        profile: record.user.profile ? {
          firstName: record.user.profile.firstName,
          lastName: record.user.profile.lastName,
          organization: record.user.profile.organization
        } : undefined
      },
      stageHistory: record.stageHistory?.map(stage => ({
        id: stage.id,
        stage: stage.stage,
        userId: stage.userId,
        timestamp: stage.timestamp,
        data: stage.data,
        location: stage.location,
        notes: stage.notes,
        fileHashes: stage.fileHashes || [],
        blockchainHash: stage.blockchainHash,
        user: {
          id: stage.user.id,
          address: stage.user.address,
          role: stage.user.role,
          profile: stage.user.profile ? {
            firstName: stage.user.profile.firstName,
            lastName: stage.user.profile.lastName,
            organization: stage.user.profile.organization
          } : undefined
        }
      })) || [],
      feedbackCount: 0, // Placeholder
      averageRating: 0 // Placeholder
    };
  }

  // ===== ASYNC BLOCKCHAIN OPERATIONS =====

  private async recordOnBlockchainAsync(recordId: string, blockchainData: any): Promise<void> {
    try {
      const txResult = await this.blockchainService.recordSupplyChainData(blockchainData);

      await this.prismaService.supplyChainRecord.update({
        where: { id: recordId },
        data: {
          blockchainHash: txResult.transactionHash
        }
      });

      this.logger.log(`✅ Supply chain record ${recordId} recorded on blockchain: ${txResult.transactionHash}`);

    } catch (error) {
      this.logger.error(`❌ Failed to record supply chain record ${recordId} on blockchain:`, error);

      await this.prismaService.supplyChainRecord.update({
        where: { id: recordId },
        data: { productStatus: 'BLOCKCHAIN_FAILED' }
      });
    }
  }

  private async updateSupplyChainStageOnBlockchainAsync(productId: string, blockchainData: any): Promise<void> {
    try {
      const txResult = await this.blockchainService.updateSupplyChainStage(blockchainData);

      // Update the main supply chain record with blockchain hash since stage history doesn't have this field
      await this.prismaService.supplyChainRecord.updateMany({
        where: { productId },
        data: {
          blockchainHash: txResult.transactionHash
        }
      });

      this.logger.log(`✅ Supply chain stage updated on blockchain: ${txResult.transactionHash}`);

    } catch (error) {
      this.logger.error(`❌ Failed to update supply chain stage on blockchain:`, error);
    }
  }
}
