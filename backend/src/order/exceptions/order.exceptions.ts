import { HttpStatus } from '@nestjs/common';
import { BusinessException } from '../../common/exceptions/business.exception';

/**
 * Order not found exception
 */
export class OrderNotFoundException extends BusinessException {
  constructor(orderId: string) {
    super(
      'ORDER_NOT_FOUND',
      `Order with id '${orderId}' not found`,
      HttpStatus.NOT_FOUND,
    );
  }
}

/**
 * Unauthorized order access exception
 */
export class UnauthorizedOrderAccessException extends BusinessException {
  constructor() {
    super(
      'UNAUTHORIZED_ORDER_ACCESS',
      'You do not have permission to access this order',
      HttpStatus.FORBIDDEN,
    );
  }
}

/**
 * Invalid order state transition exception
 */
export class InvalidOrderStateException extends BusinessException {
  constructor(currentStatus: string, targetStatus: string) {
    super(
      'INVALID_ORDER_STATE',
      `Cannot transition order from '${currentStatus}' to '${targetStatus}'`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

