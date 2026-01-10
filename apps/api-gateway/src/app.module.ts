import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule.register({ timeout: 30000 }),
    JwtModule.registerAsync({
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('APPLICATION_SECURITY_JWT_SECRET_KEY') ?? config.get<string>('JWT_SECRET', 'dev-secret'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [GatewayController],
  providers: [GatewayService],
})
export class AppModule {}
