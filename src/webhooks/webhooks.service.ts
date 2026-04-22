import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { WebhookLog } from './entities/webhook-log.entity';
import { EncryptionUtil } from './utils/encryption.util';
import { WebhookCreateCorridorDto, WebhookResponseDto } from './dto/webhook-create-corridor.dto';
import { EncryptedWebhookClientPayloadDto, WebhookClientResponseDto, CreateClientPayloadDto } from './dto/webhook-create-client.dto';
import { CorridorsService } from '@src/corridors/corridors.service';
import { AuthService } from '@src/auth/auth.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);
  private privateKey: string;

  constructor(
    @InjectRepository(WebhookLog)
    private webhookLogRepository: Repository<WebhookLog>,
    private configService: ConfigService,
    private corridorsService: CorridorsService,
    private authService: AuthService,
  ) {
    // Load server's private key from env
    this.privateKey = this.configService.getOrThrow<string>('WEBHOOK_PRIVATE_KEY');
    if (!this.privateKey) {
      this.logger.warn(
        'WEBHOOK_PRIVATE_KEY not configured. Webhook signature verification will be disabled.',
      );
    }
  }

  /**
   * Decrypt encrypted webhook payload using server's private key
   */
  decryptPayload(encryptedPayload: string): WebhookCreateCorridorDto {
    if (!this.privateKey) {
      throw new BadRequestException('Webhook encryption not configured');
    }

    try {
      return EncryptionUtil.decryptWithPrivateKey(
        encryptedPayload,
        this.privateKey,
      ) as WebhookCreateCorridorDto;
    } catch (error) {
      this.logger.error('Decryption failed', error);
      throw new BadRequestException('Failed to decrypt webhook payload');
    }
  }

  /**
   * Decrypt encrypted webhook payload and parse as client creation payload
   */
  private decryptClientPayload(encryptedPayload: string): CreateClientPayloadDto {
    if (!this.privateKey) {
      throw new BadRequestException('Webhook encryption not configured');
    }

    try {
      const decrypted = EncryptionUtil.decryptWithPrivateKey(
        encryptedPayload,
        this.privateKey,
      );
      return decrypted as CreateClientPayloadDto;
    } catch (error) {
      this.logger.error('Decryption failed', error);
      throw new BadRequestException('Failed to decrypt webhook payload');
    }
  }

  /**
   * Process webhook to create corridor
   */
  async createCorridorWebhook(
    encryptedPayload: string,
    organizationId: string,
    correlationId?: string,
  ): Promise<WebhookResponseDto> {
    correlationId = correlationId || uuidv4();

    try {
      // Decrypt payload
      const payload = this.decryptPayload(encryptedPayload);

      // Validate organization matches
      if (payload.organizationId !== organizationId) {
        throw new BadRequestException(
          'Organization ID mismatch in encrypted payload',
        );
      }

      // Log webhook attempt
      const webhookLog = this.webhookLogRepository.create({
        organizationId,
        webhookType: 'create_corridor',
        payload,
        status: 'pending',
        correlationId,
      });
      await this.webhookLogRepository.save(webhookLog);

      // Create corridor via service
      const corridor = await this.corridorsService.create(payload, organizationId);

      // Update log to success
      webhookLog.status = 'success';
      await this.webhookLogRepository.save(webhookLog);

      // Build response
      const response: WebhookResponseDto = {
        success: true,
        corridorId: corridor.id,
        signature: this.signResponse({
          success: true,
          corridorId: corridor.id,
          timestamp: new Date().toISOString(),
          correlationId,
        }),
        timestamp: new Date().toISOString(),
        correlationId,
      };

      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      // Log failure
      const webhookLog = this.webhookLogRepository.create({
        organizationId,
        webhookType: 'create_corridor',
        status: 'failed',
        errorMessage,
        correlationId,
      });
      await this.webhookLogRepository.save(webhookLog);

      // Build error response
      const errorPayload = {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
        correlationId,
      };

      return {
        success: false,
        error: errorMessage,
        signature: this.signResponse(errorPayload),
        timestamp: new Date().toISOString(),
        correlationId,
      };
    }
  }

  /**
   * Process webhook to create a new client (organization + owner user)
   */
  async createClientWebhook(
    encryptedPayload: string,
    correlationId?: string,
  ): Promise<WebhookClientResponseDto> {
    correlationId = correlationId || uuidv4();

    try {
      // Decrypt payload
      const payload = this.decryptClientPayload(encryptedPayload);

      // Log webhook attempt
      const webhookLog = this.webhookLogRepository.create({
        webhookType: 'create_client',
        status: 'pending',
        correlationId,
        payload,
      });
      await this.webhookLogRepository.save(webhookLog);

      // Create client via auth service (creates organization + owner user)
      const result = await this.authService.signup({
        email: payload.email,
        phone: payload.phone,
        password: payload.password,
        name: payload.name,
        organizationName: payload.organizationName,
      });

      // Update log to success
      webhookLog.status = 'success';
      await this.webhookLogRepository.save(webhookLog);

      // Build response
      const response: WebhookClientResponseDto = {
        success: true,
        userId: result.user.id,
        organizationId: result.user.organizationId,
        accessToken: result.access_token,
        signature: this.signResponse({
          success: true,
          userId: result.user.id,
          organizationId: result.user.organizationId,
          timestamp: new Date().toISOString(),
          correlationId,
        }),
        timestamp: new Date().toISOString(),
        correlationId,
      };

      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      // Log failure
      const webhookLog = this.webhookLogRepository.create({
        webhookType: 'create_client',
        status: 'failed',
        errorMessage,
        correlationId,
      });
      await this.webhookLogRepository.save(webhookLog);

      // Re-throw error so controller can catch it
      throw error;
    }
  }

  /**
   * Sign response with server's private key
   */
  private signResponse(payload: Record<string, any>): string {
    if (!this.privateKey) {
      this.logger.warn('Cannot sign response: private key not configured');
      return '';
    }

    try {
      return EncryptionUtil.signWithPrivateKey(payload, this.privateKey);
    } catch (error) {
      this.logger.error('Failed to sign response', error);
      return '';
    }
  }

  /**
   * Get webhook logs for audit trail
   */
  async getWebhookLogs(
    organizationId: string,
    limit: number = 50,
    offset: number = 0,
  ) {
    return this.webhookLogRepository.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get webhook log by correlation ID
   */
  async getWebhookLogByCorrelationId(correlationId: string) {
    return this.webhookLogRepository.findOne({
      where: { correlationId },
    });
  }
}
