import { IsNumber, IsBoolean, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFixedFeeDto {
  @ApiProperty({
    description: 'Threshold amount above which this fee applies (0 = always applies)',
    example: 1000,
    type: 'number',
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  thresholdAmount!: number;

  @ApiProperty({
    description: 'Fee amount',
    example: 10,
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

export class UpdateFixedFeeDto {
  @ApiProperty({
    description: 'Threshold amount above which this fee applies',
    example: 1000,
    type: 'number',
    required: false,
  })
  @IsNumber()
  @Min(0)
  thresholdAmount?: number;

  @ApiProperty({
    description: 'Fee amount',
    example: 10,
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
