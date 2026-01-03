/**
 * API Client
 *
 * Centralized HTTP client for backend API calls.
 * Handles authentication, JSON parsing, error handling, and token refresh.
 *
 * Features:
 * - Automatic Authorization header injection
 * - Transparent 401 handling with token refresh
 * - Request queuing during refresh to prevent race conditions
 * - Clean separation from auth logic (uses callbacks for token access)
 */

import { API_BASE_URL } from './constants';
import type { ApiResponse, ApiError } from '@/types/api';

/**
 * HTTP methods supported by the API client
 */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Request options for API calls
 */
interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

/**
 * Token provider interface for dependency injection
 * Allows the API client to get tokens without direct coupling to auth service
 */
export interface TokenProvider {
  getAccessToken: () => string | null;
  refreshToken: () => Promise<boolean>;
}

/**
 * Listener for auth state changes (e.g., forced logout)
 */
export type AuthStateListener = (authenticated: boolean) => void;

/**
 * API Client Class
 *
 * Handles all HTTP communication with the backend.
 * Automatically refreshes tokens on 401 responses.
 */
class ApiClient {
  private baseUrl: string;
  private tokenProvider: TokenProvider | null = null;
  private authStateListener: AuthStateListener | null = null;

  // Refresh state to prevent concurrent refresh attempts
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Set the token provider for authorization headers
   * Called by AuthProvider on mount
   */
  setTokenProvider(provider: TokenProvider | null): void {
    this.tokenProvider = provider;
  }

  /**
   * Set listener for auth state changes (e.g., when refresh fails)
   * Called by AuthProvider to handle forced logout
   */
  setAuthStateListener(listener: AuthStateListener | null): void {
    this.authStateListener = listener;
  }

  /**
   * Build request headers
   */
  private buildHeaders(options: RequestOptions): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (options.requiresAuth !== false && this.tokenProvider) {
      const token = this.tokenProvider.getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Attempt to refresh the access token
   * Returns true if refresh succeeded, false otherwise
   */
  private async attemptRefresh(): Promise<boolean> {
    // If already refreshing, wait for the existing refresh to complete
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    if (!this.tokenProvider) {
      return false;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.tokenProvider.refreshToken();

    try {
      const success = await this.refreshPromise;
      return success;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Make an API request with automatic retry on 401
   */
  async request<T>(
    endpoint: string,
    options: RequestOptions = {},
    isRetry = false,
  ): Promise<ApiResponse<T>> {
    const { method = 'GET', body } = options;
    const url = `${this.baseUrl}${endpoint}`;

    const fetchOptions: RequestInit = {
      method,
      headers: this.buildHeaders(options),
    };

    if (body && method !== 'GET') {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);

    // Handle 401 Unauthorized - attempt token refresh once
    if (response.status === 401 && !isRetry && options.requiresAuth !== false) {
      const refreshed = await this.attemptRefresh();

      if (refreshed) {
        // Retry the original request with new token
        return this.request<T>(endpoint, options, true);
      } else {
        // Refresh failed - notify listener (triggers logout)
        if (this.authStateListener) {
          this.authStateListener(false);
        }
      }
    }

    const data = await response.json();

    if (!response.ok) {
      throw data as ApiError;
    }

    return data as ApiResponse<T>;
  }

  /**
   * GET request
   */
  async get<T>(
    endpoint: string,
    options?: Omit<RequestOptions, 'method' | 'body'>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method'>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method'>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method'>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  /**
   * DELETE request
   */
  async delete<T>(
    endpoint: string,
    options?: Omit<RequestOptions, 'method' | 'body'>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export class for testing
export { ApiClient };
