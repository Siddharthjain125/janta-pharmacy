import { BusinessException } from '../../common/exceptions/business.exception';

/**
 * Auth Domain Exceptions
 *
 * Clear, specific errors for authentication failures.
 * These are caught by the global exception filter.
 */

/**
 * Thrown when phone number is already registered
 */
export class PhoneNumberAlreadyRegisteredException extends BusinessException {
  constructor(phoneNumber: string) {
    super(
      `Phone number ${maskPhoneNumber(phoneNumber)} is already registered`,
      'AUTH_PHONE_ALREADY_EXISTS',
      409, // Conflict
    );
  }
}

/**
 * Thrown when email is already registered
 */
export class EmailAlreadyRegisteredException extends BusinessException {
  constructor() {
    super(
      'Email is already registered',
      'AUTH_EMAIL_ALREADY_EXISTS',
      409, // Conflict
    );
  }
}

/**
 * Thrown when phone number format is invalid
 */
export class InvalidPhoneNumberFormatException extends BusinessException {
  constructor() {
    super(
      'Invalid phone number format. Please use international format (e.g., +919876543210)',
      'AUTH_INVALID_PHONE_FORMAT',
      400, // Bad Request
    );
  }
}

/**
 * Thrown when password does not meet requirements
 */
export class WeakPasswordException extends BusinessException {
  constructor(reason: string) {
    super(
      `Password does not meet requirements: ${reason}`,
      'AUTH_WEAK_PASSWORD',
      400, // Bad Request
    );
  }
}

/**
 * Thrown when login credentials are invalid
 * Intentionally vague to prevent enumeration attacks
 */
export class InvalidCredentialsException extends BusinessException {
  constructor() {
    super(
      'Invalid phone number or password',
      'AUTH_INVALID_CREDENTIALS',
      401, // Unauthorized
    );
  }
}

/**
 * Thrown when user account is not in a state that allows authentication
 */
export class AccountNotActiveException extends BusinessException {
  constructor() {
    super(
      'Account is not active. Please contact support.',
      'AUTH_ACCOUNT_NOT_ACTIVE',
      403, // Forbidden
    );
  }
}

/**
 * Mask phone number for logging (show last 4 digits only)
 */
function maskPhoneNumber(phone: string): string {
  if (phone.length <= 4) return '****';
  return '*'.repeat(phone.length - 4) + phone.slice(-4);
}

