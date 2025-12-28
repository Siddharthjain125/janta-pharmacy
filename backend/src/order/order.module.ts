import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderRepository } from './order.repository';

/**
 * Order Module
 *
 * Handles order management including:
 * - Order creation and processing
 * - Order status tracking
 * - Order history
 *
 * This module maintains its own data boundaries and
 * does not directly access other module's data.
 */
@Module({
  controllers: [OrderController],
  providers: [OrderService, OrderRepository],
  exports: [OrderService, OrderRepository],
})
export class OrderModule {}

