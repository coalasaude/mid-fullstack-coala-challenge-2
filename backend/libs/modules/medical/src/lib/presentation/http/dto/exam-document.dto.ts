import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExamDocumentDto {
  @ApiProperty({ example: 'chest-xray.dcm' })
  fileName!: string;

  @ApiProperty({ example: 'application/dicom' })
  mimeType!: string;

  @ApiProperty({ example: 1048576 })
  fileSize!: number;

  @ApiPropertyOptional({
    example: 'https://bucket.example.com/medical-exams/.../chest-xray.dcm',
    nullable: true,
  })
  url!: string | null;

  constructor({
    fileName,
    mimeType,
    fileSize,
    url,
  }: {
    fileName: string;
    mimeType: string;
    fileSize: number;
    url: string | null;
  }) {
    Object.assign(this, { fileName, mimeType, fileSize, url });
  }
}
