import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserUseCase } from '../../../application/use-cases/create-user.use-case';
import { CreateUserDto } from '../dto/create-user.dto';
import { CreateUserCommand } from '../../../application/commands/create-user.command';

@Controller('users')
export class UsersController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.createUserUseCase.execute(
      new CreateUserCommand(dto.email, dto.password, dto.role),
    );
  }
}
