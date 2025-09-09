import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('User-Agent') || '';
    const startTime = Date.now();

    // Log the incoming request
    this.logger.log(`${method} ${originalUrl} - ${ip} - ${userAgent}`);

    // Capture response details
    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;
      const message = `${method} ${originalUrl} ${statusCode} - ${duration}ms`;
      
      if (statusCode >= 400) {
        this.logger.error(message);
      } else {
        this.logger.log(message);
      }
    });

    next();
  }
}
