import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { ApiResponse } from '../common/api/api-response';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/interfaces/auth-user.interface';
import {
  CartResponseDto,
  AddToCartRequestDto,
  UpdateCartItemRequestDto,
  toCartResponseDto,
} from './dto/cart.dto';
import { logWithCorrelation } from '../common/logging/logger';

/**
 * Cart Controller
 *
 * Exposes HTTP endpoints for cart (draft order) management.
 * All routes are authenticated - user ID comes from JWT token.
 *
 * Design principles:
 * - Thin controller - all business logic in CartService
 * - No direct userId from client - extracted from auth context
 * - Domain errors bubble to global error handler
 * - Commands are logged with correlation IDs
 *
 * Route: /api/v1/cart
 */
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // ============================================================
  // QUERIES
  // ============================================================

  /**
   * Get current user's cart
   * GET /api/v1/cart
   *
   * Returns the user's active draft order, or null if none exists.
   */
  @Get()
  async getCart(
    @CurrentUser() user: AuthUser,
    @Headers('x-correlation-id') correlationId: string,
  ): Promise<ApiResponse<CartResponseDto | null>> {
    logWithCorrelation('DEBUG', correlationId, 'Fetching cart', 'CartController', {
      userId: user.id,
    });

    const cart = await this.cartService.getCart(user.id, correlationId);

    if (!cart) {
      return ApiResponse.success(null, 'No active cart');
    }

    return ApiResponse.success(toCartResponseDto(cart), 'Cart retrieved successfully');
  }

  // ============================================================
  // COMMANDS
  // ============================================================

  /**
   * Create or get existing cart
   * POST /api/v1/cart
   *
   * Creates a new draft order for the user, or returns existing one.
   * Idempotent - safe to call multiple times.
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  async createCart(
    @CurrentUser() user: AuthUser,
    @Headers('x-correlation-id') correlationId: string,
  ): Promise<ApiResponse<CartResponseDto>> {
    logWithCorrelation('INFO', correlationId, 'Creating/retrieving cart', 'CartController', {
      userId: user.id,
    });

    const cart = await this.cartService.createDraftOrder(user.id, correlationId);

    return ApiResponse.success(toCartResponseDto(cart), 'Cart ready');
  }

  /**
   * Add item to cart
   * POST /api/v1/cart/items
   *
   * Adds a product to the cart with specified quantity.
   * If product already exists in cart, quantity is incremented.
   * Creates cart automatically if none exists.
   */
  @Post('items')
  @HttpCode(HttpStatus.OK)
  async addItem(
    @CurrentUser() user: AuthUser,
    @Body() dto: AddToCartRequestDto,
    @Headers('x-correlation-id') correlationId: string,
  ): Promise<ApiResponse<CartResponseDto>> {
    logWithCorrelation('INFO', correlationId, 'Adding item to cart', 'CartController', {
      userId: user.id,
      productId: dto.productId,
      quantity: dto.quantity,
    });

    const cart = await this.cartService.addItemToCart(
      user.id,
      dto.productId,
      dto.quantity,
      correlationId,
    );

    return ApiResponse.success(toCartResponseDto(cart), 'Item added to cart');
  }

  /**
   * Update item quantity
   * PATCH /api/v1/cart/items/:productId
   *
   * Updates the quantity of an existing item in the cart.
   * Item must exist in cart.
   */
  @Patch('items/:productId')
  @HttpCode(HttpStatus.OK)
  async updateItemQuantity(
    @CurrentUser() user: AuthUser,
    @Param('productId') productId: string,
    @Body() dto: UpdateCartItemRequestDto,
    @Headers('x-correlation-id') correlationId: string,
  ): Promise<ApiResponse<CartResponseDto>> {
    logWithCorrelation('INFO', correlationId, 'Updating cart item quantity', 'CartController', {
      userId: user.id,
      productId,
      newQuantity: dto.quantity,
    });

    const cart = await this.cartService.updateItemQuantity(
      user.id,
      productId,
      dto.quantity,
      correlationId,
    );

    return ApiResponse.success(toCartResponseDto(cart), 'Item quantity updated');
  }

  /**
   * Remove item from cart
   * DELETE /api/v1/cart/items/:productId
   *
   * Removes an item entirely from the cart.
   * Item must exist in cart.
   */
  @Delete('items/:productId')
  @HttpCode(HttpStatus.OK)
  async removeItem(
    @CurrentUser() user: AuthUser,
    @Param('productId') productId: string,
    @Headers('x-correlation-id') correlationId: string,
  ): Promise<ApiResponse<CartResponseDto>> {
    logWithCorrelation('INFO', correlationId, 'Removing item from cart', 'CartController', {
      userId: user.id,
      productId,
    });

    const cart = await this.cartService.removeItemFromCart(user.id, productId, correlationId);

    return ApiResponse.success(toCartResponseDto(cart), 'Item removed from cart');
  }
}
