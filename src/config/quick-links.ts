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
    mediaUrl: '/assets/journeys/mallorca/mallorca-gallery-12.png',
    badge: 'Concept',
  },
  {
    title: 'Mallorca Serra Studio',
    description: 'Mediterranean ateliers staged across Tramuntana fincas and cliffside sails.',
    href: '/journeys/mallorca-serra-studio',
    mediaUrl: '/assets/journeys/mallorca/mallorca-gallery-04.png',
    badge: 'Journey Spotlight',
  },
  {
    title: 'Philippines Deep Blue',
    description: 'Dive into lagoon laboratories and story-led reef activations.',
    href: '/journeys/philippines-deep-blue',
    mediaUrl: '/assets/journeys/philippines/philippines-gallery-04.png',
    badge: 'Journey Spotlight',
  },
  {
    title: 'Cyclades Light Tale',
    description: 'Follow our minimal epics through Cycladic cliffside sets.',
    href: '/journeys/cyclades-light-tale',
    mediaUrl: '/assets/journeys/greece/greece-gallery-05.png',
    badge: 'Journey Spotlight',
  },
] as const satisfies readonly QuickLink[];
