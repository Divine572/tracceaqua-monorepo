import { IsEnum, IsOptional, IsString, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';



export class ReviewApplicationDto {
    @ApiProperty({
        description: 'Whether to approve or reject the application',
        example: true
    })
    @IsBoolean()
    approved: boolean;

    @ApiPropertyOptional({
        description: 'Admin feedback on the application',
        example: 'All documents verified. License is valid and experience is sufficient.'
    })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    feedback?: string;
}