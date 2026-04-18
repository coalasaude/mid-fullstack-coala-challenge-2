import { Option, ERole } from '@healthflow/shared';
import { User } from '../entities/user.entity';
import { Email } from '../value-objects/email';

export abstract class UserRepository {
  abstract create(input: {
    email: Email;
    passwordHash: string;
    role: ERole;
  }): Promise<User>;

  abstract findByEmail(email: Email): Promise<Option<User>>;
}
