import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';
    let details: any = null;

    // Handle different types of exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || exception.message;
        error = (exceptionResponse as any).error || error;
        details = (exceptionResponse as any).details;
      }
    } else if (exception instanceof PrismaClientKnownRequestError) {
      // Handle Prisma database errors
      status = HttpStatus.BAD_REQUEST;

      switch (exception.code) {
        case 'P2002':
          message = 'A record with this value already exists';
          error = 'Unique Constraint Violation';
          details = exception.meta;
          break;
        case 'P2025':
          message = 'Record not found';
          error = 'Not Found';
          status = HttpStatus.NOT_FOUND;
          break;
        case 'P2003':
          message = 'Foreign key constraint violation';
          error = 'Constraint Violation';
          break;
        default:
          message = 'Database error occurred';
          error = 'Database Error';
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    // Log the error
    const errorLog = {
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      statusCode: status,
      message,
      error,
      stack: exception instanceof Error ? exception.stack : undefined,
      body: request.body,
      query: request.query,
      params: request.params,
      user: (request as any).user?.id,
    };

    if (status >= 500) {
      this.logger.error('Server Error', errorLog);
    } else {
      this.logger.warn('Client Error', errorLog);
    }

    // Send error response
    const errorResponse = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error,
      ...(details && { details }),
      ...(process.env.NODE_ENV === 'development' && {
        stack: exception instanceof Error ? exception.stack : undefined
      }),
    };

    response.status(status).json(errorResponse);
  }
}
