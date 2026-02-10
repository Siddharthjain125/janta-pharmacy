import { Injectable, Inject } from '@nestjs/common';
import { ORDER_REPOSITORY, IOrderRepository } from './repositories/order-repository.interface';
import { OrderDto } from './dto/order.dto';
import {
  OrderStatus,
  isDraftOrder,
  createOrderItem,
  canConfirmOrder,
  validateTransition,
  createOrderConfirmedEvent,
  DomainEventCollector,
  type OrderConfirmedEvent,
} from './domain';
import {
  NoDraftOrderException,
  OrderNotDraftException,
  OrderItemNotFoundException,
  InvalidQuantityException,
  UnauthorizedOrderAccessException,
  EmptyCartException,
  InvalidOrderStateTransitionException,
} from './exceptions/order.exceptions';
import { CatalogQueryService } from '../catalog/catalog-query.service';
import { ProductNotFoundException } from '../catalog/exceptions';
import { Money } from '../catalog/domain/money';
import { logWithCorrelation } from '../common/logging/logger';

/**
 * Result of a successful order confirmation (checkout)
 */
export interface ConfirmOrderResult {
  /** The confirmed order */
  order: OrderDto;
  /** Domain events emitted during confirmation */
  events: ReadonlyArray<OrderConfirmedEvent>;
  /** True if order contains prescription-required items (ADR-0055). Used for UI redirect. */
  requiresPrescription: boolean;
}

/**
 * Cart Service
 *
 * Implements cart (draft order) business logic with explicit commands.
 * A cart is modeled as a DRAFT order, allowing full order domain reuse.
 *
 * Design principles:
 * - Command-style methods for all mutations
 * - One active draft per user
 * - Product existence validation via CatalogQueryService
 * - Price captured at add-time (snapshot)
 * - Ownership enforcement on all operations
 *
 * Business rules:
 * - Only DRAFT orders can be modified
 * - Adding same product increments quantity
 * - Quantity must be positive integer
 * - Unit price is captured at add-time
 */
