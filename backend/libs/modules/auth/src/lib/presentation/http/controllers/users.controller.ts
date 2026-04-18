import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserUseCase } from '../../../application/use-cases/create-user.use-case';
import { CreateUserDto } from '../dto/create-user.dto';
import { CreateUserResponseDto } from '../dto/create-user-response.dto';
import { CreateUserCommand } from '../../../application/commands/create-user.command';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user (ATTENDANT or DOCTOR)' })
  @ApiResponse({ status: 201, description: 'User created successfully', type: CreateUserResponseDto })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  create(@Body() dto: CreateUserDto): Promise<CreateUserResponseDto> {
    return this.createUserUseCase.execute(
      new CreateUserCommand(dto.email, dto.password, dto.role),
    );
  }
}
