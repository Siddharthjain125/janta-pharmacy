import { Module, forwardRef } from '@nestjs/common';
import { PaymentIntentService } from './payment-intent.service';
import { PaymentAdminController } from './payment-admin.controller';
import { PaymentIntentRepositoryProvider } from '../database/repository.providers';
import { AuthModule } from '../auth/auth.module';
import { OrderModule } from '../order/order.module';

/**
 * Payment Module (Phase 6 — manual payment v1)
 *
 * PaymentIntent: one per order. COD → VERIFIED; UPI → PENDING → SUBMITTED → VERIFIED (admin).
 * User APIs are on OrderController (POST :id/payment, POST :id/payment/upi-proof).
 * Admin APIs: GET /admin/payments/pending, POST /admin/payments/:id/verify, POST /admin/payments/:id/reject.
 */
@Module({
  imports: [AuthModule, forwardRef(() => OrderModule)],
  controllers: [PaymentAdminController],
  providers: [PaymentIntentService, PaymentIntentRepositoryProvider],
  exports: [PaymentIntentService],
})
export class PaymentModule {}
