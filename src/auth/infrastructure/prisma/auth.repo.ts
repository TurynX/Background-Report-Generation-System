import { IAuthRepository } from '../../domain/auth.repo.interface';
import { Injectable } from '@nestjs/common';
import {
  FindByEmailResponse,
  RegisterResponse,
} from '../../domain/auth.entities';
import { PrismaService } from 'src/lib/prisma.service';
import { RegisterDto } from '../dtos/auth.dto';

@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async register(data: RegisterDto): Promise<RegisterResponse> {
    const user = await this.prisma.user.create({
      data,
    });

    return new RegisterResponse(user.id, user.email);
  }

  async findByEmail(email: string): Promise<FindByEmailResponse | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) return null;

    return new FindByEmailResponse(user.id, user.email, user.password);
  }
}
