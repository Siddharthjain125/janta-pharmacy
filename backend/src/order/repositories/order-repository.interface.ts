import { OrderDto } from '../dto/order.dto';
import { OrderStatus } from '../domain/order-status';

/**
 * Order Repository Interface
 *
 * Defines the contract for order data access.
 * Implementations: InMemoryOrderRepository, PrismaOrderRepository
 *
 * Note: The repository does NOT enforce business rules.
 * State transitions are validated in the service layer.
 */
export interface IOrderRepository {
  /**
   * Create a new order with CREATED status
   */
  createOrder(userId: string): Promise<OrderDto>;

  /**
   * Find order by ID
   */
  findById(orderId: string): Promise<OrderDto | null>;

  /**
   * Find all orders for a user, optionally filtered by status
   */
  findByUserId(userId: string, status?: OrderStatus): Promise<OrderDto[]>;

  /**
   * Update order status
   * Note: Does NOT validate transition - that's the service's job
   */
  updateStatus(orderId: string, status: OrderStatus): Promise<OrderDto>;

  /**
   * Check if an order exists
   */
  exists(orderId: string): Promise<boolean>;
}

export const ORDER_REPOSITORY = 'ORDER_REPOSITORY';
