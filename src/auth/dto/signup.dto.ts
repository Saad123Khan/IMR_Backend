import { IsEmail, IsString, MinLength, IsOptional, Matches, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { REGEX, VALIDATION_MESSAGES } from '@src/common/constants/validation';

export class SignupDto {
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
    description: 'Password',
    example: 'securePassword123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Full name',
    example: 'John Doe',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    description: 'Organization name',
    example: 'Acme Corp',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  organizationName: string;
}
