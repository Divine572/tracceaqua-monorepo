import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

// Core modules
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

// Feature modules
import { RoleApplicationsModule } from './role-applications/role-applications.module';
import { ConservationModule } from './conservation/conservation.module';
import { SupplyChainModule } from './supply-chain/supply-chain.module';
import { FilesModule } from './files/files.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { AdminModule } from './admin/admin.module';

// Guards, filters, and interceptors
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

// Middleware
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CorsMiddleware } from './common/middleware/cors.middleware';

// Configuration
import { appConfig } from './config/app.config';
import { databaseConfig } from './config/database.config';
import { jwtConfig } from './config/jwt.config';
import { fileConfig } from './config/file.config';
import { blockchainConfig } from './config/blockchain.config';

// Main app components
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Configuration - Load all config files
    ConfigModule.forRoot({
      load: [appConfig, databaseConfig, jwtConfig, fileConfig, blockchainConfig],
      isGlobal: true,
      envFilePath: ['.env.local', '.env.production', '.env'],
      expandVariables: true,
    }),

    // Rate limiting with multiple tiers
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          name: 'short',
          ttl: 1000, // 1 second
          limit: configService.get('NODE_ENV') === 'production' ? 5 : 10,
        },
        {
          name: 'medium',
          ttl: 60000, // 1 minute
          limit: configService.get('NODE_ENV') === 'production' ? 50 : 100,
        },
        {
          name: 'long',
          ttl: 3600000, // 1 hour
          limit: configService.get('NODE_ENV') === 'production' ? 500 : 1000,
        },
      ],
    }),

    // Core modules
    PrismaModule,
    AuthModule,
    UsersModule,

    // Feature modules
    RoleApplicationsModule,
    ConservationModule,
    SupplyChainModule,
    FilesModule,
    BlockchainModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    // Global validation pipe
    {
      provide: APP_PIPE,
      useFactory: () => new ValidationPipe({
        whitelist: true, // Strip props that are not in DTO
        forbidNonWhitelisted: true, // Throw error if non-whitelisted props
        transform: true, // Transform payload to DTO instance
        transformOptions: {
          enableImplicitConversion: true, // Convert string to number/boolean
        },
      }),
    },

    // Global guards
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },

    // Global filters
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
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*')
      .apply(CorsMiddleware)
      .forRoutes('*');
  }
}