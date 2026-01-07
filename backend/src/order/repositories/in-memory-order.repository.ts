import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IOrderRepository } from './order-repository.interface';
import { OrderDto, OrderItemDto, OrderPriceDto } from '../dto/order.dto';
import { OrderStatus } from '../domain/order-status';
import {
  OrderItem,
  orderItemToDTO,
  calculateItemSubtotal,
} from '../domain/order-item';
import { Money } from '../../catalog/domain/money';
import { PaginationParams, PaginatedResult, createPaginatedResult } from '../queries';

/**
 * Internal order representation with domain items
 */
interface InternalOrder {
  id: string;
  userId: string;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * In-Memory Order Repository
 *
 * Development implementation for orders without PostgreSQL.
 * Data is stored in memory and resets on application restart.
 *
 * Features:
 * - Full order lifecycle support
 * - Draft order (cart) management
 * - Item management with proper totals calculation
 *
 * TODO: Replace with PrismaOrderRepository when database is configured.
 */
@Injectable()
export class InMemoryOrderRepository implements IOrderRepository {
  private orders: Map<string, InternalOrder> = new Map();

  // ============================================================
  // Standard Order Operations
  // ============================================================

  async createOrder(
    userId: string,
    status: OrderStatus = OrderStatus.CREATED,
  ): Promise<OrderDto> {
    const now = new Date();
    const order: InternalOrder = {
      id: uuidv4(),
      userId,
      status,
      items: [],
      createdAt: now,
      updatedAt: now,
    };

    this.orders.set(order.id, order);
    return this.toDto(order);
  }

  async findById(orderId: string): Promise<OrderDto | null> {
    const order = this.orders.get(orderId);
    return order ? this.toDto(order) : null;
  }

  async findByUserId(userId: string, status?: OrderStatus): Promise<OrderDto[]> {
    const userOrders: InternalOrder[] = [];

    for (const order of this.orders.values()) {
      if (order.userId === userId) {
        if (!status || order.status === status) {
          userOrders.push(order);
        }
      }
    }

    // Sort by createdAt descending
    userOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return userOrders.map((o) => this.toDto(o));
  }

  async findByUserIdPaginated(
    userId: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<OrderDto>> {
    // Collect all non-DRAFT orders for user (DRAFT = cart, not order history)
    const userOrders: InternalOrder[] = [];

    for (const order of this.orders.values()) {
      if (order.userId === userId && order.status !== OrderStatus.DRAFT) {
        userOrders.push(order);
      }
    }

    // Sort by createdAt descending (most recent first)
    userOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Get total before pagination
    const total = userOrders.length;

    // Apply pagination
    const offset = (pagination.page - 1) * pagination.limit;
    const paginatedOrders = userOrders.slice(offset, offset + pagination.limit);

    return createPaginatedResult(
      paginatedOrders.map((o) => this.toDto(o)),
      total,
      pagination,
    );
  }

  async updateStatus(orderId: string, status: OrderStatus): Promise<OrderDto> {
    const order = this.orders.get(orderId);

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    const updatedOrder: InternalOrder = {
      ...order,
      status,
      updatedAt: new Date(),
    };

    this.orders.set(orderId, updatedOrder);
    return this.toDto(updatedOrder);
  }

  async exists(orderId: string): Promise<boolean> {
    return this.orders.has(orderId);
  }

  // ============================================================
  // Draft Order / Cart Operations
  // ============================================================

  async findDraftByUserId(userId: string): Promise<OrderDto | null> {
    for (const order of this.orders.values()) {
      if (order.userId === userId && order.status === OrderStatus.DRAFT) {
        return this.toDto(order);
      }
    }
    return null;
  }

  async hasDraft(userId: string): Promise<boolean> {
    for (const order of this.orders.values()) {
      if (order.userId === userId && order.status === OrderStatus.DRAFT) {
        return true;
      }
    }
    return false;
  }

  async addItem(orderId: string, item: OrderItem): Promise<OrderDto> {
    const order = this.orders.get(orderId);

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    // Check if product already exists in order
    const existingIndex = order.items.findIndex(
      (i) => i.productId === item.productId,
    );

    let updatedItems: OrderItem[];

    if (existingIndex >= 0) {
      // Update quantity of existing item
      const existingItem = order.items[existingIndex];
      const updatedItem: OrderItem = {
        ...existingItem,
        quantity: existingItem.quantity + item.quantity,
      };
      updatedItems = [...order.items];
      updatedItems[existingIndex] = updatedItem;
    } else {
      // Add new item
      updatedItems = [...order.items, item];
    }

    const updatedOrder: InternalOrder = {
      ...order,
      items: updatedItems,
      updatedAt: new Date(),
    };

    this.orders.set(orderId, updatedOrder);
    return this.toDto(updatedOrder);
  }

  async updateItemQuantity(
    orderId: string,
    productId: string,
    quantity: number,
  ): Promise<OrderDto> {
    const order = this.orders.get(orderId);

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    const itemIndex = order.items.findIndex((i) => i.productId === productId);

    if (itemIndex < 0) {
      throw new Error(`Item ${productId} not found in order ${orderId}`);
    }

    const updatedItem: OrderItem = {
      ...order.items[itemIndex],
      quantity,
    };

    const updatedItems = [...order.items];
    updatedItems[itemIndex] = updatedItem;

    const updatedOrder: InternalOrder = {
      ...order,
      items: updatedItems,
      updatedAt: new Date(),
    };

    this.orders.set(orderId, updatedOrder);
    return this.toDto(updatedOrder);
  }

  async removeItem(orderId: string, productId: string): Promise<OrderDto> {
    const order = this.orders.get(orderId);

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    const updatedItems = order.items.filter((i) => i.productId !== productId);

    const updatedOrder: InternalOrder = {
      ...order,
      items: updatedItems,
      updatedAt: new Date(),
    };

    this.orders.set(orderId, updatedOrder);
    return this.toDto(updatedOrder);
  }

  async clearItems(orderId: string): Promise<OrderDto> {
    const order = this.orders.get(orderId);

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    const updatedOrder: InternalOrder = {
      ...order,
      items: [],
      updatedAt: new Date(),
    };

    this.orders.set(orderId, updatedOrder);
    return this.toDto(updatedOrder);
  }

  async getItem(orderId: string, productId: string): Promise<OrderItemDto | null> {
    const order = this.orders.get(orderId);

    if (!order) {
      return null;
    }

    const item = order.items.find((i) => i.productId === productId);
    return item ? orderItemToDTO(item) : null;
  }

  // ============================================================
  // Helper Methods
  // ============================================================

  /**
   * Convert internal order to DTO
   */
  private toDto(order: InternalOrder): OrderDto {
    const items: OrderItemDto[] = order.items.map(orderItemToDTO);
    const total = this.calculateTotal(order.items);

    return {
      id: order.id,
      userId: order.userId,
      status: order.status,
      items,
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      total: total.toJSON(),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  /**
   * Calculate total for all items
   */
  private calculateTotal(items: OrderItem[]): Money {
    if (items.length === 0) {
      return Money.zero();
    }

    return items.reduce((sum, item) => {
      const subtotal = calculateItemSubtotal(item);
      return sum.add(subtotal);
    }, Money.zero());
  }

  // ============================================================
  // Test Utilities
  // ============================================================

  /**
   * Clear all orders (for testing)
   */
  clear(): void {
    this.orders.clear();
  }

  /**
   * Get order count (for debugging)
   */
  size(): number {
    return this.orders.size;
  }
}
