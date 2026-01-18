import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { RefreshToken, CreateRefreshTokenData } from './refresh-token.entity';
import { IRefreshTokenRepository } from './refresh-token-repository.interface';

/**
 * In-Memory Refresh Token Repository
 *
 * Temporary implementation for development without a database.
 * Data is lost on application restart.
 *
 * Production notes:
 * - Replace with Redis or database implementation when ready
 * - Redis is recommended for refresh tokens (built-in TTL, fast lookups)
 * - Consider token family tracking for detecting reuse attacks
 *
 * Implementation details:
 * - Uses Map with token string as key for O(1) lookup
 * - Maintains secondary index by userId for user-based operations
 */
@Injectable()
export class InMemoryRefreshTokenRepository implements IRefreshTokenRepository {
  /** Primary storage: token string → RefreshToken */
  private readonly tokensByValue: Map<string, RefreshToken> = new Map();

  /** Secondary index: userId → Set of token strings */
  private readonly tokensByUserId: Map<string, Set<string>> = new Map();

  async create(data: CreateRefreshTokenData): Promise<RefreshToken> {
    const now = new Date();
    const refreshToken: RefreshToken = {
      id: randomUUID(),
      token: data.token,
      userId: data.userId,
      expiresAt: data.expiresAt,
      revokedAt: null,
      createdAt: now,
    };

    // Add to primary storage
    this.tokensByValue.set(data.token, refreshToken);

    // Add to user index
    let userTokens = this.tokensByUserId.get(data.userId);
    if (!userTokens) {
      userTokens = new Set();
      this.tokensByUserId.set(data.userId, userTokens);
    }
    userTokens.add(data.token);

    return refreshToken;
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    return this.tokensByValue.get(token) ?? null;
  }

  async findActiveByUserId(userId: string): Promise<RefreshToken[]> {
    const userTokens = this.tokensByUserId.get(userId);
    if (!userTokens) {
      return [];
    }

    const now = new Date();
    const activeTokens: RefreshToken[] = [];

    for (const tokenValue of userTokens) {
      const token = this.tokensByValue.get(tokenValue);
      if (token && !token.revokedAt && token.expiresAt > now) {
        activeTokens.push(token);
      }
    }

    return activeTokens;
  }

  async revoke(token: string): Promise<RefreshToken | null> {
    const existing = this.tokensByValue.get(token);
    if (!existing) {
      return null;
    }

    // Already revoked - return as-is
    if (existing.revokedAt) {
      return existing;
    }

    // Create revoked version
    const revoked: RefreshToken = {
      ...existing,
      revokedAt: new Date(),
    };

    this.tokensByValue.set(token, revoked);
    return revoked;
  }

  async revokeAllByUserId(userId: string): Promise<number> {
    const userTokens = this.tokensByUserId.get(userId);
    if (!userTokens) {
      return 0;
    }

    let revokedCount = 0;
    const now = new Date();

    for (const tokenValue of userTokens) {
      const token = this.tokensByValue.get(tokenValue);
      if (token && !token.revokedAt) {
        const revoked: RefreshToken = {
          ...token,
          revokedAt: now,
        };
        this.tokensByValue.set(tokenValue, revoked);
        revokedCount++;
      }
    }

    return revokedCount;
  }

  async deleteExpired(): Promise<number> {
    const now = new Date();
    let deletedCount = 0;

    for (const [tokenValue, token] of this.tokensByValue) {
      if (token.expiresAt <= now) {
        this.tokensByValue.delete(tokenValue);

        // Remove from user index
        const userTokens = this.tokensByUserId.get(token.userId);
        if (userTokens) {
          userTokens.delete(tokenValue);
          if (userTokens.size === 0) {
            this.tokensByUserId.delete(token.userId);
          }
        }

        deletedCount++;
      }
    }

    return deletedCount;
  }

  async isValid(token: string): Promise<boolean> {
    const existing = this.tokensByValue.get(token);
    if (!existing) {
      return false;
    }

    // Check if revoked
    if (existing.revokedAt) {
      return false;
    }

    // Check if expired
    if (existing.expiresAt <= new Date()) {
      return false;
    }

    return true;
  }

  /**
   * Clear all tokens (for testing)
   */
  clear(): void {
    this.tokensByValue.clear();
    this.tokensByUserId.clear();
  }

  /**
   * Get count of all tokens (for testing/debugging)
   */
  count(): number {
    return this.tokensByValue.size;
  }
}
