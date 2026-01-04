/**
 * Refresh Token DTOs
 *
 * Data structures for the token refresh flow.
 */

/**
 * Input DTO for refreshing tokens
 */
export interface RefreshTokenDto {
  /** The refresh token string */
  refreshToken: string;
}

/**
 * Response DTO for successful token refresh
 *
 * Returns new access and refresh tokens.
 * The old refresh token is invalidated.
 */
export interface RefreshTokenResponseDto {
  /** New JWT access token */
  accessToken: string;

  /** New refresh token (rotation) */
  refreshToken: string;

  /** Token type (always 'Bearer') */
  tokenType: 'Bearer';

  /** Access token expiration time in seconds */
  expiresIn: number;
}

