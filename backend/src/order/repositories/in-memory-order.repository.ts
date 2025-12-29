import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IOrderRepository } from './order-repository.interface';
import { OrderDto } from '../dto/order.dto';
import { OrderStatus } from '../domain/order-status';

/**
 * In-Memory Order Repository
 *
 * Temporary implementation for development without PostgreSQL.
 * Data is stored in memory and resets on application restart.
 *
 * TODO: Replace with PrismaOrderRepository when database is configured.
 */
@Injectable()
export class InMemoryOrderRepository implements IOrderRepository {
  private orders: Map<string, OrderDto> = new Map();

  async createOrder(userId: string): Promise<OrderDto> {
    const now = new Date();
    const order: OrderDto = {
      id: uuidv4(),
      userId,
      status: OrderStatus.CREATED,
      createdAt: now,
      updatedAt: now,
    };

    this.orders.set(order.id, order);
    return order;
  }

  async findById(orderId: string): Promise<OrderDto | null> {
    return this.orders.get(orderId) || null;
  }

  async findByUserId(userId: string, status?: OrderStatus): Promise<OrderDto[]> {
    const userOrders: OrderDto[] = [];

    for (const order of this.orders.values()) {
      if (order.userId === userId) {
        if (!status || order.status === status) {
          userOrders.push(order);
        }
      }
    }

    // Sort by createdAt descending
    return userOrders.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  async updateStatus(orderId: string, status: OrderStatus): Promise<OrderDto> {
    const order = this.orders.get(orderId);

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    const updatedOrder: OrderDto = {
      ...order,
      status,
      updatedAt: new Date(),
    };

    this.orders.set(orderId, updatedOrder);
    return updatedOrder;
  }

  async exists(orderId: string): Promise<boolean> {
    return this.orders.has(orderId);
  }
}
