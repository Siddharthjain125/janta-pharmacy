'use client';

import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ROUTES } from '@/lib/constants';
import type { Order, OrderStatus } from '@/types/api';

/**
 * Mock orders for development
 * TODO: Replace with real API call
 */
const MOCK_ORDERS: Order[] = [
  {
    id: 'order-1',
    userId: 'mock-user-id',
    status: 'CREATED' as OrderStatus,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'order-2',
    userId: 'mock-user-id',
    status: 'CANCELLED' as OrderStatus,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

/**
 * Orders List Page
 * 
 * Displays user's orders.
 * 
 * TODO: Fetch orders from API
 * TODO: Add pagination
 * TODO: Add filtering by status
 * TODO: Add search
 */
export default function OrdersPage() {
  // TODO: Replace with API call
  const orders = MOCK_ORDERS;

  return (
    <ProtectedRoute>
      <div>
        <div style={styles.header}>
          <h1>My Orders</h1>
          <button style={styles.createButton}>
            + New Order
          </button>
        </div>

        {orders.length === 0 ? (
          <p style={styles.empty}>No orders yet.</p>
        ) : (
          <div style={styles.list}>
            {orders.map((order) => (
              <Link
                key={order.id}
                href={ROUTES.ORDER_DETAIL(order.id)}
                style={styles.card}
              >
                <div style={styles.cardHeader}>
                  <span style={styles.orderId}>Order #{order.id.slice(0, 8)}</span>
                  <span style={getStatusStyle(order.status)}>{order.status}</span>
                </div>
                <div style={styles.cardBody}>
                  <span>Created: {new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

function getStatusStyle(status: OrderStatus): React.CSSProperties {
  const colors: Record<OrderStatus, string> = {
    CREATED: '#3b82f6',    // Blue - new order
    CONFIRMED: '#8b5cf6',  // Purple - confirmed
    PAID: '#22c55e',       // Green - paid
    SHIPPED: '#f59e0b',    // Amber - in transit
    DELIVERED: '#10b981',  // Emerald - completed
    CANCELLED: '#ef4444',  // Red - cancelled
  };
  return {
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '500',
    background: colors[status] || '#666',
    color: 'white',
  };
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  createButton: {
    padding: '0.5rem 1rem',
    background: '#333',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  empty: {
    textAlign: 'center',
    color: '#666',
    padding: '2rem',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  card: {
    display: 'block',
    padding: '1rem',
    border: '1px solid #eaeaea',
    borderRadius: '8px',
    textDecoration: 'none',
    color: 'inherit',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  orderId: {
    fontWeight: '500',
  },
  cardBody: {
    fontSize: '0.875rem',
    color: '#666',
  },
};

