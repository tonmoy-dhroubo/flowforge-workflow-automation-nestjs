import { Injectable, Logger } from '@nestjs/common';
import { TriggerRegistration } from './trigger.entity';
import { TriggerEventPublisher } from './trigger-event.publisher';
import { TriggerEventDto } from '@flowforge/common';
import { v4 as uuid } from 'uuid';

@Injectable()
export class SchedulerTriggerService {
  private readonly logger = new Logger(SchedulerTriggerService.name);

  constructor(private readonly publisher: TriggerEventPublisher) {}

  setupTrigger(trigger: TriggerRegistration) {
    trigger.nextScheduledAt = this.calculateNextRun(trigger.configuration ?? {});
    return trigger;
  }

  async process(trigger: TriggerRegistration) {
    if (!trigger.enabled) {
      return;
    }
    const event: TriggerEventDto = {
      eventId: uuid(),
      triggerId: trigger.id,
      workflowId: trigger.workflowId,
      userId: trigger.userId,
      triggerType: 'scheduler',
      timestamp: new Date().toISOString(),
      payload: {},
      metadata: {
        source: 'scheduler',
        scheduledTime: trigger.nextScheduledAt?.toISOString(),
      },
    };
    await this.publisher.publish(event);
  }

  calculateNextRun(config: Record<string, any>) {
    const now = new Date();
    if (config.intervalMinutes) {
      return new Date(now.getTime() + config.intervalMinutes * 60 * 1000);
    }
    return new Date(now.getTime() + 60 * 60 * 1000);
  }
}
