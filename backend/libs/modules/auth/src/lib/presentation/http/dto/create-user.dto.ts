import { ApiProperty } from '@nestjs/swagger';
import { ERole } from '@healthflow/shared';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'attendant@healthflow.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'Password1!' })
  @IsString()
  @IsNotEmpty()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character',
    },
  )
  password!: string;

  @ApiProperty({ enum: ERole, example: ERole.ATTENDANT })
  @IsEnum(ERole)
  @IsNotEmpty()
  role!: ERole;
}
