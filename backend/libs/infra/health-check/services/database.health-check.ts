import { Injectable } from '@nestjs/common';
import { HealthIndicatorResult } from '@nestjs/terminus';
import { PrismaService } from '../../database/prisma.service';
import { IHealthCheck } from '../health-check.interface';

@Injectable()
export class DatabaseHealthCheck implements IHealthCheck {
  readonly key = 'database';

  constructor(private readonly prisma: PrismaService) {}

  async checkHealth(): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        [this.key]: { status: 'up' },
      };
    } catch (error) {
      const result: HealthIndicatorResult = {
        [this.key]: {
          status: 'down',
          message: error instanceof Error ? error.message : String(error),
        },
      };
      return result;
    }
  }
}
