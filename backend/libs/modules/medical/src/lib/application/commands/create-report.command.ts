import { LoggedUser } from '@healthflow/shared';
import { User } from '../../domain/entities/user.entity';

export class CreateReportCommand {
  private readonly _reportedBy: User;
  private readonly _report: string;
  private readonly _examId: string;

  constructor(examId: string, report: string, reportedBy: LoggedUser) {
    if (!examId?.trim()) {
      throw new Error('Exam id is required');
    }
    if (!report?.trim()) {
      throw new Error('Report is required');
    }
    if (!reportedBy) {
      throw new Error('User is required');
    }
    this._examId = examId.trim();
    this._report = report.trim();
    this._reportedBy = User.fromPrimitives(reportedBy);
  }

  get report(): string {
    return this._report;
  }

  get examId(): string {
    return this._examId;
  }

  get reportedBy(): User {
    return this._reportedBy;
  }
}
