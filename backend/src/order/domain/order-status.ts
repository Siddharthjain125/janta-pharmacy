/**
 * Order Status Enum
 *
 * Represents the complete lifecycle of an order.
 * Each status is a discrete state in the order's journey.
 */
export enum OrderStatus {
  /** Draft order (cart) - mutable, not yet committed */
  DRAFT = 'DRAFT',

  /** Order has been created/placed but not yet confirmed */
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
  { label: string; description: string; terminal: boolean; mutable: boolean }
> = {
  [OrderStatus.DRAFT]: {
    label: 'Draft',
    description: 'Cart/draft order, can be modified',
    terminal: false,
    mutable: true,
  },
  [OrderStatus.CREATED]: {
    label: 'Created',
    description: 'Order placed, awaiting confirmation',
    terminal: false,
    mutable: false,
  },
  [OrderStatus.CONFIRMED]: {
    label: 'Confirmed',
    description: 'Order confirmed, awaiting payment',
    terminal: false,
    mutable: false,
  },
  [OrderStatus.PAID]: {
    label: 'Paid',
    description: 'Payment received, awaiting fulfillment',
    terminal: false,
    mutable: false,
  },
  [OrderStatus.SHIPPED]: {
    label: 'Shipped',
    description: 'Order shipped, in transit',
    terminal: false,
    mutable: false,
  },
  [OrderStatus.DELIVERED]: {
    label: 'Delivered',
    description: 'Order delivered successfully',
    terminal: true,
    mutable: false,
  },
  [OrderStatus.CANCELLED]: {
    label: 'Cancelled',
    description: 'Order has been cancelled',
    terminal: true,
    mutable: false,
  },
};

/**
 * Check if status is a terminal state (no further transitions allowed)
 */
export function isTerminalStatus(status: OrderStatus): boolean {
  return ORDER_STATUS_METADATA[status].terminal;
}

/**
 * Check if status allows item modifications (only DRAFT)
 */
export function isMutableStatus(status: OrderStatus): boolean {
  return ORDER_STATUS_METADATA[status].mutable;
}

/**
 * Check if this is a draft/cart order
 */
export function isDraftOrder(status: OrderStatus): boolean {
  return status === OrderStatus.DRAFT;
}

