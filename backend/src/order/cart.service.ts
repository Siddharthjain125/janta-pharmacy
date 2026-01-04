import { Injectable, Inject } from '@nestjs/common';
import { ORDER_REPOSITORY, IOrderRepository } from './repositories/order-repository.interface';
import { OrderDto } from './dto/order.dto';
import { OrderStatus, isDraftOrder, createOrderItem } from './domain';
import {
  DraftOrderAlreadyExistsException,
  NoDraftOrderException,
  OrderNotDraftException,
  OrderItemNotFoundException,
  InvalidQuantityException,
  UnauthorizedOrderAccessException,
} from './exceptions/order.exceptions';
import { CatalogQueryService } from '../catalog/catalog-query.service';
import { ProductNotFoundException } from '../catalog/exceptions';
import { Money } from '../catalog/domain/money';
import { logWithCorrelation } from '../common/logging/logger';

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
  async createDraftOrder(
    userId: string,
    correlationId: string,
  ): Promise<OrderDto> {
    // Check for existing draft
    const existingDraft = await this.orderRepository.findDraftByUserId(userId);

    if (existingDraft) {
      logWithCorrelation(
        'DEBUG',
        correlationId,
        `Returning existing draft order`,
        'CartService',
        { orderId: existingDraft.id, userId },
      );
      return existingDraft;
    }

    // Create new draft
    const draft = await this.orderRepository.createOrder(
      userId,
      OrderStatus.DRAFT,
    );

    logWithCorrelation(
      'INFO',
      correlationId,
      `Created new draft order (cart)`,
      'CartService',
      { orderId: draft.id, userId },
    );

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

    logWithCorrelation(
      'INFO',
      correlationId,
      `Added item to cart`,
      'CartService',
      {
        orderId: draft.id,
        userId,
        productId,
        productName: product.name,
        quantity,
        unitPrice: product.price.amount,
      },
    );

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

    logWithCorrelation(
      'INFO',
      correlationId,
      `Removed item from cart`,
      'CartService',
      {
        orderId: draft.id,
        userId,
        productId,
        productName: item.productName,
      },
    );

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

    logWithCorrelation(
      'INFO',
      correlationId,
      `Updated item quantity in cart`,
      'CartService',
      {
        orderId: draft.id,
        userId,
        productId,
        productName: item.productName,
        previousQuantity,
        newQuantity: quantity,
      },
    );

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

    logWithCorrelation(
      'INFO',
      correlationId,
      `Cleared cart`,
      'CartService',
      {
        orderId: draft.id,
        userId,
        removedItemCount: previousItemCount,
      },
    );

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

    logWithCorrelation(
      'INFO',
      correlationId,
      `Abandoned cart (cancelled draft)`,
      'CartService',
      {
        orderId: draft.id,
        userId,
        itemCount: draft.itemCount,
      },
    );
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

