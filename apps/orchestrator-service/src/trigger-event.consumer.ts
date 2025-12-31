import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { KafkaService, KafkaTopics, TriggerEventDto } from '@flowforge/common';
import { OrchestrationService } from './orchestration.service';

@Injectable()
export class TriggerEventConsumer implements OnModuleInit {
  private readonly logger = new Logger(TriggerEventConsumer.name);

  constructor(
    private readonly kafka: KafkaService,
    private readonly orchestrationService: OrchestrationService,
  ) {}

  async onModuleInit() {
    await this.kafka.createConsumer('orchestrator-trigger', {
      topic: KafkaTopics.triggerEvents,
      handler: async (payload: TriggerEventDto) => {
        this.logger.debug(`Trigger event ${payload.eventId}`);
        await this.orchestrationService.startFromTrigger(payload);
      },
    });
  }
}
