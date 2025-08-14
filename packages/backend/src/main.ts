// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Get configuration
  const port = configService.get<number>('app.port') ?? 3000;
  const environment = configService.get<string>('app.environment');
  const appName = configService.get<string>('app.name');
  const frontendUrl = configService.get<string>('app.frontendUrl');
  const corsOrigin = configService.get<string[]>('app.cors.origin');

  // Global prefix for all routes
  app.setGlobalPrefix('api', {
    exclude: ['/', '/health'],
  });



  // Enable CORS
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw error if unknown properties
      transform: true, // Transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Convert string to number, etc.
      },
    }),
  );

  // Setup Swagger documentation
  if (environment === 'development') {
    const config = new DocumentBuilder()
      .setTitle('TracceAqua API')
      .setDescription('Blockchain Seafood Traceability System API Documentation')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Authentication', 'User authentication and authorization')
      .addTag('Users', 'User management operations')
      .addTag('Role Applications', 'Professional role application system')
      .addTag('Admin', 'Administrative operations')
      .addTag('Upload', 'File upload operations')
      .addServer(`http://localhost:${port}`, 'Development server')
      // Only add frontendUrl if it is defined
      .addServer(frontendUrl ?? 'http://localhost:3000', 'Frontend server')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });

    logger.log(`📚 Swagger documentation available at: http://localhost:${port}/api/docs`);
  }

  // Start the application
  await app.listen(port, '0.0.0.0');

  // Startup messages
  logger.log(`🚀 ${appName} is running!`);
  logger.log(`🌍 Environment: ${environment}`);
  logger.log(`🔗 Server: http://localhost:${port}`);
  logger.log(`🎯 API Prefix: /api`);
  logger.log(`🔄 CORS Origins: ${(corsOrigin ?? []).join(', ')}`);

  if (environment === 'development') {
    logger.log(`📋 Health Check: http://localhost:${port}/health`);
    logger.log(`📊 API Documentation: http://localhost:${port}/api/docs`);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});