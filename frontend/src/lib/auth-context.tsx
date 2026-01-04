'use client';

/**
 * Auth Context & Provider
 *
 * Provides authentication state and methods to the React app.
 * Connects to the AuthService for all auth operations.
 *
 * Responsibilities:
 * - Expose auth state (user, isAuthenticated, isLoading)
 * - Expose auth methods (login, register, logout)
 * - Handle session restoration on app boot
 * - Wire up API client with token provider
 *
 * Design:
 * - All auth logic lives in AuthService (not here)
 * - UI components only use this context, never AuthService directly
 * - API client is wired up here for transparent auth handling
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import type { AuthUser, LoginRequest, RegisterRequest, RegisterResponse } from '@/types/api';
import { authService, AuthError, type AuthResult } from './auth-service';
import { apiClient, type TokenProvider } from './api-client';

/**
 * Auth context state
 */
interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

/**
 * Auth context value exposed to components
 */
interface AuthContextValue extends Omit<AuthState, 'isInitialized'> {
  /** Login with phone number and password */
  login: (phoneNumber: string, password: string) => Promise<void>;
  /** Register a new user */
  register: (request: RegisterRequest) => Promise<RegisterResponse>;
  /** Logout and clear all auth state */
  logout: () => void;
  /** Clear current error */
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Auth Provider Component
 *
 * Wraps the app and provides authentication context.
 * Handles session restoration on mount and API client wiring.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true, // Start loading until session check completes
    isInitialized: false,
    error: null,
  });

  // Track if we've set up the API client listener (survives StrictMode remounts)
  const apiClientWiredRef = useRef(false);

  // Track if session restoration is in progress or completed
  const sessionRestorationRef = useRef<'idle' | 'in_progress' | 'completed'>('idle');

  /**
   * Update state helper
   */
  const updateState = useCallback((updates: Partial<AuthState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  /**
   * Handle successful authentication
   */
  const handleAuthSuccess = useCallback(
    (result: AuthResult) => {
      updateState({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    },
    [updateState],
  );

  /**
   * Handle logout (internal)
   */
  const handleLogout = useCallback(() => {
    authService.logout();
    updateState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, [updateState]);

  /**
   * Wire up API client with token provider and auth listener
   * This effect should only run once, even in StrictMode
   */
  useEffect(() => {
    if (apiClientWiredRef.current) return;
    apiClientWiredRef.current = true;

    // Create token provider that uses authService
    const tokenProvider: TokenProvider = {
      getAccessToken: () => authService.getAccessToken(),
      refreshToken: async () => {
        try {
          const result = await authService.refresh();
          if (result) {
            handleAuthSuccess(result);
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },
    };

    // Wire up API client
    apiClient.setTokenProvider(tokenProvider);
    apiClient.setAuthStateListener((authenticated) => {
      if (!authenticated) {
        handleLogout();
      }
    });

    // Note: We don't reset apiClientWiredRef on cleanup
    // This prevents double-wiring in StrictMode
  }, [handleAuthSuccess, handleLogout]);

  /**
   * Try to restore session on mount
   * Guards against duplicate execution in StrictMode
   */
  useEffect(() => {
    // Skip if already in progress or completed
    if (sessionRestorationRef.current !== 'idle') {
      return;
    }

    sessionRestorationRef.current = 'in_progress';

    const restoreSession = async () => {
      try {
        const result = await authService.tryRestoreSession();
        if (result) {
          handleAuthSuccess(result);
        } else {
          updateState({
            isLoading: false,
            isInitialized: true,
          });
        }
      } catch {
        updateState({
          isLoading: false,
          isInitialized: true,
        });
      } finally {
        sessionRestorationRef.current = 'completed';
      }
    };

    restoreSession();
  }, [handleAuthSuccess, updateState]);

  /**
   * Login with phone number and password
   */
  const login = useCallback(
    async (phoneNumber: string, password: string): Promise<void> => {
      updateState({ isLoading: true, error: null });

      try {
        const request: LoginRequest = { phoneNumber, password };
        const result = await authService.login(request);
        handleAuthSuccess(result);
      } catch (error) {
        const message =
          error instanceof AuthError
            ? error.message
            : 'Login failed. Please try again.';
        updateState({
          isLoading: false,
          error: message,
        });
        throw error;
      }
    },
    [handleAuthSuccess, updateState],
  );

  /**
   * Register a new user
   */
  const register = useCallback(
    async (request: RegisterRequest): Promise<RegisterResponse> => {
      updateState({ isLoading: true, error: null });

      try {
        const result = await authService.register(request);
        updateState({ isLoading: false });
        return result;
      } catch (error) {
        const message =
          error instanceof AuthError
            ? error.message
            : 'Registration failed. Please try again.';
        updateState({
          isLoading: false,
          error: message,
        });
        throw error;
      }
    },
    [updateState],
  );

  /**
   * Public logout method
   */
  const logout = useCallback(() => {
    handleLogout();
  }, [handleLogout]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  /**
   * Context value
   */
  const value = useMemo<AuthContextValue>(
    () => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      error: state.error,
      login,
      register,
      logout,
      clearError,
    }),
    [state, login, register, logout, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 *
 * @throws Error if used outside AuthProvider
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
