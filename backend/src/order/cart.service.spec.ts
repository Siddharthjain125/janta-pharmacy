import { CartService } from './cart.service';
import { InMemoryOrderRepository } from './repositories/in-memory-order.repository';
import { CatalogQueryService } from '../catalog/catalog-query.service';
import { InMemoryProductRepository } from '../catalog/repositories/in-memory-product.repository';
import { OrderStatus } from './domain';
import {
  NoDraftOrderException,
  OrderItemNotFoundException,
  InvalidQuantityException,
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
      await expect(
        cartService.getCartOrFail(userId, correlationId),
      ).rejects.toThrow(NoDraftOrderException);
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
      const cart = await cartService.addItemToCart(
        userId,
        validProductId,
        1,
        correlationId,
      );

      expect(cart).toBeDefined();
      expect(cart.status).toBe(OrderStatus.DRAFT);
      expect(cart.items.length).toBe(1);
    });

    it('should add item with correct product snapshot', async () => {
      const cart = await cartService.addItemToCart(
        userId,
        validProductId,
        2,
        correlationId,
      );

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
      const cart = await cartService.addItemToCart(
        userId,
        validProductId,
        3,
        correlationId,
      );

      expect(cart.items.length).toBe(1);
      expect(cart.items[0].quantity).toBe(5);
      expect(cart.items[0].subtotal.amount).toBe(125); // 5 * 25
    });

    it('should add multiple different products', async () => {
      await cartService.addItemToCart(userId, validProductId, 1, correlationId);
      const cart = await cartService.addItemToCart(
        userId,
        validProductId2,
        2,
        correlationId,
      );

      expect(cart.items.length).toBe(2);
      expect(cart.itemCount).toBe(3); // 1 + 2
    });

    it('should calculate correct total with multiple items', async () => {
      await cartService.addItemToCart(userId, validProductId, 2, correlationId); // 2 * 25 = 50
      const cart = await cartService.addItemToCart(
        userId,
        validProductId2,
        1,
        correlationId,
      ); // 1 * 45 = 45

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
  });

  describe('removeItemFromCart', () => {
    it('should remove item from cart', async () => {
      await cartService.addItemToCart(userId, validProductId, 2, correlationId);
      await cartService.addItemToCart(userId, validProductId2, 1, correlationId);

      const cart = await cartService.removeItemFromCart(
        userId,
        validProductId,
        correlationId,
      );

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

      const cart = await cartService.removeItemFromCart(
        userId,
        validProductId,
        correlationId,
      );

      expect(cart.total.amount).toBe(45); // Only validProductId2 remains
    });
  });

  describe('updateItemQuantity', () => {
    it('should update item quantity', async () => {
      await cartService.addItemToCart(userId, validProductId, 2, correlationId);

      const cart = await cartService.updateItemQuantity(
        userId,
        validProductId,
        5,
        correlationId,
      );

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

      const cart = await cartService.updateItemQuantity(
        userId,
        validProductId,
        10,
        correlationId,
      );

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
      await expect(
        cartService.clearCart(userId, correlationId),
      ).rejects.toThrow(NoDraftOrderException);
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
      await expect(
        cartService.abandonCart(userId, correlationId),
      ).rejects.toThrow(NoDraftOrderException);
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
      const cart = await cartService.addItemToCart(
        userId,
        validProductId,
        1,
        correlationId,
      );

      const capturedPrice = cart.items[0].unitPrice.amount;

      // Even if we somehow modify the product (not exposed), the cart price stays the same
      // This test validates the snapshot was captured
      expect(capturedPrice).toBe(25); // Known price from sample data
    });
  });

  describe('prescription products', () => {
    it('should allow adding prescription products to cart', async () => {
      // Cart doesn't enforce prescription rules - that's checkout's job
      const cart = await cartService.addItemToCart(
        userId,
        prescriptionProductId,
        1,
        correlationId,
      );

      expect(cart.items.length).toBe(1);
      expect(cart.items[0].productName).toBe('Amoxicillin 500mg');
    });
  });

  describe('itemCount calculation', () => {
    it('should sum quantities across all items', async () => {
      await cartService.addItemToCart(userId, validProductId, 3, correlationId);
      const cart = await cartService.addItemToCart(
        userId,
        validProductId2,
        2,
        correlationId,
      );

      expect(cart.itemCount).toBe(5);
    });

    it('should update itemCount when quantity changes', async () => {
      await cartService.addItemToCart(userId, validProductId, 3, correlationId);
      const cart = await cartService.updateItemQuantity(
        userId,
        validProductId,
        10,
        correlationId,
      );

      expect(cart.itemCount).toBe(10);
    });
  });
});

