import { IsNumber, IsBoolean, IsNotEmpty, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFixedMarginDto {
  @ApiProperty({
    description: 'Threshold amount above which this margin applies',
    example: 5000,
    type: 'number',
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  thresholdAmount!: number;

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
}

export class UpdateFixedMarginDto {
  @ApiProperty({
    description: 'Threshold amount above which this margin applies',
    example: 5000,
    type: 'number',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  thresholdAmount?: number;

  @ApiProperty({
    description: 'Margin value (percentage by default)',
    example: 0.5,
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
