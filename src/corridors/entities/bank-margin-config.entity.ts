import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Corridor } from './corridor.entity';

@Entity('bank_margin_configs')
export class BankMarginConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Corridor, corridor => corridor.bankMarginConfigs, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'corridorId' })
  corridor: Corridor;

  @Column()
  corridorId: string;

  @Column()
  bankName: string;

  @Column({ length: 3 })
  currency: string; // 3-letter currency code

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  marginValue: number;

  @Column({ default: true })
  isPercentage: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
