import { createClient } from '@sanity/client';

import { hasSanityCredentials, sanityConfig } from './config';

export const sanityClient = hasSanityCredentials
  ? createClient({
      projectId: sanityConfig.projectId,
      dataset: sanityConfig.dataset,
      apiVersion: sanityConfig.apiVersion,
      useCdn: sanityConfig.useCdn,
      token: sanityConfig.token,
      perspective: 'published',
    })
  : null;

export function assertSanityClient() {
  if (!sanityClient) {
    throw new Error(
      'Sanity client is not configured. Please add NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET to your environment.'
    );
  }

  return sanityClient;
}
