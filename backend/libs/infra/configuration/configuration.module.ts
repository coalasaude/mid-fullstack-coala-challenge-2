import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configuration } from './configuration';
import { factoryValidate } from './validation';

@Module({})
export class ConfigurationModule {
  static register(): DynamicModule {
    return {
      module: ConfigurationModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [configuration],
          validate: factoryValidate(),
        }),
      ],
      global: true,
    };
  }
}
