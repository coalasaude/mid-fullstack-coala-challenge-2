import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('HealthFlow API')
    .setDescription('API for managing medical exam processing and reporting')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>('port');
  const nodeEnv = configService.getOrThrow<string>('env');

  await app.listen(port, () => {
    Logger.log(`Running in ${nodeEnv} mode`, 'Bootstrap');
    Logger.log(`Listening on port ${port}`, 'Bootstrap');
    Logger.log(
      `Swagger docs available at http://localhost:${port}/docs`,
      'Bootstrap',
    );
  });
}

void bootstrap();
