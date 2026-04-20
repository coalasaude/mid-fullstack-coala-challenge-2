import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import type { SignOptions } from 'jsonwebtoken';
import {
  IObjectStorageProvider,
  IPasswordHasherProvider,
} from '@healthflow/shared';
import { Argon2PasswordHasherProvider } from './services/argon2-password-hasher.provider';
import { S3ObjectStorageProvider } from './services/s3-object-storage.provider';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => ({
        secret: config.getOrThrow<string>('jwt.secret'),
        signOptions: {
          expiresIn: (config.get<string>('jwt.expiresIn') ??
            '') as SignOptions['expiresIn'],
        },
      }),
    }),
  ],
  providers: [
    Argon2PasswordHasherProvider,
    S3ObjectStorageProvider,
    {
      provide: IPasswordHasherProvider,
      useExisting: Argon2PasswordHasherProvider,
    },
    {
      provide: IObjectStorageProvider,
      useExisting: S3ObjectStorageProvider,
    },
  ],
  exports: [JwtModule, IPasswordHasherProvider, IObjectStorageProvider],
})
export class ProvidersModule {}
