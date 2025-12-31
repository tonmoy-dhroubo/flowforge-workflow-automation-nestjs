import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { TriggerService } from './trigger.service';
import { EmailTriggerService } from './email-trigger.service';
import { ImapFlow } from 'imapflow';

@Injectable()
export class EmailPollingExecutor {
  private readonly logger = new Logger(EmailPollingExecutor.name);

  constructor(
    private readonly config: ConfigService,
    private readonly triggerService: TriggerService,
    private readonly emailService: EmailTriggerService,
  ) {}

  @Interval(300000)
  async poll() {
    const enabled = String(this.config.get('EMAIL_POLLING_ENABLED', 'false')).toLowerCase() === 'true';
    if (!enabled) {
      return;
    }
    const triggers = await this.triggerService.allEmailTriggers();
    for (const trigger of triggers) {
      try {
        await this.processTrigger(trigger);
      } catch (error) {
        this.logger.error(`Failed to poll trigger ${trigger.id}`, error as Error);
      }
    }
  }

  private async processTrigger(trigger: any) {
    const config = trigger.configuration || {};
    const client = new ImapFlow({
      host: config.host || this.config.get('EMAIL_IMAP_HOST'),
      port: Number(config.port || this.config.get('EMAIL_IMAP_PORT', 993)),
      secure: Boolean(config.secure ?? this.config.get('EMAIL_IMAP_SECURE', true)),
      auth: {
        user: config.username || config.emailAddress,
        pass: config.password,
      },
    });
    try {
      await client.connect();
      const lock = await client.getMailboxLock(config.folder || 'INBOX');
      try {
        for await (const message of client.fetch({ seen: false }, { envelope: true, source: true })) {
          await this.emailService.processEmail(trigger, {
            subject: message.envelope.subject,
            from: { text: message.envelope.from?.map((f) => f.address).join(',') },
            text: message.source.toString(),
            date: new Date(),
          });
        }
      } finally {
        lock.release();
      }
    } finally {
      if (client.connected) {
        await client.logout();
      }
    }
  }
}
