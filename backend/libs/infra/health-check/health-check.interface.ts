import { HealthIndicatorResult } from '@nestjs/terminus';

export abstract class IHealthCheck {
  abstract key: string;
  abstract checkHealth(): Promise<HealthIndicatorResult>;
}
