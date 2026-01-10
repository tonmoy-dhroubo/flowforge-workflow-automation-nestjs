import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { KafkaService } from '@flowforge/common';
import { PluginManager } from './plugin.manager';
import { SlackActionPlugin } from './plugins/slack-action.plugin';
import { GoogleSheetsActionPlugin } from './plugins/google-sheets.plugin';
import { ActionExecutorService } from './action-executor.service';
import { ExecutionResultProducer } from './execution-result.producer';
import { ExecutionStartConsumer } from './execution-start.consumer';
import { ExecutorController } from './executor.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), HttpModule],
  controllers: [ExecutorController],
  providers: [
    KafkaService,
    PluginManager,
    SlackActionPlugin,
    GoogleSheetsActionPlugin,
    ActionExecutorService,
    ExecutionResultProducer,
    ExecutionStartConsumer,
  ],
})
export class AppModule {}
