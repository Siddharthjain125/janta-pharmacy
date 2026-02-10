'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';
import { ROUTES } from '@/lib/constants';
import { getCart, updateCartItem, removeCartItem, confirmOrder } from '@/lib/cart-service';
import { calculateCartPricingBreakdown, calculatePricingDisplay, formatPrice } from '@/lib/pricing-display';
import type { Cart, CartItem } from '@/types/api';

/**
 * Cart Page
 *
 * Displays the user's draft order (cart) with:
 * - Item list with name, unit price, quantity, subtotal
 * - Order total
 * - Quantity controls (increment/decrement)
 * - Remove item action
 *
 * All operations are backed by the Draft Order API.
 * No local state management - backend is source of truth.
 */
export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track which items have pending operations
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  // Checkout state
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Fetch cart on mount
  const fetchCart = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getCart();
      setCart(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load cart';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Wait for auth to be ready before fetching
  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) return;
    fetchCart();
  }, [fetchCart, isAuthLoading, isAuthenticated]);

  // Update item quantity
  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (updatingItems.has(productId)) return;

    // Mark item as updating
    setUpdatingItems((prev) => new Set(prev).add(productId));

    try {
      const updatedCart = await updateCartItem(productId, newQuantity);
      setCart(updatedCart);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update quantity';
      setError(message);
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  // Remove item from cart
  const handleRemoveItem = async (productId: string) => {
    if (updatingItems.has(productId)) return;

    setUpdatingItems((prev) => new Set(prev).add(productId));

    try {
      const updatedCart = await removeCartItem(productId);
      setCart(updatedCart);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove item';
      setError(message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  // Increment/decrement handlers
  const handleIncrement = (item: CartItem) => {
    handleUpdateQuantity(item.productId, item.quantity + 1);
  };

  const handleDecrement = (item: CartItem) => {
    if (item.quantity > 1) {
      handleUpdateQuantity(item.productId, item.quantity - 1);
    }
  };

  // Checkout handler — ADR-0055: never block; redirect to compliance when requiresPrescription
  const handleCheckout = async () => {
    if (isCheckingOut || !cart || cart.items.length === 0) return;

    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      const confirmedOrder = await confirmOrder();
      const orderId = confirmedOrder?.orderId;
      if (!orderId) {
        setCheckoutError('Order was placed but we could not redirect. Please check your orders.');
        return;
      }
      // ADR-0055: prescription-required → compliance (upload prescription / request callback)
      if (confirmedOrder.requiresPrescription === true) {
        router.push(ROUTES.ORDER_COMPLIANCE(orderId));
      } else {
        router.push(ROUTES.ORDER_CONFIRMED(orderId));
      }
    } catch (err: unknown) {
      const apiError = err as { error?: { code?: string; message?: string }; message?: string };
      const code = apiError?.error?.code ?? '';
      const message =
        apiError?.error?.message || (err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      // Friendly fallback when error suggests prescription (e.g. legacy PRESCRIPTION_REQUIRED)
      const isPrescriptionRelated =
        code === 'PRESCRIPTION_REQUIRED' ||
        /prescription|medical approval|compliance/i.test(message);
      if (isPrescriptionRelated) {
        setCheckoutError(
          'Some items require medical approval. Please place your order again — you will then be able to upload a prescription or request a free doctor callback.',
        );
      } else {
        setCheckoutError(message);
      }
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Check if checkout is possible
  const canCheckout = cart && cart.items.length > 0 && !isCheckingOut && updatingItems.size === 0;

  return (
    <ProtectedRoute>
      <div>
        <h1 style={styles.title}>Your Cart</h1>

        {/* Loading State */}
        {isLoading && (
          <div style={styles.loading}>
            <p>Loading cart...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={styles.error}>
            <p>Error: {error}</p>
            <button onClick={fetchCart} style={styles.retryButton}>
              Retry
            </button>
          </div>
        )}

        {/* Empty Cart State */}
        {!isLoading && !error && (!cart || cart.items.length === 0) && (
          <div style={styles.emptyCart}>
            <p style={styles.emptyText}>Your cart is empty</p>
            <Link href={ROUTES.CATALOG} style={styles.shopButton}>
              Browse Products
            </Link>
          </div>
        )}

        {/* Cart Content */}
        {!isLoading && !error && cart && cart.items.length > 0 && (
          <div style={styles.cartContainer}>
            {/* Items List */}
            <div style={styles.itemsList}>
              {cart.items.map((item) => {
                const isUpdating = updatingItems.has(item.productId);

                return (
                  <div
                    key={item.productId}
                    style={{
                      ...styles.itemCard,
                      ...(isUpdating ? styles.itemCardUpdating : {}),
                    }}
                  >
                    <div style={styles.itemInfo}>
                      <span style={styles.itemName}>{item.productName}</span>
                      <span style={styles.itemPrice}>
                        {formatPrice(item.unitPrice.amount, item.unitPrice.currency)} each
                      </span>
                    </div>

                    <div style={styles.itemControls}>
                      {/* Quantity Controls */}
                      <div style={styles.quantityControls}>
                        <button
                          onClick={() => handleDecrement(item)}
                          disabled={isUpdating || item.quantity <= 1}
                          style={{
                            ...styles.quantityButton,
                            ...(isUpdating || item.quantity <= 1
                              ? styles.quantityButtonDisabled
                              : {}),
                          }}
                        >
                          −
                        </button>
                        <span style={styles.quantity}>
                          {isUpdating ? '...' : item.quantity}
                        </span>
                        <button
                          onClick={() => handleIncrement(item)}
                          disabled={isUpdating}
                          style={{
                            ...styles.quantityButton,
                            ...(isUpdating ? styles.quantityButtonDisabled : {}),
                          }}
                        >
                          +
                        </button>
                      </div>

                      {/* Subtotal */}
                      <span style={styles.subtotal}>
                        {formatPrice(item.subtotal.amount, item.subtotal.currency)}
                      </span>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.productId)}
                        disabled={isUpdating}
                        style={{
                          ...styles.removeButton,
                          ...(isUpdating ? styles.removeButtonDisabled : {}),
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cart Summary - Receipt Style */}
            <div style={styles.summary}>
              <h3 style={styles.summaryTitle}>Order Summary</h3>
              <div style={styles.receiptBody}>
                <div style={styles.receiptRow}>
                  <span>Items ({cart.itemCount})</span>
                  <span></span>
                </div>
                {/* Pricing Breakdown (UI-only) */}
                {(() => {
                  const breakdown = calculateCartPricingBreakdown(
                    cart.items,
                    cart.total.amount,
                    cart.total.currency,
                  );
                  return (
                    <>
                      <div style={styles.receiptRow}>
                        <span>Total MRP</span>
                        <span>{formatPrice(breakdown.totalMrp, breakdown.currency)}</span>
                      </div>
                      {breakdown.totalSavings > 0 && (
                        <div style={styles.receiptRowSavings}>
                          <span>Discount</span>
                          <span>−{formatPrice(breakdown.totalSavings, breakdown.currency)}</span>
                        </div>
                      )}
                    </>
                  );
                })()}
                <div style={styles.receiptDivider}></div>
                <div style={styles.receiptTotal}>
                  <span>To Pay</span>
                  <span>{formatPrice(cart.total.amount, cart.total.currency)}</span>
                </div>
              </div>

              {/* Checkout Error */}
              {checkoutError && (
                <div style={styles.checkoutError}>
                  <p style={{ margin: 0 }}>{checkoutError}</p>
                  {checkoutError.includes('upload a prescription') && (
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>
                      <Link href={ROUTES.PRESCRIPTIONS} style={styles.errorLink}>
                        Go to prescriptions →
                      </Link>
                    </p>
                  )}
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={!canCheckout}
                style={{
                  ...styles.checkoutButton,
                  ...(!canCheckout ? styles.checkoutButtonDisabled : {}),
                }}
              >
                {isCheckingOut ? 'Processing...' : 'Place Order'}
              </button>
            </div>

            {/* Actions */}
            <div style={styles.actions}>
              <Link href={ROUTES.CATALOG} style={styles.continueShoppingLink}>
                ← Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

const styles: Record<string, React.CSSProperties> = {
  title: {
    marginBottom: '1.5rem',
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    color: '#666',
  },
  error: {
    textAlign: 'center',
    padding: '2rem',
    color: '#dc2626',
  },
  retryButton: {
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    background: '#333',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  emptyCart: {
    textAlign: 'center',
    padding: '3rem',
    background: '#f9fafb',
    borderRadius: '8px',
  },
  emptyText: {
    fontSize: '1.125rem',
    color: '#6b7280',
    marginBottom: '1rem',
  },
  shopButton: {
    display: 'inline-block',
    padding: '0.75rem 1.5rem',
    background: '#059669',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '6px',
    fontWeight: '500',
  },
  cartContainer: {
    maxWidth: '800px',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  itemCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    background: '#f9fafb',
    borderRadius: '8px',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  itemCardUpdating: {
    opacity: 0.7,
  },
  itemInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    minWidth: '200px',
    flex: 1,
  },
  itemName: {
    fontWeight: '500',
    fontSize: '1rem',
  },
  itemPrice: {
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  itemControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    flexWrap: 'wrap',
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'white',
    borderRadius: '4px',
    border: '1px solid #e5e7eb',
  },
  quantityButton: {
    width: '32px',
    height: '32px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '1.25rem',
    color: '#374151',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonDisabled: {
    color: '#d1d5db',
    cursor: 'not-allowed',
  },
  quantity: {
    minWidth: '32px',
    textAlign: 'center',
    fontWeight: '500',
  },
  subtotal: {
    fontWeight: '600',
    color: '#059669',
    minWidth: '80px',
    textAlign: 'right',
  },
  removeButton: {
    padding: '0.375rem 0.75rem',
    background: 'transparent',
    border: '1px solid #e5e7eb',
    borderRadius: '4px',
    color: '#dc2626',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  removeButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  summary: {
    marginTop: '2rem',
    padding: '1.5rem',
    background: '#f9fafb',
    borderRadius: '8px',
  },
  summaryTitle: {
    margin: '0 0 1rem 0',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#374151',
  },
  receiptBody: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  receiptRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.625rem',
    fontSize: '0.9375rem',
    color: '#4b5563',
  },
  receiptRowSavings: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.625rem',
    fontSize: '0.9375rem',
    color: '#16a34a',
  },
  receiptDivider: {
    borderTop: '1px dashed #d1d5db',
    margin: '0.75rem 0',
  },
  receiptTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#111827',
  },
  actions: {
    marginTop: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  continueShoppingLink: {
    color: '#6b7280',
    textDecoration: 'none',
    fontSize: '0.875rem',
  },
  checkoutError: {
    marginTop: '1rem',
    padding: '0.75rem',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    color: '#dc2626',
    fontSize: '0.875rem',
  },
  errorLink: {
    color: '#2563eb',
    textDecoration: 'none',
  },
  checkoutButton: {
    marginTop: '1rem',
    width: '100%',
    padding: '0.875rem 1.5rem',
    background: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  checkoutButtonDisabled: {
    background: '#9ca3af',
    cursor: 'not-allowed',
  },
};

