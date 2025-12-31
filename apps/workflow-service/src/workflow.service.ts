import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  WorkflowRequestDto,
  WorkflowResponseDto,
  WorkflowSummaryDto,
} from '@flowforge/common';
import { Workflow } from './workflow.entity';

@Injectable()
export class WorkflowService {
  constructor(@InjectRepository(Workflow) private readonly repo: Repository<Workflow>) {}

  async create(request: WorkflowRequestDto, userId: string): Promise<WorkflowResponseDto> {
    const workflow = this.repo.create({
      name: request.name,
      enabled: request.enabled ?? true,
      userId,
      triggerDefinition: request.trigger,
      actionsDefinition: request.actions ?? [],
    });
    const saved = await this.repo.save(workflow);
    return this.toResponse(saved);
  }

  async listForUser(userId: string): Promise<WorkflowSummaryDto[]> {
    const workflows = await this.repo.find({ where: { userId } });
    return workflows.map((wf) => ({
      id: wf.id,
      name: wf.name,
      enabled: wf.enabled,
      createdAt: wf.createdAt.toISOString(),
    }));
  }

  async getById(id: string, userId: string): Promise<WorkflowResponseDto> {
    const workflow = await this.repo.findOne({ where: { id, userId } });
    if (!workflow) throw new NotFoundException('Workflow not found');
    return this.toResponse(workflow);
  }

  async update(id: string, userId: string, request: WorkflowRequestDto): Promise<WorkflowResponseDto> {
    const workflow = await this.repo.findOne({ where: { id, userId } });
    if (!workflow) throw new NotFoundException('Workflow not found');
    workflow.name = request.name;
    workflow.enabled = request.enabled;
    workflow.triggerDefinition = request.trigger;
    workflow.actionsDefinition = request.actions ?? [];
    const saved = await this.repo.save(workflow);
    return this.toResponse(saved);
  }

  async delete(id: string, userId: string): Promise<void> {
    const workflow = await this.repo.findOne({ where: { id, userId } });
    if (!workflow) throw new NotFoundException('Workflow not found');
    await this.repo.remove(workflow);
  }

  private toResponse(workflow: Workflow): WorkflowResponseDto {
    return {
      id: workflow.id,
      name: workflow.name,
      userId: workflow.userId,
      enabled: workflow.enabled,
      trigger: workflow.triggerDefinition as any,
      actions: (workflow.actionsDefinition as any) ?? [],
      createdAt: workflow.createdAt.toISOString(),
      updatedAt: workflow.updatedAt.toISOString(),
    };
  }
}
