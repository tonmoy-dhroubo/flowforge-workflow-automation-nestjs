import { DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

export class PostgresModule {
  static forRoot(entities: Function[] = []): DynamicModule {
    return TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('POSTGRES_URL');
        const schema = config.get<string>('POSTGRES_SCHEMA');
        const options: TypeOrmModuleOptions = {
          type: 'postgres',
          url,
          schema,
          entities,
          synchronize: false,
          autoLoadEntities: true,
        };
        return options;
      },
      inject: [ConfigService],
    });
  }
}
