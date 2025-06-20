import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IAuthService } from '../../../core/interfaces/auth-service.interface';
import { User } from '../../../core/entities/user.entity';
import {
  RegisterAdminDto,
  RegisterSupportUserDto,
  RegisterUserDto,
} from '../../../application/dto/register.dto';
import { EmailService } from './email.service';
import * as bcrypt from 'bcrypt';
import { FindOneOptions, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { UserRole } from 'src/core/enums/user-role.enum';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (user && !user.isVerified) {
      throw new UnauthorizedException('Email not verified');
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(user: User): Promise<{ accessToken: string }> {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async registerUser(registerUserDto: RegisterUserDto): Promise<Partial<User>> {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const tempPassword = this.generateRandomPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const jwtExpiry = this.getJwtExpiry();

    const token = this.jwtService.sign(
      {
        sub: registerUserDto.email,
        purpose: 'reset-password',
      },
      { expiresIn: jwtExpiry },
    );

    const newUser = this.userRepository.create({
      ...registerUserDto,
      password: hashedPassword,
      isVerified: false,
      passwordResetToken: token,
      passwordResetExpires: new Date(Date.now() + jwtExpiry),
    });
    await this.userRepository.save(newUser);

    await this.emailService.sendWelcomeEmail(newUser.email, token);

    const { password, passwordResetToken, ...safeUser } = newUser;
    return safeUser;
  }

  async registerAdmin(registerAdminDto: RegisterAdminDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerAdminDto.email },
    });

    if (existingUser) {
      throw new BadRequestException(
        'Email already exists with role ' + existingUser.role,
      );
    }
    const hashedPassword = await bcrypt.hash(registerAdminDto.password, 10);
    const user = this.userRepository.create({
      ...registerAdminDto,
      password: hashedPassword,
      role: UserRole.ADMIN,
      isVerified: true,
    });
    return this.userRepository.save(user);
  }

  async createSupportUser(registerSupportUserDto: RegisterSupportUserDto) {
    const userexsts = await this.userRepository.findOne({
      where: { email: registerSupportUserDto.email },
    });
    if (userexsts) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(
      registerSupportUserDto.password,
      10,
    );
    const user = this.userRepository.create({
      ...registerSupportUserDto,
      role: UserRole.SUPPORT_DESK,
      isVerified: true,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    let payload: any;
    try {
      payload = this.jwtService.verify(token);
    } catch (err) {
      this.makeTokenNull(payload.sub);
      throw new BadRequestException('Invalid or expired token');
    }

    const user = await this.userRepository.findOne({
      where: {
        email: payload.sub,
        passwordResetToken: token,
        passwordResetExpires: MoreThan(new Date()),
      },
    });

    if (!user) {
      this.makeTokenNull(payload.sub);
      throw new BadRequestException('Invalid or expired token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.userRepository.update(user.id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
      isVerified: true,
    });
  }

  async sentPassResetEmail(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      return;
    }

    const tempPassword = this.generateRandomPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const jwtExpiry = this.getJwtExpiry();

    const token = this.jwtService.sign(
      {
        sub: email,
        purpose: 'reset-password',
      },
      { expiresIn: jwtExpiry },
    );

    await this.userRepository.update(user.id, {
      password: hashedPassword,
      isVerified: false,
      passwordResetToken: token,
      passwordResetExpires: new Date(Date.now() + jwtExpiry),
    });

    await this.emailService.sendPasswordResetEmail(user.email, token);
  }

  async findById(options: FindOneOptions<User>): Promise<User | null> {
    return this.userRepository.findOne(options);
  }

  private async makeTokenNull(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      return;
    }
    await this.userRepository.update(user.id, {
      passwordResetToken: null,
      passwordResetExpires: null,
    });
  }

  private generateRandomPassword(length = 12): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    const crypto = require('crypto');
    const values = crypto.randomBytes(length);

    for (let i = 0; i < length; i++) {
      result += chars[values[i] % chars.length];
    }

    return result;
  }

  private getJwtExpiry() {
    return parseInt(this.configService.get('JWT_RESET_PASS_EXP') || '360000');
  }
}
