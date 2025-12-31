import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { TriggerRegistration } from './trigger.entity';
import { TriggerRegistrationDto } from '@flowforge/common';
import { WebhookTriggerService } from './webhook-trigger.service';
import { SchedulerTriggerService } from './scheduler-trigger.service';
import { EmailTriggerService } from './email-trigger.service';

@Injectable()
export class TriggerService {
  constructor(
    @InjectRepository(TriggerRegistration) private readonly repo: Repository<TriggerRegistration>,
    private readonly webhookService: WebhookTriggerService,
    private readonly schedulerService: SchedulerTriggerService,
    private readonly emailService: EmailTriggerService,
  ) {}

  async create(dto: TriggerRegistrationDto, userId: string): Promise<TriggerRegistrationDto> {
    const entity = this.repo.create({
      workflowId: dto.workflowId,
      userId,
      triggerType: dto.triggerType,
      configuration: dto.configuration || {},
      enabled: dto.enabled ?? true,
    });
    const prepared = await this.applyTypeSetup(entity);
    const saved = await this.repo.save(prepared);
    return this.toDto(saved);
  }

  async listForUser(userId: string) {
    return (await this.repo.find({ where: { userId } })).map((t) => this.toDto(t));
  }

  async listForWorkflow(workflowId: string, userId: string) {
    const triggers = await this.repo.find({ where: { workflowId, userId } });
    return triggers.map((t) => this.toDto(t));
  }

  async update(id: string, dto: TriggerRegistrationDto, userId: string) {
    const trigger = await this.repo.findOne({ where: { id } });
    this.ensureOwnership(trigger, userId);
    trigger!.configuration = dto.configuration || trigger!.configuration;
    trigger!.enabled = dto.enabled ?? trigger!.enabled;
    const updated = await this.repo.save(await this.applyTypeSetup(trigger!));
    return this.toDto(updated);
  }

  async delete(id: string, userId: string) {
    const trigger = await this.repo.findOne({ where: { id } });
    this.ensureOwnership(trigger, userId);
    await this.repo.remove(trigger!);
  }

  async findByWebhookToken(token: string) {
    return this.repo.findOne({ where: { webhookToken: token } });
  }

  async dueSchedulerTriggers(now: Date) {
    return this.repo.find({
      where: {
        triggerType: 'scheduler',
        enabled: true,
        nextScheduledAt: LessThanOrEqual(now),
      },
    });
  }

  async allEmailTriggers() {
    return this.repo.find({ where: { triggerType: 'email', enabled: true } });
  }

  async markTriggerFired(id: string) {
    await this.repo.update(id, { lastTriggeredAt: new Date() });
  }

  async saveTrigger(trigger: TriggerRegistration) {
    await this.repo.save(trigger);
  }

  private ensureOwnership(trigger: TriggerRegistration | null, userId: string) {
    if (!trigger || trigger.userId !== userId) {
      throw new UnauthorizedException('Trigger not found');
    }
  }

  private async applyTypeSetup(trigger: TriggerRegistration) {
    switch (trigger.triggerType.toLowerCase()) {
      case 'webhook':
        return this.webhookService.setupTrigger(trigger);
      case 'scheduler':
        return this.schedulerService.setupTrigger(trigger);
      case 'email':
        return this.emailService.setupTrigger(trigger);
      default:
        return trigger;
    }
  }

  private toDto(trigger: TriggerRegistration): TriggerRegistrationDto {
    return {
      id: trigger.id,
      workflowId: trigger.workflowId,
      userId: trigger.userId,
      triggerType: trigger.triggerType,
      configuration: trigger.configuration ?? {},
      enabled: trigger.enabled,
      webhookUrl: trigger.webhookUrl,
      webhookToken: trigger.webhookToken,
      createdAt: trigger.createdAt.toISOString(),
      updatedAt: trigger.updatedAt.toISOString(),
    };
  }
}
