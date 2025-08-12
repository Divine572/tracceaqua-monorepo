

import { IsEnum, IsOptional, IsString, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/user-role.enum';
import { ApplicationStatus } from '../../common/enums/application-status.enum';


// Query DTO for fetching role applications

export class ApplicationFilterDto {
    @ApiPropertyOptional({
        enum: ApplicationStatus,
        description: 'Filter by application status'
    })
    @IsOptional()
    @IsEnum(ApplicationStatus)
    status?: ApplicationStatus;

    @ApiPropertyOptional({
        description: 'Page number for pagination',
        example: 1,
        default: 1
    })
    @IsOptional()
    page?: number = 1;

    @ApiPropertyOptional({
        description: 'Number of items per page',
        example: 10,
        default: 10
    })
    @IsOptional()
    limit?: number = 10;
}

// Response DTOs
export class RoleApplicationResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    userId: string;

    @ApiProperty({ enum: UserRole })
    requestedRole: UserRole;

    @ApiProperty({ enum: ApplicationStatus })
    status: ApplicationStatus;

    @ApiPropertyOptional()
    organization?: string;

    @ApiPropertyOptional()
    licenseNumber?: string;

    @ApiPropertyOptional()
    businessType?: string;

    @ApiPropertyOptional()
    experience?: string;

    @ApiPropertyOptional()
    motivation?: string;

    @ApiProperty({ type: [String] })
    documents: string[];

    @ApiPropertyOptional()
    reviewedBy?: string;

    @ApiPropertyOptional()
    adminFeedback?: string;

    @ApiPropertyOptional()
    reviewedAt?: Date;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    @ApiPropertyOptional()
    user?: any;

    @ApiPropertyOptional()
    reviewer?: any;
}

export class ApplicationStatsResponseDto {
    @ApiProperty()
    total: number;

    @ApiProperty({
        type: 'object',
        properties: {
            pending: { type: 'number' },
            approved: { type: 'number' },
            rejected: { type: 'number' },
            underReview: { type: 'number' },
            resubmitted: { type: 'number' },
        }
    })
    byStatus: {
        pending: number;
        approved: number;
        rejected: number;
        underReview: number;
        resubmitted: number;
    };

    @ApiProperty({
        type: 'object',
        description: 'Application count by requested role',
        additionalProperties: { type: 'number' }
    })
    byRole: Record<string, number>;
}

export class PaginatedApplicationResponseDto {
    @ApiProperty({ type: [RoleApplicationResponseDto] })
    applications: RoleApplicationResponseDto[];

    @ApiProperty({
        type: 'object',
        properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' },
            hasNext: { type: 'boolean' },
            hasPrev: { type: 'boolean' },
        }
    })
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}