import { IsString, MinLength, IsEmail, Matches, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { REGEX, VALIDATION_MESSAGES } from '@src/common/constants/validation';

export class LoginDto {
  @ApiProperty({
    description: 'User email address (required if phone is not provided)',
    example: 'user@example.com',
    required: false,
  })
  @IsEmail()
  @ValidateIf((o) => !o.phone)
  email?: string;

  @ApiProperty({
    description: 'User phone number (required if email is not provided)',
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
    description: 'User password',
    example: 'securePassword123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password!: string;
}