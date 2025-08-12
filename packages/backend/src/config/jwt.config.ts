import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRATION || '7d',
  refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '30d',
}));