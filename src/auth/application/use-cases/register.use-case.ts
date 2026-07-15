import { RegisterDto } from 'src/auth/infrastructure/dtos/auth.dto';
import * as argon2 from 'argon2';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import type { IAuthRepository } from 'src/auth/domain/auth.repo.interface';
import { RegisterResponse } from 'src/auth/domain/auth.entities';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject('AUTH_REPOSITORY') private readonly authRepository: IAuthRepository,
  ) {}

  async execute(dto: RegisterDto): Promise<RegisterResponse> {
    const { email, name, password } = dto;

    const isEmailRegistered = await this.authRepository.findByEmail(email);

    if (isEmailRegistered) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const hashedPassword = await argon2.hash(password);

    const registeredUser = await this.authRepository.register({
      email,
      name,
      password: hashedPassword,
    });

    if (!registeredUser) {
      throw new InternalServerErrorException('Failed to register');
    }

    return new RegisterResponse(registeredUser.id, registeredUser.email);
  }
}
