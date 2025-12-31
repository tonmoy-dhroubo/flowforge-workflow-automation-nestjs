import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import { TriggerRegistration } from './trigger.entity';
import { TriggerEventPublisher } from './trigger-event.publisher';
import { TriggerEventDto } from '@flowforge/common';

@Injectable()
export class WebhookTriggerService {
  private readonly logger = new Logger(WebhookTriggerService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly publisher: TriggerEventPublisher,
  ) {}

  setupTrigger(trigger: TriggerRegistration) {
    const baseUrl = this.config.get('WEBHOOK_BASE_URL', 'http://localhost:8083');
    if (!trigger.webhookToken) {
      trigger.webhookToken = uuid();
    }
    trigger.webhookUrl = `${baseUrl}/webhook/${trigger.webhookToken}`;
    return trigger;
  }

  async processWebhook(trigger: TriggerRegistration, payload: any) {
    if (!trigger.enabled) {
      this.logger.warn(`Trigger ${trigger.id} disabled`);
      return;
    }
    const event: TriggerEventDto = {
      eventId: uuid(),
      triggerId: trigger.id,
      workflowId: trigger.workflowId,
      userId: trigger.userId,
      triggerType: 'webhook',
      timestamp: new Date().toISOString(),
      payload,
      metadata: {
        source: 'webhook',
        receivedAt: new Date().toISOString(),
      },
    };
    await this.publisher.publish(event);
  }
}
