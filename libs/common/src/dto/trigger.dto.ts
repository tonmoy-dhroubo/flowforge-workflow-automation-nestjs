import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class TriggerRegistrationDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  workflowId!: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsString()
  triggerType!: string;

  @IsOptional()
  @IsObject()
  configuration?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsString()
  webhookUrl?: string;

  @IsOptional()
  @IsString()
  webhookToken?: string;

  @IsOptional()
  @IsString()
  createdAt?: string;

  @IsOptional()
  @IsString()
  updatedAt?: string;
}

export class WebhookPayloadDto {
  @IsObject()
  headers!: Record<string, string | string[]>;

  @IsObject()
  queryParams!: Record<string, string | string[]>;

  @IsOptional()
  @IsObject()
  body?: Record<string, any>;

  @IsString()
  method!: string;

  @IsString()
  remoteAddress!: string;
}

export class TriggerEventDto {
  @IsString()
  eventId!: string;

  @IsString()
  triggerId!: string;

  @IsString()
  workflowId!: string;

  @IsString()
  userId!: string;

  @IsString()
  triggerType!: string;

  @IsString()
  timestamp!: string;

  @IsObject()
  payload!: Record<string, any>;

  @IsObject()
  metadata!: Record<string, any>;
}
