/**
 * Order Status Enum
 *
 * Represents the complete lifecycle of an order.
 * Each status is a discrete state in the order's journey.
 */
export enum OrderStatus {
  /** Order has been created but not yet confirmed */
  CREATED = 'CREATED',

  /** Order has been confirmed and is awaiting payment */
  CONFIRMED = 'CONFIRMED',

  /** Payment has been received */
  PAID = 'PAID',

  /** Order has been shipped (future) */
  SHIPPED = 'SHIPPED',

  /** Order has been delivered (future) */
  DELIVERED = 'DELIVERED',

  /** Order has been cancelled */
  CANCELLED = 'CANCELLED',
}

/**
 * Order Status Metadata
 *
 * Provides human-readable information about each status.
 */
export const ORDER_STATUS_METADATA: Record<
  OrderStatus,
  { label: string; description: string; terminal: boolean }
> = {
  [OrderStatus.CREATED]: {
    label: 'Created',
    description: 'Order placed, awaiting confirmation',
    terminal: false,
  },
  [OrderStatus.CONFIRMED]: {
    label: 'Confirmed',
    description: 'Order confirmed, awaiting payment',
    terminal: false,
  },
  [OrderStatus.PAID]: {
    label: 'Paid',
    description: 'Payment received, awaiting fulfillment',
    terminal: false,
  },
  [OrderStatus.SHIPPED]: {
    label: 'Shipped',
    description: 'Order shipped, in transit',
    terminal: false,
  },
  [OrderStatus.DELIVERED]: {
    label: 'Delivered',
    description: 'Order delivered successfully',
    terminal: true,
  },
  [OrderStatus.CANCELLED]: {
    label: 'Cancelled',
    description: 'Order has been cancelled',
    terminal: true,
  },
};

/**
 * Check if status is a terminal state (no further transitions allowed)
 */
export function isTerminalStatus(status: OrderStatus): boolean {
  return ORDER_STATUS_METADATA[status].terminal;
}

