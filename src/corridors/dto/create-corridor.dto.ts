import { IsEnum, IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MTOProvider, PaymentChannel, CorridorStatus, FeeType, MarginType } from '@src/common/enums';
import { COUNTRIES } from '@src/common/constants/countries';

export class CreateCorridorDto {
  @ApiProperty({
    description: 'MTO Provider',
    enum: MTOProvider,
    example: MTOProvider.WESTERN_UNION,
  })
  @IsEnum(MTOProvider)
  @IsNotEmpty()
  mto!: MTOProvider;

  @ApiProperty({
    description: 'Country name',
    example: 'USA',
    enum: COUNTRIES,
    enumName: 'Countries',
  })
  @IsString()
  @MinLength(2)
  @IsNotEmpty()
  country!: string;

  @ApiProperty({
    description: 'Payment Channel',
    enum: PaymentChannel,
    example: PaymentChannel.BANK,
  })
  @IsEnum(PaymentChannel)
  @IsNotEmpty()
  paymentChannel!: PaymentChannel;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD',
  })
  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  currency!: string;

  @ApiProperty({
    description: 'Corridor Status',
    enum: CorridorStatus,
    example: CorridorStatus.ACTIVE,
  })
  @IsEnum(CorridorStatus)
  @IsNotEmpty()
  status!: CorridorStatus;

  @ApiProperty({
    description: 'Fee Type',
    enum: FeeType,
    example: FeeType.FIXED_FEES,
  })
  @IsEnum(FeeType)
  @IsNotEmpty()
  feeType!: FeeType;

  @ApiProperty({
    description: 'Margin Type for FX rate margin',
    enum: MarginType,
    example: MarginType.FIXED_MARGIN,
  })
  @IsEnum(MarginType)
  @IsNotEmpty()
  marginType!: MarginType;
}