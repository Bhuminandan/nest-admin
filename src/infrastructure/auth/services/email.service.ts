import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { IEmailService } from '@core/interfaces/email-service.interface';

@Injectable()
export class EmailService implements IEmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendWelcomeEmail(email: string, token: string): Promise<void> {
    const resetLink = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`;

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Welcome to Our Platform, ${email}!</h2>
        <p>Your account has been successfully created.</p>
        <p><strong>Temporary Password:</strong> ${token}</p>
        <p>Please reset your password using the button below:</p>
        <p>
          <a href="${resetLink}" style="background-color: #007BFF; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
        </p>
        <p>If the button doesn't work, copy and paste this URL into your browser:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <hr />
        <p>If you have any questions, contact us at <a href="mailto:support@yourdomain.com">support@yourdomain.com</a></p>
        <p>– The Our Platform Team</p>
      </div>
    `;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to Our Platform!',
      html: htmlBody,
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetLink = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`;

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Password Reset Request</h2>
        <p>Hello, ${email}</p>
        <p>We received a request to reset your password.</p>
        <p>You can reset your password using the button below. This link will expire in <strong>1 hour</strong>.</p>
        <p>
          <a href="${resetLink}" style="background-color: #dc3545; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
            Reset Your Password
          </a>
        </p>
        <p>If the button doesn't work, copy and paste this URL into your browser:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <hr />
        <p>If you did not request a password reset, you can safely ignore this email.</p>
        <p>Need help? Contact us at <a href="mailto:support@yourdomain.com">support@yourdomain.com</a></p>
        <p>– The Our Platform Team</p>
      </div>
    `;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset Request',
      html: htmlBody,
    });
  }
}
