import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured: boolean = false;
  private gmailUser: string | undefined;
  private gmailPass: string | undefined;

  constructor() {
    this.gmailUser = process.env.GMAIL_USER;
    this.gmailPass = process.env.GMAIL_APP_PASSWORD;
    this.setupTransporter();
  }

  private setupTransporter() {
    if (!this.gmailUser || !this.gmailPass) {
      console.warn('Gmail credentials not configured. Email functionality will be disabled.');
      this.isConfigured = false;
      return;
    }

    this.createTransporter()
      .then(transporter => {
        if (transporter) {
          this.transporter = transporter;
          this.isConfigured = true;
          console.log('Email service configured successfully');
        } else {
          console.error('Failed to configure email transporter.');
          this.isConfigured = false;
        }
      })
      .catch(error => {
        console.error('Error during email transporter setup:', error);
        this.isConfigured = false;
      });
  }

  private async createTransporter() {
    if (!this.gmailUser || !this.gmailPass) {
      console.error('Gmail credentials not configured');
      return null;
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.gmailUser,
        pass: this.gmailPass,
      },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000,
    });

    try {
      // Don't verify connection during startup to avoid blocking
      console.log('Email service initialized (verification skipped for faster startup)');
      return transporter;
    } catch (error) {
      console.error('Email configuration error:', error);
      return null;
    }
  }


  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      console.warn('Email service not configured or transporter not available, skipping email send');
      return false;
    }

    try {
      const mailOptions = {
        from: `"ImageVault" <${this.gmailUser}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      // If sending fails, try to re-configure transporter for next time
      this.isConfigured = false;
      this.transporter = null;
      this.setupTransporter(); // Attempt to re-setup
      return false;
    }
  }

  async sendVerificationEmail(email: string, token: string): Promise<boolean> {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const verificationUrl = `${baseUrl}/auth/verify-email?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - ImageVault</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #3b82f6, #10b981); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">ImageVault</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your Image Storage & API Platform</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px; background: #ffffff;">
            <h2 style="color: #1f2937; margin-bottom: 20px; font-size: 24px;">Verify Your Email Address</h2>
            <p style="color: #4b5563; line-height: 1.6; font-size: 16px; margin-bottom: 20px;">
              Welcome to ImageVault! We're excited to have you on board. To get started and secure your account, please verify your email address by clicking the button below.
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${verificationUrl}" 
                 style="background: #3b82f6; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; transition: background-color 0.3s;">
                Verify Email Address
              </a>
            </div>

            <!-- Features Preview -->
            <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <h3 style="color: #1f2937; margin-bottom: 15px; font-size: 18px;">What you can do with ImageVault:</h3>
              <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Upload and store images securely</li>
                <li style="margin-bottom: 8px;">Generate API keys for integration</li>
                <li style="margin-bottom: 8px;">Transform images on-the-fly</li>
                <li style="margin-bottom: 8px;">Use custom domains for branding</li>
              </ul>
            </div>

            <!-- Alternative Link -->
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="color: #3b82f6; font-size: 14px; word-break: break-all;">
              ${verificationUrl}
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
              If you didn't create an account with ImageVault, you can safely ignore this email.
            </p>
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              This verification link will expire in 24 hours for security reasons.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textVersion = `
Welcome to ImageVault!

Please verify your email address by visiting: ${verificationUrl}

What you can do with ImageVault:
- Upload and store images securely  
- Generate API keys for integration
- Transform images on-the-fly
- Use custom domains for branding

If you didn't create an account with ImageVault, you can safely ignore this email.
This verification link will expire in 24 hours.

ImageVault Team
    `;

    return this.sendEmail({
      to: email,
      subject: 'Verify your ImageVault account 🚀',
      html,
      text: textVersion,
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - ImageVault</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #dc2626, #ea580c); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">ImageVault</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Password Reset Request</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px; background: #ffffff;">
            <h2 style="color: #1f2937; margin-bottom: 20px; font-size: 24px;">Reset Your Password</h2>
            <p style="color: #4b5563; line-height: 1.6; font-size: 16px; margin-bottom: 20px;">
              We received a request to reset your password for your ImageVault account. If you made this request, click the button below to create a new password.
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${resetUrl}" 
                 style="background: #dc2626; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                Reset Password
              </a>
            </div>

            <!-- Security Notice -->
            <div style="background: #fef3cd; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <h3 style="color: #92400e; margin-bottom: 10px; font-size: 16px;">Security Notice</h3>
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                For your security, this reset link will expire in 1 hour. If you didn't request this password reset, please ignore this email and your password will remain unchanged.
              </p>
            </div>

            <!-- Alternative Link -->
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="color: #dc2626; font-size: 14px; word-break: break-all;">
              ${resetUrl}
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
              If you're having trouble with your account, please contact our support team.
            </p>
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              ImageVault - Secure Image Storage & API Platform
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textVersion = `
Password Reset Request - ImageVault

We received a request to reset your password for your ImageVault account.

Reset your password by visiting: ${resetUrl}

Security Notice:
- This reset link will expire in 1 hour
- If you didn't request this reset, please ignore this email
- Your password will remain unchanged if you don't use this link

ImageVault Team
    `;

    return this.sendEmail({
      to: email,
      subject: 'Reset your ImageVault password 🔐',
      html,
      text: textVersion,
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const dashboardUrl = `${baseUrl}/dashboard`;

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ImageVault</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #10b981, #3b82f6); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Welcome to ImageVault!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">You're all set up and ready to go</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px; background: #ffffff;">
            <h2 style="color: #1f2937; margin-bottom: 20px; font-size: 24px;">Hi ${name}! 👋</h2>
            <p style="color: #4b5563; line-height: 1.6; font-size: 16px; margin-bottom: 30px;">
              Welcome to ImageVault! Your account has been verified and you're ready to start uploading, storing, and serving images with our powerful API platform.
            </p>

            <!-- Getting Started Steps -->
            <div style="background: #f0f9ff; border-radius: 8px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #0369a1; margin-bottom: 20px; font-size: 18px;">🚀 Getting Started</h3>
              <ol style="color: #4b5563; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 12px;"><strong>Upload your first image</strong> - Try our drag & drop interface</li>
                <li style="margin-bottom: 12px;"><strong>Generate API keys</strong> - Integrate with your applications</li>
                <li style="margin-bottom: 12px;"><strong>Explore transformations</strong> - Resize, crop, and optimize images</li>
                <li style="margin-bottom: 0;"><strong>Set up custom domains</strong> - Brand your image URLs</li>
              </ol>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${dashboardUrl}" 
                 style="background: #3b82f6; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                Go to Dashboard
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
              Need help getting started? Check out our documentation or contact support.
            </p>
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Happy uploading! - The ImageVault Team
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Welcome to ImageVault! 🎉',
      html,
      text: `Welcome to ImageVault, ${name}! Your account is ready. Visit ${dashboardUrl} to get started.`,
    });
  }
}

export const emailService = new EmailService();