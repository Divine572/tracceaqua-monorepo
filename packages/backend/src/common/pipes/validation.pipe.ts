import { ValidationPipe as NestValidationPipe, BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export class ValidationPipe extends NestValidationPipe {
    constructor() {
        super({
            whitelist: true, // Strip unknown properties
            forbidNonWhitelisted: true, // Throw error on unknown properties
            transform: true, // Transform types automatically
            transformOptions: {
                enableImplicitConversion: true,
            },
            exceptionFactory: (errors: ValidationError[]) => {
                const messages = this.extractValidationMessages(errors);
                return new BadRequestException({
                    message: 'Validation failed',
                    errors: messages,
                });
            },
        });
    }

    private extractValidationMessages(errors: ValidationError[]): string[] {
        return errors.reduce((acc: string[], error: ValidationError) => {
            if (error.constraints) {
                acc.push(...Object.values(error.constraints));
            }
            if (error.children && error.children.length > 0) {
                acc.push(...this.extractValidationMessages(error.children));
            }
            return acc;
        }, []);
    }
}