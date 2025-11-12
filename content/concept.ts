export type ConceptNodeId =
  | 'coTravel'
  | 'sustainability'
  | 'rseLabel'
  | 'talentNetwork'
  | 'deliverContent';

type ConceptMedia = {
  src: string;
  alt: string;
};

export type ConceptNodeCTA = {
  label: string;
  href: string;
};

export type ConceptContent = {
  id: ConceptNodeId;
  title: string;
  lead: string;
  bullets?: string[];
  media?: ConceptMedia[];
  ctas?: ConceptNodeCTA[];
};

export type BeeMetaphorToken =
  | 'flightPath'
  | 'leafDrop'
  | 'shield'
  | 'heartGlobe'
  | 'network'
  | 'honey';

export type ConceptIconToken = 'Bee' | 'Leaf' | 'Shield' | 'HeartGlobe' | 'Network' | 'Honey';

export type ConceptDetailCard = {
  icon: ConceptIconToken;
  description: string;
};

export type ConceptNode = ConceptContent & {
  beeMetaphor: BeeMetaphorToken;
  icon: ConceptIconToken;
  accent?: string;
  cards: ConceptDetailCard[];
};

export const conceptNodes: ConceptNode[] = [
  {
    id: 'coTravel',
    title: 'Journey alliances',
    lead: 'We weave non-competing brands into shared journeys so every path lightens fixed costs and footprint while guarding each tale as something intimate and rare.',
    bullets: [
      'Journey composers choreograph multi-country routes that maximise sets and minimise transfers',
      'Shared logistics, tech, and hospitality slash resource waste without blurring brand constellations',
      'Each brand receives exclusive casting and art direction to protect signature aesthetics',
    ],
    cards: [
      {
        icon: 'Bee',
        description:
          'Playbooks stitch multiple brands onto one regenerative route without compromises.',
      },
      {
        icon: 'Network',
        description:
          'Cross-brand sprints align producers while keeping briefs confidential and non-competitive.',
      },
      {
        icon: 'Honey',
        description:
          'Dedicated creative pods secure exclusive models, styling, and narrative arcs per brand.',
      },
    ],
    beeMetaphor: 'flightPath',
    icon: 'Bee',
    accent: 'honey-500',
    ctas: [
      { label: 'Book orchestration workshop', href: '/contact' },
      { label: 'Browse signature journeys', href: '/journeys' },
    ],
  },
  {
    id: 'sustainability',
    title: 'Sustainable world ateliers',
    lead: 'Every co-travel journey becomes proof of environmental and societal care - circular operations, local alliances, and regenerative outputs you can feel and measure.',
    bullets: [
      'Circular economy protocols repurpose sets, wardrobe, energy sources, and transport legs',
      'We foreground local associations and initiatives on camera so their stories travel with the campaign',
      'Shooting with us means funding climate and community programs attached to each itinerary',
    ],
    cards: [
      {
        icon: 'Leaf',
        description: 'Lifecycle audits chart sourcing, fabrication, reuse, and donation flows.',
      },
      {
        icon: 'Bee',
        description: 'Local guilds curate artisans, NGOs, and regenerative projects at every stop.',
      },
      {
        icon: 'HeartGlobe',
        description:
          'Impact dashboards translate carbon, biodiversity, and social gains into shareable proof.',
      },
    ],
    media: [
      {
        src: '/assets/concept/sustainable-poster.png',
        alt: 'Abstract golden gradient representing regenerative energy',
      },
    ],
    beeMetaphor: 'leafDrop',
    icon: 'Leaf',
    accent: 'leaf-500',
    ctas: [
      { label: 'Meet the sustainability lab', href: '/contact' },
      { label: 'See regenerative campaigns', href: '/campaigns' },
    ],
  },
  {
    id: 'rseLabel',
    title: 'CSR label guardianship',
    lead: 'The Beeyondtheworld CSR label certifies that every frame witnesses circular practices and local reinvestment - shoot with us and you visibly contribute to the evolution of the world.',
    bullets: [
      'Tiered scoring covers climate footprint, social inclusion, and cultural legacy',
      'Compliance rooms share live evidence with brand constellations and partners',
      'Revenue-sharing matrices feed grassroots associations in each territory',
      'Impact dashboards and editorial capsules broadcast the commitments made on set',
    ],
    cards: [
      {
        icon: 'Shield',
        description:
          'Tiered scoring frames every brand promise across footprint, people, and legacy.',
      },
      {
        icon: 'HeartGlobe',
        description: 'Compliance rooms and open dashboards let stakeholders track progress live.',
      },
      {
        icon: 'Bee',
        description:
          'Partner onboarding kits align brands with EU due diligence and circular mandates.',
      },
      {
        icon: 'Network',
        description:
          'Stakeholder salons co-write charters that bind brands and local initiatives together.',
      },
      {
        icon: 'Honey',
        description:
          'Editorial capsules turn raw metrics into inspiring stories for press and patrons.',
      },
    ],
    beeMetaphor: 'shield',
    icon: 'Shield',
    accent: 'clay-500',
    ctas: [
      { label: 'Request CSR hive audit', href: '/contact' },
      { label: 'Review compliance playbooks', href: '/client' },
      { label: 'Plan partnership charter', href: '/contact' },
      { label: 'Explore diplomacy case studies', href: '/campaigns' },
    ],
  },
  {
    id: 'talentNetwork',
    title: 'Global talent collective',
    lead: 'We unite world-class creatives with standout local talents, guiding each contributor through rigorous care so their craft flourishes without compromise.',
    bullets: [
      'International scout cells secure the highest calibre directors, image makers, and storytellers',
      'Local casting windows elevate emerging voices and give on-the-ground talents a global stage',
      'Talent care programs cover coaching, legal, and wellbeing while protecting creative freedom',
    ],
    cards: [
      {
        icon: 'Network',
        description:
          'Dynamic rosters match brands with seasoned experts and fresh local discoveries.',
      },
      {
        icon: 'Bee',
        description:
          'Mentorship frameworks guide each talent through fittings, rehearsals, and delivery.',
      },
      {
        icon: 'HeartGlobe',
        description:
          'Cultural stewards ensure community insight feeds the creative process from start to finish.',
      },
    ],
    beeMetaphor: 'network',
    icon: 'Network',
    accent: 'pollen-500',
    ctas: [
      { label: 'Engage the talent network', href: '/contact' },
      { label: 'Review collective roster', href: '/client' },
    ],
  },
  {
    id: 'deliverContent',
    title: 'The honey',
    lead: 'Our visuals arrive rich, plentiful, and fast - hero films and photography suites ready to deploy across campaign, retail, and press windows.',
    bullets: [
      'Hero films, lookbooks, motion loops, and BTS drops bundled for launch',
      'Express finishing schedules deliver colour, sound, and retouching within days',
      'Asset libraries tailored to e-commerce, PR kits, and experiential previews',
    ],
    cards: [
      {
        icon: 'Honey',
        description: 'Modular asset libraries keep omni-channel stories perfectly aligned.',
      },
      {
        icon: 'Bee',
        description:
          'Preview studios refine edits, copy, and sound so deliveries drop while buzz is high.',
      },
      {
        icon: 'Shield',
        description: 'Roll-out playbooks equip brand teams to extend the voice across touchpoints.',
      },
    ],
    beeMetaphor: 'honey',
    icon: 'Honey',
    accent: 'honey-600',
    ctas: [
      { label: 'Launch omni-channel roadmap', href: '/contact' },
      { label: 'View content toolkits', href: '/campaigns' },
    ],
  },
];
