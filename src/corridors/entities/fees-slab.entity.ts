import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Corridor } from './corridor.entity';

@Entity('fees_slabs')
export class FeesSlab {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Corridor, corridor => corridor.feesSlabs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'corridorId' })
  corridor: Corridor;

  @Column()
  corridorId: string;

  @Column('decimal', { precision: 15, scale: 2 })
  minAmount: number;

  @Column('decimal', { precision: 15, scale: 2 })
  maxAmount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  feeAmount: number; // Fixed fee amount or percentage

  @Column({ default: false })
  isPercentage: boolean; // true if feeAmount is percentage, false if fixed

  @Column({ default: true })
  isActive: boolean; // Whether this config is active

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
