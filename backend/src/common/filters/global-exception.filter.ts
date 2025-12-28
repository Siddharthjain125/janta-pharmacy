import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BusinessException } from '../exceptions/business.exception';

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  correlationId: string;
  timestamp: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const correlationId = (request.headers['x-correlation-id'] as string) || 'unknown';

    const errorResponse = this.buildErrorResponse(exception, correlationId);
    const statusCode = this.getStatusCode(exception);

    // Log error internally (never expose stack traces to client)
    this.logError(exception, correlationId, request);

    response.status(statusCode).json(errorResponse);
  }

  private buildErrorResponse(exception: unknown, correlationId: string): ErrorResponse {
    if (exception instanceof BusinessException) {
      return {
        success: false,
        error: {
          code: exception.errorCode,
          message: exception.message,
          details: exception.details,
        },
        correlationId,
        timestamp: new Date().toISOString(),
      };
    }

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      let message = exception.message;
      let details: Record<string, unknown> | undefined;

      if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
        const msg = (exceptionResponse as { message: string | string[] }).message;
        message = Array.isArray(msg) ? msg.join(', ') : msg;
        details = Array.isArray(msg) ? { errors: msg } : undefined;
      }

      return {
        success: false,
        error: {
          code: 'HTTP_ERROR',
          message,
          details,
        },
        correlationId,
        timestamp: new Date().toISOString(),
      };
    }

    // Unknown error - return generic message
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
      correlationId,
      timestamp: new Date().toISOString(),
    };
  }

  private getStatusCode(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private logError(exception: unknown, correlationId: string, request: Request): void {
    const timestamp = new Date().toISOString();
    const method = request.method;
    const url = request.url;

    if (exception instanceof BusinessException) {
      console.log(
        `[${timestamp}] [WARN] [${correlationId}] ${method} ${url} - ${exception.errorCode}: ${exception.message}`,
      );
    } else if (exception instanceof HttpException) {
      console.log(
        `[${timestamp}] [WARN] [${correlationId}] ${method} ${url} - ${exception.getStatus()}: ${exception.message}`,
      );
    } else if (exception instanceof Error) {
      console.error(
        `[${timestamp}] [ERROR] [${correlationId}] ${method} ${url} - Unhandled: ${exception.message}`,
      );
      console.error(exception.stack);
    } else {
      console.error(
        `[${timestamp}] [ERROR] [${correlationId}] ${method} ${url} - Unknown error`,
        exception,
      );
    }
  }
}

