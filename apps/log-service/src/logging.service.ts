import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExecutionLog } from './execution-log.schema';

@Injectable()
export class LoggingService {
  constructor(@InjectModel(ExecutionLog.name) private readonly model: Model<ExecutionLog>) {}

  async log(event: Partial<ExecutionLog>) {
    await this.model.create(event);
  }
}