@Injectable()
export class CartService {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    private readonly catalogQueryService: CatalogQueryService,
  ) {}

  // ============================================================
  // QUERIES
  // ============================================================

  /**
   * Get current cart for user
   * Returns null if no cart exists
   */
  async getCart(userId: string, correlationId?: string): Promise<OrderDto | null> {
    const draft = await this.orderRepository.findDraftByUserId(userId);

    if (correlationId && draft) {
      logWithCorrelation(
        'DEBUG',
        correlationId,
        `Retrieved cart with ${draft.itemCount} items`,
        'CartService',
        { orderId: draft.id, userId, itemCount: draft.itemCount },
      );
    }

    return draft;
  }

  /**
   * Get cart or throw if not exists
   */
  async getCartOrFail(userId: string, correlationId?: string): Promise<OrderDto> {
    const cart = await this.getCart(userId, correlationId);

    if (!cart) {
      throw new NoDraftOrderException();
    }

    return cart;
  }

  // ============================================================
  // COMMANDS
  // ============================================================

  /**
   * Create a new draft order (cart)
   *
   * Business rules:
   * - User can only have one active draft
   * - Returns existing draft if one exists
   */
  async createDraftOrder(userId: string, correlationId: string): Promise<OrderDto> {
    // Check for existing draft
    const existingDraft = await this.orderRepository.findDraftByUserId(userId);

    if (existingDraft) {
      logWithCorrelation('DEBUG', correlationId, `Returning existing draft order`, 'CartService', {
        orderId: existingDraft.id,
        userId,
      });
      return existingDraft;
    }

    // Create new draft
    const draft = await this.orderRepository.createOrder(userId, OrderStatus.DRAFT);

    logWithCorrelation('INFO', correlationId, `Created new draft order (cart)`, 'CartService', {
      orderId: draft.id,
      userId,
    });

    return draft;
  }

  /**
   * Add item to cart
   *
   * Business rules:
   * - Creates draft if none exists
   * - Validates product exists and is active
   * - Captures price at add-time
   * - If product already in cart, increments quantity
   * - Quantity must be positive
   */
  async addItemToCart(
    userId: string,
    productId: string,
    quantity: number,
    correlationId: string,
  ): Promise<OrderDto> {
    // Validate quantity
    this.validateQuantity(quantity);

    // Validate product exists and is active
    const product = await this.validateProductExists(productId);

    // Get or create draft
    let draft = await this.orderRepository.findDraftByUserId(userId);

    if (!draft) {
      draft = await this.orderRepository.createOrder(userId, OrderStatus.DRAFT);
      logWithCorrelation(
        'INFO',
        correlationId,
        `Created new draft order for add item`,
        'CartService',
        { orderId: draft.id, userId },
      );
    }

    // Create order item with product snapshot
    const orderItem = createOrderItem({
      productId: product.id,
      productName: product.name,
      unitPrice: Money.fromMajorUnits(product.price.amount, product.price.currency),
      quantity,
    });

    // Add to cart (repository handles duplicate detection)
    const updatedCart = await this.orderRepository.addItem(draft.id, orderItem);

    logWithCorrelation('INFO', correlationId, `Added item to cart`, 'CartService', {
      orderId: draft.id,
      userId,
      productId,
      productName: product.name,
      quantity,
      unitPrice: product.price.amount,
    });

    return updatedCart;
  }

  /**
   * Remove item from cart
   *
   * Business rules:
   * - Only owner can remove items
   * - Only DRAFT orders can be modified
   * - Item must exist in cart
   */
  async removeItemFromCart(
    userId: string,
    productId: string,
    correlationId: string,
  ): Promise<OrderDto> {
    const draft = await this.getDraftWithOwnershipCheck(userId, correlationId);

    // Check item exists
    const item = await this.orderRepository.getItem(draft.id, productId);
    if (!item) {
      throw new OrderItemNotFoundException(draft.id, productId);
    }

    const updatedCart = await this.orderRepository.removeItem(draft.id, productId);

    logWithCorrelation('INFO', correlationId, `Removed item from cart`, 'CartService', {
      orderId: draft.id,
      userId,
      productId,
      productName: item.productName,
    });

    return updatedCart;
  }

  /**
   * Update item quantity in cart
   *
   * Business rules:
   * - Only owner can update quantities
   * - Only DRAFT orders can be modified
   * - Item must exist in cart
   * - Quantity must be positive
   */
  async updateItemQuantity(
    userId: string,
    productId: string,
    quantity: number,
    correlationId: string,
  ): Promise<OrderDto> {
    // Validate quantity
    this.validateQuantity(quantity);

    const draft = await this.getDraftWithOwnershipCheck(userId, correlationId);

    // Check item exists
    const item = await this.orderRepository.getItem(draft.id, productId);
    if (!item) {
      throw new OrderItemNotFoundException(draft.id, productId);
    }

    const previousQuantity = item.quantity;
    const updatedCart = await this.orderRepository.updateItemQuantity(
      draft.id,
      productId,
      quantity,
    );

    logWithCorrelation('INFO', correlationId, `Updated item quantity in cart`, 'CartService', {
      orderId: draft.id,
      userId,
      productId,
      productName: item.productName,
      previousQuantity,
      newQuantity: quantity,
    });

    return updatedCart;
  }

  /**
   * Clear all items from cart
   *
   * Business rules:
   * - Only owner can clear cart
   * - Only DRAFT orders can be modified
   */
  async clearCart(userId: string, correlationId: string): Promise<OrderDto> {
    const draft = await this.getDraftWithOwnershipCheck(userId, correlationId);

    const previousItemCount = draft.itemCount;
    const updatedCart = await this.orderRepository.clearItems(draft.id);

    logWithCorrelation('INFO', correlationId, `Cleared cart`, 'CartService', {
      orderId: draft.id,
      userId,
      removedItemCount: previousItemCount,
    });

    return updatedCart;
  }

  /**
   * Delete/abandon cart entirely
   *
   * Business rules:
   * - Only owner can delete cart
   * - Only DRAFT orders can be deleted this way
   * - Transitions draft to CANCELLED
   */
  async abandonCart(userId: string, correlationId: string): Promise<void> {
    const draft = await this.getDraftWithOwnershipCheck(userId, correlationId);

    await this.orderRepository.updateStatus(draft.id, OrderStatus.CANCELLED);

    logWithCorrelation('INFO', correlationId, `Abandoned cart (cancelled draft)`, 'CartService', {
      orderId: draft.id,
      userId,
      itemCount: draft.itemCount,
    });
  }

  // ============================================================
  // CHECKOUT COMMANDS
  // ============================================================

  /**
   * Confirm draft order (checkout)
   *
   * Converts a DRAFT order into a CONFIRMED order.
   * This is an irreversible business commitment.
   *
   * ADR-0055: Checkout is never blocked by prescription. Orders with prescription-required
   * items are confirmed; requiresPrescription is set so the UI can redirect to compliance flow.
   *
   * Business rules:
   * - Order must exist and be in DRAFT state
   * - Only owner can confirm their order
   * - Cart must have at least one item
   * - State transition must be valid per state machine
   * - Total is finalized at confirmation time
   *
   * @throws NoDraftOrderException - No active cart found
   * @throws UnauthorizedOrderAccessException - User doesn't own the cart
   * @throws EmptyCartException - Cart has no items
   * @throws InvalidOrderStateTransitionException - State transition not allowed
   */
  async confirmDraftOrder(userId: string, correlationId: string): Promise<ConfirmOrderResult> {
    // 1. Get draft with ownership check
    const draft = await this.getDraftWithOwnershipCheck(userId, correlationId);

    // 2. Validate cart is not empty
    if (draft.items.length === 0) {
      logWithCorrelation('WARN', correlationId, `Checkout failed: cart is empty`, 'CartService', {
        orderId: draft.id,
        userId,
      });
      throw new EmptyCartException();
    }

    // 3. Detect prescription requirement (ADR-0055 — do not block checkout)
    const requiresPrescription = await this.orderHasPrescriptionRequiredItems(draft);

    // 4. Validate state transition
    const validation = validateTransition(draft.status, OrderStatus.CONFIRMED);
    if (!validation.valid) {
      logWithCorrelation(
        'WARN',
        correlationId,
        `Checkout failed: invalid state transition`,
        'CartService',
        {
          orderId: draft.id,
          userId,
          currentStatus: draft.status,
          targetStatus: OrderStatus.CONFIRMED,
          reason: validation.reason,
        },
      );
      throw new InvalidOrderStateTransitionException(
        draft.status,
        OrderStatus.CONFIRMED,
        validation.allowedTransitions,
      );
    }

    // 5. Transition to CONFIRMED
    const confirmedOrder = await this.orderRepository.updateStatus(draft.id, OrderStatus.CONFIRMED);

    // 6. Create domain event
    const eventCollector = new DomainEventCollector();
    const orderConfirmedEvent = createOrderConfirmedEvent(
      {
        orderId: confirmedOrder.id,
        userId: confirmedOrder.userId,
        total: Money.fromMinorUnits(
          Math.round(confirmedOrder.total.amount * 100),
          confirmedOrder.total.currency,
        ),
        items: confirmedOrder.items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          subtotal: Money.fromMinorUnits(
            Math.round(item.subtotal.amount * 100),
            item.subtotal.currency,
          ),
        })),
      },
      correlationId,
    );
    eventCollector.add(orderConfirmedEvent);

    // 7. Log success
    logWithCorrelation('INFO', correlationId, `Order confirmed successfully`, 'CartService', {
      orderId: confirmedOrder.id,
      userId,
      itemCount: confirmedOrder.itemCount,
      total: confirmedOrder.total.amount,
      currency: confirmedOrder.total.currency,
    });

    return {
      order: confirmedOrder,
      events: eventCollector.getEventsOfType<OrderConfirmedEvent>('ORDER_CONFIRMED'),
      requiresPrescription,
    };
  }

  /**
   * Detect if order contains prescription-required items (ADR-0055).
   * Used to set requiresPrescription on checkout response; does not block checkout.
   */
  private async orderHasPrescriptionRequiredItems(order: OrderDto): Promise<boolean> {
    for (const item of order.items) {
      try {
        const product = await this.catalogQueryService.getProductById(
          item.productId,
          undefined,
        );
        if (product.requiresPrescription) return true;
      } catch (error) {
        if (!(error instanceof ProductNotFoundException)) throw error;
      }
    }
    return false;
  }

  // ============================================================
  // PRIVATE HELPERS
  // ============================================================

  /**
   * Get draft order with ownership verification
   */
  private async getDraftWithOwnershipCheck(
    userId: string,
    correlationId?: string,
  ): Promise<OrderDto> {
    const draft = await this.orderRepository.findDraftByUserId(userId);

    if (!draft) {
      throw new NoDraftOrderException();
    }

    // Verify ownership (should always match, but defensive)
    if (draft.userId !== userId) {
      if (correlationId) {
        logWithCorrelation(
          'WARN',
          correlationId,
          `Unauthorized cart access attempt`,
          'CartService',
          { orderId: draft.id, requestingUserId: userId, ownerUserId: draft.userId },
        );
      }
      throw new UnauthorizedOrderAccessException();
    }

    // Verify draft status (should always be DRAFT, but defensive)
    if (!isDraftOrder(draft.status)) {
      throw new OrderNotDraftException(draft.id, draft.status);
    }

    return draft;
  }

  /**
   * Validate product exists and is active
   */
  private async validateProductExists(productId: string): Promise<{
    id: string;
    name: string;
    price: { amount: number; currency: string };
  }> {
    try {
      const product = await this.catalogQueryService.getProductById(productId);
      return {
        id: product.id,
        name: product.name,
        price: product.price,
      };
    } catch (error) {
      if (error instanceof ProductNotFoundException) {
        throw error; // Re-throw as-is
      }
      throw error;
    }
  }

  /**
   * Validate quantity is valid
   */
  private validateQuantity(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new InvalidQuantityException(quantity);
    }
  }
}
