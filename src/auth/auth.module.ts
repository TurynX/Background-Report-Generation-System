import { Module } from '@nestjs/common';
import { AuthController } from './infrastructure/controllers/auth/auth.controller';
import { AUTH_REPOSITORY } from './domain/auth.repo.interface';
import { AuthRepository } from './infrastructure/prisma/auth.repo';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';

import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './infrastructure/guards/auth.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY!,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN! as any },
    }),
  ],

  controllers: [AuthController],
  providers: [
    LoginUseCase,
    RegisterUseCase,
    AuthGuard,

    {
      provide: AUTH_REPOSITORY,
      useClass: AuthRepository,
    },
  ],

  exports: [AuthGuard, JwtModule],
})
export class AuthModule {}
