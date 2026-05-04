import { Type } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Min,
} from 'class-validator';

export enum EEnvironment {
  development = 'development',
  production = 'production',
  test = 'test',
}

export class EnvironmentVariables {
  @IsIn(Object.values(EEnvironment))
  @IsNotEmpty()
  NODE_ENV!: EEnvironment;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  PORT!: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/^postgres(ql)?:\/\/\S+$/i, {
    message:
      'DATABASE_URL must be a postgres or postgresql URL (e.g. postgresql://user:pass@host:5432/db?schema=public)',
  })
  DATABASE_URL!: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  JWT_EXPIRES_IN?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  RABBITMQ_URL?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  EXAM_PROCESSING_QUEUE?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  EXAM_PROCESSING_DLQ?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  EXAM_PROCESSING_RETRY_QUEUE?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  USER_ACCESS_LOG_QUEUE?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  USER_ACCESS_LOG_DLQ?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  USER_ACCESS_LOG_RETRY_QUEUE?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  AWS_ACCESS_KEY_ID?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  AWS_SECRET_ACCESS_KEY?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  AWS_REGION?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  AWS_BUCKET?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  AWS_BUCKET_URL?: string;
}
