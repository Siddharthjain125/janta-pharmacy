import { IsEnum, IsOptional, IsUUID } from 'class-validator';

/**
 * Order status enum
 */
export enum OrderStatus {
  CREATED = 'CREATED',
  CANCELLED = 'CANCELLED',
}

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
 * Update order status request
 */
export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

/**
 * Query parameters for listing orders
 */
export class ListOrdersQueryDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}

