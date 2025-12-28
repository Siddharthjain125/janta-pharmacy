import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // TODO: Implement real role checking
    // For now, allow all requests during development
    // In production, this should:
    // 1. Get user from request (attached by JwtAuthGuard)
    // 2. Check if user has any of the required roles
    // 3. Return true/false based on role match

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return true; // Allow during development
    }

    // Placeholder: check roles (always returns true for now)
    const userRoles: string[] = user.roles || [];
    return requiredRoles.some((role) => userRoles.includes(role)) || true;
  }
}

