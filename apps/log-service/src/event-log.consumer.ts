import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { KafkaService, KafkaTopics } from '@flowforge/common';
import { LoggingService } from './logging.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class EventLogConsumer implements OnModuleInit {
  private readonly logger = new Logger(EventLogConsumer.name);

  constructor(private readonly kafka: KafkaService, private readonly logging: LoggingService) {}

  async onModuleInit() {
    await this.kafka.createConsumer('log-trigger', {
      topic: KafkaTopics.triggerEvents,
      handler: (payload) => this.persist('TRIGGER', payload),
    });
    await this.kafka.createConsumer('log-result', {
      topic: KafkaTopics.executionResult,
      handler: (payload) => this.persist('RESULT', payload),
    });
  }

  private async persist(eventType: string, payload: any) {
    await this.logging.log({
      executionId: payload.executionId || payload.eventId || uuid(),
      workflowId: payload.workflowId,
      eventType,
      status: payload.status || 'INFO',
      data: payload,
      timestamp: new Date(),
    });
  }
}
