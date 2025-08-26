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
    this.gmailPass = process.env.GMAIL_APP_PASSWORD;
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

      const mailOptions = {
        from: this.fromEmail,
        to: email,
        subject: 'Verify Your Email Address',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Verify Your Email Address</h2>
            <p>Thank you for signing up! Please click the link below to verify your email address:</p>
            <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">Verify Email</a>
            <p>If you didn't create an account, you can safely ignore this email.</p>
            <p>This link will expire in 24 hours.</p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Verification email sent successfully to:', email);
      return true;
    } catch (error) {
      console.error('Failed to send verification email:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
    try {
      const resetUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/auth/reset-password?token=${token}`;

      const mailOptions = {
        from: this.fromEmail,
        to: email,
        subject: 'Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>You requested a password reset. Click the link below to reset your password:</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 4px;">Reset Password</a>
            <p>If you didn't request this reset, you can safely ignore this email.</p>
            <p>This link will expire in 1 hour for security reasons.</p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent successfully to:', email);
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