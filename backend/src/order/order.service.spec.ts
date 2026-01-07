import { OrderService } from './order.service';
import { InMemoryOrderRepository } from './repositories/in-memory-order.repository';
import { OrderStatus } from './domain';
import {
  OrderNotFoundException,
  UnauthorizedOrderAccessException,
  OrderTerminalStateException,
  OrderCannotBeCancelledException,
} from './exceptions/order.exceptions';

/**
 * OrderService Tests - Cancel Order
 *
 * Tests for order cancellation including:
 * - Successful cancellation from allowed states
 * - Failure for invalid states
 * - Ownership enforcement
 * - Idempotency / double-cancel attempts
 * - Domain event emission
 *
 * Design decisions:
 * - Uses real in-memory repository (no mocks)
 * - Deterministic test data
 * - Focus on business behavior
 */
describe('OrderService - cancelOrder', () => {
  let orderService: OrderService;
  let orderRepository: InMemoryOrderRepository;

  const correlationId = 'test-correlation-id';
  const userId = 'user-123';
  const otherUserId = 'user-456';

  beforeEach(() => {
    orderRepository = new InMemoryOrderRepository();
    orderService = new OrderService(orderRepository);
  });

  afterEach(() => {
    orderRepository.clear();
  });

  // ============================================================
  // Successful Cancellation Tests
  // ============================================================

  describe('successful cancellation', () => {
    it('should cancel order in DRAFT state', async () => {
      const order = await orderRepository.createOrder(userId, OrderStatus.DRAFT);

      const result = await orderService.cancelOrder(order.id, userId, correlationId);

      expect(result.order.status).toBe(OrderStatus.CANCELLED);
      expect(result.previousState).toBe(OrderStatus.DRAFT);
    });

    it('should cancel order in CREATED state', async () => {
      const order = await orderRepository.createOrder(userId, OrderStatus.CREATED);

      const result = await orderService.cancelOrder(order.id, userId, correlationId);

      expect(result.order.status).toBe(OrderStatus.CANCELLED);
      expect(result.previousState).toBe(OrderStatus.CREATED);
    });

    it('should cancel order in CONFIRMED state', async () => {
      const order = await orderRepository.createOrder(userId, OrderStatus.CONFIRMED);

      const result = await orderService.cancelOrder(order.id, userId, correlationId);

      expect(result.order.status).toBe(OrderStatus.CANCELLED);
      expect(result.previousState).toBe(OrderStatus.CONFIRMED);
    });

    it('should cancel order in PAID state', async () => {
      const order = await orderRepository.createOrder(userId, OrderStatus.PAID);

      const result = await orderService.cancelOrder(order.id, userId, correlationId);

      expect(result.order.status).toBe(OrderStatus.CANCELLED);
      expect(result.previousState).toBe(OrderStatus.PAID);
    });

    it('should cancel order in SHIPPED state', async () => {
      const order = await orderRepository.createOrder(userId, OrderStatus.SHIPPED);

      const result = await orderService.cancelOrder(order.id, userId, correlationId);

      expect(result.order.status).toBe(OrderStatus.CANCELLED);
      expect(result.previousState).toBe(OrderStatus.SHIPPED);
    });

    it('should persist cancelled state in repository', async () => {
      const order = await orderRepository.createOrder(userId, OrderStatus.CONFIRMED);

      await orderService.cancelOrder(order.id, userId, correlationId);

      const persistedOrder = await orderRepository.findById(order.id);
      expect(persistedOrder).not.toBeNull();
      expect(persistedOrder!.status).toBe(OrderStatus.CANCELLED);
    });
  });

  // ============================================================
  // Domain Event Tests
  // ============================================================

  describe('domain events', () => {
    it('should emit OrderCancelled event', async () => {
      const order = await orderRepository.createOrder(userId, OrderStatus.CONFIRMED);

      const result = await orderService.cancelOrder(order.id, userId, correlationId);

      expect(result.events).toHaveLength(1);
      expect(result.events[0].type).toBe('ORDER_CANCELLED');
    });

    it('should include correct data in OrderCancelled event', async () => {
      const order = await orderRepository.createOrder(userId, OrderStatus.CONFIRMED);

      const result = await orderService.cancelOrder(order.id, userId, correlationId);

      const event = result.events[0];
      expect(event.orderId).toBe(order.id);
      expect(event.userId).toBe(userId);
      expect(event.previousState).toBe(OrderStatus.CONFIRMED);
      expect(event.total).toBeDefined();
      expect(event.itemCount).toBeDefined();
    });

    it('should include correlation ID in event', async () => {
      const order = await orderRepository.createOrder(userId, OrderStatus.CONFIRMED);

      const result = await orderService.cancelOrder(order.id, userId, correlationId);

      expect(result.events[0].correlationId).toBe(correlationId);
    });

    it('should set occurredAt timestamp', async () => {
      const beforeTime = new Date();
      const order = await orderRepository.createOrder(userId, OrderStatus.CONFIRMED);

      const result = await orderService.cancelOrder(order.id, userId, correlationId);
      const afterTime = new Date();

      const event = result.events[0];
      expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(event.occurredAt.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });
  });

  // ============================================================
  // Failure for Invalid States Tests
  // ============================================================

  describe('failure for invalid states', () => {
    it('should throw OrderTerminalStateException for CANCELLED order', async () => {
      const order = await orderRepository.createOrder(userId, OrderStatus.CANCELLED);

      await expect(
        orderService.cancelOrder(order.id, userId, correlationId),
      ).rejects.toThrow(OrderTerminalStateException);
    });

    it('should throw OrderTerminalStateException for DELIVERED order', async () => {
      const order = await orderRepository.createOrder(userId, OrderStatus.DELIVERED);

      await expect(
        orderService.cancelOrder(order.id, userId, correlationId),
      ).rejects.toThrow(OrderTerminalStateException);
    });

    it('should include current status in terminal state exception', async () => {
      const order = await orderRepository.createOrder(userId, OrderStatus.CANCELLED);

      try {
        await orderService.cancelOrder(order.id, userId, correlationId);
        fail('Expected OrderTerminalStateException');
      } catch (error) {
        expect(error).toBeInstanceOf(OrderTerminalStateException);
        expect((error as OrderTerminalStateException).currentStatus).toBe(
          OrderStatus.CANCELLED,
        );
      }
    });
  });

  // ============================================================
  // Ownership Enforcement Tests
  // ============================================================

  describe('ownership enforcement', () => {
    it('should throw UnauthorizedOrderAccessException when user does not own order', async () => {
      const order = await orderRepository.createOrder(otherUserId, OrderStatus.CONFIRMED);

      await expect(
        orderService.cancelOrder(order.id, userId, correlationId),
      ).rejects.toThrow(UnauthorizedOrderAccessException);
    });

    it('should not expose order details in unauthorized exception', async () => {
      const order = await orderRepository.createOrder(otherUserId, OrderStatus.CONFIRMED);

      try {
        await orderService.cancelOrder(order.id, userId, correlationId);
        fail('Expected UnauthorizedOrderAccessException');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedOrderAccessException);
        expect((error as Error).message).not.toContain(order.id);
        expect((error as Error).message).not.toContain(otherUserId);
      }
    });

    it('should allow owner to cancel their own order', async () => {
      const order = await orderRepository.createOrder(userId, OrderStatus.CONFIRMED);

      const result = await orderService.cancelOrder(order.id, userId, correlationId);

      expect(result.order.status).toBe(OrderStatus.CANCELLED);
    });
  });

  // ============================================================
  // Idempotency / Double-Cancel Tests
  // ============================================================

  describe('idempotency and double-cancel attempts', () => {
    it('should fail on second cancel attempt (not idempotent)', async () => {
      const order = await orderRepository.createOrder(userId, OrderStatus.CONFIRMED);

      // First cancel succeeds
      await orderService.cancelOrder(order.id, userId, correlationId);

      // Second cancel fails (order is now in terminal CANCELLED state)
      await expect(
        orderService.cancelOrder(order.id, userId, correlationId),
      ).rejects.toThrow(OrderTerminalStateException);
    });

    it('should preserve cancelled state after failed second attempt', async () => {
      const order = await orderRepository.createOrder(userId, OrderStatus.CONFIRMED);

      await orderService.cancelOrder(order.id, userId, correlationId);

      try {
        await orderService.cancelOrder(order.id, userId, correlationId);
      } catch {
        // Expected to fail
      }

      const persistedOrder = await orderRepository.findById(order.id);
      expect(persistedOrder!.status).toBe(OrderStatus.CANCELLED);
    });
  });

  // ============================================================
  // Order Not Found Tests
  // ============================================================

  describe('order not found', () => {
    it('should throw OrderNotFoundException for non-existent order', async () => {
      await expect(
        orderService.cancelOrder('non-existent-id', userId, correlationId),
      ).rejects.toThrow(OrderNotFoundException);
    });
  });

  // ============================================================
  // Cancelled Order Immutability Tests
  // ============================================================

  describe('cancelled order immutability', () => {
    it('should prevent confirmation of cancelled order', async () => {
      const order = await orderRepository.createOrder(userId, OrderStatus.CONFIRMED);
      await orderService.cancelOrder(order.id, userId, correlationId);

      // Attempting to re-confirm should fail
      await expect(
        orderService.confirmOrder(order.id, userId, correlationId),
      ).rejects.toThrow(); // OrderAlreadyConfirmedException or similar
    });

    it('should prevent payment on cancelled order', async () => {
      const order = await orderRepository.createOrder(userId, OrderStatus.CONFIRMED);
      await orderService.cancelOrder(order.id, userId, correlationId);

      // Attempting to pay should fail
      await expect(
        orderService.payForOrder(order.id, userId, correlationId),
      ).rejects.toThrow(); // OrderNotConfirmedException or similar
    });
  });

  // ============================================================
  // Result Structure Tests
  // ============================================================

  describe('result structure', () => {
    it('should return complete result with order, previousState, and events', async () => {
      const order = await orderRepository.createOrder(userId, OrderStatus.CONFIRMED);

      const result = await orderService.cancelOrder(order.id, userId, correlationId);

      expect(result).toHaveProperty('order');
      expect(result).toHaveProperty('previousState');
      expect(result).toHaveProperty('events');
    });

    it('should return order with all expected fields', async () => {
      const order = await orderRepository.createOrder(userId, OrderStatus.CONFIRMED);

      const result = await orderService.cancelOrder(order.id, userId, correlationId);

      expect(result.order.id).toBe(order.id);
      expect(result.order.userId).toBe(userId);
      expect(result.order.status).toBe(OrderStatus.CANCELLED);
      expect(result.order.items).toBeDefined();
      expect(result.order.total).toBeDefined();
      expect(result.order.createdAt).toBeDefined();
      expect(result.order.updatedAt).toBeDefined();
    });
  });

  // ============================================================
  // State Machine Compliance Tests
  // ============================================================

  describe('state machine compliance', () => {
    it('should use state machine for all cancellation decisions', async () => {
      // Test that cancellation respects the state machine's canCancel function
      const cancellableStates = [
        OrderStatus.DRAFT,
        OrderStatus.CREATED,
        OrderStatus.CONFIRMED,
        OrderStatus.PAID,
        OrderStatus.SHIPPED,
      ];

      for (const status of cancellableStates) {
        const order = await orderRepository.createOrder(userId, status);
        const result = await orderService.cancelOrder(order.id, userId, correlationId);
        expect(result.order.status).toBe(OrderStatus.CANCELLED);
      }
    });

    it('should reject cancellation for all terminal states', async () => {
      const terminalStates = [OrderStatus.DELIVERED, OrderStatus.CANCELLED];

      for (const status of terminalStates) {
        const order = await orderRepository.createOrder(userId, status);
        await expect(
          orderService.cancelOrder(order.id, userId, correlationId),
        ).rejects.toThrow(OrderTerminalStateException);
      }
    });
  });
});

