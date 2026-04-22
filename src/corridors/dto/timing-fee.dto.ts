import { IsString, IsNumber, IsBoolean, IsNotEmpty, IsOptional, IsArray, Min, IsDateString, Matches, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { REGEX, VALID_DAYS, VALIDATION_MESSAGES } from '@src/common/constants/validation';

export class CreateTimingFeeDto {
  @ApiProperty({
    description: 'Start date in YYYY-MM-DD format',
    example: '2024-01-01',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  startDate?: string; // YYYY-MM-DD format

  @ApiProperty({
    description: 'End date in YYYY-MM-DD format',
    example: '2024-12-31',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  endDate?: string; // YYYY-MM-DD format

  @ApiProperty({
    description: 'Start time in HH:MM format (24-hour)',
    example: '09:00',
  })
  @Matches(REGEX.TIME, { message: VALIDATION_MESSAGES.TIME })
  @IsNotEmpty()
  startTime!: string; // HH:MM format

  @ApiProperty({
    description: 'End time in HH:MM format (24-hour)',
    example: '17:00',
  })
  @Matches(REGEX.TIME, { message: VALIDATION_MESSAGES.TIME })
  @IsNotEmpty()
  endTime!: string; // HH:MM format

  @ApiProperty({
    description: 'Applicable days',
    enum: VALID_DAYS,
    isArray: true,
    example: ['MONDAY', 'TUESDAY', 'WEDNESDAY'],
  })
  @IsArray()
  @IsNotEmpty()
  @IsIn(VALID_DAYS, { each: true, message: VALIDATION_MESSAGES.VALID_DAY })
  applicableDays!: string[]; // ['MONDAY', 'TUESDAY', ...]

  @ApiProperty({
    description: 'Fee amount',
    example: 5.99,
    type: 'number',
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  feeAmount!: number;

  @ApiProperty({
    description: 'Whether fee amount is a percentage',
    example: false,
    type: 'boolean',
  })
  @IsBoolean()
  isPercentage!: boolean;

  @ApiProperty({
    description: 'Whether this fee is active',
    example: true,
    type: 'boolean',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateTimingFeeDto {
  @ApiProperty({
    description: 'Start date in YYYY-MM-DD format',
    example: '2024-01-01',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({
    description: 'End date in YYYY-MM-DD format',
    example: '2024-12-31',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({
    description: 'Start time in HH:MM format (24-hour)',
    example: '09:00',
    required: false,
  })
  @Matches(REGEX.TIME, { message: VALIDATION_MESSAGES.TIME })
  @IsOptional()
  startTime?: string;

  @ApiProperty({
    description: 'End time in HH:MM format (24-hour)',
    example: '17:00',
    required: false,
  })
  @Matches(REGEX.TIME, { message: VALIDATION_MESSAGES.TIME })
  @IsOptional()
  endTime?: string;

  @ApiProperty({
    description: 'Applicable days',
    enum: VALID_DAYS,
    isArray: true,
    example: ['MONDAY', 'TUESDAY'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  @IsIn(VALID_DAYS, { each: true, message: VALIDATION_MESSAGES.VALID_DAY })
  applicableDays?: string[];

  @ApiProperty({
    description: 'Fee amount',
    example: 5.99,
    type: 'number',
    required: false,
  })
  @IsNumber()
  @Min(0)
  feeAmount?: number;

  @ApiProperty({
    description: 'Whether fee amount is a percentage',
    example: false,
    type: 'boolean',
    required: false,
  })
  @IsBoolean()
  isPercentage?: boolean;

  @ApiProperty({
    description: 'Whether this fee is active',
    example: true,
    type: 'boolean',
    required: false,
  })
  @IsBoolean()
  isActive?: boolean;
}
