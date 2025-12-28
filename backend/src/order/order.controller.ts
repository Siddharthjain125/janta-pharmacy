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

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * Create a new order
   * POST /api/v1/orders
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
   * Get all orders for authenticated user
   * GET /api/v1/orders
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

  /**
   * Cancel an order
   * POST /api/v1/orders/:id/cancel
   */
  @Post(':id/cancel')
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
