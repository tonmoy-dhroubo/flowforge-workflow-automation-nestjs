import {
  Controller,
  Get,
  Headers,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtUserGuard } from '@flowforge/common';
import { WorkflowExecution } from './workflow-execution.entity';

type SortDirection = 'ASC' | 'DESC';

type Page<T> = {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

type ExecutionResponseDto = {
  id: string;
  workflowId: string;
  userId: string;
  status: string;
  currentStep: number;
  triggerPayload: Record<string, any> | null;
  stepOutputs: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
};

@Controller('api/v1/executions')
@UseGuards(JwtUserGuard)
export class ExecutionController {
  constructor(@InjectRepository(WorkflowExecution) private readonly repo: Repository<WorkflowExecution>) {}

  @Get()
  async listExecutions(
    @Headers('x-user-id') userId: string,
    @Query('workflowId') workflowId?: string,
    @Query('page') page = '0',
    @Query('size') size = '20',
    @Query('sort') sort = 'createdAt,desc',
  ): Promise<Page<ExecutionResponseDto>> {
    const pageNumber = Number.isFinite(Number(page)) ? Math.max(0, Number(page)) : 0;
    const pageSize = Number.isFinite(Number(size)) ? Math.max(1, Number(size)) : 20;
    const { property, direction } = this.parseSort(sort);

    const where: Record<string, any> = { userId };
    if (workflowId) where.workflowId = workflowId;

    const [rows, total] = await this.repo.findAndCount({
      where,
      order: { [property]: direction },
      take: pageSize,
      skip: pageNumber * pageSize,
    });

    return {
      content: rows.map((r) => this.toDto(r)),
      number: pageNumber,
      size: pageSize,
      totalElements: total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  @Get(':executionId')
  async getExecution(
    @Headers('x-user-id') userId: string,
    @Param('executionId') executionId: string,
  ): Promise<ExecutionResponseDto> {
    const execution = await this.repo.findOne({ where: { id: executionId, userId } });
    if (!execution) {
      throw new NotFoundException('Execution not found');
    }
    return this.toDto(execution);
  }

  @Post(':executionId/cancel')
  @HttpCode(200)
  async cancelExecution(
    @Headers('x-user-id') userId: string,
    @Param('executionId') executionId: string,
  ): Promise<ExecutionResponseDto> {
    const execution = await this.repo.findOne({ where: { id: executionId, userId } });
    if (!execution) {
      throw new NotFoundException('Execution not found');
    }

    if (execution.status === 'COMPLETED' || execution.status === 'FAILED') {
      return this.toDto(execution);
    }

    execution.status = 'CANCELLED';
    const saved = await this.repo.save(execution);
    return this.toDto(saved);
  }

  private toDto(execution: WorkflowExecution): ExecutionResponseDto {
    return {
      id: execution.id,
      workflowId: execution.workflowId,
      userId: execution.userId,
      status: execution.status,
      currentStep: execution.currentStep,
      triggerPayload: execution.triggerPayload ?? null,
      stepOutputs: execution.stepOutputs ?? null,
      createdAt: execution.createdAt.toISOString(),
      updatedAt: execution.updatedAt.toISOString(),
    };
  }

  private parseSort(sort: string): { property: keyof WorkflowExecution; direction: SortDirection } {
    const [rawProperty, rawDirection] = (sort ?? '').split(',', 2);
    const direction = (rawDirection ?? 'desc').trim().toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const property = (rawProperty ?? 'createdAt').trim() as keyof WorkflowExecution;
    if (property !== 'createdAt' && property !== 'updatedAt' && property !== 'status') {
      return { property: 'createdAt', direction };
    }
    return { property, direction };
  }
}
