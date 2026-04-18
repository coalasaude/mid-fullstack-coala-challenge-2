import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import {
  IObjectStorageProvider,
  Result,
  ObjectStoragePutParams,
  err,
  ok,
  Option,
} from '@healthflow/shared';

@Injectable()
export class S3ObjectStorageProvider extends IObjectStorageProvider {
  private readonly logger = new Logger(S3ObjectStorageProvider.name);
  private client: Option<S3Client> = null;

  constructor(private readonly configService: ConfigService) {
    super();
  }

  private getS3Client(): S3Client {
    if (this.client) {
      return this.client;
    }
    const region = this.configService.get<string>('aws.region')?.trim();
    const accessKeyId = this.configService
      .get<string>('aws.accessKeyId')
      ?.trim();
    const secretAccessKey = this.configService
      .get<string>('aws.secretAccessKey')
      ?.trim();
    if (!region || !accessKeyId || !secretAccessKey) {
      throw new Error(
        'AWS object storage is not configured (set AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)',
      );
    }
    this.client = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });
    return this.client;
  }

  override async putObject(
    params: ObjectStoragePutParams,
  ): Promise<Result<{ url: string }, Error>> {
    const bucket = this.configService.get<string>('aws.bucket')?.trim();
    if (!bucket) {
      return err(
        new Error('AWS object storage is not configured (set AWS_BUCKET)'),
      );
    }
    try {
      await this.getS3Client().send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: params.key,
          Body: params.body,
          ContentType: params.contentType,
        }),
      );
      const bucketUrl = this.configService.getOrThrow<string>('aws.bucketUrl');
      return ok({ url: `${bucketUrl.trim()}/${params.key}` });
    } catch (error) {
      this.logger.error(`S3 putObject failed for key "${params.key}"`, error);
      return err(new Error(`S3 putObject failed for key "${params.key}"`));
    }
  }
}
