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
  CATALOG: '/catalog',
  PRODUCT_DETAIL: (id: string) => `/catalog/${id}`,
  CART: '/cart',
  ORDERS: '/orders',
  ORDER_DETAIL: (id: string) => `/orders/${id}`,
  ORDER_CONFIRMED: (id: string) => `/orders/${id}/confirmed`,
  ORDER_COMPLIANCE: (orderId: string) => `/order-compliance/${orderId}`,
  PROFILE: '/profile',
  PROFILE_ADDRESSES: '/profile/addresses',
  PROFILE_CONTEXT: '/profile/context',
  PRESCRIPTIONS: '/prescriptions',
  PRESCRIPTION_NEW: '/prescriptions/new',
  ADMIN_PRESCRIPTIONS: '/admin/prescriptions',
} as const;

// Local storage keys
// Note: Using localStorage for refresh token is a temporary solution.
// In production, consider httpOnly cookies for better security.
export const STORAGE_KEYS = {
  REFRESH_TOKEN: 'janta_refresh_token',
} as const;

