
import { pgTable, text, varchar, uuid, timestamp, boolean, bigint, integer, jsonb } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().default(createId()),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: text('password'),
  isAdmin: boolean('is_admin').default(false),
  emailVerified: boolean('email_verified').default(false),
  verificationToken: text('verification_token'),
  resetToken: text('reset_token'),
  resetTokenExpiry: timestamp('reset_token_expiry'),
  status: varchar('status', { length: 20 }).default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const images = pgTable('images', {
  id: uuid('id').primaryKey().default(createId()),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  filename: varchar('filename', { length: 255 }).notNull(),
  originalName: varchar('original_name', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }),
  description: text('description'),
  url: text('url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  size: bigint('size', { mode: 'number' }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  width: integer('width'),
  height: integer('height'),
  folderId: uuid('folder_id').references(() => folders.id, { onDelete: 'set null' }),
  isPublic: boolean('is_public').default(true),
  views: integer('views').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const folders = pgTable('folders', {
  id: uuid('id').primaryKey().default(createId()),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().default(createId()),
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
  id: uuid('id').primaryKey().default(createId()),
  level: varchar('level', { length: 10 }).notNull(), // info, warn, error
  message: text('message').notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow()
});

export const seoSettings = pgTable('seo_settings', {
  id: uuid('id').primaryKey().default(createId()),
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
  id: uuid('id').primaryKey().default(createId()),
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
  id: uuid('id').primaryKey().default(createId()),
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
