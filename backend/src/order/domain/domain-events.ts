import { Money } from '../../catalog/domain/money';

/**
 * Domain Events for Order Aggregate
 *
 * Domain events represent facts that happened within the domain.
 * They are named in past tense (OrderConfirmed, not ConfirmOrder).
 *
 * Design principles:
 * - Events are immutable records of what happened
 * - Events contain all relevant data at time of occurrence
 * - Events are dispatched in-process (no async infrastructure)
 * - Events can be collected and processed synchronously
 *
 * Current scope:
 * - In-process event collection only
 * - No external messaging or persistence
 * - Foundation for future async workflows
 */

/**
 * Base interface for all domain events
 */
export interface DomainEvent {
  /** Event type discriminator */
  readonly type: string;
  /** When the event occurred */
  readonly occurredAt: Date;
  /** Correlation ID for tracing */
  readonly correlationId?: string;
}

/**
 * Order Confirmed Event
 *
 * Emitted when a draft order is confirmed (checkout completed).
 * This is an irreversible business commitment.
 *
 * Contains:
 * - Full order snapshot at confirmation time
 * - Finalized total (immutable after this point)
 * - Item count for quick reference
 */
export interface OrderConfirmedEvent extends DomainEvent {
  readonly type: 'ORDER_CONFIRMED';
  readonly orderId: string;
  readonly userId: string;
  readonly total: {
    readonly amount: number;
    readonly currency: string;
  };
  readonly itemCount: number;
  readonly itemSummary: ReadonlyArray<{
    readonly productId: string;
    readonly productName: string;
    readonly quantity: number;
    readonly subtotal: { amount: number; currency: string };
  }>;
}

/**
 * Factory function to create an OrderConfirmed event
 */
export function createOrderConfirmedEvent(
  data: {
    orderId: string;
    userId: string;
    total: Money;
    items: Array<{
      productId: string;
      productName: string;
      quantity: number;
      subtotal: Money;
    }>;
  },
  correlationId?: string,
): OrderConfirmedEvent {
  return {
    type: 'ORDER_CONFIRMED',
    occurredAt: new Date(),
    correlationId,
    orderId: data.orderId,
    userId: data.userId,
    total: data.total.toJSON(),
    itemCount: data.items.reduce((sum, item) => sum + item.quantity, 0),
    itemSummary: data.items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      subtotal: item.subtotal.toJSON(),
    })),
  };
}

/**
 * Simple in-process event collector
 *
 * Collects domain events during a use case execution.
 * Events can be processed after the transaction completes.
 *
 * Usage:
 *   const collector = new DomainEventCollector();
 *   collector.add(createOrderConfirmedEvent(...));
 *   // After success:
 *   for (const event of collector.getEvents()) {
 *     // Log, notify, etc.
 *   }
 */
export class DomainEventCollector {
  private readonly events: DomainEvent[] = [];

  /**
   * Add an event to the collector
   */
  add(event: DomainEvent): void {
    this.events.push(event);
  }

  /**
   * Get all collected events
   */
  getEvents(): ReadonlyArray<DomainEvent> {
    return [...this.events];
  }

  /**
   * Get events of a specific type
   */
  getEventsOfType<T extends DomainEvent>(type: string): T[] {
    return this.events.filter((e) => e.type === type) as T[];
  }

  /**
   * Check if any events were collected
   */
  hasEvents(): boolean {
    return this.events.length > 0;
  }

  /**
   * Clear all events
   */
  clear(): void {
    this.events.length = 0;
  }
}

