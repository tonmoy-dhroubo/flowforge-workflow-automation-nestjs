import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, KafkaConfig, Producer, Consumer } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private kafka!: Kafka;
  private producer!: Producer;
  private producerConnected = false;
  private consumers: Consumer[] = [];

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const brokers = this.configService.get<string>('KAFKA_BROKERS', 'localhost:9092');
    const clientId = this.configService.get<string>('KAFKA_CLIENT_ID', 'flowforge-nestjs');
    const config: KafkaConfig = { clientId, brokers: brokers.split(',').map((b) => b.trim()) };
    this.kafka = new Kafka(config);
    this.producer = this.kafka.producer();
  }

  async ensureProducer() {
    if (!this.producer) {
      await this.onModuleInit();
    }
    if (!this.producerConnected) {
      await this.producer.connect();
      this.producerConnected = true;
    }
    return this.producer;
  }

  async publish(topic: string, message: any, key?: string) {
    const producer = await this.ensureProducer();
    await producer.send({
      topic,
      messages: [
        {
          key,
          value: JSON.stringify(message),
        },
      ],
    });
    this.logger.debug(`Published message to ${topic}`);
  }

  async createConsumer(groupId: string, config: { topic: string; handler: (payload: any) => Promise<void> | void }) {
    if (!this.kafka) {
      await this.onModuleInit();
    }
    const consumer = this.kafka.consumer({ groupId });
    await consumer.connect();
    await consumer.subscribe({ topic: config.topic, fromBeginning: false });
    await consumer.run({
      eachMessage: async ({ message }) => {
        try {
          const value = message.value?.toString();
          if (!value) return;
          await config.handler(JSON.parse(value));
        } catch (error) {
          this.logger.error(`Error handling message from ${config.topic}`, error as Error);
        }
      },
    });
    this.consumers.push(consumer);
    return consumer;
  }

  async onModuleDestroy() {
    if (this.producer && this.producerConnected) {
      await this.producer.disconnect();
      this.producerConnected = false;
    }
    await Promise.all(this.consumers.map((consumer) => consumer.disconnect()));
  }
}
