import { IsEnum } from 'class-validator';
import { PaymentMethod } from '../domain';

/**
 * Request body for POST /orders/:orderId/payment
 */
export class CreatePaymentDto {
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;
}
