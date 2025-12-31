import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ExecutionLog, ExecutionLogSchema } from './execution-log.schema';
import { KafkaService } from '@flowforge/common';
import { LoggingService } from './logging.service';
import { EventLogConsumer } from './event-log.consumer';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/flowforge_logs'),
    MongooseModule.forFeature([{ name: ExecutionLog.name, schema: ExecutionLogSchema }]),
  ],
  providers: [KafkaService, LoggingService, EventLogConsumer],
})
export class AppModule {}
