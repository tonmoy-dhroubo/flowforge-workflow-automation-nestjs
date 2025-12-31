import { Injectable } from '@nestjs/common';
import { KafkaService, KafkaTopics, ExecutionStartDto } from '@flowforge/common';

@Injectable()
export class ExecutionStartProducer {
  constructor(private readonly kafkaService: KafkaService) {}

  async publish(event: ExecutionStartDto) {
    await this.kafkaService.publish(KafkaTopics.executionStart, event, event.executionId);
  }
}
