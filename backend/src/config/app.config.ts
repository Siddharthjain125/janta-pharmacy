import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  name: 'Janta Pharmacy API',
  version: process.env.APP_VERSION || '0.1.0',
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: 'api/v1',

  // Pagination defaults
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },

  // Request settings
  request: {
    timeout: parseInt(process.env.REQUEST_TIMEOUT || '30000', 10),
    maxBodySize: process.env.MAX_BODY_SIZE || '10mb',
  },

  // Feature flags (placeholder for future use)
  features: {
    enableSwagger: process.env.ENABLE_SWAGGER === 'true',
    enableMetrics: process.env.ENABLE_METRICS === 'true',
  },
}));
