import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'workflow_executions' })
export class WorkflowExecution {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  workflowId!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column()
  status!: string;

  @Column({ default: 0 })
  currentStep!: number;

  @Column({ type: 'jsonb', nullable: true })
  triggerPayload!: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  stepOutputs!: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
