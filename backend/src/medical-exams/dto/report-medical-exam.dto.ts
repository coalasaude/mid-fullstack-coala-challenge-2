import { IsNotEmpty, IsString } from 'class-validator';

export class ReportMedicalExamDto {
  @IsString()
  @IsNotEmpty()
  report: string;
}