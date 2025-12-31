import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { TriggerService } from './trigger.service';
import { SchedulerTriggerService } from './scheduler-trigger.service';

@Injectable()
export class ScheduledTriggerExecutor {
  private readonly logger = new Logger(ScheduledTriggerExecutor.name);

  constructor(
    private readonly triggerService: TriggerService,
    private readonly schedulerService: SchedulerTriggerService,
  ) {}

  @Interval(60000)
  async checkTriggers() {
    const now = new Date();
    const triggers = await this.triggerService.dueSchedulerTriggers(now);
    if (!triggers.length) return;
    this.logger.log(`Processing ${triggers.length} scheduled triggers`);
    for (const trigger of triggers) {
      await this.schedulerService.process(trigger);
      trigger.nextScheduledAt = this.schedulerService.calculateNextRun(trigger.configuration ?? {});
      await this.triggerService.saveTrigger(trigger);
      await this.triggerService.markTriggerFired(trigger.id);
    }
  }
}
