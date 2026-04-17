import { Controller, Get, Logger } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
} from '@nestjs/terminus';
import { ApiHealthCheck, DatabaseHealthCheck } from '.';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly apiHealthCheck: ApiHealthCheck,
    private readonly databaseHealthCheck: DatabaseHealthCheck,
  ) {}

  @Get()
  @HealthCheck()
  healthCheck(): Promise<HealthCheckResult> {
    Logger.log('GET /health');
    return this.health.check([
      () => this.apiHealthCheck.checkHealth(),
      () => this.databaseHealthCheck.checkHealth(),
    ]);
  }
}
