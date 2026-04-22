import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('webhook_logs')
@Index(['organizationId', 'createdAt'])
@Index(['status'])
export class WebhookLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  organizationId: string;

  @Column()
  webhookType: string; // e.g., 'create_corridor'

  @Column('jsonb', { nullable: true })
  payload: Record<string, any>;

  @Column()
  status: 'success' | 'failed' | 'pending';

  @Column({ nullable: true })
  errorMessage?: string;

  @Column({ nullable: true })
  correlationId?: string; // For tracking admin requests

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
