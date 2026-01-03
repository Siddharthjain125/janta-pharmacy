import { RefreshToken, CreateRefreshTokenData } from './refresh-token.entity';

/**
 * Injection token for the refresh token repository
 */
export const REFRESH_TOKEN_REPOSITORY = Symbol('REFRESH_TOKEN_REPOSITORY');

/**
 * Refresh Token Repository Interface
 *
 * Defines the contract for refresh token storage.
 * Implementations can be in-memory, Redis, or database.
 *
 * Design notes:
 * - All methods are async for consistency
 * - Supports token rotation (create new, revoke old)
 * - Supports finding by token value (for validation)
 * - Supports revoking all tokens for a user (logout all devices)
 *
 * Security considerations:
 * - Implementation should index by token for fast lookup
 * - Revoked tokens should be kept for audit/detection
 * - Expired tokens can be cleaned up periodically
 */
export interface IRefreshTokenRepository {
  /**
   * Create a new refresh token
   */
  create(data: CreateRefreshTokenData): Promise<RefreshToken>;

  /**
   * Find a refresh token by its token value
   * @returns Token or null if not found
   */
  findByToken(token: string): Promise<RefreshToken | null>;

  /**
   * Find all active (non-revoked, non-expired) tokens for a user
   */
  findActiveByUserId(userId: string): Promise<RefreshToken[]>;

  /**
   * Revoke a specific token
   * @returns The revoked token or null if not found
   */
  revoke(token: string): Promise<RefreshToken | null>;

  /**
   * Revoke all tokens for a user (logout from all devices)
   * @returns Number of tokens revoked
   */
  revokeAllByUserId(userId: string): Promise<number>;

  /**
   * Delete expired tokens (cleanup)
   * @returns Number of tokens deleted
   */
  deleteExpired(): Promise<number>;

  /**
   * Check if a token exists and is valid (not revoked, not expired)
   */
  isValid(token: string): Promise<boolean>;
}

