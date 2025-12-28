import { Injectable, Inject } from '@nestjs/common';
import { ORDER_REPOSITORY, IOrderRepository } from './repositories/order-repository.interface';
import { OrderDto, OrderStatus } from './dto/order.dto';
import {
  OrderNotFoundException,
  UnauthorizedOrderAccessException,
  InvalidOrderStateException,
} from './exceptions/order.exceptions';
import { logWithCorrelation } from '../common/logging/logger';

@Injectable()
export class OrderService {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  /**
   * Create a new order for the authenticated user
   */
  async createOrder(userId: string, correlationId: string): Promise<OrderDto> {
    const order = await this.orderRepository.createOrder(userId);

    logWithCorrelation(
      'INFO',
      correlationId,
      `Order created: ${order.id}`,
      'OrderService',
      { orderId: order.id, userId },
    );

    return order;
  }

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
        `Order not found: ${orderId}`,
        'OrderService',
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

  /**
   * Cancel an order
   */
  async cancelOrder(
    orderId: string,
    userId: string,
    correlationId: string,
  ): Promise<OrderDto> {
    const order = await this.getOrderById(orderId, userId, correlationId);

    if (order.status !== OrderStatus.CREATED) {
      throw new InvalidOrderStateException(order.status, OrderStatus.CANCELLED);
    }

    const updatedOrder = await this.orderRepository.updateStatus(
      orderId,
      OrderStatus.CANCELLED,
    );

    logWithCorrelation(
      'INFO',
      correlationId,
      `Order cancelled: ${orderId}`,
      'OrderService',
      { orderId, userId },
    );

    return updatedOrder;
  }
}
