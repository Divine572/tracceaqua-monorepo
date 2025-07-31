import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
  expiresIn: process.env.JWT_EXPIRATION || '7d',
  refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '30d',
}));