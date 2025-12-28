import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { IOrderRepository } from './order-repository.interface';
import { OrderDto, OrderStatus } from '../dto/order.dto';
import { Order as PrismaOrder, OrderStatus as PrismaOrderStatus } from '@prisma/client';

/**
 * Prisma Order Repository
 * 
 * Production implementation using PostgreSQL via Prisma.
 * Requires DATABASE_URL to be configured.
 * 
 * TODO: Enable this repository when database is configured.
 */
@Injectable()
export class PrismaOrderRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(userId: string): Promise<OrderDto> {
    const order = await this.prisma.order.create({
      data: {
        userId,
        status: PrismaOrderStatus.CREATED,
      },
    });

    return this.toDto(order);
  }

  async findById(orderId: string): Promise<OrderDto | null> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return null;
    }

    return this.toDto(order);
  }

  async findByUserId(userId: string, status?: OrderStatus): Promise<OrderDto[]> {
    const orders = await this.prisma.order.findMany({
      where: {
        userId,
        ...(status && { status: status as PrismaOrderStatus }),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders.map((order) => this.toDto(order));
  }

  async updateStatus(orderId: string, status: OrderStatus): Promise<OrderDto> {
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: status as PrismaOrderStatus },
    });

    return this.toDto(order);
  }

  async exists(orderId: string): Promise<boolean> {
    const count = await this.prisma.order.count({
      where: { id: orderId },
    });
    return count > 0;
  }

  private toDto(order: PrismaOrder): OrderDto {
    return {
      id: order.id,
      userId: order.userId,
      status: order.status as OrderStatus,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}

