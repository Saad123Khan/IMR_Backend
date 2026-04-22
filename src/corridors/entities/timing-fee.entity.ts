import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Corridor } from './corridor.entity';

@Entity('timing_fees')
export class TimingFee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Corridor, corridor => corridor.timingFees, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'corridorId' })
  corridor: Corridor;

  @Column()
  corridorId: string;

  @Column({ type: 'date', nullable: true })
  startDate: string; // e.g., "2024-01-01"

  @Column({ type: 'date', nullable: true })
  endDate: string; // e.g., "2024-12-31"

  @Column({ type: 'time' })
  startTime: string; // e.g., "09:00"

  @Column({ type: 'time' })
  endTime: string; // e.g., "17:00"

  @Column({ type: 'simple-array' })
  applicableDays: string[]; // e.g., ['MONDAY', 'TUESDAY', ...]

  @Column('decimal', { precision: 10, scale: 2 })
  feeAmount: number; // Fee for this time window

  @Column({ default: false })
  isPercentage: boolean; // true if feeAmount is percentage

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
