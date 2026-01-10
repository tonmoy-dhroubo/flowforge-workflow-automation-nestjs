import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { KafkaService, KafkaTopics } from '@flowforge/common';
import { LoggingService } from './logging.service';

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
    const isTrigger = eventType === 'TRIGGER';
    const userId = payload?.userId ?? payload?.user_id ?? null;
    const workflowId = payload?.workflowId ?? null;
    const executionId = isTrigger ? null : payload?.executionId ?? null;
    const eventId = isTrigger ? payload?.eventId ?? null : null;
    const status = payload?.status ?? (isTrigger ? 'FIRED' : 'INFO');

    await this.logging.log({
      userId,
      executionId,
      eventId,
      workflowId,
      eventType,
      status,
      data: payload,
      timestamp: new Date(),
    });
  }
}
