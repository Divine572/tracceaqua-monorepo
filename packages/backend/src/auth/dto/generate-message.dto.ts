import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress, IsOptional, IsString } from 'class-validator';

export class GenerateMessageDto {
  @ApiProperty({
    description: 'Ethereum wallet address',
    example: '0x1234567890123456789012345678901234567890',
  })
  @IsEthereumAddress()
  address: string;

  @ApiProperty({
    description: 'Optional nonce for message generation',
    example: 'abc123',
    required: false,
  })
  @IsOptional()
  @IsString()
  nonce?: string;
}

export class GenerateMessageResponseDto {
  @ApiProperty({
    description: 'Message to be signed by user wallet',
    example: 'Welcome to TracceAqua! This request will not trigger a blockchain transaction...',
  })
  message: string;

  @ApiProperty({
    description: 'Generated nonce for this authentication attempt',
    example: 'abc123def456',
  })
  nonce: string;
}
