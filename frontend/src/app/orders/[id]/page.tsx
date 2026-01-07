'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';
import { ROUTES } from '@/lib/constants';
import { fetchOrderById, cancelOrder, canCancelOrder } from '@/lib/order-service';
import type { OrderDetail } from '@/types/api';

/**
 * Order Detail Page
 *
 * Displays full order details including:
 * - Order ID and status
 * - All items with quantities and prices
 * - Order total
 * - Timestamps (created, updated)
 * - Cancel action (if order is cancellable)
 *
 * Backend is the source of truth - no local recalculations.
 */
export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cancel action state
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Fetch order details
  const loadOrder = useCallback(async () => {
    if (!orderId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchOrderById(orderId);
      setOrder(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load order';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  // Wait for auth to be ready before fetching
  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) return;
    loadOrder();
  }, [loadOrder, isAuthLoading, isAuthenticated]);

  // Handle cancel order
  const handleCancelOrder = async () => {
    if (isCancelling || !order) return;

    setIsCancelling(true);
    setCancelError(null);

    try {
      await cancelOrder(orderId);
      // Reload order to get updated state from backend
      await loadOrder();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel order';
      setCancelError(message);
    } finally {
      setIsCancelling(false);
    }
  };

  // Format price helper
  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status badge styles
  const getStatusStyle = (state: string): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      padding: '0.375rem 1rem',
      borderRadius: '4px',
      fontSize: '0.875rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      display: 'inline-block',
    };

    switch (state) {
      case 'DRAFT':
        return { ...baseStyle, background: '#f3f4f6', color: '#374151' };
      case 'CONFIRMED':
        return { ...baseStyle, background: '#8b5cf6', color: 'white' };
      case 'PAID':
        return { ...baseStyle, background: '#059669', color: 'white' };
      case 'SHIPPED':
        return { ...baseStyle, background: '#0284c7', color: 'white' };
      case 'DELIVERED':
        return { ...baseStyle, background: '#16a34a', color: 'white' };
      case 'CANCELLED':
        return { ...baseStyle, background: '#dc2626', color: 'white' };
      default:
        return { ...baseStyle, background: '#6b7280', color: 'white' };
    }
  };

  // Check if cancel action should be shown
  const showCancelAction = order && canCancelOrder(order.state);

  return (
    <ProtectedRoute>
      <div style={styles.container}>
        {/* Back Navigation */}
        <Link href={ROUTES.ORDERS} style={styles.backLink}>
          ← Back to Orders
        </Link>

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

        {/* Order Detail */}
        {!isLoading && !error && order && (
          <>
            {/* Order Header */}
            <div style={styles.header}>
              <div>
                <h1 style={styles.title}>Order Details</h1>
                <span style={styles.orderId}>#{order.orderId}</span>
              </div>
              <span style={getStatusStyle(order.state)}>{order.state}</span>
            </div>

            {/* Order Status Timeline */}
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>Order Status</h2>
              <div style={styles.statusTimeline}>
                <StatusStep
                  label="Order Created"
                  date={formatDate(order.createdAt)}
                  isActive={true}
                  isComplete={true}
                />
                {order.state !== 'DRAFT' && order.state !== 'CANCELLED' && (
                  <StatusStep
                    label="Confirmed"
                    date={order.updatedAt !== order.createdAt ? formatDate(order.updatedAt) : undefined}
                    isActive={['CONFIRMED', 'PAID', 'SHIPPED', 'DELIVERED'].includes(order.state)}
                    isComplete={['PAID', 'SHIPPED', 'DELIVERED'].includes(order.state)}
                  />
                )}
                {order.state === 'CANCELLED' && (
                  <StatusStep
                    label="Cancelled"
                    date={formatDate(order.updatedAt)}
                    isActive={true}
                    isComplete={true}
                    isCancelled={true}
                  />
                )}
              </div>
            </div>

            {/* Order Items */}
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>Items ({order.itemCount})</h2>
              <div style={styles.itemsList}>
                {order.items.map((item) => (
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
                <span style={styles.totalLabel}>Total</span>
                <span style={styles.totalAmount}>
                  {formatPrice(order.total.amount, order.total.currency)}
                </span>
              </div>
            </div>

            {/* Cancel Action */}
            {showCancelAction && (
              <div style={styles.actionsCard}>
                <h2 style={styles.sectionTitle}>Actions</h2>

                {cancelError && (
                  <div style={styles.cancelError}>
                    {cancelError}
                  </div>
                )}

                <button
                  onClick={handleCancelOrder}
                  disabled={isCancelling}
                  style={{
                    ...styles.cancelButton,
                    ...(isCancelling ? styles.cancelButtonDisabled : {}),
                  }}
                >
                  {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                </button>
                <p style={styles.cancelNote}>
                  Once cancelled, this action cannot be undone.
                </p>
              </div>
            )}

            {/* Cancelled Notice */}
            {order.state === 'CANCELLED' && (
              <div style={styles.cancelledNotice}>
                <span style={styles.cancelledIcon}>✕</span>
                <div>
                  <strong>This order has been cancelled</strong>
                  <p style={styles.cancelledText}>
                    Cancelled on {formatDate(order.updatedAt)}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}

/**
 * Status Step Component
 */
interface StatusStepProps {
  label: string;
  date?: string;
  isActive: boolean;
  isComplete: boolean;
  isCancelled?: boolean;
}

function StatusStep({ label, date, isActive, isCancelled }: StatusStepProps) {
  return (
    <div style={styles.statusStep}>
      <div
        style={{
          ...styles.statusDot,
          ...(isActive ? styles.statusDotActive : {}),
          ...(isCancelled ? styles.statusDotCancelled : {}),
        }}
      />
      <div style={styles.statusContent}>
        <span
          style={{
            ...styles.statusLabel,
            ...(isActive ? styles.statusLabelActive : {}),
          }}
        >
          {label}
        </span>
        {date && <span style={styles.statusDate}>{date}</span>}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '700px',
    margin: '0 auto',
  },
  backLink: {
    display: 'inline-block',
    marginBottom: '1.5rem',
    color: '#6b7280',
    textDecoration: 'none',
    fontSize: '0.875rem',
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
  button: {
    marginTop: '1rem',
    padding: '0.75rem 1.5rem',
    background: '#333',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '0.25rem',
  },
  orderId: {
    fontSize: '0.875rem',
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  card: {
    background: '#f9fafb',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1rem',
  },
  actionsCard: {
    background: '#fef2f2',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1rem',
    border: '1px solid #fecaca',
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#374151',
  },
  statusTimeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  statusStep: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  statusDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: '#d1d5db',
    marginTop: '4px',
    flexShrink: 0,
  },
  statusDotActive: {
    background: '#059669',
  },
  statusDotCancelled: {
    background: '#dc2626',
  },
  statusContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.125rem',
  },
  statusLabel: {
    fontSize: '0.9375rem',
    color: '#6b7280',
  },
  statusLabelActive: {
    color: '#111',
    fontWeight: '500',
  },
  statusDate: {
    fontSize: '0.8125rem',
    color: '#9ca3af',
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
    fontSize: '1rem',
    color: '#374151',
  },
  totalAmount: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#059669',
  },
  cancelError: {
    marginBottom: '1rem',
    padding: '0.75rem',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    color: '#dc2626',
    fontSize: '0.875rem',
  },
  cancelButton: {
    width: '100%',
    padding: '0.75rem 1.5rem',
    background: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.9375rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  cancelButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  cancelNote: {
    marginTop: '0.75rem',
    fontSize: '0.8125rem',
    color: '#6b7280',
    textAlign: 'center',
  },
  cancelledNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.25rem',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    marginTop: '1rem',
  },
  cancelledIcon: {
    width: '40px',
    height: '40px',
    background: '#dc2626',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
    fontWeight: 'bold',
    flexShrink: 0,
  },
  cancelledText: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginTop: '0.25rem',
  },
};
