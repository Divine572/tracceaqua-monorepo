import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsEnum,
  IsNumber,
  IsDateString,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  MinLength,
  MaxLength
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '../../common/enums/user-role.enum';
import { UserStatus } from '../../common/enums/user-status.enum';



// User Management DTOs
export class UpdateUserRoleDto {
  @ApiProperty({ description: 'New user role', enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({ description: 'Reason for role change' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class UpdateUserStatusDto {
  @ApiProperty({ description: 'New user status', enum: UserStatus })
  @IsEnum(UserStatus)
  status: UserStatus;

  @ApiPropertyOptional({ description: 'Reason for status change' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class BulkUserActionDto {
  @ApiProperty({ description: 'User IDs to perform action on', type: [String] })
  @IsArray()
  @IsString({ each: true })
  userIds: string[];

  @ApiProperty({ description: 'Action to perform', enum: ['activate', 'suspend', 'delete'] })
  @IsEnum(['activate', 'suspend', 'delete'])
  action: 'activate' | 'suspend' | 'delete';

  @ApiPropertyOptional({ description: 'Reason for bulk action' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

// Role Application DTOs
export class ReviewRoleApplicationDto {
  @ApiProperty({ description: 'Review action', enum: ['approve', 'reject'] })
  @IsEnum(['approve', 'reject'])
  action: 'approve' | 'reject';

  @ApiPropertyOptional({ description: 'Admin feedback/reason' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  feedback?: string;

  @ApiPropertyOptional({ description: 'Approved role (required if approving)', enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  approvedRole?: UserRole;
}

export class BulkApplicationActionDto {
  @ApiProperty({ description: 'Application IDs to perform action on', type: [String] })
  @IsArray()
  @IsString({ each: true })
  applicationIds: string[];

  @ApiProperty({ description: 'Action to perform', enum: ['approve', 'reject'] })
  @IsEnum(['approve', 'reject'])
  action: 'approve' | 'reject';

  @ApiPropertyOptional({ description: 'Bulk action reason' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

// System Configuration DTOs
export class SystemConfigDto {
  @ApiProperty({ description: 'Configuration key' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ description: 'Configuration value' })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiPropertyOptional({ description: 'Configuration description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Is configuration public' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

// Analytics Query DTOs
export class AnalyticsQueryDto {
  @ApiPropertyOptional({ description: 'Start date for analytics', example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for analytics', example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Grouping period', enum: ['day', 'week', 'month', 'year'] })
  @IsOptional()
  @IsEnum(['day', 'week', 'month', 'year'])
  groupBy?: 'day' | 'week' | 'month' | 'year';

  @ApiPropertyOptional({ description: 'Filter by user role', enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  userRole?: UserRole;
}

export class ExportDataDto {
  @ApiProperty({ description: 'Data type to export', enum: ['users', 'conservation', 'supply_chain', 'feedback', 'all'] })
  @IsEnum(['users', 'conservation', 'supply_chain', 'feedback', 'all'])
  dataType: 'users' | 'conservation' | 'supply_chain' | 'feedback' | 'all';

  @ApiPropertyOptional({ description: 'Export format', enum: ['csv', 'xlsx', 'json'] })
  @IsOptional()
  @IsEnum(['csv', 'xlsx', 'json'])
  format?: 'csv' | 'xlsx' | 'json';

  @ApiPropertyOptional({ description: 'Start date for data export' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for data export' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Include sensitive data (admin only)' })
  @IsOptional()
  @IsBoolean()
  includeSensitive?: boolean;
}

// Monitoring DTOs
export class SystemHealthDto {
  @ApiProperty({ description: 'Database connection status' })
  database: boolean;

  @ApiProperty({ description: 'Blockchain connection status' })
  blockchain: boolean;

  @ApiProperty({ description: 'IPFS connection status' })
  ipfs: boolean;

  @ApiProperty({ description: 'External API status' })
  externalApis: boolean;

  @ApiProperty({ description: 'Overall system health' })
  overall: boolean;

  @ApiProperty({ description: 'Uptime in seconds' })
  uptime: number;

  @ApiProperty({ description: 'Memory usage' })
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };

  @ApiProperty({ description: 'Last health check timestamp' })
  timestamp: Date;
}

export class GetSystemLogsDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 50;

  @ApiPropertyOptional({ description: 'Log level filter', enum: ['error', 'warn', 'info', 'debug'] })
  @IsOptional()
  @IsEnum(['error', 'warn', 'info', 'debug'])
  level?: 'error' | 'warn' | 'info' | 'debug';

  @ApiPropertyOptional({ description: 'Filter by admin ID' })
  @IsOptional()
  @IsString()
  adminId?: string;

  @ApiPropertyOptional({ description: 'Filter by action type' })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({ description: 'Start date for logs' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for logs' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

// Response DTOs
export class UserSummaryDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'Wallet address' })
  address: string;

  @ApiPropertyOptional({ description: 'Email address' })
  email?: string;

  @ApiProperty({ description: 'User role' })
  role: string;

  @ApiProperty({ description: 'User status' })
  status: string;

  @ApiProperty({ description: 'Registration date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last activity date' })
  lastActive?: Date;

  @ApiProperty({ description: 'Profile information' })
  profile?: {
    firstName?: string;
    lastName?: string;
    organization?: string;
  };

  @ApiProperty({ description: 'Activity statistics' })
  stats: {
    conservationRecords: number;
    supplyChainRecords: number;
    roleApplications: number;
  };
}

export class SystemStatsDto {
  @ApiProperty({ description: 'User statistics' })
  users: {
    total: number;
    active: number;
    pending: number;
    suspended: number;
    byRole: Record<string, number>;
    newThisMonth: number;
  };

  @ApiProperty({ description: 'Content statistics' })
  content: {
    conservationRecords: {
      total: number;
      verified: number;
      pending: number;
      thisMonth: number;
    };
    supplyChainRecords: {
      total: number;
      active: number;
      completed: number;
      thisMonth: number;
    };
    roleApplications: {
      total: number;
      pending: number;
      approved: number;
      rejected: number;
    };
  };

  @ApiProperty({ description: 'Blockchain statistics' })
  blockchain: {
    totalTransactions: number;
    successfulTransactions: number;
    failedTransactions: number;
    averageGasUsed: string;
    lastBlockNumber: number;
  };

  @ApiProperty({ description: 'System performance' })
  performance: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    throughput: number;
  };

  @ApiProperty({ description: 'Storage statistics' })
  storage: {
    totalFiles: number;
    totalSize: number;
    ipfsHashes: number;
    storageUsed: number;
  };
}

export class AdminActionLogDto {
  @ApiProperty({ description: 'Action ID' })
  id: string;

  @ApiProperty({ description: 'Admin who performed action' })
  adminId: string;

  @ApiProperty({ description: 'Target user/entity ID' })
  targetId?: string;

  @ApiProperty({ description: 'Action type' })
  action: string;

  @ApiProperty({ description: 'Action description' })
  description?: string;

  @ApiProperty({ description: 'Additional metadata' })
  metadata?: any;

  @ApiProperty({ description: 'Action timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Admin information' })
  admin: {
    id: string;
    address: string;
    profile?: {
      firstName?: string;
      lastName?: string;
    };
  };
}

export class PaginatedLogsDto {
  @ApiProperty({ description: 'Log entries', type: [AdminActionLogDto] })
  data: AdminActionLogDto[];

  @ApiProperty({ description: 'Total number of logs' })
  total: number;

  @ApiProperty({ description: 'Current page' })
  page: number;

  @ApiProperty({ description: 'Items per page' })
  limit: number;

  @ApiProperty({ description: 'Total pages' })
  totalPages: number;

  @ApiProperty({ description: 'Has next page' })
  hasNext: boolean;

  @ApiProperty({ description: 'Has previous page' })
  hasPrev: boolean;
}