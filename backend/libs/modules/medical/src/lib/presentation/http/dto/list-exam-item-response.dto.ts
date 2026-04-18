import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EMedicalExamStatus } from '../../../domain/enums/medical-exam-status.enum';
import { ExamUserDto } from './exam-user.dto';
import { Option } from '@healthflow/shared';
import { ExamDocumentDto } from './exam-document.dto';

export class ListExamItemResponseDto {
  @ApiProperty({ example: 'b2c3d4e5-0000-0000-0000-000000000002' })
  id!: string;

  @ApiProperty({ enum: EMedicalExamStatus, example: EMedicalExamStatus.DONE })
  status!: EMedicalExamStatus;

  @ApiProperty({ type: ExamDocumentDto })
  examDocument!: ExamDocumentDto;

  @ApiPropertyOptional({
    example: 'No abnormalities detected.',
    nullable: true,
  })
  report!: string | null;

  @ApiProperty({ example: '2026-04-18T12:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ type: ExamUserDto })
  reportedBy!: Option<ExamUserDto>;

  @ApiProperty({ type: ExamUserDto })
  uploadedBy!: ExamUserDto;

  constructor({
    id,
    status,
    examDocument,
    report,
    createdAt,
    reportedBy,
    uploadedBy,
  }: {
    id: string;
    status: EMedicalExamStatus;
    examDocument: ExamDocumentDto;
    report: string | null;
    createdAt: Date;
    reportedBy: Option<ExamUserDto>;
    uploadedBy: ExamUserDto;
  }) {
    const examDocumentDto = new ExamDocumentDto({
      fileName: examDocument.fileName,
      mimeType: examDocument.mimeType,
      fileSize: examDocument.fileSize,
      url: examDocument.url,
    });
    const reportedByDto = new ExamUserDto({
      id: reportedBy?.id,
      email: reportedBy?.email,
      role: reportedBy?.role,
    });
    const uploadedByDto = new ExamUserDto({
      id: uploadedBy.id,
      email: uploadedBy.email,
      role: uploadedBy.role,
    });
    Object.assign(this, {
      id,
      status,
      examDocument: examDocumentDto,
      report,
      createdAt,
      reportedBy: reportedByDto,
      uploadedBy: uploadedByDto,
    });
  }
}
