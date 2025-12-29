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
import { ApiResponse } from '../common/api/api-response';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/interfaces/auth-user.interface';
import { OrderDto, OrderStatus } from './dto/order.dto';

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
  constructor(private readonly orderService: OrderService) {}

  // ============================================================
  // QUERIES
  // ============================================================

  /**
   * Get all orders for authenticated user
   * GET /api/v1/orders
   * GET /api/v1/orders?status=CONFIRMED
   */
  @Get()
  async getOrders(
    @CurrentUser() user: AuthUser,
    @Query('status') status?: OrderStatus,
  ): Promise<ApiResponse<OrderDto[]>> {
    const orders = await this.orderService.getOrdersForUser(user.id, status);
    return ApiResponse.success(orders, 'Orders retrieved successfully');
  }

  /**
   * Get order by ID
   * GET /api/v1/orders/:id
   */
  @Get(':id')
  async getOrderById(
    @Param('id') orderId: string,
    @CurrentUser() user: AuthUser,
    @Headers('x-correlation-id') correlationId: string,
  ): Promise<ApiResponse<OrderDto>> {
    const order = await this.orderService.getOrderById(
      orderId,
      user.id,
      correlationId,
    );
    return ApiResponse.success(order, 'Order retrieved successfully');
  }

  // ============================================================
  // COMMANDS - Intent-based state transitions
  // ============================================================

  /**
   * Create a new order
   * POST /api/v1/orders
   *
   * Creates order in CREATED status.
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
    const order = await this.orderService.confirmOrder(
      orderId,
      user.id,
      correlationId,
    );
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
    const order = await this.orderService.payForOrder(
      orderId,
      user.id,
      correlationId,
    );
    return ApiResponse.success(order, 'Order payment recorded successfully');
  }

  /**
   * Cancel an order
   * POST /api/v1/orders/:id/cancel
   *
   * Transitions: CREATED/CONFIRMED/PAID → CANCELLED
   */
  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelOrder(
    @Param('id') orderId: string,
    @CurrentUser() user: AuthUser,
    @Headers('x-correlation-id') correlationId: string,
  ): Promise<ApiResponse<OrderDto>> {
    const order = await this.orderService.cancelOrder(
      orderId,
      user.id,
      correlationId,
    );
    return ApiResponse.success(order, 'Order cancelled successfully');
  }
}
