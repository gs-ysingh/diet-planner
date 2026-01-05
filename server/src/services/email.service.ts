import nodemailer from 'nodemailer';

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private fromEmail: string;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@dietplanner.com';

    // Only create transporter in production
    if (!this.isDevelopment) {
      // Production: Use real email service (e.g., SendGrid, AWS SES, etc.)
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      console.log('📧 Email service initialized in production mode');
    } else {
      console.log('📧 Email service initialized in development mode');
      console.log('   Emails will be logged to console (not actually sent)');
    }
  }

  async sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

    const mailOptions = {
      from: this.fromEmail,
      to: email,
      subject: 'Verify Your Email - Diet Planner',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Diet Planner! 🎉</h1>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>Thank you for registering with Diet Planner! We're excited to help you on your health journey.</p>
              <p>Please verify your email address by clicking the button below:</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
              <p>This link will expire in 24 hours for security reasons.</p>
              <p>If you didn't create an account with Diet Planner, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Diet Planner. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to Diet Planner!
        
        Hi ${name},
        
        Thank you for registering with Diet Planner! We're excited to help you on your health journey.
        
        Please verify your email address by visiting: ${verificationUrl}
        
        This link will expire in 24 hours for security reasons.
        
        If you didn't create an account with Diet Planner, please ignore this email.
      `,
    };

    try {
      if (this.isDevelopment) {
        // Development mode: Just log to console
        console.log('\n📧 ═══════════════════════════════════════════════════════════');
        console.log('📧 VERIFICATION EMAIL (Development Mode - Not Actually Sent)');
        console.log('📧 ═══════════════════════════════════════════════════════════');
        console.log('   To:', email);
        console.log('   Subject:', mailOptions.subject);
        console.log('   Verification URL:', verificationUrl);
        console.log('📧 ═══════════════════════════════════════════════════════════\n');
      } else {
        // Production mode: Actually send the email
        await this.transporter!.sendMail(mailOptions);
        console.log('📧 Verification email sent to:', email);
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendPasswordResetEmail(email: string, name: string, token: string): Promise<void> {
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    const mailOptions = {
      from: this.fromEmail,
      to: email,
      subject: 'Reset Your Password - Diet Planner',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request 🔐</h1>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>We received a request to reset your password for your Diet Planner account.</p>
              <p>Click the button below to reset your password:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul style="margin: 10px 0;">
                  <li>This link will expire in 1 hour</li>
                  <li>If you didn't request this, please ignore this email</li>
                  <li>Your password won't change until you create a new one</li>
                </ul>
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Diet Planner. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Password Reset Request
        
        Hi ${name},
        
        We received a request to reset your password for your Diet Planner account.
        
        Click the link below to reset your password: ${resetUrl}
        
        Security Notice:
        - This link will expire in 1 hour
        - If you didn't request this, please ignore this email
        - Your password won't change until you create a new one
      `,
    };

    try {
      if (this.isDevelopment) {
        // Development mode: Just log to console
        console.log('\n📧 ═══════════════════════════════════════════════════════════');
        console.log('📧 PASSWORD RESET EMAIL (Development Mode - Not Actually Sent)');
        console.log('📧 ═══════════════════════════════════════════════════════════');
        console.log('   To:', email);
        console.log('   Subject:', mailOptions.subject);
        console.log('   Reset URL:', resetUrl);
        console.log('   Expires in: 1 hour');
        console.log('📧 ═══════════════════════════════════════════════════════════\n');
      } else {
        // Production mode: Actually send the email
        await this.transporter!.sendMail(mailOptions);
        console.log('📧 Password reset email sent to:', email);
      }
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  async sendPasswordChangedConfirmation(email: string, name: string): Promise<void> {
    const mailOptions = {
      from: this.fromEmail,
      to: email,
      subject: 'Password Changed Successfully - Diet Planner',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .success { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Changed ✓</h1>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <div class="success">
                <p><strong>Your password has been successfully changed.</strong></p>
              </div>
              <p>If you made this change, no further action is needed.</p>
              <p>If you didn't change your password, please contact our support team immediately.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Diet Planner. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Password Changed Successfully
        
        Hi ${name},
        
        Your password has been successfully changed.
        
        If you made this change, no further action is needed.
        
        If you didn't change your password, please contact our support team immediately.
      `,
    };

    try {
      if (this.isDevelopment) {
        // Development mode: Just log to console
        console.log('\n📧 ═══════════════════════════════════════════════════════════');
        console.log('📧 PASSWORD CHANGED CONFIRMATION (Development Mode)');
        console.log('📧 ═══════════════════════════════════════════════════════════');
        console.log('   To:', email);
        console.log('   Subject:', mailOptions.subject);
        console.log('   Message: Password successfully changed');
        console.log('📧 ═══════════════════════════════════════════════════════════\n');
      } else {
        // Production mode: Actually send the email
        await this.transporter!.sendMail(mailOptions);
        console.log('📧 Password changed confirmation sent to:', email);
      }
    } catch (error) {
      console.error('Error sending password changed confirmation:', error);
      // Don't throw error here as password was already changed
    }
  }
}

export const emailService = new EmailService();
