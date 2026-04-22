import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { REQUIRE_PERMISSION_KEY } from '../decorators/require-permission.decorator';
import { UserRole, Permission } from '@src/common/enums';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      REQUIRE_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If neither roles nor permissions required, allow access
    if (!requiredRoles && !requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // Check role requirement (previously defaultRole). Role checks were supported
    // via `UserRole` enum in JWT but the project now prefers permission-based
    // custom roles. If `@Roles()` is used, this still checks `user.role` from JWT.
    if (requiredRoles) {
      const hasRole = requiredRoles.some((role) => user.role === role);
      if (!hasRole) {
        throw new ForbiddenException('You do not have the required role to access this resource');
      }
    }

    // Check permission requirement (from assigned custom role)
    if (requiredPermissions && user.roleId) {
      // User has a custom role assigned, check its permissions
      const userPermissions = user.rolePermissions || [];
      const hasPermission = requiredPermissions.some((permission) =>
        userPermissions.includes(permission),
      );

      if (!hasPermission) {
        throw new ForbiddenException(
          `You do not have the required permission. Needed: ${requiredPermissions.join(', ')}`,
        );
      }
    } else if (requiredPermissions && !user.roleId) {
      // User doesn't have a custom role but permission is required
      throw new ForbiddenException(
        `You do not have the required permission. Needed: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
