import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderDto, OrderItemDto, OrderPriceDto, OrderStatus } from './order.dto';

/**
 * Cart item response (safe for API exposure)
 */
export interface CartItemDto {
  productId: string;
  productName: string;
  unitPrice: OrderPriceDto;
  quantity: number;
  subtotal: OrderPriceDto;
}

/**
 * Cart response DTO (safe for API exposure)
 *
 * This DTO omits sensitive fields like userId that
 * should not be exposed to clients.
 */
export interface CartResponseDto {
  /** Order ID */
  orderId: string;

  /** Current state (always DRAFT for cart) */
  state: string;

  /** Items in cart */
  items: CartItemDto[];

  /** Total item count (sum of quantities) */
  itemCount: number;

  /** Cart total */
  total: OrderPriceDto;

  /** When cart was created */
  createdAt: string;

  /** When cart was last modified */
  updatedAt: string;
}

/**
 * Add item to cart request
 */
export class AddToCartRequestDto {
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
export class UpdateCartItemRequestDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity!: number;
}

/**
 * Convert internal OrderDto to cart-safe response DTO
 *
 * Strips sensitive fields and renames for API consistency.
 */
export function toCartResponseDto(order: OrderDto): CartResponseDto {
  return {
    orderId: order.id,
    state: order.status,
    items: order.items.map(toCartItemDto),
    itemCount: order.itemCount,
    total: order.total,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

/**
 * Convert OrderItemDto to cart-safe item DTO
 */
function toCartItemDto(item: OrderItemDto): CartItemDto {
  return {
    productId: item.productId,
    productName: item.productName,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    subtotal: item.subtotal,
  };
}

// ============================================================
// Checkout Response DTOs
// ============================================================

/**
 * Item in a confirmed order (safe for API exposure)
 */
export interface ConfirmedOrderItemDto {
  productId: string;
  productName: string;
  unitPrice: OrderPriceDto;
  quantity: number;
  subtotal: OrderPriceDto;
}

/**
 * Checkout response DTO
 *
 * Returned after successfully confirming an order (checkout).
 * Contains all relevant order details for the client.
 */
export interface CheckoutResponseDto {
  /** The confirmed order ID */
  orderId: string;

  /** Order state (CONFIRMED) */
  state: OrderStatus;

  /** Items in the order */
  items: ConfirmedOrderItemDto[];

  /** Total item count (sum of quantities) */
  itemCount: number;

  /** Order total (finalized at confirmation) */
  total: OrderPriceDto;

  /** When the order was created (as draft) */
  createdAt: string;

  /** When the order was confirmed (checkout time) */
  confirmedAt: string;
}

/**
 * Convert OrderDto to checkout response DTO
 */
export function toCheckoutResponseDto(order: OrderDto): CheckoutResponseDto {
  return {
    orderId: order.id,
    state: order.status,
    items: order.items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      subtotal: item.subtotal,
    })),
    itemCount: order.itemCount,
    total: order.total,
    createdAt: order.createdAt.toISOString(),
    confirmedAt: order.updatedAt.toISOString(), // updatedAt reflects confirmation time
  };
}

