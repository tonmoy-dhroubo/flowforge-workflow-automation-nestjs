import { Injectable } from '@nestjs/common';
import { ActionPlugin } from '@flowforge/common';
import { SlackActionPlugin } from './plugins/slack-action.plugin';
import { GoogleSheetsActionPlugin } from './plugins/google-sheets.plugin';

@Injectable()
export class PluginManager {
  private readonly plugins = new Map<string, ActionPlugin>();

  constructor(slack: SlackActionPlugin, sheets: GoogleSheetsActionPlugin) {
    [slack, sheets].forEach((plugin) => this.plugins.set(plugin.getType().toUpperCase(), plugin));
  }

  getPlugin(type: string) {
    return this.plugins.get(type.toUpperCase());
  }
}
