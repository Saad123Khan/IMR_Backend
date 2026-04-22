import { IsString, IsNumber, IsBoolean, IsNotEmpty, Min, IsOptional, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { REGEX, VALIDATION_MESSAGES } from '@src/common/constants/validation';

export class CreateBankMarginConfigDto {
  @ApiProperty({
    description: 'Bank name',
    example: 'Chase Bank',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  bankName!: string;

  @ApiProperty({
    description: 'Currency code (3 uppercase letters)',
    example: 'USD',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  @Matches(REGEX.CURRENCY_CODE, {
    message: VALIDATION_MESSAGES.CURRENCY_CODE,
  })
  currency!: string;

  @ApiProperty({
    description: 'Margin value (percentage by default)',
    example: 0.5,
    type: 'number',
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  marginValue!: number;

  @ApiProperty({
    description: 'Is percentage value (default: true)',
    example: true,
    type: 'boolean',
  })
  @IsBoolean()
  @IsOptional()
  isPercentage?: boolean = true;

  @ApiProperty({
    description: 'Is active (default: true)',
    example: true,
    type: 'boolean',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}

export class UpdateBankMarginConfigDto {
  @ApiProperty({
    description: 'Bank name',
    example: 'Chase Bank',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiProperty({
    description: 'Currency code (3 uppercase letters)',
    example: 'USD',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  @Matches(REGEX.CURRENCY_CODE, {
    message: VALIDATION_MESSAGES.CURRENCY_CODE,
  })
  currency?: string;

  @ApiProperty({
    description: 'Margin value (percentage by default)',
    example: 0.5,
    type: 'number',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  marginValue?: number;

  @ApiProperty({
    description: 'Is percentage value (default: true)',
    example: true,
    type: 'boolean',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPercentage?: boolean;

  @ApiProperty({
    description: 'Is active (default: true)',
    example: true,
    type: 'boolean',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
