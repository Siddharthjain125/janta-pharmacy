import { registerAs } from '@nestjs/config';

export default registerAs('security', () => ({
  // CORS settings
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },

  // Rate limiting (placeholder for future implementation)
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },

  // JWT settings (placeholder for future implementation)
  jwt: {
    secret: process.env.JWT_SECRET || 'change-me-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // API Key settings (placeholder for future implementation)
  apiKey: {
    headerName: 'X-API-Key',
    enabled: process.env.API_KEY_ENABLED === 'true',
  },

  // Security headers
  headers: {
    hsts: true,
    noSniff: true,
    xssFilter: true,
    frameguard: true,
  },
}));
