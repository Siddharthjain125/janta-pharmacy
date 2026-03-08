import { Inject, Injectable } from '@nestjs/common';
import { ORDER_REPOSITORY } from '../order/repositories/order-repository.interface';
import type { IOrderRepository } from '../order/repositories/order-repository.interface';
import { OrderStatus } from '../order/domain/order-status';
import {
  OrderNotFoundException,
  UnauthorizedOrderAccessException,
  OrderNotConfirmedException,
} from '../order/exceptions/order.exceptions';
import { PaymentMethod } from './domain/payment-method';
import { PaymentIntentStatus } from './domain/payment-intent-status';
import type { PaymentIntent } from './domain/payment-intent.entity';
import { PAYMENT_INTENT_REPOSITORY } from './repositories/payment-intent-repository.interface';
import type { IPaymentIntentRepository } from './repositories/payment-intent-repository.interface';
import {
  PaymentIntentAlreadyExistsException,
  PaymentIntentNotFoundException,
  PaymentIntentInvalidStateException,
} from './exceptions/payment-intent.exceptions';
import type { CreatePaymentUpiResponseDto, UpiInstructionsDto } from './dto/payment-response.dto';
import type { UpiProofDto } from './dto/upi-proof.dto';
import { logWithCorrelation } from '../common/logging/logger';

/** Phase 6 — UPI instructions (configurable; no gateway) */
const UPI_VPA = process.env.UPI_VPA || '9009090467@ptyes';
const UPI_STEPS = [
  'Open your UPI app (GPay, PhonePe, Paytm, etc.)',
  `Send payment to VPA: ${UPI_VPA}`,
  'Enter the order total amount',
  'Complete the payment and note the transaction reference number',
  'Upload the payment screenshot and reference number on this page',
];

/**
 * Payment Intent Service (Phase 6 — manual payment v1)
 *
 * One active PaymentIntent per order.
 * COD: created as VERIFIED. UPI: PENDING → SUBMITTED → VERIFIED (admin).
 */
@Injectable()
export class PaymentIntentService {
  constructor(
    @Inject(PAYMENT_INTENT_REPOSITORY)
    private readonly paymentIntentRepository: IPaymentIntentRepository,
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  /**
   * Create payment intent for an order (user).
   * COD: create VERIFIED (pay at delivery, order remains CONFIRMED).
   * UPI: create PENDING, return UPI instructions.
   */
  async createForOrder(
    orderId: string,
    method: PaymentMethod,
    userId: string,
    correlationId: string,
  ): Promise<{ paymentIntent: PaymentIntent; upiInstructions?: UpiInstructionsDto }> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      logWithCorrelation('WARN', correlationId, 'Order not found for payment', 'PaymentIntentService', {
        orderId,
        userId,
      });
      throw new OrderNotFoundException(orderId);
    }
    if (order.userId !== userId) {
      throw new UnauthorizedOrderAccessException();
    }
    if (order.status !== OrderStatus.CONFIRMED) {
      throw new OrderNotConfirmedException(orderId, order.status);
    }

    const existing = await this.paymentIntentRepository.findByOrderId(orderId);
    if (existing) {
      throw new PaymentIntentAlreadyExistsException(orderId);
    }

    if (method === PaymentMethod.COD) {
      const intent = await this.paymentIntentRepository.create({
        orderId,
        method: PaymentMethod.COD,
        status: PaymentIntentStatus.VERIFIED,
        referenceId: null,
        proofReference: null,
      });
      logWithCorrelation('INFO', correlationId, 'Payment intent created (COD, VERIFIED)', 'PaymentIntentService', {
        orderId,
        paymentIntentId: intent.id,
      });
      return { paymentIntent: intent };
    }

    if (method === PaymentMethod.UPI) {
      const intent = await this.paymentIntentRepository.create({
        orderId,
        method: PaymentMethod.UPI,
        status: PaymentIntentStatus.PENDING,
        referenceId: null,
        proofReference: null,
      });
      logWithCorrelation('INFO', correlationId, 'Payment intent created (UPI, PENDING)', 'PaymentIntentService', {
        orderId,
        paymentIntentId: intent.id,
      });
      const upiInstructions: UpiInstructionsDto = {
        vpa: UPI_VPA,
        steps: UPI_STEPS,
      };
      return { paymentIntent: intent, upiInstructions };
    }

