import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { RegisterAdminDto, RegisterUserDto } from '../../../application/dto/register.dto';
import { RequestPasswordResetDto } from '../../../application/dto/request-password-reset.dto';
import { ResetPasswordDto } from '../../../application/dto/reset-password.dto';
import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../services/email.service';
import { User } from '../../../core/entities/user.entity';

jest.mock('../../../core/enums/user-role.enum', () => ({
  UserRole: {
    USER: 'USER',
    ADMIN: 'ADMIN',
    SUPER_ADMIN: 'SUPER_ADMIN',
    POWER_USER: 'POWER_USER',
    SUPPORT_DESK: 'SUPPORT_DESK'
  }
}));

import { UserRole } from '../../../core/enums/user-role.enum';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    registerUser: jest.fn(),
    registerAdmin: jest.fn(),
    requestPasswordReset: jest.fn(),
    resetPassword: jest.fn(),
  };

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn() },
        },
        {
          provide: EmailService,
          useValue: { sendEmail: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return token on successful login', async () => {
      const mockUser = { id: 1, username: 'testuser' };
      const mockToken = { access_token: 'mock-token' };

      const mockRequest = { user: mockUser };
      mockAuthService.login.mockResolvedValue(mockToken);

      await controller.login(mockRequest, mockResponse);

      expect(mockAuthService.login).toHaveBeenCalledWith(mockUser);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(mockToken);
    });

    it('should use LocalAuthGuard', () => {
      const metadata = Reflect.getMetadata('__guards__', AuthController.prototype.login);
      expect(metadata).toEqual(expect.arrayContaining([expect.any(Function)]));
    });
  });

  describe('register', () => {
    const registerUserDto: RegisterUserDto = {
      email: 'newuser@example.com',
      role: UserRole.USER,
    };

    it('should register a new user and return the result', async () => {
      const mockResult = { id: 'uuid', ...registerUserDto };
      mockAuthService.registerUser.mockResolvedValue(mockResult);

      await controller.register(registerUserDto, mockResponse);

      expect(mockAuthService.registerUser).toHaveBeenCalledWith(registerUserDto);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });

    it('should have JwtAuthGuard and RolesGuard', () => {
      const metadata = Reflect.getMetadata('__guards__', AuthController.prototype.register);
      expect(metadata).toEqual(expect.arrayContaining([expect.any(Function)]));
    });

    it('should require ADMIN role', () => {
      const rolesMetadata = Reflect.getMetadata('roles', AuthController.prototype.register);
      expect(rolesMetadata).toEqual([UserRole.ADMIN]);
    });
  });

  describe('registerAdmin', () => {
    const registerAdminDto: RegisterAdminDto = {
      email: 'newadmin@example.com',
      password: 'admin123',
    };

    it('should register a new admin and return the result', async () => {
      const mockResult = { id: 'uuid', ...registerAdminDto };
      mockAuthService.registerAdmin.mockResolvedValue(mockResult);

      await controller.registerAdmin(registerAdminDto, mockResponse);

      expect(mockAuthService.registerAdmin).toHaveBeenCalledWith(registerAdminDto);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });

    it('should have JwtAuthGuard and RolesGuard', () => {
      const metadata = Reflect.getMetadata('__guards__', AuthController.prototype.registerAdmin);
      expect(metadata).toEqual(expect.arrayContaining([expect.any(Function)]));
    });

    it('should require SUPER_ADMIN role', () => {
      const rolesMetadata = Reflect.getMetadata('roles', AuthController.prototype.registerAdmin);
      expect(rolesMetadata).toEqual([UserRole.SUPER_ADMIN]);
    });
  });

  describe('requestPasswordReset', () => {
    const requestPasswordResetDto: RequestPasswordResetDto = {
      email: 'user@example.com',
    };

    it('should request password reset', async () => {
      mockAuthService.requestPasswordReset.mockResolvedValue(undefined);

      await controller.requestPasswordReset(requestPasswordResetDto, mockResponse);

      expect(mockAuthService.requestPasswordReset).toHaveBeenCalledWith(requestPasswordResetDto.email);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'If an account exists, a password reset email has been sent',
      });
    });
  });

  describe('resetPassword', () => {
    const resetPasswordDto: ResetPasswordDto = {
      token: 'reset-token',
      newPassword: 'newpassword123',
      confirmPassword: 'newpassword123',
    };

    it('should reset password', async () => {
      mockAuthService.resetPassword.mockResolvedValue(undefined);

      await controller.resetPassword(resetPasswordDto, mockResponse);

      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(
        resetPasswordDto.token,
        resetPasswordDto.newPassword,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Password reset successful',
      });
    });
  });

  describe('validateToken', () => {
    it('should validate token', async () => {
      await controller.validateToken(mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({ valid: true });
    });

    it('should have JwtAuthGuard', () => {
      const metadata = Reflect.getMetadata('__guards__', AuthController.prototype.validateToken);
      expect(metadata).toEqual(expect.arrayContaining([expect.any(Function)]));
    });
  });
});
