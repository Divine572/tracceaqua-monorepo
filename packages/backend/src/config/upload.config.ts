import { registerAs } from '@nestjs/config';

export const uploadConfig = registerAs('upload', () => ({

  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE ?? `${10 * 1024 * 1024}`, 10),
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },
  ipfs: {
    pinataJwt: process.env.PINATA_JWT,
    pinataGatewayUrl: process.env.PINATA_GATEWAY_URL || 'https://gateway.pinata.cloud',
  },
}));