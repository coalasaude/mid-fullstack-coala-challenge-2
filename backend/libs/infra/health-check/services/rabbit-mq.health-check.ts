import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthIndicatorResult } from '@nestjs/terminus';
import { connect } from 'amqplib';
import { IHealthCheck } from '../health-check.interface';

@Injectable()
export class RabbitMqHealthCheck implements IHealthCheck {
  readonly key = 'rabbitmq';

  constructor(private readonly config: ConfigService) {}

  async checkHealth(): Promise<HealthIndicatorResult> {
    const url = this.config.get<string>('rabbitmq.url');
    if (!url) {
      return {
        [this.key]: {
          status: 'up',
          message: 'RABBITMQ_URL not set; messaging disabled',
        },
      };
    }

    try {
      const connection = await connect(url);
      try {
        await connection.close();
      } catch (error) {
        console.error(error);
      }
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
