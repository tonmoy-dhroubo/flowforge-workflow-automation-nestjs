import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'workflows' })
export class Workflow {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ default: true })
  enabled!: boolean;

  @Column({ type: 'jsonb' })
  triggerDefinition!: Record<string, any>;

  @Column({ type: 'jsonb' })
  actionsDefinition!: Record<string, any>[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
