import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { ApiResponse } from '../common/api/api-response';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser, UserRole } from '../auth/interfaces/auth-user.interface';

/**
 * Order Controller
 *
 * Exposes REST endpoints for order management.
 * Protected by JWT authentication.
 */
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * Get all orders with pagination
   * Requires: ADMIN or STAFF role
   */
  @Get()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: string,
  ): Promise<ApiResponse<unknown>> {
    const orders = await this.orderService.findAll(page, limit, status);
    return ApiResponse.success(orders, 'Orders retrieved successfully');
  }

  /**
   * Get order by ID
   * Requires: Authenticated user
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<ApiResponse<unknown>> {
    // TODO: Verify user owns this order or is admin
    const order = await this.orderService.findById(id);
    return ApiResponse.success(order, 'Order retrieved successfully');
  }

  /**
   * Get orders by user ID
   * Requires: Authenticated user (own orders) or ADMIN
   */
  @Get('user/:userId')
  async findByUser(
    @Param('userId') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @CurrentUser() user: AuthUser,
  ): Promise<ApiResponse<unknown>> {
    // TODO: Verify requesting user's own orders or is admin
    const orders = await this.orderService.findByUserId(userId, page, limit);
    return ApiResponse.success(orders, 'User orders retrieved successfully');
  }

  /**
   * Create a new order
   * Requires: Authenticated user
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createOrderDto: unknown,
    @CurrentUser() user: AuthUser,
  ): Promise<ApiResponse<unknown>> {
    // TODO: Attach user.id to order
    const order = await this.orderService.create(createOrderDto);
    return ApiResponse.success(order, 'Order created successfully');
  }

  /**
   * Update order status
   * Requires: ADMIN or STAFF role
   */
  @Put(':id/status')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: unknown,
  ): Promise<ApiResponse<unknown>> {
    const order = await this.orderService.updateStatus(id, updateStatusDto);
    return ApiResponse.success(order, 'Order status updated successfully');
  }

  /**
   * Cancel order
   * Requires: Authenticated user (own order) or ADMIN
   */
  @Post(':id/cancel')
  async cancel(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<ApiResponse<unknown>> {
    // TODO: Verify user owns this order or is admin
    const order = await this.orderService.cancel(id);
    return ApiResponse.success(order, 'Order cancelled successfully');
  }

  /**
   * Get order tracking information
   * Requires: Authenticated user
   */
  @Get(':id/tracking')
  async getTracking(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<ApiResponse<unknown>> {
    // TODO: Verify user owns this order or is admin
    const tracking = await this.orderService.getTracking(id);
    return ApiResponse.success(tracking, 'Tracking information retrieved successfully');
  }
}
