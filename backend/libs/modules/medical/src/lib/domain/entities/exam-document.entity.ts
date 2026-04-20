import { Entity, Option } from '@healthflow/shared';
import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';

export const ALLOWED_EXAM_MIME_TYPES = [
  'application/pdf',
  'application/dicom',
  'image/png',
  'image/jpeg',
  'image/jpg',
] as const;

export const MAX_EXAM_FILE_SIZE = 50 * 1024 * 1024;

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
    if (
      !ALLOWED_EXAM_MIME_TYPES.includes(
        input.mimeType as (typeof ALLOWED_EXAM_MIME_TYPES)[number],
      )
    ) {
      throw new BadRequestException(`Unsupported file type: ${input.mimeType}`);
    }
    if (input.fileSize <= 0 || input.fileSize > MAX_EXAM_FILE_SIZE) {
      throw new BadRequestException('Invalid file size');
    }
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
