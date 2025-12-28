import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // TODO: Implement real JWT validation
    // For now, allow all requests during development
    // In production, this should:
    // 1. Extract token from Authorization header
    // 2. Validate JWT signature
    // 3. Check token expiration
    // 4. Attach user to request

    const request = context.switchToHttp().getRequest();
    
    // Placeholder: attach mock user to request
    request.user = {
      userId: 'placeholder-user-id',
      email: 'placeholder@example.com',
      roles: ['user'],
    };

    return true;
  }
}

