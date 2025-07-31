import { registerAs } from '@nestjs/config';

export const uploadConfig = registerAs('upload', () => ({
  pinata: {
    jwt: process.env.PINATA_JWT,
    gatewayUrl: process.env.PINATA_GATEWAY_URL || 'https://gateway.pinata.cloud',
  },
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE ?? `${10 * 1024 * 1024}`, 10), // 10MB
  allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
}));