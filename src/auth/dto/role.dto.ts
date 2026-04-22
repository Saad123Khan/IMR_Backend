import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsEnum,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Permission } from '@src/common/enums';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Role name',
    example: 'Finance Manager',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  name!: string;

  @ApiProperty({
    description: 'Role description',
    example: 'Manages financial operations',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'List of permissions for this role',
    enum: Permission,
    isArray: true,
    example: [Permission.READ_CORRIDOR, Permission.UPDATE_CORRIDOR],
  })
  @IsArray()
  @IsEnum(Permission, { each: true })
  @IsNotEmpty()
  permissions!: Permission[];
}

export class UpdateRoleDto {
  @ApiProperty({
    description: 'Role name',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(255)
  name?: string;

  @ApiProperty({
    description: 'Role description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'List of permissions',
    enum: Permission,
    isArray: true,
    required: false,
  })
  @IsArray()
  @IsEnum(Permission, { each: true })
  @IsOptional()
  permissions?: Permission[];
}
