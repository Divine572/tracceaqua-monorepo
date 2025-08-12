
import { IsEnum, IsOptional, IsString, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';



export class UpdateApplicationDto {
    @ApiPropertyOptional({
        description: 'Updated organization name',
        example: 'Updated Fishing Cooperative Ltd'
    })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    organization?: string;

    @ApiPropertyOptional({
        description: 'Updated license number',
        example: 'FISH-2024-002'
    })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    licenseNumber?: string;

    @ApiPropertyOptional({
        description: 'Updated business type',
        example: 'Commercial fishing operations'
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    businessType?: string;

    @ApiPropertyOptional({
        description: 'Updated experience information',
        example: '7 years'
    })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    experience?: string;

    @ApiPropertyOptional({
        description: 'Updated motivation',
        example: 'Updated motivation with more details about commitment to sustainability.'
    })
    @IsOptional()
    @IsString()
    @MinLength(10)
    @MaxLength(1000)
    motivation?: string;
}