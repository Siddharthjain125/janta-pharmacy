import { OrderStatus, isTerminalStatus } from './order-status';

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
 */

/**
 * Allowed transitions map
 * Key: current status
 * Value: array of valid next statuses
 */
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
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
 * Business rule: Is the order still modifiable?
 */
export function isModifiable(status: OrderStatus): boolean {
  return [OrderStatus.CREATED, OrderStatus.CONFIRMED].includes(status);
}

