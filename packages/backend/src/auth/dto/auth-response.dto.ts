import { ApiProperty } from '@nestjs/swagger';
// import { UserRole, UserStatus } from '@prisma/client';

import { UserRole } from '../../common/enums/user-role.enum';
import { UserStatus } from '../../common/enums/user-status.enum';

export class UserProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ required: false })
  firstName?: string;

  @ApiProperty({ required: false })
  lastName?: string;

  @ApiProperty({ required: false })
  bio?: string;

  @ApiProperty({ required: false })
  location?: string;

  @ApiProperty({ required: false })
  website?: string;

  @ApiProperty({ required: false })
  phoneNumber?: string;

  @ApiProperty({ required: false })
  organization?: string;

  @ApiProperty({ required: false })
  profileImage?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class UserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  address: string;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiProperty({ type: UserProfileDto, required: false })
  profile?: UserProfileDto;

  @ApiProperty({ required: false })
  isNewUser?: boolean;

  @ApiProperty({ default: Date.now()})
  createdAt: Date;

  @ApiProperty({ default: Date.now() })
  updatedAt: Date;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'User information',
    type: UserDto,
  })
  user: UserDto;
}