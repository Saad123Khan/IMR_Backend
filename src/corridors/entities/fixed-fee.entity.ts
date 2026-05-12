import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Corridor } from './corridor.entity';

@Entity('fixed_fees')
export class FixedFee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Corridor, corridor => corridor.fixedFees, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'corridorId' })
  corridor: Corridor;

  @Column()
  corridorId: string;

  @Column('decimal', { precision: 15, scale: 2 })
  thresholdAmount: number; // Amount above which fixed fee applies

  @Column('decimal', { precision: 10, scale: 2 })
  feeAmount: number; // Fixed fee amount

  @Column({ default: false })
  isPercentage: boolean; // true if feeAmount is percentage

  @Column({ default: true })
  isActive: boolean; // Whether this config is active

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
