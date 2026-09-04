import { and, asc, eq, sql } from 'drizzle-orm';

import {
  deriveCampaignCard,
  getStaticCampaignContent,
  staticCampaignEditorialContent,
} from '@/data/campaign-editorial';
import { contentDocuments, getDb, isDbConfigured, type ContentDocumentRow } from '@/lib/db';
import { ensureEditorialSchema } from '@/lib/db/ensure-editorial-schema';
import type { CampaignShowcase, ShowcaseMedia } from '@/data/showcases';
import type {
  CampaignEditorContent,
  CampaignEditorDocument,
  PublishedCampaign,
} from '@/types/editorial-content';

const MAX_TEXT = 30_000;
const MAX_LIST_ITEMS = 40;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function textValue(value: unknown, fallback = '', max = MAX_TEXT): string {
  return typeof value === 'string' ? value.slice(0, max) : fallback;
}

function stringList(value: unknown, fallback: string[] = []): string[] {
  if (!Array.isArray(value)) return clone(fallback);
  return value
    .filter((item): item is string => typeof item === 'string')
    .slice(0, MAX_LIST_ITEMS)
    .map((item) => item.slice(0, MAX_TEXT));
}

function safeMediaUrl(value: unknown, fallback = ''): string {
  const candidate = textValue(value, fallback, 2_000).trim();
  if (!candidate) return '';
  if (
    candidate.startsWith('/') &&
    !candidate.startsWith('//') &&
    !candidate.startsWith('/\\') &&
    !candidate.includes('\\') &&
    !/[\u0000-\u001f\u007f]/.test(candidate)
  ) {
    return candidate;
  }
  try {
    const parsed = new URL(candidate);
    const allowedHost =
      parsed.hostname === 'images.unsplash.com' ||
      parsed.hostname === 'cdn.coverr.co' ||
      parsed.hostname === 'cdn.sanity.io' ||
      parsed.hostname.endsWith('.public.blob.vercel-storage.com');
    if (parsed.protocol === 'https:' && allowedHost) return parsed.toString();
  } catch {
    // Invalid URLs fall back to the last known-safe value.
  }
  return fallback;
}

function safeHref(value: unknown, fallback = ''): string {
  const candidate = textValue(value, fallback, 2_000).trim();
  if (!candidate) return '';
  if (/[\u0000-\u001f\u007f]/.test(candidate) || candidate.includes('\\')) return fallback;
  if (candidate.startsWith('/') && !candidate.startsWith('//')) return candidate;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol === 'https:') return parsed.toString();
    if (parsed.protocol === 'mailto:' && parsed.pathname.includes('@')) return candidate;
    if (parsed.protocol === 'tel:' && /^\+?[0-9(). -]+$/.test(parsed.pathname)) return candidate;
  } catch {
    // Invalid destinations fall back to the last known-safe value.
  }
  return fallback;
}

function normalizeMedia(value: unknown, fallback: ShowcaseMedia): ShowcaseMedia {
  const input = objectValue(value);
  const type = input.type === 'video' ? 'video' : input.type === 'image' ? 'image' : fallback.type;
  const aspectRatio =
    input.aspectRatio === 'portrait' ||
    input.aspectRatio === 'landscape' ||
    input.aspectRatio === 'square'
      ? input.aspectRatio
      : fallback.aspectRatio;

  return {
    id: textValue(input.id, fallback.id, 180),
    type,
    src: safeMediaUrl(input.src, fallback.src),
    alt: textValue(input.alt, fallback.alt, 500),
    aspectRatio,
    poster: safeMediaUrl(input.poster, fallback.poster ?? '') || undefined,
    caption: textValue(input.caption, fallback.caption ?? '', 1_000) || undefined,
  };
}

function normalizeShowcase(
  value: unknown,
  fallback: CampaignShowcase,
  expectedSlug: string
): CampaignShowcase {
  const input = objectValue(value);
  const heroInput = objectValue(input.hero);
  const hero = normalizeMedia(heroInput, fallback.hero);
  const galleryInput = Array.isArray(input.gallery) ? input.gallery : fallback.gallery;
  const gallery = galleryInput
    .slice(0, MAX_LIST_ITEMS)
    .map((item, index) => normalizeMedia(item, fallback.gallery[index] ?? fallback.hero));
  const creditsInput = Array.isArray(input.credits) ? input.credits : fallback.credits;
  const ctaInput = objectValue(input.cta);

  return {
    id: fallback.id,
    slug: expectedSlug,
    title: textValue(input.title, fallback.title, 300),
    destination: textValue(input.destination, fallback.destination, 300),
    headline: textValue(input.headline, fallback.headline),
    summary: textValue(input.summary, fallback.summary),
    story: stringList(input.story, fallback.story),
    highlights: stringList(input.highlights, fallback.highlights),
    credits: creditsInput.slice(0, MAX_LIST_ITEMS).map((item, index) => {
      const credit = objectValue(item);
      const fallbackCredit = fallback.credits[index] ?? { role: '', value: '' };
      return {
        role: textValue(credit.role, fallbackCredit.role, 300),
        value: textValue(credit.value, fallbackCredit.value, 1_000),
      };
    }),
    hero: {
      ...hero,
      loopLabel: textValue(heroInput.loopLabel, fallback.hero.loopLabel ?? '', 300) || undefined,
    },
    gallery,
    impact: stringList(input.impact, fallback.impact),
    cta:
      input.cta === null
        ? undefined
        : {
            label: textValue(ctaInput.label, fallback.cta?.label ?? '', 300),
            href: safeHref(ctaInput.href, fallback.cta?.href ?? '') || '/contact',
          },
  };
}

