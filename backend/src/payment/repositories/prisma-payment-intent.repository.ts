import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import type { PaymentIntent } from '../domain/payment-intent.entity';
import type { CreatePaymentIntentData, UpdatePaymentIntentData } from '../domain/payment-intent.entity';
import { PaymentMethod } from '../domain/payment-method';
import { PaymentIntentStatus } from '../domain/payment-intent-status';
import type { IPaymentIntentRepository } from './payment-intent-repository.interface';
import {
  PaymentMethod as PrismaPaymentMethod,
  PaymentIntentStatus as PrismaPaymentIntentStatus,
  PaymentIntent as PrismaPaymentIntentRow,
} from '@prisma/client';

@Injectable()
export class PrismaPaymentIntentRepository implements IPaymentIntentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePaymentIntentData): Promise<PaymentIntent> {
    const row = await this.prisma.paymentIntent.create({
      data: {
        orderId: data.orderId,
        method: this.toPrismaMethod(data.method),
        status: this.toPrismaStatus(data.status),
        referenceId: data.referenceId ?? null,
        proofReference: data.proofReference ?? null,
        verifiedAt: data.status === PaymentIntentStatus.VERIFIED ? new Date() : null,
      },
    });
    return this.toDomain(row);
  }

  async findById(id: string): Promise<PaymentIntent | null> {
    const row = await this.prisma.paymentIntent.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByOrderId(orderId: string): Promise<PaymentIntent | null> {
    const row = await this.prisma.paymentIntent.findUnique({ where: { orderId } });
    return row ? this.toDomain(row) : null;
  }

  async update(id: string, data: UpdatePaymentIntentData): Promise<PaymentIntent | null> {
    const row = await this.prisma.paymentIntent.update({
      where: { id },
      data: {
        ...(data.status !== undefined && { status: this.toPrismaStatus(data.status) }),
        ...(data.referenceId !== undefined && { referenceId: data.referenceId }),
        ...(data.proofReference !== undefined && { proofReference: data.proofReference }),
        ...(data.verifiedAt !== undefined && { verifiedAt: data.verifiedAt }),
      },
    });
    return this.toDomain(row);
  }

  async findPending(): Promise<PaymentIntent[]> {
    const rows = await this.prisma.paymentIntent.findMany({
      where: {
        status: PrismaPaymentIntentStatus.SUBMITTED,
        method: PrismaPaymentMethod.UPI,
      },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((row: PrismaPaymentIntentRow) => this.toDomain(row));
  }

  private toDomain(row: PrismaPaymentIntentRow): PaymentIntent {
    return {
      id: row.id,
      orderId: row.orderId,
      method: row.method as PaymentMethod,
      status: row.status as PaymentIntentStatus,
      referenceId: row.referenceId,
      proofReference: row.proofReference,
      createdAt: row.createdAt,
      verifiedAt: row.verifiedAt,
    };
  }

  private toPrismaMethod(m: PaymentMethod): PrismaPaymentMethod {
    return m as PrismaPaymentMethod;
  }

  private toPrismaStatus(s: PaymentIntentStatus): PrismaPaymentIntentStatus {
    return s as PrismaPaymentIntentStatus;
  }
}
