import { OrderQueryService } from './order-query.service';
import { InMemoryOrderRepository } from './repositories/in-memory-order.repository';
import { OrderStatus } from './domain';
import {
  OrderNotFoundException,
  UnauthorizedOrderAccessException,
} from './exceptions/order.exceptions';

/**
 * OrderQueryService Tests
 *
 * Tests for order history and detail queries including:
 * - Paginated order history
 * - Order detail fetching
 * - Ownership enforcement
 * - Not-found scenarios
 *
 * Design decisions:
 * - Uses real in-memory repository (no mocks)
 * - Deterministic test data
 * - Focus on query behavior
 */
describe('OrderQueryService', () => {
  let queryService: OrderQueryService;
  let orderRepository: InMemoryOrderRepository;

  const correlationId = 'test-correlation-id';
  const userId = 'user-123';
  const otherUserId = 'user-456';

  beforeEach(() => {
    orderRepository = new InMemoryOrderRepository();
    queryService = new OrderQueryService(orderRepository);
  });

  afterEach(() => {
    orderRepository.clear();
  });

  // ============================================================
  // Test Data Setup Helpers
  // ============================================================

  /**
   * Create orders for testing
   * Returns order IDs for reference
   */
  async function createTestOrders(
    forUserId: string,
    count: number,
    status: OrderStatus = OrderStatus.CONFIRMED,
  ): Promise<string[]> {
    const orderIds: string[] = [];
    for (let i = 0; i < count; i++) {
      const order = await orderRepository.createOrder(forUserId, status);
      orderIds.push(order.id);
      // Add small delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 5));
    }
    return orderIds;
  }

  // ============================================================
  // getOrderHistory Tests
  // ============================================================

  describe('getOrderHistory', () => {
    describe('basic functionality', () => {
      it('should return empty history when user has no orders', async () => {
        const result = await queryService.getOrderHistory(userId, undefined, correlationId);

        expect(result.orders).toEqual([]);
        expect(result.pagination.total).toBe(0);
        expect(result.pagination.page).toBe(1);
      });

      it('should return orders for user', async () => {
        await createTestOrders(userId, 3);

        const result = await queryService.getOrderHistory(userId, undefined, correlationId);

        expect(result.orders).toHaveLength(3);
        expect(result.pagination.total).toBe(3);
      });

      it('should not include DRAFT orders in history', async () => {
        // Create a draft (cart) and a confirmed order
        await orderRepository.createOrder(userId, OrderStatus.DRAFT);
        await orderRepository.createOrder(userId, OrderStatus.CONFIRMED);
        await orderRepository.createOrder(userId, OrderStatus.CONFIRMED);

        const result = await queryService.getOrderHistory(userId, undefined, correlationId);

        // Only confirmed orders should appear
        expect(result.orders).toHaveLength(2);
        expect(result.orders.every((o) => o.state !== OrderStatus.DRAFT)).toBe(true);
      });

      it('should order by most recent first', async () => {
        const orderIds = await createTestOrders(userId, 3);

        const result = await queryService.getOrderHistory(userId, undefined, correlationId);

        // Most recently created should be first
        expect(result.orders[0].orderId).toBe(orderIds[2]);
        expect(result.orders[1].orderId).toBe(orderIds[1]);
        expect(result.orders[2].orderId).toBe(orderIds[0]);
      });

      it('should only return orders for the specified user', async () => {
        await createTestOrders(userId, 2);
        await createTestOrders(otherUserId, 3);

        const result = await queryService.getOrderHistory(userId, undefined, correlationId);

        expect(result.orders).toHaveLength(2);
      });
    });

    describe('pagination', () => {
      it('should use default pagination when not specified', async () => {
        await createTestOrders(userId, 5);

        const result = await queryService.getOrderHistory(userId, undefined, correlationId);

        expect(result.pagination.page).toBe(1);
        expect(result.pagination.limit).toBe(10); // default
      });

      it('should respect page parameter', async () => {
        await createTestOrders(userId, 15);

        const page1 = await queryService.getOrderHistory(
          userId,
          { page: 1, limit: 5 },
          correlationId,
        );
        const page2 = await queryService.getOrderHistory(
          userId,
          { page: 2, limit: 5 },
          correlationId,
        );

        expect(page1.orders).toHaveLength(5);
        expect(page2.orders).toHaveLength(5);
        expect(page1.orders[0].orderId).not.toBe(page2.orders[0].orderId);
      });

      it('should respect limit parameter', async () => {
        await createTestOrders(userId, 10);

        const result = await queryService.getOrderHistory(
          userId,
          { page: 1, limit: 3 },
          correlationId,
        );

        expect(result.orders).toHaveLength(3);
        expect(result.pagination.limit).toBe(3);
        expect(result.pagination.total).toBe(10);
      });

      it('should return correct pagination metadata', async () => {
        await createTestOrders(userId, 25);

        const result = await queryService.getOrderHistory(
          userId,
          { page: 2, limit: 10 },
          correlationId,
        );

        expect(result.pagination.page).toBe(2);
        expect(result.pagination.limit).toBe(10);
        expect(result.pagination.total).toBe(25);
        expect(result.pagination.totalPages).toBe(3);
        expect(result.pagination.hasNextPage).toBe(true);
        expect(result.pagination.hasPreviousPage).toBe(true);
      });

      it('should handle last page correctly', async () => {
        await createTestOrders(userId, 23);

        const result = await queryService.getOrderHistory(
          userId,
          { page: 3, limit: 10 },
          correlationId,
        );

        expect(result.orders).toHaveLength(3); // 23 - 20 = 3 remaining
        expect(result.pagination.hasNextPage).toBe(false);
        expect(result.pagination.hasPreviousPage).toBe(true);
      });

      it('should handle first page correctly', async () => {
        await createTestOrders(userId, 15);

        const result = await queryService.getOrderHistory(
          userId,
          { page: 1, limit: 10 },
          correlationId,
        );

        expect(result.pagination.hasNextPage).toBe(true);
        expect(result.pagination.hasPreviousPage).toBe(false);
      });

      it('should return empty array for page beyond data', async () => {
        await createTestOrders(userId, 5);

        const result = await queryService.getOrderHistory(
          userId,
          { page: 10, limit: 10 },
          correlationId,
        );

        expect(result.orders).toHaveLength(0);
        expect(result.pagination.total).toBe(5);
      });

      it('should cap limit at maximum', async () => {
        await createTestOrders(userId, 5);

        const result = await queryService.getOrderHistory(
          userId,
          { page: 1, limit: 1000 }, // Beyond max
          correlationId,
        );

        expect(result.pagination.limit).toBe(100); // MAX_LIMIT
      });

      it('should normalize invalid page to 1', async () => {
        await createTestOrders(userId, 5);

        const result = await queryService.getOrderHistory(
          userId,
          { page: -5, limit: 10 },
          correlationId,
        );

        expect(result.pagination.page).toBe(1);
      });
    });

    describe('order summary content', () => {
      it('should return correct summary fields', async () => {
        const order = await orderRepository.createOrder(userId, OrderStatus.CONFIRMED);

        const result = await queryService.getOrderHistory(userId, undefined, correlationId);

        expect(result.orders).toHaveLength(1);
        const summary = result.orders[0];
        expect(summary.orderId).toBe(order.id);
        expect(summary.state).toBe(OrderStatus.CONFIRMED);
        expect(summary.itemCount).toBeDefined();
        expect(summary.total).toBeDefined();
        expect(summary.createdAt).toBeDefined();
        expect(summary.updatedAt).toBeDefined();
      });

      it('should include various order states in history', async () => {
        await orderRepository.createOrder(userId, OrderStatus.CONFIRMED);
        await orderRepository.createOrder(userId, OrderStatus.PAID);
        await orderRepository.createOrder(userId, OrderStatus.CANCELLED);

        const result = await queryService.getOrderHistory(userId, undefined, correlationId);

        const states = result.orders.map((o) => o.state);
        expect(states).toContain(OrderStatus.CONFIRMED);
        expect(states).toContain(OrderStatus.PAID);
        expect(states).toContain(OrderStatus.CANCELLED);
      });
    });
  });

  // ============================================================
  // getOrderById Tests
  // ============================================================

  describe('getOrderById', () => {
    describe('successful retrieval', () => {
      it('should return order details for owner', async () => {
        const order = await orderRepository.createOrder(userId, OrderStatus.CONFIRMED);

        const result = await queryService.getOrderById(order.id, userId, correlationId);

        expect(result.orderId).toBe(order.id);
        expect(result.state).toBe(OrderStatus.CONFIRMED);
      });

      it('should include all order fields in detail', async () => {
        const order = await orderRepository.createOrder(userId, OrderStatus.CONFIRMED);

        const result = await queryService.getOrderById(order.id, userId, correlationId);

        expect(result.orderId).toBeDefined();
        expect(result.state).toBeDefined();
        expect(result.items).toBeDefined();
        expect(result.itemCount).toBeDefined();
        expect(result.total).toBeDefined();
        expect(result.createdAt).toBeDefined();
        expect(result.updatedAt).toBeDefined();
      });

      it('should allow viewing DRAFT orders by owner', async () => {
        // Even draft orders should be viewable by owner
        const order = await orderRepository.createOrder(userId, OrderStatus.DRAFT);

        const result = await queryService.getOrderById(order.id, userId, correlationId);

        expect(result.orderId).toBe(order.id);
        expect(result.state).toBe(OrderStatus.DRAFT);
      });

      it('should return orders in any status', async () => {
        const statuses = [
          OrderStatus.CREATED,
          OrderStatus.CONFIRMED,
          OrderStatus.PAID,
          OrderStatus.CANCELLED,
        ];

        for (const status of statuses) {
          const order = await orderRepository.createOrder(userId, status);
          const result = await queryService.getOrderById(order.id, userId, correlationId);
          expect(result.state).toBe(status);
        }
      });
    });

    describe('not found scenarios', () => {
      it('should throw OrderNotFoundException for non-existent order', async () => {
        await expect(
          queryService.getOrderById('non-existent-id', userId, correlationId),
        ).rejects.toThrow(OrderNotFoundException);
      });

      it('should throw OrderNotFoundException with correct order ID', async () => {
        const fakeId = 'fake-order-id';

        try {
          await queryService.getOrderById(fakeId, userId, correlationId);
          fail('Expected OrderNotFoundException');
        } catch (error) {
          expect(error).toBeInstanceOf(OrderNotFoundException);
        }
      });
    });

    describe('ownership enforcement', () => {
      it('should throw UnauthorizedOrderAccessException when accessing other user order', async () => {
        const order = await orderRepository.createOrder(otherUserId, OrderStatus.CONFIRMED);

        await expect(
          queryService.getOrderById(order.id, userId, correlationId),
        ).rejects.toThrow(UnauthorizedOrderAccessException);
      });

      it('should not expose other user order details on access attempt', async () => {
        const order = await orderRepository.createOrder(otherUserId, OrderStatus.CONFIRMED);

        try {
          await queryService.getOrderById(order.id, userId, correlationId);
          fail('Expected UnauthorizedOrderAccessException');
        } catch (error) {
          expect(error).toBeInstanceOf(UnauthorizedOrderAccessException);
          // Error should not leak any order details
          expect((error as Error).message).not.toContain(order.id);
        }
      });

      it('should allow owner to access their own order', async () => {
        const order = await orderRepository.createOrder(userId, OrderStatus.CONFIRMED);

        const result = await queryService.getOrderById(order.id, userId, correlationId);

        expect(result.orderId).toBe(order.id);
      });
    });
  });

  // ============================================================
  // Integration scenarios
  // ============================================================

  describe('integration scenarios', () => {
    it('should handle mixed order states correctly', async () => {
      // Create orders in various states
      await orderRepository.createOrder(userId, OrderStatus.DRAFT); // Cart - excluded from history
      const confirmed = await orderRepository.createOrder(userId, OrderStatus.CONFIRMED);
      const paid = await orderRepository.createOrder(userId, OrderStatus.PAID);
      const cancelled = await orderRepository.createOrder(userId, OrderStatus.CANCELLED);

      // History should exclude draft
      const history = await queryService.getOrderHistory(userId, undefined, correlationId);
      expect(history.orders).toHaveLength(3);

      // But all orders should be viewable by ID
      const confirmedDetail = await queryService.getOrderById(
        confirmed.id,
        userId,
        correlationId,
      );
      expect(confirmedDetail.state).toBe(OrderStatus.CONFIRMED);

      const paidDetail = await queryService.getOrderById(paid.id, userId, correlationId);
      expect(paidDetail.state).toBe(OrderStatus.PAID);

      const cancelledDetail = await queryService.getOrderById(
        cancelled.id,
        userId,
        correlationId,
      );
      expect(cancelledDetail.state).toBe(OrderStatus.CANCELLED);
    });

    it('should isolate data between users', async () => {
      // Create orders for different users
      await createTestOrders(userId, 5);
      await createTestOrders(otherUserId, 3);

      // Each user should only see their own orders
      const user1History = await queryService.getOrderHistory(userId, undefined, correlationId);
      const user2History = await queryService.getOrderHistory(
        otherUserId,
        undefined,
        correlationId,
      );

      expect(user1History.pagination.total).toBe(5);
      expect(user2History.pagination.total).toBe(3);
    });

    it('should handle empty state gracefully', async () => {
      const history = await queryService.getOrderHistory(userId, undefined, correlationId);

      expect(history.orders).toEqual([]);
      expect(history.pagination.total).toBe(0);
      expect(history.pagination.totalPages).toBe(1);
    });
  });
});

