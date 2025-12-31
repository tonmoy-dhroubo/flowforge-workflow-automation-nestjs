import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { KafkaService, KafkaTopics, ExecutionStartDto } from '@flowforge/common';
import { ActionExecutorService } from './action-executor.service';
import { ExecutionResultProducer } from './execution-result.producer';

@Injectable()
export class ExecutionStartConsumer implements OnModuleInit {
  private readonly logger = new Logger(ExecutionStartConsumer.name);

  constructor(
    private readonly kafka: KafkaService,
    private readonly executor: ActionExecutorService,
    private readonly producer: ExecutionResultProducer,
  ) {}

  async onModuleInit() {
    await this.kafka.createConsumer('executor-start', {
      topic: KafkaTopics.executionStart,
      handler: async (payload: ExecutionStartDto) => {
        this.logger.debug(`Received execution ${payload.executionId}`);
        const result = await this.executor.execute(payload);
        await this.producer.publish(result);
      },
    });
  }
}
