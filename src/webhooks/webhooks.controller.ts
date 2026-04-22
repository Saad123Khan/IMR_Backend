import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Query,
  Param,
  UseGuards,
  BadRequestException,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';
import {
  EncryptedWebhookPayloadDto,
  WebhookResponseDto,
} from './dto/webhook-create-corridor.dto';
import {
  EncryptedWebhookClientPayloadDto,
  WebhookClientResponseDto,
} from './dto/webhook-create-client.dto';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { CurrentUser } from '@src/auth/decorators/current-user.decorator';
import { RequirePermission } from '@src/auth/decorators/require-permission.decorator';
import { Permission } from '@src/common/enums';
import { ConfigService } from '@nestjs/config';
import { EncryptionUtil } from './utils/encryption.util';

interface UserPayload {
  userId: string;
  role?: string | null;
  roleId?: string;
  rolePermissions?: Permission[];
  organizationId: string;
}

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly webhooksService: WebhooksService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Webhook endpoint for admin backend to create corridors securely
   * Payload must be encrypted with server's public key and signed by admin
   *
   * Request signature verification (REQUIRED):
   * - Verifies signature using admin public key (from ADMIN_WEBHOOK_PUBLIC_KEY env var)
   * - Signature is computed over the request body JSON
   * - All requests must include x-webhook-signature header
   * - Server must have ADMIN_WEBHOOK_PUBLIC_KEY configured
   */
  @Post('corridors/create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Securely create corridor via webhook from admin backend',
    description:
      'Expects encrypted payload and RSA signature from authorized admin backend.',
  })
  @ApiHeader({
    name: 'x-webhook-signature',
    description: 'RSA signature of request body (base64) - REQUIRED',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Corridor created successfully',
    type: WebhookResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or missing encrypted payload',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid signature or missing header',
  })
  async createCorridorWebhook(
    @Body() dto: EncryptedWebhookPayloadDto,
    @Req() request: any,
  ): Promise<WebhookResponseDto> {
    if (!dto.encryptedPayload || !dto.organizationId) {
      throw new BadRequestException(
        'Missing encryptedPayload or organizationId',
      );
    }

    // Extract signature from x-webhook-signature header
    const signature = request.headers['x-webhook-signature'];

    // Signature verification is mandatory
    if (!signature) {
      throw new BadRequestException(
        'Missing x-webhook-signature header. Request must be signed.',
      );
    }

    const adminPublicKey = this.configService.get<string>(
      'ADMIN_WEBHOOK_PUBLIC_KEY',
    );

    if (!adminPublicKey) {
      throw new BadRequestException(
        'Server not configured for webhook requests. ADMIN_WEBHOOK_PUBLIC_KEY not set.',
      );
    }

    const requestBody = {
      encryptedPayload: dto.encryptedPayload,
      organizationId: dto.organizationId,
      correlationId: dto.correlationId,
    };

    const isSignatureValid = EncryptionUtil.verifySignature(
      requestBody,
      signature,
      adminPublicKey,
    );

    if (!isSignatureValid) {
      throw new BadRequestException('Invalid webhook signature - request verification failed');
    }

    return this.webhooksService.createCorridorWebhook(
      dto.encryptedPayload,
      dto.organizationId,
      dto.correlationId,
    );
  }

  /**
   * Webhook endpoint for admin backend to create new clients (organizations + owner users)
   * Payload must be encrypted with server's public key and signed by admin
   *
   * Request signature verification (REQUIRED):
   * - Verifies signature using admin public key (from ADMIN_WEBHOOK_PUBLIC_KEY env var)
   * - Signature is computed over the request body JSON
   * - All requests must include x-webhook-signature header
   * - Server must have ADMIN_WEBHOOK_PUBLIC_KEY configured
   */
  @Post('clients/create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Securely create a new client (organization + owner user) via webhook from admin backend',
    description:
      'Expects encrypted payload and RSA signature from authorized admin backend.',
  })
  @ApiHeader({
    name: 'x-webhook-signature',
    description: 'RSA signature of request body (base64) - REQUIRED',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Client created successfully',
    type: WebhookClientResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or missing encrypted payload, or invalid signature',
  })
  async createClientWebhook(
    @Body() dto: EncryptedWebhookClientPayloadDto,
    @Req() request: any,
  ): Promise<WebhookClientResponseDto> {
    if (!dto.encryptedPayload) {
      throw new BadRequestException('Missing encryptedPayload');
    }

    // Extract signature from x-webhook-signature header
    const signature = request.headers['x-webhook-signature'];

    // Signature verification is mandatory
    if (!signature) {
      throw new BadRequestException(
        'Missing x-webhook-signature header. Request must be signed.',
      );
    }

    const adminPublicKey = this.configService.get<string>(
      'ADMIN_WEBHOOK_PUBLIC_KEY',
    );

    if (!adminPublicKey) {
      throw new BadRequestException(
        'Server not configured for webhook requests. ADMIN_WEBHOOK_PUBLIC_KEY not set.',
      );
    }

    const requestBody = {
      encryptedPayload: dto.encryptedPayload,
      correlationId: dto.correlationId,
    };

    const isSignatureValid = EncryptionUtil.verifySignature(
      requestBody,
      signature,
      adminPublicKey,
    );

    if (!isSignatureValid) {
      throw new BadRequestException('Invalid webhook signature - request verification failed');
    }

    return this.webhooksService.createClientWebhook(
      dto.encryptedPayload,
      dto.correlationId,
    );
  }

  /**
  @Get('public-key')
  @ApiOperation({
    summary: 'Get server public key for webhook encryption',
    description:
      'Admin backend uses this key to encrypt payloads before sending to webhooks',
  })
  @ApiResponse({
    status: 200,
    description: 'Public key in PEM format',
    schema: {
      example: {
        publicKey: '-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----',
      },
    },
  })
  getPublicKey() {
    const publicKey = process.env.WEBHOOK_PUBLIC_KEY;
    if (!publicKey) {
      throw new BadRequestException('Public key not configured on server');
    }
    return { publicKey };
  }

  /**
   * Retrieve webhook logs for auditing (requires AUTH)
   */
  @Get('logs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermission(Permission.READ_WEBHOOK_LOGS)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get webhook logs for organization',
  })
  @ApiResponse({
    status: 200,
    description: 'List of webhook logs',
  })
  async getWebhookLogs(
    @CurrentUser() user: UserPayload,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const limitNum = Math.min(parseInt(limit || '50'), 100);
    const offsetNum = parseInt(offset || '0');
    return this.webhooksService.getWebhookLogs(
      user.organizationId,
      limitNum,
      offsetNum,
    );
  }

  /**
   * Get webhook log by correlation ID
   */
  @Get('logs/:correlationId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermission(Permission.READ_WEBHOOK_LOGS)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get webhook log by correlation ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook log details',
  })
  async getWebhookLog(
    @Param('correlationId') correlationId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const log = await this.webhooksService.getWebhookLogByCorrelationId(
      correlationId,
    );
    if (!log || log.organizationId !== user.organizationId) {
      throw new BadRequestException('Webhook log not found');
    }
    return log;
  }
}
