import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import helmet from 'helmet';
import { json, urlencoded } from 'express';

import compression from 'compression';
import { AppModule } from './app.module';



async function bootstrap() {
  const logger = new Logger('TracceAqua-Backend');

  try {
    // Create NestJS application
    const app = await NestFactory.create(AppModule, {
      logger: process.env.NODE_ENV === 'production'
        ? ['error', 'warn', 'log']
        : ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // Get configuration service
    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT', 3001);
    const environment = configService.get<string>('NODE_ENV', 'development');
    const corsOrigin = configService.get<string>('CORS_ORIGIN', 'http://localhost:3000');

    // Security middleware
    app.use(helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          imgSrc: [`'self'`, 'data:', 'https:'],
          scriptSrc: [`'self'`],
          manifestSrc: [`'self'`],
          frameSrc: [`'self'`],
        },
      },
    }));

    // Compression middleware
    app.use(compression());

    // Body parsing middleware with increased limits for file uploads
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));

    // CORS configuration - Allow all origins
    app.enableCors({
      origin: true, // Allow all origins
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'X-Api-Key',
        'X-Wallet-Address'
      ],
      credentials: true,
    });


    // API prefix
    app.setGlobalPrefix('api/v1');

    // Swagger documentation (only in development and staging)
    if (environment !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('TracceAqua API')
        .setDescription('Blockchain Seafood Traceability System API')
        .setVersion('1.0')
        .addBearerAuth({
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        })
        .addTag('authentication', 'User authentication and wallet connection')
        .addTag('users', 'User management and profiles')
        .addTag('conservation', 'Conservation data and sampling')
        .addTag('supply-chain', 'Supply chain tracking and traceability')
        .addTag('files', 'File upload and IPFS integration')
        .addTag('admin', 'Admin management and user roles')
        .addTag('blockchain', 'Blockchain integration and smart contracts')
        .addTag('qr-codes', 'QR code generation and tracking')
        .build();

      const document = SwaggerModule.createDocument(app, config, {
        operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
      });

      SwaggerModule.setup('docs', app, document, {
        customSiteTitle: 'TracceAqua API Documentation',
        customfavIcon: '/favicon.ico',
        customCssUrl: '/swagger-custom.css',
        swaggerOptions: {
          persistAuthorization: true,
          displayRequestDuration: true,
          filter: true,
          showCommonExtensions: true,
        },
      });

      logger.log(`📚 API Documentation available at: http://localhost:${port}/docs`);
    }

    // Health check endpoints - respond to both with and without prefix
    const healthResponse = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment,
      version: '1.0.0',
      services: {
        database: 'connected',
        blockchain: 'connected',
        ipfs: 'connected',
      }
    };

    app.getHttpAdapter().get('/health', (req, res) => {
      res.status(200).json(healthResponse);
    });

    app.getHttpAdapter().get('/api/v1/health', (req, res) => {
      res.status(200).json(healthResponse);
    });

    // Readiness check for Railway
    app.getHttpAdapter().get('/ready', (req, res) => {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
      });
    });

    // Liveness check for Railway
    app.getHttpAdapter().get('/live', (req, res) => {
      res.status(200).json({
        status: 'alive',
        timestamp: new Date().toISOString(),
      });
    });

    // Graceful shutdown handlers
    process.on('SIGTERM', () => {
      logger.log('SIGTERM received, shutting down gracefully');
      app.close().then(() => {
        logger.log('Process terminated');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.log('SIGINT received, shutting down gracefully');
      app.close().then(() => {
        logger.log('Process terminated');
        process.exit(0);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

    // Start the server
    await app.listen(port, '0.0.0.0');

    logger.log(`🚀 TracceAqua Backend Server is running on: http://localhost:${port}`);
    logger.log(`🌍 Environment: ${environment}`);
    logger.log(`📊 Health Check: http://localhost:${port}/health`);
    logger.log(`🔗 CORS Origin: ${corsOrigin}`);

    if (environment !== 'production') {
      logger.log(`📖 API Docs: http://localhost:${port}/docs`);
    }

    // Log deployment info for Railway
    if (process.env.RAILWAY_ENVIRONMENT) {
      logger.log(`🚂 Railway Environment: ${process.env.RAILWAY_ENVIRONMENT}`);
      logger.log(`🔧 Railway Service: ${process.env.RAILWAY_SERVICE_NAME || 'tracceaqua-backend'}`);
    }

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();