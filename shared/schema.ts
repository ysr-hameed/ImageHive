import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  name: varchar("name"), // Add name field for consistency
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  plan: varchar("plan").default("free").notNull(), // free, starter, pro, enterprise
  storageUsed: integer("storage_used").default(0).notNull(), // in bytes
  storageLimit: integer("storage_limit").default(1073741824).notNull(), // 1GB default
  apiRequestsUsed: integer("api_requests_used").default(0).notNull(),
  apiRequestsLimit: integer("api_requests_limit").default(10000).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  passwordHash: text("password_hash"), // Hashed password
  emailVerified: boolean("email_verified").default(false),
  emailVerificationToken: text("email_verification_token"),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  googleId: text("google_id"),
  githubId: text("github_id"),
});

// API Keys table
export const apiKeys = pgTable("api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  key: varchar("key").unique().notNull(),
  name: varchar("name").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastUsedAt: timestamp("last_used_at"),
  requestCount: integer("request_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Images table
export const privacyEnum = pgEnum("privacy", ["public", "private"]);

export const images = pgTable("images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  filename: varchar("filename").notNull(),
  originalName: varchar("original_name").notNull(),
  mimeType: varchar("mime_type").notNull(),
  size: integer("size").notNull(), // in bytes
  width: integer("width"),
  height: integer("height"),
  privacy: privacyEnum("privacy").default("public").notNull(),
  description: text("description"),
  altText: varchar("alt_text"),
  tags: text("tags").array(),
  backblazeFileId: varchar("backblaze_file_id").unique(),
  backblazeFileName: varchar("backblaze_file_name"),
  cdnUrl: varchar("cdn_url"),
  viewCount: integer("view_count").default(0).notNull(),
  downloadCount: integer("download_count").default(0).notNull(),
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

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  images: many(images),
  apiKeys: many(apiKeys),
  customDomains: many(customDomains),
  systemLogs: many(systemLogs),
}));

export const imagesRelations = relations(images, ({ one, many }) => ({
  user: one(users, {
    fields: [images.userId],
    references: [users.id],
  }),
  analytics: many(imageAnalytics),
}));

export const apiKeysRelations = relations(apiKeys, ({ one, many }) => ({
  user: one(users, {
    fields: [apiKeys.userId],
    references: [users.id],
  }),
  systemLogs: many(systemLogs),
}));

export const imageAnalyticsRelations = relations(imageAnalytics, ({ one }) => ({
  image: one(images, {
    fields: [imageAnalytics.imageId],
    references: [images.id],
  }),
}));

export const customDomainsRelations = relations(customDomains, ({ one }) => ({
  user: one(users, {
    fields: [customDomains.userId],
    references: [users.id],
  }),
}));

export const systemLogsRelations = relations(systemLogs, ({ one }) => ({
  user: one(users, {
    fields: [systemLogs.userId],
    references: [users.id],
  }),
  apiKey: one(apiKeys, {
    fields: [systemLogs.apiKeyId],
    references: [apiKeys.id],
  }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertImageSchema = createInsertSchema(images).pick({
  filename: true,
  originalName: true,
  mimeType: true,
  size: true,
  width: true,
  height: true,
  privacy: true,
  description: true,
  altText: true,
  tags: true,
});

export const insertApiKeySchema = createInsertSchema(apiKeys).pick({
  name: true,
});

export const insertCustomDomainSchema = createInsertSchema(customDomains).pick({
  domain: true,
});

// Type exports
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertImage = z.infer<typeof insertImageSchema>;
export type Image = typeof images.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof apiKeys.$inferSelect;
export type CustomDomain = typeof customDomains.$inferSelect;
export type SystemLog = typeof systemLogs.$inferSelect;
export type ImageAnalytic = typeof imageAnalytics.$inferSelect;