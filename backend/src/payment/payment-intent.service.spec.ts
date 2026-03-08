import { PaymentIntentService } from './payment-intent.service';
import { InMemoryPaymentIntentRepository } from './repositories/in-memory-payment-intent.repository';
import { InMemoryOrderRepository } from '../order/repositories/in-memory-order.repository';
import { OrderStatus } from '../order/domain/order-status';
import { createOrderItem } from '../order/domain/order-item';
import { Money } from '../catalog/domain/money';
import { PaymentMethod } from './domain/payment-method';
import { PaymentIntentStatus } from './domain/payment-intent-status';
import {
  PaymentIntentAlreadyExistsException,
  PaymentIntentNotFoundException,
  PaymentIntentInvalidStateException,
} from './exceptions/payment-intent.exceptions';
import { OrderNotFoundException } from '../order/exceptions/order.exceptions';

/**
 * Payment Intent Service Tests (Phase 6 — manual payment v1)
 *
 * COD: create VERIFIED. UPI: PENDING → SUBMITTED → VERIFIED (admin).
 * One active PaymentIntent per order.
 */
describe('PaymentIntentService', () => {
  let service: PaymentIntentService;
  let paymentIntentRepository: InMemoryPaymentIntentRepository;
  let orderRepository: InMemoryOrderRepository;

  const userId = 'user-1';
  const correlationId = 'test-correlation-id';

  beforeEach(() => {
    paymentIntentRepository = new InMemoryPaymentIntentRepository();
    orderRepository = new InMemoryOrderRepository();
    service = new PaymentIntentService(paymentIntentRepository, orderRepository);
  });

  async function createConfirmedOrder(forUserId: string): Promise<string> {
    const order = await orderRepository.createOrder(forUserId, OrderStatus.DRAFT);
    const item = createOrderItem({
      productId: 'prod-1',
      productName: 'Product 1',
      unitPrice: Money.fromMajorUnits(100, 'INR'),
      quantity: 1,
    });
    await orderRepository.addItem(order.id, item);
    await orderRepository.updateStatus(order.id, OrderStatus.CONFIRMED);
    const updated = await orderRepository.findById(order.id);
    return updated!.id;
  }

  describe('createForOrder', () => {
    it('creates COD payment intent with status VERIFIED', async () => {
      const orderId = await createConfirmedOrder(userId);
      const result = await service.createForOrder(orderId, PaymentMethod.COD, userId, correlationId);
      expect(result.paymentIntent).toBeDefined();
      expect(result.paymentIntent.method).toBe(PaymentMethod.COD);
      expect(result.paymentIntent.status).toBe(PaymentIntentStatus.VERIFIED);
      expect(result.paymentIntent.orderId).toBe(orderId);
      expect(result.upiInstructions).toBeUndefined();
    });

    it('creates UPI payment intent with status PENDING and returns UPI instructions', async () => {
      const orderId = await createConfirmedOrder(userId);
      const result = await service.createForOrder(orderId, PaymentMethod.UPI, userId, correlationId);
      expect(result.paymentIntent).toBeDefined();
      expect(result.paymentIntent.method).toBe(PaymentMethod.UPI);
      expect(result.paymentIntent.status).toBe(PaymentIntentStatus.PENDING);
      expect(result.paymentIntent.orderId).toBe(orderId);
      expect(result.upiInstructions).toBeDefined();
      expect(result.upiInstructions!.vpa).toBeDefined();
      expect(Array.isArray(result.upiInstructions!.steps)).toBe(true);
    });

    it('throws when order not found', async () => {
      await expect(
        service.createForOrder('non-existent', PaymentMethod.COD, userId, correlationId),
      ).rejects.toThrow(OrderNotFoundException);
    });

    it('throws when order not CONFIRMED', async () => {
      const order = await orderRepository.createOrder(userId, OrderStatus.DRAFT);
      await orderRepository.updateStatus(order.id, OrderStatus.CREATED);
      await expect(
        service.createForOrder(order.id, PaymentMethod.COD, userId, correlationId),
      ).rejects.toThrow();
    });

    it('throws when order already has payment intent', async () => {
      const orderId = await createConfirmedOrder(userId);
      await service.createForOrder(orderId, PaymentMethod.COD, userId, correlationId);
      await expect(
        service.createForOrder(orderId, PaymentMethod.UPI, userId, correlationId),
      ).rejects.toThrow(PaymentIntentAlreadyExistsException);
    });

    it('throws when user does not own order', async () => {
      const orderId = await createConfirmedOrder('other-user');
      await expect(
        service.createForOrder(orderId, PaymentMethod.COD, userId, correlationId),
      ).rejects.toThrow();
    });
  });

  describe('submitUpiProof', () => {
    it('updates UPI intent from PENDING to SUBMITTED with referenceId and proofReference', async () => {
      const orderId = await createConfirmedOrder(userId);
      await service.createForOrder(orderId, PaymentMethod.UPI, userId, correlationId);
      const updated = await service.submitUpiProof(
        orderId,
        { referenceId: 'ref-123', proofReference: 'proof-url' },
        userId,
        correlationId,
      );
      expect(updated.status).toBe(PaymentIntentStatus.SUBMITTED);
      expect(updated.referenceId).toBe('ref-123');
      expect(updated.proofReference).toBe('proof-url');
    });

    it('throws when no payment intent for order', async () => {
      const orderId = await createConfirmedOrder(userId);
      await expect(
        service.submitUpiProof(orderId, { referenceId: 'ref-123' }, userId, correlationId),
      ).rejects.toThrow(PaymentIntentNotFoundException);
    });

    it('throws when intent is not UPI', async () => {
      const orderId = await createConfirmedOrder(userId);
      await service.createForOrder(orderId, PaymentMethod.COD, userId, correlationId);
      await expect(
        service.submitUpiProof(orderId, { referenceId: 'ref-123' }, userId, correlationId),
      ).rejects.toThrow(PaymentIntentInvalidStateException);
    });

    it('throws when intent is not PENDING', async () => {
      const orderId = await createConfirmedOrder(userId);
      await service.createForOrder(orderId, PaymentMethod.UPI, userId, correlationId);
      await service.submitUpiProof(orderId, { referenceId: 'ref-123' }, userId, correlationId);
      await expect(
        service.submitUpiProof(orderId, { referenceId: 'ref-456' }, userId, correlationId),
      ).rejects.toThrow(PaymentIntentInvalidStateException);
    });
  });

  describe('listPending', () => {
    it('returns only SUBMITTED intents', async () => {
      const orderId1 = await createConfirmedOrder(userId);
      await service.createForOrder(orderId1, PaymentMethod.UPI, userId, correlationId);
      await service.submitUpiProof(orderId1, { referenceId: 'r1' }, userId, correlationId);
      const orderId2 = await createConfirmedOrder(userId);
      await service.createForOrder(orderId2, PaymentMethod.UPI, userId, correlationId);
      const pending = await service.listPending();
      expect(pending).toHaveLength(1);
      expect(pending[0].status).toBe(PaymentIntentStatus.SUBMITTED);
    });
  });

  describe('verify (admin)', () => {
    it('updates SUBMITTED intent to VERIFIED', async () => {
      const orderId = await createConfirmedOrder(userId);
      await service.createForOrder(orderId, PaymentMethod.UPI, userId, correlationId);
      await service.submitUpiProof(orderId, { referenceId: 'r1' }, userId, correlationId);
      const intent = await paymentIntentRepository.findByOrderId(orderId);
      const updated = await service.verify(intent!.id, correlationId);
      expect(updated.status).toBe(PaymentIntentStatus.VERIFIED);
      expect(updated.verifiedAt).toBeDefined();
    });

    it('throws when intent not found', async () => {
      await expect(service.verify('non-existent', correlationId)).rejects.toThrow(
        PaymentIntentNotFoundException,
      );
    });

    it('throws when intent is not SUBMITTED', async () => {
      const orderId = await createConfirmedOrder(userId);
      const result = await service.createForOrder(orderId, PaymentMethod.UPI, userId, correlationId);
      await expect(service.verify(result.paymentIntent.id, correlationId)).rejects.toThrow(
        PaymentIntentInvalidStateException,
      );
    });
  });

  describe('reject (admin)', () => {
    it('updates SUBMITTED intent to REJECTED', async () => {
      const orderId = await createConfirmedOrder(userId);
      await service.createForOrder(orderId, PaymentMethod.UPI, userId, correlationId);
      await service.submitUpiProof(orderId, { referenceId: 'r1' }, userId, correlationId);
      const intent = await paymentIntentRepository.findByOrderId(orderId);
      const updated = await service.reject(intent!.id, correlationId);
      expect(updated.status).toBe(PaymentIntentStatus.REJECTED);
    });

    it('throws when intent is not SUBMITTED', async () => {
      const orderId = await createConfirmedOrder(userId);
      const result = await service.createForOrder(orderId, PaymentMethod.UPI, userId, correlationId);
      await expect(service.reject(result.paymentIntent.id, correlationId)).rejects.toThrow(
        PaymentIntentInvalidStateException,
      );
    });
  });

  describe('getByOrderId', () => {
    it('returns payment intent when exists', async () => {
      const orderId = await createConfirmedOrder(userId);
      await service.createForOrder(orderId, PaymentMethod.COD, userId, correlationId);
      const intent = await service.getByOrderId(orderId);
      expect(intent).toBeDefined();
      expect(intent!.orderId).toBe(orderId);
    });

    it('returns null when no intent', async () => {
      const orderId = await createConfirmedOrder(userId);
      const intent = await service.getByOrderId(orderId);
      expect(intent).toBeNull();
    });
  });
});
