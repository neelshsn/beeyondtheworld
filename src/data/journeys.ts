import type { JourneySummary } from '@/types/content';

export const journeysSeed: JourneySummary[] = [
  {
    id: 'journey-sahoma',
    slug: 'sahoma-azure-mosaic',
    title: 'Sahoma ? Azure Mosaic',
    excerpt:
      'Sun-soaked capsules for Riviera dreamers ? fluid silhouettes, hand-loomed jacquards, and translucent resin accessories.',
    location: 'Capri, Italy',
    accent: 'rose',
    coverImage: {
      id: 'journey-sahoma-cover',
      kind: 'image',
      url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1400&q=80',
      alt: 'Sahoma campaign with model wearing flowing pastel dress on coastal terrace',
      aspectRatio: 'portrait',
    },
    teaserVideo: 'https://cdn.coverr.co/videos/coverr-fashion-runway-1080p.mp4',
    launchDate: 'SS25',
  },
  {
    id: 'journey-grace',
    slug: 'grace-mila-gilded-light',
    title: 'Grace & Mila ? Gilded Light',
    excerpt:
      'An ethereal soir?e celebrating French savoir-faire through luminous organza, sculptural florals and intimate storytelling.',
    location: 'Paris, France',
    accent: 'peach',
    coverImage: {
      id: 'journey-grace-cover',
      kind: 'image',
      url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=80',
      alt: 'Elegant model in Parisian apartment wearing evening gown',
      aspectRatio: 'portrait',
    },
    teaserVideo: 'https://cdn.coverr.co/videos/coverr-fashion-designers-1080p.mp4',
    launchDate: 'FW24',
  },
  {
    id: 'journey-craie',
    slug: 'craie-studio-desert-aurora',
    title: 'Craie Studio ? Desert Aurora',
    excerpt:
      'Slow-crafted leather objects staged in mirage landscapes to unveil the tactility of sustainable materials.',
    location: 'Merzouga, Morocco',
    accent: 'lilac',
    coverImage: {
      id: 'journey-craie-cover',
      kind: 'image',
      url: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1400&q=80',
      alt: 'Leather bags styled in desert dunes at sunset',
      aspectRatio: 'portrait',
    },
    teaserVideo: 'https://cdn.coverr.co/videos/coverr-desert-sand-waves-1080p.mp4',
    launchDate: 'Resort 24',
  },
  {
    id: 'journey-kaos',
    slug: 'kaos-art-of-motion',
    title: 'Kaos ? Art of Motion',
    excerpt:
      'Immersive movement studies captured in kinetic film to highlight adaptive athleisure silhouettes.',
    location: 'Barcelona, Spain',
    accent: 'rose',
    coverImage: {
      id: 'journey-kaos-cover',
      kind: 'image',
      url: 'https://images.unsplash.com/photo-1611043713578-9fba3499b2ae?auto=format&fit=crop&w=1400&q=80',
      alt: 'Dancer in contemporary athleisure outfit mid-motion',
      aspectRatio: 'portrait',
    },
    teaserVideo: 'https://cdn.coverr.co/videos/coverr-ballet-rehearsal-1080p.mp4',
    launchDate: 'Capsule 24',
  },
  {
    id: 'journey-vela',
    slug: 'vela-atelier-tidal',
    title: 'Vela Atelier ? Tidal Reverie',
    excerpt:
      'Pearlescent tailoring and biomaterial jewelry staged between tides for an ocean-positive couture capsule.',
    location: 'Biarritz, France',
    accent: 'peach',
    coverImage: {
      id: 'journey-vela-cover',
      kind: 'image',
      url: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1400&q=80',
      alt: 'Model wearing pearlescent suit on rocky coastline',
      aspectRatio: 'portrait',
    },
    launchDate: 'Cruise 25',
  },
  {
    id: 'journey-lumen',
    slug: 'lumen-studios-night-bloom',
    title: 'Lumen Studios ? Night Bloom',
    excerpt:
      'Infrared florals and light sculptures create a multi-sensory late-night showcase for experimental textiles.',
    location: 'Tokyo, Japan',
    accent: 'lilac',
    coverImage: {
      id: 'journey-lumen-cover',
      kind: 'image',
      url: 'https://images.unsplash.com/photo-1520916788318-3f97a6e45552?auto=format&fit=crop&w=1400&q=80',
      alt: 'Neon floral installation in dimly lit gallery',
      aspectRatio: 'portrait',
    },
    teaserVideo: 'https://cdn.coverr.co/videos/coverr-neon-flowers-1080p.mp4',
    launchDate: 'AW25',
  },
];
