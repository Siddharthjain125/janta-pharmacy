/**
 * Auth Service
 *
 * Encapsulates all authentication logic, keeping it out of React components.
 * Communicates with the backend auth endpoints and manages token lifecycle.
 *
 * Responsibilities:
 * - Login, register, refresh, logout flows
 * - Token storage coordination
 * - User state derivation from tokens
 *
 * Design:
 * - Platform-agnostic (works with any token storage implementation)
 * - No React dependencies (can be reused in mobile)
 * - Treats backend as source of truth
 */

import { tokenStorage, type ITokenStorage } from './token-storage';
import { API_BASE_URL } from './constants';
import type {
  ApiResponse,
  ApiError,
  AuthUser,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  UserRole,
} from '@/types/api';

/**
 * Auth result for login operations
 */
export interface AuthResult {
  user: AuthUser;
  expiresIn: number;
}

/**
 * Auth error with structured details
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Auth Service Class
 *
 * Handles all authentication operations.
 * Uses dependency injection for token storage to support different platforms.
 */
class AuthServiceImpl {
  private baseUrl: string;
  private storage: ITokenStorage;

  constructor(baseUrl: string, storage: ITokenStorage) {
    this.baseUrl = baseUrl;
    this.storage = storage;
  }

  /**
   * Register a new user with phone number and password
   *
   * @param request - Registration data
   * @returns Registration result
   * @throws AuthError on failure
   */
  async register(request: RegisterRequest): Promise<RegisterResponse> {
    const response = await this.makeRequest<RegisterResponse>(
      '/auth/register',
      'POST',
      request,
    );

    return response;
  }

  /**
   * Login with phone number and password
   *
   * @param request - Login credentials
   * @returns Auth result with user and token info
   * @throws AuthError on failure
   */
  async login(request: LoginRequest): Promise<AuthResult> {
    const response = await this.makeRequest<LoginResponse>(
      '/auth/login',
      'POST',
      request,
    );

    // Store tokens
    this.storage.setAccessToken(response.accessToken);
    this.storage.setRefreshToken(response.refreshToken);

    // Build AuthUser from response
    const user = this.buildAuthUser(response.user);

    return {
      user,
      expiresIn: response.expiresIn,
    };
  }

  /**
   * Refresh the access token using the stored refresh token
   *
   * @returns New auth result if successful
   * @throws AuthError if refresh fails (user should re-login)
   */
  async refresh(): Promise<AuthResult | null> {
    const refreshToken = this.storage.getRefreshToken();

    if (!refreshToken) {
      return null;
    }

    try {
      const request: RefreshTokenRequest = { refreshToken };
      const response = await this.makeRequest<RefreshTokenResponse>(
        '/auth/refresh',
        'POST',
        request,
      );

      // Store new tokens (rotation - old refresh token is now invalid)
      this.storage.setAccessToken(response.accessToken);
      this.storage.setRefreshToken(response.refreshToken);

      // Decode user from new access token
      const user = this.decodeUserFromToken(response.accessToken);

      if (!user) {
        throw new AuthError('Invalid token received', 'INVALID_TOKEN');
      }

      return {
        user,
        expiresIn: response.expiresIn,
      };
    } catch (error) {
      // Clear tokens on refresh failure - user needs to re-login
      this.storage.clearTokens();
      throw error;
    }
  }

  /**
   * Logout - clear all tokens and auth state
   */
  logout(): void {
    this.storage.clearTokens();
  }

  /**
   * Get current access token
   * Used by API client for Authorization header
   */
  getAccessToken(): string | null {
    return this.storage.getAccessToken();
  }

  /**
   * Check if there's a stored refresh token
   * Used to determine if session recovery is possible
   */
  hasRefreshToken(): boolean {
    return this.storage.getRefreshToken() !== null;
  }

  /**
   * Attempt to restore session from stored refresh token
   * Called on app boot to check for existing session
   *
   * @returns Auth result if session restored, null otherwise
   */
  async tryRestoreSession(): Promise<AuthResult | null> {
    if (!this.hasRefreshToken()) {
      return null;
    }

    try {
      return await this.refresh();
    } catch {
      // Session expired or invalid - user needs to re-login
      return null;
    }
  }

  /**
   * Decode user information from JWT access token
   *
   * Note: This is a client-side decode for display purposes only.
   * The backend validates the token on every request.
   *
   * Backend JwtPayload structure:
   * - sub: user ID
   * - phoneNumber: phone number
   * - email: email or null
   * - roles: array of role strings
   * - type: 'access' | 'refresh'
   */
  private decodeUserFromToken(token: string): AuthUser | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = JSON.parse(atob(parts[1]));

      // JWT payload structure from backend
      return {
        id: payload.sub,
        phoneNumber: payload.phoneNumber,
        email: payload.email || null,
        role: (payload.roles?.[0] || 'CUSTOMER') as UserRole,
        roles: payload.roles || ['CUSTOMER'],
      };
    } catch {
      return null;
    }
  }

  /**
   * Build AuthUser from login response
   */
  private buildAuthUser(responseUser: LoginResponse['user']): AuthUser {
    return {
      id: responseUser.id,
      phoneNumber: responseUser.phoneNumber,
      email: null, // Not returned in login response
      role: responseUser.roles[0] as UserRole,
      roles: responseUser.roles as UserRole[],
    };
  }

  /**
   * Make an HTTP request to auth endpoints
   */
  private async makeRequest<T>(
    endpoint: string,
    method: 'POST',
    body: unknown,
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = data as ApiError;
      throw new AuthError(
        error.error?.message || 'Authentication failed',
        error.error?.code || 'AUTH_ERROR',
        error.error?.details,
      );
    }

    const apiResponse = data as ApiResponse<T>;

    if (!apiResponse.success || !apiResponse.data) {
      throw new AuthError(
        apiResponse.message || 'Authentication failed',
        'AUTH_ERROR',
      );
    }

    return apiResponse.data;
  }
}

// Export singleton instance
export const authService = new AuthServiceImpl(API_BASE_URL, tokenStorage);

// Export class for testing with custom dependencies
export { AuthServiceImpl };

