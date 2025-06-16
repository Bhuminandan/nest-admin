import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  UseGuards,
  Req,
  Param,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../../../application/dto/login.dto';
import {
  RegisterAdminDto,
  RegisterSupportUserDto,
  RegisterUserDto,
} from '../../../application/dto/register.dto';
import { RequestPasswordResetDto } from '../../../application/dto/request-password-reset.dto';
import { ResetPasswordDto } from '../../../application/dto/reset-password.dto';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from 'src/core/enums/user-role.enum';
import { RolesGuard } from '../guards/roles.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Req() req, @Res() res: Response) {
    const result = await this.authService.login(req.user);
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: 'Login successful',
      data: result,
    });
  }

  @Post('register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Register new user (Admin only)' })
  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User registered successfully',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  async register(
    @Body() registerUserDto: RegisterUserDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.authService.registerUser(registerUserDto);
      return res.status(HttpStatus.CREATED).json({
        statusCode: HttpStatus.CREATED,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      throw error;
    }
  }

  @Post('register-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Register new Admin (Super Admin only)' })
  @ApiBody({ type: RegisterAdminDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Admin registered successfully',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  async registerAdmin(
    @Body() registerAdminDto: RegisterAdminDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.authService.registerAdmin(registerAdminDto);
      return res.status(HttpStatus.CREATED).json({
        statusCode: HttpStatus.CREATED,
        message: 'Admin registered successfully',
        data: result,
      });
    } catch (error) {
      throw error;
    }
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Res() res: Response,
  ) {
    await this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: 'Password reset successful',
    });
  }

  @Post('pass-reset-email/:email')
  @ApiOperation({ summary: 'Send password reset email' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset email sent',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async passResetEmail(@Param('email') email: string, @Res() res: Response) {
    await this.authService.sentPassResetEmail(email);
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: 'Password reset email sent',
    });
  }

  @Post('support-desk')
  @ApiOperation({ summary: 'Create support user' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.POWER_USER)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Support user created successfully',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async createSupportUser(
    @Res() res: Response,
    @Body() registerSupportUserDto: RegisterSupportUserDto,
  ) {
    const result = await this.authService.createSupportUser(
      registerSupportUserDto,
    );
    return res.status(HttpStatus.CREATED).json({
      statusCode: HttpStatus.CREATED,
      message: 'Support user created successfully',
      data: result,
    });
  }
}
