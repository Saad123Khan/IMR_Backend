import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Organization } from '@src/organizations/entities/organization.entity';
import { Role } from '@src/auth/entities/role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ unique: true, nullable: true })
  phone: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  name: string;

  // Note: `defaultRole` was removed — use `roleId` -> `Role.permissions` for permission checks.
  @ManyToOne(() => Role, { nullable: true })
  @JoinColumn({ name: 'roleId' })
  role?: Role;

  @Column({ type: 'uuid', nullable: true })
  roleId?: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Organization, organization => organization.users, { nullable: true })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ nullable: true })
  organizationId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
