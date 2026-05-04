import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateReportDto {
  @ApiProperty({ example: 'No abnormalities detected. Lungs appear clear.' })
  @IsString()
  @IsNotEmpty()
  report!: string;
}
