import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { EnvironmentVariables } from './environment-variables';

export const factoryValidate =
  () =>
  (config: Record<string, unknown>): EnvironmentVariables => {
    const validatedConfig = plainToInstance(EnvironmentVariables, config, {
      enableImplicitConversion: true,
    });

    const errors = validateSync(validatedConfig, {
      skipMissingProperties: false,
    });

    if (errors.length) {
      const message = errors
        .map((e) =>
          e.constraints ? Object.values(e.constraints).join(', ') : e.property,
        )
        .join('; ');
      throw new Error(message);
    }

    return validatedConfig;
  };
