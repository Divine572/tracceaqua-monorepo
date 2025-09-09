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
import { createHash } from 'crypto';


import {
  LocationDataDto,
  SpeciesDataDto,
  SamplingDataDto,
  LabTestDto,
  CreateConservationRecordDto,
  UpdateConservationRecordDto,
  VerifyConservationRecordDto,
  GetConservationRecordsDto,
  ConservationRecordResponseDto,
  PaginatedConservationResponseDto

} from './dto/conservation.dto'


@Injectable()
export class ConservationService {
  private readonly logger = new Logger(ConservationService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly blockchainService: BlockchainService,
    private readonly filesService: FilesService,
  ) { }

  // ===== CREATE CONSERVATION RECORD =====

  async createConservationRecord(
    userId: string,
    createDto: CreateConservationRecordDto,
    files?: Express.Multer.File[]
  ): Promise<ConservationRecordResponseDto> {
    try {
      this.logger.log(`Creating conservation record: ${createDto.samplingId} by user: ${userId}`);

      // 1. Validate user permissions
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
        include: { profile: true }
      });

      if (!user || user.role !== 'RESEARCHER') {
        throw new ForbiddenException('Only researchers can create conservation records');
      }

      // 2. Check if sampling ID already exists
      const existingRecord = await this.prismaService.conservationRecord.findUnique({
        where: { samplingId: createDto.samplingId }
      });

      if (existingRecord) {
        throw new BadRequestException('Sampling ID already exists');
      }

      // 3. Process uploaded files to IPFS
      let fileHashes: string[] = [];
      if (files && files.length > 0) {
        this.logger.log(`Uploading ${files.length} files to IPFS...`);
        const uploadResults = await this.filesService.uploadFiles(files);
        fileHashes = uploadResults.map(result => result.hash).filter(hash => hash); // Filter out empty hashes
        this.logger.log(`Files uploaded to IPFS: ${fileHashes.join(', ')}`);
      }

      // 4. Create record in database
      const record = await this.prismaService.conservationRecord.create({
        data: {
          samplingId: createDto.samplingId,
          userId,
          locationData: createDto.locationData as any,
          speciesData: createDto.speciesData as any,
          samplingData: createDto.samplingData as any,
          labTests: createDto.labTests as any || [],
          fileHashes,
          researcherNotes: createDto.researcherNotes,
          weatherConditions: createDto.weatherConditions,
          tidalConditions: createDto.tidalConditions,
          status: 'DRAFT'
        },
        include: {
          user: {
            include: { profile: true }
          }
        }
      });

      // 5. Generate data hash for blockchain
      const dataHash = this.generateDataHash({
        samplingId: record.samplingId,
        locationData: record.locationData,
        speciesData: record.speciesData,
        samplingData: record.samplingData,
        timestamp: record.createdAt.getTime(),
        researcher: userId
      });

      // 6. Update record with data hash
      const updatedRecord = await this.prismaService.conservationRecord.update({
        where: { id: record.id },
        data: { dataHash },
        include: {
          user: {
            include: { profile: true }
          }
        }
      });

      // 7. Record on blockchain (async - don't block user)
      this.recordOnBlockchainAsync(record.id, {
        recordId: record.id,
        samplingId: record.samplingId,
        dataHash,
        researcherId: userId,
        timestamp: record.createdAt.getTime()
      });

      this.logger.log(`✅ Conservation record created: ${record.id}`);

