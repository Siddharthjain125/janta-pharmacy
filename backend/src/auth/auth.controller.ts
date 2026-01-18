import { Controller, Post, Body, HttpCode, HttpStatus, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiResponse } from '../common/api/api-response';
import { Public } from './decorators/public.decorator';
import {
  RegisterUserDto,
  RegisterUserResponseDto,
  LoginDto,
  LoginResponseDto,
  RefreshTokenDto,
  RefreshTokenResponseDto,
} from './dto';
import { randomUUID } from 'crypto';

/**
 * Auth Controller
 *
 * Handles authentication endpoints.
 * All endpoints are public (no auth required).
 *
 * Endpoints:
 * - POST /auth/register - Register new user with phone + password
 * - POST /auth/login - Login with phone + password
 * - POST /auth/refresh - Refresh token (placeholder)
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user with phone number and password
   *
   * @param registerDto - Registration data
   * @returns Created user info (no sensitive data)
   */
  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerDto: RegisterUserDto,
    @Headers('x-correlation-id') correlationId?: string,
  ): Promise<ApiResponse<RegisterUserResponseDto>> {
    const corrId = correlationId || randomUUID();
    const result = await this.authService.registerUser(registerDto, corrId);
    return ApiResponse.success(result, 'User registered successfully');
  }

  /**
   * Login with phone number and password
   *
   * @param loginDto - Login credentials
   * @returns JWT access token and user info
   */
  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Headers('x-correlation-id') correlationId?: string,
  ): Promise<ApiResponse<LoginResponseDto>> {
    const corrId = correlationId || randomUUID();
    const result = await this.authService.login(loginDto, corrId);
    return ApiResponse.success(result, 'Login successful');
  }

  /**
   * Refresh access token
   *
   * Accepts a refresh token and returns new access + refresh tokens.
   * The old refresh token is invalidated (rotation enforced).
   *
   * @param refreshDto - Contains the refresh token
   * @returns New access token and refresh token
   */
  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() refreshDto: RefreshTokenDto,
    @Headers('x-correlation-id') correlationId?: string,
  ): Promise<ApiResponse<RefreshTokenResponseDto>> {
    const corrId = correlationId || randomUUID();
    const result = await this.authService.refreshToken(refreshDto, corrId);
    return ApiResponse.success(result, 'Token refreshed successfully');
  }
}
