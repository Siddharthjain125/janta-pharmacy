import { HttpStatus } from '@nestjs/common';
import { BusinessException } from '../../common/exceptions/business.exception';
import { OrderStatus } from '../domain/order-status';

/**
 * Order not found exception
 */
export class OrderNotFoundException extends BusinessException {
  constructor(orderId: string) {
    super(
      'ORDER_NOT_FOUND',
      `Order with id '${orderId}' not found`,
      HttpStatus.NOT_FOUND,
    );
  }
}

/**
 * Unauthorized order access exception
 */
export class UnauthorizedOrderAccessException extends BusinessException {
  constructor() {
    super(
      'UNAUTHORIZED_ORDER_ACCESS',
      'You do not have permission to access this order',
      HttpStatus.FORBIDDEN,
    );
  }
}

/**
 * Invalid order state transition exception
 *
 * Thrown when attempting a transition that violates the order lifecycle rules.
 */
export class InvalidOrderStateTransitionException extends BusinessException {
  public readonly currentStatus: OrderStatus;
  public readonly targetStatus: OrderStatus;
  public readonly allowedTransitions: OrderStatus[];

  constructor(
    currentStatus: OrderStatus,
    targetStatus: OrderStatus,
    allowedTransitions: OrderStatus[] = [],
  ) {
    super(
      'INVALID_ORDER_STATE_TRANSITION',
      `Cannot transition order from '${currentStatus}' to '${targetStatus}'`,
      HttpStatus.CONFLICT,
    );
    this.currentStatus = currentStatus;
    this.targetStatus = targetStatus;
    this.allowedTransitions = allowedTransitions;
  }
}

/**
 * Order already in terminal state exception
 *
 * Thrown when attempting to modify an order that has reached a final state.
 */
export class OrderTerminalStateException extends BusinessException {
  public readonly currentStatus: OrderStatus;

  constructor(orderId: string, currentStatus: OrderStatus) {
    super(
      'ORDER_TERMINAL_STATE',
      `Order '${orderId}' is in terminal state '${currentStatus}' and cannot be modified`,
      HttpStatus.CONFLICT,
    );
    this.currentStatus = currentStatus;
  }
}

/**
 * Order cannot be cancelled exception
 *
 * Thrown when attempting to cancel an order that is not in a cancellable state.
 */
export class OrderCannotBeCancelledException extends BusinessException {
  public readonly currentStatus: OrderStatus;

  constructor(orderId: string, currentStatus: OrderStatus) {
    super(
      'ORDER_CANNOT_BE_CANCELLED',
      `Order '${orderId}' cannot be cancelled from status '${currentStatus}'`,
      HttpStatus.CONFLICT,
    );
    this.currentStatus = currentStatus;
  }
}

/**
 * Order not confirmed exception
 *
 * Thrown when attempting payment on an order that hasn't been confirmed.
 */
export class OrderNotConfirmedException extends BusinessException {
  public readonly currentStatus: OrderStatus;

  constructor(orderId: string, currentStatus: OrderStatus) {
    super(
      'ORDER_NOT_CONFIRMED',
      `Order '${orderId}' must be confirmed before payment. Current status: '${currentStatus}'`,
      HttpStatus.CONFLICT,
    );
    this.currentStatus = currentStatus;
  }
}

/**
 * Order already confirmed exception
 *
 * Thrown when attempting to confirm an order that is already confirmed or further along.
 */
export class OrderAlreadyConfirmedException extends BusinessException {
  public readonly currentStatus: OrderStatus;

  constructor(orderId: string, currentStatus: OrderStatus) {
    super(
      'ORDER_ALREADY_CONFIRMED',
      `Order '${orderId}' is already in status '${currentStatus}' and cannot be confirmed again`,
      HttpStatus.CONFLICT,
    );
    this.currentStatus = currentStatus;
  }
}
