import { UserAccessLog } from '../entities/user-access-log.entity';

export abstract class UserAccessLogRepository {
  abstract persist(userAccessLog: UserAccessLog): Promise<UserAccessLog>;
}
