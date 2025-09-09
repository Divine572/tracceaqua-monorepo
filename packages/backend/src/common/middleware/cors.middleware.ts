import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction): void {
    const origin = request.headers.origin;
    const allowedOrigins = [
      'http://localhost:3000',
      'https://tracceaqua.vercel.app',
      process.env.CORS_ORIGIN,
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    if (origin && allowedOrigins.includes(origin)) {
      response.setHeader('Access-Control-Allow-Origin', origin);
    }

    response.setHeader(
      'Access-Control-Allow-Methods',
      'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS'
    );
    
    response.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

    if (request.method === 'OPTIONS') {
      response.status(200).end();
      return;
    }

    next();
  }
}
