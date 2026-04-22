import { IsString, IsNumber, IsBoolean, IsNotEmpty, IsOptional, Min, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { REGEX, VALIDATION_MESSAGES } from '@src/common/constants/validation';

export class CreateBankFeeConfigDto {
  @ApiProperty({
    description: 'Bank name',
    example: 'Chase Bank',
  })
  @IsString()
  @IsNotEmpty()
  bankName!: string;

  @ApiProperty({
    description: 'Currency code (3 uppercase letters)',
    example: 'USD',
    minLength: 3,
    maxLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 3, { message: 'Currency code must be exactly 3 letters' })
  @Matches(REGEX.CURRENCY_CODE, { message: VALIDATION_MESSAGES.CURRENCY_CODE })
  currency!: string; // Currency code

  @ApiProperty({
    description: 'Fee amount charged by bank',
    example: 2.5,
    type: 'number',
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  bankFeeAmount!: number;

  @ApiProperty({
    description: 'Whether fee amount is a percentage',
    example: false,
    type: 'boolean',
  })
  @IsBoolean()
  isPercentage!: boolean;

  @ApiProperty({
    description: 'Whether this configuration is active',
    example: true,
    type: 'boolean',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateBankFeeConfigDto {
  @ApiProperty({
    description: 'Bank name',
    example: 'Chase Bank',
    required: false,
  })
  @IsString()
  bankName?: string;

  @ApiProperty({
    description: 'Currency code (3 uppercase letters)',
    example: 'USD',
    minLength: 3,
    maxLength: 3,
    required: false,
  })
  @IsString()
  @Length(3, 3, { message: 'Currency code must be exactly 3 letters' })
  @Matches(REGEX.CURRENCY_CODE, { message: VALIDATION_MESSAGES.CURRENCY_CODE })
  currency?: string;

  @ApiProperty({
    description: 'Fee amount charged by bank',
    example: 2.5,
    type: 'number',
    required: false,
  })
  @IsNumber()
  @Min(0)
  bankFeeAmount?: number;

  @ApiProperty({
    description: 'Whether fee amount is a percentage',
    example: false,
    type: 'boolean',
    required: false,
  })
  @IsBoolean()
  isPercentage?: boolean;

  @ApiProperty({
    description: 'Whether this configuration is active',
    example: true,
    type: 'boolean',
    required: false,
  })
  @IsBoolean()
  isActive?: boolean;
}
