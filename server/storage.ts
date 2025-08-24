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
  // User operations (required for auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // New methods for OAuth and email verification
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  createUser(userData: {
    email: string;
    firstName: string;
    lastName: string;
    passwordHash: string;
    emailVerified: boolean;
    profileImageUrl: string | null;
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

  // Image operations
  createImage(userId: string, imageData: InsertImage & { backblazeFileId?: string; backblazeFileName?: string; cdnUrl?: string }): Promise<Image>;
  getImage(id: string): Promise<Image | undefined>;
  getUserImages(userId: string, limit?: number, offset?: number): Promise<Image[]>;
  updateImage(id: string, updates: Partial<Image>): Promise<Image | undefined>;
  deleteImage(id: string): Promise<boolean>;
  incrementImageView(id: string): Promise<void>;
  incrementImageDownload(id: string): Promise<void>;
  getPublicImages(limit?: number, offset?: number): Promise<Image[]>;

  // API key operations
  createApiKey(userId: string, data: InsertApiKey): Promise<ApiKey>;
  getApiKey(keyHash: string): Promise<ApiKey | undefined>;
  getUserApiKeys(userId: string): Promise<ApiKey[]>;
  updateApiKey(id: string, updates: Partial<ApiKey>): Promise<ApiKey | undefined>;
  deleteApiKey(id: string): Promise<boolean>;

  // Custom domain operations
  createCustomDomain(userId: string, domain: string): Promise<CustomDomain>;
  getCustomDomain(domain: string): Promise<CustomDomain | undefined>;
  getUserCustomDomains(userId: string): Promise<CustomDomain[]>;
  updateCustomDomain(id: string, updates: Partial<CustomDomain>): Promise<CustomDomain | undefined>;
  deleteCustomDomain(id: string): Promise<boolean>;

  // Analytics operations
  recordImageView(imageId: string, viewerIp?: string, userAgent?: string): Promise<void>;
  getImageAnalytics(imageId: string, days?: number): Promise<ImageAnalytic[]>;
  getUserAnalytics(userId: string, days?: number): Promise<any>;

  // System operations
  createSystemLog(level: string, message: string, metadata?: any): Promise<SystemLog>;
  getSystemLogs(limit?: number, offset?: number): Promise<SystemLog[]>;
}

export class DatabaseStorage implements IStorage {
  private db = db; // Make db accessible within the class

  // User operations (required for auth)
  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    const [result] = await this.db
      .insert(users)
      .values(user)
      .onConflictDoUpdate({
        target: users.email,
        set: {
          name: user.name || sql`${users.name}`,
          firstName: user.firstName || sql`${users.firstName}`,
          lastName: user.lastName || sql`${users.lastName}`,
          profileImageUrl: user.profileImageUrl || sql`${users.profileImageUrl}`,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.emailVerificationToken, token)).limit(1);
    return result[0];
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const result = await this.db.select()
      .from(users)
      .where(and(
        eq(users.passwordResetToken, token),
        sql`${users.passwordResetExpires} > NOW()`
      )).limit(1);
    return result[0];
  }

  async createUser(userData: {
    email: string;
    firstName: string;
    lastName: string;
    passwordHash: string;
    emailVerified: boolean;
    profileImageUrl: string | null;
  }): Promise<User> {
    const [user] = await this.db.insert(users).values({
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      passwordHash: userData.passwordHash,
      emailVerified: userData.emailVerified,
      profileImageUrl: userData.profileImageUrl,
    }).returning();
    return user;
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
    const [user] = await this.db.update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Image operations
  async createImage(userId: string, imageData: InsertImage & { backblazeFileId?: string; backblazeFileName?: string; cdnUrl?: string }): Promise<Image> {
    const [image] = await this.db
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
    await this.db
      .update(users)
      .set({
        storageUsed: sql`${users.storageUsed} + ${imageData.size}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return image;
  }

  async getImage(id: string): Promise<Image | undefined> {
    const [image] = await this.db.select().from(images).where(eq(images.id, id));
    return image;
  }

  async getUserImages(userId: string, limit = 20, offset = 0): Promise<Image[]> {
    return await this.db
      .select()
      .from(images)
      .where(eq(images.userId, userId))
      .orderBy(desc(images.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async updateImage(id: string, updates: Partial<Image>): Promise<Image | undefined> {
    const [image] = await this.db
      .update(images)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(images.id, id))
      .returning();
    return image;
  }

  async deleteImage(id: string): Promise<boolean> {
    const result = await this.db.delete(images).where(eq(images.id, id));
    return (result.rowCount || 0) > 0;
  }

  async incrementImageView(id: string): Promise<void> {
    await this.db
      .update(images)
      .set({
        views: sql`${images.views} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(images.id, id));
  }

  async incrementImageDownload(id: string): Promise<void> {
    await this.db
      .update(images)
      .set({
        downloads: sql`${images.downloads} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(images.id, id));
  }

  async getPublicImages(limit = 20, offset = 0): Promise<Image[]> {
    return await this.db
      .select()
      .from(images)
      .where(eq(images.isPublic, true))
      .orderBy(desc(images.createdAt))
      .limit(limit)
      .offset(offset);
  }

  // API key operations
  async createApiKey(userId: string, data: InsertApiKey): Promise<ApiKey> {
    const key = crypto.randomBytes(32).toString('hex');
    const keyHash = crypto.createHash('sha256').update(key).digest('hex');

    const [apiKey] = await this.db
      .insert(apiKeys)
      .values({
        ...data,
        userId,
        keyHash: key, // Store the original key for first return
      })
      .returning();

    // Update the stored key to be hashed
    await this.db
      .update(apiKeys)
      .set({ keyHash })
      .where(eq(apiKeys.id, apiKey.id));

    // Return with original key for client
    return { ...apiKey, keyHash: key };
  }

  async getApiKey(keyHash: string): Promise<ApiKey | undefined> {
    const hash = crypto.createHash('sha256').update(keyHash).digest('hex');
    const [apiKey] = await this.db.select().from(apiKeys).where(eq(apiKeys.keyHash, hash));
    return apiKey;
  }

  async getUserApiKeys(userId: string): Promise<ApiKey[]> {
    return await this.db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.userId, userId))
      .orderBy(desc(apiKeys.createdAt));
  }

  async updateApiKey(id: string, updates: Partial<ApiKey>): Promise<ApiKey | undefined> {
    const [apiKey] = await this.db
      .update(apiKeys)
      .set(updates)
      .where(eq(apiKeys.id, id))
      .returning();
    return apiKey;
  }

  async deleteApiKey(id: string): Promise<boolean> {
    const result = await this.db.delete(apiKeys).where(eq(apiKeys.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Custom domain operations
  async createCustomDomain(userId: string, domain: string): Promise<CustomDomain> {
    const [customDomain] = await this.db
      .insert(customDomains)
      .values({
        userId,
        domain,
      })
      .returning();
    return customDomain;
  }

  async getCustomDomain(domain: string): Promise<CustomDomain | undefined> {
    const [customDomain] = await this.db.select().from(customDomains).where(eq(customDomains.domain, domain));
    return customDomain;
  }

  async getUserCustomDomains(userId: string): Promise<CustomDomain[]> {
    return await this.db
      .select()
      .from(customDomains)
      .where(eq(customDomains.userId, userId))
      .orderBy(desc(customDomains.createdAt));
  }

  async updateCustomDomain(id: string, updates: Partial<CustomDomain>): Promise<CustomDomain | undefined> {
    const [customDomain] = await this.db
      .update(customDomains)
      .set(updates)
      .where(eq(customDomains.id, id))
      .returning();
    return customDomain;
  }

  async deleteCustomDomain(id: string): Promise<boolean> {
    const result = await this.db.delete(customDomains).where(eq(customDomains.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Analytics operations
  async recordImageView(imageId: string, viewerIp?: string, userAgent?: string): Promise<void> {
    await this.db.insert(imageAnalytics).values({
      imageId,
      event: 'view',
      ipAddress: viewerIp,
      userAgent,
    });
  }

  async getImageAnalytics(imageId: string, days = 30): Promise<ImageAnalytic[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await this.db
      .select()
      .from(imageAnalytics)
      .where(and(
        eq(imageAnalytics.imageId, imageId),
        sql`${imageAnalytics.timestamp} >= ${startDate}`
      ))
      .orderBy(desc(imageAnalytics.timestamp));
  }

  async getUserAnalytics(userId: string, days = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // This would need a more complex query joining images and analytics
    const [result] = await this.db
      .select({
        totalViews: sql<number>`COUNT(*)`,
      })
      .from(imageAnalytics)
      .leftJoin(images, eq(imageAnalytics.imageId, images.id))
      .where(and(
        eq(images.userId, userId),
        sql`${imageAnalytics.timestamp} >= ${startDate}`
      ));

    return result;
  }

  // System operations
  async createSystemLog(level: string, message: string, metadata?: any): Promise<SystemLog> {
    const [log] = await this.db
      .insert(systemLogs)
      .values({
        level,
        message,
        metadata,
      })
      .returning();
    return log;
  }

  async getSystemLogs(limit = 100, offset = 0): Promise<SystemLog[]> {
    return await this.db
      .select()
      .from(systemLogs)
      .orderBy(desc(systemLogs.timestamp))
      .limit(limit)
      .offset(offset);
  }

  // Authentication helper methods
  async createEmailVerificationToken(userId: string, token: string) {
    console.log(`Email verification token created for user ${userId}: ${token}`);
    await this.db.update(users)
      .set({ emailVerificationToken: token })
      .where(eq(users.id, userId));
  }

  async createPasswordResetToken(userId: string, token: string) {
    console.log(`Password reset token created for user ${userId}: ${token}`);
    await this.db.update(users)
      .set({ passwordResetToken: token, passwordResetExpires: new Date(Date.now() + 1000 * 60 * 60) }) // Expires in 1 hour
      .where(eq(users.id, userId));
  }

  async verifyPasswordResetToken(token: string) {
    const user = await this.getUserByResetToken(token);
    return user;
  }

  async updateUserPassword(userId: string, hashedPassword: string) {
    await this.db.update(users)
      .set({ passwordHash: hashedPassword, passwordResetToken: null, passwordResetExpires: null })
      .where(eq(users.id, userId));
  }

  async deletePasswordResetToken(token: string) {
    await this.db.update(users)
      .set({ passwordResetToken: null, passwordResetExpires: null })
      .where(eq(users.passwordResetToken, token));
  }

  async verifyEmailToken(token: string) {
    const user = await this.getUserByVerificationToken(token);
    return user;
  }

  async markEmailAsVerified(userId: string) {
    await this.db.update(users)
      .set({ emailVerified: true, emailVerificationToken: null })
      .where(eq(users.id, userId));
  }

  async deleteEmailVerificationToken(token: string) {
    await this.db.update(users)
      .set({ emailVerificationToken: null })
      .where(eq(users.emailVerificationToken, token));
  }
}

export const storage = new DatabaseStorage();