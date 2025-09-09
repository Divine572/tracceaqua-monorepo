import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get('PORT', 3001);
  const environment = configService.get('NODE_ENV', 'development');

  // Security middleware
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  }));

  // Compression middleware
  app.use(compression());

  // Global prefix
  app.setGlobalPrefix('api', {
    exclude: ['/health', '/'],
  });

  // CORS configuration
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://tracceaqua.vercel.app',
      configService.get('CORS_ORIGIN'),
      configService.get('FRONTEND_URL'),
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  });

  // Swagger documentation (only in development and staging)
  if (environment !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('TracceAqua API')
      .setDescription('Blockchain Seafood Traceability System API Documentation')
      .setVersion('1.0.0')
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
      .addTag('Users', 'User management')
      .addTag('Role Applications', 'Role application management')
      .addTag('Conservation', 'Conservation data management')
      .addTag('Supply Chain', 'Supply chain traceability')
      .addTag('Files', 'File upload and IPFS management')
      .addTag('Blockchain', 'Blockchain integration')
      .addTag('Admin', 'Administrative functions')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });

    console.log(`📚 API Documentation available at: http://localhost:${port}/api/docs`);
  }

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Graceful shutdown
  app.enableShutdownHooks();

  await app.listen(port, '0.0.0.0');

  console.log(`🚀 TracceAqua Backend running on: http://localhost:${port}`);
  console.log(`🌍 Environment: ${environment}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🔗 API Base URL: http://localhost:${port}/api`);
}

bootstrap().catch((error) => {
  console.error('❌ Application failed to start:', error);
  process.exit(1);
});
