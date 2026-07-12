import { boolean, integer, jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

/**
 * T-050 — schéma CMS voyages & locations (Neon PostgreSQL).
 * Les médias sont stockés en URLs (assets /public ou URLs externes) ; le
 * stockage objet (upload binaire) est prévu pour une itération suivante.
 */

export type SeasonVisual = { image?: string; backgroundVideo?: string };
export type LocationMedia = { url: string; type: 'image' | 'video'; alt?: string };

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

export type JourneyRow = typeof journeys.$inferSelect;
export type NewJourneyRow = typeof journeys.$inferInsert;
export type LocationRow = typeof locations.$inferSelect;
export type NewLocationRow = typeof locations.$inferInsert;
