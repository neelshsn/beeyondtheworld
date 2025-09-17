import type { ClientLogo, NarrativeSection } from '@/types/content';

export const conceptNarrative: NarrativeSection[] = [
  {
    id: 'innovative-solution',
    title: 'An Innovative Solution',
    description:
      'Beeyondtheworld orchestrates end-to-end campaign journeys for luxury fashion houses. We merge strategy, narrative design, and experiential production in one atelier.',
    bulletPoints: [
      'Creative labs blending data and intuition',
      'Immersive storytelling from pitch to retail floor',
      'Hybrid teams across Paris, Marrakech, and Lisbon',
    ],
    media: {
      id: 'innovative-solution-media',
      kind: 'image',
      url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1600&q=80',
      alt: 'Creative team curating mood board with pastel swatches',
      aspectRatio: 'landscape',
    },
  },
  {
    id: 'concept-methodology',
    title: 'Concept & Methodology',
    description:
      'Our methodology fuses editorial craft with hospitality-level service. Each brief is translated into a journey blueprint crossing content streams and client milestones.',
    bulletPoints: [
      'Signature 5-phase journey blueprint',
      'Editorial, experiential, and retail activations',
      'Real-time dashboards for campaign orchestration',
    ],
    media: {
      id: 'concept-methodology-media',
      kind: 'video',
      url: 'https://cdn.coverr.co/videos/coverr-fashion-studio-1080p.mp4',
      alt: 'Fashion studio with garments on rack',
    },
  },
  {
    id: 'csr-label',
    title: 'CSR Label & Sustainable Guidelines',
    description:
      'Our CSR label certifies regenerative practices across suppliers, travel, and material choices. Every journey is scored on impact, transparency, and inclusion.',
    bulletPoints: [
      'Eco-design protocols across production',
      'Low-impact travel and carbon tracking',
      'Supplier traceability & inclusivity benchmarks',
    ],
    media: {
      id: 'csr-label-media',
      kind: 'image',
      url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1600&q=80',
      alt: 'Hands stitching sustainable fabric',
      aspectRatio: 'landscape',
    },
  },
  {
    id: 'impacts-worldwide',
    title: 'Impacts Worldwide',
    description:
      'We activate audiences across continents with culturally sensitive teams. From Marrakech palaces to Seoul concept stores, each production embraces its locale.',
    bulletPoints: [
      'Global partner network in 18 cities',
      'Localized storytelling for each market',
      'Data dashboards measuring resonance',
    ],
    media: {
      id: 'impacts-worldwide-media',
      kind: 'image',
      url: 'https://images.unsplash.com/photo-1526481280695-3c4699d1cc87?auto=format&fit=crop&w=1600&q=80',
      alt: 'Global map projection with light trails',
      aspectRatio: 'landscape',
    },
  },
];

export const clientsTrusted: ClientLogo[] = [
  {
    name: 'Sahoma',
    logoUrl:
      'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=400&q=60',
  },
  {
    name: 'Grace & Mila',
    logoUrl:
      'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=400&q=60',
  },
  {
    name: 'Craie Studio',
    logoUrl:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=400&q=60',
  },
  {
    name: 'Kaos',
    logoUrl:
      'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=400&q=60',
  },
  {
    name: 'Chlo?',
    logoUrl:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=60',
  },
  {
    name: 'Maison Rabia',
    logoUrl:
      'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=400&q=60',
  },
];
