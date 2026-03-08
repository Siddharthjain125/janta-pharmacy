import { HttpStatus } from '@nestjs/common';
import { BusinessException } from '../../common/exceptions/business.exception';

/**
 * Order already has a payment intent
 */
export class PaymentIntentAlreadyExistsException extends BusinessException {
  constructor(orderId: string) {
    super(
      'PAYMENT_INTENT_ALREADY_EXISTS',
      `Order '${orderId}' already has a payment intent.`,
      HttpStatus.CONFLICT,
    );
  }
}

/**
 * Payment intent not found
 */
export class PaymentIntentNotFoundException extends BusinessException {
  constructor(paymentIntentId: string) {
    super('PAYMENT_INTENT_NOT_FOUND', `Payment intent '${paymentIntentId}' not found.`, HttpStatus.NOT_FOUND);
  }
}

/**
 * Payment intent is not in a state that allows the requested action
 */
export class PaymentIntentInvalidStateException extends BusinessException {
  constructor(paymentIntentId: string, reason: string) {
    super(
      'PAYMENT_INTENT_INVALID_STATE',
      `Payment intent '${paymentIntentId}': ${reason}`,
      HttpStatus.CONFLICT,
    );
  }
}
