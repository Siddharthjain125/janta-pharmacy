import { OrderStatus, isTerminalStatus, isMutableStatus } from './order-status';

/**
 * Order State Machine
 *
 * Centralized definition of allowed state transitions.
 * This is the single source of truth for order lifecycle rules.
 *
 * Design principles:
 * - Explicit over implicit
 * - All transitions documented
 * - Easy to audit and modify
 *
 * State flow:
 * DRAFT (cart) → CREATED (placed) → CONFIRMED → PAID → SHIPPED → DELIVERED
 *                                                  ↓
 *                                              CANCELLED (from any non-terminal)
 */

/**
 * Allowed transitions map
 * Key: current status
 * Value: array of valid next statuses
 *
 * Checkout flow:
 * - DRAFT → CONFIRMED: Direct checkout (primary path for simple orders)
 * - DRAFT → CREATED: Reserved for orders requiring approval/review
 * - CREATED → CONFIRMED: Order approved and confirmed
 */
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.DRAFT]: [OrderStatus.CREATED, OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CREATED]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PAID, OrderStatus.CANCELLED],
  [OrderStatus.PAID]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  [OrderStatus.DELIVERED]: [], // Terminal state
  [OrderStatus.CANCELLED]: [], // Terminal state
};

/**
 * Check if a transition from one status to another is allowed
 */
export function canTransition(
  from: OrderStatus,
  to: OrderStatus,
): boolean {
  if (isTerminalStatus(from)) {
    return false;
  }

  const allowedTargets = ALLOWED_TRANSITIONS[from];
  return allowedTargets.includes(to);
}

/**
 * Get all allowed transitions from a given status
 */
export function getAllowedTransitions(from: OrderStatus): OrderStatus[] {
  return [...ALLOWED_TRANSITIONS[from]];
}

/**
 * Transition validation result
 */
export interface TransitionValidation {
  valid: boolean;
  reason?: string;
  allowedTransitions?: OrderStatus[];
}

/**
 * Validate a state transition with detailed result
 */
export function validateTransition(
  from: OrderStatus,
  to: OrderStatus,
): TransitionValidation {
  if (isTerminalStatus(from)) {
    return {
      valid: false,
      reason: `Order is in terminal state '${from}' and cannot be modified`,
      allowedTransitions: [],
    };
  }

  const allowedTargets = ALLOWED_TRANSITIONS[from];

  if (!allowedTargets.includes(to)) {
    return {
      valid: false,
      reason: `Transition from '${from}' to '${to}' is not allowed`,
      allowedTransitions: allowedTargets,
    };
  }

  return { valid: true };
}

/**
 * Business rule: Can an order be cancelled from this status?
 */
export function canCancel(status: OrderStatus): boolean {
  return canTransition(status, OrderStatus.CANCELLED);
}

/**
 * Business rule: Has the order been paid?
 */
export function isPaid(status: OrderStatus): boolean {
  return [
    OrderStatus.PAID,
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
  ].includes(status);
}

/**
 * Business rule: Is the order still modifiable (status changes allowed)?
 * Note: This is different from isMutableStatus (item changes allowed)
 */
export function isModifiable(status: OrderStatus): boolean {
  return [OrderStatus.DRAFT, OrderStatus.CREATED, OrderStatus.CONFIRMED].includes(status);
}

/**
 * Business rule: Can items be added/removed/updated?
 * Only DRAFT orders allow item modifications.
 */
export function canModifyItems(status: OrderStatus): boolean {
  return isMutableStatus(status);
}

/**
 * Business rule: Can this draft be converted to a placed order?
 */
export function canPlaceOrder(status: OrderStatus): boolean {
  return status === OrderStatus.DRAFT;
}

/**
 * Business rule: Can this draft be confirmed (checkout)?
 * Only DRAFT orders can be confirmed via checkout.
 */
export function canConfirmOrder(status: OrderStatus): boolean {
  return canTransition(status, OrderStatus.CONFIRMED);
}

