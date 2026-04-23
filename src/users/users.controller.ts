import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  ConflictException,
} from '@nestjs/common';
import { ParseUUIDPipe } from '@src/common/pipes/parse-uuid.pipe';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { RequirePermission } from '@src/auth/decorators/require-permission.decorator';
import { CurrentUser } from '@src/auth/decorators/current-user.decorator';
import { UserRole, Permission } from '@src/common/enums';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

interface UserPayload {
  userId: string;
  role?: string | null;
  roleId?: string;
  rolePermissions?: Permission[];
  organizationId: string;
}

@ApiTags('Users')
@ApiBearerAuth('JWT')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({ description: 'User profile retrieved successfully' })
  getProfile(@CurrentUser() user: UserPayload) {
    return this.usersService.findById(user.userId);
  }

  @Patch('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change password for the currently logged-in user' })
  @ApiOkResponse({ description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Current password is incorrect' })
  async changePassword(
    @CurrentUser() user: UserPayload,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(user.userId, changePasswordDto.currentPassword, changePasswordDto.newPassword);
    return { message: 'Password changed successfully' };
  }

  @Post('employees')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new employee' })
  @ApiCreatedResponse({ description: 'Employee successfully created' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires permission: create_user' })
  @ApiResponse({ status: 409, description: 'Conflict - email or phone already exists' })
  @RequirePermission(Permission.CREATE_USER)
  async createEmployee(
    @Body() createEmployeeDto: CreateEmployeeDto,
    @CurrentUser() user: UserPayload
  ) {
    // Check if email already exists in THIS organization only (prevent cross-tenant leak)
    if (createEmployeeDto.email) {
      const existingEmail = await this.usersService.findByEmailInOrganization(createEmployeeDto.email, user.organizationId);
      if (existingEmail) {
        throw new ConflictException('Email already exists in your organization');
      }
    }

    // Check if phone already exists in THIS organization only (prevent cross-tenant leak)
    if (createEmployeeDto.phone) {
      const existingPhone = await this.usersService.findByPhoneInOrganization(createEmployeeDto.phone, user.organizationId);
      if (existingPhone) {
        throw new ConflictException('Phone number already exists in your organization');
      }
    }

    const hashedPassword = await bcrypt.hash(createEmployeeDto.password, 10);
    
    const employee = await this.usersService.create({
      email: createEmployeeDto.email,
      phone: createEmployeeDto.phone,
      password: hashedPassword,
      name: createEmployeeDto.name,
      roleId: createEmployeeDto.roleId,
      organizationId: user.organizationId,
    }, false);

    // Ensure employee is persisted before returning
    const savedEmployee = await this.usersService.findById(employee.id);
    const { password, ...result } = savedEmployee;
    return result;
  }

  @Get('employees')
  @RequirePermission(Permission.READ_USER)
  findAllEmployees(@CurrentUser() user: UserPayload) {
    return this.usersService.findByOrganization(user.organizationId);
  }

  @Get('employees/:id')
  @RequirePermission(Permission.READ_USER)
  findEmployee(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: UserPayload) {
    return this.usersService.findByIdInOrganization(id, user.organizationId);
  }

  @Patch('employees/:id')
  @RequirePermission(Permission.UPDATE_USER)
  updateEmployee(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateData: UpdateEmployeeDto,
    @CurrentUser() user: UserPayload
  ) {
    return this.usersService.update(id, updateData, user.userId, user.organizationId);
  }

  @Delete('employees/:id')
  @RequirePermission(Permission.DELETE_USER)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeEmployee(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: UserPayload) {
    return this.usersService.remove(id, user.userId, user.organizationId);
  }
}