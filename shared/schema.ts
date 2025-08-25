
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
  type: varchar('type', { length: 50 }).default('info'),
  isRead: boolean('is_read').default(false),
  isGlobal: boolean('is_global').default(false),
  createdAt: timestamp('created_at').defaultNow()
});

export const systemLogs = pgTable('system_logs', {
  id: uuid('id').primaryKey().default(createId()),
  level: varchar('level', { length: 10 }).notNull(), // info, warn, error
  message: text('message').notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  metadata: jsonb('metadata'),
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
