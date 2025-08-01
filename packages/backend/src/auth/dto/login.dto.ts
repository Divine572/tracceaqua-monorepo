import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEthereumAddress, IsEmail, IsOptional, MinLength } from 'class-validator';

export class LoginDto {
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
        description: 'User email from social login (optional)',
        example: 'user@example.com',
        required: false,
    })
    @IsOptional()
    @IsEmail()
    email?: string;
}