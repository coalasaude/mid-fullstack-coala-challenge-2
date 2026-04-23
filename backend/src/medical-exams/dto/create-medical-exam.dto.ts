import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMedicalExamDto {
  @IsString()
  @IsNotEmpty()
  fileReference: string;
}
