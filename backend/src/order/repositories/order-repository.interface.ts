import { OrderDto, OrderStatus } from '../dto/order.dto';

/**
 * Order Repository Interface
 * 
 * Defines the contract for order data access.
 * Implementations: InMemoryOrderRepository, PrismaOrderRepository
 */
export interface IOrderRepository {
  createOrder(userId: string): Promise<OrderDto>;
  findById(orderId: string): Promise<OrderDto | null>;
  findByUserId(userId: string, status?: OrderStatus): Promise<OrderDto[]>;
  updateStatus(orderId: string, status: OrderStatus): Promise<OrderDto>;
  exists(orderId: string): Promise<boolean>;
}

export const ORDER_REPOSITORY = 'ORDER_REPOSITORY';

