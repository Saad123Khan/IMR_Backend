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
import { ParseUUIDPipe } from '@src/common/pipes/parse-uuid.pipe';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery, ApiCreatedResponse } from '@nestjs/swagger';
import { CorridorsService } from './corridors.service';
import { CreateCorridorDto } from './dto/create-corridor.dto';
import { UpdateCorridorDto } from './dto/update-corridor.dto';
import { CreateFixedFeeDto } from './dto/fixed-fee.dto';
import { CreateFeesSlabDto } from './dto/fees-slab.dto';
import { CreateBankFeeConfigDto } from './dto/bank-fee-config.dto';
import { CreateTimingFeeDto } from './dto/timing-fee.dto';
import { CreateFixedMarginDto } from './dto/fixed-margin.dto';
import { CreateMarginSlabDto } from './dto/margin-slab.dto';
import { CreateTimingMarginDto } from './dto/timing-margin.dto';
import { CreateBankMarginConfigDto } from './dto/bank-margin-config.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permission } from '@src/common/enums';

interface UserPayload {
  userId: string;
  role?: string | null;
  roleId?: string;
  rolePermissions?: Permission[];
  organizationId: string;
}

@ApiTags('Corridors')
@ApiBearerAuth('JWT')
@Controller('corridors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CorridorsController {
  constructor(private readonly corridorsService: CorridorsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all corridors for the organization with optional filters and pagination' })
  @ApiQuery({ name: 'country', required: false, description: 'Filter by country' })
  @ApiQuery({ name: 'mto', required: false, description: 'Filter by MTO provider' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by corridor status (active, inactive, suspended, pending)' })
  @ApiQuery({ name: 'paymentChannel', required: false, description: 'Filter by payment channel (bank, wallet, cash_pickup)' })
  @ApiQuery({ name: 'currency', required: false, description: 'Filter by currency code' })
  @ApiQuery({ name: 'feeType', required: false, description: 'Filter by fee type (fixed_fees, fees_slab, timing, per_bank, as_per_mto)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of records per page (max 100, default 50)' })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of records to skip (default 0)' })
  @ApiResponse({ status: 200, description: 'List of corridors' })
  async findAll(
    @CurrentUser() user: UserPayload,
    @Query('country') country?: string,
    @Query('mto') mto?: string,
    @Query('status') status?: string,
    @Query('paymentChannel') paymentChannel?: string,
    @Query('currency') currency?: string,
    @Query('feeType') feeType?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const limitNum = Math.min(parseInt(limit || '50'), 50000);
    const offsetNum = parseInt(offset || '0');
    
    return this.corridorsService.findByFilters(user.organizationId, {
      country,
      mto,
      status,
      paymentChannel,
      currency,
      feeType,
    }, limitNum, offsetNum);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a corridor by ID' })
  @ApiResponse({ status: 200, description: 'Corridor details' })
  @ApiResponse({ status: 404, description: 'Corridor not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: UserPayload) {
    return this.corridorsService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a corridor' })
  @ApiResponse({ status: 200, description: 'Corridor successfully updated' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires UPDATE_CORRIDOR permission' })
  @ApiResponse({ status: 404, description: 'Corridor not found' })
  @RequirePermission(Permission.UPDATE_CORRIDOR)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCorridorDto: UpdateCorridorDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.corridorsService.update(id, updateCorridorDto, user.organizationId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a corridor' })
  @ApiResponse({ status: 204, description: 'Corridor successfully deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires DELETE_CORRIDOR permission' })
  @ApiResponse({ status: 404, description: 'Corridor not found' })
  @RequirePermission(Permission.DELETE_CORRIDOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: UserPayload) {
    return this.corridorsService.remove(id, user.organizationId);
  }

  // Fixed Fees Endpoints
  @Post(':corridorId/fixed-fees')
  @ApiOperation({ summary: 'Create a fixed fee for a corridor' })
  @ApiResponse({ status: 201, description: 'Fixed fee successfully created' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires CREATE_CORRIDOR permission' })
  @ApiResponse({ status: 404, description: 'Corridor not found' })
  @RequirePermission(Permission.CREATE_CORRIDOR)
  @HttpCode(HttpStatus.CREATED)
  async createFixedFee(
    @Param('corridorId', ParseUUIDPipe) corridorId: string,
    @Body() createFixedFeeDto: CreateFixedFeeDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.corridorsService.createFixedFee(corridorId, createFixedFeeDto, user.organizationId);
  }

  @Get(':corridorId/fixed-fees')
  @ApiOperation({ summary: 'Get all fixed fees for a corridor' })
  @ApiResponse({ status: 200, description: 'List of fixed fees' })
  async getFixedFees(
    @Param('corridorId', ParseUUIDPipe) corridorId: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.corridorsService.getFixedFees(corridorId, user.organizationId);
  }

  @Delete(':corridorId/fixed-fees/:feeId')
  @ApiOperation({ summary: 'Delete a fixed fee' })
  @ApiResponse({ status: 204, description: 'Fixed fee successfully deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires DELETE_CORRIDOR permission' })
  @RequirePermission(Permission.DELETE_CORRIDOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFixedFee(
    @Param('corridorId', ParseUUIDPipe) corridorId: string,
    @Param('feeId', ParseUUIDPipe) feeId: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.corridorsService.deleteFixedFee(corridorId, feeId, user.organizationId);
  }

  // Fees Slab Endpoints
  @Post(':corridorId/fees-slabs')
  @ApiOperation({ summary: 'Create a fees slab for a corridor' })
  @ApiResponse({ status: 201, description: 'Fees slab successfully created' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires SUPER_ADMIN or ADMIN role' })
  @RequirePermission(Permission.CREATE_CORRIDOR)
  @HttpCode(HttpStatus.CREATED)
  async createFeesSlab(
    @Param('corridorId', ParseUUIDPipe) corridorId: string,
    @Body() createFeesSlabDto: CreateFeesSlabDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.corridorsService.createFeesSlab(corridorId, createFeesSlabDto, user.organizationId);
  }

  @Get(':corridorId/fees-slabs')
  @ApiOperation({ summary: 'Get all fees slabs for a corridor' })
  @ApiResponse({ status: 200, description: 'List of fees slabs' })
  async getFeeSlabs(
    @Param('corridorId', ParseUUIDPipe) corridorId: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.corridorsService.getFeeSlabs(corridorId, user.organizationId);
  }

  @Delete(':corridorId/fees-slabs/:slabId')
  @ApiOperation({ summary: 'Delete a fees slab' })
  @ApiResponse({ status: 204, description: 'Fees slab successfully deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires DELETE_CORRIDOR permission' })
  @RequirePermission(Permission.DELETE_CORRIDOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFeesSlab(
    @Param('corridorId', ParseUUIDPipe) corridorId: string,
    @Param('slabId', ParseUUIDPipe) slabId: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.corridorsService.deleteFeesSlab(corridorId, slabId, user.organizationId);
  }

  // Bank Fee Config Endpoints
  @Post(':corridorId/bank-fees')
  @ApiOperation({ summary: 'Create a bank fee configuration' })
  @ApiResponse({ status: 201, description: 'Bank fee config successfully created' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires SUPER_ADMIN or ADMIN role' })
  @RequirePermission(Permission.CREATE_CORRIDOR)
  @HttpCode(HttpStatus.CREATED)
  async createBankFeeConfig(
    @Param('corridorId', ParseUUIDPipe) corridorId: string,
    @Body() createBankFeeConfigDto: CreateBankFeeConfigDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.corridorsService.createBankFeeConfig(corridorId, createBankFeeConfigDto, user.organizationId);
  }

  @Get(':corridorId/bank-fees')
  @ApiOperation({ summary: 'Get all bank fee configurations' })
  @ApiResponse({ status: 200, description: 'List of bank fee configs' })
  async getBankFeeConfigs(
    @Param('corridorId', ParseUUIDPipe) corridorId: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.corridorsService.getBankFeeConfigs(corridorId, user.organizationId);
  }

  @Delete(':corridorId/bank-fees/:configId')
  @ApiOperation({ summary: 'Delete a bank fee configuration' })
  @ApiResponse({ status: 204, description: 'Bank fee config successfully deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires DELETE_CORRIDOR permission' })
  @RequirePermission(Permission.DELETE_CORRIDOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBankFeeConfig(
    @Param('corridorId', ParseUUIDPipe) corridorId: string,
    @Param('configId', ParseUUIDPipe) configId: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.corridorsService.deleteBankFeeConfig(corridorId, configId, user.organizationId);
  }

  // Timing Fee Endpoints
  @Post(':corridorId/timing-fees')
  @ApiOperation({ summary: 'Create a timing fee' })
  @ApiResponse({ status: 201, description: 'Timing fee successfully created' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires SUPER_ADMIN or ADMIN role' })
  @RequirePermission(Permission.CREATE_CORRIDOR)
  @HttpCode(HttpStatus.CREATED)
  async createTimingFee(
    @Param('corridorId', ParseUUIDPipe) corridorId: string,
    @Body() createTimingFeeDto: CreateTimingFeeDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.corridorsService.createTimingFee(corridorId, createTimingFeeDto, user.organizationId);
  }

  @Get(':corridorId/timing-fees')
  @ApiOperation({ summary: 'Get all timing fees' })
  @ApiResponse({ status: 200, description: 'List of timing fees' })
  async getTimingFees(
    @Param('corridorId', ParseUUIDPipe) corridorId: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.corridorsService.getTimingFees(corridorId, user.organizationId);
  }

  @Delete(':corridorId/timing-fees/:feeId')
  @ApiOperation({ summary: 'Delete a timing fee' })
  @ApiResponse({ status: 204, description: 'Timing fee successfully deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires DELETE_CORRIDOR permission' })
  @RequirePermission(Permission.DELETE_CORRIDOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTimingFee(
    @Param('corridorId', ParseUUIDPipe) corridorId: string,
    @Param('feeId', ParseUUIDPipe) feeId: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.corridorsService.deleteTimingFee(corridorId, feeId, user.organizationId);
  }

  // Fixed Margin Endpoints
  @Post(':corridorId/fixed-margins')
  @RequirePermission(Permission.CREATE_CORRIDOR)
  @HttpCode(HttpStatus.CREATED)
  async createFixedMargin(
    @Param('corridorId', ParseUUIDPipe) corridorId: string,
    @Body() dto: CreateFixedMarginDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.corridorsService.createFixedMargin(corridorId, dto, user.organizationId);
  }

  @Get(':corridorId/fixed-margins')
  async getFixedMargins(
    @Param('corridorId', ParseUUIDPipe) corridorId: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.corridorsService.getFixedMargins(corridorId, user.organizationId);
  }

  @Delete(':corridorId/fixed-margins/:marginId')
  @RequirePermission(Permission.DELETE_CORRIDOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFixedMargin(
    @Param('corridorId', ParseUUIDPipe) corridorId: string,
    @Param('marginId', ParseUUIDPipe) marginId: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.corridorsService.deleteFixedMargin(corridorId, marginId, user.organizationId);
  }

  // Margin Slab Endpoints
  @Post(':corridorId/margin-slabs')
  @RequirePermission(Permission.CREATE_CORRIDOR)
  @HttpCode(HttpStatus.CREATED)
  async createMarginSlab(
    @Param('corridorId', ParseUUIDPipe) corridorId: string,
    @Body() dto: CreateMarginSlabDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.corridorsService.createMarginSlab(corridorId, dto, user.organizationId);
  }

  @Get(':corridorId/margin-slabs')
  async getMarginSlabs(
    @Param('corridorId', ParseUUIDPipe) corridorId: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.corridorsService.getMarginSlabs(corridorId, user.organizationId);
  }

  @Delete(':corridorId/margin-slabs/:slabId')
  @RequirePermission(Permission.DELETE_CORRIDOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMarginSlab(
    @Param('corridorId', ParseUUIDPipe) corridorId: string,
    @Param('slabId', ParseUUIDPipe) slabId: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.corridorsService.deleteMarginSlab(corridorId, slabId, user.organizationId);
  }

  // Timing Margin Endpoints
  @Post(':corridorId/timing-margins')
  @RequirePermission(Permission.CREATE_CORRIDOR)
  @HttpCode(HttpStatus.CREATED)
  async createTimingMargin(
    @Param('corridorId', ParseUUIDPipe) corridorId: string,
    @Body() dto: CreateTimingMarginDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.corridorsService.createTimingMargin(corridorId, dto, user.organizationId);
  }

  @Get(':corridorId/timing-margins')
  async getTimingMargins(
    @Param('corridorId', ParseUUIDPipe) corridorId: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.corridorsService.getTimingMargins(corridorId, user.organizationId);
  }

  @Delete(':corridorId/timing-margins/:marginId')
  @RequirePermission(Permission.DELETE_CORRIDOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTimingMargin(
    @Param('corridorId', ParseUUIDPipe) corridorId: string,
    @Param('marginId', ParseUUIDPipe) marginId: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.corridorsService.deleteTimingMargin(corridorId, marginId, user.organizationId);
  }

  // Bank Margin Config Endpoints
  @Post(':corridorId/bank-margins')
  @RequirePermission(Permission.CREATE_CORRIDOR)
  @HttpCode(HttpStatus.CREATED)
  async createBankMarginConfig(
    @Param('corridorId', ParseUUIDPipe) corridorId: string,
    @Body() dto: CreateBankMarginConfigDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.corridorsService.createBankMarginConfig(corridorId, dto, user.organizationId);
  }

  @Get(':corridorId/bank-margins')
  async getBankMarginConfigs(
    @Param('corridorId', ParseUUIDPipe) corridorId: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.corridorsService.getBankMarginConfigs(corridorId, user.organizationId);
  }

  @Delete(':corridorId/bank-margins/:configId')
  @RequirePermission(Permission.DELETE_CORRIDOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBankMarginConfig(
    @Param('corridorId', ParseUUIDPipe) corridorId: string,
    @Param('configId', ParseUUIDPipe) configId: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.corridorsService.deleteBankMarginConfig(corridorId, configId, user.organizationId);
  }
}