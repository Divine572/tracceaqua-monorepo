// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

// Core modules
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RoleApplicationsModule } from './role-applications/role-applications.module';
import { AdminModule } from './admin/admin.module';
import { UploadModule } from './upload/upload.module';

// Guards and interceptors
// import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

// Configuration
import { appConfig } from './config/app.config';
import { databaseConfig } from './config/database.config';
import { jwtConfig } from './config/jwt.config';
import { uploadConfig } from './config/upload.config';

// Main app components
import { AppController } from './app.controller';
import { AppService } from './app.service';


@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      load: [appConfig, databaseConfig, jwtConfig, uploadConfig],
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 10, // 10 requests per second
      },
      {
        name: 'medium',
        ttl: 10000, // 10 seconds
        limit: 50, // 50 requests per 10 seconds
      },
      {
        name: 'long',
        ttl: 60000, // 1 minute
        limit: 200, // 200 requests per minute
      },
    ]),

    // Core modules
    PrismaModule,
    AuthModule,
    UsersModule,
    RoleApplicationsModule,
    AdminModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    // Global guards
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },

    // Global exception filter
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },

    // Global interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule { }