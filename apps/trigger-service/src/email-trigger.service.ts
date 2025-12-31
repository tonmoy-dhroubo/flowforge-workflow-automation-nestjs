import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { TriggerRegistration } from './trigger.entity';
import { TriggerEventPublisher } from './trigger-event.publisher';
import { TriggerEventDto } from '@flowforge/common';
import { v4 as uuid } from 'uuid';

@Injectable()
export class EmailTriggerService {
  private readonly logger = new Logger(EmailTriggerService.name);

  constructor(private readonly publisher: TriggerEventPublisher) {}

  setupTrigger(trigger: TriggerRegistration) {
    const config = trigger.configuration ?? {};
    if (!config.username && !config.emailAddress) {
      throw new BadRequestException('Email trigger requires username/emailAddress');
    }
    if (!config.password) {
      throw new BadRequestException('Email trigger requires password');
    }
    return trigger;
  }

  async processEmail(trigger: TriggerRegistration, email: any) {
    if (!trigger.enabled) return;
    const payload = {
      subject: email.subject,
      from: email.from && email.from.text,
      body: email.text || email.html,
      receivedDate: email.date?.toISOString?.() ?? new Date().toISOString(),
    };
    if (!this.matchesFilters(trigger.configuration ?? {}, payload)) {
      return;
    }
    const event: TriggerEventDto = {
      eventId: uuid(),
      triggerId: trigger.id,
      workflowId: trigger.workflowId,
      userId: trigger.userId,
      triggerType: 'email',
      timestamp: new Date().toISOString(),
      payload,
      metadata: { source: 'email' },
    };
    await this.publisher.publish(event);
  }

  private matchesFilters(config: Record<string, any>, payload: Record<string, any>) {
    if (config.subjectContains) {
      if (!payload.subject || !payload.subject.toLowerCase().includes(config.subjectContains.toLowerCase())) {
        return false;
      }
    }
    if (config.fromAddress) {
      if (!payload.from || !payload.from.toLowerCase().includes(String(config.fromAddress).toLowerCase())) {
        return false;
      }
    }
    return true;
  }
}
