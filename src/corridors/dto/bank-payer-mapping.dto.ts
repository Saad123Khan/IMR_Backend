import { IsString, IsNotEmpty, IsEnum, IsOptional, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MTOProvider } from '@src/common/enums';

export class CreateBankPayerMappingDto {
  @ApiProperty({
    description: 'Name of the bank',
    example: 'Bank of India',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  bankName!: string;

  @ApiProperty({
    description: 'Money Transfer Operator',
    example: 'western_union',
    enum: ['western_union', 'moneygram', 'mastercard'],
  })
  @IsEnum(MTOProvider)
  @IsNotEmpty()
  mto!: MTOProvider;

  @ApiProperty({
    description: 'Payer ID for this bank-MTO combination',
    example: '4421',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  payerId!: string;

  @ApiProperty({
    description: 'Whether this mapping is active',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}

export class UpdateBankPayerMappingDto {
  @ApiProperty({
    description: 'Bank name',
    example: 'Bank of India',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(255)
  bankName?: string;

  @ApiProperty({
    description: 'Money Transfer Operator',
    example: 'moneygram',
    enum: ['western_union', 'moneygram', 'mastercard'],
    required: false,
  })
  @IsEnum(MTOProvider)
  @IsOptional()
  mto?: MTOProvider;

  @ApiProperty({
    description: 'Payer ID',
    example: 'MG3221',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(100)
  payerId?: string;

  @ApiProperty({
    description: 'Active status',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
