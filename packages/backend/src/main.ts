import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
      cors: true,
    });

    const configService = app.get(ConfigService);
    const port = configService.get('app.port', 3001);
    const environment = configService.get('app.nodeEnv', 'development');

    // Security middleware
    app.use(helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
          scriptSrc: ["'self'", 'https:'],
          imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
          connectSrc: ["'self'", 'https:', 'wss:'],
          fontSrc: ["'self'", 'https:', 'data:'],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'", 'https:', 'blob:'],
          frameSrc: ["'none'"],
        },
      },
    }));

    // Compression middleware
    app.use(compression());

    // Global prefix for API routes
    app.setGlobalPrefix('api', {
      exclude: ['/health', '/', '/docs'],
    });

    // CORS configuration
    const corsOrigins = [
      'http://localhost:3000',
      'https://tracceaqua.vercel.app',
      configService.get('app.corsOrigin'),
      configService.get('app.frontendUrl'),
    ].filter(Boolean);

    app.enableCors({
      origin: corsOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Cache-Control',
        'X-API-Key'
      ],
      exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    });

    // Swagger documentation (only in development and staging)
    if (environment !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('TracceAqua API')
        .setDescription(`
          # TracceAqua - Blockchain Seafood Traceability System
          
          ## Overview
          TracceAqua provides end-to-end traceability for seafood products using blockchain technology.
          
          ## Authentication
          Most endpoints require JWT authentication. Include the token in the Authorization header:
          \`Authorization: Bearer <your-jwt-token>\`
          
          ## User Roles
          - **ADMIN**: Full system access
          - **RESEARCHER**: Conservation data management
          - **FARMER**: Aquaculture operations
          - **FISHERMAN**: Wild capture operations  
          - **PROCESSOR**: Processing operations
          - **TRADER**: Distribution operations
          - **RETAILER**: Retail operations
          - **CONSUMER**: Product tracing (default role)
          
          ## Rate Limiting
          - Short: 5-10 requests per second
          - Medium: 50-100 requests per minute
          - Long: 200-1000 requests per hour
        `)
        .setVersion('1.0.0')
        .addServer('http://localhost:3001', 'Local Development')
        .addServer('https://api.tracceaqua.com', 'Production')
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
        .addTag('Admin', 'Admin management endpoints (Admin only)')
        .addTag('Conservation', 'Marine conservation data management')
        .addTag('Supply Chain', 'Product traceability and supply chain tracking')
        .addTag('Files', 'File upload and IPFS integration')
        .addTag('Blockchain', 'Blockchain interaction and monitoring')
        .addTag('Role Applications', 'Professional role application system')
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('docs', app, document, {
        customSiteTitle: 'TracceAqua API Documentation',
        customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
        customJs: [
          'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
          'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
        ],
        swaggerOptions: {
          persistAuthorization: true,
          displayRequestDuration: true,
          filter: true,
          showExtensions: true,
          showCommonExtensions: true,
        },
      });

      logger.log(`📚 API Documentation available at: http://localhost:${port}/docs`);
    }

    // Health check endpoint
    app.getHttpAdapter().get('/health', (req, res) => {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment,
        version: '1.0.0',
        services: {
          database: 'connected', // Would check actual DB connection
          blockchain: 'connected', // Would check actual blockchain connection
          ipfs: 'connected', // Would check actual IPFS connection
        }
      });
    });

    // Start the server
    await app.listen(port);

    logger.log(`🚀 TracceAqua Backend Server is running on: http://localhost:${port}`);
    logger.log(`🌍 Environment: ${environment}`);
    logger.log(`📊 Health Check: http://localhost:${port}/health`);

    if (environment !== 'production') {
      logger.log(`📖 API Docs: http://localhost:${port}/docs`);
    }

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();