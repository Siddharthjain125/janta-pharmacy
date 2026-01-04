/**
 * ProductId Value Object
 *
 * Represents a unique product identifier.
 * Encapsulates ID validation and generation.
 */
export class ProductId {
  private constructor(private readonly value: string) {}

  /**
   * Create a ProductId from an existing string ID
   * @throws Error if the ID is invalid
   */
  static from(id: string): ProductId {
    if (!ProductId.isValid(id)) {
      throw new Error(`Invalid product ID: ${id}`);
    }
    return new ProductId(id);
  }

  /**
   * Create a ProductId from a string, returning null if invalid
   */
  static tryFrom(id: string): ProductId | null {
    if (!ProductId.isValid(id)) {
      return null;
    }
    return new ProductId(id);
  }

  /**
   * Validate a product ID string
   * Currently accepts non-empty strings (UUID or other format)
   */
  static isValid(id: string): boolean {
    return typeof id === 'string' && id.trim().length > 0;
  }

  /**
   * Get the string value of the ID
   */
  toString(): string {
    return this.value;
  }

  /**
   * Check equality with another ProductId
   */
  equals(other: ProductId): boolean {
    return this.value === other.value;
  }
}
