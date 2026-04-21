import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateReportDto {
  @IsString()
  @MinLength(10, { message: 'Laudo deve ter pelo menos 10 caracteres' })
  @MaxLength(5000)
  report: string;
}
