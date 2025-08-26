import nodemailer from 'nodemailer';
import { db } from '../db';
import { emailCampaigns, emailLogs, users, notifications } from '../../shared/schema';
import { eq, sql, and, inArray } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  trackingId?: string;
}

export interface CampaignOptions {
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  templateType?: string;
  targetAudience?: 'all' | 'specific' | 'admins';
  targetUserIds?: string[];
  scheduledAt?: Date;
  createdBy: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured: boolean = false;
  private gmailUser: string | undefined;
  private gmailPass: string | undefined;
  private fromEmail: string | undefined;

  constructor() {
    this.gmailUser = process.env.GMAIL_USER;
    this.gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASS;
    this.fromEmail = this.gmailUser ? `"${process.env.APP_NAME || 'ImageVault'}" <${this.gmailUser}>` : undefined;
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
      secure: false,
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
      const trackingPixel = options.trackingId ?
        `<img src="${process.env.BASE_URL || 'http://localhost:5000'}/api/v1/email/track/open/${options.trackingId}" width="1" height="1" style="display:none;">` : '';

      const mailOptions = {
        from: this.fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html + trackingPixel,
        text: options.text,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);

      // Log successful send
      if (options.trackingId) {
        await this.logEmailStatus(options.trackingId, options.to, 'sent');
      }

      return true;
    } catch (error) {
      console.error('Email sending failed:', error);

      // Log failed send
      if (options.trackingId) {
        await this.logEmailStatus(options.trackingId, options.to, 'failed', (error as Error).message);
      }

      this.isConfigured = false;
      this.transporter = null;
      this.setupTransporter();
      return false;
    }
  }

  private async logEmailStatus(trackingId: string, email: string, status: string, errorMessage?: string) {
    try {
      await db.update(emailLogs)
        .set({
          status,
          errorMessage,
          sentAt: status === 'sent' ? new Date() : undefined,
          openedAt: status === 'opened' ? new Date() : undefined,
          clickedAt: status === 'clicked' ? new Date() : undefined
        })
        .where(eq(emailLogs.id, trackingId));
    } catch (error) {
      console.error('Failed to log email status:', error);
    }
  }

  async createEmailCampaign(options: CampaignOptions): Promise<string> {
    try {
      const [campaign] = await db.insert(emailCampaigns).values({
        id: uuidv4(),
        name: options.name,
        subject: options.subject,
        htmlContent: options.htmlContent,
        textContent: options.textContent,
        templateType: options.templateType || 'marketing',
        targetAudience: options.targetAudience || 'all',
        targetUserIds: options.targetUserIds ? JSON.stringify(options.targetUserIds) : null,
        scheduledAt: options.scheduledAt,
        createdBy: options.createdBy,
        status: options.scheduledAt ? 'scheduled' : 'draft'
      }).returning();

      return campaign.id;
    } catch (error) {
      console.error('Failed to create email campaign:', error);
      throw error;
    }
  }

  async sendCampaign(campaignId: string): Promise<boolean> {
    try {
      const [campaign] = await db.select()
        .from(emailCampaigns)
        .where(eq(emailCampaigns.id, campaignId));

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Get target users
      let targetUsers: any[] = [];

      if (campaign.targetAudience === 'all') {
        targetUsers = await db.select({ id: users.id, email: users.email })
          .from(users)
          .where(eq(users.emailVerified, true));
      } else if (campaign.targetAudience === 'admins') {
        targetUsers = await db.select({ id: users.id, email: users.email })
          .from(users)
          .where(and(eq(users.isAdmin, true), eq(users.emailVerified, true)));
      } else if (campaign.targetAudience === 'specific' && campaign.targetUserIds) {
        const userIds = JSON.parse(campaign.targetUserIds as string);
        targetUsers = await db.select({ id: users.id, email: users.email })
          .from(users)
          .where(and(inArray(users.id, userIds), eq(users.emailVerified, true)));
      }

      // Update campaign status
      await db.update(emailCampaigns)
        .set({ status: 'sending', sentAt: new Date() })
        .where(eq(emailCampaigns.id, campaignId));

      let sentCount = 0;

      // Send emails to each user
      for (const user of targetUsers) {
        try {
          // Create email log entry
          const [emailLog] = await db.insert(emailLogs).values({
            id: uuidv4(),
            campaignId,
            userId: user.id,
            email: user.email,
            status: 'pending'
          }).returning();

          // Send email with tracking
          const success = await this.sendEmail({
            to: user.email,
            subject: campaign.subject,
            html: campaign.htmlContent,
            text: campaign.textContent || undefined,
            trackingId: emailLog.id
          });

          if (success) {
            sentCount++;
          }
        } catch (error) {
          console.error(`Failed to send email to ${user.email}:`, error);
        }
      }

      // Update final campaign status
      await db.update(emailCampaigns)
        .set({
          status: sentCount > 0 ? 'sent' : 'failed',
          sentCount
        })
        .where(eq(emailCampaigns.id, campaignId));

      return sentCount > 0;
    } catch (error) {
      console.error('Campaign send failed:', error);

      // Update campaign status to failed
      await db.update(emailCampaigns)
        .set({ status: 'failed' })
        .where(eq(emailCampaigns.id, campaignId));

      return false;
    }
  }

  async sendNotificationEmail(userId: string, title: string, message: string, actionUrl?: string): Promise<boolean> {
    try {
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, userId));

      if (!user || !user.emailVerified) {
        return false;
      }

      const html = this.generateNotificationEmailTemplate(title, message, user.email, actionUrl);

      return await this.sendEmail({
        to: user.email,
        subject: `ImageVault - ${title}`,
        html,
        text: `${title}\n\n${message}${actionUrl ? `\n\nView: ${actionUrl}` : ''}`
      });
    } catch (error) {
      console.error('Failed to send notification email:', error);
      return false;
    }
  }

  private generateNotificationEmailTemplate(title: string, message: string, userEmail: string, actionUrl?: string): string {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - ImageVault</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #3b82f6, #10b981); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">ImageVault</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Notification</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px; background: #ffffff;">
            <h2 style="color: #1f2937; margin-bottom: 20px; font-size: 24px;">${title}</h2>
            <p style="color: #4b5563; line-height: 1.6; font-size: 16px; margin-bottom: 30px;">
              ${message}
            </p>

            ${actionUrl ? `
            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${actionUrl}"
                 style="background: #3b82f6; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                View Details
              </a>
            </div>
            ` : ''}
          </div>

          <!-- Footer -->
          <div style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
              This notification was sent to ${userEmail}. You can manage your notification preferences in your account settings.
            </p>
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              ImageVault - Professional Image Hosting & API Platform
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendVerificationEmail(email: string, token: string): Promise<boolean> {
    try {
      const verificationUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/auth/verify-email?token=${token}`;

      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email - ImageVault</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 40px 30px; text-align: center;">
              <div style="background: rgba(255, 255, 255, 0.15); width: 60px; height: 60px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                <span style="color: white; font-weight: bold; font-size: 24px;">IV</span>
              </div>
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.025em;">
                Verify Your Email
              </h1>
              <p style="color: rgba(255,255,255,0.9); margin: 12px 0 0 0; font-size: 16px;">
                Complete your ImageVault registration
              </p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px; background: #ffffff;">
              <h2 style="color: #1f2937; margin-bottom: 20px; font-size: 24px; font-weight: 600;">
                Welcome to ImageVault! 🎉
              </h2>
              
              <p style="color: #4b5563; line-height: 1.6; font-size: 16px; margin-bottom: 30px;">
                Thank you for joining ImageVault, the professional image hosting and API platform. To complete your registration and start uploading images, please verify your email address.
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="${verificationUrl}"
                   style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4); transition: all 0.2s;">
                  Verify Email Address
                </a>
              </div>

              <!-- Alternative Link -->
              <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <h3 style="color: #1e293b; margin-bottom: 12px; font-size: 16px; font-weight: 600;">
                  Can't click the button?
                </h3>
                <p style="color: #64748b; font-size: 14px; margin-bottom: 12px;">
                  Copy and paste this link into your browser:
                </p>
                <p style="color: #3b82f6; word-break: break-all; font-size: 14px; font-family: monospace; background: white; padding: 12px; border-radius: 4px; border: 1px solid #e2e8f0;">
                  ${verificationUrl}
                </p>
              </div>

              <!-- Features Preview -->
              <div style="margin: 30px 0;">
                <h3 style="color: #1e293b; margin-bottom: 20px; font-size: 18px; font-weight: 600;">
                  What's waiting for you:
                </h3>
                <div style="display: flex; flex-wrap: wrap; gap: 16px;">
                  <div style="flex: 1; min-width: 200px; padding: 16px; background: #f8fafc; border-radius: 6px; border-left: 4px solid #3b82f6;">
                    <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px;">🚀 Fast Upload</div>
                    <div style="color: #64748b; font-size: 14px;">Drag & drop image uploads with instant processing</div>
                  </div>
                  <div style="flex: 1; min-width: 200px; padding: 16px; background: #f8fafc; border-radius: 6px; border-left: 4px solid #10b981;">
                    <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px;">🔧 Powerful API</div>
                    <div style="color: #64748b; font-size: 14px;">REST API for seamless integration with your apps</div>
                  </div>
                  <div style="flex: 1; min-width: 200px; padding: 16px; background: #f8fafc; border-radius: 6px; border-left: 4px solid #f59e0b;">
                    <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px;">⚡ CDN Delivery</div>
                    <div style="color: #64748b; font-size: 14px;">Lightning-fast global content delivery</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px; margin: 0 0 12px 0;">
                This verification link will expire in 24 hours for security.
              </p>
              <p style="color: #64748b; font-size: 14px; margin: 0 0 12px 0;">
                If you didn't create an account with ImageVault, you can safely ignore this email.
              </p>
              <p style="color: #64748b; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} ImageVault - Professional Image Hosting & API Platform
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: this.fromEmail,
        to: email,
        subject: '🔐 Verify Your ImageVault Account',
        html,
        text: `Welcome to ImageVault! Please verify your email address by visiting: ${verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, you can safely ignore this email.`
      };

      if (this.transporter) {
        await this.transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully to:', email);
      } else {
        console.log('Email transporter not configured, would send verification email to:', email);
      }
      return true;
    } catch (error) {
      console.error('Failed to send verification email:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
    try {
      const resetUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/auth/reset-password?token=${token}`;

      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password - ImageVault</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #dc2626, #991b1b); padding: 40px 30px; text-align: center;">
              <div style="background: rgba(255, 255, 255, 0.15); width: 60px; height: 60px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                <span style="color: white; font-weight: bold; font-size: 24px;">🔐</span>
              </div>
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">
                Password Reset
              </h1>
              <p style="color: rgba(255,255,255,0.9); margin: 12px 0 0 0; font-size: 16px;">
                Secure your ImageVault account
              </p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px; background: #ffffff;">
              <h2 style="color: #1f2937; margin-bottom: 20px; font-size: 24px; font-weight: 600;">
                Reset Your Password
              </h2>
              
              <p style="color: #4b5563; line-height: 1.6; font-size: 16px; margin-bottom: 30px;">
                We received a request to reset the password for your ImageVault account. Click the button below to create a new password.
              </p>

              <!-- Security Notice -->
              <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <div style="display: flex; align-items: center;">
                  <span style="font-size: 20px; margin-right: 12px;">⚠️</span>
                  <div>
                    <div style="font-weight: 600; color: #92400e; margin-bottom: 4px;">Security Notice</div>
                    <div style="color: #92400e; font-size: 14px;">This link will expire in 1 hour for your security.</div>
                  </div>
                </div>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="${resetUrl}"
                   style="background: linear-gradient(135deg, #dc2626, #991b1b); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(220, 38, 38, 0.4);">
                  Reset Password
                </a>
              </div>

              <!-- Alternative Link -->
              <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <h3 style="color: #1e293b; margin-bottom: 12px; font-size: 16px; font-weight: 600;">
                  Can't click the button?
                </h3>
                <p style="color: #64748b; font-size: 14px; margin-bottom: 12px;">
                  Copy and paste this link into your browser:
                </p>
                <p style="color: #dc2626; word-break: break-all; font-size: 14px; font-family: monospace; background: white; padding: 12px; border-radius: 4px; border: 1px solid #e2e8f0;">
                  ${resetUrl}
                </p>
              </div>

              <!-- Didn't Request -->
              <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 30px 0; border-left: 4px solid #3b82f6;">
                <h3 style="color: #1e293b; margin-bottom: 12px; font-size: 16px; font-weight: 600;">
                  Didn't request this?
                </h3>
                <p style="color: #64748b; font-size: 14px; margin: 0;">
                  If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged, and no action is required.
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px; margin: 0 0 12px 0;">
                For security reasons, this link will expire in 1 hour.
              </p>
              <p style="color: #64748b; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} ImageVault - Professional Image Hosting & API Platform
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: this.fromEmail,
        to: email,
        subject: '🔐 Reset Your ImageVault Password',
        html,
        text: `Password Reset Request\n\nYou requested a password reset for your ImageVault account. Visit this link to reset your password: ${resetUrl}\n\nThis link will expire in 1 hour for security reasons.\n\nIf you didn't request this reset, you can safely ignore this email.`
      };

      if (this.transporter) {
        await this.transporter.sendMail(mailOptions);
        console.log('Password reset email sent successfully to:', email);
      } else {
        console.log('Email transporter not configured, would send password reset email to:', email);
      }
      return true;
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return false;
    }
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