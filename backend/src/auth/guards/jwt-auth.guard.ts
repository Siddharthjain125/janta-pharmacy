import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthUser, UserRole } from '../interfaces/auth-user.interface';
import { JwtPayload, getJwtConfig } from '../config/jwt.config';

/**
 * JWT Auth Guard
 *
 * Validates JWT access tokens and attaches user context to requests.
 *
 * Features:
 * - Extracts Bearer token from Authorization header
 * - Validates JWT signature and expiration
 * - Populates request.user with AuthUser
 * - Supports @Public() decorator to skip auth
 *
 * Security notes:
 * - Rejects expired tokens
 * - Rejects tampered tokens (invalid signature)
 * - Returns generic errors to prevent information leakage
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
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

    try {
      // Verify and decode the JWT
      const config = getJwtConfig();
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: config.secret,
        issuer: config.issuer,
      });

      // Validate token type
      if (payload.type !== 'access') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Build AuthUser from JWT payload
      const authUser: AuthUser = {
        id: payload.sub,
        phoneNumber: payload.phoneNumber,
        email: payload.email,
        role: (payload.roles[0] as UserRole) || UserRole.CUSTOMER,
        roles: payload.roles as UserRole[],
      };

      // Attach user to request
      (request as Request & { user: AuthUser }).user = authUser;

      return true;
    } catch (error) {
      // Handle specific JWT errors
      if (error instanceof Error) {
        if (error.name === 'TokenExpiredError') {
          throw new UnauthorizedException('Token has expired');
        }
        if (error.name === 'JsonWebTokenError') {
          throw new UnauthorizedException('Invalid token');
        }
      }

      // Re-throw if already UnauthorizedException
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      // Generic error for unexpected cases
      throw new UnauthorizedException('Authentication failed');
    }
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
}
