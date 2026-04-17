import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigurationModule } from './configuration';
import { ApiHealthCheck, DatabaseHealthCheck } from './health-check';
import { HealthController } from './health-check/health.controller';
import { PrismaModule } from './database';
import { ProvidersModule } from '../providers/src/providers.module';

@Module({
  imports: [
    ConfigurationModule.register(),
    PrismaModule,
    TerminusModule,
    ProvidersModule,
  ],
  controllers: [HealthController],
  providers: [ApiHealthCheck, DatabaseHealthCheck],
})
export class AppModule {}
