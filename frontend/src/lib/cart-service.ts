/**
 * Cart Service
 *
 * API functions for cart (draft order) management.
 * All functions use the centralized API client for consistent error handling.
 *
 * The cart is modeled as a Draft Order on the backend.
 * No local state - backend is the source of truth.
 */

import { apiClient } from './api-client';
import type { Cart, ConfirmedOrder } from '@/types/api';

/**
 * Get the current user's cart (draft order)
 *
 * Returns null if no cart exists.
 */
export async function getCart(): Promise<Cart | null> {
  const response = await apiClient.get<Cart | null>('/cart', {
    requiresAuth: true,
  });

  return response.data;
}

/**
 * Create or get existing cart
 *
 * Idempotent - returns existing cart if one exists.
 */
export async function createOrGetCart(): Promise<Cart> {
  const response = await apiClient.post<Cart>('/cart', undefined, {
    requiresAuth: true,
  });

  if (!response.data) {
    throw new Error('Failed to create cart');
  }

  return response.data;
}

/**
 * Add an item to the cart
 *
 * If the product already exists in the cart, quantity is incremented.
 * Creates a cart automatically if none exists.
 *
 * @param productId - The product to add
 * @param quantity - Quantity to add (default: 1)
 */
export async function addItemToCart(
  productId: string,
  quantity: number = 1,
): Promise<Cart> {
  const response = await apiClient.post<Cart>(
    '/cart/items',
    { productId, quantity },
    { requiresAuth: true },
  );

  if (!response.data) {
    throw new Error('Failed to add item to cart');
  }

  return response.data;
}

/**
 * Update the quantity of an item in the cart
 *
 * @param productId - The product to update
 * @param quantity - New quantity (must be >= 1)
 */
export async function updateCartItem(
  productId: string,
  quantity: number,
): Promise<Cart> {
  const response = await apiClient.patch<Cart>(
    `/cart/items/${productId}`,
    { quantity },
    { requiresAuth: true },
  );

  if (!response.data) {
    throw new Error('Failed to update cart item');
  }

  return response.data;
}

/**
 * Remove an item from the cart
 *
 * @param productId - The product to remove
 */
export async function removeCartItem(productId: string): Promise<Cart> {
  const response = await apiClient.delete<Cart>(`/cart/items/${productId}`, {
    requiresAuth: true,
  });

  if (!response.data) {
    throw new Error('Failed to remove item from cart');
  }

  return response.data;
}

// ============================================================================
// CHECKOUT
// ============================================================================

/**
 * Confirm the current draft order (checkout)
 *
 * Converts the user's cart (DRAFT order) into a CONFIRMED order.
 * This is an irreversible action.
 *
 * Business rules enforced by backend:
 * - Cart must exist and be in DRAFT state
 * - Cart must have at least one item
 * - No prescription-required items (until workflow exists)
 *
 * @returns The confirmed order details
 * @throws Error if checkout fails (empty cart, invalid state, prescription required, etc.)
 */
export async function confirmOrder(): Promise<ConfirmedOrder> {
  const response = await apiClient.post<ConfirmedOrder>(
    '/orders/checkout',
    undefined,
    { requiresAuth: true },
  );

  if (!response.data) {
    throw new Error('Failed to confirm order');
  }

  return response.data;
}

