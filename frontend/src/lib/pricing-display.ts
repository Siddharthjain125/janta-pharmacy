/**
 * Pricing Display Utilities
 *
 * UI-only utilities for presenting prices with MRP and discounts.
 * These are for DISPLAY PURPOSES ONLY - they do not affect backend totals.
 *
 * The backend price is the actual selling price (source of truth).
 * MRP and discount are derived/mock values for presentation.
 */

/**
 * Pricing display data for a product
 */
export interface PricingDisplay {
  /** Actual selling price (from backend) */
  sellingPrice: number;
  /** Maximum Retail Price (derived - higher than selling) */
  mrp: number;
  /** Discount percentage */
  discountPercent: number;
  /** Currency code */
  currency: string;
}

/**
 * Calculate display pricing from backend price
 *
 * This is a UI presentation layer - MRP is derived by marking up
 * the selling price to create a discount appearance.
 *
 * In production, MRP would come from product catalog data.
 */
export function calculatePricingDisplay(
  sellingPrice: number,
  currency: string = 'INR',
): PricingDisplay {
  // Derive MRP as 15-30% higher than selling price
  // Using product price modulo to create variation
  const discountPercent = 15 + (Math.floor(sellingPrice) % 16); // 15-30%
  const mrp = Math.round(sellingPrice / (1 - discountPercent / 100));

  return {
    sellingPrice,
    mrp,
    discountPercent,
    currency,
  };
}

/**
 * Format price for display
 */
export function formatPrice(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Cart pricing breakdown for display
 */
export interface CartPricingBreakdown {
  /** Total MRP (sum of all items at MRP) */
  totalMrp: number;
  /** Final amount (from backend - source of truth) */
  finalAmount: number;
  /** Total savings (MRP - Final) */
  totalSavings: number;
  /** Currency code */
  currency: string;
}

/**
 * Calculate cart pricing breakdown for display
 *
 * @param items - Array of cart items with price and quantity
 * @param backendTotal - The actual total from backend (source of truth)
 * @param currency - Currency code
 * @returns CartPricingBreakdown
 */
export function calculateCartPricingBreakdown(
  items: Array<{ unitPrice: { amount: number; currency: string }; quantity: number }>,
  backendTotal: number,
  currency: string = 'INR',
): CartPricingBreakdown {
  const totalMrp = items.reduce((total, item) => {
    const pricing = calculatePricingDisplay(item.unitPrice.amount);
    return total + pricing.mrp * item.quantity;
  }, 0);

  return {
    totalMrp,
    finalAmount: backendTotal,
    totalSavings: totalMrp - backendTotal,
    currency,
  };
}

/**
 * Calculate total savings for cart items
 *
 * @param items - Array of items with price and quantity
 * @returns Total savings amount
 * @deprecated Use calculateCartPricingBreakdown instead
 */
export function calculateCartSavings(
  items: Array<{ unitPrice: { amount: number; currency: string }; quantity: number }>,
): number {
  return items.reduce((total, item) => {
    const pricing = calculatePricingDisplay(item.unitPrice.amount);
    const savings = (pricing.mrp - pricing.sellingPrice) * item.quantity;
    return total + savings;
  }, 0);
}

