import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiResponse } from '../common/api/api-response';
import { Public } from './decorators/public.decorator';

/**
 * Auth Controller
 *
 * Handles authentication endpoints.
 * All endpoints are public (no auth required).
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Login with email and password
   */
  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<ApiResponse<unknown>> {
    const result = await this.authService.login(loginDto);
    return ApiResponse.success(result, 'Login successful');
  }

  /**
   * Refresh access token
   */
  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshDto: RefreshTokenDto): Promise<ApiResponse<unknown>> {
    const result = await this.authService.refreshToken(refreshDto);
    return ApiResponse.success(result, 'Token refreshed successfully');
  }
}

interface LoginDto {
  email: string;
  password: string;
}

interface RefreshTokenDto {
  refreshToken: string;
}
