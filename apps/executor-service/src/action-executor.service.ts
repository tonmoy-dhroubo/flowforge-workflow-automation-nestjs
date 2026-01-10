import { Injectable, Logger } from '@nestjs/common';
import { ExecutionResultDto, ExecutionStartDto } from '@flowforge/common';
import { PluginManager } from './plugin.manager';

@Injectable()
export class ActionExecutorService {
  private readonly logger = new Logger(ActionExecutorService.name);

  constructor(private readonly plugins: PluginManager) {}

  async execute(startDto: ExecutionStartDto): Promise<ExecutionResultDto> {
    try {
      const plugin = this.plugins.getPlugin(startDto.actionType);
      if (!plugin) {
        throw new Error(`Unknown action ${startDto.actionType}`);
      }
      const output = await plugin.execute(startDto.actionConfig, startDto.context || {});
      return {
        executionId: startDto.executionId,
        workflowId: startDto.workflowId,
        userId: startDto.userId,
        stepIndex: startDto.stepIndex,
        status: 'SUCCESS',
        output,
      };
    } catch (error: any) {
      this.logger.error('Action failed', error);
      return {
        executionId: startDto.executionId,
        workflowId: startDto.workflowId,
        userId: startDto.userId,
        stepIndex: startDto.stepIndex,
        status: 'FAILURE',
        errorMessage: error.message,
      };
    }
  }
}
