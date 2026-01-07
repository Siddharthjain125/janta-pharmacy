import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { CartController } from './cart.controller';
import { OrderService } from './order.service';
import { OrderQueryService } from './order-query.service';
import { CartService } from './cart.service';
import { ORDER_REPOSITORY } from './repositories/order-repository.interface';
import { InMemoryOrderRepository } from './repositories/in-memory-order.repository';
import { AuthModule } from '../auth/auth.module';
import { CatalogModule } from '../catalog/catalog.module';
// import { PrismaOrderRepository } from './repositories/prisma-order.repository';

/**
 * Order Module
 *
 * Handles order lifecycle, cart management, and order queries.
 *
 * Services:
 * - OrderService: Command-style state transitions
 * - OrderQueryService: Read-only queries (history, details)
 * - CartService: Cart (draft order) management
 *
 * Currently using InMemoryOrderRepository for development.
 * TODO: Switch to PrismaOrderRepository when database is configured:
 *
 * providers: [
 *   OrderService,
 *   OrderQueryService,
 *   CartService,
 *   {
 *     provide: ORDER_REPOSITORY,
 *     useClass: PrismaOrderRepository,
 *   },
 * ],
 */
@Module({
  imports: [
    AuthModule, // For JwtAuthGuard
    CatalogModule, // For product validation in CartService
  ],
  controllers: [OrderController, CartController],
  providers: [
    OrderService,
    OrderQueryService,
    CartService,
    {
      provide: ORDER_REPOSITORY,
      useClass: InMemoryOrderRepository,
    },
  ],
  exports: [OrderService, OrderQueryService, CartService],
})
export class OrderModule {}
