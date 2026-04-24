import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: Transporter | null = null;
  private readonly logger = new Logger(MailService.name);

  constructor(private config: ConfigService) {}

  private async ensureTransporter(): Promise<void> {
    if (this.transporter) return;

    const host = this.config.get<string>('MAIL_HOST');
    const user = this.config.get<string>('MAIL_USER');
    const pass = this.config.get<string>('MAIL_PASS');
    const port = Number(this.config.get<number>('MAIL_PORT') || 587);
    const secure = this.config.get<string>('MAIL_SECURE') === 'true';

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
      });
      this.logger.log('SMTP transporter configured from environment');
      return;
    }

    // Fallback: create an Ethereal test account so emails can be inspected in development
    this.logger.warn('MAIL_* env vars not fully configured — falling back to Ethereal test account');
    const testAccount = await nodemailer.createTestAccount();
    this.transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    this.logger.log(`Ethereal account created: ${testAccount.user}`);
  }

  async sendPasswordResetEmail(toEmail: string, userName: string, resetUrl: string): Promise<void> {
    const fromName = this.config.get<string>('MAIL_FROM_NAME', 'IMR Support');
    const fromAddress = this.config.get<string>('MAIL_FROM_ADDRESS') || this.config.get<string>('MAIL_USER') || `no-reply@${this.config.get<string>('FRONTEND_URL')?.replace(/^https?:\/\//, '') || 'example.com'}`;

  const currentYear = new Date().getFullYear();

const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset Your Password</title>
</head>

<body style="margin:0; padding:0; background-color:#f3f4f6; font-family:Arial, Helvetica, sans-serif;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0;">
    Reset your IMR account password. This link will expire in 1 hour.
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6; padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:#ffffff; border-radius:14px; overflow:hidden; box-shadow:0 8px 24px rgba(0,0,0,0.08);">
          
          <tr>
            <td style="background:linear-gradient(135deg, #0b5ed7, #084298); padding:32px;">
              <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:700;">
                Reset Your Password
              </h1>
              <p style="margin:10px 0 0; color:#dbeafe; font-size:14px;">
                Secure password reset request for your IMR account
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 18px; color:#111827; font-size:16px; line-height:1.6;">
                Hi ${userName || 'there'},
              </p>

              <p style="margin:0 0 18px; color:#374151; font-size:16px; line-height:1.6;">
                We received a request to reset the password for your account. Click the button below to create a new password.
              </p>

              <div style="text-align:center; margin:32px 0;">
                <a 
                  href="${resetUrl}" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style="display:inline-block; background-color:#0b5ed7; color:#ffffff; text-decoration:none; padding:14px 30px; border-radius:8px; font-size:16px; font-weight:700;"
                >
                  Reset Password
                </a>
              </div>

              <div style="background-color:#f9fafb; border:1px solid #e5e7eb; border-radius:10px; padding:16px; margin:24px 0;">
                <p style="margin:0; color:#374151; font-size:14px; line-height:1.6;">
                  This link will expire in <strong>1 hour</strong>. If you did not request this password reset, you can safely ignore this email.
                </p>
              </div>

              
            </td>
          </tr>

          <tr>
            <td style="background-color:#f9fafb; padding:20px 32px; text-align:center; border-top:1px solid #e5e7eb;">
              <p style="margin:0 0 6px; color:#6b7280; font-size:13px;">
                Need help? Contact IMR Support.
              </p>
              <p style="margin:0; color:#9ca3af; font-size:12px;">
                &copy; ${currentYear} IMR. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

    const text = `Hi ${userName || 'there'},

We received a request to reset the password for your account. Use the link below to set a new password (this link expires in 1 hour):

${resetUrl}

If you did not request a password reset, you can safely ignore this email.

— IMR Support`;

    await this.ensureTransporter();

    try {
      const info = await this.transporter!.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to: toEmail,
        subject: 'Reset Your Password',
        text,
        html,
      });

      this.logger.log(`Password reset email sent to ${toEmail}`);
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) {
        this.logger.log(`Preview URL: ${preview}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${toEmail}`, error);
      throw error;
    }
  }
}
