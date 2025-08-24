import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, desc, and, like, sql, count } from "drizzle-orm";
import { users, images, apiKeys, customDomains, imageAnalytics, systemLogs, notifications } from "@shared/schema"; // Assuming 'notifications' is added to schema
import crypto from "crypto";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const client = neon(connectionString);
const db = drizzle(client);

export interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string | null;
  emailVerified: boolean;
  profileImageUrl?: string | null;
  plan?: string;
  storageUsed?: number;
  storageLimit?: number;
}

export interface CreateImageData {
  title: string;
  description: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
  isPublic: boolean;
  tags: string[];
  backblazeFileId: string;
  backblazeFileName: string;
  cdnUrl: string | undefined;
  folder?: string;
}

export interface CreateApiKeyData {
  name: string;
}

export interface CreateCustomDomainData {
  domain: string;
  verificationToken: string;
  cnameTarget: string;
}

class Storage {
  // User management
  async createUser(userData: CreateUserData) {
    const [user] = await db.insert(users).values({
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      passwordHash: userData.passwordHash,
      emailVerified: userData.emailVerified,
      profileImageUrl: userData.profileImageUrl,
      plan: userData.plan || 'free',
      storageUsed: userData.storageUsed || 0,
      storageLimit: userData.storageLimit || 1024 * 1024 * 1024, // 1GB
    }).returning();

    console.log(`User created: ${user.email}`);
    return user;
  }

