import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponseDto } from '../dto/response.dto';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponseDto<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponseDto<T>> {
    const request = context.switchToHttp().getRequest();
    
    // Skip transformation for certain routes
    const skipTransform = ['/health', '/api/docs', '/'].includes(request.url);
    if (skipTransform) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        // If data is already a response DTO or error, return as-is
        if (data && (data.success !== undefined || data.error)) {
          return data;
        }

        // Transform successful responses
        return new ApiResponseDto(true, 'Success', data);
      }),
    );
  }
}