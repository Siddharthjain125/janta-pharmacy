import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { IOrderRepository } from './order-repository.interface';
import { OrderDto, OrderItemDto } from '../dto/order.dto';
import { OrderStatus } from '../domain/order-status';
import { OrderItem, orderItemToDTO, calculateItemSubtotal } from '../domain/order-item';
import { Money } from '../../catalog/domain/money';
import { PaginatedResult, PaginationParams, createPaginatedResult } from '../queries/pagination';
import {
  Order as PrismaOrder,
  OrderItem as PrismaOrderItem,
  OrderStatus as PrismaOrderStatus,
} from '@prisma/client';

// Type for order with items included
type OrderWithItems = PrismaOrder & { items: PrismaOrderItem[] };

/**
 * Prisma Order Repository
 *
 * Production implementation using PostgreSQL via Prisma.
 * Requires DATABASE_URL to be configured.
 *
 * Features:
 * - Full order lifecycle support
 * - Draft order (cart) management
 * - Item management with proper totals calculation
 * - Pagination support
 */
@Injectable()
export class PrismaOrderRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================
  // Standard Order Operations
  // ============================================================

  async createOrder(userId: string, status: OrderStatus = OrderStatus.CREATED): Promise<OrderDto> {
    const order = await this.prisma.order.create({
      data: {
        userId,
        status: this.toPrismaStatus(status),
      },
      include: { items: true },
    });

    return this.toDto(order);
  }

  async findById(orderId: string): Promise<OrderDto | null> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    return order ? this.toDto(order) : null;
  }

  async findByUserId(userId: string, status?: OrderStatus): Promise<OrderDto[]> {
    const orders = await this.prisma.order.findMany({
      where: {
        userId,
        ...(status && { status: this.toPrismaStatus(status) }),
      },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => this.toDto(order));
  }

  async findByUserIdPaginated(
    userId: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<OrderDto>> {
    // Exclude DRAFT orders from history (those are carts)
    const where = {
      userId,
      status: { not: PrismaOrderStatus.DRAFT },
    };

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return createPaginatedResult(
      orders.map((order) => this.toDto(order)),
      total,
      pagination,
    );
  }

  async updateStatus(orderId: string, status: OrderStatus): Promise<OrderDto> {
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: this.toPrismaStatus(status) },
      include: { items: true },
    });

    return this.toDto(order);
  }

  async exists(orderId: string): Promise<boolean> {
    const count = await this.prisma.order.count({
      where: { id: orderId },
    });
    return count > 0;
  }

  // ============================================================
  // Draft Order / Cart Operations
  // ============================================================

  async findDraftByUserId(userId: string): Promise<OrderDto | null> {
    const order = await this.prisma.order.findFirst({
      where: {
        userId,
        status: PrismaOrderStatus.DRAFT,
      },
      include: { items: true },
    });

    return order ? this.toDto(order) : null;
  }

  async hasDraft(userId: string): Promise<boolean> {
    const count = await this.prisma.order.count({
      where: {
        userId,
        status: PrismaOrderStatus.DRAFT,
      },
    });
    return count > 0;
  }

  async addItem(orderId: string, item: OrderItem): Promise<OrderDto> {
    // Check if item already exists in order
    const existingItem = await this.prisma.orderItem.findUnique({
      where: {
        orderId_productId: {
          orderId,
          productId: item.productId,
        },
      },
    });

    if (existingItem) {
      // Update quantity of existing item
      await this.prisma.orderItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + item.quantity },
      });
    } else {
      // Create new item
      await this.prisma.orderItem.create({
        data: {
          orderId,
          productId: item.productId,
          productName: item.productName,
          unitPriceAmount: item.unitPrice.getAmountInMinorUnits(),
          unitPriceCurrency: item.unitPrice.getCurrency(),
          quantity: item.quantity,
          addedAt: item.addedAt,
        },
      });
    }

    // Update order timestamp and return
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { updatedAt: new Date() },
      include: { items: true },
    });

    return this.toDto(order);
  }

  async updateItemQuantity(
    orderId: string,
    productId: string,
    quantity: number,
  ): Promise<OrderDto> {
    await this.prisma.orderItem.update({
      where: {
        orderId_productId: {
          orderId,
          productId,
        },
      },
      data: { quantity },
    });

    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { updatedAt: new Date() },
      include: { items: true },
    });

    return this.toDto(order);
  }

  async removeItem(orderId: string, productId: string): Promise<OrderDto> {
    await this.prisma.orderItem.delete({
      where: {
        orderId_productId: {
          orderId,
          productId,
        },
      },
    });

    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { updatedAt: new Date() },
      include: { items: true },
    });

    return this.toDto(order);
  }

  async clearItems(orderId: string): Promise<OrderDto> {
    await this.prisma.orderItem.deleteMany({
      where: { orderId },
    });

    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { updatedAt: new Date() },
      include: { items: true },
    });

    return this.toDto(order);
  }

  async getItem(orderId: string, productId: string): Promise<OrderItemDto | null> {
    const item = await this.prisma.orderItem.findUnique({
      where: {
        orderId_productId: {
          orderId,
          productId,
        },
      },
    });

    return item ? this.itemToDto(item) : null;
  }

  // ============================================================
  // Private Helpers
  // ============================================================

  /**
   * Convert Prisma order (with items) to DTO
   */
  private toDto(order: OrderWithItems): OrderDto {
    const items: OrderItemDto[] = order.items.map((item) => this.itemToDto(item));
    const total = this.calculateTotal(order.items);

    return {
      id: order.id,
      userId: order.userId,
      status: this.toDomainStatus(order.status),
      items,
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      total: total.toJSON(),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  /**
   * Convert Prisma order item to DTO
   */
  private itemToDto(item: PrismaOrderItem): OrderItemDto {
    const unitPrice = Money.fromMinorUnits(item.unitPriceAmount, item.unitPriceCurrency);
    const subtotal = unitPrice.multiply(item.quantity);

    return {
      productId: item.productId,
      productName: item.productName,
      unitPrice: unitPrice.toJSON(),
      quantity: item.quantity,
      subtotal: subtotal.toJSON(),
      addedAt: item.addedAt.toISOString(),
    };
  }

  /**
   * Calculate total for all items
   */
  private calculateTotal(items: PrismaOrderItem[]): Money {
    if (items.length === 0) {
      return Money.zero();
    }

    return items.reduce((sum, item) => {
      const unitPrice = Money.fromMinorUnits(item.unitPriceAmount, item.unitPriceCurrency);
      const subtotal = unitPrice.multiply(item.quantity);
      return sum.add(subtotal);
    }, Money.zero());
  }

  /**
   * Convert domain OrderStatus to Prisma enum
   */
  private toPrismaStatus(status: OrderStatus): PrismaOrderStatus {
    const mapping: Record<OrderStatus, PrismaOrderStatus> = {
      [OrderStatus.DRAFT]: PrismaOrderStatus.DRAFT,
      [OrderStatus.CREATED]: PrismaOrderStatus.CREATED,
      [OrderStatus.CONFIRMED]: PrismaOrderStatus.CONFIRMED,
      [OrderStatus.PAID]: PrismaOrderStatus.PAID,
      [OrderStatus.SHIPPED]: PrismaOrderStatus.SHIPPED,
      [OrderStatus.DELIVERED]: PrismaOrderStatus.DELIVERED,
      [OrderStatus.CANCELLED]: PrismaOrderStatus.CANCELLED,
    };
    return mapping[status];
  }

  /**
   * Convert Prisma OrderStatus to domain enum
   */
  private toDomainStatus(status: PrismaOrderStatus): OrderStatus {
    const mapping: Record<PrismaOrderStatus, OrderStatus> = {
      [PrismaOrderStatus.DRAFT]: OrderStatus.DRAFT,
      [PrismaOrderStatus.CREATED]: OrderStatus.CREATED,
      [PrismaOrderStatus.CONFIRMED]: OrderStatus.CONFIRMED,
      [PrismaOrderStatus.PAID]: OrderStatus.PAID,
      [PrismaOrderStatus.SHIPPED]: OrderStatus.SHIPPED,
      [PrismaOrderStatus.DELIVERED]: OrderStatus.DELIVERED,
      [PrismaOrderStatus.CANCELLED]: OrderStatus.CANCELLED,
    };
    return mapping[status];
  }
}
