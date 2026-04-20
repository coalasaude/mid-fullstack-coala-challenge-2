import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TerminusModule } from '@nestjs/terminus';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AnalyticsModule } from '@healthflow/analytics';
import { AuthModule } from '@healthflow/auth';
import { MedicalModule } from '@healthflow/medical';
import { ObservabilityModule } from '@healthflow/observability';
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
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 100 }]),
    PrismaModule,
    MessagingModule,
    TerminusModule,
    ProvidersModule,
    SharedModule,
    AuthModule,
    ObservabilityModule,
    MedicalModule,
    AnalyticsModule,
  ],
  controllers: [HealthController],
  providers: [
    ApiHealthCheck,
    DatabaseHealthCheck,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
