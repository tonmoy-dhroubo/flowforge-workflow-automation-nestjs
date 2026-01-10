import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExecutionLog } from './execution-log.schema';

type SortDirection = 1 | -1;

type Page<T> = {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

type ExecutionLogResponseDto = {
  id: string;
  userId: string | null;
  workflowId: string | null;
  executionId: string | null;
  eventId: string | null;
  eventType: string;
  status: string;
  data: Record<string, any> | null;
  timestamp: string;
};

@Injectable()
export class LoggingService {
  constructor(@InjectModel(ExecutionLog.name) private readonly model: Model<ExecutionLog>) {}

  async log(event: Partial<ExecutionLog>) {
    await this.model.create(event);
  }

  async search(params: {
    userId: string;
    executionId?: string;
    eventId?: string;
    workflowId?: string;
    eventType?: string;
    status?: string;
    from?: Date;
    to?: Date;
    page: number;
    size: number;
    sort: { field: 'timestamp'; direction: SortDirection };
  }): Promise<Page<ExecutionLogResponseDto>> {
    const filter: Record<string, any> = { userId: params.userId };

    if (params.executionId) filter.executionId = params.executionId;
    if (params.eventId) filter.eventId = params.eventId;
    if (params.workflowId) filter.workflowId = params.workflowId;
    if (params.eventType) filter.eventType = params.eventType;
    if (params.status) filter.status = params.status;

    if (params.from || params.to) {
      filter.timestamp = {};
      if (params.from) filter.timestamp.$gte = params.from;
      if (params.to) filter.timestamp.$lte = params.to;
    }

    const skip = params.page * params.size;
    const sort: Record<string, SortDirection> = { [params.sort.field]: params.sort.direction };

    const [rows, total] = await Promise.all([
      this.model.find(filter).sort(sort).skip(skip).limit(params.size).exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    return {
      content: rows.map((r) => ({
        id: String(r._id),
        userId: r.userId ?? null,
        workflowId: r.workflowId ?? null,
        executionId: r.executionId ?? null,
        eventId: r.eventId ?? null,
        eventType: r.eventType,
        status: r.status,
        data: (r.data as any) ?? null,
        timestamp: r.timestamp instanceof Date ? r.timestamp.toISOString() : new Date(r.timestamp as any).toISOString(),
      })),
      number: params.page,
      size: params.size,
      totalElements: total,
      totalPages: Math.ceil(total / params.size),
    };
  }
}
