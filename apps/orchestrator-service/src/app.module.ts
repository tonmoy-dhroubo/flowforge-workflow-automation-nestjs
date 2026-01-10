import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { WorkflowExecution } from './workflow-execution.entity';
import { OrchestrationService } from './orchestration.service';
import { WorkflowClient } from './workflow.client';
import { KafkaService } from '@flowforge/common';
import { ExecutionStartProducer } from './execution-start.producer';
import { TriggerEventConsumer } from './trigger-event.consumer';
import { ExecutionResultConsumer } from './execution-result.consumer';
import { ExecutionController } from './execution.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule.register({ timeout: 5000 }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get('POSTGRES_URL'),
        schema: config.get('ORCHESTRATOR_SCHEMA', 'orchestrator'),
        entities: [WorkflowExecution],
        synchronize: true,
      }),
    }),
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
