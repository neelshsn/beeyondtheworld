import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  deriveCampaignCard,
  getStaticCampaignContent,
  staticCampaignEditorialContent,
} from '@/data/campaign-editorial';
import { getPublishedCampaigns, normalizeCampaignEditorContent } from '@/lib/cms/campaign-content';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('campaign editorial content', () => {
  it('keeps the eight approved campaigns and their two formats', () => {
    expect(staticCampaignEditorialContent).toHaveLength(8);
    expect(
      Object.fromEntries(
        staticCampaignEditorialContent.map((item) => [item.showcase.slug, item.format])
      )
    ).toEqual({
      'maradji-ibiza': 'gallery',
      'almaaz-kenya': 'tale',
      'craie-maroc': 'tale',
      'craie-suisse': 'gallery',
      'grace-mila-morocco': 'gallery',
      'veganboost-greece': 'tale',
      'almaaz-new-york': 'tale',
      'ange-new-york': 'gallery',
    });
  });

  it('forces the canonical slug and derives duplicate public card fields', () => {
    const base = getStaticCampaignContent('veganboost-greece');
    expect(base).not.toBeNull();
    const normalized = normalizeCampaignEditorContent(
      {
        ...base,
        format: 'gallery',
        showcase: {
          ...base!.showcase,
          slug: 'unsafe-new-slug',
          title: 'VEGAN BOOST UPDATED',
          destination: 'Milos, Greece',
          summary: 'Updated summary',
        },
      },
      'veganboost-greece',
      base
    );
    const card = deriveCampaignCard(normalized);

    expect(normalized.showcase.slug).toBe('veganboost-greece');
    expect(normalized.format).toBe('gallery');
    expect(card.slug).toBe('veganboost-greece');
    expect(card.title).toBe('VEGAN BOOST UPDATED');
    expect(card.destination).toBe('Milos, Greece');
    expect(card.synopsis).toBe('Updated summary');
  });

  it('does not accept executable media URLs', () => {
    const base = getStaticCampaignContent('almaaz-kenya');
    expect(base).not.toBeNull();
    const normalized = normalizeCampaignEditorContent(
      {
        ...base,
        listing: {
          ...base!.listing,
          thumbnail: { ...base!.listing.thumbnail, src: 'javascript:alert(1)' },
        },
      },
      'almaaz-kenya',
      base
    );

    expect(normalized.listing.thumbnail.src).toBe(base!.listing.thumbnail.src);
  });

  it.each(['//evil.example/image.webp', '/\\evil.example/image.webp', 'https://evil.example/x'])(
    'rejects unsafe or unapproved media URL %s',
    (unsafeUrl) => {
      const base = getStaticCampaignContent('almaaz-kenya');
      expect(base).not.toBeNull();
      const normalized = normalizeCampaignEditorContent(
        {
          ...base,
          listing: {
            ...base!.listing,
            thumbnail: { ...base!.listing.thumbnail, src: unsafeUrl },
          },
        },
        'almaaz-kenya',
        base
      );
      expect(normalized.listing.thumbnail.src).toBe(base!.listing.thumbnail.src);
    }
  );

  it('accepts media uploaded to the configured public Blob host', () => {
    const base = getStaticCampaignContent('almaaz-kenya');
    expect(base).not.toBeNull();
    const blobUrl = 'https://example.public.blob.vercel-storage.com/image.webp';
    const normalized = normalizeCampaignEditorContent(
      {
        ...base,
        listing: {
          ...base!.listing,
          thumbnail: { ...base!.listing.thumbnail, src: blobUrl },
        },
      },
      'almaaz-kenya',
      base
    );
    expect(normalized.listing.thumbnail.src).toBe(blobUrl);
  });

  it('fails closed without a database in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('DATABASE_URL', '');
    vi.stubEnv('ALLOW_STATIC_CAMPAIGN_FALLBACK', '');

    await expect(getPublishedCampaigns()).rejects.toThrow(
      'Le contenu des campagnes est temporairement indisponible.'
    );
  });

  it('allows the explicit production static fallback opt-in', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('DATABASE_URL', '');
    vi.stubEnv('ALLOW_STATIC_CAMPAIGN_FALLBACK', 'true');

    await expect(getPublishedCampaigns()).resolves.toHaveLength(8);
  });
});
