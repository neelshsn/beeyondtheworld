import type { JourneySummary } from '@/types/content';

export const journeysSeed: JourneySummary[] = [
  {
    id: 'journey-philippines',
    slug: 'philippines',
    title: 'Philippines Lagoon Editions',
    excerpt:
      'Floating ateliers weave through Palawan coves and Siargao palms, capturing reef-friendly couture with lagoon cinemas and night-sail rituals.',
    location: 'Palawan & Siargao, Philippines',
    accent: 'rose',
    coverImage: {
      id: 'journey-philippines-cover',
      kind: 'image',
      url: '/assets/journeys/philippines-lagoon-2025/philippines-lagoon-2025-hero.png',
      alt: 'Turquoise lagoon surrounded by limestone cliffs and a floating pavilion',
      aspectRatio: 'portrait',
    },
    teaserVideo: '/assets/journeys/philippines-lagoon-2025/philippines-lagoon-2025-clip-01.mp4',
    launchDate: '2025-10-01',
  },
  {
    id: 'journey-mallorca',
    slug: 'mallorca-serra-studio',
    title: 'Mallorca Balearic Reverie',
    excerpt:
      'Tramuntana fincas, cliff sound baths, and Balearic sail rituals compose a slow-living storyboard for Mediterranean maisons.',
    location: 'Mallorca & Ibiza, Spain',
    accent: 'peach',
    coverImage: {
      id: 'journey-mallorca-cover',
      kind: 'image',
      url: '/assets/journeys/mallorca-balearic-reverie/mallorca-balearic-reverie-gallery-06.png',
      alt: 'Sailboat passing Es Vedrà at sunset with open-air styling deck',
      aspectRatio: 'landscape',
    },
    teaserVideo: '/assets/journeys/mallorca-balearic-reverie/mallorca-balearic-reverie-clip-01.mp4',
    launchDate: '2025-05-15',
  },
  {
    id: 'journey-greece',
    slug: 'cyclades-light-tale',
    title: 'Greece Mineral Dreams',
    excerpt:
      'Minimal epics unfold across Cycladic terraces, caique transfers, and lantern-lit boathouses for dual film and editorial suites.',
    location: 'Cyclades, Greece',
    accent: 'lilac',
    coverImage: {
      id: 'journey-greece-cover',
      kind: 'image',
      url: '/assets/journeys/greece-mineral-dreams/greece-mineral-dreams-gallery-05.png',
      alt: 'Whitewashed Cycladic steps overlooking the Aegean sea at sunrise',
      aspectRatio: 'portrait',
    },
    teaserVideo: '/assets/journeys/greece-mineral-dreams/greece-mineral-dreams-clip-01.mp4',
    launchDate: '2025-09-05',
  },
  {
    id: 'journey-dolomites',
    slug: 'dolomites-april-2026',
    title: 'Dolomites Alpine Atelier',
    excerpt:
      'Snow lines melt into cinematic climbing routes and peak-top salons where collections breathe alpine light and glacial acoustics.',
    location: 'Dolomiti, Italy',
    accent: 'rose',
    coverImage: {
      id: 'journey-dolomites-cover',
      kind: 'image',
      url: '/assets/journeys/dolomites-april-2026/dolomites-april-2026-gallery-05.png',
      alt: 'Sunset glow over Dolomite peaks with a mirrored runway terrace',
      aspectRatio: 'landscape',
    },
    teaserVideo: '/assets/journeys/dolomites-april-2026/dolomites-april-2026-clip-01.mp4',
    launchDate: '2026-04-10',
  },
  {
    id: 'journey-morocco',
    slug: 'morocco-april-2026',
    title: 'Morocco Desert Caravan',
    excerpt:
      'Agafay dunes, Marrakech riads, and Taghazout swells merge into a multi-city atelier where desert acoustics conduct every light cue.',
    location: 'Agafay, Marrakech & Essaouira, Morocco',
    accent: 'peach',
    coverImage: {
      id: 'journey-morocco-cover',
      kind: 'image',
      url: '/assets/journeys/morocco-april-2026/morocco-april-2026-gallery-08.png',
      alt: 'Golden desert runway with mirrored pillars and nomad tents',
      aspectRatio: 'portrait',
    },
    teaserVideo: '/assets/journeys/morocco-april-2026/morocco-april-2026-clip-01.mp4',
    launchDate: '2026-03-15',
  },
  {
    id: 'journey-japan',
    slug: 'japan-april-november',
    title: 'Japan Sakura & Ember',
    excerpt:
      'Dual itineraries in April and November trace tea-house couture labs, neon city symphonies, and volcanic onsen residencies.',
    location: 'Kyoto & Tokyo, Japan',
    accent: 'lilac',
    coverImage: {
      id: 'journey-japan-cover',
      kind: 'image',
      url: '/assets/journeys/japan-april-november/japan-april-november-hero.svg',
      alt: 'Graphic gradient scene evoking sakura skies over indigo mountains',
      aspectRatio: 'portrait',
    },
    launchDate: '2026-04-05',
  },
] as const;
