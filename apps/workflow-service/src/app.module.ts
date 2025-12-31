import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workflow } from './workflow.entity';
import { WorkflowService } from './workflow.service';
import { WorkflowController } from './workflow.controller';
import { JwtUserGuard } from '@flowforge/common';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get('POSTGRES_URL'),
        schema: config.get('WORKFLOW_SCHEMA', 'workflow'),
        entities: [Workflow],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([Workflow]),
  ],
  controllers: [WorkflowController],
  providers: [WorkflowService, JwtUserGuard],
})
export class AppModule {}
