import { User } from '../entities/user.entity';
import { RegisterUserDto } from '../../application/dto/register.dto';

export interface IAuthService {
  validateUser(email: string, password: string): Promise<User>;
  login(user: User): Promise<{ accessToken: string }>;
  registerUser(createUserDto: RegisterUserDto): Promise<Partial<User>>;
  requestPasswordReset(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
}
