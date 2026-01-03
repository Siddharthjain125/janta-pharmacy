import { HttpStatus } from '@nestjs/common';
import { BusinessException } from '../../common/exceptions/business.exception';

/**
 * User-specific domain exceptions
 *
 * All user-related errors extend BusinessException
 * to ensure consistent API error responses.
 */

/**
 * Thrown when a user is not found by ID or other identifier
 */
export class UserNotFoundException extends BusinessException {
  constructor(identifier: string, type: 'id' | 'phone' | 'email' = 'id') {
    super(
      `User not found with ${type}: ${identifier}`,
      'USER_NOT_FOUND',
      HttpStatus.NOT_FOUND,
    );
  }
}

/**
 * Thrown when attempting to create a user with a phone number that already exists
 */
export class PhoneNumberAlreadyExistsException extends BusinessException {
  constructor(phoneNumber: string) {
    // Don't expose the full phone number in error message
    const masked = phoneNumber.slice(0, 4) + '****' + phoneNumber.slice(-2);
    super(
      `Phone number ${masked} is already registered`,
      'PHONE_NUMBER_EXISTS',
      HttpStatus.CONFLICT,
    );
  }
}

/**
 * Thrown when attempting to set an email that already exists
 */
export class EmailAlreadyExistsException extends BusinessException {
  constructor() {
    super(
      'Email address is already registered',
      'EMAIL_EXISTS',
      HttpStatus.CONFLICT,
    );
  }
}

/**
 * Thrown when phone number format is invalid
 */
export class InvalidPhoneNumberException extends BusinessException {
  constructor() {
    super(
      'Invalid phone number format. Please include country code (e.g., +91XXXXXXXXXX)',
      'INVALID_PHONE_NUMBER',
      HttpStatus.BAD_REQUEST,
    );
  }
}

/**
 * Thrown when attempting an action on a user with incompatible status
 */
export class InvalidUserStatusException extends BusinessException {
  constructor(action: string, currentStatus: string) {
    super(
      `Cannot ${action}: user account is ${currentStatus.toLowerCase()}`,
      'INVALID_USER_STATUS',
      HttpStatus.FORBIDDEN,
    );
  }
}

/**
 * Thrown when a user account is suspended
 */
export class UserSuspendedException extends BusinessException {
  constructor() {
    super(
      'User account is suspended. Please contact support.',
      'USER_SUSPENDED',
      HttpStatus.FORBIDDEN,
    );
  }
}

/**
 * Thrown when a user account is deactivated
 */
export class UserDeactivatedException extends BusinessException {
  constructor() {
    super(
      'User account is deactivated',
      'USER_DEACTIVATED',
      HttpStatus.FORBIDDEN,
    );
  }
}

