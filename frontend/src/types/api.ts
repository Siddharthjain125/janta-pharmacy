/**
 * Standard API Response wrapper
 * Aligned with backend ApiResponse
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
  timestamp: string;
  correlationId?: string;
}

/**
 * API Error Response
 */
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  correlationId?: string;
  timestamp: string;
}

/**
 * Order status enum
 * Aligned with backend OrderStatus - represents full order lifecycle
 */
export enum OrderStatus {
  /** Order has been created but not yet confirmed */
  CREATED = 'CREATED',
  /** Order has been confirmed and is awaiting payment */
  CONFIRMED = 'CONFIRMED',
  /** Payment has been received */
  PAID = 'PAID',
  /** Order has been shipped */
  SHIPPED = 'SHIPPED',
  /** Order has been delivered */
  DELIVERED = 'DELIVERED',
  /** Order has been cancelled */
  CANCELLED = 'CANCELLED',
}

/**
 * Order entity
 * Aligned with backend OrderDto
 */
export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * User roles
 * Aligned with backend UserRole
 */
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  STAFF = 'STAFF',
  PHARMACIST = 'PHARMACIST',
  ADMIN = 'ADMIN',
}

/**
 * Authenticated user
 */
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

/**
 * Auth tokens
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

