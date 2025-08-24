import {
  users,
  images,
  apiKeys,
  customDomains,
  systemLogs,
  imageAnalytics,
  type User,
  type UpsertUser,
  type Image,
  type InsertImage,
  type ApiKey,
  type InsertApiKey,
  type CustomDomain,
  type SystemLog,
  type ImageAnalytic,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, count } from "drizzle-orm";
import { randomBytes } from "crypto";
import crypto from "crypto";

// Interface for storage operations
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Image operations
  createImage(userId: string, imageData: InsertImage & { backblazeFileId?: string; backblazeFileName?: string; cdnUrl?: string }): Promise<Image>;
  getImage(id: string): Promise<Image | undefined>;
  getUserImages(userId: string, limit?: number, offset?: number): Promise<Image[]>;
  updateImage(id: string, updates: Partial<Image>): Promise<Image | undefined>;
  deleteImage(id: string): Promise<boolean>;
  incrementImageView(id: string): Promise<void>;
  incrementImageDownload(id: string): Promise<void>;
  getPublicImages(limit?: number, offset?: number): Promise<Image[]>;

  // API Key operations
  createApiKey(userId: string, keyData: InsertApiKey): Promise<ApiKey>;
  getApiKey(key: string): Promise<ApiKey | undefined>;
  getUserApiKeys(userId: string): Promise<ApiKey[]>;
  updateApiKeyUsage(id: string): Promise<void>;
  deactivateApiKey(id: string): Promise<boolean>;

  // Custom Domain operations
  createCustomDomain(userId: string, domain: string): Promise<CustomDomain>;
  getUserCustomDomains(userId: string): Promise<CustomDomain[]>;
  verifyCustomDomain(id: string): Promise<boolean>;

  // Analytics operations
  recordImageAnalytic(imageId: string, event: string, metadata?: any): Promise<void>;
  getImageAnalytics(imageId: string): Promise<ImageAnalytic[]>;
  getUserAnalytics(userId: string): Promise<any>;

  // System operations
  createSystemLog(level: string, message: string, userId?: string, apiKeyId?: string, metadata?: any): Promise<SystemLog>;
  getSystemLogs(limit?: number): Promise<SystemLog[]>;
  getUserStats(userId: string): Promise<any>;
  getAdminStats(): Promise<any>;

  // New methods for OAuth and email verification
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  createUser(userData: {
    email: string;
    name: string;
    password?: string;
    emailVerified?: boolean;
    emailVerificationToken?: string;
    googleId?: string;
    githubId?: string;
  }): Promise<User>;
  updateUser(id: string, updates: {
    name?: string;
    password?: string;
    emailVerified?: boolean;
    emailVerificationToken?: string | null;
    passwordResetToken?: string | null;
    passwordResetExpires?: Date | null;
    googleId?: string;
    githubId?: string;
  }): Promise<User | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.emailVerificationToken, token)).limit(1);
    return result[0];
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.passwordResetToken, token)).limit(1);
    return result[0];
  }

  async createUser(userData: {
    email: string;
    name: string;
    password?: string;
    emailVerified?: boolean;
    emailVerificationToken?: string;
    googleId?: string;
    githubId?: string;
  }): Promise<User> {
    const id = crypto.randomUUID();
    const result = await db.insert(users).values({
      id,
      ...userData,
    }).returning();
    return result[0];
  }

  async updateUser(id: string, updates: {
    name?: string;
    password?: string;
    emailVerified?: boolean;
    emailVerificationToken?: string | null;
    passwordResetToken?: string | null;
    passwordResetExpires?: Date | null;
    googleId?: string;
    githubId?: string;
  }): Promise<User | undefined> {
    const result = await db.update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Image operations
  async createImage(userId: string, imageData: InsertImage & { backblazeFileId?: string; backblazeFileName?: string; cdnUrl?: string }): Promise<Image> {
    const [image] = await db
      .insert(images)
      .values({
        ...imageData,
        userId,
        backblazeFileId: imageData.backblazeFileId,
        backblazeFileName: imageData.backblazeFileName,
        cdnUrl: imageData.cdnUrl,
      })
      .returning();

    // Update user storage usage
    await db
      .update(users)
      .set({
        storageUsed: sql`${users.storageUsed} + ${imageData.size}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return image;
  }

  async getImage(id: string): Promise<Image | undefined> {
    const [image] = await db.select().from(images).where(eq(images.id, id));
    return image;
  }

  async getUserImages(userId: string, limit = 20, offset = 0): Promise<Image[]> {
    return await db
      .select()
      .from(images)
      .where(eq(images.userId, userId))
      .orderBy(desc(images.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async updateImage(id: string, updates: Partial<Image>): Promise<Image | undefined> {
    const [image] = await db
      .update(images)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(images.id, id))
      .returning();
    return image;
  }

  async deleteImage(id: string): Promise<boolean> {
    const [image] = await db.select({ size: images.size, userId: images.userId }).from(images).where(eq(images.id, id));
    if (!image) return false;

    await db.delete(images).where(eq(images.id, id));

    // Update user storage usage
    await db
      .update(users)
      .set({
        storageUsed: sql`${users.storageUsed} - ${image.size}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, image.userId));

    return true;
  }

  async incrementImageView(id: string): Promise<void> {
    await db
      .update(images)
      .set({ viewCount: sql`${images.viewCount} + 1` })
      .where(eq(images.id, id));
  }

  async incrementImageDownload(id: string): Promise<void> {
    await db
      .update(images)
      .set({ downloadCount: sql`${images.downloadCount} + 1` })
      .where(eq(images.id, id));
  }

  async getPublicImages(limit = 20, offset = 0): Promise<Image[]> {
    return await db
      .select()
      .from(images)
      .where(eq(images.privacy, "public"))
      .orderBy(desc(images.createdAt))
      .limit(limit)
      .offset(offset);
  }

  // API Key operations
  async createApiKey(userId: string, keyData: InsertApiKey): Promise<ApiKey> {
    const key = `iv_${randomBytes(32).toString('hex')}`;
    const [apiKey] = await db
      .insert(apiKeys)
      .values({
        ...keyData,
        userId,
        key,
      })
      .returning();
    return apiKey;
  }

  async getApiKey(key: string): Promise<ApiKey | undefined> {
    const [apiKey] = await db.select().from(apiKeys).where(and(eq(apiKeys.key, key), eq(apiKeys.isActive, true)));
    return apiKey;
  }

  async getUserApiKeys(userId: string): Promise<ApiKey[]> {
    return await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.userId, userId))
      .orderBy(desc(apiKeys.createdAt));
  }

  async updateApiKeyUsage(id: string): Promise<void> {
    await db
      .update(apiKeys)
      .set({
        requestCount: sql`${apiKeys.requestCount} + 1`,
        lastUsedAt: new Date(),
      })
      .where(eq(apiKeys.id, id));
  }

  async deactivateApiKey(id: string): Promise<boolean> {
    const result = await db
      .update(apiKeys)
      .set({ isActive: false })
      .where(eq(apiKeys.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Custom Domain operations
  async createCustomDomain(userId: string, domain: string): Promise<CustomDomain> {
    const [customDomain] = await db
      .insert(customDomains)
      .values({ userId, domain })
      .returning();
    return customDomain;
  }

  async getUserCustomDomains(userId: string): Promise<CustomDomain[]> {
    return await db
      .select()
      .from(customDomains)
      .where(eq(customDomains.userId, userId))
      .orderBy(desc(customDomains.createdAt));
  }

  async verifyCustomDomain(id: string): Promise<boolean> {
    const [domain] = await db
      .update(customDomains)
      .set({ isVerified: true, verifiedAt: new Date() })
      .where(eq(customDomains.id, id))
      .returning();
    return !!domain;
  }

  // Analytics operations
  async recordImageAnalytic(imageId: string, event: string, metadata?: any): Promise<void> {
    await db.insert(imageAnalytics).values({
      imageId,
      event,
      userAgent: metadata?.userAgent,
      ipAddress: metadata?.ipAddress,
      referer: metadata?.referer,
    });
  }

  async getImageAnalytics(imageId: string): Promise<ImageAnalytic[]> {
    return await db
      .select()
      .from(imageAnalytics)
      .where(eq(imageAnalytics.imageId, imageId))
      .orderBy(desc(imageAnalytics.timestamp));
  }

  async getUserAnalytics(userId: string): Promise<any> {
    // Get user's images analytics
    const result = await db
      .select({
        totalViews: sql<number>`COALESCE(SUM(${images.viewCount}), 0)`,
        totalDownloads: sql<number>`COALESCE(SUM(${images.downloadCount}), 0)`,
        totalImages: sql<number>`COUNT(${images.id})`,
        storageUsed: sql<number>`COALESCE(${users.storageUsed}, 0)`,
      })
      .from(images)
      .rightJoin(users, eq(users.id, images.userId))
      .where(eq(users.id, userId))
      .groupBy(users.id);

    return result[0] || { totalViews: 0, totalDownloads: 0, totalImages: 0, storageUsed: 0 };
  }

  // System operations
  async createSystemLog(level: string, message: string, userId?: string, apiKeyId?: string, metadata?: any): Promise<SystemLog> {
    const [log] = await db
      .insert(systemLogs)
      .values({ level, message, userId, apiKeyId, metadata })
      .returning();
    return log;
  }

  async getSystemLogs(limit = 100): Promise<SystemLog[]> {
    return await db
      .select()
      .from(systemLogs)
      .orderBy(desc(systemLogs.timestamp))
      .limit(limit);
  }

  async getUserStats(userId: string): Promise<any> {
    return await this.getUserAnalytics(userId);
  }

  async getAdminStats(): Promise<any> {
    const [stats] = await db
      .select({
        totalUsers: sql<number>`COUNT(DISTINCT ${users.id})`,
        totalImages: sql<number>`COUNT(DISTINCT ${images.id})`,
        totalStorage: sql<number>`COALESCE(SUM(${users.storageUsed}), 0)`,
        totalViews: sql<number>`COALESCE(SUM(${images.viewCount}), 0)`,
      })
      .from(users)
      .leftJoin(images, eq(images.userId, users.id));

    return stats;
  }
}

export const storage = new DatabaseStorage();