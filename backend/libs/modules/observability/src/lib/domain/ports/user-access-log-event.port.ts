import { Result } from '@healthflow/shared';
import { UserAccessLogEventDto } from '../../application/dtos/user-access-log-event.dto';

export abstract class UserAccessLogEventPort {
  abstract publish(event: UserAccessLogEventDto): Promise<Result<void, Error>>;
}
