import { DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

export class PostgresModule {
  static forRoot(entities: Function[] = [], defaultSchema?: string): DynamicModule {
    return TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const host = config.get<string>('POSTGRES_HOST', 'localhost:5432');
        const dbName = config.get<string>('POSTGRES_DB', 'devdb');
        const username = config.get<string>('POSTGRES_USER', 'dev');
        const password = config.get<string>('POSTGRES_PASSWORD', 'devpass');
        const params = config.get<string>('POSTGRES_PARAMS', 'sslmode=require&channel_binding=require');
        const url =
          config.get<string>('POSTGRES_URL') ??
          `postgresql://${username}:${password}@${host}/${dbName}?${params}`;
        const schema = config.get<string>('POSTGRES_SCHEMA', defaultSchema);
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
