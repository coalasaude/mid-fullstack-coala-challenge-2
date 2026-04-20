import { Option } from '@healthflow/shared';
import { User } from '../entities/user.entity';
import { Email } from '../value-objects/email';

export abstract class UserRepository {
  abstract persist(user: User): Promise<User>;

  abstract findByEmail(email: Email): Promise<Option<User>>;
}
