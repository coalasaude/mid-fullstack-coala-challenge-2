import { ApiProperty } from '@nestjs/swagger';
import { ERole } from '@healthflow/shared';

export class LoginResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-0000-0000-0000-000000000001' })
  id!: string;

  @ApiProperty({ example: 'doctor@healthflow.com' })
  email!: string;

  @ApiProperty({ enum: ERole, example: ERole.DOCTOR })
  role!: ERole;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token!: string;

  constructor({
    id,
    email,
    role,
    access_token,
  }: {
    id: string;
    email: string;
    role: ERole;
    access_token: string;
  }) {
    Object.assign(this, { id, email, role, access_token });
  }
}
