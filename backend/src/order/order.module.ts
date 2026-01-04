import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CartService } from './cart.service';
import { ORDER_REPOSITORY } from './repositories/order-repository.interface';
import { InMemoryOrderRepository } from './repositories/in-memory-order.repository';
import { AuthModule } from '../auth/auth.module';
import { CatalogModule } from '../catalog/catalog.module';
// import { PrismaOrderRepository } from './repositories/prisma-order.repository';

/**
 * Order Module
 *
 * Handles order lifecycle and cart management.
 *
 * Currently using InMemoryOrderRepository for development.
 * TODO: Switch to PrismaOrderRepository when database is configured:
 *
 * providers: [
 *   OrderService,
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
  controllers: [OrderController],
  providers: [
    OrderService,
    CartService,
    {
      provide: ORDER_REPOSITORY,
      useClass: InMemoryOrderRepository,
    },
  ],
  exports: [OrderService, CartService],
})
export class OrderModule {}
