import { IsEnum, IsOptional, IsString, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/user-role.enum';

export class CreateRoleApplicationDto {
    @ApiProperty({
        enum: UserRole,
        description: 'Role being requested',
        example: UserRole.FISHERMAN
    })
    @IsEnum(UserRole)
    requestedRole: UserRole;

    @ApiPropertyOptional({
        description: 'Organization or company name',
        example: 'Lagos Fishing Cooperative'
    })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    organization?: string;

    @ApiPropertyOptional({
        description: 'Professional license number',
        example: 'FISH-2024-001'
    })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    licenseNumber?: string;

    @ApiPropertyOptional({
        description: 'Type of business or operation',
        example: 'Small-scale artisanal fishing'
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    businessType?: string;

    @ApiPropertyOptional({
        description: 'Years of experience in the field',
        example: '5 years'
    })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    experience?: string;

    @ApiPropertyOptional({
        description: 'Motivation for applying for this role',
        example: 'I want to contribute to sustainable fishing practices and help improve traceability in the seafood supply chain.'
    })
    @IsOptional()
    @IsString()
    @MinLength(10)
    @MaxLength(1000)
    motivation?: string;
}