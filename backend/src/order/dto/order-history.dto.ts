import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../domain/order-status';
import { OrderDto, OrderPriceDto, OrderItemDto } from './order.dto';
import { PaginationMeta, DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '../queries';

/**
 * Order History DTOs
 *
 * Response DTOs for order history queries.
 * Designed to be safe for API exposure (no internal state leaked).
 */

// ============================================================
// Request DTOs
// ============================================================

/**
 * Query parameters for order history pagination
 */
export class OrderHistoryQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page: number = DEFAULT_PAGE;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(MAX_LIMIT)
  @Type(() => Number)
  limit: number = DEFAULT_LIMIT;
}

// ============================================================
// Response DTOs
// ============================================================

/**
 * Order summary for history listing
 *
 * Compact representation showing key order info.
 * Does not include full item details.
 */
export interface OrderSummaryDto {
  /** Order ID */
  orderId: string;

  /** Current order state */
  state: OrderStatus;

  /** Total item count */
  itemCount: number;

  /** Order total */
  total: OrderPriceDto;

  /** When order was created */
  createdAt: string;

  /** When order was last updated (e.g., confirmed) */
  updatedAt: string;
}

/**
 * Order item for detail view
 */
export interface OrderDetailItemDto {
  productId: string;
  productName: string;
  unitPrice: OrderPriceDto;
  quantity: number;
  subtotal: OrderPriceDto;
}

/**
 * Compliance status (ADR-0055) — derived, read-only. Not an order state.
 */
export type OrderDetailComplianceStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/**
 * Linked prescription in order detail compliance (read-only view).
 */
export interface OrderDetailPrescriptionDto {
  id: string;
  status: string;
  rejectionReason?: string | null;
}

/**
 * Linked consultation in order detail compliance (read-only view).
 */
export interface OrderDetailConsultationDto {
  id: string;
  status: string;
}

/**
 * Compliance block on order detail (ADR-0055).
 * Present only when order requires prescription; backend is source of truth.
 */
export interface OrderDetailComplianceDto {
  requiresPrescription: true;
  status: OrderDetailComplianceStatus;
  prescriptions?: OrderDetailPrescriptionDto[];
  consultations?: OrderDetailConsultationDto[];
}

/**
 * Full order detail response
 *
 * Complete order information including all items.
 * compliance is optional; included only when order has prescription-required items (ADR-0055).
 */
export interface OrderDetailDto {
  /** Order ID */
  orderId: string;

  /** Current order state */
  state: OrderStatus;

  /** Order items with details */
  items: OrderDetailItemDto[];

  /** Total item count */
  itemCount: number;

  /** Order total */
  total: OrderPriceDto;

  /** When order was created */
  createdAt: string;

  /** When order was last updated */
  updatedAt: string;

  /** Read-only compliance info; present only when requiresPrescription (ADR-0055) */
  compliance?: OrderDetailComplianceDto;
}

/**
 * Paginated order history response
 */
export interface OrderHistoryResponseDto {
  orders: OrderSummaryDto[];
  pagination: PaginationMeta;
}

// ============================================================
// Conversion Functions
// ============================================================

/**
 * Convert OrderDto to OrderSummaryDto
 */
export function toOrderSummaryDto(order: OrderDto): OrderSummaryDto {
  return {
    orderId: order.id,
    state: order.status,
    itemCount: order.itemCount,
    total: order.total,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

/**
 * Convert OrderDto to OrderDetailDto
 */
export function toOrderDetailDto(order: OrderDto): OrderDetailDto {
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
    updatedAt: order.updatedAt.toISOString(),
  };
}

/**
 * Convert internal PaginatedResult to API response
 */
export function toOrderHistoryResponseDto(
  orders: OrderDto[],
  pagination: PaginationMeta,
): OrderHistoryResponseDto {
  return {
    orders: orders.map(toOrderSummaryDto),
    pagination,
  };
}
