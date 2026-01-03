/**
 * Application constants
 */

// API Configuration
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  ORDERS: '/orders',
  ORDER_DETAIL: (id: string) => `/orders/${id}`,
} as const;

// Local storage keys
// Note: Using localStorage for refresh token is a temporary solution.
// In production, consider httpOnly cookies for better security.
export const STORAGE_KEYS = {
  REFRESH_TOKEN: 'janta_refresh_token',
} as const;

