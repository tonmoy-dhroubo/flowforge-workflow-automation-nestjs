import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.use(helmet());
  const port = process.env.PORT || 8080;
  await app.listen(port);
  console.log(`API Gateway running on port ${port}`);
}
bootstrap();
