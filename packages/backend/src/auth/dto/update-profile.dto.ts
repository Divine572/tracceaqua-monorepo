import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl, MaxLength, IsPhoneNumber } from 'class-validator';

export class UpdateProfileDto {
    @ApiProperty({
        description: 'User first name',
        example: 'John',
        required: false,
    })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    firstName?: string;

    @ApiProperty({
        description: 'User last name',
        example: 'Doe',
        required: false,
    })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    lastName?: string;

    @ApiProperty({
        description: 'User bio/description',
        example: 'Passionate seafood enthusiast and sustainability advocate',
        required: false,
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    bio?: string;

    @ApiProperty({
        description: 'User location',
        example: 'Lagos, Nigeria',
        required: false,
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    location?: string;

    @ApiProperty({
        description: 'User website URL',
        example: 'https://johndoe.com',
        required: false,
    })
    @IsOptional()
    @IsUrl()
    website?: string;

    @ApiProperty({
        description: 'User phone number',
        example: '+234-801-234-5678',
        required: false,
    })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    phoneNumber?: string;

    @ApiProperty({
        description: 'User organization',
        example: 'Lagos Bay Fishermen Cooperative',
        required: false,
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    organization?: string;
}
