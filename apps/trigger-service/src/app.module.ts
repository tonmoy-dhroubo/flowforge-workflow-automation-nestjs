import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { TriggerRegistration } from './trigger.entity';
import { TriggerService } from './trigger.service';
import { TriggerManagementController } from './trigger-management.controller';
import { WebhookController } from './webhook.controller';
import { WebhookTriggerService } from './webhook-trigger.service';
import { SchedulerTriggerService } from './scheduler-trigger.service';
import { EmailTriggerService } from './email-trigger.service';
import { TriggerEventPublisher } from './trigger-event.publisher';
import { KafkaService, JwtUserGuard, PostgresModule } from '@flowforge/common';
import { ScheduledTriggerExecutor } from './scheduled-trigger.executor';
import { EmailPollingExecutor } from './email-polling.executor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PostgresModule.forRoot([TriggerRegistration], 'trigger_service'),
    TypeOrmModule.forFeature([TriggerRegistration]),
  ],
  controllers: [TriggerManagementController, WebhookController],
  providers: [
    TriggerService,
    WebhookTriggerService,
    SchedulerTriggerService,
    EmailTriggerService,
    TriggerEventPublisher,
    KafkaService,
    ScheduledTriggerExecutor,
    EmailPollingExecutor,
    JwtUserGuard,
  ],
})
export class AppModule {}
