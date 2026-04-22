import { IsString, IsOptional, MinLength, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEmployeeDto {
  @ApiProperty({
    description: 'Employee full name',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  name?: string;

  @ApiProperty({
    description: 'Assign a custom role (by role ID). Cannot assign ORGANIZATION_OWNER role.',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  roleId?: string;

  @ApiProperty({
    description: 'Whether employee is active',
    required: false,
  })
  @IsOptional()
  isActive?: boolean;
}
