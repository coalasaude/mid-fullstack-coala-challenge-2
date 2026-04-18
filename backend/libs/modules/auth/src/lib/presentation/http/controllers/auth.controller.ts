import { Body, Controller, Post } from '@nestjs/common';
import { LoginUseCase } from '../../../application/use-cases/login.use-case';
import { LoginDto } from '../dto/login.dto';
import { LoginCommand } from '../../../application/commands/login.command';

@Controller('auth')
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(new LoginCommand(dto.email, dto.password));
  }
}
