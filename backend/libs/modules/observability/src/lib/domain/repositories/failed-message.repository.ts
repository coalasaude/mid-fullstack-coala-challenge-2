import type {
  FailedMessagePersistInput,
  IFailedMessagePersistence,
} from '@healthflow/infra';

export abstract class FailedMessageRepository implements IFailedMessagePersistence {
  abstract persist(input: FailedMessagePersistInput): Promise<void>;
}
