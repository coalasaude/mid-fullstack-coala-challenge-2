import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import type { Options } from 'argon2';
import { IPasswordHasherProvider } from '@healthflow/shared';

const HASH_OPTIONS: Options = {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
};

@Injectable()
export class Argon2PasswordHasherProvider extends IPasswordHasherProvider {
  async hash(plain: string): Promise<string> {
    return argon2.hash(plain, HASH_OPTIONS);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plain);
    } catch {
      return false;
    }
  }
}
