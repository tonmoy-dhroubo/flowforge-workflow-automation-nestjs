import { Body, Controller, Delete, Get, Headers, HttpCode, Param, Post, Put, UseGuards } from '@nestjs/common';
import { TriggerRegistrationDto, JwtUserGuard } from '@flowforge/common';
import { TriggerService } from './trigger.service';

@Controller('api/v1/triggers')
@UseGuards(JwtUserGuard)
export class TriggerManagementController {
  constructor(private readonly triggerService: TriggerService) {}

  @Post()
  create(@Body() dto: TriggerRegistrationDto, @Headers('x-user-id') userId: string) {
    return this.triggerService.create(dto, userId);
  }

  @Get()
  list(@Headers('x-user-id') userId: string) {
    return this.triggerService.listForUser(userId);
  }

  @Get('workflow/:workflowId')
  listForWorkflow(
    @Param('workflowId') workflowId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.triggerService.listForWorkflow(workflowId, userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: TriggerRegistrationDto, @Headers('x-user-id') userId: string) {
    return this.triggerService.update(id, dto, userId);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string, @Headers('x-user-id') userId: string) {
    return this.triggerService.delete(id, userId);
  }
}
