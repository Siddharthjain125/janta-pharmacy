/**
 * JWT Configuration
 *
 * Centralized JWT settings for the auth module.
 *
 * Security notes:
 * - JWT_SECRET should be set via environment variable in production
 * - Access tokens are short-lived (15 minutes)
 * - Refresh tokens will be added later with longer expiry
 */

export interface JwtConfig {
  /** Secret key for signing tokens */
  secret: string;

  /** Token expiration time (in seconds or string like '15m') */
  expiresIn: string;

  /** Token issuer */
  issuer: string;
}

/**
 * Get JWT configuration from environment
 */
export function getJwtConfig(): JwtConfig {
  const secret = process.env.JWT_SECRET;

  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }

  return {
    // Use env variable or fallback for development
    secret: secret || 'dev-secret-do-not-use-in-production',

    // Short-lived access token (15 minutes)
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',

    // Issuer claim
    issuer: process.env.JWT_ISSUER || 'janta-pharmacy',
  };
}

/**
 * JWT token payload structure
 *
 * This is what gets encoded into the JWT.
 * Keep it minimal - JWTs are sent with every request.
 */
export interface JwtPayload {
  /** User ID (sub claim) */
  sub: string;

  /** Phone number (primary identifier) */
  phoneNumber: string;

  /** Email (optional) */
  email: string | null;

  /** User roles */
  roles: string[];

  /** Token type (for future refresh token support) */
  type: 'access' | 'refresh';
}
