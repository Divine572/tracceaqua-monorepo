import { Injectable, NotFoundException, BadRequestException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FilesService } from '../files/files.service';
import { CreateSupplyChainRecordDto, SourceType, SupplyChainStage, ProductStatus } from './dto/create-supply-chain-record.dto';
import { UpdateSupplyChainStageDto } from './dto/update-supply-chain-stage.dto';
import { SupplyChainRecordResponseDto } from './dto/supply-chain-record-response.dto';


import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class SupplyChainService {
  constructor(
    private prisma: PrismaService,
    private filesService: FilesService,
  ) {}

  async create(userId: string, createDto: CreateSupplyChainRecordDto): Promise<SupplyChainRecordResponseDto> {
    try {
      // Check if product ID already exists
      const existingRecord = await this.prisma.supplyChainRecord.findUnique({
        where: { productId: createDto.productId }
      });

      if (existingRecord) {
        throw new BadRequestException('Product ID already exists');
      }

      // Validate source type and initial stage compatibility
      this.validateStageForSourceType(createDto.sourceType, createDto.currentStage);

      // Check if user has permission for the initial stage
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new ForbiddenException('User not found');
      }

      if (!this.canUserUpdateStage(user.role, createDto.currentStage)) {
        throw new ForbiddenException('Insufficient permissions for this stage');
      }

      // Upload initial data to IPFS if requested
      let dataHash: string | null = null;
      if (createDto.uploadToIPFS) {
        const ipfsData = {
          productId: createDto.productId,
          batchId: createDto.batchId,
          sourceType: createDto.sourceType,
          speciesName: createDto.speciesName,
          productName: createDto.productName,
          productDescription: createDto.productDescription,
          currentStage: createDto.currentStage,
          stageData: this.getStageData(createDto, createDto.currentStage),
          certifications: createDto.certifications,
          qualityMetrics: createDto.qualityMetrics,
          sustainabilityScore: createDto.sustainabilityScore,
          timestamp: new Date().toISOString()
        };

        const uploadResult = await this.filesService.uploadJson(
          ipfsData,
          `supply-chain-${createDto.productId}.json`,
          createDto.productId
        );
        dataHash = uploadResult.hash;
      }

      // Create supply chain record
      const record = await this.prisma.supplyChainRecord.create({
        data: {
          productId: createDto.productId,
          userId,
          batchId: createDto.batchId,
          sourceType: createDto.sourceType,
          speciesName: createDto.speciesName,
          productName: createDto.productName,
          productDescription: createDto.productDescription,
          hatcheryData: createDto.hatcheryData,
          growOutData: createDto.growOutData,
          harvestData: createDto.harvestData,
          fishingData: createDto.fishingData,
          processingData: createDto.processingData,
          distributionData: createDto.distributionData,
          retailData: createDto.retailData,
          currentStage: createDto.currentStage,
          productStatus: 'ACTIVE',
          certifications: createDto.certifications || [],
          qualityMetrics: createDto.qualityMetrics,
          fileHashes: createDto.fileHashes || [],
          sustainabilityScore: createDto.sustainabilityScore,
          isPublic: createDto.isPublic || false,
          tags: createDto.tags || [],
          dataHash,
        },
        include: {
          user: {
            include: { profile: true }
          }
        }
      });

      // Create initial stage history entry
      await this.prisma.supplyChainStageHistory.create({
        data: {
          productId: createDto.productId,
          userId,
          stage: createDto.currentStage,
          location: createDto.location || '',
          timestamp: new Date(),
          notes: 'Initial stage creation',
          data: this.getStageData(createDto, createDto.currentStage),
          fileHashes: createDto.fileHashes || [],
        }
      });

      return this.mapToResponseDto(record);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create supply chain record');
    }
  }

  async findAll(userId?: string, sourceType?: SourceType, stage?: SupplyChainStage, isPublic?: boolean): Promise<SupplyChainRecordResponseDto[]> {
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (sourceType) {
      where.sourceType = sourceType;
    }

    if (stage) {
      where.currentStage = stage;
    }

    if (isPublic !== undefined) {
      where.isPublic = isPublic;
    }

    const records = await this.prisma.supplyChainRecord.findMany({
      where,
      include: {
        user: {
          include: { profile: true }
        },
        stageHistory: {
          include: {
            user: {
              include: { profile: true }
            }
          },
          orderBy: { timestamp: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return records.map(record => this.mapToResponseDto(record));
  }

  async findOne(productId: string, userId?: string): Promise<SupplyChainRecordResponseDto> {
    const record = await this.prisma.supplyChainRecord.findUnique({
      where: { productId },
      include: {
        user: {
          include: { profile: true }
        },
        stageHistory: {
          include: {
            user: {
              include: { profile: true }
            }
          },
          orderBy: { timestamp: 'asc' }
        }
      }
    });

    if (!record) {
      throw new NotFoundException('Supply chain record not found');
    }

    // Check access permissions for private records
    if (!record.isPublic && userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (record.userId !== userId && user?.role !== UserRole.ADMIN) {
        throw new ForbiddenException('Insufficient permissions to access this record');
      }
    }

    return this.mapToResponseDto(record);
  }

  async updateStage(productId: string, userId: string, updateDto: UpdateSupplyChainStageDto): Promise<SupplyChainRecordResponseDto> {
    const record = await this.prisma.supplyChainRecord.findUnique({
      where: { productId }
    });

    if (!record) {
      throw new NotFoundException('Supply chain record not found');
    }

    // Validate stage progression
    if (!this.isValidStageProgression(record.currentStage as SupplyChainStage, updateDto.newStage)) {
      throw new BadRequestException('Invalid stage progression');
    }

    // Check if user has permission to update this stage
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    if (!this.canUserUpdateStage(user.role, updateDto.newStage)) {
      throw new ForbiddenException('Insufficient permissions to update to this stage');
    }

    // Upload updated data to IPFS if requested
    let newDataHash = record.dataHash;
    if (updateDto.updateIPFS) {
      const ipfsData = {
        productId,
        currentStage: updateDto.newStage,
        stageData: updateDto.stageData,
        location: updateDto.location,
        notes: updateDto.notes,
        timestamp: new Date().toISOString(),
        updatedBy: user?.address || userId
      };

      const uploadResult = await this.filesService.uploadJson(
        ipfsData,
        `supply-chain-${productId}-${updateDto.newStage.toLowerCase()}.json`,
        productId
      );
      newDataHash = uploadResult.hash;
    }

    // Update record and create stage history entry
    const [updatedRecord] = await Promise.all([
      this.prisma.supplyChainRecord.update({
        where: { productId },
        data: {
          currentStage: updateDto.newStage,
          dataHash: newDataHash,
          updatedAt: new Date(),
        },
        include: {
          user: {
            include: { profile: true }
          },
          stageHistory: {
            include: {
              user: {
                include: { profile: true }
              }
            },
            orderBy: { timestamp: 'asc' }
          }
        }
      }),
      this.prisma.supplyChainStageHistory.create({
        data: {
          productId,
          userId,
          stage: updateDto.newStage,
          location: updateDto.location || '',
          timestamp: new Date(),
          notes: updateDto.notes || '',
          data: updateDto.stageData,
          fileHashes: updateDto.fileHashes || [],
        }
      })
    ]);

    return this.mapToResponseDto(updatedRecord);
  }

  async getTraceability(productId: string): Promise<any> {
    const record = await this.prisma.supplyChainRecord.findUnique({
      where: { productId },
      include: {
        user: {
          include: { profile: true }
        },
        stageHistory: {
          include: {
            user: {
              include: { profile: true }
            }
          },
          orderBy: { timestamp: 'asc' }
        }
      }
    });

    if (!record) {
      throw new NotFoundException('Product not found');
    }

    if (!record.isPublic) {
      throw new ForbiddenException('This product is not available for public tracing');
    }

    // Calculate journey statistics
    const totalStages = record.stageHistory.length;
    const timeInSupplyChain = record.stageHistory.length > 0
      ? new Date().getTime() - new Date(record.stageHistory[0].timestamp).getTime()
      : 0;
    const daysInSupplyChain = Math.floor(timeInSupplyChain / (1000 * 60 * 60 * 24));

    return {
      product: {
        id: record.productId,
        name: record.productName,
        species: record.speciesName,
        sourceType: record.sourceType,
        description: record.productDescription,
        currentStage: record.currentStage,
        sustainabilityScore: record.sustainabilityScore,
        certifications: record.certifications,
        batchId: record.batchId,
        tags: record.tags,
      },
      journey: record.stageHistory.map(stage => ({
        stage: stage.stage,
        timestamp: stage.timestamp,
        location: stage.location,
        stakeholder: {
          name: stage.user.profile
            ? `${stage.user.profile.firstName || ''} ${stage.user.profile.lastName || ''}`.trim()
            : 'Unknown',
          organization: stage.user.profile?.organization || 'Unknown Organization',
          role: stage.user.role,
          address: stage.user.address.slice(0, 6) + '...' + stage.user.address.slice(-4)
        },
        notes: stage.notes,
        data: stage.data,
        fileHashes: stage.fileHashes,
      })),
      metadata: {
        createdAt: record.createdAt,
        lastUpdated: record.updatedAt,
        totalStages,
        daysInSupplyChain,
        dataHash: record.dataHash,
        blockchainHash: record.blockchainHash,
      }
    };
  }

  async getStatistics(userId?: string): Promise<any> {
    const where: any = {};
    if (userId) {
      where.userId = userId;
    }

    const [total, bySourceType, byStage, byStatus, avgSustainability] = await Promise.all([
      this.prisma.supplyChainRecord.count({ where }),
      this.prisma.supplyChainRecord.groupBy({
        by: ['sourceType'],
        where,
        _count: { sourceType: true }
      }),
      this.prisma.supplyChainRecord.groupBy({
        by: ['currentStage'],
        where,
        _count: { currentStage: true }
      }),
      this.prisma.supplyChainRecord.groupBy({
        by: ['productStatus'],
        where,
        _count: { productStatus: true }
      }),
      this.prisma.supplyChainRecord.aggregate({
        where: {
          ...where,
          sustainabilityScore: { not: null }
        },
        _avg: { sustainabilityScore: true },
        _count: { sustainabilityScore: true }
      })
    ]);

    const sourceTypeCounts = bySourceType.reduce((acc, item) => {
      acc[item.sourceType] = item._count.sourceType;
      return acc;
    }, {} as Record<string, number>);

    const stageCounts = byStage.reduce((acc, item) => {
      acc[item.currentStage] = item._count.currentStage;
      return acc;
    }, {} as Record<string, number>);

    const statusCounts = byStatus.reduce((acc, item) => {
      acc[item.productStatus] = item._count.productStatus;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      sourceTypeCounts,
      stageCounts,
      statusCounts,
      sustainability: {
        averageScore: avgSustainability._avg.sustainabilityScore || 0,
        totalRated: avgSustainability._count.sustainabilityScore || 0
      },
      lastUpdated: new Date().toISOString()
    };
  }

  async searchProducts(query: string, userId?: string, isPublicOnly: boolean = false): Promise<SupplyChainRecordResponseDto[]> {
    const where: any = {
      OR: [
        { productId: { contains: query, mode: 'insensitive' } },
        { productName: { contains: query, mode: 'insensitive' } },
        { speciesName: { contains: query, mode: 'insensitive' } },
        { productDescription: { contains: query, mode: 'insensitive' } },
        { batchId: { contains: query, mode: 'insensitive' } },
      ]
    };

    if (userId && !isPublicOnly) {
      where.userId = userId;
    }

    if (isPublicOnly) {
      where.isPublic = true;
    }

    const records = await this.prisma.supplyChainRecord.findMany({
      where,
      include: {
        user: {
          include: { profile: true }
        },
        stageHistory: {
          include: {
            user: {
              include: { profile: true }
            }
          },
          orderBy: { timestamp: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit search results
    });

    return records.map(record => this.mapToResponseDto(record));
  }

  async updateProductStatus(productId: string, userId: string, status: ProductStatus): Promise<SupplyChainRecordResponseDto> {
    const record = await this.prisma.supplyChainRecord.findUnique({
      where: { productId }
    });

    if (!record) {
      throw new NotFoundException('Supply chain record not found');
    }

    // Check permissions
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (record.userId !== userId && user?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Insufficient permissions to update product status');
    }

    const updatedRecord = await this.prisma.supplyChainRecord.update({
      where: { productId },
      data: {
        productStatus: status,
        updatedAt: new Date(),
      },
      include: {
        user: {
          include: { profile: true }
        },
        stageHistory: {
          include: {
            user: {
              include: { profile: true }
            }
          },
          orderBy: { timestamp: 'asc' }
        }
      }
    });

    return this.mapToResponseDto(updatedRecord);
  }

  private validateStageForSourceType(sourceType: SourceType, stage: SupplyChainStage): void {
    const farmedStages = [SupplyChainStage.HATCHERY, SupplyChainStage.GROW_OUT, SupplyChainStage.HARVEST];
    const wildStages = [SupplyChainStage.FISHING];
    const commonStages = [SupplyChainStage.PROCESSING, SupplyChainStage.DISTRIBUTION, SupplyChainStage.RETAIL];

    if (sourceType === SourceType.FARMED) {
      if (!farmedStages.includes(stage) && !commonStages.includes(stage)) {
        throw new BadRequestException('Invalid stage for farmed products');
      }
    } else if (sourceType === SourceType.WILD_CAPTURE) {
      if (!wildStages.includes(stage) && !commonStages.includes(stage)) {
        throw new BadRequestException('Invalid stage for wild-capture products');
      }
    }
  }

  private isValidStageProgression(currentStage: SupplyChainStage, newStage: SupplyChainStage): boolean {
    const stageOrder = {
      [SupplyChainStage.HATCHERY]: 1,
      [SupplyChainStage.GROW_OUT]: 2,
      [SupplyChainStage.HARVEST]: 3,
      [SupplyChainStage.FISHING]: 3, // Same level as harvest
      [SupplyChainStage.PROCESSING]: 4,
      [SupplyChainStage.DISTRIBUTION]: 5,
      [SupplyChainStage.RETAIL]: 6,
    };

    const currentOrder = stageOrder[currentStage];
    const newOrder = stageOrder[newStage];

    // Allow progression to the same stage or next stage
    return newOrder >= currentOrder;
  }

  private canUserUpdateStage(userRole: string, stage: SupplyChainStage): boolean {
    const stagePermissions = {
      [SupplyChainStage.HATCHERY]: [UserRole.FARMER, UserRole.ADMIN],
      [SupplyChainStage.GROW_OUT]: [UserRole.FARMER, UserRole.ADMIN],
      [SupplyChainStage.HARVEST]: [UserRole.FARMER, UserRole.FISHERMAN, UserRole.ADMIN],
      [SupplyChainStage.FISHING]: [UserRole.FISHERMAN, UserRole.ADMIN],
      [SupplyChainStage.PROCESSING]: [UserRole.PROCESSOR, UserRole.ADMIN],
      [SupplyChainStage.DISTRIBUTION]: [UserRole.TRADER, UserRole.ADMIN],
      [SupplyChainStage.RETAIL]: [UserRole.RETAILER, UserRole.ADMIN],
    };

    return stagePermissions[stage]?.includes(userRole as UserRole) || false;
  }

  private getStageData(createDto: CreateSupplyChainRecordDto, stage: SupplyChainStage): any {
    switch (stage) {
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

  private mapToResponseDto(record: any): SupplyChainRecordResponseDto {
    return {
      id: record.id,
      productId: record.productId,
      batchId: record.batchId,
      sourceType: record.sourceType,
      speciesName: record.speciesName,
      productName: record.productName,
      productDescription: record.productDescription,
      hatcheryData: record.hatcheryData,
      growOutData: record.growOutData,
      harvestData: record.harvestData,
      fishingData: record.fishingData,
      processingData: record.processingData,
      distributionData: record.distributionData,
      retailData: record.retailData,
      currentStage: record.currentStage,
      productStatus: record.productStatus,
      certifications: record.certifications,
      qualityMetrics: record.qualityMetrics,
      fileHashes: record.fileHashes,
      sustainabilityScore: record.sustainabilityScore,
      isPublic: record.isPublic,
      tags: record.tags,
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
          organization: record.user.profile.organization,
        } : null
      },
      stageHistory: record.stageHistory?.map(stage => ({
        id: stage.id,
        stage: stage.stage,
        location: stage.location,
        timestamp: stage.timestamp,
        notes: stage.notes,
        data: stage.data,
        fileHashes: stage.fileHashes,
        user: {
          id: stage.user.id,
          role: stage.user.role,
          profile: stage.user.profile ? {
            firstName: stage.user.profile.firstName,
            lastName: stage.user.profile.lastName,
            organization: stage.user.profile.organization,
          } : null
        }
      })) || []
    };
  }
}