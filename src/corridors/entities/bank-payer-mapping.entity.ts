import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('bank_payer_mappings')
@Index(['bankName', 'organizationId'])
@Index(['mto', 'organizationId'])
@Index(['bankName', 'mto', 'organizationId'], { unique: true })
export class BankPayerMapping {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Name of the bank (searchable)',
    example: 'Bank of India',
  })
  @Column({ type: 'varchar', length: 255 })
  @Index()
  bankName: string;

  @ApiProperty({
    description: 'Money Transfer Operator (MTO)',
    example: 'western_union',
    enum: ['western_union', 'moneygram', 'mastercard'],
  })
  @Column({ type: 'varchar', length: 50 })
  mto: string;

  @ApiProperty({
    description: 'Payer ID for this bank-MTO combination',
    example: '4421',
  })
  @Column({ type: 'varchar', length: 100 })
  payerId: string;

  @ApiProperty({
    description: 'Organization ID that owns this mapping',
  })
  @Column({ type: 'uuid' })
  organizationId: string;

  @ApiProperty({
    description: 'Whether this mapping is active',
    example: true,
  })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
