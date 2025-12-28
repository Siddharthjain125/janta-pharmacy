import { Controller, Get } from '@nestjs/common';
import { ApiResponse } from '../common/api/api-response';

/**
 * Health Controller
 *
 * Provides health check and API information endpoints.
 */
@Controller()
export class HealthController {
  /**
   * Root endpoint - API information
   */
  @Get()
  getApiInfo(): ApiResponse<unknown> {
    return ApiResponse.success(
      {
        name: 'Janta Pharmacy API',
        version: '0.1.0',
        status: 'running',
        documentation: '/api/v1/health',
      },
      'API is running',
    );
  }

  /**
   * Health check endpoint
   */
  @Get('health')
  getHealth(): ApiResponse<unknown> {
    return ApiResponse.success(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
      },
      'Service is healthy',
    );
  }
}

