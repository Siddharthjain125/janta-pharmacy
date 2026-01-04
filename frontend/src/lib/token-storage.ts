/**
 * Token Storage Abstraction
 *
 * Provides a platform-agnostic interface for token storage.
 * - accessToken: stored in memory (more secure, cleared on page refresh)
 * - refreshToken: stored in localStorage (persistent, allows session recovery)
 *
 * This abstraction makes it easy to swap storage mechanisms later:
 * - Web: localStorage → httpOnly cookies
 * - Mobile: secure storage (AsyncStorage / Keychain / Keystore)
 *
 * Security Notes:
 * - localStorage is vulnerable to XSS attacks
 * - In production, consider httpOnly cookies for refresh tokens
 * - This is a temporary solution documented for security review
 */

import { STORAGE_KEYS } from './constants';

/**
 * Token storage interface for platform abstraction
 */
export interface ITokenStorage {
  getAccessToken(): string | null;
  setAccessToken(token: string | null): void;
  getRefreshToken(): string | null;
  setRefreshToken(token: string | null): void;
  clearTokens(): void;
}

/**
 * Web Token Storage Implementation
 *
 * Uses in-memory storage for access token and localStorage for refresh token.
 * Access token is intentionally not persisted to localStorage for security:
 * - Limits exposure window if XSS occurs
 * - Refresh flow recovers session on page reload
 */
class WebTokenStorage implements ITokenStorage {
  private accessToken: string | null = null;

  /**
   * Get access token from memory
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Store access token in memory only
   */
  setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  /**
   * Get refresh token from localStorage
   * Returns null if not in browser environment
   */
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Store refresh token in localStorage
   *
   * TODO: Replace with httpOnly cookie in production
   * This is documented as a security consideration.
   */
  setRefreshToken(token: string | null): void {
    if (typeof window === 'undefined') {
      return;
    }
    if (token) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
    } else {
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    }
  }

  /**
   * Clear all tokens
   */
  clearTokens(): void {
    this.accessToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    }
  }
}

// Export singleton instance
export const tokenStorage: ITokenStorage = new WebTokenStorage();

// Export class for testing and mobile override
export { WebTokenStorage };

