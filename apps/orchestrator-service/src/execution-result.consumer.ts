import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { KafkaService, KafkaTopics, ExecutionResultDto } from '@flowforge/common';
import { OrchestrationService } from './orchestration.service';

@Injectable()
export class ExecutionResultConsumer implements OnModuleInit {
  private readonly logger = new Logger(ExecutionResultConsumer.name);

  constructor(
    private readonly kafka: KafkaService,
    private readonly orchestrationService: OrchestrationService,
  ) {}

  async onModuleInit() {
    await this.kafka.createConsumer('orchestrator-results', {
      topic: KafkaTopics.executionResult,
      handler: async (payload: ExecutionResultDto) => {
        this.logger.debug(`Execution result ${payload.executionId}`);
        await this.orchestrationService.continueFromResult(payload);
      },
    });
  }
}
