import { Module, forwardRef } from '@nestjs/common';
import { OrderController } from './order.controller';
import { CartController } from './cart.controller';
import { OrderService } from './order.service';
import { OrderQueryService } from './order-query.service';
import { CartService } from './cart.service';
import { ORDER_REPOSITORY } from './repositories/order-repository.interface';
import { OrderRepositoryProvider } from '../database/repository.providers';
import { AuthModule } from '../auth/auth.module';
import { CatalogModule } from '../catalog/catalog.module';
import { ComplianceModule } from '../compliance/compliance.module';

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
 * Repository Selection:
 * - Uses REPOSITORY_TYPE env var or auto-detects from DATABASE_URL
 * - 'memory': InMemoryOrderRepository (tests, dev without DB)
 * - 'prisma': PrismaOrderRepository (production, dev with DB)
 */
@Module({
  imports: [
    AuthModule, // For JwtAuthGuard
    CatalogModule, // For product validation in CartService
    forwardRef(() => ComplianceModule), // Fulfilment gate (ADR-0055)
  ],
  controllers: [OrderController, CartController],
  providers: [OrderService, OrderQueryService, CartService, OrderRepositoryProvider],
  exports: [OrderService, OrderQueryService, CartService, ORDER_REPOSITORY],
})
export class OrderModule {}
