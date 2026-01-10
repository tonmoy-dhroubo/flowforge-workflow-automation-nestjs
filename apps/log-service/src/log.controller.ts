import { BadRequestException, Controller, Get, Headers, Param, Query, UseGuards } from '@nestjs/common';
import { JwtUserGuard } from '@flowforge/common';
import { LoggingService } from './logging.service';

@Controller('api/v1/logs')
@UseGuards(JwtUserGuard)
export class LogController {
  constructor(private readonly logging: LoggingService) {}

  @Get()
  search(
    @Headers('x-user-id') userId: string,
    @Query('executionId') executionId?: string,
    @Query('eventId') eventId?: string,
    @Query('workflowId') workflowId?: string,
    @Query('eventType') eventType?: string,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page = '0',
    @Query('size') size = '20',
    @Query('sort') sort = 'timestamp,desc',
  ) {
    return this.logging.search({
      userId,
      executionId,
      eventId,
      workflowId,
      eventType,
      status,
      from: this.parseInstant('from', from),
      to: this.parseInstant('to', to),
      page: this.parseNonNegativeInt('page', page, 0),
      size: this.parseNonNegativeInt('size', size, 20, 1),
      sort: this.parseSort(sort),
    });
  }

  @Get('executions/:executionId')
  forExecution(
    @Headers('x-user-id') userId: string,
    @Param('executionId') executionId: string,
    @Query('page') page = '0',
    @Query('size') size = '20',
    @Query('sort') sort = 'timestamp,desc',
  ) {
    return this.logging.search({
      userId,
      executionId,
      page: this.parseNonNegativeInt('page', page, 0),
      size: this.parseNonNegativeInt('size', size, 20, 1),
      sort: this.parseSort(sort),
    });
  }

  @Get('workflows/:workflowId')
  forWorkflow(
    @Headers('x-user-id') userId: string,
    @Param('workflowId') workflowId: string,
    @Query('page') page = '0',
    @Query('size') size = '20',
    @Query('sort') sort = 'timestamp,desc',
  ) {
    return this.logging.search({
      userId,
      workflowId,
      page: this.parseNonNegativeInt('page', page, 0),
      size: this.parseNonNegativeInt('size', size, 20, 1),
      sort: this.parseSort(sort),
    });
  }

  private parseInstant(name: string, value?: string): Date | undefined {
    if (!value) return undefined;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException(`${name} must be ISO-8601 datetime`);
    }
    return parsed;
  }

  private parseNonNegativeInt(name: string, value: string, fallback: number, min = 0) {
    if (!value) return fallback;
    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < min) {
      throw new BadRequestException(`${name} must be an integer >= ${min}`);
    }
    return parsed;
  }

  private parseSort(sort: string): { field: 'timestamp'; direction: 1 | -1 } {
    const [rawField, rawDir] = (sort ?? '').split(',', 2);
    const field = (rawField ?? 'timestamp').trim();
    if (field !== 'timestamp') {
      return { field: 'timestamp', direction: -1 };
    }
    const direction = (rawDir ?? 'desc').trim().toLowerCase() === 'asc' ? 1 : -1;
    return { field: 'timestamp', direction };
  }
}

