import { Result } from '../types/result';

export type ObjectStoragePutParams = {
  key: string;
  body: Buffer;
  contentType: string;
};

export abstract class IObjectStorageProvider {
  abstract putObject(
    params: ObjectStoragePutParams,
  ): Promise<Result<{ url: string }, Error>>;
}
