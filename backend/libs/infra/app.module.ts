import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { AnalyticsModule } from '@healthflow/analytics';
import { AuthModule } from '@healthflow/auth';
import { MedicalModule } from '@healthflow/medical';
import { SharedModule } from '@healthflow/shared';
import { ConfigurationModule } from './configuration';
import { ApiHealthCheck, DatabaseHealthCheck } from './health-check';
import { HealthController } from './health-check/health.controller';
import { PrismaModule } from './database';
import { MessagingModule } from './messaging';
import { ProvidersModule } from '@healthflow/providers';

@Module({
  imports: [
    ConfigurationModule.register(),
    PrismaModule,
    MessagingModule,
    TerminusModule,
    ProvidersModule,
    SharedModule,
    AuthModule,
    MedicalModule,
    AnalyticsModule,
  ],
  controllers: [HealthController],
  providers: [ApiHealthCheck, DatabaseHealthCheck],
})
export class AppModule {}
