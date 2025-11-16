export type QuickLink = {
  title: string;
  description: string;
  href: string;
  mediaUrl: string;
  badge: string;
};

export const quickLinks = [
  {
    title: 'Sustainable Concept',
    description: 'Experience how regenerative sourcing shapes every atelier collaboration.',
    href: '/concept',
    mediaUrl: '/assets/journeys/mallorca-balearic-reverie/mallorca-balearic-reverie-gallery-12.png',
    badge: 'Concept',
  },
  {
    title: 'Mallorca Balearic Reverie',
    description: 'Mediterranean ateliers staged across Tramuntana fincas and cliffside sails.',
    href: '/journeys/mallorca',
    mediaUrl: '/assets/journeys/mallorca-balearic-reverie/mallorca-balearic-reverie-gallery-04.png',
    badge: 'Journey Spotlight',
  },
  {
    title: 'Philippines Lagoon Editions',
    description: 'Dive into lagoon laboratories and story-led reef activations.',
    href: '/journeys/philippines',
    mediaUrl: '/assets/journeys/philippines-lagoon-2025/philippines-lagoon-2025-gallery-04.png',
    badge: 'Journey Spotlight',
  },
  {
    title: 'Greece Mineral Dreams',
    description: 'Follow our minimal epics through Cycladic cliffside sets.',
    href: '/journeys/greece',
    mediaUrl: '/assets/journeys/greece-mineral-dreams/greece-mineral-dreams-gallery-05.png',
    badge: 'Journey Spotlight',
  },
] as const satisfies readonly QuickLink[];
