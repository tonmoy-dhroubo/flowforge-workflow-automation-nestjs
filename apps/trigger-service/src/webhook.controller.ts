import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { TriggerService } from './trigger.service';
import { WebhookTriggerService } from './webhook-trigger.service';

@Controller('webhook')
export class WebhookController {
  constructor(
    private readonly triggerService: TriggerService,
    private readonly webhookService: WebhookTriggerService,
  ) {}

  @Post(':token')
  async handlePost(@Param('token') token: string, @Body() body: any, @Req() req: Request) {
    return this.processWebhook(token, body ?? {}, req);
  }

  @Get(':token')
  async handleGet(@Param('token') token: string, @Req() req: Request) {
    return this.processWebhook(token, {}, req);
  }

  private async processWebhook(token: string, body: any, req: Request) {
    const trigger = await this.triggerService.findByWebhookToken(token);
    if (!trigger) {
      return { success: false, error: 'Invalid webhook token' };
    }
    const payload = {
      headers: req.headers,
      queryParams: req.query,
      body,
      method: req.method,
      remoteAddress: req.ip,
    };
    await this.webhookService.processWebhook(trigger, payload);
    await this.triggerService.markTriggerFired(trigger.id);
    return { success: true, triggerId: trigger.id };
  }
}
