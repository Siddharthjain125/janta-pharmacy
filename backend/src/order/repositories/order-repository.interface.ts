import { OrderDto, OrderItemDto } from '../dto/order.dto';
import { OrderStatus } from '../domain/order-status';
import { OrderItem } from '../domain/order-item';
import { PaginationParams, PaginatedResult } from '../queries';

/**
 * Order Repository Interface
 *
 * Defines the contract for order data access.
 * Implementations: InMemoryOrderRepository, PrismaOrderRepository
 *
 * Note: The repository does NOT enforce business rules.
 * State transitions and invariants are validated in the service layer.
 */
export interface IOrderRepository {
  // ============================================================
  // Standard Order Operations
  // ============================================================

  /**
   * Create a new order with specified status
   */
  createOrder(userId: string, status?: OrderStatus): Promise<OrderDto>;

  /**
   * Find order by ID
   */
  findById(orderId: string): Promise<OrderDto | null>;

  /**
   * Find all orders for a user, optionally filtered by status
   */
  findByUserId(userId: string, status?: OrderStatus): Promise<OrderDto[]>;

  /**
   * Find orders for a user with pagination
   * Returns orders sorted by createdAt descending (most recent first)
   * Excludes DRAFT orders (those are carts, not order history)
   */
  findByUserIdPaginated(
    userId: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<OrderDto>>;

  /**
   * Update order status
   * Note: Does NOT validate transition - that's the service's job
   */
  updateStatus(orderId: string, status: OrderStatus): Promise<OrderDto>;

  /**
   * Check if an order exists
   */
  exists(orderId: string): Promise<boolean>;

  // ============================================================
  // Draft Order / Cart Operations
  // ============================================================

  /**
   * Find the active draft order for a user
   * Returns null if no draft exists
   */
  findDraftByUserId(userId: string): Promise<OrderDto | null>;

  /**
   * Check if user has an active draft order
   */
  hasDraft(userId: string): Promise<boolean>;

  /**
   * Add an item to an order
   * If product already exists, updates quantity instead
   */
  addItem(orderId: string, item: OrderItem): Promise<OrderDto>;

  /**
   * Update quantity of an existing item
   */
  updateItemQuantity(orderId: string, productId: string, quantity: number): Promise<OrderDto>;

  /**
   * Remove an item from an order
   */
  removeItem(orderId: string, productId: string): Promise<OrderDto>;

  /**
   * Clear all items from an order
   */
  clearItems(orderId: string): Promise<OrderDto>;

  /**
   * Get a specific item from an order
   */
  getItem(orderId: string, productId: string): Promise<OrderItemDto | null>;
}

export const ORDER_REPOSITORY = 'ORDER_REPOSITORY';
