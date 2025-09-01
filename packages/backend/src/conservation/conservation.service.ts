import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConservationRecordResponseDto, RecordStatus } from './dto/conservation-record-response.dto';
import { CreateConservationRecordDto } from './dto/create-conservation-record.dto';
import { UpdateConservationRecordDto } from './dto/update-conservation-record.dto';



import { UserRole } from '../common/enums/user-role.enum';





@Injectable()
export class ConservationService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDto: CreateConservationRecordDto): Promise<ConservationRecordResponseDto> {
    // Verify user has researcher role
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    if (!user || user.role !== UserRole.RESEARCHER) {
      throw new ForbiddenException('Only researchers can create conservation records');
    }

    // Check for duplicate sampling ID
    const existingRecord = await this.prisma.conservationRecord.findFirst({
      where: { samplingId: createDto.samplingId }
    });

    if (existingRecord) {
      throw new BadRequestException('A record with this sampling ID already exists');
    }

    try {
      const record = await this.prisma.conservationRecord.create({
        data: {
          userId,
          samplingId: createDto.samplingId,
          locationData: createDto.locationData as any,
          speciesData: createDto.speciesData as any,
          samplingData: createDto.samplingData as any,
          labTests: createDto.labTests as any,
          fileHashes: createDto.fileHashes || [],
          researcherNotes: createDto.researcherNotes,
          weatherConditions: createDto.weatherConditions,
          tidalConditions: createDto.tidalConditions,
          status: RecordStatus.DRAFT,
        },
        include: {
          user: {
            include: { profile: true }
          }
        }
      });

      return this.formatRecordResponse(record);
    } catch (error) {
      throw new BadRequestException('Failed to create conservation record: ' + error.message);
    }
  }

  async findAll(userId?: string, status?: RecordStatus): Promise<ConservationRecordResponseDto[]> {
    const whereClause: any = {};
    
    if (userId) {
      whereClause.userId = userId;
    }
    
    if (status) {
      whereClause.status = status;
    }

    const records = await this.prisma.conservationRecord.findMany({
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

  async findOne(id: string, userId?: string): Promise<ConservationRecordResponseDto> {
    const whereClause: any = { id };
    
    // Non-admin users can only see their own records or published records
    if (userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user?.role !== UserRole.ADMIN) {
        whereClause.OR = [
          { userId },
          { status: RecordStatus.PUBLISHED }
        ];
      }
    }

    const record = await this.prisma.conservationRecord.findFirst({
      where: whereClause,
      include: {
        user: {
          include: { profile: true }
        }
      }
    });

    if (!record) {
      throw new NotFoundException('Conservation record not found');
    }

    return this.formatRecordResponse(record);
  }

  async update(id: string, userId: string, updateDto: UpdateConservationRecordDto): Promise<ConservationRecordResponseDto> {
    const record = await this.prisma.conservationRecord.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!record) {
      throw new NotFoundException('Conservation record not found');
    }

    // Only the creator or admin can update
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (record.userId !== userId && user?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only update your own records');
    }

    // Cannot update verified/published records unless admin
    if ([RecordStatus.VERIFIED, RecordStatus.PUBLISHED].includes(record.status as RecordStatus) && user?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Cannot update verified or published records');
    }

    try {
      const updatedRecord = await this.prisma.conservationRecord.update({
        where: { id },
        data: {
          ...updateDto,
          locationData: updateDto.locationData as any,
          speciesData: updateDto.speciesData as any,
          samplingData: updateDto.samplingData as any,
          labTests: updateDto.labTests as any,
        },
        include: {
          user: {
            include: { profile: true }
          }
        }
      });

      return this.formatRecordResponse(updatedRecord);
    } catch (error) {
      throw new BadRequestException('Failed to update conservation record: ' + error.message);
    }
  }

  async updateStatus(id: string, adminId: string, status: RecordStatus, verificationNotes?: string): Promise<ConservationRecordResponseDto> {
    // Verify admin role
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only administrators can update record status');
    }

    const record = await this.prisma.conservationRecord.findUnique({ where: { id } });
    if (!record) {
      throw new NotFoundException('Conservation record not found');
    }

    const updateData: any = { status };
    
    if (status === RecordStatus.VERIFIED) {
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

    return this.formatRecordResponse(updatedRecord);
  }

  async delete(id: string, userId: string): Promise<void> {
    const record = await this.prisma.conservationRecord.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!record) {
      throw new NotFoundException('Conservation record not found');
    }

    // Only the creator or admin can delete
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (record.userId !== userId && user?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only delete your own records');
    }

    // Cannot delete verified/published records unless admin
    if ([RecordStatus.VERIFIED, RecordStatus.PUBLISHED].includes(record.status as RecordStatus) && user?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Cannot delete verified or published records');
    }

    await this.prisma.conservationRecord.delete({ where: { id } });
  }

  async getStatistics(userId?: string): Promise<any> {
    const whereClause = userId ? { userId } : {};

    const [total, byStatus, recentRecords] = await Promise.all([
      this.prisma.conservationRecord.count({ where: whereClause }),
      this.prisma.conservationRecord.groupBy({
        by: ['status'],
        where: whereClause,
        _count: { status: true }
      }),
      this.prisma.conservationRecord.findMany({
        where: whereClause,
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          samplingId: true,
          status: true,
          createdAt: true,
          speciesData: true,
        }
      })
    ]);

    return {
      totalRecords: total,
      statusBreakdown: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {} as Record<string, number>),
      recentRecords
    };
  }

  private formatRecordResponse(record: any): ConservationRecordResponseDto {
    return {
      id: record.id,
      samplingId: record.samplingId,
      userId: record.userId,
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
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      verifiedAt: record.verifiedAt,
      verifiedBy: record.verifiedBy,
      verificationNotes: record.verificationNotes,
      researcher: {
        id: record.user.id,
        firstName: record.user.profile?.firstName,
        lastName: record.user.profile?.lastName,
        organization: record.user.profile?.organization,
      }
    };
  }
}