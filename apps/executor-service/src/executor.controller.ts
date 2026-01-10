import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtUserGuard } from '@flowforge/common';
import { PluginManager } from './plugin.manager';

@Controller('api/v1/executor')
@UseGuards(JwtUserGuard)
export class ExecutorController {
  constructor(private readonly plugins: PluginManager) {}

  @Get('plugins')
  listPlugins() {
    return { supportedActionTypes: this.plugins.getSupportedTypes() };
  }
}

