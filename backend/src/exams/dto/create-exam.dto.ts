import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateExamDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  patientName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(60)
  examType: string;
}
