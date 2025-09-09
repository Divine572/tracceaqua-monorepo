
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConservationService } from './conservation.service';
import { ConservationController } from './conservation.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [
    PrismaModule,
    BlockchainModule,
    FilesModule,
    MulterModule.register({
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB per file
        files: 10, // Maximum 10 files per request
      },
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'text/csv',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/plain',
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new Error('File type not allowed for conservation records'), false);
        }
      },
    }),
  ],
  controllers: [ConservationController],
  providers: [ConservationService],
  exports: [ConservationService],
})
export class ConservationModule { }