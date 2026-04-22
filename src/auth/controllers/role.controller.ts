import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { RoleService } from '../services/role.service';
import { Role } from '../entities/role.entity';
import { CreateRoleDto, UpdateRoleDto } from '../dto/role.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Permission } from '@src/common/enums';
import { ParseUUIDPipe } from '@src/common/pipes/parse-uuid.pipe';

interface UserPayload {
  userId: string;
  role?: string | null;
  organizationId: string;
}

@ApiTags('Roles')
@Controller('auth/roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RoleController {
  constructor(private roleService: RoleService) {}

  @Post()
  @RequirePermission(Permission.CREATE_ROLE)
  @ApiCreatedResponse({
    description: 'Role created successfully',
    type: Role,
  })
  @ApiOperation({ summary: 'Create a new role' })
  create(@Body() createRoleDto: CreateRoleDto, @CurrentUser() user: UserPayload): Promise<Role> {
    return this.roleService.create(createRoleDto, user.organizationId);
  }

  @Get()
  @RequirePermission(Permission.READ_ROLE)
  @ApiResponse({
    status: 200,
    description: 'Get all roles in organization',
    type: [Role],
  })
  @ApiOperation({ summary: 'Get all roles' })
  findAll(@CurrentUser() user: UserPayload): Promise<Role[]> {
    return this.roleService.findAll(user.organizationId);
  }

  @Get('available/permissions')
  @ApiResponse({
    status: 200,
    description: 'Get all available permissions',
    schema: {
      type: 'array',
      items: { type: 'string' },
      example: ['create_corridor', 'read_corridor', 'update_corridor', 'delete_corridor'],
    },
  })
  @ApiOperation({ summary: 'Get all available permissions in the system' })
  getAvailablePermissions(): string[] {
    return Object.values(Permission);
  }

  @Get(':id')
  @RequirePermission(Permission.READ_ROLE)
  @ApiResponse({
    status: 200,
    description: 'Get role by ID',
    type: Role,
  })
  @ApiOperation({ summary: 'Get role by ID' })
  findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserPayload,
  ): Promise<Role> {
    return this.roleService.findById(id, user.organizationId);
  }

  @Patch(':id')
  @RequirePermission(Permission.UPDATE_ROLE)
  @ApiResponse({
    status: 200,
    description: 'Role updated successfully',
    type: Role,
  })
  @ApiOperation({ summary: 'Update role' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @CurrentUser() user: UserPayload,
  ): Promise<Role> {
    return this.roleService.update(id, updateRoleDto, user.organizationId);
  }

  @Delete(':id')
  @RequirePermission(Permission.DELETE_ROLE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    status: 204,
    description: 'Role deleted successfully',
  })
  @ApiOperation({ summary: 'Delete role' })
  async delete(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: UserPayload): Promise<void> {
    return this.roleService.delete(id, user.organizationId);
  }
}
