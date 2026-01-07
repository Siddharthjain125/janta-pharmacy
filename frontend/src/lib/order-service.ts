/**
 * Order Service
 *
 * API functions for order history and order management.
 * All functions use the centralized API client for consistent error handling.
 *
 * Backend is the source of truth - no local state or recalculations.
 */

import { apiClient } from './api-client';
import type {
  OrderHistoryResponse,
  OrderDetail,
  CancelledOrder,
} from '@/types/api';

/**
 * Pagination parameters for order history
 */
export interface OrderPaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Fetch paginated order history for the current user
 *
 * Returns orders in reverse chronological order (most recent first).
 * Excludes DRAFT orders (those are managed via cart).
 *
 * @param params - Pagination parameters (page, limit)
 */
export async function fetchOrders(
  params: OrderPaginationParams = {},
): Promise<OrderHistoryResponse> {
  const { page = 1, limit = 10 } = params;

  const queryParams = new URLSearchParams();
  queryParams.set('page', String(page));
  queryParams.set('limit', String(limit));

  const response = await apiClient.get<OrderHistoryResponse>(
    `/orders?${queryParams.toString()}`,
    { requiresAuth: true },
  );

  if (!response.data) {
    throw new Error('Failed to fetch orders');
  }

  // Ensure orders array exists (defensive)
  return {
    orders: response.data.orders || [],
    pagination: response.data.pagination,
  };
}

/**
 * Fetch order detail by ID
 *
 * Returns full order details including all items.
 * Enforces ownership - users can only view their own orders.
 *
 * @param orderId - The order ID to fetch
 */
export async function fetchOrderById(orderId: string): Promise<OrderDetail> {
  const response = await apiClient.get<OrderDetail>(`/orders/${orderId}`, {
    requiresAuth: true,
  });

  if (!response.data) {
    throw new Error('Order not found');
  }

  return response.data;
}

/**
 * Cancel an order
 *
 * Transitions the order to CANCELLED state if allowed by the state machine.
 * Cancellable states: DRAFT, CONFIRMED (depending on business rules)
 *
 * Business rules enforced by backend:
 * - Order must exist
 * - Order must belong to the user
 * - Order must be in a cancellable state
 *
 * @param orderId - The order ID to cancel
 * @returns The cancelled order details
 * @throws Error if cancellation fails (not found, unauthorized, invalid state)
 */
export async function cancelOrder(orderId: string): Promise<CancelledOrder> {
  const response = await apiClient.post<CancelledOrder>(
    `/orders/${orderId}/cancel`,
    undefined,
    { requiresAuth: true },
  );

  if (!response.data) {
    throw new Error('Failed to cancel order');
  }

  return response.data;
}

/**
 * Check if an order can be cancelled based on its state
 *
 * This is a frontend helper - actual cancellation rules are enforced by backend.
 * Used to conditionally show/hide cancel button.
 *
 * @param state - The order state
 */
export function canCancelOrder(state: string): boolean {
  // Orders can be cancelled if they are in DRAFT or CONFIRMED state
  // Terminal states (CANCELLED, DELIVERED) cannot be cancelled
  const cancellableStates = ['DRAFT', 'CONFIRMED', 'CREATED', 'PAID', 'SHIPPED'];
  return cancellableStates.includes(state);
}

