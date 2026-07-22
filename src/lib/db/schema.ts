import { boolean, integer, jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

/**
 * T-050 — schéma CMS voyages & locations (Neon PostgreSQL).
 * Les médias sont stockés en URLs (assets /public ou URLs externes) ; le
 * stockage objet (upload binaire) est prévu pour une itération suivante.
 */

export type SeasonVisual = { image?: string; backgroundVideo?: string };
export type LocationMedia = { url: string; type: 'image' | 'video'; alt?: string };
export type LeadKind = 'contact' | 'journey_booking';
export type LeadNotificationStatus = 'pending' | 'sent' | 'failed' | 'not_configured';

export const journeys = pgTable('journeys', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  season: text('season').notNull().default('spring-summer'),
  seasonTags: jsonb('season_tags').$type<string[]>().notNull().default([]),
  seasonVisuals: jsonb('season_visuals')
    .$type<Record<string, SeasonVisual>>()
    .notNull()
    .default({}),
  dateLabel: text('date_label').notNull().default(''),
  dateFrom: text('date_from'),
  dateTo: text('date_to'),
  location: text('location').notNull().default(''),
  image: text('image').notNull().default(''),
  backgroundVideo: text('background_video'),
  regions: jsonb('regions').$type<string[]>().notNull().default([]),
  moods: jsonb('moods').$type<string[]>().notNull().default([]),
  sustainablePdf: text('sustainable_pdf'),
  position: integer('position').notNull().default(0),
  published: boolean('published').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const locations = pgTable('locations', {
  id: serial('id').primaryKey(),
  journeyId: integer('journey_id')
    .notNull()
    .references(() => journeys.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  subtitle: text('subtitle'),
  leftTitle: jsonb('left_title').$type<string[]>().notNull().default([]),
  narrative: text('narrative').notNull().default(''),
  image: text('image'),
  video: text('video'),
  media: jsonb('media').$type<LocationMedia[]>().notNull().default([]),
  position: integer('position').notNull().default(0),
  published: boolean('published').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Comptes éditeurs du dashboard (auth 100 % Neon, indépendante de Supabase).
 * Un compte invité a `passwordHash` null + un `setupToken` à usage unique :
 * l'invité choisit son mot de passe via /admin/journeys?invite=TOKEN.
 */
export const adminUsers = pgTable('admin_users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  setupToken: text('setup_token').unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const adminSessions = pgTable('admin_sessions', {
  token: text('token').primaryKey(),
  adminUserId: integer('admin_user_id')
    .notNull()
    .references(() => adminUsers.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/**
 * Source de vérité des demandes commerciales. La persistance précède toujours
 * la notification afin qu'une panne du canal d'alerte ne puisse perdre un lead.
 */
export const leadSubmissions = pgTable('lead_submissions', {
  id: text('id').primaryKey(),
  reference: text('reference').notNull().unique(),
  idempotencyKey: text('idempotency_key').notNull().unique(),
  kind: text('kind').$type<LeadKind>().notNull(),
  audience: text('audience'),
  name: text('name'),
  email: text('email'),
  phone: text('phone'),
  company: text('company'),
  journeySlug: text('journey_slug'),
  sourcePath: text('source_path').notNull(),
  payload: jsonb('payload').$type<Record<string, unknown>>().notNull().default({}),
  consentGiven: boolean('consent_given').notNull(),
  consentAt: timestamp('consent_at').notNull(),
  notificationStatus: text('notification_status')
    .$type<LeadNotificationStatus>()
    .notNull()
    .default('pending'),
  notificationAttempts: integer('notification_attempts').notNull().default(0),
  notificationLastError: text('notification_last_error'),
  notifiedAt: timestamp('notified_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type JourneyRow = typeof journeys.$inferSelect;
export type NewJourneyRow = typeof journeys.$inferInsert;
export type LocationRow = typeof locations.$inferSelect;
export type NewLocationRow = typeof locations.$inferInsert;
export type AdminUserRow = typeof adminUsers.$inferSelect;
export type LeadSubmissionRow = typeof leadSubmissions.$inferSelect;
export type NewLeadSubmissionRow = typeof leadSubmissions.$inferInsert;
