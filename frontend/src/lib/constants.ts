/**
 * Application constants
 */

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Mock token for development
// TODO: Replace with real token from auth flow
export const MOCK_AUTH_TOKEN = 'mock.jwt.token';

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  ORDERS: '/orders',
  ORDER_DETAIL: (id: string) => `/orders/${id}`,
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'janta_access_token',
  REFRESH_TOKEN: 'janta_refresh_token',
  USER: 'janta_user',
} as const;

