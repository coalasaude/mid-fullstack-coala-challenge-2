import { Entity, Option } from '@healthflow/shared';
import { randomUUID } from 'crypto';

export interface ExamDocumentProps {
  id: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  url: Option<string>;
  createdAt: Date;
  updatedAt: Date;
}

export class ExamDocument extends Entity<ExamDocumentProps> {
  get fileName(): string {
    return this.props.fileName;
  }

  get mimeType(): string {
    return this.props.mimeType;
  }

  get fileSize(): number {
    return this.props.fileSize;
  }

  get url(): Option<string> {
    return this.props.url;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  static create(input: {
    fileName: string;
    mimeType: string;
    fileSize: number;
  }): ExamDocument {
    const now = new Date();
    return new ExamDocument({
      id: randomUUID(),
      fileName: input.fileName,
      mimeType: input.mimeType,
      fileSize: input.fileSize,
      url: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  attachUrl(url: string): void {
    this.props.url = url;
    this.props.updatedAt = new Date();
  }
}
