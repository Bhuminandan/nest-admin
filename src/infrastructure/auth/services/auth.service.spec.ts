import {
   Test,
   TestingModule
} from '@nestjs/testing';
import {
   AuthService
} from './auth.service';
import {
   getRepositoryToken
} from '@nestjs/typeorm';
import {
   User
} from '../../../core/entities/user.entity';
import {
   JwtService
} from '@nestjs/jwt';
import {
   EmailService
} from './email.service';
import {
   ConfigService
} from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import {
   RegisterAdminDto,
   RegisterUserDto
} from '../../../application/dto/register.dto';
import {
   BadRequestException,
   UnauthorizedException
} from '@nestjs/common';
import {
   MoreThan,
   Repository
} from 'typeorm';

jest.mock('../../../core/enums/user-role.enum', () => ({
   UserRole: {
      USER: 'USER',
      ADMIN: 'ADMIN',
      SUPER_ADMIN: 'SUPER_ADMIN',
      POWER_USER: 'POWER_USER',
      SUPPORT_DESK: 'SUPPORT_DESK'
   }
}));

import {
   UserRole
} from '../../../core/enums/user-role.enum';

jest.mock('bcrypt', () => ({
   hash: jest.fn().mockResolvedValue('hashedPassword'),
   compare: jest.fn().mockResolvedValue(true),
}));

jest.mock('crypto', () => ({
   randomBytes: jest.fn().mockReturnValue(Buffer.from('mocked-random-bytes')),
}));

