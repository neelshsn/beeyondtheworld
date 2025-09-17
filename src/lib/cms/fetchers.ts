import type { CampaignDetail, ClientLogo, JourneySummary, NarrativeSection } from '@/types/content';
import { journeysSeed } from '@/data/journeys';
import { campaignsSeed } from '@/data/campaigns';
import { clientsTrusted, conceptNarrative } from '@/data/concept';

import { sanityClient } from './client';
import {
  campaignBySlugQuery,
  campaignsQuery,
  clientsQuery,
  conceptSectionsQuery,
  journeysQuery,
} from './queries';

export async function getJourneys(): Promise<JourneySummary[]> {
  if (!sanityClient) return journeysSeed;

  const data = await sanityClient.fetch<JourneySummary[]>(journeysQuery).catch(() => []);
  return data?.length ? data : journeysSeed;
}

export async function getCampaigns(): Promise<CampaignDetail[]> {
  if (!sanityClient) return campaignsSeed;

  const data = await sanityClient.fetch<CampaignDetail[]>(campaignsQuery).catch(() => []);
  return data?.length ? data : campaignsSeed;
}

export async function getCampaignBySlug(slug: string): Promise<CampaignDetail | null> {
  if (!sanityClient) return campaignsSeed.find((campaign) => campaign.slug === slug) ?? null;

  const data = await sanityClient
    .fetch<CampaignDetail | null>(campaignBySlugQuery, { slug })
    .catch(() => null);

  return data ?? campaignsSeed.find((campaign) => campaign.slug === slug) ?? null;
}

export async function getConceptNarrative(): Promise<NarrativeSection[]> {
  if (!sanityClient) return conceptNarrative;

  const data = await sanityClient.fetch<NarrativeSection[]>(conceptSectionsQuery).catch(() => []);
  return data?.length ? data : conceptNarrative;
}

export async function getClientLogos(): Promise<ClientLogo[]> {
  if (!sanityClient) return clientsTrusted;

  const data = await sanityClient.fetch<ClientLogo[]>(clientsQuery).catch(() => []);
  return data?.length ? data : clientsTrusted;
}
