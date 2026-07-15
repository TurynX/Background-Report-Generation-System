import { RegisterDto } from '../infrastructure/dtos/auth.dto';
import { FindByEmailResponse, RegisterResponse } from './auth.entities';

export interface IAuthRepository {
  register(data: RegisterDto): Promise<RegisterResponse>;
  findByEmail(email: string): Promise<FindByEmailResponse | null>;
}

export const AUTH_REPOSITORY = 'AUTH_REPOSITORY';
