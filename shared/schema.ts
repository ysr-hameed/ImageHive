
import { pgTable, text, varchar, uuid, timestamp, boolean, bigint, integer, jsonb } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  email: varchar('email', { length: 255 }).unique().notNull(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  passwordHash: text('password_hash'),
  isAdmin: boolean('is_admin').default(false),
  emailVerified: boolean('email_verified').default(false),
  profileImageUrl: text('profile_image_url'),
  plan: varchar('plan', { length: 50 }).default('free'),
  storageUsed: bigint('storage_used', { mode: 'number' }).default(0),
  storageLimit: bigint('storage_limit', { mode: 'number' }).default(1073741824), // 1GB
  apiRequestsLimit: integer('api_requests_limit').default(1000),
  verificationToken: text('verification_token'),
  resetToken: text('reset_token'),
  resetTokenExpiry: timestamp('reset_token_expiry'),
  status: varchar('status', { length: 20 }).default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const images = pgTable('images', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  filename: varchar('filename', { length: 255 }).notNull(),
  originalFilename: varchar('original_filename', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }),
  description: text('description'),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  size: bigint('size', { mode: 'number' }).notNull(),
  width: integer('width'),
  height: integer('height'),
  isPublic: boolean('is_public').default(true),
  tags: jsonb('tags').default([]),
  backblazeFileId: varchar('backblaze_file_id', { length: 255 }),
  backblazeFileName: varchar('backblaze_file_name', { length: 255 }),
  cdnUrl: text('cdn_url'),
  folder: varchar('folder', { length: 500 }),
  views: integer('views').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const folders = pgTable('folders', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  type: varchar('type', { length: 50 }).default('info'), // 'info', 'success', 'warning', 'error'
  category: varchar('category', { length: 50 }).default('general'), // 'system', 'marketing', 'security', 'general'
  isRead: boolean('is_read').default(false),
  isActive: boolean('is_active').default(true),
  isGlobal: boolean('is_global').default(false),
  sendEmail: boolean('send_email').default(false),
  emailSent: boolean('email_sent').default(false),
  actionUrl: text('action_url'),
  actionLabel: varchar('action_label', { length: 100 }),
  expiresAt: timestamp('expires_at'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const systemLogs = pgTable('system_logs', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  level: varchar('level', { length: 10 }).notNull(), // info, warn, error
  message: text('message').notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow()
});

export const seoSettings = pgTable('seo_settings', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  pageType: varchar('page_type', { length: 50 }).notNull(), // 'home', 'dashboard', 'global', etc.
  title: varchar('title', { length: 255 }),
  description: text('description'),
  keywords: text('keywords'),
  ogTitle: varchar('og_title', { length: 255 }),
  ogDescription: text('og_description'),
  ogImage: text('og_image'),
  twitterTitle: varchar('twitter_title', { length: 255 }),
  twitterDescription: text('twitter_description'),
  twitterImage: text('twitter_image'),
  canonicalUrl: text('canonical_url'),
  robots: varchar('robots', { length: 100 }).default('index, follow'),
  structuredData: jsonb('structured_data'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const emailCampaigns = pgTable('email_campaigns', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: varchar('name', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 255 }).notNull(),
  htmlContent: text('html_content').notNull(),
  textContent: text('text_content'),
  templateType: varchar('template_type', { length: 50 }), // 'notification', 'marketing', 'system'
  targetAudience: varchar('target_audience', { length: 50 }).default('all'), // 'all', 'specific', 'admins'
  targetUserIds: jsonb('target_user_ids'), // array of user IDs for specific targeting
  scheduledAt: timestamp('scheduled_at'),
  sentAt: timestamp('sent_at'),
  status: varchar('status', { length: 20 }).default('draft'), // 'draft', 'scheduled', 'sending', 'sent', 'failed'
  sentCount: integer('sent_count').default(0),
  openCount: integer('open_count').default(0),
  clickCount: integer('click_count').default(0),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const emailLogs = pgTable('email_logs', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  campaignId: uuid('campaign_id').references(() => emailCampaigns.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull(),
  status: varchar('status', { length: 20 }).notNull(), // 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'
  errorMessage: text('error_message'),
  sentAt: timestamp('sent_at'),
  openedAt: timestamp('opened_at'),
  clickedAt: timestamp('clicked_at'),
  createdAt: timestamp('created_at').defaultNow()
});

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  keyHash: varchar('key_hash', { length: 255 }).unique().notNull(),
  isActive: boolean('is_active').default(true),
  lastUsed: timestamp('last_used'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const customDomains = pgTable('custom_domains', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  domain: varchar('domain', { length: 255 }).unique().notNull(),
  isVerified: boolean('is_verified').default(false),
  sslEnabled: boolean('ssl_enabled').default(false),
  verifiedAt: timestamp('verified_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const imageAnalytics = pgTable('image_analytics', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  imageId: uuid('image_id').references(() => images.id, { onDelete: 'cascade' }).notNull(),
  event: varchar('event', { length: 50 }).notNull(), // 'view', 'download'
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  timestamp: timestamp('timestamp').defaultNow(),
  createdAt: timestamp('created_at').defaultNow()
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Image = typeof images.$inferSelect;
export type NewImage = typeof images.$inferInsert;
export type Folder = typeof folders.$inferSelect;
export type NewFolder = typeof folders.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type SystemLog = typeof systemLogs.$inferSelect;
export type NewSystemLog = typeof systemLogs.$inferInsert;
export type SeoSetting = typeof seoSettings.$inferSelect;
export type NewSeoSetting = typeof seoSettings.$inferInsert;
export type EmailCampaign = typeof emailCampaigns.$inferSelect;
export type NewEmailCampaign = typeof emailCampaigns.$inferInsert;
export type EmailLog = typeof emailLogs.$inferSelect;
export type NewEmailLog = typeof emailLogs.$inferInsert;
export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;
export type CustomDomain = typeof customDomains.$inferSelect;
export type NewCustomDomain = typeof customDomains.$inferInsert;
export type ImageAnalytic = typeof imageAnalytics.$inferSelect;
export type NewImageAnalytic = typeof imageAnalytics.$inferInsert;
