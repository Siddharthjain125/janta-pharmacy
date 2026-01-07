import { Money } from '../../catalog/domain/money';

/**
 * Order Item
 *
 * Represents a line item within an order.
 * Captures product data at the time of adding to cart (snapshot).
 *
 * Design decisions:
 * - productId is a reference only (no coupling to Catalog domain entity)
 * - productName and unitPrice are snapshots (won't change if catalog changes)
 * - Immutable after creation; updates create new instances
 * - Subtotal is calculated, not stored
 */
export interface OrderItem {
  /** Reference to the product (not the full Product entity) */
  readonly productId: string;

  /** Snapshot of product name at time of adding */
  readonly productName: string;

  /** Snapshot of unit price at time of adding */
  readonly unitPrice: Money;

  /** Quantity ordered */
  readonly quantity: number;

  /** When this item was added */
  readonly addedAt: Date;
}

/**
 * Data required to create an OrderItem
 */
export interface CreateOrderItemData {
  productId: string;
  productName: string;
  unitPrice: Money;
  quantity: number;
}

/**
 * Factory function to create a new OrderItem
 * Validates invariants before creation
 */
export function createOrderItem(
  data: CreateOrderItemData,
  now: Date = new Date(),
): OrderItem {
  if (!data.productId || data.productId.trim().length === 0) {
    throw new Error('Product ID cannot be empty');
  }

  if (!data.productName || data.productName.trim().length === 0) {
    throw new Error('Product name cannot be empty');
  }

  if (data.quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }

  if (!Number.isInteger(data.quantity)) {
    throw new Error('Quantity must be an integer');
  }

  return {
    productId: data.productId,
    productName: data.productName.trim(),
    unitPrice: data.unitPrice,
    quantity: data.quantity,
    addedAt: now,
  };
}

/**
 * Create a copy of an OrderItem with updated quantity
 */
export function updateOrderItemQuantity(
  item: OrderItem,
  newQuantity: number,
): OrderItem {
  if (newQuantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }

  if (!Number.isInteger(newQuantity)) {
    throw new Error('Quantity must be an integer');
  }

  return {
    ...item,
    quantity: newQuantity,
  };
}

/**
 * Calculate subtotal for an order item
 */
export function calculateItemSubtotal(item: OrderItem): Money {
  return item.unitPrice.multiply(item.quantity);
}

/**
 * Convert OrderItem to a plain serializable object
 */
export function orderItemToDTO(item: OrderItem): {
  productId: string;
  productName: string;
  unitPrice: { amount: number; currency: string };
  quantity: number;
  subtotal: { amount: number; currency: string };
  addedAt: string;
} {
  const subtotal = calculateItemSubtotal(item);
  return {
    productId: item.productId,
    productName: item.productName,
    unitPrice: item.unitPrice.toJSON(),
    quantity: item.quantity,
    subtotal: subtotal.toJSON(),
    addedAt: item.addedAt.toISOString(),
  };
}

