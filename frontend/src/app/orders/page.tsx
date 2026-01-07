'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';
import { ROUTES } from '@/lib/constants';
import { fetchOrders } from '@/lib/order-service';
import type { OrderSummary, PaginationMeta } from '@/types/api';

/**
 * Order History Page
 *
 * Displays paginated list of user's orders (excluding DRAFT orders).
 * Most recent orders shown first.
 *
 * All data comes from backend - no local state management.
 */
export default function OrderHistoryPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // Fetch orders
  const loadOrders = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchOrders({ page, limit });
      setOrders(response.orders || []);
      setPagination(response.pagination);
      setCurrentPage(page);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load orders';
      setError(message);
      setOrders([]); // Reset orders on error
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  // Initial load - wait for auth to be ready
  useEffect(() => {
    // Don't fetch until auth is initialized and user is authenticated
    if (isAuthLoading || !isAuthenticated) return;
    loadOrders(1);
  }, [loadOrders, isAuthLoading, isAuthenticated]);

  // Pagination handlers
  const handlePreviousPage = () => {
    if (pagination?.hasPreviousPage) {
      loadOrders(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination?.hasNextPage) {
      loadOrders(currentPage + 1);
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
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status badge styles
  const getStatusStyle = (state: string): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      padding: '0.25rem 0.75rem',
      borderRadius: '4px',
      fontSize: '0.75rem',
      fontWeight: '600',
      textTransform: 'uppercase',
    };

    switch (state) {
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

  return (
    <ProtectedRoute>
      <div style={styles.container}>
        <h1 style={styles.title}>Order History</h1>

        {/* Loading State */}
        {isLoading && (
          <div style={styles.loading}>
            <p>Loading orders...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div style={styles.error}>
            <p>Error: {error}</p>
            <button onClick={() => loadOrders(currentPage)} style={styles.retryButton}>
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && (!orders || orders.length === 0) && (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>You haven&apos;t placed any orders yet.</p>
            <Link href={ROUTES.CATALOG} style={styles.shopButton}>
              Start Shopping
            </Link>
          </div>
        )}

        {/* Orders List */}
        {!isLoading && !error && orders && orders.length > 0 && (
          <>
            <div style={styles.ordersList}>
              {orders.map((order) => (
                <Link
                  key={order.orderId}
                  href={ROUTES.ORDER_DETAIL(order.orderId)}
                  style={styles.orderCard}
                >
                  <div style={styles.orderHeader}>
                    <span style={styles.orderId}>Order #{order.orderId.slice(-8)}</span>
                    <span style={getStatusStyle(order.state)}>{order.state}</span>
                  </div>
                  <div style={styles.orderDetails}>
                    <div style={styles.orderMeta}>
                      <span style={styles.metaLabel}>Items:</span>
                      <span style={styles.metaValue}>{order.itemCount}</span>
                    </div>
                    <div style={styles.orderMeta}>
                      <span style={styles.metaLabel}>Total:</span>
                      <span style={styles.metaValue}>
                        {formatPrice(order.total.amount, order.total.currency)}
                      </span>
                    </div>
                    <div style={styles.orderMeta}>
                      <span style={styles.metaLabel}>Date:</span>
                      <span style={styles.metaValue}>{formatDate(order.createdAt)}</span>
                    </div>
                  </div>
                  <div style={styles.viewDetails}>
                    View Details →
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div style={styles.pagination}>
                <button
                  onClick={handlePreviousPage}
                  disabled={!pagination.hasPreviousPage}
                  style={{
                    ...styles.pageButton,
                    ...(!pagination.hasPreviousPage ? styles.pageButtonDisabled : {}),
                  }}
                >
                  ← Previous
                </button>
                <span style={styles.pageInfo}>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={!pagination.hasNextPage}
                  style={{
                    ...styles.pageButton,
                    ...(!pagination.hasNextPage ? styles.pageButtonDisabled : {}),
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  title: {
    marginBottom: '1.5rem',
  },
  loading: {
    textAlign: 'center',
    padding: '3rem',
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
  emptyState: {
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
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  orderCard: {
    display: 'block',
    padding: '1.25rem',
    background: '#f9fafb',
    borderRadius: '8px',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'background 0.15s ease',
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  orderId: {
    fontWeight: '600',
    fontSize: '1rem',
    color: '#111',
  },
  orderDetails: {
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap',
    marginBottom: '0.75rem',
  },
  orderMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.125rem',
  },
  metaLabel: {
    fontSize: '0.75rem',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
  },
  viewDetails: {
    fontSize: '0.875rem',
    color: '#059669',
    fontWeight: '500',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '2rem',
    padding: '1rem',
  },
  pageButton: {
    padding: '0.5rem 1rem',
    background: '#fff',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
  },
  pageButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  pageInfo: {
    fontSize: '0.875rem',
    color: '#6b7280',
  },
};
