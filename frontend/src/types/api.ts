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
 * Aligned with backend AuthUser - phone number is primary identifier
 */
export interface AuthUser {
  id: string;
  phoneNumber: string;
  email?: string | null;
  role: UserRole;
  roles: UserRole[];
}

/**
 * Login request DTO
 * Aligned with backend LoginDto
 */
export interface LoginRequest {
  phoneNumber: string;
  password: string;
}

/**
 * Login response DTO
 * Aligned with backend LoginResponseDto
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: {
    id: string;
    phoneNumber: string;
    roles: string[];
  };
}

/**
 * Register request DTO
 * Aligned with backend RegisterUserDto
 */
export interface RegisterRequest {
  phoneNumber: string;
  password: string;
  email?: string;
  name?: string;
}

/**
 * Register response DTO
 * Aligned with backend RegisterUserResponseDto
 */
export interface RegisterResponse {
  userId: string;
  phoneNumber: string;
  message: string;
}

/**
 * Refresh token request DTO
 * Aligned with backend RefreshTokenDto
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Refresh token response DTO
 * Aligned with backend RefreshTokenResponseDto
 */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

// ============================================================================
// CATALOG TYPES
// ============================================================================

/**
 * Price representation
 * Aligned with backend PriceDto
 */
export interface Price {
  amount: number;
  currency: string;
  formatted: string;
}

/**
 * Product summary for listings
 * Aligned with backend ProductSummaryDto
 */
export interface ProductSummary {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  price: Price;
  requiresPrescription: boolean;
}

/**
 * Full product details
 * Aligned with backend ProductDto
 */
export interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string;
  categoryLabel: string;
  price: Price;
  requiresPrescription: boolean;
  isActive: boolean;
}

/**
 * Category information
 * Aligned with backend CategoryDto
 */
export interface Category {
  code: string;
  label: string;
  description: string;
}

/**
 * Pagination metadata
 * Aligned with backend PaginationMeta
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Paginated API response
 * Aligned with backend PaginatedResponse
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
  message: string;
  timestamp: string;
  correlationId?: string;
}

// ============================================================================
// CART TYPES
// ============================================================================

/**
 * Cart item price representation
 * Aligned with backend OrderPriceDto
 */
export interface CartPrice {
  amount: number;
  currency: string;
}

/**
 * Cart item representation
 * Aligned with backend CartItemDto
 */
export interface CartItem {
  productId: string;
  productName: string;
  unitPrice: CartPrice;
  quantity: number;
  subtotal: CartPrice;
}

/**
 * Cart (Draft Order) response
 * Aligned with backend CartResponseDto
 */
export interface Cart {
  orderId: string;
  state: string;
  items: CartItem[];
  itemCount: number;
  total: CartPrice;
  createdAt: string;
  updatedAt: string;
}

/**
 * Add to cart request
 * Aligned with backend AddToCartRequestDto
 */
export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

/**
 * Update cart item request
 * Aligned with backend UpdateCartItemRequestDto
 */
export interface UpdateCartItemRequest {
  quantity: number;
}

