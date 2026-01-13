import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { WorkflowExecution } from './workflow-execution.entity';
import { OrchestrationService } from './orchestration.service';
import { WorkflowClient } from './workflow.client';
import { KafkaService, PostgresModule } from '@flowforge/common';
import { ExecutionStartProducer } from './execution-start.producer';
import { TriggerEventConsumer } from './trigger-event.consumer';
import { ExecutionResultConsumer } from './execution-result.consumer';
import { ExecutionController } from './execution.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule.register({ timeout: 5000 }),
    PostgresModule.forRoot([WorkflowExecution], 'orchestrator'),
    TypeOrmModule.forFeature([WorkflowExecution]),
  ],
  controllers: [ExecutionController],
  providers: [
    KafkaService,
    OrchestrationService,
    WorkflowClient,
    ExecutionStartProducer,
    TriggerEventConsumer,
    ExecutionResultConsumer,
  ],
})
export class AppModule {}
