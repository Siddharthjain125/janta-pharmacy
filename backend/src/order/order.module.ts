import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { ORDER_REPOSITORY } from './repositories/order-repository.interface';
import { InMemoryOrderRepository } from './repositories/in-memory-order.repository';
// import { PrismaOrderRepository } from './repositories/prisma-order.repository';

/**
 * Order Module
 * 
 * Currently using InMemoryOrderRepository for development.
 * TODO: Switch to PrismaOrderRepository when database is configured:
 * 
 * providers: [
 *   OrderService,
 *   {
 *     provide: ORDER_REPOSITORY,
 *     useClass: PrismaOrderRepository,
 *   },
 * ],
 */
@Module({
  controllers: [OrderController],
  providers: [
    OrderService,
    {
      provide: ORDER_REPOSITORY,
      useClass: InMemoryOrderRepository,
    },
  ],
  exports: [OrderService],
})
export class OrderModule {}
