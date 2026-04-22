import { IsNumber, IsBoolean, IsNotEmpty, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsGreaterThan } from '@src/common/validators/is-greater-than.validator';

export class CreateMarginSlabDto {
  @ApiProperty({
    description: 'Minimum amount for this slab',
    example: 0,
    type: 'number',
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  minAmount!: number;

  @ApiProperty({
    description: 'Maximum amount for this slab',
    example: 5000,
    type: 'number',
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @IsGreaterThan('minAmount', { message: 'maxAmount must be greater than minAmount' })
  maxAmount!: number;

  @ApiProperty({
    description: 'Margin value (percentage by default)',
    example: 0.25,
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
}

export class UpdateMarginSlabDto {
  @ApiProperty({
    description: 'Minimum amount for this slab',
    example: 0,
    type: 'number',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  minAmount?: number;

  @ApiProperty({
    description: 'Maximum amount for this slab',
    example: 5000,
    type: 'number',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  maxAmount?: number;

  @ApiProperty({
    description: 'Margin value (percentage by default)',
    example: 0.25,
    type: 'number',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  marginValue?: number;

  @ApiProperty({
    description: 'Is percentage value (default: true)',
    example: true,
    type: 'boolean',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isPercentage?: boolean;
}
