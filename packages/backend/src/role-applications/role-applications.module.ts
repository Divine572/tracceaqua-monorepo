import { Module } from '@nestjs/common';
import { RoleApplicationsService } from './role-applications.service';
import { RoleApplicationsController } from './role-applications.controller';

@Module({
  providers: [RoleApplicationsService],
  controllers: [RoleApplicationsController]
})
export class RoleApplicationsModule {}
