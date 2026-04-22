import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Router } from './router.entity';
import { RoutingRuleType, MTOProvider } from '@src/common/enums';

@Entity('routing_rules')
@Index(['routerId', 'ruleType'])
@Index(['routerId', 'value'])
export class RoutingRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Router that this rule belongs to',
  })
  @Column({ type: 'uuid' })
  routerId: string;

  @ManyToOne(() => Router, (router) => router.rules, { onDelete: 'CASCADE' })
  router: Router;

  @ApiProperty({
    description: 'Type of rule',
    example: 'amount_range',
    enum: RoutingRuleType,
  })
  @Column({ type: 'enum', enum: RoutingRuleType })
  ruleType: RoutingRuleType;

  @ApiProperty({
    description: 'Routing value (MTO name, bank name, or amount threshold)',
    example: 'western_union',
  })
  @Column({ type: 'varchar', length: 255 })
  value: string;

  @ApiProperty({
    description: 'Minimum amount for amount_range rules',
    example: 1000,
    nullable: true,
  })
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  minAmount: number;

  @ApiProperty({
    description: 'Maximum amount for amount_range rules',
    example: 50000,
    nullable: true,
  })
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  maxAmount: number;

  @ApiProperty({
    description: 'Target MTO to route to',
    example: MTOProvider.WESTERN_UNION,
    enum: MTOProvider,
  })
  @Column({ type: 'enum', enum: MTOProvider })
  target: MTOProvider;

  @ApiProperty({
    description: 'Priority for rule matching (lower = higher priority)',
    example: 1,
  })
  @Column({ type: 'integer', default: 100 })
  priority: number;

  @ApiProperty({
    description: 'Whether this rule is active',
    example: true,
  })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