/** Normalise chaque sauvegarde et recalcule les champs publics du slug canonique. */
export function normalizeCampaignEditorContent(
  value: unknown,
  expectedSlug: string,
  fallback?: CampaignEditorContent | null
): CampaignEditorContent {
  const base = fallback ?? getStaticCampaignContent(expectedSlug);
  if (!base) throw new Error('Contenu de référence introuvable.');
  const input = objectValue(value);
  const listing = objectValue(input.listing);
  const tale = objectValue(input.tale);
  const baseListing = base.listing;
  const baseTale = base.tale;
  const season = listing.season === 'fall-winter' ? 'fall-winter' : 'spring-summer';
  const seasonTags = stringList(listing.seasonTags, baseListing.seasonTags).filter(
    (item): item is 'spring-summer' | 'fall-winter' =>
      item === 'spring-summer' || item === 'fall-winter'
  );
  const thumbnail = objectValue(listing.thumbnail);
  const logo = objectValue(listing.logo);

  return {
    type: 'campaign',
    format: input.format === 'gallery' ? 'gallery' : 'tale',
    showcase: normalizeShowcase(input.showcase, base.showcase, expectedSlug),
    listing: {
      client: textValue(listing.client, baseListing.client, 300),
      season,
      seasonTags: seasonTags.length ? seasonTags : [season],
      country: textValue(listing.country, baseListing.country, 300),
      shootYear:
        typeof listing.shootYear === 'number' && Number.isFinite(listing.shootYear)
          ? Math.max(1900, Math.min(2200, Math.round(listing.shootYear)))
          : baseListing.shootYear,
      releaseWindow: textValue(listing.releaseWindow, baseListing.releaseWindow, 500),
      brandType: textValue(listing.brandType, baseListing.brandType, 300),
      artDirector: textValue(listing.artDirector, baseListing.artDirector, 500),
      talent: textValue(listing.talent, baseListing.talent, 500),
      dop: textValue(listing.dop, baseListing.dop, 500),
      productionTeam: stringList(listing.productionTeam, baseListing.productionTeam),
      models: stringList(listing.models, baseListing.models),
      makeupArtists: stringList(listing.makeupArtists, baseListing.makeupArtists),
      thumbnail: {
        src: safeMediaUrl(thumbnail.src, baseListing.thumbnail.src),
        alt: textValue(thumbnail.alt, baseListing.thumbnail.alt, 500),
      },
      backgroundVideo:
        safeMediaUrl(listing.backgroundVideo, baseListing.backgroundVideo ?? '') || undefined,
      cardPoster: safeMediaUrl(listing.cardPoster, baseListing.cardPoster ?? '') || undefined,
      logo: {
        src: safeMediaUrl(logo.src, baseListing.logo.src),
        alt: textValue(logo.alt, baseListing.logo.alt, 500),
      },
    },
    tale: {
      title: textValue(tale.title, baseTale.title, 500),
      body: textValue(tale.body, baseTale.body),
      images: stringList(tale.images, baseTale.images)
        .map((item, index) => safeMediaUrl(item, baseTale.images[index] ?? ''))
        .filter(Boolean),
      videos: stringList(tale.videos, baseTale.videos)
        .map((item, index) => safeMediaUrl(item, baseTale.videos[index] ?? ''))
        .filter(Boolean),
      heroVideo: safeMediaUrl(tale.heroVideo, baseTale.heroVideo ?? '') || undefined,
      storyVideo: safeMediaUrl(tale.storyVideo, baseTale.storyVideo ?? '') || undefined,
    },
  };
}

function serializeRow(row: ContentDocumentRow): CampaignEditorDocument {
  const fallback = getStaticCampaignContent(row.slug);
  if (!fallback) throw new Error(`Unknown campaign slug: ${row.slug}`);
  const draft = normalizeCampaignEditorContent(row.draft, row.slug, fallback);
  const published = row.published
    ? normalizeCampaignEditorContent(row.published, row.slug, fallback)
    : null;

  return {
    id: row.id,
    slug: row.slug,
    draft,
    published,
    revision: row.revision,
    publishedRevision: row.publishedRevision,
    position: row.position,
    archived: row.archived,
    hasUnpublishedChanges: row.revision !== row.publishedRevision,
    updatedAt: row.updatedAt.toISOString(),
    publishedAt: row.publishedAt?.toISOString() ?? null,
  };
}

