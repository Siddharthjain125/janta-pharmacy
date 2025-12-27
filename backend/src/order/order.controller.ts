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
} from '@nestjs/common';
import { OrderService } from './order.service';
import { ApiResponse } from '../common/api/api-response';

/**
 * Order Controller
 *
 * Exposes REST endpoints for order management.
 * All endpoints return placeholder responses.
 */
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * Get all orders with pagination
   */
  @Get()
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
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<unknown>> {
    const order = await this.orderService.findById(id);
    return ApiResponse.success(order, 'Order retrieved successfully');
  }

  /**
   * Get orders by user ID
   */
  @Get('user/:userId')
  async findByUser(
    @Param('userId') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ): Promise<ApiResponse<unknown>> {
    const orders = await this.orderService.findByUserId(userId, page, limit);
    return ApiResponse.success(orders, 'User orders retrieved successfully');
  }

  /**
   * Create a new order
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createOrderDto: unknown): Promise<ApiResponse<unknown>> {
    const order = await this.orderService.create(createOrderDto);
    return ApiResponse.success(order, 'Order created successfully');
  }

  /**
   * Update order status
   */
  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: unknown,
  ): Promise<ApiResponse<unknown>> {
    const order = await this.orderService.updateStatus(id, updateStatusDto);
    return ApiResponse.success(order, 'Order status updated successfully');
  }

  /**
   * Cancel order
   */
  @Post(':id/cancel')
  async cancel(@Param('id') id: string): Promise<ApiResponse<unknown>> {
    const order = await this.orderService.cancel(id);
    return ApiResponse.success(order, 'Order cancelled successfully');
  }

  /**
   * Get order tracking information
   */
  @Get(':id/tracking')
  async getTracking(@Param('id') id: string): Promise<ApiResponse<unknown>> {
    const tracking = await this.orderService.getTracking(id);
    return ApiResponse.success(tracking, 'Tracking information retrieved successfully');
  }
}

