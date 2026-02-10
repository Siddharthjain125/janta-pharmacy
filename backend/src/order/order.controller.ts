import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderQueryService } from './order-query.service';
import { CartService } from './cart.service';
import { ApiResponse } from '../common/api/api-response';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/interfaces/auth-user.interface';
import { OrderDto, OrderStatus } from './dto/order.dto';
import {
  CheckoutResponseDto,
  toCheckoutResponseDto,
  CancelOrderResponseDto,
  toCancelOrderResponseDto,
} from './dto/cart.dto';
import {
  OrderHistoryQueryDto,
  OrderHistoryResponseDto,
  OrderDetailDto,
} from './dto/order-history.dto';
import { logWithCorrelation } from '../common/logging/logger';

/**
 * Order Controller
 *
 * Exposes intent-based REST endpoints for order management.
 * Controllers stay thin - all business logic is in OrderService.
 *
 * Endpoints follow command-query separation:
 * - GET endpoints for queries
 * - POST endpoints for commands (state transitions)
 */
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly orderQueryService: OrderQueryService,
    private readonly cartService: CartService,
  ) {}

  // ============================================================
  // QUERIES
  // ============================================================

  /**
   * Get paginated order history for authenticated user
   * GET /api/v1/orders
   * GET /api/v1/orders?page=1&limit=10
   *
   * Returns orders sorted by creation date (most recent first).
   * Excludes DRAFT orders (carts) - only shows placed orders.
   */
  @Get()
  async getOrderHistory(
    @CurrentUser() user: AuthUser,
    @Query() query: OrderHistoryQueryDto,
    @Headers('x-correlation-id') correlationId: string,
  ): Promise<ApiResponse<OrderHistoryResponseDto>> {
    logWithCorrelation('DEBUG', correlationId, 'Fetching order history', 'OrderController', {
      userId: user.id,
      page: query.page,
      limit: query.limit,
    });

    const result = await this.orderQueryService.getOrderHistory(
      user.id,
      { page: query.page, limit: query.limit },
      correlationId,
    );

    logWithCorrelation('DEBUG', correlationId, 'Order history retrieved', 'OrderController', {
      userId: user.id,
      returned: result.orders.length,
      total: result.pagination.total,
    });

    return ApiResponse.success(result, 'Order history retrieved successfully');
  }

  /**
   * Get order detail by ID
   * GET /api/v1/orders/:id
   *
   * Returns full order details including all items.
   * Users can only view their own orders.
   */
  @Get(':id')
  async getOrderById(
    @Param('id') orderId: string,
    @CurrentUser() user: AuthUser,
    @Headers('x-correlation-id') correlationId: string,
  ): Promise<ApiResponse<OrderDetailDto>> {
    logWithCorrelation('DEBUG', correlationId, 'Fetching order detail', 'OrderController', {
      userId: user.id,
      orderId,
    });

    const order = await this.orderQueryService.getOrderById(orderId, user.id, correlationId);

    logWithCorrelation('DEBUG', correlationId, 'Order detail retrieved', 'OrderController', {
      userId: user.id,
      orderId,
      state: order.state,
    });

    return ApiResponse.success(order, 'Order retrieved successfully');
  }

  // ============================================================
  // COMMANDS - Intent-based state transitions
  // ============================================================

  /**
   * Checkout - Confirm draft order
   * POST /api/v1/orders/checkout
   *
   * Converts the user's active cart (DRAFT order) into a confirmed order.
   * This is an irreversible business commitment.
   *
   * Business rules enforced (in domain layer):
   * - User must have an active cart (DRAFT order)
   * - Cart must have at least one item
   * - No prescription-required items (until prescription workflow exists)
   * - User must own the cart
   *
   * Transitions: DRAFT → CONFIRMED
   */
  @Post('checkout')
  @HttpCode(HttpStatus.OK)
  async checkout(
    @CurrentUser() user: AuthUser,
    @Headers('x-correlation-id') correlationId: string,
  ): Promise<ApiResponse<CheckoutResponseDto>> {
    logWithCorrelation('INFO', correlationId, 'Checkout initiated', 'OrderController', {
      userId: user.id,
    });

    const result = await this.cartService.confirmDraftOrder(user.id, correlationId);

    logWithCorrelation('INFO', correlationId, 'Checkout completed', 'OrderController', {
      userId: user.id,
      orderId: result.order.id,
      total: result.order.total.amount,
    });

    return ApiResponse.success(toCheckoutResponseDto(result.order), 'Order confirmed successfully');
  }

  /**
   * Create a new order
   * POST /api/v1/orders
   *
   * Creates order in CREATED status.
   * Note: For cart-based checkout, use POST /orders/checkout instead.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrder(
    @CurrentUser() user: AuthUser,
    @Headers('x-correlation-id') correlationId: string,
  ): Promise<ApiResponse<OrderDto>> {
    const order = await this.orderService.createOrder(user.id, correlationId);
    return ApiResponse.success(order, 'Order created successfully');
  }

  /**
   * Confirm an order
   * POST /api/v1/orders/:id/confirm
   *
   * Transitions: CREATED → CONFIRMED
   */
  @Post(':id/confirm')
  @HttpCode(HttpStatus.OK)
  async confirmOrder(
    @Param('id') orderId: string,
    @CurrentUser() user: AuthUser,
    @Headers('x-correlation-id') correlationId: string,
  ): Promise<ApiResponse<OrderDto>> {
    const order = await this.orderService.confirmOrder(orderId, user.id, correlationId);
    return ApiResponse.success(order, 'Order confirmed successfully');
  }

  /**
   * Pay for an order
   * POST /api/v1/orders/:id/pay
   *
   * Transitions: CONFIRMED → PAID
   *
   * Note: In a real system, this would integrate with PaymentService.
   * For now, it simply records that payment was received.
   */
  @Post(':id/pay')
  @HttpCode(HttpStatus.OK)
  async payForOrder(
    @Param('id') orderId: string,
    @CurrentUser() user: AuthUser,
    @Headers('x-correlation-id') correlationId: string,
  ): Promise<ApiResponse<OrderDto>> {
    const order = await this.orderService.payForOrder(orderId, user.id, correlationId);
    return ApiResponse.success(order, 'Order payment recorded successfully');
  }

  /**
   * Ship an order (fulfilment)
   * POST /api/v1/orders/:id/ship
   *
   * Transitions: PAID → SHIPPED.
   * ADR-0055: Blocked until compliance approval (prescription or consultation).
   */
  @Post(':id/ship')
  @HttpCode(HttpStatus.OK)
  async shipOrder(
    @Param('id') orderId: string,
    @CurrentUser() user: AuthUser,
    @Headers('x-correlation-id') correlationId: string,
  ): Promise<ApiResponse<OrderDto>> {
    const order = await this.orderService.shipOrder(orderId, user.id, correlationId);
    return ApiResponse.success(order, 'Order shipped successfully');
  }

  /**
   * Cancel an order
   * POST /api/v1/orders/:id/cancel
   *
   * Cancels an order if allowed by the order lifecycle state machine.
   * All business rules and state transitions are enforced in the domain layer.
   *
   * Allowed transitions:
   * - DRAFT → CANCELLED
   * - CREATED → CANCELLED
   * - CONFIRMED → CANCELLED
   * - PAID → CANCELLED
   * - SHIPPED → CANCELLED
   *
   * Cannot cancel orders in terminal states (DELIVERED, CANCELLED).
   *
   * Errors (handled by global error handler):
   * - Order not found → 404
   * - Unauthorized access → 403
   * - Invalid state transition → 409
   * - Already cancelled → 409
   */
  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelOrder(
    @Param('id') orderId: string,
    @CurrentUser() user: AuthUser,
    @Headers('x-correlation-id') correlationId: string,
  ): Promise<ApiResponse<CancelOrderResponseDto>> {
    logWithCorrelation('INFO', correlationId, 'Cancel order requested', 'OrderController', {
      userId: user.id,
      orderId,
    });

    const result = await this.orderService.cancelOrder(orderId, user.id, correlationId);

    logWithCorrelation('INFO', correlationId, 'Order cancelled successfully', 'OrderController', {
      userId: user.id,
      orderId,
      previousState: result.previousState,
    });

    return ApiResponse.success(
      toCancelOrderResponseDto(result.order),
      'Order cancelled successfully',
    );
  }
}
