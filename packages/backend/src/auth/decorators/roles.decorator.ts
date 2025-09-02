import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../common/enums/user-role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

// packages/backend/src/role-applications/role-applications.module.ts
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { RoleApplicationsController } from '../../role-applications/role-applications.controller';
import { RoleApplicationsService } from '../../role-applications/role-applications.service';
import { IpfsModule } from '../../files/files.module';
import { PrismaModule } from '../../prisma/prisma.module';




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