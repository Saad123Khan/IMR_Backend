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
import { BankPayerMappingService } from '../services/bank-payer-mapping.service';
import { CreateBankPayerMappingDto, UpdateBankPayerMappingDto } from '../dto/bank-payer-mapping.dto';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { RequirePermission } from '@src/auth/decorators/require-permission.decorator';
import { CurrentUser } from '@src/auth/decorators/current-user.decorator';
import { ParseUUIDPipe } from '@src/common/pipes/parse-uuid.pipe';
import { UserRole, MTOProvider, Permission } from '@src/common/enums';

interface UserPayload {
  userId: string;
  role?: string | null;
  roleId?: string;
  rolePermissions?: Permission[];
  organizationId: string;
}

@ApiTags('Bank Payer Mappings')
@ApiBearerAuth('JWT')
@Controller('bank-payer-mappings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BankPayerMappingController {
  constructor(private readonly bankPayerMappingService: BankPayerMappingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a bank payer mapping' })
  @ApiCreatedResponse({ description: 'Bank payer mapping successfully created' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires SUPER_ADMIN or ADMIN role' })
  @ApiResponse({ status: 409, description: 'Conflict - mapping already exists' })
  @RequirePermission(Permission.CREATE_BANK_PAYER_MAPPING)
  async create(
    @Body() createDto: CreateBankPayerMappingDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.bankPayerMappingService.create(createDto, user.organizationId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bank payer mappings for organization' })
  @ApiResponse({ status: 200, description: 'List of bank payer mappings' })
  async findAll(@CurrentUser() user: UserPayload) {
    return this.bankPayerMappingService.findByOrganization(user.organizationId);
  }

  @Get('search/by-bank-name')
  @ApiOperation({ summary: 'Search bank payer mappings by bank name' })
  @ApiResponse({ status: 200, description: 'List of matching mappings' })
  async searchByBankName(
    @Query('bankName') bankName: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.bankPayerMappingService.searchByBankName(bankName, user.organizationId);
  }

  @Get('by-bank')
  @ApiOperation({ summary: 'Get payer mappings by exact bank name' })
  @ApiResponse({ status: 200, description: 'List of mappings for the bank' })
  async findByBank(
    @Query('bankName') bankName: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.bankPayerMappingService.findByBank(bankName, user.organizationId);
  }

  @Get('by-mto')
  @ApiOperation({ summary: 'Get payer mappings by MTO' })
  @ApiResponse({ status: 200, description: 'List of mappings for the MTO' })
  async findByMto(
    @Query('mto') mto: MTOProvider,
    @CurrentUser() user: UserPayload,
  ) {
    return this.bankPayerMappingService.findByMto(mto, user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a bank payer mapping by ID' })
  @ApiResponse({ status: 200, description: 'Bank payer mapping details' })
  @ApiResponse({ status: 404, description: 'Mapping not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.bankPayerMappingService.findById(id, user.organizationId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a bank payer mapping' })
  @ApiResponse({ status: 200, description: 'Bank payer mapping successfully updated' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires SUPER_ADMIN or ADMIN role' })
  @ApiResponse({ status: 404, description: 'Mapping not found' })
  @ApiResponse({ status: 409, description: 'Conflict - duplicate mapping' })
  @RequirePermission(Permission.UPDATE_BANK_PAYER_MAPPING)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateBankPayerMappingDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.bankPayerMappingService.update(id, updateDto, user.organizationId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a bank payer mapping' })
  @ApiResponse({ status: 204, description: 'Mapping successfully deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires SUPER_ADMIN or ADMIN role' })
  @ApiResponse({ status: 404, description: 'Mapping not found' })
  @RequirePermission(Permission.DELETE_BANK_PAYER_MAPPING)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserPayload,
  ) {
    await this.bankPayerMappingService.remove(id, user.organizationId);
  }
}
