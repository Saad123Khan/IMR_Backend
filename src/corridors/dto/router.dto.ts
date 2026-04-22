import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  MinLength,
  MaxLength,
  IsNumber,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { RoutingStrategy } from '../entities/router.entity';
import { RoutingRuleType } from '@src/common/enums';
import { MTOProvider } from '@src/common/enums';
import { IsGreaterThan } from '@src/common/validators/is-greater-than.validator';

export class RoutingRuleDto {
  @ApiProperty({
    description: 'Type of rule',
    example: RoutingRuleType.AMOUNT_RANGE,
    enum: RoutingRuleType,
  })
  @IsEnum(RoutingRuleType)
  @IsNotEmpty()
  ruleType!: RoutingRuleType;

  @ApiProperty({
    description: 'Rule value (MTO name, bank name, or threshold)',
    example: 'western_union',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  value!: string;

  @ApiProperty({
    description: 'Minimum amount for amount_range rules',
    example: 1000,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @ValidateIf((o) => o.ruleType === RoutingRuleType.AMOUNT_RANGE)
  minAmount?: number;

  @ApiProperty({
    description: 'Maximum amount for amount_range rules',
    example: 50000,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @ValidateIf((o) => o.ruleType === RoutingRuleType.AMOUNT_RANGE)
  @IsGreaterThan('minAmount', { message: 'maxAmount must be greater than minAmount' })
  maxAmount?: number;

  @ApiProperty({
    description: 'Target MTO to route to',
    example: MTOProvider.WESTERN_UNION,
    enum: MTOProvider,
  })
  @IsEnum(MTOProvider)
  @IsNotEmpty()
  target!: MTOProvider;

  @ApiProperty({
    description: 'Priority for rule matching',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  priority?: number;

  @ApiProperty({
    description: 'Whether this rule is active',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CreateRouterDto {
  @ApiProperty({
    description: 'Destination country code (ISO 3166-1 alpha-2)',
    example: 'PK',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(2)
  country!: string;

  @ApiProperty({
    description: 'Bank name',
    example: 'Bank of India',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  bankName!: string;

  @ApiProperty({
    description: 'Currency code (ISO 4217)',
    example: 'PKR',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(3)
  currency!: string;

  @ApiProperty({
    description: 'Payout type (bank, cash, mobile)',
    example: 'bank',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  payoutType!: string;

  @ApiProperty({
    description: 'Routing strategy',
    example: RoutingStrategy.MTO,
    enum: RoutingStrategy,
  })
  @IsEnum(RoutingStrategy)
  @IsOptional()
  strategy?: RoutingStrategy;

  @ApiProperty({
    description: 'Default routing choice',
    example: MTOProvider.WESTERN_UNION,
    enum: MTOProvider,
    required: false,
  })
  @IsEnum(MTOProvider)
  @IsOptional()
  defaultRoute?: MTOProvider;

  @ApiProperty({
    description: 'Routing rules',
    type: [RoutingRuleDto],
    required: false,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RoutingRuleDto)
  rules?: RoutingRuleDto[];

  @ApiProperty({
    description: 'Whether this router is active',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateRouterDto {
  @ApiProperty({
    description: 'Bank name',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(255)
  bankName?: string;

  @ApiProperty({
    description: 'Payout type',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  payoutType?: string;

  @ApiProperty({
    description: 'Routing strategy',
    enum: RoutingStrategy,
    required: false,
  })
  @IsEnum(RoutingStrategy)
  @IsOptional()
  strategy?: RoutingStrategy;

  @ApiProperty({
    description: 'Default routing choice',
    enum: MTOProvider,
    required: false,
  })
  @IsEnum(MTOProvider)
  @IsOptional()
  defaultRoute?: MTOProvider;

  @ApiProperty({
    description: 'Active status',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class AddRoutingRuleDto {
  @ApiProperty({
    description: 'Routing rule to add',
  })
  @ValidateNested()
  @Type(() => RoutingRuleDto)
  rule!: RoutingRuleDto;
}

export class UpdateRoutingRuleDto {
  @ApiProperty({
    description: 'Rule value',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  value?: string;

  @ApiProperty({
    description: 'Minimum amount',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  minAmount?: number;

  @ApiProperty({
    description: 'Maximum amount',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @IsGreaterThan('minAmount', { message: 'maxAmount must be greater than minAmount' })
  maxAmount?: number;

  @ApiProperty({
    description: 'Target MTO',
    example: MTOProvider.WESTERN_UNION,
    enum: MTOProvider,
    required: false,
  })
  @IsEnum(MTOProvider)
  @IsOptional()
  target?: MTOProvider;

  @ApiProperty({
    description: 'Priority',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  priority?: number;

  @ApiProperty({
    description: 'Active status',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
