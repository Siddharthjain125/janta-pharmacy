import { PaymentMethod } from './payment-method';
import { PaymentIntentStatus } from './payment-intent-status';

/**
 * Payment intent aggregate (Phase 6 — manual payment v1)
 * One active PaymentIntent per order.
 */
export interface PaymentIntent {
  readonly id: string;
  readonly orderId: string;
  readonly method: PaymentMethod;
  readonly status: PaymentIntentStatus;
  readonly referenceId: string | null;
  readonly proofReference: string | null;
  readonly createdAt: Date;
  readonly verifiedAt: Date | null;
}

export interface CreatePaymentIntentData {
  orderId: string;
  method: PaymentMethod;
  status: PaymentIntentStatus;
  referenceId?: string | null;
  proofReference?: string | null;
}

export interface UpdatePaymentIntentData {
  status?: PaymentIntentStatus;
  referenceId?: string | null;
  proofReference?: string | null;
  verifiedAt?: Date | null;
}
