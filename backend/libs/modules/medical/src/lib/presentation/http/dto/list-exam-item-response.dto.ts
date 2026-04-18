import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EMedicalExamStatus } from '../../../domain/enums/medical-exam-status.enum';
import { ExamUserDto } from './exam-user.dto';

export class ListExamItemResponseDto {
  @ApiProperty({ example: 'b2c3d4e5-0000-0000-0000-000000000002' })
  id!: string;

  @ApiProperty({ enum: EMedicalExamStatus, example: EMedicalExamStatus.DONE })
  status!: EMedicalExamStatus;

  @ApiProperty({ example: 'chest-xray.dcm' })
  fileName!: string;

  @ApiPropertyOptional({
    example: 'No abnormalities detected.',
    nullable: true,
  })
  report!: string | null;

  @ApiProperty({ example: '2026-04-18T12:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ type: ExamUserDto })
  reportedBy!: ExamUserDto;

  @ApiProperty({ type: ExamUserDto })
  uploadedBy!: ExamUserDto;

  constructor({
    id,
    status,
    fileName,
    report,
    createdAt,
    reportedBy,
    uploadedBy,
  }: {
    id: string;
    status: EMedicalExamStatus;
    fileName: string;
    report: string | null;
    createdAt: Date;
    reportedBy: ExamUserDto;
    uploadedBy: ExamUserDto;
  }) {
    Object.assign(this, {
      id,
      status,
      fileName,
      report,
      createdAt,
      reportedBy,
      uploadedBy,
    });
  }
}