describe('AuthService', () => {
   let service: AuthService;
   let userRepository: Repository < User > ;
   let jwtService: JwtService;
   let emailService: EmailService;
   let configService: ConfigService;

   const mockUserRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn().mockImplementation(dto => dto),
      update: jest.fn().mockResolvedValue({
         affected: 1
      }),
   };

   const mockJwtService = {
      sign: jest.fn().mockReturnValue('mockToken'),
      verify: jest.fn().mockReturnValue({
         sub: 'user@example.com',
         purpose: 'reset-password'
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

      service = module.get < AuthService > (AuthService);
      userRepository = module.get < Repository < User >> (getRepositoryToken(User));
      jwtService = module.get < JwtService > (JwtService);
      emailService = module.get < EmailService > (EmailService);
      configService = module.get < ConfigService > (ConfigService);

      jest.clearAllMocks();
   });

   describe('validateUser', () => {
      it('should return user if credentials are valid', async () => {
         const mockUser = {
            email: 'test@example.com',
            password: 'hashedPassword',
            isVerified: true,
         };
         mockUserRepository.findOne.mockResolvedValue(mockUser);

         const result = await service.validateUser('test@example.com', 'password');
         expect(result).toEqual(mockUser);
         expect(userRepository.findOne).toHaveBeenCalledWith({
            where: {
               email: 'test@example.com'
            }
         });
         expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
      });

      it('should throw UnauthorizedException if email is not verified', async () => {
         const mockUser = {
            email: 'test@example.com',
            password: 'hashedPassword',
            isVerified: false,
         };
         mockUserRepository.findOne.mockResolvedValue(mockUser);

         await expect(service.validateUser('test@example.com', 'password'))
            .rejects.toThrow(UnauthorizedException);
      });

      it('should throw UnauthorizedException if user not found', async () => {
         mockUserRepository.findOne.mockResolvedValue(null);

         await expect(service.validateUser('test@example.com', 'password'))
            .rejects.toThrow(UnauthorizedException);
      });

      it('should throw UnauthorizedException if password is invalid', async () => {
         const mockUser = {
            email: 'test@example.com',
            password: 'hashedPassword',
            isVerified: true,
         };
         mockUserRepository.findOne.mockResolvedValue(mockUser);
         (bcrypt.compare as jest.Mock).mockResolvedValue(false);

         await expect(service.validateUser('test@example.com', 'wrongPassword'))
            .rejects.toThrow(UnauthorizedException);
      });
   });

   describe('login', () => {
      it('should return access token', async () => {
         const mockUser = {
            email: 'test@example.com',
            id: '123',
            role: 'USER',
         };

         const result = await service.login(mockUser as User);
         expect(result).toEqual({
            accessToken: 'mockToken'
         });
         expect(jwtService.sign).toHaveBeenCalledWith({
            email: 'test@example.com',
            sub: '123',
            role: 'USER',
         });
      });
   });

   describe('registerUser', () => {
      const registerUserDto: RegisterUserDto = {
         email: 'new@example.com',
         role: UserRole.USER,
      };

      it('should register new user and send welcome email', async () => {
         mockUserRepository.findOne.mockResolvedValue(null);

         mockUserRepository.create.mockImplementation(dto => ({
            ...dto,
            passwordResetToken: 'mockToken',
            passwordResetExpires: new Date(),
         }));

         mockUserRepository.save.mockImplementation(user => Promise.resolve({
            ...user,
            id: '123',
         }));

         const result = await service.registerUser(registerUserDto);

         expect(userRepository.findOne).toHaveBeenCalledWith({
            where: {
               email: 'new@example.com'
            }
         });
         expect(bcrypt.hash).toHaveBeenCalled();
         expect(jwtService.sign).toHaveBeenCalled();
         expect(userRepository.create).toHaveBeenCalled();
         expect(userRepository.save).toHaveBeenCalled();
         expect(emailService.sendWelcomeEmail).toHaveBeenCalledWith('new@example.com', 'mockToken');

         expect(result).toMatchObject({
            email: 'new@example.com',
            role: UserRole.USER,
            isVerified: false,
         });
      });

      it('should throw BadRequestException if email exists', async () => {
         mockUserRepository.findOne.mockResolvedValue({
            email: 'existing@example.com'
         });

         await expect(service.registerUser(registerUserDto))
            .rejects.toThrow(BadRequestException);
      });
   });

   describe('registerAdmin', () => {
      const registerAdminDto: RegisterAdminDto = {
         email: 'admin@example.com',
         password: 'admin123',
      };

      it('should register new admin', async () => {
         mockUserRepository.findOne.mockResolvedValue(null);

         mockUserRepository.create.mockImplementation(dto => ({
            ...dto,
            password: 'hashedPassword',
            role: 'ADMIN',
            isVerified: true,
         }));

         mockUserRepository.save.mockResolvedValue({
            id: '123',
            email: 'admin@example.com',
            password: 'hashedPassword',
            role: 'ADMIN',
            isVerified: true,
         });

         const result = await service.registerAdmin(registerAdminDto);

         expect(userRepository.findOne).toHaveBeenCalled();
         expect(bcrypt.hash).toHaveBeenCalledWith('admin123', 10);
         expect(userRepository.create).toHaveBeenCalled();
         expect(userRepository.save).toHaveBeenCalled();
         expect(result).toEqual({
            id: '123',
            email: 'admin@example.com',
            password: 'hashedPassword',
            role: 'ADMIN',
            isVerified: true,
         });
      });

      it('should throw BadRequestException if email exists', async () => {
         mockUserRepository.findOne.mockResolvedValue({
            email: 'existing@example.com',
            role: 'USER'
         });

         await expect(service.registerAdmin(registerAdminDto))
            .rejects.toThrow(BadRequestException);
      });
   });


   describe('requestPasswordReset', () => {
      it('should send reset email if user exists', async () => {
         const mockUser = {
            id: '123',
            email: 'user@example.com'
         };
         mockUserRepository.findOne.mockResolvedValue(mockUser);

         await service.requestPasswordReset('user@example.com');

         expect(userRepository.findOne).toHaveBeenCalledWith({
            where: {
               email: 'user@example.com'
            }
         });
         expect(jwtService.sign).toHaveBeenCalledWith({
            sub: '123'
         }, {
            expiresIn: '1h'
         });
         expect(userRepository.update).toHaveBeenCalledWith('123', {
            passwordResetToken: 'mockToken',
            passwordResetExpires: expect.any(Date),
         });
         expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith('user@example.com', 'mockToken');
      });

      it('should not throw if user does not exist', async () => {
         mockUserRepository.findOne.mockResolvedValue(null);

         await expect(service.requestPasswordReset('nonexistent@example.com')).resolves.not.toThrow();
      });
   });

   describe('resetPassword', () => {
      it('should reset password with valid token', async () => {
         const mockUser = {
            id: '123',
            email: 'user@example.com'
         };
         mockUserRepository.findOne.mockResolvedValue(mockUser);

         await service.resetPassword('validToken', 'newPassword');

         expect(jwtService.verify).toHaveBeenCalledWith('validToken');
         expect(userRepository.findOne).toHaveBeenCalledWith({
            where: {
               email: 'user@example.com',
               passwordResetToken: 'validToken',
               passwordResetExpires: MoreThan(expect.any(Date)),
            },
         });
         expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
         expect(userRepository.update).toHaveBeenCalledWith('123', {
            password: 'hashedPassword',
            passwordResetToken: null,
            passwordResetExpires: null,
            isVerified: true,
         });
      });

      it('should throw BadRequestException for invalid token', async () => {
         mockJwtService.verify.mockImplementation(() => {
            throw new Error('Invalid token');
         });

         await expect(service.resetPassword('invalidToken', 'newPassword'))
            .rejects.toThrow(BadRequestException);
      });

      it('should throw BadRequestException if user not found', async () => {
         mockJwtService.verify.mockReturnValue({
            sub: 'user@example.com',
            purpose: 'reset-password'
         });
         mockUserRepository.findOne.mockResolvedValue(null);

         await expect(service.resetPassword('validToken', 'newPassword'))
            .rejects.toThrow(BadRequestException);
      });
   });

   describe('generateRandomPassword', () => {
      it('should generate random password', () => {
         const password = service['generateRandomPassword']();
         expect(password).toBeDefined();
         expect(password.length).toBe(12);
      });
   });

   describe('getJwtExpiry', () => {
      it('should return expiry from config', () => {
         const expiry = service['getJwtExpiry']();
         expect(expiry).toBe(360000);
         expect(configService.get).toHaveBeenCalledWith('JWT_RESET_PASS_EXP');
      });
   });
});