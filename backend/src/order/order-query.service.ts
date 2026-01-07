import { Injectable, Inject } from '@nestjs/common';
import { ORDER_REPOSITORY, IOrderRepository } from './repositories/order-repository.interface';
import { OrderDto } from './dto/order.dto';
import {
  OrderHistoryResponseDto,
  OrderDetailDto,
  toOrderHistoryResponseDto,
  toOrderDetailDto,
} from './dto/order-history.dto';
import { PaginationParams, normalizePagination } from './queries';
import {
  OrderNotFoundException,
  UnauthorizedOrderAccessException,
} from './exceptions/order.exceptions';
import { logWithCorrelation } from '../common/logging/logger';

/**
 * Order Query Service
 *
 * Read-only service for order queries.
 * Implements explicit query use cases for order history and details.
 *
 * Design principles:
 * - Read-only: No state mutations
 * - Ownership enforcement: Users can only view their own orders
 * - Pagination: Explicit and consistent
 * - Separation: Query logic separate from command logic
 *
 * Note: DRAFT orders (carts) are excluded from order history.
 */
@Injectable()
export class OrderQueryService {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  // ============================================================
  // QUERIES
  // ============================================================

  /**
   * Get paginated order history for a user
   *
   * Returns orders sorted by creation date (most recent first).
   * Excludes DRAFT orders (those are carts, not order history).
   *
   * @param userId - The user to fetch orders for
   * @param pagination - Pagination parameters (page, limit)
   * @param correlationId - Request correlation ID for logging
   */
  async getOrderHistory(
    userId: string,
    pagination?: Partial<PaginationParams>,
    correlationId?: string,
  ): Promise<OrderHistoryResponseDto> {
    // Normalize pagination with defaults
    const normalizedPagination = normalizePagination(pagination);

    // Fetch paginated orders
    const result = await this.orderRepository.findByUserIdPaginated(
      userId,
      normalizedPagination,
    );

    if (correlationId) {
      logWithCorrelation(
        'DEBUG',
        correlationId,
        `Fetched order history`,
        'OrderQueryService',
        {
          userId,
          page: result.pagination.page,
          limit: result.pagination.limit,
          total: result.pagination.total,
          returned: result.items.length,
        },
      );
    }

    return toOrderHistoryResponseDto(result.items, result.pagination);
  }

  /**
   * Get order details by ID
   *
   * Returns full order details including all items.
   * Enforces ownership - users can only view their own orders.
   *
   * @param orderId - The order to fetch
   * @param userId - The requesting user (for ownership check)
   * @param correlationId - Request correlation ID for logging
   *
   * @throws OrderNotFoundException - If order doesn't exist
   * @throws UnauthorizedOrderAccessException - If user doesn't own the order
   */
  async getOrderById(
    orderId: string,
    userId: string,
    correlationId?: string,
  ): Promise<OrderDetailDto> {
    // Fetch order
    const order = await this.orderRepository.findById(orderId);

    // Check existence
    if (!order) {
      if (correlationId) {
        logWithCorrelation(
          'WARN',
          correlationId,
          `Order not found`,
          'OrderQueryService',
          { orderId, userId },
        );
      }
      throw new OrderNotFoundException(orderId);
    }

    // Check ownership
    if (order.userId !== userId) {
      if (correlationId) {
        logWithCorrelation(
          'WARN',
          correlationId,
          `Unauthorized order access attempt`,
          'OrderQueryService',
          { orderId, requestingUserId: userId, ownerUserId: order.userId },
        );
      }
      throw new UnauthorizedOrderAccessException();
    }

    if (correlationId) {
      logWithCorrelation(
        'DEBUG',
        correlationId,
        `Fetched order details`,
        'OrderQueryService',
        { orderId, userId, state: order.status },
      );
    }

    return toOrderDetailDto(order);
  }
}

