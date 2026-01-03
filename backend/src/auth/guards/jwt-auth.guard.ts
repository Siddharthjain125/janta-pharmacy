import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthUser, UserRole } from '../interfaces/auth-user.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    if (!this.isValidTokenFormat(token)) {
      throw new UnauthorizedException('Invalid token format');
    }

    // TODO: Implement real JWT verification
    // - Verify signature using secret/public key
    // - Check token expiration
    // - Validate issuer and audience
    // - Look up user from UserService
    // - Extract real user payload from token

    // Attach mock user to request (simulates decoded JWT payload)
    const mockUser: AuthUser = this.getMockUserFromToken(token);
    (request as Request & { user: AuthUser }).user = mockUser;

    return true;
  }

  private extractTokenFromHeader(request: Request): string | null {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return null;
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      return null;
    }

    return token;
  }

  private isValidTokenFormat(token: string): boolean {
    // TODO: Implement real JWT format validation
    // For now, check basic structure (3 parts separated by dots for JWT)
    const parts = token.split('.');
    return parts.length === 3 && parts.every((part) => part.length > 0);
  }

  private getMockUserFromToken(_token: string): AuthUser {
    // TODO: Replace with real JWT decode + UserService lookup
    // This mock simulates a user for development/testing
    return {
      id: 'mock-user-id',
      phoneNumber: '+919999999999',
      email: 'mock@example.com',
      role: UserRole.CUSTOMER,
      roles: [UserRole.CUSTOMER],
    };
  }
}
