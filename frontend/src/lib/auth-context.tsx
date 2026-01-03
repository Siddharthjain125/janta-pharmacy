'use client';

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { AuthUser, UserRole } from '@/types/api';
import { apiClient } from './api-client';

/**
 * Auth context state
 */
interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Auth context value
 */
interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

/**
 * Default mock user for development
 */
const MOCK_USER: AuthUser = {
  id: 'mock-user-id',
  email: 'user@example.com',
  role: 'CUSTOMER' as UserRole,
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Auth Provider Component
 * 
 * Provides authentication state and methods to the app.
 * Currently uses mock authentication for development.
 * 
 * TODO: Implement real authentication flow
 * TODO: Add token refresh logic
 * TODO: Persist auth state to storage
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(MOCK_USER);
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = user !== null;

  /**
   * Login handler
   * TODO: Implement real login with backend
   */
  const login = useCallback(async (_email: string, _password: string): Promise<void> => {
    setIsLoading(true);
    try {
      // TODO: Call backend auth API
      // const response = await apiClient.post<AuthTokens>('/auth/login', { email, password });
      // apiClient.setAuthToken(response.data?.accessToken || null);
      
      // Mock login - simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      setUser(MOCK_USER);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout handler
   */
  const logout = useCallback((): void => {
    setUser(null);
    apiClient.setAuthToken(null);
    // TODO: Clear stored tokens
    // TODO: Call backend logout endpoint if needed
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
    }),
    [user, isAuthenticated, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

