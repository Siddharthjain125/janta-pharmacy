'use client';

import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ROUTES } from '@/lib/constants';
import type { Order, OrderStatus } from '@/types/api';

/**
 * Mock order detail for development
 * TODO: Replace with real API call
 */
function getMockOrder(id: string): Order | null {
  if (id === 'order-1' || id === 'order-2') {
    return {
      id,
      userId: 'mock-user-id',
      status: id === 'order-1' ? ('CREATED' as OrderStatus) : ('CANCELLED' as OrderStatus),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
  return null;
}

/**
 * Order Detail Page
 * 
 * Displays details of a single order.
 * 
 * TODO: Fetch order from API
 * TODO: Add order items display
 * TODO: Add cancel order action
 * TODO: Add order tracking
 */
export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  // TODO: Replace with API call
  const order = getMockOrder(orderId);

  if (!order) {
    return (
      <ProtectedRoute>
        <div style={styles.notFound}>
          <h1>Order Not Found</h1>
          <p>The order you&apos;re looking for doesn&apos;t exist.</p>
          <button onClick={() => router.push(ROUTES.ORDERS)} style={styles.button}>
            Back to Orders
          </button>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div>
        <button onClick={() => router.push(ROUTES.ORDERS)} style={styles.backLink}>
          ← Back to Orders
        </button>

        <div style={styles.header}>
          <h1>Order #{order.id.slice(0, 8)}</h1>
          <span style={getStatusStyle(order.status)}>{order.status}</span>
        </div>

        <div style={styles.card}>
          <h2>Order Details</h2>
          <dl style={styles.details}>
            <div style={styles.detailRow}>
              <dt>Order ID</dt>
              <dd>{order.id}</dd>
            </div>
            <div style={styles.detailRow}>
              <dt>Status</dt>
              <dd>{order.status}</dd>
            </div>
            <div style={styles.detailRow}>
              <dt>Created</dt>
              <dd>{new Date(order.createdAt).toLocaleString()}</dd>
            </div>
            <div style={styles.detailRow}>
              <dt>Last Updated</dt>
              <dd>{new Date(order.updatedAt).toLocaleString()}</dd>
            </div>
          </dl>
        </div>

        <div style={styles.card}>
          <h2>Order Items</h2>
          <p style={styles.placeholder}>Order items will be displayed here.</p>
        </div>

        {order.status === 'CREATED' && (
          <div style={styles.actions}>
            <button style={styles.cancelButton}>Cancel Order</button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

function getStatusStyle(status: OrderStatus): React.CSSProperties {
  const colors: Record<OrderStatus, string> = {
    CREATED: '#22c55e',
    CANCELLED: '#ef4444',
  };
  return {
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    fontSize: '0.875rem',
    fontWeight: '500',
    background: colors[status] || '#666',
    color: 'white',
  };
}

const styles: Record<string, React.CSSProperties> = {
  backLink: {
    background: 'none',
    border: 'none',
    color: '#666',
    cursor: 'pointer',
    padding: 0,
    marginBottom: '1rem',
    display: 'inline-block',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  card: {
    padding: '1.5rem',
    border: '1px solid #eaeaea',
    borderRadius: '8px',
    marginBottom: '1rem',
  },
  details: {
    margin: 0,
  },
  detailRow: {
    display: 'flex',
    padding: '0.75rem 0',
    borderBottom: '1px solid #f0f0f0',
  },
  placeholder: {
    color: '#666',
    fontStyle: 'italic',
  },
  actions: {
    marginTop: '2rem',
  },
  cancelButton: {
    padding: '0.75rem 1.5rem',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  notFound: {
    textAlign: 'center',
    padding: '4rem 0',
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

