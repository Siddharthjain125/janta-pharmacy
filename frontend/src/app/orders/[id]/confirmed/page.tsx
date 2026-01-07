'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';
import { ROUTES } from '@/lib/constants';
import { apiClient } from '@/lib/api-client';
import type { ConfirmedOrder, ConfirmedOrderItem } from '@/types/api';

/**
 * Order Confirmed Page
 *
 * Displays the order confirmation after successful checkout.
 * Shows:
 * - Order ID
 * - Confirmation status
 * - Item list with details
 * - Total amount
 *
 * This page fetches the order data from the backend.
 * The data is treated as immutable truth - no local recalculations.
 */
export default function OrderConfirmedPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const orderId = params.id as string;

  const [order, setOrder] = useState<ConfirmedOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch order details - wait for auth to be ready
  useEffect(() => {
    // Don't fetch until auth is initialized
    if (isAuthLoading || !isAuthenticated) return;

    async function fetchOrder() {
      if (!orderId) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await apiClient.get<ConfirmedOrder>(`/orders/${orderId}`, {
          requiresAuth: true,
        });

        if (response.data) {
          setOrder({
            orderId: response.data.orderId || (response.data as any).id,
            state: response.data.state || (response.data as any).status,
            items: response.data.items || [],
            itemCount: response.data.itemCount,
            total: response.data.total,
            createdAt: response.data.createdAt,
            confirmedAt: response.data.confirmedAt || response.data.createdAt,
          });
        } else {
          setError('Order not found');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load order';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrder();
  }, [orderId, isAuthLoading, isAuthenticated]);

  // Format price helper
  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <ProtectedRoute>
      <div style={styles.container}>
        {/* Loading State */}
        {isLoading && (
          <div style={styles.loading}>
            <p>Loading order details...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div style={styles.errorContainer}>
            <h1>Error</h1>
            <p>{error}</p>
            <button onClick={() => router.push(ROUTES.ORDERS)} style={styles.button}>
              Go to Orders
            </button>
          </div>
        )}

        {/* Order Confirmation */}
        {!isLoading && !error && order && (
          <>
            {/* Success Header */}
            <div style={styles.successHeader}>
              <div style={styles.checkmark}>✓</div>
              <h1 style={styles.title}>Order Confirmed!</h1>
              <p style={styles.subtitle}>
                Thank you for your order. Your order has been placed successfully.
              </p>
            </div>

            {/* Order Info Card */}
            <div style={styles.card}>
              <div style={styles.orderInfo}>
                <div style={styles.infoRow}>
                  <span style={styles.label}>Order ID</span>
                  <span style={styles.value}>{order.orderId}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.label}>Status</span>
                  <span style={styles.statusBadge}>{order.state}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.label}>Confirmed At</span>
                  <span style={styles.value}>
                    {new Date(order.confirmedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>Order Items</h2>
              <div style={styles.itemsList}>
                {order.items.map((item: ConfirmedOrderItem) => (
                  <div key={item.productId} style={styles.itemRow}>
                    <div style={styles.itemDetails}>
                      <span style={styles.itemName}>{item.productName}</span>
                      <span style={styles.itemMeta}>
                        {formatPrice(item.unitPrice.amount, item.unitPrice.currency)} × {item.quantity}
                      </span>
                    </div>
                    <span style={styles.itemSubtotal}>
                      {formatPrice(item.subtotal.amount, item.subtotal.currency)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>Total ({order.itemCount} items)</span>
                <span style={styles.totalAmount}>
                  {formatPrice(order.total.amount, order.total.currency)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div style={styles.actions}>
              <Link href={ROUTES.CATALOG} style={styles.primaryButton}>
                Continue Shopping
              </Link>
              <Link href={ROUTES.ORDERS} style={styles.secondaryButton}>
                View All Orders
              </Link>
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
  },
  loading: {
    textAlign: 'center',
    padding: '3rem',
    color: '#666',
  },
  errorContainer: {
    textAlign: 'center',
    padding: '3rem',
  },
  successHeader: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  checkmark: {
    width: '64px',
    height: '64px',
    margin: '0 auto 1rem',
    background: '#059669',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '2rem',
    fontWeight: 'bold',
  },
  title: {
    fontSize: '1.75rem',
    marginBottom: '0.5rem',
    color: '#111',
  },
  subtitle: {
    color: '#6b7280',
    fontSize: '1rem',
  },
  card: {
    background: '#f9fafb',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1rem',
  },
  orderInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: '#6b7280',
    fontSize: '0.875rem',
  },
  value: {
    fontWeight: '500',
    fontSize: '0.875rem',
    fontFamily: 'monospace',
  },
  statusBadge: {
    padding: '0.25rem 0.75rem',
    background: '#8b5cf6',
    color: 'white',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#374151',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid #e5e7eb',
  },
  itemDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  itemName: {
    fontWeight: '500',
    fontSize: '0.9375rem',
  },
  itemMeta: {
    fontSize: '0.8125rem',
    color: '#6b7280',
  },
  itemSubtotal: {
    fontWeight: '600',
    color: '#374151',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '2px solid #e5e7eb',
  },
  totalLabel: {
    fontWeight: '600',
    color: '#374151',
  },
  totalAmount: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#059669',
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1.5rem',
  },
  primaryButton: {
    flex: 1,
    padding: '0.875rem 1.5rem',
    background: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    textDecoration: 'none',
    textAlign: 'center',
    fontWeight: '500',
    fontSize: '0.9375rem',
  },
  secondaryButton: {
    flex: 1,
    padding: '0.875rem 1.5rem',
    background: 'white',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    textDecoration: 'none',
    textAlign: 'center',
    fontWeight: '500',
    fontSize: '0.9375rem',
  },
  button: {
    marginTop: '1rem',
    padding: '0.75rem 1.5rem',
    background: '#333',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

