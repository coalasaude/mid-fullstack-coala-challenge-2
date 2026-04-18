import { LoggedUser } from '@healthflow/shared';
import { User } from '../../domain/entities/user.entity';

export class UploadExamCommand {
  private readonly _fileName: string;
  private readonly _mimeType: string;
  private readonly _fileSize: number;
  private readonly _fileBuffer: Buffer;
  private readonly _uploadedBy: User;
  constructor(
    fileName: string,
    mimeType: string,
    fileSize: number,
    fileBuffer: Buffer,
    uploadedBy: LoggedUser,
  ) {
    if (!fileName?.trim()) {
      throw new Error('File name is required');
    }
    if (!mimeType?.trim()) {
      throw new Error('MIME type is required');
    }
    if (fileSize < 0) {
      throw new Error('File size is invalid');
    }
    if (!uploadedBy) {
      throw new Error('Uploaded by is required');
    }
    this._uploadedBy = User.fromPrimitives(uploadedBy);

    if (!this._uploadedBy.isAttendant()) {
      throw new Error('Uploaded by is not an attendant');
    }
    this._fileName = fileName.trim();
    this._mimeType = mimeType.trim();
    this._fileSize = fileSize;
    this._fileBuffer = fileBuffer;
  }

  get fileName(): string {
    return this._fileName;
  }

  get mimeType(): string {
    return this._mimeType;
  }

  get fileSize(): number {
    return this._fileSize;
  }

  get fileBuffer(): Buffer {
    return this._fileBuffer;
  }

  get uploadedBy(): User {
    return this._uploadedBy;
  }
}
