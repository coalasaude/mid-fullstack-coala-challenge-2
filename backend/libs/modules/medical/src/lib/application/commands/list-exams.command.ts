import { LoggedUser } from '@healthflow/shared';
import { User } from '../../domain/entities/user.entity';

export class ListExamsCommand {
  private readonly _user: User;

  constructor(user: LoggedUser) {
    if (!user) {
      throw new Error('User is required');
    }
    this._user = User.fromPrimitives(user);
  }

  get user(): User {
    return this._user;
  }
}
