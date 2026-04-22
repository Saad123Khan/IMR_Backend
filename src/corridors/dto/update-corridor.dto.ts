import { IsEnum, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MTOProvider, PaymentChannel, CorridorStatus, FeeType, MarginType } from '@src/common/enums';
import { COUNTRIES } from '@src/common/constants/countries';

export class UpdateCorridorDto {
  @ApiProperty({
    description: 'MTO Provider',
    enum: MTOProvider,
    required: false,
  })
  @IsEnum(MTOProvider)
  @IsOptional()
  mto?: MTOProvider;

  @ApiProperty({
    description: 'Country name',
    enum: COUNTRIES,
    enumName: 'Countries',
    required: false,
  })
  @IsString()
  @MinLength(2)
  @IsOptional()
  country?: string;

  @ApiProperty({
    description: 'Payment Channel',
    enum: PaymentChannel,
    required: false,
  })
  @IsEnum(PaymentChannel)
  @IsOptional()
  paymentChannel?: PaymentChannel;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD',
    required: false,
  })
  @IsString()
  @MinLength(3)
  @IsOptional()
  currency?: string;

  @ApiProperty({
    description: 'Corridor Status',
    enum: CorridorStatus,
    required: false,
  })
  @IsEnum(CorridorStatus)
  @IsOptional()
  status?: CorridorStatus;

  @ApiProperty({
    description: 'Fee Type',
    enum: FeeType,
    required: false,
  })
  @IsEnum(FeeType)
  @IsOptional()
  feeType?: FeeType;

  @ApiProperty({
    description: 'Margin Type for FX rate margin',
    enum: MarginType,
    required: false,
  })
  @IsEnum(MarginType)
  @IsOptional()
  marginType?: MarginType;
}