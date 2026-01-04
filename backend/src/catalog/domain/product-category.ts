/**
 * Product Category Enum
 *
 * Represents the classification of pharmacy products.
 * Categories help with organization, search, and compliance.
 */
export enum ProductCategory {
  /** General over-the-counter medicines */
  GENERAL = 'GENERAL',

  /** Prescription-only medicines */
  PRESCRIPTION = 'PRESCRIPTION',

  /** Ayurvedic and herbal products */
  AYURVEDIC = 'AYURVEDIC',

  /** Personal care and hygiene products */
  PERSONAL_CARE = 'PERSONAL_CARE',

  /** Baby and mother care products */
  BABY_CARE = 'BABY_CARE',

  /** Health devices (thermometers, BP monitors, etc.) */
  HEALTH_DEVICES = 'HEALTH_DEVICES',

  /** Vitamins and nutritional supplements */
  SUPPLEMENTS = 'SUPPLEMENTS',

  /** First aid and medical supplies */
  FIRST_AID = 'FIRST_AID',
}

/**
 * Category metadata for display and filtering
 */
export const PRODUCT_CATEGORY_METADATA: Record<
  ProductCategory,
  { label: string; description: string; requiresPrescription: boolean }
> = {
  [ProductCategory.GENERAL]: {
    label: 'General Medicines',
    description: 'Over-the-counter medicines for common ailments',
    requiresPrescription: false,
  },
  [ProductCategory.PRESCRIPTION]: {
    label: 'Prescription Medicines',
    description: 'Medicines that require a valid prescription',
    requiresPrescription: true,
  },
  [ProductCategory.AYURVEDIC]: {
    label: 'Ayurvedic Products',
    description: 'Traditional Ayurvedic and herbal remedies',
    requiresPrescription: false,
  },
  [ProductCategory.PERSONAL_CARE]: {
    label: 'Personal Care',
    description: 'Skincare, haircare, and hygiene products',
    requiresPrescription: false,
  },
  [ProductCategory.BABY_CARE]: {
    label: 'Baby & Mother Care',
    description: 'Products for babies and expecting mothers',
    requiresPrescription: false,
  },
  [ProductCategory.HEALTH_DEVICES]: {
    label: 'Health Devices',
    description: 'Medical devices and health monitoring equipment',
    requiresPrescription: false,
  },
  [ProductCategory.SUPPLEMENTS]: {
    label: 'Vitamins & Supplements',
    description: 'Nutritional supplements and vitamins',
    requiresPrescription: false,
  },
  [ProductCategory.FIRST_AID]: {
    label: 'First Aid',
    description: 'First aid supplies and medical accessories',
    requiresPrescription: false,
  },
};

/**
 * Get all product categories
 */
export function getAllCategories(): ProductCategory[] {
  return Object.values(ProductCategory);
}

/**
 * Check if a category typically requires prescription
 */
export function categoryRequiresPrescription(category: ProductCategory): boolean {
  return PRODUCT_CATEGORY_METADATA[category].requiresPrescription;
}

