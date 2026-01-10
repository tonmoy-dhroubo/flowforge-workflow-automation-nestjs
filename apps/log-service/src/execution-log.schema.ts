import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'execution_logs' })
export class ExecutionLog extends Document {
  @Prop()
  userId!: string | null;

  @Prop()
  executionId!: string | null;

  @Prop()
  eventId!: string | null;

  @Prop()
  workflowId!: string | null;

  @Prop()
  eventType!: string;

  @Prop()
  status!: string;

  @Prop({ type: Object })
  data!: Record<string, any>;

  @Prop({ default: Date.now })
  timestamp!: Date;
}

export const ExecutionLogSchema = SchemaFactory.createForClass(ExecutionLog);
