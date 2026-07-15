import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { LoginDto, RegisterDto } from '../../dtos/auth.dto';
import { LoginUseCase } from 'src/auth/application/use-cases/login.use-case';
import { RegisterUseCase } from 'src/auth/application/use-cases/register.use-case';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  @Post('register')
  @HttpCode(201)
  async register(@Body() dto: RegisterDto) {
    const response = await this.registerUseCase.execute(dto);
    return { message: 'User registered successfully', data: response };
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto) {
    const response = await this.loginUseCase.execute(dto);
    return { message: 'User logged in successfully', data: response };
  }
}
