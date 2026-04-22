import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { RoutingRule } from './routing-rule.entity';
import { MTOProvider } from '@src/common/enums';

export enum RoutingStrategy {
  MTO = 'mto',
  AMOUNT = 'amount',
  BANK = 'bank',
}

@Entity('routers')
@Index(['country', 'bankName', 'currency', 'organizationId'], { unique: true })
@Index(['country', 'organizationId'])
@Index(['bankName', 'organizationId'])
export class Router {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Destination country code (ISO 3166-1 alpha-2)',
    example: 'PK',
  })
  @Column({ type: 'varchar', length: 2 })
  country: string;

  @ApiProperty({
    description: 'Bank name for this routing configuration',
    example: 'Bank of India',
  })
  @Column({ type: 'varchar', length: 255 })
  bankName: string;

  @ApiProperty({
    description: 'Currency code (ISO 4217)',
    example: 'PKR',
  })
  @Column({ type: 'varchar', length: 3 })
  currency: string;

  @ApiProperty({
    description: 'Routing strategy: mto, amount, or bank',
    enum: RoutingStrategy,
    example: RoutingStrategy.MTO,
  })
  @Column({ type: 'enum', enum: RoutingStrategy, default: RoutingStrategy.MTO })
  strategy: RoutingStrategy;

  @ApiProperty({
    description: 'Default routing choice (can be overridden by rules)',
    example: MTOProvider.WESTERN_UNION,
    enum: MTOProvider,
  })
  @Column({ type: 'enum', enum: MTOProvider, nullable: true })
  defaultRoute: MTOProvider;

  @ApiProperty({
    description: 'Payout type (bank, cash, mobile)',
    example: 'bank',
  })
  @Column({ type: 'varchar', length: 50 })
  payoutType: string;

  @ApiProperty({
    description: 'Organization ID that owns this router',
  })
  @Column({ type: 'uuid' })
  organizationId: string;

  @ApiProperty({
    description: 'Whether this router is active',
    example: true,
  })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => RoutingRule, (rule) => rule.router, { cascade: true, onDelete: 'CASCADE' })
  rules: RoutingRule[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
