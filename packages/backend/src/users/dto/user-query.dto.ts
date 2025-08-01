import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
// import { UserRole, UserStatus } from '@prisma/client';

import { UserRole } from '../../common/enums/user-role.enum';
import { UserStatus } from '../../common/enums/user-status.enum';

import { PaginationDto } from '../../common/dto/pagination.dto';

export class UserQueryDto extends PaginationDto {
    @ApiProperty({
        description: 'Search term for name, email, or address',
        required: false,
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiProperty({
        description: 'Filter by user role',
        enum: UserRole,
        required: false,
    })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @ApiProperty({
        description: 'Filter by user status',
        enum: UserStatus,
        required: false,
    })
    @IsOptional()
    @IsEnum(UserStatus)
    status?: UserStatus;
}
