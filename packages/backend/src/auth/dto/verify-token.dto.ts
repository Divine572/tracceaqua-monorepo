import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

import { UserDto } from './auth-response.dto';


export class VerifyTokenDto {
  @ApiProperty({
    description: 'JWT token to verify',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @MinLength(1)
  token: string;
}

export class VerifyTokenResponseDto {
  @ApiProperty({
    description: 'Whether token is valid',
  })
  valid: boolean;

  @ApiProperty({
    description: 'User information if token is valid',
    type: UserDto,
    required: false,
  })
  user?: UserDto;

  @ApiProperty({
    description: 'Error message if token is invalid',
    required: false,
  })
  error?: string;
}