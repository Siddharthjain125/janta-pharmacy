import { IsEnum, IsOptional, IsInt, Min, IsString, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../domain/order-status';

// Re-export for convenience
export { OrderStatus } from '../domain/order-status';

/**
 * Price representation in order responses
 */
export interface OrderPriceDto {
  amount: number;
  currency: string;
}

/**
 * Order item representation in responses
 */
export interface OrderItemDto {
  productId: string;
  productName: string;
  unitPrice: OrderPriceDto;
  quantity: number;
  subtotal: OrderPriceDto;
  addedAt: string;
}

/**
 * Order entity representation
 */
export interface OrderDto {
  id: string;
  userId: string;
  status: OrderStatus;
  items: OrderItemDto[];
  itemCount: number;
  total: OrderPriceDto;
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

/**
 * Add item to cart request
 */
export class AddItemToCartDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number = 1;
}

/**
 * Update item quantity request
 */
export class UpdateItemQuantityDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity!: number;
}
