import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import {
  RegisterAdminDto,
  RegisterSupportUserDto,
  RegisterUserDto,
} from '../../../application/dto/register.dto';
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
    SUPPORT_DESK: 'SUPPORT_DESK',
  },
}));

import { UserRole } from '../../../core/enums/user-role.enum';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    registerUser: jest.fn(),
    registerAdmin: jest.fn(),
    resetPassword: jest.fn(),
    sentPassResetEmail: jest.fn(),
    createSupportUser: jest.fn(),
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
      const metadata = Reflect.getMetadata(
        '__guards__',
        AuthController.prototype.login,
      );
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

      expect(mockAuthService.registerUser).toHaveBeenCalledWith(
        registerUserDto,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.CREATED,
        message: 'User registered successfully',
        data: mockResult,
      });
    });

    it('should have JwtAuthGuard and RolesGuard', () => {
      const metadata = Reflect.getMetadata(
        '__guards__',
        AuthController.prototype.register,
      );
      expect(metadata).toEqual(expect.arrayContaining([expect.any(Function)]));
    });

    it('should require ADMIN role', () => {
      const rolesMetadata = Reflect.getMetadata(
        'roles',
        AuthController.prototype.register,
      );
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

      expect(mockAuthService.registerAdmin).toHaveBeenCalledWith(
        registerAdminDto,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.CREATED,
        message: 'Admin registered successfully',
        data: mockResult,
      });
    });

    it('should have JwtAuthGuard and RolesGuard', () => {
      const metadata = Reflect.getMetadata(
        '__guards__',
        AuthController.prototype.registerAdmin,
      );
      expect(metadata).toEqual(expect.arrayContaining([expect.any(Function)]));
    });

    it('should require SUPER_ADMIN role', () => {
      const rolesMetadata = Reflect.getMetadata(
        'roles',
        AuthController.prototype.registerAdmin,
      );
      expect(rolesMetadata).toEqual([UserRole.SUPER_ADMIN]);
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
        statusCode: HttpStatus.OK,
        message: 'Password reset successful',
      });
    });
  });

  describe('passResetEmail', () => {
    it('should send password reset email', async () => {
      const email = 'user@example.com';
      mockAuthService.sentPassResetEmail.mockResolvedValue(undefined);

      await controller.passResetEmail(email, mockResponse);

      expect(mockAuthService.sentPassResetEmail).toHaveBeenCalledWith(email);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.OK,
        message: 'Password reset email sent',
      });
    });
  });

  describe('createSupportUser', () => {
    const registerSupportUserDto: RegisterSupportUserDto = {
      email: 'support@example.com',
      password: 'support123',
    };

    it('should create a support user', async () => {
      const mockResult = { id: 'uuid', ...registerSupportUserDto };
      mockAuthService.createSupportUser.mockResolvedValue(mockResult);

      await controller.createSupportUser(mockResponse, registerSupportUserDto);

      expect(mockAuthService.createSupportUser).toHaveBeenCalledWith(
        registerSupportUserDto,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.CREATED,
        message: 'Support user created successfully',
        data: mockResult,
      });
    });

    it('should have JwtAuthGuard and RolesGuard', () => {
      const metadata = Reflect.getMetadata(
        '__guards__',
        AuthController.prototype.createSupportUser,
      );
      expect(metadata).toEqual(expect.arrayContaining([expect.any(Function)]));
    });

    it('should require SUPER_ADMIN, ADMIN, or POWER_USER role', () => {
      const rolesMetadata = Reflect.getMetadata(
        'roles',
        AuthController.prototype.createSupportUser,
      );
      expect(rolesMetadata).toEqual([
        UserRole.SUPER_ADMIN,
        UserRole.ADMIN,
        UserRole.POWER_USER,
      ]);
    });
  });
});
