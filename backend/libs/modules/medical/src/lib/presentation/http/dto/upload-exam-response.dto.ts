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

  constructor({
    id,
    status,
    processingResult,
  }: {
    id: string;
    status: EMedicalExamStatus;
    processingResult: string | null;
  }) {
    Object.assign(this, { id, status, processingResult });
  }
}
