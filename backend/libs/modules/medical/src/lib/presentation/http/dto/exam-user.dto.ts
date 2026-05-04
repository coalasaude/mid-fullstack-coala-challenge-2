import { ApiPropertyOptional } from '@nestjs/swagger';
import { ERole } from '@healthflow/shared';

export class ExamUserDto {
  @ApiPropertyOptional({ example: 'a1b2c3d4-0000-0000-0000-000000000001' })
  id?: string;

  @ApiPropertyOptional({ example: 'doctor@healthflow.com' })
  email?: string;

  @ApiPropertyOptional({ enum: ERole, example: ERole.DOCTOR })
  role?: ERole;

  constructor({
    id,
    email,
    role,
  }: {
    id?: string;
    email?: string;
    role?: ERole;
  }) {
    Object.assign(this, { id, email, role });
  }
}
