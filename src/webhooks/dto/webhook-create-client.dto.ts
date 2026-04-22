import { IsString, IsEmail, MinLength, IsOptional, Matches, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { REGEX, VALIDATION_MESSAGES } from '@src/common/constants/validation';

/**
 * This DTO represents the decrypted payload sent to the webhook endpoint
 * for creating a new client (organization + owner user)
 */
export class CreateClientPayloadDto {
  @ApiProperty({
    description: 'User email address (required if phone is not provided)',
    example: 'user@example.com',
    required: false,
  })
  @IsEmail()
  @ValidateIf((o) => !o.phone)
  email?: string;

  @ApiProperty({
    description: 'International phone number format (required if email is not provided)',
    example: '+1234567890',
    required: false,
  })
  @IsString()
  @ValidateIf((o) => !o.email)
  @Matches(REGEX.PHONE, {
    message: VALIDATION_MESSAGES.PHONE,
  })
  phone?: string;

  @ApiProperty({
    description: 'Password for the organization owner',
    example: 'securePassword123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({
    description: 'Full name of the organization owner',
    example: 'John Doe',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({
    description: 'Organization name',
    example: 'Acme Corp',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  organizationName!: string;
}

/**
 * Request DTO for encrypted webhook payload (same as corridors)
 */
export class EncryptedWebhookClientPayloadDto {
  @ApiProperty({
    description: 'RSA-encrypted client creation payload (base64)',
    example: 'base64-encoded-data',
  })
  @IsString()
  encryptedPayload!: string;

  @ApiProperty({
    description: 'Correlation ID for tracing the request',
    example: 'correlation-uuid',
    required: false,
  })
  @IsOptional()
  @IsString()
  correlationId?: string;
}

/**
 * Response DTO for successful client creation
 */
export class WebhookClientResponseDto {
  @ApiProperty({
    description: 'Success indicator',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Created user ID',
    example: 'user-uuid',
  })
  userId!: string;

  @ApiProperty({
    description: 'Created organization ID',
    example: 'org-uuid',
  })
  organizationId!: string;

  @ApiProperty({
    description: 'Access token for the newly created user',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'Response signature (base64) - verify using server public key',
    example: 'base64-signature',
  })
  signature!: string;

  @ApiProperty({
    description: 'Timestamp of the response',
    example: '2024-01-30T12:00:00Z',
  })
  timestamp!: string;

  @ApiProperty({
    description: 'Correlation ID from the request',
    example: 'correlation-uuid',
    required: false,
  })
  correlationId?: string;
}
