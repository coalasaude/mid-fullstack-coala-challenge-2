import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IPasswordHasherProvider } from '@healthflow/shared';
import { UserRepository } from '../../domain/repositories/user.repository';
import { LoginCommand } from '../commands/login.command';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: IPasswordHasherProvider,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: LoginCommand) {
    const email = command.email;

    const user = await this.userRepository.findByEmail(email);

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await this.passwordHasher.compare(
      command.password.value,
      user.passwordHash,
    );

    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    const access_token = this.jwtService.sign({
      id: user.id,
      email: user.email.value,
      role: user.role,
    });

    return {
      id: user.id,
      email: user.email.value,
      role: user.role,
      access_token,
    };
  }
}
