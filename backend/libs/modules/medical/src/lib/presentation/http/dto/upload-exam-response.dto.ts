import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EMedicalExamStatus } from '../../../domain/enums/medical-exam-status.enum';

export class UploadExamResponseDto {
  @ApiProperty({ example: 'b2c3d4e5-0000-0000-0000-000000000002' })
  id!: string;

  @ApiProperty({
    enum: EMedicalExamStatus,
    example: EMedicalExamStatus.PENDING,
  })
  status!: EMedicalExamStatus;

  @ApiPropertyOptional({ example: null, nullable: true })
  processingResult!: string | null;

  @ApiPropertyOptional({
    example: 'https://bucket.example.com/medical-exams/.../chest.dcm',
    nullable: true,
    description: 'Public URL of the uploaded file (after storage upload)',
  })
  url!: string | null;

  constructor({
    id,
    status,
    processingResult,
    url,
  }: {
    id: string;
    status: EMedicalExamStatus;
    processingResult: string | null;
    url: string | null;
  }) {
    Object.assign(this, { id, status, processingResult, url });
  }
}
