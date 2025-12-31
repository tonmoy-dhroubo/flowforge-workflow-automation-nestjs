import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'trigger_registrations' })
@Index(['workflowId'])
@Index(['userId'])
@Index(['webhookToken'], { unique: true })
export class TriggerRegistration {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  workflowId!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column()
  triggerType!: string;

  @Column({ type: 'jsonb', nullable: true })
  configuration!: Record<string, any> | null;

  @Column({ default: true })
  enabled!: boolean;

  @Column({ nullable: true })
  webhookUrl?: string;

  @Column({ nullable: true })
  webhookToken?: string;

  @Column({ type: 'timestamptz', nullable: true })
  lastTriggeredAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  nextScheduledAt?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
