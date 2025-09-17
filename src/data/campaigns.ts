import type { CampaignDetail } from '@/types/content';

export const campaignsSeed: CampaignDetail[] = [
  {
    id: 'campaign-sahoma',
    slug: 'sahoma-azure-mosaic',
    title: 'Sahoma ? Azure Mosaic',
    heroVideo: 'https://cdn.coverr.co/videos/coverr-sunlit-fashion-collection-1080p.mp4',
    heroPoster:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1800&q=80',
    gallery: [
      {
        id: 'sahoma-gallery-1',
        kind: 'image',
        url: 'https://images.unsplash.com/photo-1520976177868-4e0b0a17aa78?auto=format&fit=crop&w=1600&q=80',
        alt: 'Model wearing hand-loomed jacquard dress',
        aspectRatio: 'portrait',
      },
      {
        id: 'sahoma-gallery-2',
        kind: 'image',
        url: 'https://images.unsplash.com/photo-1475180098004-ca77a66827be?auto=format&fit=crop&w=1600&q=80',
        alt: 'Accessories styled on marble table',
        aspectRatio: 'square',
      },
      {
        id: 'sahoma-gallery-3',
        kind: 'video',
        url: 'https://cdn.coverr.co/videos/coverr-fashion-editorial-1080p.mp4',
        alt: 'Behind the scenes Riviera shoot',
      },
    ],
    context: [
      {
        heading: 'Story',
        body: "We transformed Sahoma's resort capsule into a synesthetic journey across the Mediterranean. Sculptural sets and analog film lenses captured the shimmer of sea glass and artisanal jacquards.",
      },
      {
        heading: 'Activation',
        body: 'A three-chapter release combined editorial films, pop-up terraces in Capri, and an immersive digital showroom with live styling appointments.',
      },
    ],
    credits: [
      { role: 'Creative Direction', value: 'Beeyondtheworld Studio' },
      { role: 'Photography', value: 'Salom? Rami' },
      { role: 'Set Design', value: 'Atelier ?clat' },
      { role: 'Sound Design', value: 'Ondes Claires' },
    ],
    impactHighlights: [
      '57% growth in DTC pre-orders during launch week',
      'Carbon-offset production and regenerative textile partners',
      'Immersive showroom converted 34 VIP buyers',
    ],
    callToAction: {
      label: 'Request the full case study',
      href: 'mailto:hello@beeyondtheworld.com?subject=Sahoma%20Azure%20Mosaic',
    },
  },
  {
    id: 'campaign-grace',
    slug: 'grace-mila-gilded-light',
    title: 'Grace & Mila ? Gilded Light',
    heroVideo: 'https://cdn.coverr.co/videos/coverr-dancing-on-the-rooftop-1080p.mp4',
    heroPoster:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1800&q=80',
    gallery: [
      {
        id: 'grace-gallery-1',
        kind: 'image',
        url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80',
        alt: 'Golden hour portrait with shimmering gown',
        aspectRatio: 'portrait',
      },
      {
        id: 'grace-gallery-2',
        kind: 'video',
        url: 'https://cdn.coverr.co/videos/coverr-fine-art-fashion-1080p.mp4',
        alt: 'Fine art inspired choreography',
      },
      {
        id: 'grace-gallery-3',
        kind: 'image',
        url: 'https://images.unsplash.com/photo-1505685296765-3a2736de412f?auto=format&fit=crop&w=1600&q=80',
        alt: 'Detail shot of couture embellishments',
        aspectRatio: 'portrait',
      },
    ],
    context: [
      {
        heading: 'Narrative',
        body: 'A candlelit salon in Paris became an intimate stage for celebrating the savoir-faire of Grace & Mila. Light sculptures mapped the heartbeat of the collection.',
      },
      {
        heading: 'Experience',
        body: 'Collectors entered through a scent chamber, watched the live tableau, and unlocked limited audio stories via NFC-embedded invitations.',
      },
    ],
    credits: [
      { role: 'Film Direction', value: 'No?mie Duval' },
      { role: 'Lighting Design', value: 'Studio Halo' },
      { role: 'Choreography', value: 'Maison Mouvement' },
      { role: 'Styling', value: 'Grace & Mila Studio' },
    ],
    impactHighlights: [
      'Secured 12 international stockists',
      'Saved 2.1 tons CO? via adaptive set reuse',
      'Interactive invitations reached 92% RSVP rate',
    ],
    callToAction: {
      label: 'Book a creative session',
      href: 'mailto:hello@beeyondtheworld.com?subject=Grace%20%26%20Mila%20Gilded%20Light',
    },
  },
  {
    id: 'campaign-craie',
    slug: 'craie-studio-desert-aurora',
    title: 'Craie Studio ? Desert Aurora',
    heroVideo: 'https://cdn.coverr.co/videos/coverr-desert-wanderer-1080p.mp4',
    heroPoster:
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1800&q=80',
    gallery: [
      {
        id: 'craie-gallery-1',
        kind: 'image',
        url: 'https://images.unsplash.com/photo-1475180098004-ca77a66827be?auto=format&fit=crop&w=1600&q=80',
        alt: 'Leather bag with artisanal stitching',
        aspectRatio: 'portrait',
      },
      {
        id: 'craie-gallery-2',
        kind: 'video',
        url: 'https://cdn.coverr.co/videos/coverr-desert-ridge-1080p.mp4',
        alt: 'Drone shot across desert ridge',
      },
      {
        id: 'craie-gallery-3',
        kind: 'image',
        url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=80',
        alt: 'Silhouette in dunes during twilight',
        aspectRatio: 'portrait',
      },
    ],
    context: [
      {
        heading: 'Insight',
        body: "We leaned into Craie Studio's craft legacy by staging their pieces as relics emerging from mirage-like architectures.",
      },
      {
        heading: 'Format',
        body: 'A collection film, immersive AR experience, and tactile showroom materials allowed buyers to feel the textures remotely.',
      },
    ],
    credits: [
      { role: 'Set Architecture', value: 'Terre Atelier' },
      { role: 'Soundscape', value: 'Nomad Echo' },
      { role: 'Photography', value: 'Lina Al-Kamal' },
      { role: 'Production', value: 'Beeyondtheworld' },
    ],
    impactHighlights: [
      '42% uplift in social engagement',
      'Certified Fair Trade supply chain spotlight',
      'First AR showroom for the brand',
    ],
    callToAction: {
      label: 'Download the project deck',
      href: '/pdfs/BEE-DECK.pdf',
    },
  },
  {
    id: 'campaign-kaos',
    slug: 'kaos-art-of-motion',
    title: 'Kaos ? Art of Motion',
    heroVideo: 'https://cdn.coverr.co/videos/coverr-contemporary-dance-1080p.mp4',
    heroPoster:
      'https://images.unsplash.com/photo-1611043713578-9fba3499b2ae?auto=format&fit=crop&w=1800&q=80',
    gallery: [
      {
        id: 'kaos-gallery-1',
        kind: 'image',
        url: 'https://images.unsplash.com/photo-1519744346363-dc63c9b5de58?auto=format&fit=crop&w=1600&q=80',
        alt: 'Dancer wearing adaptive athleisure',
        aspectRatio: 'portrait',
      },
      {
        id: 'kaos-gallery-2',
        kind: 'video',
        url: 'https://cdn.coverr.co/videos/coverr-contemporary-dancer-1080p.mp4',
        alt: 'Slow motion footage of contemporary dancer',
      },
      {
        id: 'kaos-gallery-3',
        kind: 'image',
        url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=80',
        alt: 'Neon-lit runway',
        aspectRatio: 'portrait',
      },
    ],
    context: [
      {
        heading: 'Concept',
        body: 'We partnered with movement scientists to map garments onto dancers, translating kinetic data into light.',
      },
      {
        heading: 'Tour',
        body: 'A traveling installation visited four flagship stores with VR rehearsals and adaptive fitting experiences.',
      },
    ],
    credits: [
      { role: 'Movement Direction', value: 'Kaos Labs' },
      { role: 'VR Production', value: 'Studio Motion' },
      { role: 'Spatial Design', value: 'Forma Collective' },
      { role: 'Music', value: 'Aural Bloom' },
    ],
    impactHighlights: [
      'Captured 18M organic impressions',
      'Reduced sample waste by 37%',
      'Drove 3x membership sign-ups',
    ],
    callToAction: {
      label: 'Schedule a journey workshop',
      href: 'mailto:hello@beeyondtheworld.com?subject=Kaos%20Art%20of%20Motion',
    },
  },
];
