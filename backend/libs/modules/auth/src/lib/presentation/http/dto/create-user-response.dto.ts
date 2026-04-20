import { ApiProperty } from '@nestjs/swagger';
import { ERole } from '@healthflow/shared';

export class CreateUserResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-0000-0000-0000-000000000001' })
  id!: string;

  @ApiProperty({ example: 'attendant@healthflow.com' })
  email!: string;

  @ApiProperty({ enum: ERole, example: ERole.ATTENDANT })
  role!: ERole;

  @ApiProperty({ example: '2026-04-18T12:00:00.000Z' })
  createdAt!: Date;

  constructor({
    id,
    email,
    role,
    createdAt,
  }: {
    id: string;
    email: string;
    role: ERole;
    createdAt: Date;
  }) {
    Object.assign(this, { id, email, role, createdAt });
  }
}
