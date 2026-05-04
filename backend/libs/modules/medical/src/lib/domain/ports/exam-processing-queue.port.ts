import { Result } from '@healthflow/shared';

export abstract class ExamProcessingQueuePort {
  abstract publishExamQueued(examId: string): Promise<Result<void, Error>>;
}
