import { IsEmail, IsString, MinLength, IsOptional, Matches, IsUUID, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { REGEX, VALIDATION_MESSAGES } from '@src/common/constants/validation';

export class CreateEmployeeDto {
  @ApiProperty({
    description: 'Employee email address (required if phone is not provided)',
    example: 'employee@example.com',
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
  password!: string;

  @ApiProperty({
    description: 'Employee full name',
    example: 'Jane Doe',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({
    description: 'Custom role ID to assign to this employee (required). Organization owner cannot be assigned via this endpoint.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  roleId!: string;
}

