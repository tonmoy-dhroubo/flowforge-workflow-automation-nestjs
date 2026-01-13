import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workflow } from './workflow.entity';
import { WorkflowService } from './workflow.service';
import { WorkflowController } from './workflow.controller';
import { JwtUserGuard, PostgresModule } from '@flowforge/common';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PostgresModule.forRoot([Workflow], 'workflow'),
    TypeOrmModule.forFeature([Workflow]),
  ],
  controllers: [WorkflowController],
  providers: [WorkflowService, JwtUserGuard],
})
export class AppModule {}
