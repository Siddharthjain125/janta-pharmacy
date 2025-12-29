import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from '../domain/order-status';

// Re-export for convenience
export { OrderStatus } from '../domain/order-status';

/**
 * Order entity representation
 */
export interface OrderDto {
  id: string;
  userId: string;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create order request (minimal - user comes from auth context)
 */
export class CreateOrderDto {
  // Future: items, shipping address, etc.
}

/**
 * Query parameters for listing orders
 */
export class ListOrdersQueryDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
