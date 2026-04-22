import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { Permission } from '@src/common/enums';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }

    // Simple in-memory cache for role permissions to reduce DB reads
    // keyed by roleId with a short TTL
    const TTL = 60 * 1000; // 60 seconds
    const now = Date.now();
    // module-level cache (preserve across requests)
    if (!(global as any).__rolePermCache) {
      (global as any).__rolePermCache = new Map<string, { perms: Permission[]; ts: number }>();
    }
    const cache: Map<string, { perms: Permission[]; ts: number }> = (global as any).__rolePermCache;

    let rolePermissions: Permission[] = [];
    if (user.roleId) {
      const entry = cache.get(user.roleId);
      if (entry && now - entry.ts < TTL) {
        rolePermissions = entry.perms;
      } else if (user.role && user.role.permissions) {
        rolePermissions = user.role.permissions;
        cache.set(user.roleId, { perms: rolePermissions, ts: now });
      }
    } else if (user.role && user.role.permissions) {
      rolePermissions = user.role.permissions;
    }

    return {
      userId: payload.sub,
      role: user.role ? user.role.name : null,
      roleId: user.roleId,
      rolePermissions: rolePermissions,
      organizationId: user.organizationId,
    };
  }
}