  async getUserByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUser(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async updateUserStorageUsage(userId: string, newUsage: number) {
    await db.update(users)
      .set({ storageUsed: newUsage, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async updateUserPassword(userId: string, passwordHash: string) {
    await db.update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async markEmailAsVerified(userId: string) {
    await db.update(users)
      .set({ emailVerified: true, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  // Email verification tokens
  async createEmailVerificationToken(userId: string, token: string) {
    // Store token in a simple table or use a temporary storage
    // For now, we'll use system logs as a temporary storage
    await db.insert(systemLogs).values({
      level: 'info',
      message: 'email_verification_token',
      userId,
      metadata: { token, expires: Date.now() + 24 * 60 * 60 * 1000 } // 24 hours
    });
  }

  async verifyEmailToken(token: string) {
    const [log] = await db.select()
      .from(systemLogs)
      .where(and(
        eq(systemLogs.message, 'email_verification_token'),
        sql`metadata->>'token' = ${token}`
      ));

    if (!log || !log.metadata) return null;

    const metadata = log.metadata as any;
    if (Date.now() > metadata.expires) {
      await this.deleteEmailVerificationToken(token);
      return null;
    }

    return { id: log.userId };
  }

  async deleteEmailVerificationToken(token: string) {
    await db.delete(systemLogs).where(and(
      eq(systemLogs.message, 'email_verification_token'),
      sql`metadata->>'token' = ${token}`
    ));
  }

  // Password reset tokens
  async createPasswordResetToken(userId: string, token: string) {
    await db.insert(systemLogs).values({
      level: 'info',
      message: 'password_reset_token',
      userId,
      metadata: { token, expires: Date.now() + 60 * 60 * 1000 } // 1 hour
    });
  }

  async verifyPasswordResetToken(token: string) {
    const [log] = await db.select()
      .from(systemLogs)
      .where(and(
        eq(systemLogs.message, 'password_reset_token'),
        sql`metadata->>'token' = ${token}`
      ));

    if (!log || !log.metadata) return null;

    const metadata = log.metadata as any;
    if (Date.now() > metadata.expires) {
      await this.deletePasswordResetToken(token);
      return null;
    }

    return { id: log.userId };
  }

  async deletePasswordResetToken(token: string): Promise<void> {
    await db.delete(systemLogs).where(and(
      eq(systemLogs.message, 'password_reset_token'),
      sql`metadata->>'token' = ${token}`
    ));
  }

  // Notification methods
  async createNotification(data: {
    title: string;
    message: string;
    type: string;
    isActive: boolean;
    createdBy: string;
  }) {
    const [notification] = await db.insert(notifications).values({
      id: crypto.randomUUID(),
      title: data.title,
      message: data.message,
      type: data.type,
      isActive: data.isActive,
      createdBy: data.createdBy,
      createdAt: new Date(),
    }).returning();
    return notification;
  }

  async getActiveNotifications() {
    return await db.select().from(notifications)
      .where(eq(notifications.isActive, true))
      .orderBy(desc(notifications.createdAt));
  }

  async getAllNotifications() {
    return await db.select().from(notifications)
      .orderBy(desc(notifications.createdAt));
  }

  async updateNotification(id: string, data: {
    title?: string;
    message?: string;
    type?: string;
    isActive?: boolean;
  }) {
    const [notification] = await db.update(notifications)
      .set(data)
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  }

  async deleteNotification(id: string): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, id));
  }


  // Image management
  async createImage(userId: string, imageData: CreateImageData) {
    const [image] = await db.insert(images).values({
      userId,
      title: imageData.title,
      description: imageData.description,
      filename: imageData.filename,
      originalFilename: imageData.originalFilename,
      mimeType: imageData.mimeType,
      size: imageData.size,
      width: imageData.width,
      height: imageData.height,
      isPublic: imageData.isPublic,
      tags: imageData.tags,
      backblazeFileId: imageData.backblazeFileId,
      backblazeFileName: imageData.backblazeFileName,
      cdnUrl: imageData.cdnUrl,
      folder: imageData.folder || '',
    }).returning();

    console.log(`Image created: ${image.filename}`);
    return image;
  }

  async getUserImages(userId: string, limit: number = 20, offset: number = 0, folder: string = '') {
    const conditions = [eq(images.userId, userId)];

    if (folder) {
      conditions.push(like(images.folder, `${folder}%`));
    }

    return await db.select().from(images)
      .where(and(...conditions))
      .orderBy(desc(images.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getPublicImages(limit: number = 20, offset: number = 0) {
    return await db.select().from(images)
      .where(eq(images.isPublic, true))
      .orderBy(desc(images.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getImageByPath(userId: string, path: string) {
    const [image] = await db.select().from(images)
      .where(and(
        eq(images.userId, userId),
        like(images.filename, `%${path}`)
      ));
    return image;
  }

  // API Keys management
  async createApiKey(userId: string, keyData: CreateApiKeyData) {
    const keyHash = `sk_${crypto.randomBytes(32).toString('hex')}`;

    const [apiKey] = await db.insert(apiKeys).values({
      userId,
      name: keyData.name,
      keyHash,
      isActive: true,
    }).returning();

    console.log(`API key created: ${keyData.name}`);
    return apiKey;
  }

  async getApiKey(keyHash: string) {
    const [apiKey] = await db.select().from(apiKeys)
      .where(and(eq(apiKeys.keyHash, keyHash), eq(apiKeys.isActive, true)));

    if (apiKey) {
      // Update last used timestamp
      await db.update(apiKeys)
        .set({ lastUsed: new Date() })
        .where(eq(apiKeys.id, apiKey.id));
    }

    return apiKey;
  }

  async getUserApiKeys(userId: string) {
    return await db.select().from(apiKeys)
      .where(eq(apiKeys.userId, userId))
      .orderBy(desc(apiKeys.createdAt));
  }

  // Custom domains management
  async createCustomDomain(userId: string, domainData: CreateCustomDomainData) {
    const [domain] = await db.insert(customDomains).values({
      userId,
      domain: domainData.domain,
      isVerified: false,
      sslEnabled: false,
    }).returning();

    // Store verification token in system logs
    await db.insert(systemLogs).values({
      level: 'info',
      message: 'domain_verification_token',
      userId,
      metadata: {
        domainId: domain.id,
        token: domainData.verificationToken,
        cnameTarget: domainData.cnameTarget
      }
    });

    console.log(`Custom domain created: ${domain.domain}`);
    return domain;
  }

  async getUserCustomDomains(userId: string) {
    return await db.select().from(customDomains)
      .where(eq(customDomains.userId, userId))
      .orderBy(desc(customDomains.createdAt));
  }

  async getUserCustomDomain(userId: string) {
    const [domain] = await db.select().from(customDomains)
      .where(and(
        eq(customDomains.userId, userId),
        eq(customDomains.isVerified, true)
      ));
    return domain;
  }

  async getCustomDomain(domainId: string) {
    const [domain] = await db.select().from(customDomains)
      .where(eq(customDomains.id, domainId));
    return domain;
  }

  async verifyCustomDomain(domainId: string) {
    // In a real implementation, you would verify DNS records here
    // For now, we'll simulate verification
    await db.update(customDomains)
      .set({
        isVerified: true,
        sslEnabled: true,
        verifiedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(customDomains.id, domainId));

    console.log(`Domain verified: ${domainId}`);
    return true;
  }

  // Analytics
  async getUserAnalytics(userId: string) {
    try {
      // Get total images count
      const [totalImagesResult] = await db.select({ count: count() }).from(images)
        .where(eq(images.userId, userId));

      // Get storage usage from user record
      const user = await this.getUser(userId);

      // Get recent activity (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const [recentUploadsResult] = await db.select({ count: count() }).from(images)
        .where(and(
          eq(images.userId, userId),
          sql`created_at >= ${thirtyDaysAgo}`
        ));

      // Get views from analytics (if available)
      const [totalViewsResult] = await db.select({
        total: sql<number>`COALESCE(SUM(CASE WHEN event = 'view' THEN 1 ELSE 0 END), 0)`
      }).from(imageAnalytics)
        .innerJoin(images, eq(imageAnalytics.imageId, images.id))
        .where(eq(images.userId, userId));

      // Get downloads
      const [totalDownloadsResult] = await db.select({
        total: sql<number>`COALESCE(SUM(CASE WHEN event = 'download' THEN 1 ELSE 0 END), 0)`
      }).from(imageAnalytics)
        .innerJoin(images, eq(imageAnalytics.imageId, images.id))
        .where(eq(images.userId, userId));

      return {
        totalImages: totalImagesResult.count || 0,
        storageUsed: user?.storageUsed || 0,
        storageLimit: user?.storageLimit || 1024 * 1024 * 1024,
        recentUploads: recentUploadsResult.count || 0,
        totalViews: totalViewsResult.total || 0,
        totalDownloads: totalDownloadsResult.total || 0,
        planType: user?.plan || 'free',
      };
    } catch (error) {
      console.error('Analytics error:', error);
      // Return default analytics if there's an error
      const user = await this.getUser(userId);
      return {
        totalImages: 0,
        storageUsed: user?.storageUsed || 0,
        storageLimit: user?.storageLimit || 1024 * 1024 * 1024,
        recentUploads: 0,
        totalViews: 0,
        totalDownloads: 0,
        planType: user?.plan || 'free',
      };
    }
  }

  async trackImageView(imageId: string, ipAddress?: string, userAgent?: string) {
    try {
      await db.insert(imageAnalytics).values({
        imageId,
        event: 'view',
        ipAddress: ipAddress || 'unknown',
        userAgent: userAgent || 'unknown',
      });
    } catch (error) {
      console.error('Track view error:', error);
    }
  }

  async trackImageDownload(imageId: string, ipAddress?: string, userAgent?: string) {
    try {
      await db.insert(imageAnalytics).values({
        imageId,
        event: 'download',
        ipAddress: ipAddress || 'unknown',
        userAgent: userAgent || 'unknown',
      });
    } catch (error) {
      console.error('Track download error:', error);
    }
  }

  // System logging
  async logSystemEvent(level: string, message: string, userId?: string, metadata?: any) {
    try {
      await db.insert(systemLogs).values({
        level,
        message,
        userId,
        metadata,
      });
    } catch (error) {
      console.error('System log error:', error);
    }
  }
}

export const storage = new Storage();