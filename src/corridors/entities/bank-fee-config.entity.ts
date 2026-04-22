import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Corridor } from './corridor.entity';

@Entity('bank_fee_configs')
export class BankFeeConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Corridor, corridor => corridor.bankFeeConfigs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'corridorId' })
  corridor: Corridor;

  @Column()
  corridorId: string;

  @Column()
  bankName: string; // Name of the bank within the country

  @Column()
  currency: string; // Currency code (e.g., USD, EUR, GBP)

  @Column('decimal', { precision: 10, scale: 2 })
  bankFeeAmount: number; // Fee charged by bank

  @Column({ default: false })
  isPercentage: boolean; // true if bankFeeAmount is percentage

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
