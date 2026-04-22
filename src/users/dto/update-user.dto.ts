import { IsEmail, IsString, MinLength, IsOptional, Matches, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@src/common/enums';
import { REGEX, VALIDATION_MESSAGES } from '@src/common/constants/validation';

export class UpdateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'International phone number',
    example: '+1234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(REGEX.PHONE, {
    message: VALIDATION_MESSAGES.PHONE,
  })
  phone?: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    required: false,
  })
  @IsString()
  @MinLength(2)
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    required: false,
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
