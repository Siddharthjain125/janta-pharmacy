import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { PaymentIntent } from '../domain/payment-intent.entity';
import type { CreatePaymentIntentData, UpdatePaymentIntentData } from '../domain/payment-intent.entity';
import { PaymentIntentStatus } from '../domain/payment-intent-status';
import type { IPaymentIntentRepository } from './payment-intent-repository.interface';

@Injectable()
export class InMemoryPaymentIntentRepository implements IPaymentIntentRepository {
  private readonly intents = new Map<string, PaymentIntent>();

  async create(data: CreatePaymentIntentData): Promise<PaymentIntent> {
    const id = randomUUID();
    const intent: PaymentIntent = {
      id,
      orderId: data.orderId,
      method: data.method,
      status: data.status,
      referenceId: data.referenceId ?? null,
      proofReference: data.proofReference ?? null,
      createdAt: new Date(),
      verifiedAt: data.status === PaymentIntentStatus.VERIFIED ? new Date() : null,
    };
    this.intents.set(id, intent);
    return intent;
  }

  async findById(id: string): Promise<PaymentIntent | null> {
    return this.intents.get(id) ?? null;
  }

  async findByOrderId(orderId: string): Promise<PaymentIntent | null> {
    for (const intent of this.intents.values()) {
      if (intent.orderId === orderId) return intent;
    }
    return null;
  }

  async update(id: string, data: UpdatePaymentIntentData): Promise<PaymentIntent | null> {
    const existing = this.intents.get(id);
    if (!existing) return null;
    const updated: PaymentIntent = {
      ...existing,
      status: data.status ?? existing.status,
      referenceId: data.referenceId !== undefined ? data.referenceId : existing.referenceId,
      proofReference: data.proofReference !== undefined ? data.proofReference : existing.proofReference,
      verifiedAt: data.verifiedAt !== undefined ? data.verifiedAt : existing.verifiedAt,
    };
    this.intents.set(id, updated);
    return updated;
  }

  async findPending(): Promise<PaymentIntent[]> {
    return Array.from(this.intents.values())
      .filter((i) => i.status === PaymentIntentStatus.SUBMITTED && i.method === 'UPI')
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
}
