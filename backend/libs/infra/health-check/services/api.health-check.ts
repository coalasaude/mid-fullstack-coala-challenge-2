import { Injectable } from '@nestjs/common';
import { HealthIndicatorResult } from '@nestjs/terminus';
import { IHealthCheck } from '../health-check.interface';

@Injectable()
export class ApiHealthCheck implements IHealthCheck {
  readonly key = 'api';

  checkHealth(): Promise<HealthIndicatorResult> {
    return Promise.resolve({
      [this.key]: { status: 'up' },
    });
  }
}
