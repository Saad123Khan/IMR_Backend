import { IsString,IsNumber, IsBoolean, IsNotEmpty, Min, IsOptional, IsArray, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { REGEX, VALIDATION_MESSAGES } from '@src/common/constants/validation';

const VALID_MARGIN_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export class CreateTimingMarginDto {
  @ApiProperty({
    description: 'Start date (YYYY-MM-DD)',
    example: '2024-01-15',
    type: 'string',
  })
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'startDate must be in YYYY-MM-DD format' })
  startDate!: string;

  @ApiProperty({
    description: 'End date (YYYY-MM-DD), optional',
    example: '2024-12-31',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'endDate must be in YYYY-MM-DD format' })
  endDate?: string;

  @ApiProperty({
    description: 'Start time (HH:MM format, 24-hour)',
    example: '09:00',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(REGEX.TIME, {
    message: VALIDATION_MESSAGES.TIME,
  })
  startTime!: string;

  @ApiProperty({
    description: 'End time (HH:MM format, 24-hour)',
    example: '17:00',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(REGEX.TIME, {
    message: VALIDATION_MESSAGES.TIME,
  })
  endTime!: string;

  @ApiProperty({
    description: 'Applicable days of the week',
    example: ['Monday', 'Tuesday', 'Wednesday'],
    type: 'array',
    items: {
      type: 'string',
      enum: VALID_MARGIN_DAYS,
    },
  })
  @IsArray()
  @IsNotEmpty()
  applicableDays!: string[];

  @ApiProperty({
    description: 'Margin value (percentage by default)',
    example: 0.15,
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

export class UpdateTimingMarginDto {
  @ApiProperty({
    description: 'Start date (YYYY-MM-DD)',
    example: '2024-01-15',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'startDate must be in YYYY-MM-DD format' })
  startDate?: string;

  @ApiProperty({
    description: 'End date (YYYY-MM-DD), optional',
    example: '2024-12-31',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'endDate must be in YYYY-MM-DD format' })
  endDate?: string;

  @ApiProperty({
    description: 'Start time (HH:MM format, 24-hour)',
    example: '09:00',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(REGEX.TIME, {
    message: VALIDATION_MESSAGES.TIME,
  })
  startTime?: string;

  @ApiProperty({
    description: 'End time (HH:MM format, 24-hour)',
    example: '17:00',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(REGEX.TIME, {
    message: VALIDATION_MESSAGES.TIME,
  })
  endTime?: string;

  @ApiProperty({
    description: 'Applicable days of the week',
    example: ['Monday', 'Tuesday', 'Wednesday'],
    type: 'array',
    items: {
      type: 'string',
      enum: VALID_MARGIN_DAYS,
    },
    required: false,
  })
  @IsOptional()
  @IsArray()
  applicableDays?: string[];

  @ApiProperty({
    description: 'Margin value (percentage by default)',
    example: 0.15,
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
