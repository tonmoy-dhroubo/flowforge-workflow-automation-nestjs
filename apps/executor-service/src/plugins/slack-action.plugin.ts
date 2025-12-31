import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ActionPlugin } from '@flowforge/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SlackActionPlugin implements ActionPlugin {
  constructor(private readonly http: HttpService) {}

  getType() {
    return 'SLACK_MESSAGE';
  }

  async execute(config: Record<string, any>, context: Record<string, any>) {
    const webhookUrl = config.webhookUrl || config.webhook_url;
    if (!webhookUrl) {
      throw new Error('Slack webhookUrl missing');
    }
    const payload = {
      text: config.message || JSON.stringify(context),
      channel: config.channel,
    };
    await firstValueFrom(this.http.post(webhookUrl, payload));
    return { delivered: true };
  }
}
