import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Corridor } from './corridor.entity';

@Entity('margin_slabs')
export class MarginSlab {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Corridor, corridor => corridor.marginSlabs, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'corridorId' })
  corridor: Corridor;

  @Column()
  corridorId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  minAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  maxAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  marginValue: number;

  @Column({ default: true })
  isPercentage: boolean;

  @Column({ default: true })
  isActive: boolean; // Whether this config is active

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
