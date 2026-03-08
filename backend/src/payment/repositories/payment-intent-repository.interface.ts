import { PaymentIntent } from '../domain/payment-intent.entity';
import { CreatePaymentIntentData, UpdatePaymentIntentData } from '../domain/payment-intent.entity';
import { PaymentIntentStatus } from '../domain/payment-intent-status';

/**
 * Payment intent repository interface (Phase 6)
 */
export interface IPaymentIntentRepository {
  create(data: CreatePaymentIntentData): Promise<PaymentIntent>;

  findById(id: string): Promise<PaymentIntent | null>;

  findByOrderId(orderId: string): Promise<PaymentIntent | null>;

  update(id: string, data: UpdatePaymentIntentData): Promise<PaymentIntent | null>;

  findPending(): Promise<PaymentIntent[]>;
}

export const PAYMENT_INTENT_REPOSITORY = 'PAYMENT_INTENT_REPOSITORY';
