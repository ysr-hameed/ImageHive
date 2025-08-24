import { pgTable, varchar, text, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  passwordHash: varchar("password_hash"),
  emailVerified: boolean("email_verified").default(false).notNull(),
  profileImageUrl: text("profile_image_url"),
  plan: varchar("plan").default("free").notNull(), // free, starter, pro, enterprise
  storageUsed: integer("storage_used").default(0).notNull(), // in bytes
  storageLimit: integer("storage_limit").default(sql`1024 * 1024 * 1024`).notNull(), // 1GB default
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Images table
export const images = pgTable("images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar("title").notNull(),
  description: text("description"),
  filename: varchar("filename").notNull(),
  originalFilename: varchar("original_filename").notNull(),
  mimeType: varchar("mime_type").notNull(),
  size: integer("size").notNull(), // in bytes
  width: integer("width"),
  height: integer("height"),
  isPublic: boolean("is_public").default(false).notNull(),
  tags: jsonb("tags").default(sql`'[]'`),
  views: integer("views").default(0).notNull(),
  downloads: integer("downloads").default(0).notNull(),
  backblazeFileId: varchar("backblaze_file_id"),
  backblazeFileName: varchar("backblaze_file_name"),
  cdnUrl: text("cdn_url"),
  folder: varchar("folder").default("").notNull(), // folder path for organization
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// API Keys table
export const apiKeys = pgTable("api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar("name").notNull(),
  keyHash: varchar("key_hash").unique().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastUsed: timestamp("last_used"),
  requestCount: integer("request_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Image Analytics table
export const imageAnalytics = pgTable("image_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  imageId: varchar("image_id").notNull().references(() => images.id, { onDelete: 'cascade' }),
  event: varchar("event").notNull(), // view, download, transform
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address"),
  referer: text("referer"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Custom Domains table
export const customDomains = pgTable("custom_domains", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  domain: varchar("domain").unique().notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  sslEnabled: boolean("ssl_enabled").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  verifiedAt: timestamp("verified_at"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// System Logs table
export const systemLogs = pgTable("system_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  level: varchar("level").notNull(), // info, warn, error
  message: text("message").notNull(),
  userId: varchar("user_id").references(() => users.id),
  apiKeyId: varchar("api_key_id").references(() => apiKeys.id),
  metadata: jsonb("metadata"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Zod schemas for validation
export const insertUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  passwordHash: z.string(),
  emailVerified: z.boolean().default(false),
  profileImageUrl: z.string().optional(),
  plan: z.enum(["free", "starter", "pro", "enterprise"]).default("free"),
});

export const insertImageSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  filename: z.string().min(1),
  originalFilename: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().int().positive(),
  width: z.number().int().optional(),
  height: z.number().int().optional(),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  backblazeFileId: z.string().optional(),
  backblazeFileName: z.string().optional(),
  cdnUrl: z.string().optional(),
  folder: z.string().default(""),
});

export const insertApiKeySchema = z.object({
  name: z.string().min(1),
});

export const insertCustomDomainSchema = z.object({
  domain: z.string().min(1).regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/),
});

export const insertImageAnalyticsSchema = z.object({
  imageId: z.string(),
  event: z.enum(["view", "download", "transform"]),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  referer: z.string().optional(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Image = typeof images.$inferSelect;
export type NewImage = typeof images.$inferInsert;
export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;
export type CustomDomain = typeof customDomains.$inferSelect;
export type NewCustomDomain = typeof customDomains.$inferInsert;
export type ImageAnalytics = typeof imageAnalytics.$inferSelect;
export type NewImageAnalytics = typeof imageAnalytics.$inferInsert;
export type SystemLog = typeof systemLogs.$inferSelect;
export type NewSystemLog = typeof systemLogs.$inferInsert;