    throw new PaymentIntentInvalidStateException(
      orderId,
      `Unsupported payment method: ${method}. Use COD or UPI.`,
    );
  }

  /**
   * Submit UPI proof (referenceId, proofReference). Transitions PENDING → SUBMITTED.
   */
  async submitUpiProof(
    orderId: string,
    dto: UpiProofDto,
    userId: string,
    correlationId: string,
  ): Promise<PaymentIntent> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new OrderNotFoundException(orderId);
    if (order.userId !== userId) throw new UnauthorizedOrderAccessException();

    const intent = await this.paymentIntentRepository.findByOrderId(orderId);
    if (!intent) throw new PaymentIntentNotFoundException(orderId);
    if (intent.method !== PaymentMethod.UPI) {
      throw new PaymentIntentInvalidStateException(intent.id, 'Only UPI payment can submit proof.');
    }
    if (intent.status !== PaymentIntentStatus.PENDING) {
      throw new PaymentIntentInvalidStateException(
        intent.id,
        `Proof can only be submitted when status is PENDING. Current: ${intent.status}`,
      );
    }

    const updated = await this.paymentIntentRepository.update(intent.id, {
      status: PaymentIntentStatus.SUBMITTED,
      referenceId: dto.referenceId,
      proofReference: dto.proofReference ?? null,
    });
    if (!updated) throw new PaymentIntentNotFoundException(intent.id);
    logWithCorrelation('INFO', correlationId, 'UPI proof submitted', 'PaymentIntentService', {
      orderId,
      paymentIntentId: intent.id,
    });
    return updated;
  }

  /**
   * Get payment intent by order ID (for order detail).
   */
  async getByOrderId(orderId: string): Promise<PaymentIntent | null> {
    return this.paymentIntentRepository.findByOrderId(orderId);
  }

  /**
   * List payment intents pending admin verification (SUBMITTED).
   */
  async listPending(): Promise<PaymentIntent[]> {
    return this.paymentIntentRepository.findPending();
  }

  /**
   * Admin: verify payment intent (SUBMITTED → VERIFIED).
   * Payment verification is tracked in PaymentIntent; order state remains CONFIRMED.
   */
  async verify(id: string, correlationId: string): Promise<PaymentIntent> {
    const intent = await this.paymentIntentRepository.findById(id);
    if (!intent) throw new PaymentIntentNotFoundException(id);
    if (intent.status !== PaymentIntentStatus.SUBMITTED) {
      throw new PaymentIntentInvalidStateException(
        id,
        `Only SUBMITTED payments can be verified. Current: ${intent.status}`,
      );
    }
    const updated = await this.paymentIntentRepository.update(id, {
      status: PaymentIntentStatus.VERIFIED,
      verifiedAt: new Date(),
    });
    if (!updated) throw new PaymentIntentNotFoundException(id);
    logWithCorrelation('INFO', correlationId, 'Payment intent verified', 'PaymentIntentService', {
      paymentIntentId: id,
      orderId: intent.orderId,
    });
    return updated;
  }

  /**
   * Admin: reject payment intent.
   */
  async reject(id: string, correlationId: string): Promise<PaymentIntent> {
    const intent = await this.paymentIntentRepository.findById(id);
    if (!intent) throw new PaymentIntentNotFoundException(id);
    if (intent.status !== PaymentIntentStatus.SUBMITTED) {
      throw new PaymentIntentInvalidStateException(
        id,
        `Only SUBMITTED payments can be rejected. Current: ${intent.status}`,
      );
    }
    const updated = await this.paymentIntentRepository.update(id, { status: PaymentIntentStatus.REJECTED });
    if (!updated) throw new PaymentIntentNotFoundException(id);
    logWithCorrelation('INFO', correlationId, 'Payment intent rejected', 'PaymentIntentService', {
      paymentIntentId: id,
      orderId: intent.orderId,
    });
    return updated;
  }
}
