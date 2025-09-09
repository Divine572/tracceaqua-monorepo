import { Injectable, NotFoundException, BadRequestException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FilesService } from '../files/files.service';
import { CreateConservationRecordDto } from './dto/create-conservation-record.dto';
import { UpdateConservationRecordDto } from './dto/update-conservation-record.dto';
import { ConservationRecordResponseDto, RecordStatus } from './dto/conservation-record-response.dto';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class ConservationService {
  constructor(
    private prisma: PrismaService,
    private filesService: FilesService,
  ) { }

  async create(userId: string, createDto: CreateConservationRecordDto): Promise<ConservationRecordResponseDto> {
    try {
      // Check if sampling ID already exists
      const existingRecord = await this.prisma.conservationRecord.findUnique({
        where: { samplingId: createDto.samplingId }
      });

      if (existingRecord) {
        throw new BadRequestException('Sampling ID already exists');
      }

      // Validate required fields
      if (!createDto.locationData || !createDto.speciesData || !createDto.samplingData) {
        throw new BadRequestException('Location data, species data, and sampling data are required');
      }

      // Upload data to IPFS if needed
      let dataHash: string | null = null;
      if (createDto.uploadToIPFS) {
        const ipfsData = {
          samplingId: createDto.samplingId,
          locationData: createDto.locationData,
          speciesData: createDto.speciesData,
          samplingData: createDto.samplingData,
          labTests: createDto.labTests,
          researcherNotes: createDto.researcherNotes,
          weatherConditions: createDto.weatherConditions,
          tidalConditions: createDto.tidalConditions,
          timestamp: new Date().toISOString()
        };

        const uploadResult = await this.filesService.uploadJson(
          ipfsData,
          `conservation-${createDto.samplingId}.json`,
          createDto.samplingId
        );
        dataHash = uploadResult.hash;
      }

      // Create the conservation record
      const record = await this.prisma.conservationRecord.create({
        data: {
          samplingId: createDto.samplingId,
          userId,
          locationData: createDto.locationData,
          speciesData: createDto.speciesData,
          samplingData: createDto.samplingData,
          labTests: createDto.labTests || null,
          fileHashes: createDto.fileHashes || [],
          researcherNotes: createDto.researcherNotes,
          weatherConditions: createDto.weatherConditions,
          tidalConditions: createDto.tidalConditions,
          status: 'DRAFT',
          dataHash,
        },
        include: {
          user: {
            include: { profile: true }
          }
        }
      });

      return this.mapToResponseDto(record);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create conservation record');
    }
  }

  async findAll(userId?: string, status?: RecordStatus): Promise<ConservationRecordResponseDto[]> {
    const where: any = {};
    
    if (userId) {
      where.userId = userId;
    }
    
    if (status) {
      where.status = status;
    }

    const records = await this.prisma.conservationRecord.findMany({
      where,
      include: {
        user: {
          include: { profile: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return records.map(record => this.mapToResponseDto(record));
  }

  async findOne(id: string, userId: string): Promise<ConservationRecordResponseDto> {
    const record = await this.prisma.conservationRecord.findUnique({
      where: { id },
      include: {
        user: {
          include: { profile: true }
        }
      }
    });

    if (!record) {
      throw new NotFoundException('Conservation record not found');
    }

    // Check if user can access this record
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (record.userId !== userId && user?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Insufficient permissions to access this record');
    }

    return this.mapToResponseDto(record);
  }

  async update(id: string, userId: string, updateDto: UpdateConservationRecordDto): Promise<ConservationRecordResponseDto> {
    const record = await this.prisma.conservationRecord.findUnique({
      where: { id }
    });

    if (!record) {
      throw new NotFoundException('Conservation record not found');
    }

    // Check permissions
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (record.userId !== userId && user?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Insufficient permissions to update this record');
    }

    // Prevent updates to verified records unless admin
    if (record.status === 'VERIFIED' && user?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Cannot update verified records');
    }

    // Update IPFS data if requested
    let newDataHash = record.dataHash;
    if (updateDto.updateIPFS && record.dataHash) {
      const ipfsData = {
        samplingId: record.samplingId,
        locationData: updateDto.locationData || record.locationData,
        speciesData: updateDto.speciesData || record.speciesData,
        samplingData: updateDto.samplingData || record.samplingData,
        labTests: updateDto.labTests || record.labTests,
        researcherNotes: updateDto.researcherNotes || record.researcherNotes,
        weatherConditions: updateDto.weatherConditions || record.weatherConditions,
        tidalConditions: updateDto.tidalConditions || record.tidalConditions,
        lastUpdated: new Date().toISOString()
      };

      // Delete old data and upload new
      if (record.dataHash) {
        await this.filesService.deleteFile(record.dataHash);
      }

      const uploadResult = await this.filesService.uploadJson(
        ipfsData,
        `conservation-${record.samplingId}-updated.json`,
        record.samplingId
      );
      newDataHash = uploadResult.hash;
    }

    const updatedRecord = await this.prisma.conservationRecord.update({
      where: { id },
      data: {
        ...updateDto,
        dataHash: newDataHash,
        updatedAt: new Date(),
      },
      include: {
        user: {
          include: { profile: true }
        }
      }
    });

    return this.mapToResponseDto(updatedRecord);
  }

  async updateStatus(id: string, adminId: string, status: RecordStatus, verificationNotes?: string): Promise<ConservationRecordResponseDto> {
    const record = await this.prisma.conservationRecord.findUnique({
      where: { id }
    });

    if (!record) {
      throw new NotFoundException('Conservation record not found');
    }

    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (status === 'VERIFIED') {
      updateData.verifiedAt = new Date();
      updateData.verifiedBy = adminId;
      updateData.verificationNotes = verificationNotes;
    }

    const updatedRecord = await this.prisma.conservationRecord.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          include: { profile: true }
        }
      }
    });

    return this.mapToResponseDto(updatedRecord);
  }

  async delete(id: string, userId: string): Promise<void> {
    const record = await this.prisma.conservationRecord.findUnique({
      where: { id }
    });

    if (!record) {
      throw new NotFoundException('Conservation record not found');
    }

    // Check permissions
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (record.userId !== userId && user?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Insufficient permissions to delete this record');
    }

    // Delete associated files from IPFS
    if (record.fileHashes && record.fileHashes.length > 0) {
      for (const hash of record.fileHashes as string[]) {
        try {
          await this.filesService.deleteFile(hash);
        } catch (error) {
          console.warn(`Failed to delete file ${hash}:`, error.message);
        }
      }
    }

    // Delete main data file from IPFS
    if (record.dataHash) {
      try {
        await this.filesService.deleteFile(record.dataHash);
      } catch (error) {
        console.warn(`Failed to delete data file ${record.dataHash}:`, error.message);
      }
    }

    await this.prisma.conservationRecord.delete({
      where: { id }
    });
  }

  async getStatistics(userId?: string): Promise<any> {
    const where: any = {};
    if (userId) {
      where.userId = userId;
    }

    const [total, byStatus, recent, bySpecies] = await Promise.all([
      this.prisma.conservationRecord.count({ where }),
      this.prisma.conservationRecord.groupBy({
        by: ['status'],
        where,
        _count: { status: true }
      }),
      this.prisma.conservationRecord.findMany({
        where: {
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        },
        select: { createdAt: true }
      }),
      this.prisma.conservationRecord.findMany({
        where,
        select: { speciesData: true }
      })
    ]);

    const statusCounts = byStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<string, number>);

    // Extract species information from speciesData JSON
    const speciesCounts = bySpecies.reduce((acc, record) => {
      const speciesData = record.speciesData as any;
      const species = speciesData?.primarySpecies || speciesData?.species || 'Unknown';
      acc[species] = (acc[species] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      statusCounts,
      speciesCounts,
      recentCount: recent.length,
      averagePerMonth: Math.round(total / 12), // Rough estimate
      lastUpdated: new Date().toISOString()
    };
  }

  async searchRecords(query: string, userId?: string): Promise<ConservationRecordResponseDto[]> {
    const where: any = {
      OR: [
        { samplingId: { contains: query, mode: 'insensitive' } },
        { researcherNotes: { contains: query, mode: 'insensitive' } },
        { weatherConditions: { contains: query, mode: 'insensitive' } },
      ]
    };

    if (userId) {
      where.userId = userId;
    }

    const records = await this.prisma.conservationRecord.findMany({
      where,
      include: {
        user: {
          include: { profile: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit search results
    });

    return records.map(record => this.mapToResponseDto(record));
  }

  async getRecordsBySamplingId(samplingId: string, userId: string): Promise<ConservationRecordResponseDto | null> {
    const record = await this.prisma.conservationRecord.findUnique({
      where: { samplingId },
      include: {
        user: {
          include: { profile: true }
        }
      }
    });

    if (!record) {
      return null;
    }

    // Check permissions
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (record.userId !== userId && user?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Insufficient permissions to access this record');
    }

    return this.mapToResponseDto(record);
  }

  private mapToResponseDto(record: any): ConservationRecordResponseDto {
    return {
      id: record.id,
      samplingId: record.samplingId,
      locationData: record.locationData,
      speciesData: record.speciesData,
      samplingData: record.samplingData,
      labTests: record.labTests,
      fileHashes: record.fileHashes,
      researcherNotes: record.researcherNotes,
      weatherConditions: record.weatherConditions,
      tidalConditions: record.tidalConditions,
      status: record.status as RecordStatus,
      dataHash: record.dataHash,
      blockchainHash: record.blockchainHash,
      verifiedAt: record.verifiedAt,
      verifiedBy: record.verifiedBy,
      verificationNotes: record.verificationNotes,
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
      }
    };
  }
}