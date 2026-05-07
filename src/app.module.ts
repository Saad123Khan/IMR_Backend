import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@src/auth/auth.module';
import { UsersModule } from '@src/users/users.module';
import { OrganizationsModule } from '@src/organizations/organizations.module';
import { CorridorsModule } from '@src/corridors/corridors.module';
import { WebhooksModule } from '@src/webhooks/webhooks.module';
import { CountriesModule } from '@src/countries/countries.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const synchronize = config.get<string>('DB_SYNCHRONIZE') === 'true';
        
        const baseConfig = {
          type: 'postgres' as const,
          host: config.get<string>('DATABASE_HOST')!,
          port: config.get<number>('DATABASE_PORT')!,
          username: config.get<string>('DATABASE_USER')!,
          password: config.get<string>('DATABASE_PASSWORD')!,
          database: config.get<string>('DATABASE_NAME')!,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          logging: config.get<string>('DB_LOGGING') === 'true',
        };

        // Use synchronize only in development
        if (synchronize) {
          return {
            ...baseConfig,
            synchronize: true,
          };
        }

        // Use migrations in production
        return {
          ...baseConfig,
          synchronize: false,
          migrations: [__dirname + '/migrations/*.{ts,js}'],
          migrationsRun: true, // Auto-run migrations on startup
        };
      },
    }),

    AuthModule,
    UsersModule,
    OrganizationsModule,
    CorridorsModule,
    WebhooksModule,
    CountriesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}