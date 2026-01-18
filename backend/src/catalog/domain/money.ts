/**
 * Money Value Object
 *
 * Represents a monetary amount with currency.
 * Ensures money is always represented correctly and safely.
 *
 * Design decisions:
 * - Amount stored in minor units (paise for INR) to avoid floating point issues
 * - Currency defaults to INR for this India-based pharmacy
 * - Immutable - all operations return new Money instances
 */
export class Money {
  private constructor(
    /** Amount in minor units (e.g., paise for INR) */
    private readonly amountInMinorUnits: number,
    /** Currency code (ISO 4217) */
    private readonly currencyCode: string = 'INR',
  ) {}

  /**
   * Create Money from amount in major units (e.g., rupees)
   * @param amount Amount in major units (e.g., 99.50 for ₹99.50)
   * @param currency Currency code (defaults to INR)
   */
  static fromMajorUnits(amount: number, currency: string = 'INR'): Money {
    if (amount < 0) {
      throw new Error('Money amount cannot be negative');
    }
    if (!Number.isFinite(amount)) {
      throw new Error('Money amount must be a finite number');
    }
    // Round to avoid floating point precision issues
    const minorUnits = Math.round(amount * 100);
    return new Money(minorUnits, currency);
  }

  /**
   * Create Money from amount in minor units (e.g., paise)
   * @param amount Amount in minor units (e.g., 9950 for ₹99.50)
   * @param currency Currency code (defaults to INR)
   */
  static fromMinorUnits(amount: number, currency: string = 'INR'): Money {
    if (amount < 0) {
      throw new Error('Money amount cannot be negative');
    }
    if (!Number.isInteger(amount)) {
      throw new Error('Minor units must be an integer');
    }
    return new Money(amount, currency);
  }

  /**
   * Create zero Money
   */
  static zero(currency: string = 'INR'): Money {
    return new Money(0, currency);
  }

  /**
   * Get amount in major units (e.g., rupees)
   */
  getAmount(): number {
    return this.amountInMinorUnits / 100;
  }

  /**
   * Get amount in minor units (e.g., paise)
   */
  getAmountInMinorUnits(): number {
    return this.amountInMinorUnits;
  }

  /**
   * Get currency code
   */
  getCurrency(): string {
    return this.currencyCode;
  }

  /**
   * Check if this money is zero
   */
  isZero(): boolean {
    return this.amountInMinorUnits === 0;
  }

  /**
   * Add another Money amount
   * @throws Error if currencies don't match
   */
  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amountInMinorUnits + other.amountInMinorUnits, this.currencyCode);
  }

  /**
   * Multiply by a quantity (e.g., for item totals)
   */
  multiply(quantity: number): Money {
    if (quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }
    return new Money(Math.round(this.amountInMinorUnits * quantity), this.currencyCode);
  }

  /**
   * Check equality with another Money
   */
  equals(other: Money): boolean {
    return (
      this.amountInMinorUnits === other.amountInMinorUnits &&
      this.currencyCode === other.currencyCode
    );
  }

  /**
   * Format for display (e.g., "₹99.50")
   */
  format(): string {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: this.currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return formatter.format(this.getAmount());
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON(): { amount: number; currency: string } {
    return {
      amount: this.getAmount(),
      currency: this.currencyCode,
    };
  }

  private assertSameCurrency(other: Money): void {
    if (this.currencyCode !== other.currencyCode) {
      throw new Error(
        `Cannot operate on different currencies: ${this.currencyCode} and ${other.currencyCode}`,
      );
    }
  }
}