      return this.mapToResponseDto(updatedRecord);

    } catch (error) {
      this.logger.error('Failed to create conservation record:', error);
      throw error;
    }
  }

  // ===== GET CONSERVATION RECORDS =====

  async getConservationRecords(
    userId: string,
    query: GetConservationRecordsDto
  ): Promise<PaginatedConservationResponseDto> {
    try {
      const { page = 1, limit = 10, status, species, researcherId, search } = query;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      // If not admin, only show user's own records
      const user = await this.prismaService.user.findUnique({ where: { id: userId } });
      if (user?.role !== 'ADMIN') {
        where.userId = userId;
      }

      if (status) {
        where.status = status;
      }

      if (researcherId) {
        where.userId = researcherId;
      }

      if (species) {
        where.speciesData = {
          path: ['scientificName'],
          string_contains: species
        };
      }

      if (search) {
        where.OR = [
          { samplingId: { contains: search, mode: 'insensitive' } },
          { researcherNotes: { contains: search, mode: 'insensitive' } },
          {
            speciesData: {
              path: ['commonName'],
              string_contains: search
            }
          }
        ];
      }

      // Get total count and records
      const [total, records] = await Promise.all([
        this.prismaService.conservationRecord.count({ where }),
        this.prismaService.conservationRecord.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              include: { profile: true }
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
      this.logger.error('Failed to get conservation records:', error);
      throw error;
    }
  }

  // ===== GET SINGLE RECORD =====

  async getConservationRecordById(
    recordId: string,
    userId: string
  ): Promise<ConservationRecordResponseDto> {
    try {
      const record = await this.prismaService.conservationRecord.findUnique({
        where: { id: recordId },
        include: {
          user: {
            include: { profile: true }
          }
        }
      });

      if (!record) {
        throw new NotFoundException('Conservation record not found');
      }

      // Check permissions
      const user = await this.prismaService.user.findUnique({ where: { id: userId } });
      if (user?.role !== 'ADMIN' && record.userId !== userId) {
        throw new ForbiddenException('Access denied to this record');
      }

      return this.mapToResponseDto(record);

    } catch (error) {
      this.logger.error('Failed to get conservation record:', error);
      throw error;
    }
  }

  // ===== UPDATE RECORD =====

  async updateConservationRecord(
    recordId: string,
    userId: string,
    updateDto: UpdateConservationRecordDto,
    files?: Express.Multer.File[]
  ): Promise<ConservationRecordResponseDto> {
    try {
      const record = await this.prismaService.conservationRecord.findUnique({
        where: { id: recordId }
      });

      if (!record) {
        throw new NotFoundException('Conservation record not found');
      }

      // Check permissions
      const user = await this.prismaService.user.findUnique({ where: { id: userId } });
      if (user?.role !== 'ADMIN' && record.userId !== userId) {
        throw new ForbiddenException('Access denied to this record');
      }

      // Can't update verified records
      if (record.status === 'VERIFIED') {
        throw new BadRequestException('Cannot update verified records');
      }

      // Process new files
      let newFileHashes: string[] = [];
      if (files && files.length > 0) {
        const uploadResults = await this.filesService.uploadFiles(files);
        newFileHashes = uploadResults.map(result => result.hash).filter(hash => hash);
      }

      // Combine existing and new file hashes
      const allFileHashes = [...record.fileHashes, ...newFileHashes];

      // Update record
      const updatedRecord = await this.prismaService.conservationRecord.update({
        where: { id: recordId },
        data: {
          locationData: updateDto.locationData as any,
          speciesData: updateDto.speciesData as any,
          samplingData: updateDto.samplingData as any,
          labTests: updateDto.labTests as any,
          researcherNotes: updateDto.researcherNotes,
          weatherConditions: updateDto.weatherConditions,
          tidalConditions: updateDto.tidalConditions,
          fileHashes: allFileHashes,
          updatedAt: new Date()
        },
        include: {
          user: {
            include: { profile: true }
          }
        }
      });

      // Regenerate data hash if core data changed
      if (updateDto.locationData || updateDto.speciesData || updateDto.samplingData) {
        const newDataHash = this.generateDataHash({
          samplingId: updatedRecord.samplingId,
          locationData: updatedRecord.locationData,
          speciesData: updatedRecord.speciesData,
          samplingData: updatedRecord.samplingData,
          timestamp: updatedRecord.createdAt.getTime(),
          researcher: updatedRecord.userId
        });

        await this.prismaService.conservationRecord.update({
          where: { id: recordId },
          data: { dataHash: newDataHash }
        });
      }

      this.logger.log(`✅ Conservation record updated: ${recordId}`);

      return this.mapToResponseDto(updatedRecord);

    } catch (error) {
      this.logger.error('Failed to update conservation record:', error);
      throw error;
    }
  }

  // ===== ADMIN VERIFICATION =====

  async verifyConservationRecord(
    recordId: string,
    adminId: string,
    verifyDto: VerifyConservationRecordDto
  ): Promise<ConservationRecordResponseDto> {
    try {
      const record = await this.prismaService.conservationRecord.findUnique({
        where: { id: recordId }
      });

      if (!record) {
        throw new NotFoundException('Conservation record not found');
      }

      const newStatus = verifyDto.action === 'approve' ? 'VERIFIED' : 'REJECTED';

      const updatedRecord = await this.prismaService.conservationRecord.update({
        where: { id: recordId },
        data: {
          status: newStatus,
          verifiedAt: new Date(),
          verifiedBy: adminId,
          verificationNotes: verifyDto.verificationNotes
        },
        include: {
          user: {
            include: { profile: true }
          }
        }
      });

      // If approved, verify on blockchain
      if (verifyDto.action === 'approve') {
        this.verifyOnBlockchainAsync(record.samplingId, adminId);
      }

      this.logger.log(`✅ Conservation record ${verifyDto.action}d: ${recordId} by admin: ${adminId}`);

      return this.mapToResponseDto(updatedRecord);

    } catch (error) {
      this.logger.error('Failed to verify conservation record:', error);
      throw error;
    }
  }

  // ===== DELETE RECORD =====

  async deleteConservationRecord(recordId: string, userId: string): Promise<void> {
    try {
      const record = await this.prismaService.conservationRecord.findUnique({
        where: { id: recordId }
      });

      if (!record) {
        throw new NotFoundException('Conservation record not found');
      }

      // Check permissions
      const user = await this.prismaService.user.findUnique({ where: { id: userId } });
      if (user?.role !== 'ADMIN' && record.userId !== userId) {
        throw new ForbiddenException('Access denied to this record');
      }

      // Can't delete verified records
      if (record.status === 'VERIFIED') {
        throw new BadRequestException('Cannot delete verified records');
      }

      await this.prismaService.conservationRecord.delete({
        where: { id: recordId }
      });

      this.logger.log(`🗑️ Conservation record deleted: ${recordId}`);

    } catch (error) {
      this.logger.error('Failed to delete conservation record:', error);
      throw error;
    }
  }

  // ===== UTILITY METHODS =====

  private generateDataHash(data: any): string {
    const dataString = JSON.stringify(data, Object.keys(data).sort());
    return createHash('sha256').update(dataString).digest('hex');
  }

  private mapToResponseDto(record: any): ConservationRecordResponseDto {
    return {
      id: record.id,
      samplingId: record.samplingId,
      userId: record.userId,
      locationData: record.locationData,
      speciesData: record.speciesData,
      samplingData: record.samplingData,
      labTests: record.labTests || [],
      fileHashes: record.fileHashes || [],
      researcherNotes: record.researcherNotes,
      weatherConditions: record.weatherConditions,
      tidalConditions: record.tidalConditions,
      status: record.status,
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
        profile: record.user.profile ? {
          firstName: record.user.profile.firstName,
          lastName: record.user.profile.lastName,
          organization: record.user.profile.organization
        } : undefined
      }
    };
  }

  // ===== ASYNC BLOCKCHAIN OPERATIONS =====

  private async recordOnBlockchainAsync(recordId: string, blockchainData: any): Promise<void> {
    try {
      const txResult = await this.blockchainService.recordConservationData(blockchainData);

      await this.prismaService.conservationRecord.update({
        where: { id: recordId },
        data: {
          blockchainHash: txResult.transactionHash,
          status: 'SUBMITTED'
        }
      });

      this.logger.log(`✅ Conservation record ${recordId} recorded on blockchain: ${txResult.transactionHash}`);

    } catch (error) {
      this.logger.error(`❌ Failed to record conservation record ${recordId} on blockchain:`, error);

      await this.prismaService.conservationRecord.update({
        where: { id: recordId },
        data: {
          status: 'BLOCKCHAIN_FAILED'
        }
      });
    }
  }

  private async verifyOnBlockchainAsync(samplingId: string, adminId: string): Promise<void> {
    try {
      await this.blockchainService.verifyConservationRecord(samplingId, adminId);
      this.logger.log(`✅ Conservation record verified on blockchain: ${samplingId}`);
    } catch (error) {
      this.logger.error(`❌ Failed to verify conservation record on blockchain: ${samplingId}`, error);
    }
  }
}
