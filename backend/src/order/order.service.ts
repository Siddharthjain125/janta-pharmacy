import { Injectable, Inject } from '@nestjs/common';
import { ORDER_REPOSITORY, IOrderRepository } from './repositories/order-repository.interface';
import { OrderDto } from './dto/order.dto';
import {
  OrderStatus,
  validateTransition,
  canCancel,
  isTerminalStatus,
} from './domain';
import {
  OrderNotFoundException,
  UnauthorizedOrderAccessException,
  InvalidOrderStateTransitionException,
  OrderTerminalStateException,
  OrderCannotBeCancelledException,
  OrderNotConfirmedException,
  OrderAlreadyConfirmedException,
} from './exceptions/order.exceptions';
import { logWithCorrelation } from '../common/logging/logger';

/**
 * Order Service
 *
 * Implements order business logic with explicit lifecycle management.
 * All state transitions are validated through the order state machine.
 *
 * Design principles:
 * - Command-style methods for state transitions
 * - Explicit validation before any state change
 * - Comprehensive logging with correlation IDs
 * - No direct status updates - all through command methods
 */
@Injectable()
export class OrderService {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  // ============================================================
  // QUERIES
  // ============================================================

  /**
   * Get order by ID with ownership verification
   */
  async getOrderById(
    orderId: string,
    userId: string,
    correlationId: string,
  ): Promise<OrderDto> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      logWithCorrelation(
        'WARN',
        correlationId,
        `Order not found`,
        'OrderService',
        { orderId },
      );
      throw new OrderNotFoundException(orderId);
    }

    if (order.userId !== userId) {
      logWithCorrelation(
        'WARN',
        correlationId,
        `Unauthorized order access attempt`,
        'OrderService',
        { orderId, requestingUserId: userId, ownerUserId: order.userId },
      );
      throw new UnauthorizedOrderAccessException();
    }

    return order;
  }

  /**
   * Get all orders for the authenticated user
   */
  async getOrdersForUser(
    userId: string,
    status?: OrderStatus,
  ): Promise<OrderDto[]> {
    return this.orderRepository.findByUserId(userId, status);
  }

  // ============================================================
  // COMMANDS - State Transitions
  // ============================================================

  /**
   * Create a new order
   *
   * Initial status: CREATED
   */
  async createOrder(userId: string, correlationId: string): Promise<OrderDto> {
    const order = await this.orderRepository.createOrder(userId);

    this.logStateTransition(correlationId, {
      orderId: order.id,
      userId,
      previousState: null,
      nextState: OrderStatus.CREATED,
      action: 'CREATE',
    });

    return order;
  }

  /**
   * Confirm an order
   *
   * Transition: CREATED → CONFIRMED
   *
   * Business rules:
   * - Order must be in CREATED status
   * - Only order owner can confirm
   */
  async confirmOrder(
    orderId: string,
    userId: string,
    correlationId: string,
  ): Promise<OrderDto> {
    const order = await this.getOrderById(orderId, userId, correlationId);
    const previousState = order.status;
    const targetState = OrderStatus.CONFIRMED;

    // Validate transition
    if (order.status !== OrderStatus.CREATED) {
      throw new OrderAlreadyConfirmedException(orderId, order.status);
    }

    this.validateAndLogTransition(
      correlationId,
      orderId,
      userId,
      previousState,
      targetState,
      'CONFIRM',
    );

    const updatedOrder = await this.orderRepository.updateStatus(
      orderId,
      targetState,
    );

    this.logStateTransition(correlationId, {
      orderId,
      userId,
      previousState,
      nextState: targetState,
      action: 'CONFIRM',
    });

    return updatedOrder;
  }

  /**
   * Pay for an order
   *
   * Transition: CONFIRMED → PAID
   *
   * Business rules:
   * - Order must be in CONFIRMED status
   * - Only order owner can pay
   *
   * Note: This is the command to record payment.
   * Actual payment processing would be handled by PaymentService.
   */
  async payForOrder(
    orderId: string,
    userId: string,
    correlationId: string,
  ): Promise<OrderDto> {
    const order = await this.getOrderById(orderId, userId, correlationId);
    const previousState = order.status;
    const targetState = OrderStatus.PAID;

    // Validate order is in correct state for payment
    if (order.status !== OrderStatus.CONFIRMED) {
      throw new OrderNotConfirmedException(orderId, order.status);
    }

    this.validateAndLogTransition(
      correlationId,
      orderId,
      userId,
      previousState,
      targetState,
      'PAY',
    );

    const updatedOrder = await this.orderRepository.updateStatus(
      orderId,
      targetState,
    );

    this.logStateTransition(correlationId, {
      orderId,
      userId,
      previousState,
      nextState: targetState,
      action: 'PAY',
    });

    return updatedOrder;
  }

  /**
   * Cancel an order
   *
   * Transitions:
   * - CREATED → CANCELLED
   * - CONFIRMED → CANCELLED
   * - PAID → CANCELLED (with refund implications)
   *
   * Business rules:
   * - Cannot cancel SHIPPED, DELIVERED, or already CANCELLED orders
   * - Only order owner can cancel
   */
  async cancelOrder(
    orderId: string,
    userId: string,
    correlationId: string,
  ): Promise<OrderDto> {
    const order = await this.getOrderById(orderId, userId, correlationId);
    const previousState = order.status;
    const targetState = OrderStatus.CANCELLED;

    // Check if order can be cancelled
    if (!canCancel(order.status)) {
      if (isTerminalStatus(order.status)) {
        throw new OrderTerminalStateException(orderId, order.status);
      }
      throw new OrderCannotBeCancelledException(orderId, order.status);
    }

    this.validateAndLogTransition(
      correlationId,
      orderId,
      userId,
      previousState,
      targetState,
      'CANCEL',
    );

    const updatedOrder = await this.orderRepository.updateStatus(
      orderId,
      targetState,
    );

    this.logStateTransition(correlationId, {
      orderId,
      userId,
      previousState,
      nextState: targetState,
      action: 'CANCEL',
    });

    return updatedOrder;
  }

  // ============================================================
  // PRIVATE HELPERS
  // ============================================================

  /**
   * Validate state transition and log if invalid
   */
  private validateAndLogTransition(
    correlationId: string,
    orderId: string,
    userId: string,
    from: OrderStatus,
    to: OrderStatus,
    action: string,
  ): void {
    const validation = validateTransition(from, to);

    if (!validation.valid) {
      logWithCorrelation(
        'WARN',
        correlationId,
        `Invalid state transition attempted`,
        'OrderService',
        {
          orderId,
          userId,
          action,
          previousState: from,
          targetState: to,
          reason: validation.reason,
          allowedTransitions: validation.allowedTransitions,
        },
      );

      throw new InvalidOrderStateTransitionException(
        from,
        to,
        validation.allowedTransitions,
      );
    }
  }

  /**
   * Log successful state transition
   */
  private logStateTransition(
    correlationId: string,
    params: {
      orderId: string;
      userId: string;
      previousState: OrderStatus | null;
      nextState: OrderStatus;
      action: string;
    },
  ): void {
    logWithCorrelation(
      'INFO',
      correlationId,
      `Order state transition: ${params.action}`,
      'OrderService',
      {
        orderId: params.orderId,
        userId: params.userId,
        previousState: params.previousState,
        nextState: params.nextState,
      },
    );
  }
}
