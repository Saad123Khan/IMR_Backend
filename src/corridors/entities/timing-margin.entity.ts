import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Corridor } from './corridor.entity';

@Entity('timing_margins')
export class TimingMargin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Corridor, corridor => corridor.timingMargins, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'corridorId' })
  corridor: Corridor;

  @Column()
  corridorId: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column()
  startTime: string; // HH:MM format

  @Column()
  endTime: string; // HH:MM format

  @Column('simple-array')
  applicableDays: string[]; // Monday, Tuesday, etc

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
