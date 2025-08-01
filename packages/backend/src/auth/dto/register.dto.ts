import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEthereumAddress, IsEmail, IsOptional, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
    @ApiProperty({
        description: 'Ethereum wallet address',
        example: '0x1234567890123456789012345678901234567890',
    })
    @IsEthereumAddress()
    address: string;

    @ApiProperty({
        description: 'Wallet signature of the authentication message',
        example: '0x...',
    })
    @IsString()
    @MinLength(1)
    signature: string;

    @ApiProperty({
        description: 'Original message that was signed',
        example: 'Welcome to TracceAqua! This request will not trigger a blockchain transaction...',
    })
    @IsString()
    @MinLength(1)
    message: string;

    @ApiProperty({
        description: 'User email',
        example: 'user@example.com',
        required: false,
    })
    @IsOptional()
    @IsEmail()
    email?: string;

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
}
