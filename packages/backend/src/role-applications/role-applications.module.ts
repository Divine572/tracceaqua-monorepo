import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { RoleApplicationsController } from './role-applications.controller';
import { RoleApplicationsService } from './role-applications.service';
import { IpfsModule } from '../ipfs/ipfs.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    IpfsModule,
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 5, // Maximum 5 files per request
      },
      fileFilter: (req, file, callback) => {
        // Allow only specific file types
        const allowedMimeTypes = [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'text/csv',
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new Error('File type not allowed'), false);
        }
      },
    }),
  ],
  controllers: [RoleApplicationsController],
  providers: [RoleApplicationsService],
  exports: [RoleApplicationsService],
})
export class RoleApplicationsModule { }