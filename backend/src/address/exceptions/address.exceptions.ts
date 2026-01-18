import { HttpStatus } from '@nestjs/common';
import { BusinessException } from '../../common/exceptions/business.exception';

/**
 * Address not found exception
 */
export class AddressNotFoundException extends BusinessException {
  constructor(addressId: string) {
    super('ADDRESS_NOT_FOUND', `Address with id '${addressId}' not found`, HttpStatus.NOT_FOUND);
  }
}

/**
 * Unauthorized address access exception
 */
export class UnauthorizedAddressAccessException extends BusinessException {
  constructor() {
    super(
      'UNAUTHORIZED_ADDRESS_ACCESS',
      'You do not have permission to access this address',
      HttpStatus.FORBIDDEN,
    );
  }
}

/**
 * Default address update exception
 *
 * Thrown when a request would violate the default address invariant.
 */
export class InvalidDefaultAddressUpdateException extends BusinessException {
  constructor(message: string) {
    super('INVALID_DEFAULT_ADDRESS_UPDATE', message, HttpStatus.BAD_REQUEST);
  }
}
