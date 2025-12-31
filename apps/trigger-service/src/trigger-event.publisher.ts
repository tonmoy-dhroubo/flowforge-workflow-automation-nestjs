import { Injectable, Logger } from '@nestjs/common';
import { KafkaService, KafkaTopics, TriggerEventDto } from '@flowforge/common';

@Injectable()
export class TriggerEventPublisher {
  private readonly logger = new Logger(TriggerEventPublisher.name);

  constructor(private readonly kafkaService: KafkaService) {}

  async publish(event: TriggerEventDto) {
    await this.kafkaService.publish(KafkaTopics.triggerEvents, event, event.workflowId);
    this.logger.debug(`Published trigger event ${event.eventId}`);
  }
}
