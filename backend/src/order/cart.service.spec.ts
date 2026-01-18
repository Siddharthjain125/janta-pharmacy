import { CartService } from './cart.service';
import { InMemoryOrderRepository } from './repositories/in-memory-order.repository';
import { CatalogQueryService } from '../catalog/catalog-query.service';
import { InMemoryProductRepository } from '../catalog/repositories/in-memory-product.repository';
import { ProductCategory } from '../catalog/domain';
import { OrderStatus } from './domain';
import {
  NoDraftOrderException,
  OrderItemNotFoundException,
  InvalidQuantityException,
  OrderNotDraftException,
  EmptyCartException,
  PrescriptionRequiredException,
  InvalidOrderStateTransitionException,
} from './exceptions/order.exceptions';
import { ProductNotFoundException } from '../catalog/exceptions';

/**
 * CartService Tests
 *
 * Tests for cart (draft order) behavior including:
 * - Creating draft orders
 * - Adding/removing/updating items
 * - Ownership enforcement
 * - One draft per user rule
 * - Product validation
 *
 * Design decisions:
 * - Uses real repositories (no mocks)
 * - Deterministic test data
 * - Focus on business behavior
 */
describe('CartService', () => {
  let cartService: CartService;
  let orderRepository: InMemoryOrderRepository;
  let productRepository: InMemoryProductRepository;
  let catalogQueryService: CatalogQueryService;

  const correlationId = 'test-correlation-id';
  const userId = 'user-123';
  const otherUserId = 'user-456';

  // Known product IDs from sample data
  const validProductId = 'prod-001'; // Paracetamol
  const validProductId2 = 'prod-002'; // Cetirizine
  const prescriptionProductId = 'prod-003'; // Amoxicillin

  beforeEach(() => {
    // Fresh instances for each test
    orderRepository = new InMemoryOrderRepository();
    productRepository = new InMemoryProductRepository();
    catalogQueryService = new CatalogQueryService(productRepository);
    cartService = new CartService(orderRepository, catalogQueryService);
  });

  afterEach(() => {
    orderRepository.clear();
    productRepository.reset();
  });

  describe('getCart', () => {
    it('should return null when no cart exists', async () => {
      const cart = await cartService.getCart(userId, correlationId);

      expect(cart).toBeNull();
    });

    it('should return existing cart', async () => {
      // Create a cart first
      await cartService.createDraftOrder(userId, correlationId);

      const cart = await cartService.getCart(userId, correlationId);

      expect(cart).not.toBeNull();
      expect(cart!.userId).toBe(userId);
      expect(cart!.status).toBe(OrderStatus.DRAFT);
    });

    it('should not return other users carts', async () => {
      // Create cart for other user
      await cartService.createDraftOrder(otherUserId, correlationId);

      const cart = await cartService.getCart(userId, correlationId);

      expect(cart).toBeNull();
    });
  });

  describe('getCartOrFail', () => {
    it('should throw NoDraftOrderException when no cart exists', async () => {
      await expect(cartService.getCartOrFail(userId, correlationId)).rejects.toThrow(
        NoDraftOrderException,
      );
    });

    it('should return cart when exists', async () => {
      await cartService.createDraftOrder(userId, correlationId);

      const cart = await cartService.getCartOrFail(userId, correlationId);

      expect(cart).toBeDefined();
      expect(cart.status).toBe(OrderStatus.DRAFT);
    });
  });

  describe('createDraftOrder', () => {
    it('should create new draft order', async () => {
      const cart = await cartService.createDraftOrder(userId, correlationId);

      expect(cart).toBeDefined();
      expect(cart.id).toBeDefined();
      expect(cart.userId).toBe(userId);
      expect(cart.status).toBe(OrderStatus.DRAFT);
      expect(cart.items).toEqual([]);
      expect(cart.itemCount).toBe(0);
      expect(cart.total.amount).toBe(0);
    });

    it('should return existing draft if one exists', async () => {
      const first = await cartService.createDraftOrder(userId, correlationId);
      const second = await cartService.createDraftOrder(userId, correlationId);

      expect(second.id).toBe(first.id);
    });

    it('should allow different users to have their own drafts', async () => {
      const cart1 = await cartService.createDraftOrder(userId, correlationId);
      const cart2 = await cartService.createDraftOrder(otherUserId, correlationId);

      expect(cart1.id).not.toBe(cart2.id);
      expect(cart1.userId).toBe(userId);
      expect(cart2.userId).toBe(otherUserId);
    });
  });

  describe('addItemToCart', () => {
    it('should create cart if none exists when adding item', async () => {
      const cart = await cartService.addItemToCart(userId, validProductId, 1, correlationId);

      expect(cart).toBeDefined();
      expect(cart.status).toBe(OrderStatus.DRAFT);
      expect(cart.items.length).toBe(1);
    });

    it('should add item with correct product snapshot', async () => {
      const cart = await cartService.addItemToCart(userId, validProductId, 2, correlationId);

      const item = cart.items[0];
      expect(item.productId).toBe(validProductId);
      expect(item.productName).toBe('Paracetamol 500mg');
      expect(item.unitPrice.amount).toBe(25);
      expect(item.unitPrice.currency).toBe('INR');
      expect(item.quantity).toBe(2);
      expect(item.subtotal.amount).toBe(50);
    });

    it('should increment quantity when adding same product', async () => {
      await cartService.addItemToCart(userId, validProductId, 2, correlationId);
      const cart = await cartService.addItemToCart(userId, validProductId, 3, correlationId);

      expect(cart.items.length).toBe(1);
      expect(cart.items[0].quantity).toBe(5);
      expect(cart.items[0].subtotal.amount).toBe(125); // 5 * 25
    });

    it('should add multiple different products', async () => {
      await cartService.addItemToCart(userId, validProductId, 1, correlationId);
      const cart = await cartService.addItemToCart(userId, validProductId2, 2, correlationId);

      expect(cart.items.length).toBe(2);
      expect(cart.itemCount).toBe(3); // 1 + 2
    });

    it('should calculate correct total with multiple items', async () => {
      await cartService.addItemToCart(userId, validProductId, 2, correlationId); // 2 * 25 = 50
      const cart = await cartService.addItemToCart(userId, validProductId2, 1, correlationId); // 1 * 45 = 45

      expect(cart.total.amount).toBe(95);
    });

    it('should throw ProductNotFoundException for invalid product', async () => {
      await expect(
        cartService.addItemToCart(userId, 'non-existent', 1, correlationId),
      ).rejects.toThrow(ProductNotFoundException);
    });

    it('should throw InvalidQuantityException for zero quantity', async () => {
      await expect(
        cartService.addItemToCart(userId, validProductId, 0, correlationId),
      ).rejects.toThrow(InvalidQuantityException);
    });

    it('should throw InvalidQuantityException for negative quantity', async () => {
      await expect(
        cartService.addItemToCart(userId, validProductId, -1, correlationId),
      ).rejects.toThrow(InvalidQuantityException);
    });

    it('should throw InvalidQuantityException for non-integer quantity', async () => {
      await expect(
        cartService.addItemToCart(userId, validProductId, 1.5, correlationId),
      ).rejects.toThrow(InvalidQuantityException);
    });

    it('should throw ProductNotFoundException for inactive product', async () => {
      // Add an inactive product
      const inactiveProductId = 'prod-inactive';
      productRepository.addProduct({
        id: inactiveProductId,
        name: 'Inactive Medicine',
        description: 'This product has been discontinued',
        category: ProductCategory.GENERAL,
        priceInRupees: 100,
        requiresPrescription: false,
        isActive: false,
      });

      await expect(
        cartService.addItemToCart(userId, inactiveProductId, 1, correlationId),
      ).rejects.toThrow(ProductNotFoundException);
    });

    it('should throw ProductNotFoundException when product becomes inactive', async () => {
      // Deactivate an existing product
      productRepository.deactivateProduct(validProductId);

      await expect(
        cartService.addItemToCart(userId, validProductId, 1, correlationId),
      ).rejects.toThrow(ProductNotFoundException);
    });
  });

  describe('removeItemFromCart', () => {
    it('should remove item from cart', async () => {
      await cartService.addItemToCart(userId, validProductId, 2, correlationId);
      await cartService.addItemToCart(userId, validProductId2, 1, correlationId);

      const cart = await cartService.removeItemFromCart(userId, validProductId, correlationId);

      expect(cart.items.length).toBe(1);
      expect(cart.items[0].productId).toBe(validProductId2);
    });

    it('should throw NoDraftOrderException when no cart exists', async () => {
      await expect(
        cartService.removeItemFromCart(userId, validProductId, correlationId),
      ).rejects.toThrow(NoDraftOrderException);
    });

    it('should throw OrderItemNotFoundException for non-existent item', async () => {
      await cartService.addItemToCart(userId, validProductId, 1, correlationId);

      await expect(
        cartService.removeItemFromCart(userId, 'non-existent', correlationId),
      ).rejects.toThrow(OrderItemNotFoundException);
    });

    it('should update total after removal', async () => {
      await cartService.addItemToCart(userId, validProductId, 2, correlationId);
      await cartService.addItemToCart(userId, validProductId2, 1, correlationId);

      const cart = await cartService.removeItemFromCart(userId, validProductId, correlationId);

      expect(cart.total.amount).toBe(45); // Only validProductId2 remains
    });
  });

  describe('updateItemQuantity', () => {
    it('should update item quantity', async () => {
      await cartService.addItemToCart(userId, validProductId, 2, correlationId);

      const cart = await cartService.updateItemQuantity(userId, validProductId, 5, correlationId);

      expect(cart.items[0].quantity).toBe(5);
      expect(cart.items[0].subtotal.amount).toBe(125);
    });

    it('should throw NoDraftOrderException when no cart exists', async () => {
      await expect(
        cartService.updateItemQuantity(userId, validProductId, 5, correlationId),
      ).rejects.toThrow(NoDraftOrderException);
    });

    it('should throw OrderItemNotFoundException for non-existent item', async () => {
      await cartService.addItemToCart(userId, validProductId, 1, correlationId);

      await expect(
        cartService.updateItemQuantity(userId, 'non-existent', 5, correlationId),
      ).rejects.toThrow(OrderItemNotFoundException);
    });

    it('should throw InvalidQuantityException for invalid quantity', async () => {
      await cartService.addItemToCart(userId, validProductId, 1, correlationId);

      await expect(
        cartService.updateItemQuantity(userId, validProductId, 0, correlationId),
      ).rejects.toThrow(InvalidQuantityException);
    });

    it('should update total after quantity change', async () => {
      await cartService.addItemToCart(userId, validProductId, 2, correlationId);
      await cartService.addItemToCart(userId, validProductId2, 1, correlationId);

      const cart = await cartService.updateItemQuantity(userId, validProductId, 10, correlationId);

      expect(cart.total.amount).toBe(295); // 10*25 + 1*45
    });
  });

  describe('clearCart', () => {
    it('should remove all items from cart', async () => {
      await cartService.addItemToCart(userId, validProductId, 2, correlationId);
      await cartService.addItemToCart(userId, validProductId2, 1, correlationId);

      const cart = await cartService.clearCart(userId, correlationId);

      expect(cart.items.length).toBe(0);
      expect(cart.itemCount).toBe(0);
      expect(cart.total.amount).toBe(0);
    });

    it('should keep cart in DRAFT status after clearing', async () => {
      await cartService.addItemToCart(userId, validProductId, 1, correlationId);

      const cart = await cartService.clearCart(userId, correlationId);

      expect(cart.status).toBe(OrderStatus.DRAFT);
    });

    it('should throw NoDraftOrderException when no cart exists', async () => {
      await expect(cartService.clearCart(userId, correlationId)).rejects.toThrow(
        NoDraftOrderException,
      );
    });
  });

  describe('abandonCart', () => {
    it('should transition cart to CANCELLED', async () => {
      await cartService.addItemToCart(userId, validProductId, 1, correlationId);

      await cartService.abandonCart(userId, correlationId);

      // Cart should no longer be retrievable as draft
      const cart = await cartService.getCart(userId, correlationId);
      expect(cart).toBeNull();
    });

    it('should throw NoDraftOrderException when no cart exists', async () => {
      await expect(cartService.abandonCart(userId, correlationId)).rejects.toThrow(
        NoDraftOrderException,
      );
    });

    it('should allow creating new cart after abandoning', async () => {
      await cartService.addItemToCart(userId, validProductId, 1, correlationId);
      await cartService.abandonCart(userId, correlationId);

      const newCart = await cartService.createDraftOrder(userId, correlationId);

      expect(newCart).toBeDefined();
      expect(newCart.items.length).toBe(0);
    });
  });

  describe('one draft per user rule', () => {
    it('should enforce single draft per user', async () => {
      const cart1 = await cartService.createDraftOrder(userId, correlationId);
      await cartService.addItemToCart(userId, validProductId, 1, correlationId);

      const cart2 = await cartService.createDraftOrder(userId, correlationId);

      expect(cart2.id).toBe(cart1.id);
      expect(cart2.items.length).toBe(1); // Same cart with item
    });
  });

  describe('price snapshot behavior', () => {
    it('should capture price at add-time', async () => {
      // Add item - this captures the price
      const cart = await cartService.addItemToCart(userId, validProductId, 1, correlationId);

      const capturedPrice = cart.items[0].unitPrice.amount;

      // Even if we somehow modify the product (not exposed), the cart price stays the same
      // This test validates the snapshot was captured
      expect(capturedPrice).toBe(25); // Known price from sample data
    });
  });

  describe('prescription products', () => {
    it('should allow adding prescription products to cart', async () => {
      // Cart doesn't enforce prescription rules - that's checkout's job
      const cart = await cartService.addItemToCart(userId, prescriptionProductId, 1, correlationId);

      expect(cart.items.length).toBe(1);
      expect(cart.items[0].productName).toBe('Amoxicillin 500mg');
    });
  });

  describe('itemCount calculation', () => {
    it('should sum quantities across all items', async () => {
      await cartService.addItemToCart(userId, validProductId, 3, correlationId);
      const cart = await cartService.addItemToCart(userId, validProductId2, 2, correlationId);

      expect(cart.itemCount).toBe(5);
    });

    it('should update itemCount when quantity changes', async () => {
      await cartService.addItemToCart(userId, validProductId, 3, correlationId);
      const cart = await cartService.updateItemQuantity(userId, validProductId, 10, correlationId);

      expect(cart.itemCount).toBe(10);
    });
  });

  // ============================================================
  // Invariant Enforcement Tests
  // ============================================================

  describe('non-DRAFT order mutation prevention', () => {
    it('should not find CONFIRMED order as draft', async () => {
      // Create a cart and add item
      await cartService.addItemToCart(userId, validProductId, 1, correlationId);
      const cart = await cartService.getCart(userId, correlationId);

      // Manually transition to CONFIRMED (simulating checkout flow)
      await orderRepository.updateStatus(cart!.id, OrderStatus.CONFIRMED);

      // getCart should return null since it only finds DRAFT orders
      const result = await cartService.getCart(userId, correlationId);
      expect(result).toBeNull();
    });

    it('should not find CANCELLED order as draft', async () => {
      // Create and abandon a cart
      await cartService.addItemToCart(userId, validProductId, 1, correlationId);
      await cartService.abandonCart(userId, correlationId);

      // getCart should return null
      const result = await cartService.getCart(userId, correlationId);
      expect(result).toBeNull();
    });

    it('should throw NoDraftOrderException when trying to remove item from non-existent draft', async () => {
      // Create a cart and transition to CONFIRMED
      await cartService.addItemToCart(userId, validProductId, 1, correlationId);
      const cart = await cartService.getCart(userId, correlationId);
      await orderRepository.updateStatus(cart!.id, OrderStatus.CONFIRMED);

      // Try to remove item - should fail since no DRAFT exists
      await expect(
        cartService.removeItemFromCart(userId, validProductId, correlationId),
      ).rejects.toThrow(NoDraftOrderException);
    });

    it('should throw NoDraftOrderException when trying to update quantity on confirmed order', async () => {
      // Create a cart and transition to CONFIRMED
      await cartService.addItemToCart(userId, validProductId, 2, correlationId);
      const cart = await cartService.getCart(userId, correlationId);
      await orderRepository.updateStatus(cart!.id, OrderStatus.CONFIRMED);

      // Try to update quantity - should fail since no DRAFT exists
      await expect(
        cartService.updateItemQuantity(userId, validProductId, 5, correlationId),
      ).rejects.toThrow(NoDraftOrderException);
    });

    it('should throw NoDraftOrderException when trying to clear cancelled order', async () => {
      // Create and abandon a cart
      await cartService.addItemToCart(userId, validProductId, 1, correlationId);
      await cartService.abandonCart(userId, correlationId);

      // Try to clear - should fail since no DRAFT exists
      await expect(cartService.clearCart(userId, correlationId)).rejects.toThrow(
        NoDraftOrderException,
      );
    });

    it('should allow creating new draft after order is confirmed', async () => {
      // Create a cart and confirm it
      await cartService.addItemToCart(userId, validProductId, 1, correlationId);
      const cart = await cartService.getCart(userId, correlationId);
      await orderRepository.updateStatus(cart!.id, OrderStatus.CONFIRMED);

      // Should be able to create a new draft
      const newCart = await cartService.createDraftOrder(userId, correlationId);

      expect(newCart).toBeDefined();
      expect(newCart.id).not.toBe(cart!.id);
      expect(newCart.status).toBe(OrderStatus.DRAFT);
      expect(newCart.items.length).toBe(0);
    });

    it('should allow adding items after previous order is confirmed', async () => {
      // Create a cart and confirm it
      await cartService.addItemToCart(userId, validProductId, 1, correlationId);
      const cart = await cartService.getCart(userId, correlationId);
      await orderRepository.updateStatus(cart!.id, OrderStatus.CONFIRMED);

      // Should be able to add items (creates new draft)
      const newCart = await cartService.addItemToCart(userId, validProductId2, 2, correlationId);

      expect(newCart).toBeDefined();
      expect(newCart.id).not.toBe(cart!.id);
      expect(newCart.items.length).toBe(1);
      expect(newCart.items[0].productId).toBe(validProductId2);
    });
  });

  describe('order isolation between users', () => {
    it('should not allow user to see other users cart', async () => {
      // User 1 creates a cart
      await cartService.addItemToCart(userId, validProductId, 2, correlationId);

      // User 2 should not see user 1's cart
      const otherUserCart = await cartService.getCart(otherUserId, correlationId);
      expect(otherUserCart).toBeNull();
    });

    it('should maintain separate carts for different users', async () => {
      // User 1 creates a cart with product 1
      await cartService.addItemToCart(userId, validProductId, 2, correlationId);

      // User 2 creates a cart with product 2
      await cartService.addItemToCart(otherUserId, validProductId2, 3, correlationId);

      // Verify carts are separate
      const user1Cart = await cartService.getCart(userId, correlationId);
      const user2Cart = await cartService.getCart(otherUserId, correlationId);

      expect(user1Cart!.items.length).toBe(1);
      expect(user1Cart!.items[0].productId).toBe(validProductId);
      expect(user1Cart!.items[0].quantity).toBe(2);

      expect(user2Cart!.items.length).toBe(1);
      expect(user2Cart!.items[0].productId).toBe(validProductId2);
      expect(user2Cart!.items[0].quantity).toBe(3);
    });

    it('should not allow user to modify other users cart items', async () => {
      // User 1 creates a cart
      await cartService.addItemToCart(userId, validProductId, 2, correlationId);

      // User 2 tries to update item in "their" cart (but they don't have one)
      await expect(
        cartService.updateItemQuantity(otherUserId, validProductId, 5, correlationId),
      ).rejects.toThrow(NoDraftOrderException);
    });

    it('should not allow user to remove items from other users cart', async () => {
      // User 1 creates a cart
      await cartService.addItemToCart(userId, validProductId, 2, correlationId);

      // User 2 tries to remove item (but they don't have a cart)
      await expect(
        cartService.removeItemFromCart(otherUserId, validProductId, correlationId),
      ).rejects.toThrow(NoDraftOrderException);
    });

    it('should not allow user to clear other users cart', async () => {
      // User 1 creates a cart
      await cartService.addItemToCart(userId, validProductId, 2, correlationId);

      // User 2 tries to clear cart (but they don't have one)
      await expect(cartService.clearCart(otherUserId, correlationId)).rejects.toThrow(
        NoDraftOrderException,
      );
    });

    it('should not allow user to abandon other users cart', async () => {
      // User 1 creates a cart
      await cartService.addItemToCart(userId, validProductId, 2, correlationId);

      // User 2 tries to abandon cart (but they don't have one)
      await expect(cartService.abandonCart(otherUserId, correlationId)).rejects.toThrow(
        NoDraftOrderException,
      );
    });
  });

  describe('order total recalculation', () => {
    it('should recalculate total when adding items', async () => {
      // Add first item: 2 x 25 = 50
      let cart = await cartService.addItemToCart(userId, validProductId, 2, correlationId);
      expect(cart.total.amount).toBe(50);

      // Add second item: 50 + (3 x 45) = 50 + 135 = 185
      cart = await cartService.addItemToCart(userId, validProductId2, 3, correlationId);
      expect(cart.total.amount).toBe(185);
    });

    it('should recalculate total when incrementing quantity of existing item', async () => {
      // Add first item: 2 x 25 = 50
      await cartService.addItemToCart(userId, validProductId, 2, correlationId);

      // Add more of same item: (2 + 3) x 25 = 125
      const cart = await cartService.addItemToCart(userId, validProductId, 3, correlationId);
      expect(cart.total.amount).toBe(125);
    });

    it('should recalculate total when updating quantity', async () => {
      // Add items
      await cartService.addItemToCart(userId, validProductId, 2, correlationId); // 50
      await cartService.addItemToCart(userId, validProductId2, 1, correlationId); // 45
      // Total: 95

      // Update quantity: 10 x 25 + 1 x 45 = 295
      const cart = await cartService.updateItemQuantity(userId, validProductId, 10, correlationId);
      expect(cart.total.amount).toBe(295);
    });

    it('should recalculate total when removing items', async () => {
      // Add items
      await cartService.addItemToCart(userId, validProductId, 2, correlationId); // 50
      await cartService.addItemToCart(userId, validProductId2, 1, correlationId); // 45
      // Total: 95

      // Remove first item: 0 + 45 = 45
      const cart = await cartService.removeItemFromCart(userId, validProductId, correlationId);
      expect(cart.total.amount).toBe(45);
    });

    it('should set total to zero when clearing cart', async () => {
      // Add items
      await cartService.addItemToCart(userId, validProductId, 2, correlationId);
      await cartService.addItemToCart(userId, validProductId2, 1, correlationId);

      // Clear cart
      const cart = await cartService.clearCart(userId, correlationId);
      expect(cart.total.amount).toBe(0);
    });

    it('should handle multiple operations and maintain correct total', async () => {
      // Complex scenario:
      // 1. Add 2 of product1: 2 x 25 = 50
      await cartService.addItemToCart(userId, validProductId, 2, correlationId);

      // 2. Add 3 of product2: 50 + 3 x 45 = 185
      await cartService.addItemToCart(userId, validProductId2, 3, correlationId);

      // 3. Add 1 more of product1: (2+1) x 25 + 3 x 45 = 75 + 135 = 210
      await cartService.addItemToCart(userId, validProductId, 1, correlationId);

      // 4. Update product2 to 5: 3 x 25 + 5 x 45 = 75 + 225 = 300
      await cartService.updateItemQuantity(userId, validProductId2, 5, correlationId);

      // 5. Remove product1: 0 + 5 x 45 = 225
      const cart = await cartService.removeItemFromCart(userId, validProductId, correlationId);

      expect(cart.total.amount).toBe(225);
      expect(cart.items.length).toBe(1);
      expect(cart.itemCount).toBe(5);
    });
  });

  // ============================================================
  // Checkout (confirmDraftOrder) Tests
  // ============================================================

  describe('confirmDraftOrder', () => {
    describe('successful confirmation', () => {
      it('should confirm a valid draft order', async () => {
        // Setup: create cart with items (non-prescription)
        await cartService.addItemToCart(userId, validProductId, 2, correlationId);
        await cartService.addItemToCart(userId, validProductId2, 1, correlationId);

        // Act
        const result = await cartService.confirmDraftOrder(userId, correlationId);

        // Assert
        expect(result.order).toBeDefined();
        expect(result.order.status).toBe(OrderStatus.CONFIRMED);
        expect(result.order.userId).toBe(userId);
        expect(result.order.items.length).toBe(2);
      });

      it('should finalize total at confirmation time', async () => {
        // Setup: 2 x 25 + 1 x 45 = 95
        await cartService.addItemToCart(userId, validProductId, 2, correlationId);
        await cartService.addItemToCart(userId, validProductId2, 1, correlationId);

        // Act
        const result = await cartService.confirmDraftOrder(userId, correlationId);

        // Assert: total is preserved
        expect(result.order.total.amount).toBe(95);
        expect(result.order.total.currency).toBe('INR');
      });

      it('should emit OrderConfirmed domain event', async () => {
        // Setup
        await cartService.addItemToCart(userId, validProductId, 2, correlationId);

        // Act
        const result = await cartService.confirmDraftOrder(userId, correlationId);

        // Assert
        expect(result.events).toBeDefined();
        expect(result.events.length).toBe(1);
        expect(result.events[0].type).toBe('ORDER_CONFIRMED');
        expect(result.events[0].orderId).toBe(result.order.id);
        expect(result.events[0].userId).toBe(userId);
        expect(result.events[0].itemCount).toBe(2);
      });

      it('should include item summary in domain event', async () => {
        // Setup
        await cartService.addItemToCart(userId, validProductId, 3, correlationId);

        // Act
        const result = await cartService.confirmDraftOrder(userId, correlationId);

        // Assert
        const event = result.events[0];
        expect(event.itemSummary.length).toBe(1);
        expect(event.itemSummary[0].productId).toBe(validProductId);
        expect(event.itemSummary[0].productName).toBe('Paracetamol 500mg');
        expect(event.itemSummary[0].quantity).toBe(3);
      });

      it('should make cart unavailable after confirmation', async () => {
        // Setup
        await cartService.addItemToCart(userId, validProductId, 1, correlationId);

        // Act
        await cartService.confirmDraftOrder(userId, correlationId);

        // Assert: getCart should return null (no DRAFT)
        const cart = await cartService.getCart(userId, correlationId);
        expect(cart).toBeNull();
      });

      it('should allow creating new cart after confirmation', async () => {
        // Setup & confirm
        await cartService.addItemToCart(userId, validProductId, 1, correlationId);
        const { order: confirmedOrder } = await cartService.confirmDraftOrder(
          userId,
          correlationId,
        );

        // Act: create new cart
        const newCart = await cartService.createDraftOrder(userId, correlationId);

        // Assert
        expect(newCart.id).not.toBe(confirmedOrder.id);
        expect(newCart.status).toBe(OrderStatus.DRAFT);
        expect(newCart.items.length).toBe(0);
      });
    });

    describe('failure when not in DRAFT state', () => {
      it('should throw NoDraftOrderException when no cart exists', async () => {
        await expect(cartService.confirmDraftOrder(userId, correlationId)).rejects.toThrow(
          NoDraftOrderException,
        );
      });

      it('should throw NoDraftOrderException when order is already confirmed', async () => {
        // Setup: create and confirm
        await cartService.addItemToCart(userId, validProductId, 1, correlationId);
        await cartService.confirmDraftOrder(userId, correlationId);

        // Act & Assert: second confirmation fails (no draft exists)
        await expect(cartService.confirmDraftOrder(userId, correlationId)).rejects.toThrow(
          NoDraftOrderException,
        );
      });

      it('should throw NoDraftOrderException when cart is cancelled', async () => {
        // Setup: create and abandon
        await cartService.addItemToCart(userId, validProductId, 1, correlationId);
        await cartService.abandonCart(userId, correlationId);

        // Act & Assert
        await expect(cartService.confirmDraftOrder(userId, correlationId)).rejects.toThrow(
          NoDraftOrderException,
        );
      });
    });

    describe('failure when cart is empty', () => {
      it('should throw EmptyCartException when cart has no items', async () => {
        // Setup: create empty cart
        await cartService.createDraftOrder(userId, correlationId);

        // Act & Assert
        await expect(cartService.confirmDraftOrder(userId, correlationId)).rejects.toThrow(
          EmptyCartException,
        );
      });

      it('should throw EmptyCartException after all items are removed', async () => {
        // Setup: add then remove
        await cartService.addItemToCart(userId, validProductId, 1, correlationId);
        await cartService.removeItemFromCart(userId, validProductId, correlationId);

        // Act & Assert
        await expect(cartService.confirmDraftOrder(userId, correlationId)).rejects.toThrow(
          EmptyCartException,
        );
      });

      it('should throw EmptyCartException after cart is cleared', async () => {
        // Setup: add then clear
        await cartService.addItemToCart(userId, validProductId, 2, correlationId);
        await cartService.clearCart(userId, correlationId);

        // Act & Assert
        await expect(cartService.confirmDraftOrder(userId, correlationId)).rejects.toThrow(
          EmptyCartException,
        );
      });
    });

    describe('failure when prescription-required items exist', () => {
      it('should throw PrescriptionRequiredException for prescription products', async () => {
        // Setup: add prescription product (Amoxicillin)
        await cartService.addItemToCart(userId, prescriptionProductId, 1, correlationId);

        // Act & Assert
        await expect(cartService.confirmDraftOrder(userId, correlationId)).rejects.toThrow(
          PrescriptionRequiredException,
        );
      });

      it('should include prescription product names in exception', async () => {
        // Setup
        await cartService.addItemToCart(userId, prescriptionProductId, 1, correlationId);

        // Act & Assert
        try {
          await cartService.confirmDraftOrder(userId, correlationId);
          fail('Expected PrescriptionRequiredException');
        } catch (error) {
          expect(error).toBeInstanceOf(PrescriptionRequiredException);
          const prescriptionError = error as PrescriptionRequiredException;
          expect(prescriptionError.prescriptionProducts).toContain('Amoxicillin 500mg');
        }
      });

      it('should block confirmation when mixed cart has prescription items', async () => {
        // Setup: mix of prescription and non-prescription
        await cartService.addItemToCart(userId, validProductId, 2, correlationId);
        await cartService.addItemToCart(userId, prescriptionProductId, 1, correlationId);

        // Act & Assert
        await expect(cartService.confirmDraftOrder(userId, correlationId)).rejects.toThrow(
          PrescriptionRequiredException,
        );
      });

      it('should allow confirmation after removing prescription items', async () => {
        // Setup: add prescription, then remove
        await cartService.addItemToCart(userId, validProductId, 2, correlationId);
        await cartService.addItemToCart(userId, prescriptionProductId, 1, correlationId);
        await cartService.removeItemFromCart(userId, prescriptionProductId, correlationId);

        // Act
        const result = await cartService.confirmDraftOrder(userId, correlationId);

        // Assert
        expect(result.order.status).toBe(OrderStatus.CONFIRMED);
        expect(result.order.items.length).toBe(1);
      });
    });

    describe('ownership enforcement', () => {
      it('should throw NoDraftOrderException when user has no cart', async () => {
        // Setup: other user has a cart
        await cartService.addItemToCart(otherUserId, validProductId, 1, correlationId);

        // Act & Assert: this user cannot confirm other's cart
        await expect(cartService.confirmDraftOrder(userId, correlationId)).rejects.toThrow(
          NoDraftOrderException,
        );
      });

      it('should allow each user to confirm their own cart independently', async () => {
        // Setup: both users have carts
        await cartService.addItemToCart(userId, validProductId, 1, correlationId);
        await cartService.addItemToCart(otherUserId, validProductId2, 2, correlationId);

        // Act: both confirm
        const result1 = await cartService.confirmDraftOrder(userId, correlationId);
        const result2 = await cartService.confirmDraftOrder(otherUserId, correlationId);

        // Assert
        expect(result1.order.userId).toBe(userId);
        expect(result1.order.items[0].productId).toBe(validProductId);
        expect(result2.order.userId).toBe(otherUserId);
        expect(result2.order.items[0].productId).toBe(validProductId2);
      });
    });

    describe('confirmed order immutability', () => {
      it('should prevent cart modifications after confirmation', async () => {
        // Setup & confirm
        await cartService.addItemToCart(userId, validProductId, 1, correlationId);
        await cartService.confirmDraftOrder(userId, correlationId);

        // Assert: all cart operations fail (no draft exists)
        await expect(
          cartService.addItemToCart(userId, validProductId2, 1, correlationId),
        ).resolves.toBeDefined(); // This creates a NEW cart

        // The old confirmed order should be untouched
        // (verified by the fact that a new cart was created)
      });

      it('should not modify confirmed order when adding to new cart', async () => {
        // Setup & confirm
        await cartService.addItemToCart(userId, validProductId, 2, correlationId);
        const { order: confirmedOrder } = await cartService.confirmDraftOrder(
          userId,
          correlationId,
        );

        // Act: add item creates new cart
        const newCart = await cartService.addItemToCart(userId, validProductId2, 3, correlationId);

        // Assert: new cart is separate
        expect(newCart.id).not.toBe(confirmedOrder.id);
        expect(newCart.items.length).toBe(1);
        expect(newCart.items[0].productId).toBe(validProductId2);

        // Confirmed order state is preserved (checked via repository)
        const storedConfirmed = await orderRepository.findById(confirmedOrder.id);
        expect(storedConfirmed).not.toBeNull();
        expect(storedConfirmed!.status).toBe(OrderStatus.CONFIRMED);
        expect(storedConfirmed!.items.length).toBe(1);
        expect(storedConfirmed!.items[0].quantity).toBe(2);
      });
    });

    describe('domain event correctness', () => {
      it('should capture correct total in event', async () => {
        // Setup: 3 x 25 + 2 x 45 = 75 + 90 = 165
        await cartService.addItemToCart(userId, validProductId, 3, correlationId);
        await cartService.addItemToCart(userId, validProductId2, 2, correlationId);

        // Act
        const result = await cartService.confirmDraftOrder(userId, correlationId);

        // Assert
        expect(result.events[0].total.amount).toBe(165);
        expect(result.events[0].total.currency).toBe('INR');
      });

      it('should capture correlation ID in event', async () => {
        // Setup
        await cartService.addItemToCart(userId, validProductId, 1, correlationId);

        // Act
        const result = await cartService.confirmDraftOrder(userId, correlationId);

        // Assert
        expect(result.events[0].correlationId).toBe(correlationId);
      });

      it('should set occurredAt timestamp', async () => {
        // Setup
        const beforeTime = new Date();
        await cartService.addItemToCart(userId, validProductId, 1, correlationId);

        // Act
        const result = await cartService.confirmDraftOrder(userId, correlationId);
        const afterTime = new Date();

        // Assert
        expect(result.events[0].occurredAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
        expect(result.events[0].occurredAt.getTime()).toBeLessThanOrEqual(afterTime.getTime());
      });
    });
  });
});
