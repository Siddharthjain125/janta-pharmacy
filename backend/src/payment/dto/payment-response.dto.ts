import type { PaymentIntent } from '../domain/payment-intent.entity';
import { PaymentMethod } from '../domain/payment-method';
import { PaymentIntentStatus } from '../domain/payment-intent-status';

/**
 * Payment intent summary for API responses
 */
export interface PaymentIntentResponseDto {
  id: string;
  orderId: string;
  method: PaymentMethod;
  status: PaymentIntentStatus;
  referenceId?: string | null;
  proofReference?: string | null;
  createdAt: string;
  verifiedAt?: string | null;
}

export function toPaymentIntentResponseDto(intent: PaymentIntent): PaymentIntentResponseDto {
  return {
    id: intent.id,
    orderId: intent.orderId,
    method: intent.method,
    status: intent.status,
    referenceId: intent.referenceId,
    proofReference: intent.proofReference,
    createdAt: intent.createdAt.toISOString(),
    verifiedAt: intent.verifiedAt?.toISOString() ?? null,
  };
}

/**
 * UPI instructions returned when method is UPI (Phase 6)
 */
export interface UpiInstructionsDto {
  vpa: string;
  steps: string[];
}

/**
 * Response for POST /orders/:orderId/payment when method is UPI
 */
export interface CreatePaymentUpiResponseDto {
  paymentIntent: PaymentIntentResponseDto;
  upiInstructions: UpiInstructionsDto;
}
