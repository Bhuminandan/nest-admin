import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  UseGuards,
  Req,
  Get,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../../../application/dto/login.dto';
import { RegisterUserDto } from '../../../application/dto/register.dto';
import { RequestPasswordResetDto } from '../../../application/dto/request-password-reset.dto';
import { ResetPasswordDto } from '../../../application/dto/reset-password.dto';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../../../core/enums/user-role.enum';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

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
    return res.status(HttpStatus.OK).json(result);
  }

  @Post('register')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN) // Only admins can register users
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Register new user (Admin only)' })
  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async register(
    @Body() registerUserDto: RegisterUserDto,
    @Res() res: Response,
  ) {
    const result = await this.authService.registerUser(registerUserDto);
    return res.status(HttpStatus.CREATED).json(result);
  }

  @Post('request-password-reset')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiBody({ type: RequestPasswordResetDto })
  @ApiResponse({
    status: 200,
    description: 'Reset email sent if account exists',
  })
  async requestPasswordReset(
    @Body() requestPasswordResetDto: RequestPasswordResetDto,
    @Res() res: Response,
  ) {
    await this.authService.requestPasswordReset(requestPasswordResetDto.email);
    return res.status(HttpStatus.OK).json({
      message: 'If an account exists, a password reset email has been sent',
    });
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
    return res
      .status(HttpStatus.OK)
      .json({ message: 'Password reset successful' });
  }

  @Post('validate-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Validate JWT token' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async validateToken(@Res() res: Response) {
    return res.status(HttpStatus.OK).json({ valid: true });
  }
}
