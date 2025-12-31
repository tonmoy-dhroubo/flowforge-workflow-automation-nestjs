import { Injectable } from '@nestjs/common';
import { KafkaService, KafkaTopics, ExecutionResultDto } from '@flowforge/common';

@Injectable()
export class ExecutionResultProducer {
  constructor(private readonly kafka: KafkaService) {}

  async publish(result: ExecutionResultDto) {
    await this.kafka.publish(KafkaTopics.executionResult, result, result.executionId);
  }
}
