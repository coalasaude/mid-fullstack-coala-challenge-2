import { Type } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
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
  JWT_EXPIRES_IN?: string;
}
