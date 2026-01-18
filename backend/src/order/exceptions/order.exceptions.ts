import { HttpStatus } from '@nestjs/common';
import { BusinessException } from '../../common/exceptions/business.exception';
import { OrderStatus } from '../domain/order-status';

/**
 * Order not found exception
 */
export class OrderNotFoundException extends BusinessException {
  constructor(orderId: string) {
    super('ORDER_NOT_FOUND', `Order with id '${orderId}' not found`, HttpStatus.NOT_FOUND);
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

// ============================================================
// Cart / Draft Order Exceptions
// ============================================================

/**
 * User already has an active draft order
 *
 * Thrown when attempting to create a new draft when one already exists.
 * Business rule: One active draft per user.
 */
export class DraftOrderAlreadyExistsException extends BusinessException {
  public readonly existingOrderId: string;

  constructor(existingOrderId: string) {
    super(
      'DRAFT_ORDER_ALREADY_EXISTS',
      'You already have an active cart. Please use your existing cart or clear it first.',
      HttpStatus.CONFLICT,
    );
    this.existingOrderId = existingOrderId;
  }
}

/**
 * No active draft order found
 *
 * Thrown when attempting to modify a cart that doesn't exist.
 */
export class NoDraftOrderException extends BusinessException {
  constructor() {
    super(
      'NO_DRAFT_ORDER',
      'No active cart found. Please add items to start a new cart.',
      HttpStatus.NOT_FOUND,
    );
  }
}

/**
 * Order is not in draft status
 *
 * Thrown when attempting cart operations on a non-draft order.
 */
export class OrderNotDraftException extends BusinessException {
  public readonly currentStatus: OrderStatus;

  constructor(orderId: string, currentStatus: OrderStatus) {
    super(
      'ORDER_NOT_DRAFT',
      `Order '${orderId}' is not a draft (current status: '${currentStatus}'). Only draft orders can be modified.`,
      HttpStatus.CONFLICT,
    );
    this.currentStatus = currentStatus;
  }
}

/**
 * Item not found in order
 *
 * Thrown when attempting to modify/remove an item that doesn't exist in the order.
 */
export class OrderItemNotFoundException extends BusinessException {
  public readonly productId: string;

  constructor(orderId: string, productId: string) {
    super(
      'ORDER_ITEM_NOT_FOUND',
      `Product '${productId}' not found in order '${orderId}'`,
      HttpStatus.NOT_FOUND,
    );
    this.productId = productId;
  }
}

/**
 * Invalid item quantity
 *
 * Thrown when attempting to set an invalid quantity.
 */
export class InvalidQuantityException extends BusinessException {
  constructor(quantity: number) {
    super(
      'INVALID_QUANTITY',
      `Quantity must be a positive integer. Received: ${quantity}`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

/**
 * Empty cart exception
 *
 * Thrown when attempting to place an order with no items.
 */
export class EmptyCartException extends BusinessException {
  constructor() {
    super(
      'EMPTY_CART',
      'Cannot place order: cart is empty. Please add items before checkout.',
      HttpStatus.CONFLICT,
    );
  }
}

// ============================================================
// Checkout Exceptions
// ============================================================

/**
 * Prescription required exception
 *
 * Thrown when attempting to confirm an order containing prescription-required items
 * without a valid prescription. This is an intentional blocker until prescription
 * verification workflow is implemented.
 */
export class PrescriptionRequiredException extends BusinessException {
  public readonly prescriptionProducts: string[];

  constructor(prescriptionProducts: string[]) {
    super(
      'PRESCRIPTION_REQUIRED',
      `Cannot confirm order: ${prescriptionProducts.length} item(s) require a valid prescription. Prescription upload is not yet available.`,
      HttpStatus.CONFLICT,
    );
    this.prescriptionProducts = prescriptionProducts;
  }
}
