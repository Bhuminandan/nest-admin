// src/infrastructure/auth/services/email.service.ts
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendWelcomeEmail(email: string, tempPassword: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to Our Platform',
      template: './welcome',
      context: {
        email,
        tempPassword,
        resetLink: `${process.env.FRONTEND_URL}/reset-password?token=${tempPassword}`,
      },
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset Request',
      template: './password-reset',
      context: {
        resetLink: `${process.env.FRONTEND_URL}/reset-password?token=${token}`,
        expiryHours: 1,
      },
    });
  }
}
