import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, Headers } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { WorkflowRequestDto } from '@flowforge/common';
import { JwtUserGuard } from '@flowforge/common';

@Controller('api/v1/workflows')
@UseGuards(JwtUserGuard)
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Post()
  create(@Body() dto: WorkflowRequestDto, @Headers('x-user-id') userId: string) {
    return this.workflowService.create(dto, userId);
  }

  @Get()
  list(@Headers('x-user-id') userId: string) {
    return this.workflowService.listForUser(userId);
  }

  @Get(':id')
  get(@Param('id') id: string, @Headers('x-user-id') userId: string) {
    return this.workflowService.getById(id, userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: WorkflowRequestDto,
    @Headers('x-user-id') userId: string,
  ) {
    return this.workflowService.update(id, userId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Headers('x-user-id') userId: string) {
    return this.workflowService.delete(id, userId);
  }
}
