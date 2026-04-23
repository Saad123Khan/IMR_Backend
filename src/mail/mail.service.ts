import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('MAIL_HOST'),
      port: this.config.get<number>('MAIL_PORT', 587),
      secure: this.config.get<string>('MAIL_SECURE') === 'true',
      auth: {
        user: this.config.get<string>('MAIL_USER'),
        pass: this.config.get<string>('MAIL_PASS'),
      },
    });
  }

  async sendPasswordResetEmail(toEmail: string, userName: string, resetUrl: string): Promise<void> {
    const fromName = this.config.get<string>('MAIL_FROM_NAME', 'IMR Support');
    const fromAddress = this.config.get<string>('MAIL_FROM_ADDRESS');

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset Your Password</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background-color: #1a56db; padding: 32px 40px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 24px; }
    .body { padding: 40px; }
    .body p { color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px; }
    .button-wrap { text-align: center; margin: 32px 0; }
    .button { display: inline-block; background-color: #1a56db; color: #ffffff !important; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-size: 16px; font-weight: bold; }
    .note { font-size: 13px !important; color: #6b7280 !important; }
    .footer { background-color: #f9fafb; padding: 24px 40px; text-align: center; }
    .footer p { margin: 0; color: #9ca3af; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Reset Request</h1>
    </div>
    <div class="body">
      <p>Hi ${userName},</p>
      <p>We received a request to reset the password for your account. Click the button below to set a new password.</p>
      <div class="button-wrap">
        <a href="${resetUrl}" class="button">Reset My Password</a>
      </div>
      <p>This link will expire in <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email — your password will remain unchanged.</p>
      <p class="note">If the button doesn't work, copy and paste this URL into your browser:<br/>${resetUrl}</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} IMR. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

    try {
      await this.transporter.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to: toEmail,
        subject: 'Reset Your Password',
        html,
      });
      this.logger.log(`Password reset email sent to ${toEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${toEmail}`, error);
      throw error;
    }
  }
}