async function seedMissingCampaigns() {
  const db = getDb();
  const existing = await db
    .select({ slug: contentDocuments.slug })
    .from(contentDocuments)
    .where(eq(contentDocuments.kind, 'campaign'));
  const known = new Set(existing.map((item) => item.slug));
  const missing = staticCampaignEditorialContent.filter((item) => !known.has(item.showcase.slug));
  if (!missing.length) return;

  await db
    .insert(contentDocuments)
    .values(
      missing.map(({ position, ...content }) => ({
        kind: 'campaign' as const,
        slug: content.showcase.slug,
        draft: clone(content),
        published: clone(content),
        revision: 1,
        publishedRevision: 1,
        position,
        archived: false,
      }))
    )
    .onConflictDoNothing();
}

export async function listAdminCampaignDocuments(): Promise<CampaignEditorDocument[]> {
  await ensureEditorialSchema();
  await seedMissingCampaigns();
  const rows = await getDb()
    .select()
    .from(contentDocuments)
    .where(and(eq(contentDocuments.kind, 'campaign'), eq(contentDocuments.archived, false)))
    .orderBy(asc(contentDocuments.position), asc(contentDocuments.id));
  return rows.map(serializeRow);
}

export async function getAdminCampaignDocument(id: number): Promise<CampaignEditorDocument | null> {
  await ensureEditorialSchema();
  const [row] = await getDb()
    .select()
    .from(contentDocuments)
    .where(and(eq(contentDocuments.id, id), eq(contentDocuments.kind, 'campaign')))
    .limit(1);
  return row ? serializeRow(row) : null;
}

export async function updateCampaignDraft(input: {
  id: number;
  expectedRevision: number;
  content: unknown;
  updatedBy: string;
}): Promise<CampaignEditorDocument | 'conflict' | null> {
  await ensureEditorialSchema();
  const current = await getAdminCampaignDocument(input.id);
  if (!current) return null;
  const normalized = normalizeCampaignEditorContent(input.content, current.slug, current.draft);
  const [updated] = await getDb()
    .update(contentDocuments)
    .set({
      draft: normalized,
      revision: sql`${contentDocuments.revision} + 1`,
      updatedBy: input.updatedBy,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(contentDocuments.id, input.id),
        eq(contentDocuments.kind, 'campaign'),
        eq(contentDocuments.revision, input.expectedRevision)
      )
    )
    .returning();

  if (!updated) return 'conflict';
  return serializeRow(updated);
}

export async function publishCampaignDocument(input: {
  id: number;
  expectedRevision: number;
  updatedBy: string;
}): Promise<CampaignEditorDocument | 'conflict' | null> {
  await ensureEditorialSchema();
  const [updated] = await getDb()
    .update(contentDocuments)
    .set({
      published: sql`${contentDocuments.draft}`,
      publishedRevision: sql`${contentDocuments.revision}`,
      publishedAt: new Date(),
      updatedBy: input.updatedBy,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(contentDocuments.id, input.id),
        eq(contentDocuments.kind, 'campaign'),
        eq(contentDocuments.revision, input.expectedRevision)
      )
    )
    .returning();

  if (!updated) {
    const exists = await getAdminCampaignDocument(input.id);
    return exists ? 'conflict' : null;
  }
  return serializeRow(updated);
}

function staticPublishedCampaigns(): PublishedCampaign[] {
  return clone(staticCampaignEditorialContent);
}

export async function getPublishedCampaigns(): Promise<PublishedCampaign[]> {
  if (!isDbConfigured()) {
    const staticFallbackAllowed =
      process.env.NODE_ENV !== 'production' ||
      process.env.ALLOW_STATIC_CAMPAIGN_FALLBACK === 'true';
    if (!staticFallbackAllowed) {
      throw new Error('Le contenu des campagnes est temporairement indisponible.');
    }
    return staticPublishedCampaigns();
  }

  try {
    await ensureEditorialSchema();
    await seedMissingCampaigns();
    const rows = await getDb()
      .select()
      .from(contentDocuments)
      .where(eq(contentDocuments.kind, 'campaign'))
      .orderBy(asc(contentDocuments.position), asc(contentDocuments.id));
    if (!rows.length) return staticPublishedCampaigns();

    const bySlug = new Map(rows.map((row) => [row.slug, row]));
    const result: PublishedCampaign[] = [];

    for (const staticEntry of staticCampaignEditorialContent) {
      const slug = staticEntry.showcase.slug;
      const row = bySlug.get(slug);
      if (!row) {
        result.push(clone(staticEntry));
        continue;
      }
      bySlug.delete(slug);
      if (row.archived || !row.published) continue;
      const fallback = getStaticCampaignContent(slug);
      result.push({
        ...normalizeCampaignEditorContent(row.published, slug, fallback),
        position: row.position,
      });
    }

    return result.sort((left, right) => left.position - right.position);
  } catch (error) {
    console.error('Published campaign database read failed:', error);
    throw new Error('Le contenu des campagnes est temporairement indisponible.');
  }
}

export async function getPublishedCampaign(slug: string): Promise<PublishedCampaign | null> {
  const entries = await getPublishedCampaigns();
  return entries.find((entry) => entry.showcase.slug === slug) ?? null;
}

export function campaignCardFromPublished(entry: PublishedCampaign) {
  return deriveCampaignCard(entry);
}
