import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { WorkflowResponseDto } from '@flowforge/common';

@Injectable()
export class WorkflowClient {
  private readonly logger = new Logger(WorkflowClient.name);
  private readonly baseUrl: string;

  constructor(private readonly http: HttpService, config: ConfigService) {
    this.baseUrl = config.get('WORKFLOW_SERVICE_API_URL') ?? config.get('WORKFLOW_SERVICE_URL', 'http://localhost:8082/api/v1');
  }

  async fetchWorkflow(workflowId: string, userId: string): Promise<WorkflowResponseDto | null> {
    try {
      const url = `${this.baseUrl}/workflows/${workflowId}`;
      const response = await firstValueFrom(
        this.http.get<WorkflowResponseDto>(url, {
          headers: { 'X-User-Id': userId },
        }),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch workflow ${workflowId}`, error as Error);
      return null;
    }
  }
}
