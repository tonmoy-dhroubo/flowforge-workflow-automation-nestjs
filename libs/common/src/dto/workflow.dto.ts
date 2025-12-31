import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';

export class TriggerDto {
  @IsString()
  type!: string;

  config!: Record<string, any>;
}

export class ActionDto {
  @IsString()
  type!: string;

  config!: Record<string, any>;
}

export class WorkflowRequestDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ValidateNested()
  @Type(() => TriggerDto)
  trigger!: TriggerDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActionDto)
  actions?: ActionDto[];
}

export class WorkflowResponseDto extends WorkflowRequestDto {
  id!: string;
  userId!: string;
  createdAt!: string;
  updatedAt!: string;
}

export class WorkflowSummaryDto {
  id!: string;
  name!: string;
  enabled!: boolean;
  createdAt!: string;
}
