import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  TriggerEventDto,
  ExecutionResultDto,
  ExecutionStartDto,
  WorkflowResponseDto,
} from '@flowforge/common';
import { WorkflowExecution } from './workflow-execution.entity';
import { WorkflowClient } from './workflow.client';
import { ExecutionStartProducer } from './execution-start.producer';
import { v4 as uuid } from 'uuid';

@Injectable()
export class OrchestrationService {
  private readonly logger = new Logger(OrchestrationService.name);

  constructor(
    @InjectRepository(WorkflowExecution) private readonly repo: Repository<WorkflowExecution>,
    private readonly workflowClient: WorkflowClient,
    private readonly producer: ExecutionStartProducer,
  ) {}

  async startFromTrigger(event: TriggerEventDto) {
    const workflow = await this.workflowClient.fetchWorkflow(event.workflowId, event.userId);
    if (!workflow || !workflow.enabled) {
      this.logger.warn(`Workflow ${event.workflowId} unavailable`);
      return;
    }

    const execution = this.repo.create({
      id: uuid(),
      workflowId: event.workflowId,
      userId: event.userId,
      status: 'PENDING',
      currentStep: 0,
      triggerPayload: event.payload,
      stepOutputs: {},
    });
    const saved = await this.repo.save(execution);
    await this.dispatchStep(saved, workflow);
  }

  async continueFromResult(result: ExecutionResultDto) {
    const execution = await this.repo.findOne({ where: { id: result.executionId } });
    if (!execution) {
      this.logger.error(`Execution ${result.executionId} not found`);
      return;
    }

    if (execution.status === 'CANCELLED') {
      return;
    }

    if (result.status !== 'SUCCESS') {
      execution.status = 'FAILED';
      await this.repo.save(execution);
      return;
    }

    execution.stepOutputs = execution.stepOutputs || {};
    execution.stepOutputs[`step_${result.stepIndex}`] = result.output;
    execution.currentStep = result.stepIndex + 1;
    await this.repo.save(execution);

    const workflow = await this.workflowClient.fetchWorkflow(execution.workflowId, execution.userId);
    if (!workflow) {
      this.logger.error(`Workflow ${execution.workflowId} missing mid-execution`);
      execution.status = 'FAILED';
      await this.repo.save(execution);
      return;
    }
    await this.dispatchStep(execution, workflow);
  }

  private async dispatchStep(execution: WorkflowExecution, workflow: WorkflowResponseDto) {
    const actions = workflow.actions ?? [];
    if (execution.currentStep >= actions.length) {
      execution.status = 'COMPLETED';
      await this.repo.save(execution);
      return;
    }

    execution.status = 'RUNNING';
    await this.repo.save(execution);

    const action = actions[execution.currentStep];
    const context = {
      trigger: execution.triggerPayload,
      steps: execution.stepOutputs || {},
    };

    const startEvent: ExecutionStartDto = {
      executionId: execution.id,
      workflowId: execution.workflowId,
      userId: execution.userId,
      stepIndex: execution.currentStep,
      actionType: action.type,
      actionConfig: action.config,
      triggerPayload: execution.triggerPayload,
      context,
    };
    await this.producer.publish(startEvent);
  }
}
