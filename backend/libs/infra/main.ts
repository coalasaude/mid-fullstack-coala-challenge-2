import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>('port');
  const nodeEnv = configService.getOrThrow<string>('env');

  await app.listen(port, () => {
    Logger.log(`Running in ${nodeEnv} mode`, 'Bootstrap');
    Logger.log(`Listening on port ${port}`, 'Bootstrap');
  });
}

void bootstrap();
