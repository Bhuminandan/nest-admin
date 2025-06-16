import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../../core/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { RegisterSupportUserDto } from '../../../application/dto/register.dto';
import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';

jest.mock('../../../core/enums/user-role.enum', () => ({
  UserRole: {
    USER: 'USER',
    ADMIN: 'ADMIN',
    SUPER_ADMIN: 'SUPER_ADMIN',
    POWER_USER: 'POWER_USER',
    SUPPORT_DESK: 'SUPPORT_DESK',
  },
}));

import { UserRole } from '../../../core/enums/user-role.enum';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockReturnValue(Buffer.from('mocked-random-bytes')),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;
  let emailService: EmailService;
  let configService: ConfigService;

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn().mockImplementation((dto) => dto),
    update: jest.fn().mockResolvedValue({
      affected: 1,
    }),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mockToken'),
    verify: jest.fn().mockReturnValue({
      sub: 'user@example.com',
      purpose: 'reset-password',
    }),
  };

  const mockEmailService = {
    sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('360000'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
    emailService = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  describe('createSupportUser', () => {
    const registerSupportUserDto: RegisterSupportUserDto = {
      email: 'support@example.com',
      password: 'support123',
    };

    it('should create a new support user', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.save.mockResolvedValue({
        id: '123',
        email: 'support@example.com',
        role: UserRole.SUPPORT_DESK,
        isVerified: true,
      });

      const result = await service.createSupportUser(registerSupportUserDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'support@example.com' },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('support123', 10);
      expect(userRepository.create).toHaveBeenCalledWith({
        email: 'support@example.com',
        password: 'hashedPassword',
        role: UserRole.SUPPORT_DESK,
        isVerified: true,
      });
      expect(userRepository.save).toHaveBeenCalled();
      expect(result).toEqual({
        id: '123',
        email: 'support@example.com',
        role: UserRole.SUPPORT_DESK,
        isVerified: true,
      });
    });

    it('should throw BadRequestException if user already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        email: 'support@example.com',
      });

      await expect(
        service.createSupportUser(registerSupportUserDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('sentPassResetEmail', () => {
    it('should send password reset email for existing user', async () => {
      const mockUser = {
        id: '123',
        email: 'user@example.com',
      };
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await service.sentPassResetEmail('user@example.com');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'user@example.com' },
      });
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(jwtService.sign).toHaveBeenCalled();
      expect(userRepository.update).toHaveBeenCalledWith('123', {
        password: 'hashedPassword',
        isVerified: false,
        passwordResetToken: 'mockToken',
        passwordResetExpires: expect.any(Date),
      });
      expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        'user@example.com',
        'mockToken',
      );
    });

    it('should do nothing if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await service.sentPassResetEmail('nonexistent@example.com');

      expect(userRepository.findOne).toHaveBeenCalled();
      expect(userRepository.update).not.toHaveBeenCalled();
      expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });

  describe('makeTokenNull', () => {
    it('should nullify token for existing user', async () => {
      const mockUser = {
        id: '123',
        email: 'user@example.com',
      };
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await service['makeTokenNull']('user@example.com');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'user@example.com' },
      });
      expect(userRepository.update).toHaveBeenCalledWith('123', {
        passwordResetToken: null,
        passwordResetExpires: null,
      });
    });

    it('should do nothing if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await service['makeTokenNull']('nonexistent@example.com');

      expect(userRepository.findOne).toHaveBeenCalled();
      expect(userRepository.update).not.toHaveBeenCalled();
    });
  });
});
