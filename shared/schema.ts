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
  oauthProvider: varchar('oauth_provider', { length: 50 }), // 'google', 'github', etc.
  oauthId: varchar('oauth_id', { length: 255 }),
  subscribeNewsletter: boolean('subscribe_newsletter').default(false),
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
  // Storage details (kept private)
  backblazeFileId: varchar('backblaze_file_id', { length: 255 }),
  backblazeFileName: varchar('backblaze_file_name', { length: 255 }),
  backblazeBucketName: varchar('backblaze_bucket_name', { length: 255 }),
  // Public URLs (domain-aware)
  publicUrl: text('public_url'), // Clean URL without bucket details
  cdnUrl: text('cdn_url'), // CDN-optimized URL
  thumbnailUrl: text('thumbnail_url'), // Thumbnail version
  folder: varchar('folder', { length: 500 }),
  altText: text('alt_text'),
  views: integer('views').default(0),
  downloads: integer('downloads').default(0),
  uniqueViews: integer('unique_views').default(0),
  // Enhanced metadata
  metadata: jsonb('metadata').default({}), // EXIF, camera data, etc.
  uploadSource: varchar('upload_source', { length: 50 }).default('web'), // web, api, mobile
  uploadIp: varchar('upload_ip', { length: 45 }),
  processingStatus: varchar('processing_status', { length: 20 }).default('completed'),
  // CDN optimization parameters
  cdnOptions: jsonb('cdn_options').default({}),
  // Custom domain support
  customDomainId: uuid('custom_domain_id').references(() => customDomains.id, { onDelete: 'set null' }),
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
  subdomain: varchar('subdomain', { length: 100 }), // For subdomain.domain.com setup
  isVerified: boolean('is_verified').default(false),
  sslEnabled: boolean('ssl_enabled').default(false),
  cnameTarget: varchar('cname_target', { length: 255 }), // What CNAME should point to
  verificationToken: varchar('verification_token', { length: 100 }),
  verifiedAt: timestamp('verified_at'),
  lastChecked: timestamp('last_checked'),
  status: varchar('status', { length: 20 }).default('pending'), // pending, active, failed
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
// Admin Settings Table
export const adminSettings = pgTable('admin_settings', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  key: varchar('key', { length: 100 }).unique().notNull(),
  value: jsonb('value').notNull(),
  description: text('description'),
  category: varchar('category', { length: 50 }).default('general'),
  isPublic: boolean('is_public').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Plan Management Table
export const planSettings = pgTable('plan_settings', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  planId: varchar('plan_id', { length: 50 }).unique().notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  displayName: varchar('display_name', { length: 100 }).notNull(),
  price: integer('price').notNull(), // in cents
  currency: varchar('currency', { length: 3 }).default('USD'),
  period: varchar('period', { length: 20 }).default('month'), // month, year
  description: text('description'),
  features: jsonb('features').default([]),
  limits: jsonb('limits').default({}), // storage, images, api calls etc
  isActive: boolean('is_active').default(true),
  isPopular: boolean('is_popular').default(false),
  trialDays: integer('trial_days').default(0),
  sortOrder: integer('sort_order').default(0),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// System Configuration Table
export const systemConfig = pgTable('system_config', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  maintenanceMode: boolean('maintenance_mode').default(false),
  registrationEnabled: boolean('registration_enabled').default(true),
  emailVerificationRequired: boolean('email_verification_required').default(true),
  maxFileSize: bigint('max_file_size', { mode: 'number' }).default(52428800), // 50MB in bytes
  allowedFileTypes: jsonb('allowed_file_types').default(['jpg', 'jpeg', 'png', 'gif', 'webp']),
  rateLimitEnabled: boolean('rate_limit_enabled').default(true),
  rateLimitPerHour: integer('rate_limit_per_hour').default(1000),
  enableCdn: boolean('enable_cdn').default(true),
  enableAnalytics: boolean('enable_analytics').default(true),
  enableNotifications: boolean('enable_notifications').default(true),
  autoBackupEnabled: boolean('auto_backup_enabled').default(false),
  autoBackupInterval: integer('auto_backup_interval').default(24), // hours
  compressionQuality: integer('compression_quality').default(85),
  enableWatermark: boolean('enable_watermark').default(false),
  defaultWatermarkText: varchar('default_watermark_text', { length: 100 }).default('ImageVault'),
  enableThumbnails: boolean('enable_thumbnails').default(true),
  thumbnailSizes: jsonb('thumbnail_sizes').default(['150x150', '300x300', '500x500']),
  enableImageOptimization: boolean('enable_image_optimization').default(true),
  enableCustomDomains: boolean('enable_custom_domains').default(true),
  enableApiKeys: boolean('enable_api_keys').default(true),
  sessionTimeout: integer('session_timeout').default(720), // minutes
  enableOauth: boolean('enable_oauth').default(true),
  enablePasswordReset: boolean('enable_password_reset').default(true),
  logRetentionDays: integer('log_retention_days').default(90),
  enableEncryption: boolean('enable_encryption').default(false),
  enableImageEditor: boolean('enable_image_editor').default(false),
  enableBulkOperations: boolean('enable_bulk_operations').default(true),
  enableRecycleBin: boolean('enable_recycle_bin').default(true),
  recycleBinRetentionDays: integer('recycle_bin_retention_days').default(30),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export type ImageAnalytic = typeof imageAnalytics.$inferSelect;
export type NewImageAnalytic = typeof imageAnalytics.$inferInsert;
export type AdminSetting = typeof adminSettings.$inferSelect;
export type NewAdminSetting = typeof adminSettings.$inferInsert;
export type PlanSetting = typeof planSettings.$inferSelect;
export type NewPlanSetting = typeof planSettings.$inferInsert;
export type SystemConfig = typeof systemConfig.$inferSelect;
export type NewSystemConfig = typeof systemConfig.$inferInsert;