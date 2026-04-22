import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { RouterService } from '../services/router.service';
import { CreateRouterDto, UpdateRouterDto, AddRoutingRuleDto, UpdateRoutingRuleDto } from '../dto/router.dto';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorator';
import { RequirePermission } from '@src/auth/decorators/require-permission.decorator';
import { CurrentUser } from '@src/auth/decorators/current-user.decorator';
import { ParseUUIDPipe } from '@src/common/pipes/parse-uuid.pipe';
import { Permission } from '@src/common/enums';

interface UserPayload {
  userId: string;
  role?: string | null;
  roleId?: string;
  rolePermissions?: Permission[];
  organizationId: string;
}

@ApiTags('Routers')
@ApiBearerAuth('JWT')
@Controller('routers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RouterController {
  constructor(private readonly routerService: RouterService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new router' })
  @ApiCreatedResponse({ description: 'Router successfully created' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires SUPER_ADMIN or ADMIN role' })
  @ApiResponse({ status: 409, description: 'Conflict - router already exists' })
  @RequirePermission(Permission.CREATE_ROUTER)
  async create(
    @Body() createDto: CreateRouterDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.routerService.create(createDto, user.organizationId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all routers for organization' })
  @ApiResponse({ status: 200, description: 'List of routers' })
  async findAll(@CurrentUser() user: UserPayload) {
    return this.routerService.findByOrganization(user.organizationId);
  }

  @Get('by-country')
  @ApiOperation({ summary: 'Get routers by country' })
  @ApiResponse({ status: 200, description: 'List of routers for the country' })
  async findByCountry(
    @Query('country') country: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.routerService.findByCountry(country, user.organizationId);
  }

  @Get('by-bank')
  @ApiOperation({ summary: 'Get routers by bank name' })
  @ApiResponse({ status: 200, description: 'List of routers for the bank' })
  async findByBank(
    @Query('bankName') bankName: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.routerService.findByBank(bankName, user.organizationId);
  }

  @Get('lookup')
  @ApiOperation({ summary: 'Get router by country, bank, and currency' })
  @ApiResponse({ status: 200, description: 'Router details' })
  @ApiResponse({ status: 404, description: 'Router not found' })
  async lookup(
    @Query('country') country: string,
    @Query('bankName') bankName: string,
    @Query('currency') currency: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.routerService.findByCountryBankCurrency(
      country,
      bankName,
      currency,
      user.organizationId,
    );
  }

  @Get('resolve')
  @ApiOperation({ summary: 'Resolve routing for a transfer' })
  @ApiResponse({ status: 200, description: 'Resolved routing target' })
  async resolveRoute(
    @Query('country') country: string,
    @Query('bankName') bankName: string,
    @Query('currency') currency: string,
    @Query('amount') amount: string,
    @CurrentUser() user: UserPayload,
  ) {
    const route = await this.routerService.resolveRoute(
      country,
      bankName,
      currency,
      parseFloat(amount),
      user.organizationId,
    );
    return { route };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a router by ID' })
  @ApiResponse({ status: 200, description: 'Router details' })
  @ApiResponse({ status: 404, description: 'Router not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.routerService.findById(id, user.organizationId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a router' })
  @ApiResponse({ status: 200, description: 'Router successfully updated' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires SUPER_ADMIN or ADMIN role' })
  @ApiResponse({ status: 404, description: 'Router not found' })
  @RequirePermission(Permission.UPDATE_ROUTER)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateRouterDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.routerService.update(id, updateDto, user.organizationId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a router' })
  @ApiResponse({ status: 204, description: 'Router successfully deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires SUPER_ADMIN or ADMIN role' })
  @ApiResponse({ status: 404, description: 'Router not found' })
  @RequirePermission(Permission.DELETE_ROUTER)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserPayload,
  ) {
    await this.routerService.remove(id, user.organizationId);
  }

  // Routing Rules Endpoints
  @Post(':id/rules')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a routing rule to a router' })
  @ApiCreatedResponse({ description: 'Routing rule successfully created' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires SUPER_ADMIN or ADMIN role' })
  @ApiResponse({ status: 404, description: 'Router not found' })
  @RequirePermission(Permission.CREATE_ROUTER)
  async addRule(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addRuleDto: AddRoutingRuleDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.routerService.addRule(id, addRuleDto.rule, user.organizationId);
  }

  @Get(':id/rules')
  @ApiOperation({ summary: 'Get all routing rules for a router' })
  @ApiResponse({ status: 200, description: 'List of routing rules' })
  async getRules(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.routerService.getRules(id, user.organizationId);
  }

  @Patch(':id/rules/:ruleId')
  @ApiOperation({ summary: 'Update a routing rule' })
  @ApiResponse({ status: 200, description: 'Routing rule successfully updated' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires SUPER_ADMIN or ADMIN role' })
  @ApiResponse({ status: 404, description: 'Router or rule not found' })
  @RequirePermission(Permission.UPDATE_ROUTER)
  async updateRule(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('ruleId', ParseUUIDPipe) ruleId: string,
    @Body() updateDto: UpdateRoutingRuleDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.routerService.updateRule(id, ruleId, updateDto, user.organizationId);
  }

  @Delete(':id/rules/:ruleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a routing rule' })
  @ApiResponse({ status: 204, description: 'Routing rule successfully deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires SUPER_ADMIN or ADMIN role' })
  @ApiResponse({ status: 404, description: 'Router or rule not found' })
  @RequirePermission(Permission.DELETE_ROUTER)
  async removeRule(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('ruleId', ParseUUIDPipe) ruleId: string,
    @CurrentUser() user: UserPayload,
  ) {
    await this.routerService.removeRule(id, ruleId, user.organizationId);
  }
}
