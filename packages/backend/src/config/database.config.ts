import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production',
  logging: process.env.NODE_ENV === 'development',
}));


