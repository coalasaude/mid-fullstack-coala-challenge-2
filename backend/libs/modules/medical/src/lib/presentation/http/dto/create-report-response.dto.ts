import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EMedicalExamStatus } from '../../../domain/enums/medical-exam-status.enum';
import { ExamUserDto } from './exam-user.dto';

export class CreateReportResponseDto {
  @ApiProperty({ example: 'b2c3d4e5-0000-0000-0000-000000000002' })
  id!: string;

  @ApiProperty({
    enum: EMedicalExamStatus,
    example: EMedicalExamStatus.REPORTED,
  })
  status!: EMedicalExamStatus;

  @ApiProperty({ example: 'chest-xray.dcm' })
  fileName!: string;

  @ApiProperty({ example: 'application/dicom' })
  mimeType!: string;

  @ApiProperty({ example: 1048576 })
  fileSize!: number;

  @ApiPropertyOptional({
    example: 'medical-exams/b2c3d4.../chest-xray.dcm',
    nullable: true,
  })
  storagePath!: string | null;

  @ApiPropertyOptional({
    example: 'Processing completed successfully (simulated).',
    nullable: true,
  })
  processingResult!: string | null;

  @ApiPropertyOptional({
    example: 'No abnormalities detected.',
    nullable: true,
  })
  report!: string | null;

  @ApiProperty({ example: '2026-04-18T12:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-04-18T13:00:00.000Z' })
  updatedAt!: Date;

  @ApiProperty({ type: ExamUserDto })
  reportedBy!: ExamUserDto;

  @ApiProperty({ type: ExamUserDto })
  uploadedBy!: ExamUserDto;

  constructor({
    id,
    status,
    fileName,
    mimeType,
    fileSize,
    storagePath,
    processingResult,
    report,
    createdAt,
    updatedAt,
    reportedBy,
    uploadedBy,
  }: {
    id: string;
    status: EMedicalExamStatus;
    fileName: string;
    mimeType: string;
    fileSize: number;
    storagePath: string | null;
    processingResult: string | null;
    report: string | null;
    createdAt: Date;
    updatedAt: Date;
    reportedBy: ExamUserDto;
    uploadedBy: ExamUserDto;
  }) {
    Object.assign(this, {
      id,
      status,
      fileName,
      mimeType,
      fileSize,
      storagePath,
      processingResult,
      report,
      createdAt,
      updatedAt,
      reportedBy,
      uploadedBy,
    });
  }
}
