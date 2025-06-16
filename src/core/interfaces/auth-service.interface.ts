import { User } from '../entities/user.entity';
import {
  RegisterUserDto,
  RegisterAdminDto,
  RegisterSupportUserDto,
} from '../../application/dto/register.dto';
import { FindOneOptions } from 'typeorm';

export interface IAuthService {
  validateUser(email: string, password: string): Promise<User>;
  login(user: User): Promise<{ accessToken: string }>;
  registerUser(createUserDto: RegisterUserDto): Promise<Partial<User>>;
  registerAdmin(registerAdminDto: RegisterAdminDto): Promise<User>;
  createSupportUser(
    registerSupportUserDto: RegisterSupportUserDto,
  ): Promise<User>;
  resetPassword(token: string, newPassword: string): Promise<void>;
  sentPassResetEmail(email: string): Promise<void>;
  findById(options: FindOneOptions<User>): Promise<User | null>;
}
