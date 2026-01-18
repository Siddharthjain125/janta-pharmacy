/**
 * Refresh Token Entity
 *
 * Represents an opaque refresh token for session management.
 * Stored server-side for secure rotation and revocation.
 *
 * Design decisions:
 * - Token is opaque (random string, not JWT)
 * - Each token has an expiration time
 * - Tokens can be revoked (revokedAt set)
 * - Tokens are rotated on each refresh (old revoked, new issued)
 * - One user can have multiple active refresh tokens (multi-device)
 *
 * Security notes:
 * - Tokens are single-use (rotation enforced)
 * - Reuse of revoked token should invalidate entire session family
 * - Storage should be easily replaceable (in-memory → Redis/DB)
 */

/**
 * Refresh Token entity
 */
export interface RefreshToken {
  /** Unique identifier (internal, not exposed) */
  readonly id: string;

  /** The opaque token string (sent to client) */
  readonly token: string;

  /** User this token belongs to */
  readonly userId: string;

  /** When the token expires */
  readonly expiresAt: Date;

  /** When the token was revoked (null if active) */
  readonly revokedAt: Date | null;

  /** When the token was created */
  readonly createdAt: Date;
}

/**
 * Data required to create a refresh token
 */
export interface CreateRefreshTokenData {
  /** The opaque token string */
  token: string;

  /** User ID this token belongs to */
  userId: string;

  /** When the token expires */
  expiresAt: Date;
}
