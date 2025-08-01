import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
// import { UserRole, UserStatus } from '@prisma/client';

import { UserRole } from '../../common/enums/user-role.enum';
import { UserStatus } from '../../common/enums/user-status.enum';

export class UpdateUserDto {
    @ApiProperty({
        description: 'User role',
        enum: UserRole,
        required: false,
    })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @ApiProperty({
        description: 'User status',
        enum: UserStatus,
        required: false,
    })
    @IsOptional()
    @IsEnum(UserStatus)
    status?: UserStatus;
}