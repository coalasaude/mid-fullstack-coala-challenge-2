import * as process from 'process';

export interface IConfiguration {
  env: string;
  port: number;
  database: {
    url: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  rabbitmq: {
    url: string;
  };
  examProcessing: {
    queue: string;
    dlq: string;
  };
  aws: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    bucket: string;
  };
}

export const configuration = (): IConfiguration => ({
  env: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  database: {
    url: process.env.DATABASE_URL ?? '',
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? '',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '',
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL ?? '',
  },
  examProcessing: {
    queue: process.env.EXAM_PROCESSING_QUEUE ?? '',
    dlq: process.env.EXAM_PROCESSING_DLQ ?? '',
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
    region: process.env.AWS_REGION ?? '',
    bucket: process.env.AWS_BUCKET ?? '',
  },
});
