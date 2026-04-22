import { IsNumber, IsBoolean, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsGreaterThan } from '@src/common/validators/is-greater-than.validator';

export class CreateFeesSlabDto {
  @ApiProperty({
    description: 'Minimum amount for this fee slab',
    example: 0,
    type: 'number',
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  minAmount!: number;

  @ApiProperty({
    description: 'Maximum amount for this fee slab',
    example: 1000,
    type: 'number',
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @IsGreaterThan('minAmount', { message: 'maxAmount must be greater than minAmount' })
  maxAmount!: number;

  @ApiProperty({
    description: 'Fee amount for this range',
    example: 5,
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
}

export class UpdateFeesSlabDto {
  @ApiProperty({
    description: 'Minimum amount for this fee slab',
    example: 0,
    type: 'number',
    required: false,
  })
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @ApiProperty({
    description: 'Maximum amount for this fee slab',
    example: 1000,
    type: 'number',
    required: false,
  })
  @IsNumber()
  @Min(0)
  maxAmount?: number;

  @ApiProperty({
    description: 'Fee amount for this range',
    example: 5,
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
}
