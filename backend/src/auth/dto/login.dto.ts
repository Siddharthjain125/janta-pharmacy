/**
 * Login DTOs
 *
 * Data structures for the login flow.
 */

/**
 * Input DTO for login with phone number + password
 */
export interface LoginDto {
  /** Phone number (primary identifier) */
  phoneNumber: string;

  /** Password */
  password: string;
}

/**
 * Response DTO for successful login
 *
 * Returns the access token, refresh token, and basic user info.
 * Does NOT include sensitive data.
 */
export interface LoginResponseDto {
  /** JWT access token */
  accessToken: string;

  /** Opaque refresh token for obtaining new access tokens */
  refreshToken: string;

  /** Token type (always 'Bearer') */
  tokenType: 'Bearer';

  /** Access token expiration time in seconds */
  expiresIn: number;

  /** Basic user info (safe to expose) */
  user: {
    id: string;
    phoneNumber: string;
    roles: string[];
  };
}

