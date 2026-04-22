import { SetMetadata } from '@nestjs/common';
import { Permission } from '@src/common/enums';

export const REQUIRE_PERMISSION_KEY = 'require_permission';

export const RequirePermission = (...permissions: Permission[]) =>
  SetMetadata(REQUIRE_PERMISSION_KEY, permissions);
