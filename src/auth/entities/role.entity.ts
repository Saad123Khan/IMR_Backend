import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Permission } from '@src/common/enums';

@Entity('roles')
@Index(['organizationId', 'name'], { unique: true })
@Index(['organizationId'])
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Role name',
    example: 'Finance Manager',
  })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({
    description: 'Role description',
    example: 'Manages financial operations and reports',
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({
    description: 'List of permissions for this role',
    enum: Permission,
    isArray: true,
  })
  @Column({ type: 'enum', enum: Permission, array: true, default: [] })
  permissions: Permission[];

  @ApiProperty({
    description: 'Organization ID that owns this role',
  })
  @Column({ type: 'uuid' })
  organizationId: string;

  @ApiProperty({
    description: 'Whether this role is active',
    example: true,
  })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
