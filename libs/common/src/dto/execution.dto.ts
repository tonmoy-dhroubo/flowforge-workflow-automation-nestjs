import { IsNumber, IsObject, IsString } from 'class-validator';

export class ExecutionStartDto {
  @IsString()
  executionId!: string;

  @IsString()
  workflowId!: string;

  @IsString()
  userId!: string;

  @IsNumber()
  stepIndex!: number;

  @IsString()
  actionType!: string;

  @IsObject()
  actionConfig!: Record<string, any>;

  @IsObject()
  triggerPayload!: Record<string, any>;

  @IsObject()
  context!: Record<string, any>;
}

export class ExecutionResultDto {
  @IsString()
  executionId!: string;

  @IsString()
  workflowId!: string;

  @IsString()
  userId!: string;

  @IsNumber()
  stepIndex!: number;

  @IsString()
  status!: string;

  @IsObject()
  output?: Record<string, any>;

  @IsString()
  errorMessage?: string;
}
