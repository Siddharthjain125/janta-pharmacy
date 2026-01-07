import { Injectable, Inject } from '@nestjs/common';
import { ORDER_REPOSITORY, IOrderRepository } from './repositories/order-repository.interface';
import { OrderDto } from './dto/order.dto';
import {
  OrderStatus,
  validateTransition,
  canCancel,
  isTerminalStatus,
  createOrderCancelledEvent,
  DomainEventCollector,
  type OrderCancelledEvent,
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
 * Result of a successful order cancellation
 */
export interface CancelOrderResult {
  /** The cancelled order */
  order: OrderDto;
  /** Previous state before cancellation */
  previousState: OrderStatus;
  /** Domain events emitted during cancellation */
  events: ReadonlyArray<OrderCancelledEvent>;
}

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
   * Transitions (via state machine):
   * - DRAFT → CANCELLED
   * - CREATED → CANCELLED
   * - CONFIRMED → CANCELLED
   * - PAID → CANCELLED (with refund implications - not implemented)
   * - SHIPPED → CANCELLED
   *
   * Business rules:
   * - Cannot cancel DELIVERED or already CANCELLED orders (terminal states)
   * - Only order owner can cancel
   * - Cancellation goes through state machine validation
   *
   * @throws OrderNotFoundException - Order doesn't exist
   * @throws UnauthorizedOrderAccessException - User doesn't own the order
   * @throws OrderTerminalStateException - Order is in a terminal state
   * @throws OrderCannotBeCancelledException - Order can't be cancelled from current state
   */
  async cancelOrder(
    orderId: string,
    userId: string,
    correlationId: string,
  ): Promise<CancelOrderResult> {
    const order = await this.getOrderById(orderId, userId, correlationId);
    const previousState = order.status;
    const targetState = OrderStatus.CANCELLED;

    // Check if order can be cancelled using state machine
    if (!canCancel(order.status)) {
      if (isTerminalStatus(order.status)) {
        logWithCorrelation(
          'WARN',
          correlationId,
          `Cannot cancel order in terminal state`,
          'OrderService',
          { orderId, userId, currentStatus: order.status },
        );
        throw new OrderTerminalStateException(orderId, order.status);
      }
      logWithCorrelation(
        'WARN',
        correlationId,
        `Order cannot be cancelled from current state`,
        'OrderService',
        { orderId, userId, currentStatus: order.status },
      );
      throw new OrderCannotBeCancelledException(orderId, order.status);
    }

    // Validate transition through state machine
    this.validateAndLogTransition(
      correlationId,
      orderId,
      userId,
      previousState,
      targetState,
      'CANCEL',
    );

    // Perform the state transition
    const updatedOrder = await this.orderRepository.updateStatus(
      orderId,
      targetState,
    );

    // Create domain event
    const eventCollector = new DomainEventCollector();
    const orderCancelledEvent = createOrderCancelledEvent(
      {
        orderId: updatedOrder.id,
        userId: updatedOrder.userId,
        previousState,
        total: updatedOrder.total,
        itemCount: updatedOrder.itemCount,
      },
      correlationId,
    );
    eventCollector.add(orderCancelledEvent);

    // Log successful transition
    this.logStateTransition(correlationId, {
      orderId,
      userId,
      previousState,
      nextState: targetState,
      action: 'CANCEL',
    });

    return {
      order: updatedOrder,
      previousState,
      events: eventCollector.getEventsOfType<OrderCancelledEvent>('ORDER_CANCELLED'),
    };
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
