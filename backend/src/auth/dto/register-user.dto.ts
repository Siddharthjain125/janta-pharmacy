/**
 * Register User DTO
 *
 * Data required to register a new user with password authentication.
 */

/**
 * Input DTO for user registration
 */
export interface RegisterUserDto {
  /** Phone number (required, unique) - primary identifier */
  phoneNumber: string;

  /** Password (required) - will be hashed before storage */
  password: string;

  /** Email (optional) - secondary identifier */
  email?: string;

  /** Display name (optional) */
  name?: string;
}

/**
 * Response DTO for successful registration
 * Does NOT include password hash or any sensitive data
 */
export interface RegisterUserResponseDto {
  /** The newly created user's ID */
  userId: string;

  /** The normalized phone number */
  phoneNumber: string;

  /** Message for the client */
  message: string;
}

