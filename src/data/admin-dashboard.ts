export type AdminKpi = {
  id: string;
  label: string;
  value: string;
  deltaLabel: string;
  trend: 'up' | 'down' | 'steady';
};

export type JourneyChecklistStep = {
  id: string;
  label: string;
  description: string;
  owner: string;
  due: string;
  completed?: boolean;
};

export type ProductionStage = {
  id: string;
  stage: 'pre-production' | 'production' | 'post-production';
  title: string;
  owner: string;
  due: string;
  status: 'on-track' | 'at-risk' | 'complete';
  notes: string;
  steps: JourneyChecklistStep[];
  links?: { label: string; href: string }[];
};

export type ClientJourneyRecord = {
  id: string;
  brand: string;
  pointOfContact: string;
  journeyName: string;
  currentPhase: 'pre-production' | 'production' | 'post-production';
  stageStatus: 'dreaming' | 'crafting' | 'delivering';
  productionWindow: string;
  nextMilestone: string;
  proposalLink: string;
  contractLink: string;
  deliverableLink: string;
  timezone: string;
};

export type TalentCluster = {
  id: string;
  region: string;
  anchorCities: string[];
  leadProducer: string;
  disciplines: string[];
  availability: 'now' | 'soon' | 'booking';
  currentJourneys: string[];
  rosterLink: string;
};

export type ProspectRecord = {
  id: string;
  brand: string;
  focus: string;
  stage: 'first-contact' | 'deck-sent' | 'budgeting' | 'awaiting-signature';
  owner: string;
  followUp: string;
  notes: string;
  deckLink?: string;
};

export type DeliverableRecord = {
  id: string;
  title: string;
  brand: string;
  journey: string;
  due: string;
  status: 'in-progress' | 'awaiting-approval' | 'delivered';
  link: string;
};

export type CastingRecord = {
  id: string;
  title: string;
  journey: string;
  date: string;
  location: string;
  status: 'open' | 'locked' | 'wrapped';
  notes: string;
  rosterLink: string;
};

export type FreelancerRecord = {
  id: string;
  name: string;
  role: string;
  region: string;
  availability: 'now' | 'soon' | 'booking';
  specialties: string[];
  activeJourneys: string[];
  dayRate: string;
  contact: string;
};

export const adminKpis: AdminKpi[] = [
  {
    id: 'active-journeys',
    label: 'Journeys in orbit',
    value: '12',
    deltaLabel: '+2 vs last lunar cycle',
    trend: 'up',
  },
  {
    id: 'live-campaigns',
    label: 'Campaign tales filming',
    value: '5',
    deltaLabel: 'Holding steady',
    trend: 'steady',
  },
  {
    id: 'casting-pool',
    label: 'Casting talents ready',
    value: '48',
    deltaLabel: '+6 confirmed this week',
    trend: 'up',
  },
  {
    id: 'contract-pending',
    label: 'Contracts awaiting glow-signature',
    value: '3',
    deltaLabel: 'Need follow-up before Friday',
    trend: 'down',
  },
];

export const productionPipeline: ProductionStage[] = [
  {
    id: 'pp-01',
    stage: 'pre-production',
    title: 'Philippines Turquoise Journey',
    owner: 'Alix (Journey Director)',
    due: '2025-10-08',
    status: 'on-track',
    notes: 'Scouting dream coves complete, palette lab final sign-off tomorrow.',
    steps: [
      {
        id: 'pp-01-step-1',
        label: 'Underwater lighting ritual',
        description: 'Finalize reef-safe lighting choreography with the dive unit.',
        owner: 'Kai • Lighting',
        due: 'Sep 18',
      },
      {
        id: 'pp-01-step-2',
        label: 'Reef guardian manifest',
        description: 'Confirm logistics manifest with reef guardians and impact lead.',
        owner: 'Maya • Impact',
        due: 'Sep 19',
      },
      {
        id: 'pp-01-step-3',
        label: 'Resortwear palette film',
        description: 'Send sunlit palette film to brand studio for approval.',
        owner: 'Alix',
        due: 'Sep 20',
      },
    ],
    links: [
      { label: 'Journey blueprint', href: '#journey-blueprint-philippines' },
      { label: 'Creative deck', href: '#creative-deck-philippines' },
    ],
  },
  {
    id: 'pp-02',
    stage: 'pre-production',
    title: 'Cyclades Milos Odyssey',
    owner: 'Mina (Prospection Lead)',
    due: '2025-09-22',
    status: 'at-risk',
    notes: 'Waiting on harbor permit confirmation; backup terrace locations shortlisted.',
    steps: [
      {
        id: 'pp-02-step-1',
        label: 'Harbor permit quest',
        description: 'Secure Klima harbor drift permit with local authorities.',
        owner: 'Mina',
        due: 'Sep 17',
      },
      {
        id: 'pp-02-step-2',
        label: 'Soundscape sourcing',
        description: 'Lock bouzouki x synth sound designer for sunset dinners.',
        owner: 'Theo • Audio',
        due: 'Sep 18',
      },
      {
        id: 'pp-02-step-3',
        label: 'Palette kit prep',
        description: 'Ship Cycladic palette immersion kit to client HQ.',
        owner: 'Gemma • Experience',
        due: 'Sep 19',
      },
    ],
    links: [{ label: 'Permit tracker', href: '#permit-tracker-cyclades' }],
  },
  {
    id: 'prod-01',
    stage: 'production',
    title: 'Maradji - Salt Breeze Chapters',
    owner: 'Jonas (On-site Producer)',
    due: '2025-09-18',
    status: 'on-track',
    notes: 'Day 02 captured golden calas; sea breeze sequences synced to vault.',
    steps: [
      {
        id: 'prod-01-step-1',
        label: 'Pine grove drift',
        description: 'Capture handheld pine grove story at 06:00 golden window.',
        owner: 'Jonas',
        due: 'Sep 17',
      },
      {
        id: 'prod-01-step-2',
        label: 'Live guitarist loop',
        description: 'Record guitarist loop for hero reel underscore.',
        owner: 'Sasha • Audio',
        due: 'Sep 17',
      },
      {
        id: 'prod-01-step-3',
        label: 'Drone sync',
        description: 'Sync drone rushes and label by cala + outfit.',
        owner: 'Miro • DIT',
        due: 'Sep 18',
      },
    ],
    links: [
      { label: 'Shot log', href: '#shot-log-maradji' },
      { label: 'Daily selects', href: '#daily-selects-maradji' },
    ],
  },
  {
    id: 'prod-02',
    stage: 'production',
    title: 'Craie Studio - Atlas Mirage',
    owner: 'Salma (Field Lead)',
    due: '2025-09-21',
    status: 'at-risk',
    notes: 'Need backup lantern rig for rooftop finale; fabric supplier ETA pending.',
    steps: [
      {
        id: 'prod-02-step-1',
        label: 'Lantern switch',
        description: 'Secure replacement lantern rig via Marrakech atelier.',
        owner: 'Salma',
        due: 'Sep 16',
      },
      {
        id: 'prod-02-step-2',
        label: 'Nomad macro suite',
        description: 'Shoot nomad tent macro textures and leather altars by 14:00.',
        owner: 'Lina • Photo',
        due: 'Sep 17',
      },
      {
        id: 'prod-02-step-3',
        label: 'Gnawa stems',
        description: 'Gather Gnawa rhythm stems for sound design hand-off.',
        owner: 'Hakim • Audio',
        due: 'Sep 18',
      },
    ],
  },
  {
    id: 'post-01',
    stage: 'post-production',
    title: 'Almaaz - Wild Canopy Kenya',
    owner: 'Livia (Post Producer)',
    due: '2025-09-25',
    status: 'on-track',
    notes: 'Dusk fire ritual cut locked; awaiting color pass from Nairobi suite.',
    steps: [
      {
        id: 'post-01-step-1',
        label: 'Jungle grade',
        description: 'Grade jungle dawn sequences using ember LUT.',
        owner: 'Yara • Color',
        due: 'Sep 19',
      },
      {
        id: 'post-01-step-2',
        label: 'Ambisonic mix',
        description: 'Design ambisonic mix capturing fireside whispers.',
        owner: 'Leo • Audio',
        due: 'Sep 21',
      },
      {
        id: 'post-01-step-3',
        label: 'Press stills suite',
        description: 'Assemble press stills package and send for verification.',
        owner: 'Livia',
        due: 'Sep 22',
      },
    ],
    links: [
      { label: 'Hero edit v3', href: '#hero-edit-almaaz' },
      { label: 'Color LUT folder', href: '#lut-folder-almaaz' },
    ],
  },
  {
    id: 'post-02',
    stage: 'post-production',
    title: 'Mallorca Iberian Light Studio',
    owner: 'Diego (Edit Lead)',
    due: '2025-09-30',
    status: 'complete',
    notes: 'Master exports delivered; awaiting brand confirmation for VR preview.',
    steps: [
      {
        id: 'post-02-step-1',
        label: 'QA immersive gallery',
        description: 'Quality check interactive gallery links and labels.',
        owner: 'Naomi • PM',
        due: 'Sep 19',
        completed: true,
      },
      {
        id: 'post-02-step-2',
        label: 'Playlist archive',
        description: 'Upload Iberian sound stems to sonic archive.',
        owner: 'Diego',
        due: 'Sep 20',
        completed: true,
      },
      {
        id: 'post-02-step-3',
        label: 'Dream log recap',
        description: 'Prepare dream log recap PDF for brand team.',
        owner: 'Diego',
        due: 'Sep 21',
      },
    ],
  },
];

export const clientJourneyRecords: ClientJourneyRecord[] = [
  {
    id: 'client-aurora',
    brand: 'Aurora Atelier',
    pointOfContact: 'Soline Armand',
    journeyName: 'Philippines Turquoise Journey',
    currentPhase: 'pre-production',
    stageStatus: 'dreaming',
    productionWindow: 'Oct 6 - Oct 18',
    nextMilestone: 'Palette lab approval (Sep 20)',
    proposalLink: '#aurora-proposal',
    contractLink: '#aurora-contract',
    deliverableLink: '#aurora-deliverables',
    timezone: 'Paris (UTC+2)',
  },
  {
    id: 'client-lumen',
    brand: 'Lumen Archive',
    pointOfContact: 'Diego Rivas',
    journeyName: 'Cyclades Milos Odyssey',
    currentPhase: 'pre-production',
    stageStatus: 'dreaming',
    productionWindow: 'Sep 28 - Oct 5',
    nextMilestone: 'Harbor permit confirmation',
    proposalLink: '#lumen-proposal',
    contractLink: '#lumen-contract',
    deliverableLink: '#lumen-deliverables',
    timezone: 'Madrid (UTC+2)',
  },
  {
    id: 'client-solstice',
    brand: 'Solstice Collective',
    pointOfContact: 'Eva Martins',
    journeyName: 'Maradji - Salt Breeze Chapters',
    currentPhase: 'production',
    stageStatus: 'crafting',
    productionWindow: 'Sep 14 - Sep 20',
    nextMilestone: 'Day 3 kinetic cliff capture',
    proposalLink: '#solstice-proposal',
    contractLink: '#solstice-contract',
    deliverableLink: '#solstice-deliverables',
    timezone: 'Lisbon (UTC+1)',
  },
  {
    id: 'client-orbit',
    brand: 'Orbit Jewelry',
    pointOfContact: 'Veronica Achieng',
    journeyName: 'Almaaz - Wild Canopy Kenya',
    currentPhase: 'post-production',
    stageStatus: 'delivering',
    productionWindow: 'Sep 1 - Sep 10',
    nextMilestone: 'Grade sign-off (Sep 23)',
    proposalLink: '#orbit-proposal',
    contractLink: '#orbit-contract',
    deliverableLink: '#orbit-deliverables',
    timezone: 'Nairobi (UTC+3)',
  },
];

export const talentClusters: TalentCluster[] = [
  {
    id: 'talent-asean',
    region: 'Southeast Asia',
    anchorCities: ['Manila', 'Siargao', 'Cebu'],
    leadProducer: 'Aya Santos',
    disciplines: ['Underwater cinematography', 'Sound alchemy', 'Resortwear styling'],
    availability: 'now',
    currentJourneys: ['Philippines Turquoise Journey'],
    rosterLink: '#talent-asean',
  },
  {
    id: 'talent-mediterranean',
    region: 'Mediterranean',
    anchorCities: ['Ibiza', 'Marrakech', 'Athens'],
    leadProducer: 'Marcelo Tixier',
    disciplines: ['Steadicam & drone', 'Sunrise color science', 'Culinary scenography'],
    availability: 'soon',
    currentJourneys: ['Maradji - Salt Breeze Chapters', 'Cyclades Milos Odyssey'],
    rosterLink: '#talent-mediterranean',
  },
  {
    id: 'talent-africa',
    region: 'East Africa',
    anchorCities: ['Nairobi', 'Mombasa', 'Kisumu'],
    leadProducer: 'Nyawira Kamau',
    disciplines: ['Documentary portraiture', 'Wildlife logistics', 'Cultural diplomacy'],
    availability: 'booking',
    currentJourneys: ['Almaaz - Wild Canopy Kenya'],
    rosterLink: '#talent-africa',
  },
  {
    id: 'talent-americas',
    region: 'Americas',
    anchorCities: ['Mexico City', 'New York', 'Montreal'],
    leadProducer: 'Nico Duarte',
    disciplines: ['Sound design', 'Experiential lighting', 'Immersive set builds'],
    availability: 'now',
    currentJourneys: ['Prairie Aurora Concept Pitch'],
    rosterLink: '#talent-americas',
  },
];

export const prospectRecords: ProspectRecord[] = [
  {
    id: 'prospect-eden',
    brand: 'Eden Nomade',
    focus: 'Nomadic resortwear awakening Marrakech x Madeira',
    stage: 'deck-sent',
    owner: 'Mina',
    followUp: 'Sep 19 - schedule immersion call',
    notes: 'Creative director adored dune lantern concept; awaiting budget rework.',
    deckLink: '#eden-deck',
  },
  {
    id: 'prospect-lux',
    brand: 'Lux Thalassa',
    focus: 'Immersive thalasso storytelling in Milos & Hydra',
    stage: 'first-contact',
    owner: 'Chloé',
    followUp: 'Sep 17 - send sensory moodfilm',
    notes: 'Needs proof of ocean-positive logistics.',
  },
  {
    id: 'prospect-voyageur',
    brand: 'Voyageur Atelier',
    focus: 'Snow to desert seasonal campaign',
    stage: 'budgeting',
    owner: 'Matteo',
    followUp: 'Sep 22 - budget alignment',
    notes: 'Finance reviewing dual-continent plan; prepping modular proposal.',
    deckLink: '#voyageur-deck',
  },
  {
    id: 'prospect-halo',
    brand: 'Halo Ceramics',
    focus: 'Lisbon x Kyoto craftsmanship story',
    stage: 'awaiting-signature',
    owner: 'Aya',
    followUp: 'Sep 16 - legal check-in',
    notes: 'CEO ready to sign pending insurance clause update.',
    deckLink: '#halo-contract',
  },
];

export const deliverableRecords: DeliverableRecord[] = [
  {
    id: 'deliverable-almaaz-film',
    title: 'Wild Canopy Hero Film',
    brand: 'Orbit Jewelry',
    journey: 'Almaaz - Wild Canopy Kenya',
    due: '2025-09-25',
    status: 'in-progress',
    link: '#deliverable-almaaz-film',
  },
  {
    id: 'deliverable-maradji-lookbook',
    title: 'Salt Breeze Lookbook Suite',
    brand: 'Solstice Collective',
    journey: 'Maradji - Salt Breeze Chapters',
    due: '2025-09-27',
    status: 'awaiting-approval',
    link: '#deliverable-maradji-lookbook',
  },
  {
    id: 'deliverable-philippines-press',
    title: 'Turquoise Journey Press Portal',
    brand: 'Aurora Atelier',
    journey: 'Philippines Turquoise Journey',
    due: '2025-10-05',
    status: 'in-progress',
    link: '#deliverable-philippines-press',
  },
  {
    id: 'deliverable-mallorca-vr',
    title: 'Iberian Light VR Preview',
    brand: 'Lumen Archive',
    journey: 'Mallorca Iberian Light Studio',
    due: '2025-09-30',
    status: 'delivered',
    link: '#deliverable-mallorca-vr',
  },
];

export const castingRecords: CastingRecord[] = [
  {
    id: 'casting-ibiza',
    title: 'Maradji Coastal Casting',
    journey: 'Maradji - Salt Breeze Chapters',
    date: '2025-09-16',
    location: 'Ibiza - Cala Comte Studio',
    status: 'locked',
    notes: '12 talents confirmed, backup weather day reserved.',
    rosterLink: '#casting-ibiza',
  },
  {
    id: 'casting-kenya',
    title: 'Almaaz Fireside Voices',
    journey: 'Almaaz - Wild Canopy Kenya',
    date: '2025-09-18',
    location: 'Nairobi - Karura Forest Loft',
    status: 'open',
    notes: 'Local poets shortlisted; Veronica leading mentorship circle.',
    rosterLink: '#casting-kenya',
  },
  {
    id: 'casting-milos',
    title: 'Cyclades Muse Sessions',
    journey: 'Cyclades Milos Odyssey',
    date: '2025-09-24',
    location: 'Milos - Klima Boathouse',
    status: 'open',
    notes: 'Need multilingual host; remote wardrobe preview on Sep 19.',
    rosterLink: '#casting-milos',
  },
  {
    id: 'casting-philippines',
    title: 'Turquoise Journey Movement Study',
    journey: 'Philippines Turquoise Journey',
    date: '2025-09-28',
    location: 'Manila - Bahay Creative Hub',
    status: 'wrapped',
    notes: 'Choreography locked; recordings stored in dream vault.',
    rosterLink: '#casting-philippines',
  },
];

export const freelancerRecords: FreelancerRecord[] = [
  {
    id: 'freelancer-aya',
    name: 'Aya Santos',
    role: 'Journey Producer',
    region: 'Southeast Asia',
    availability: 'now',
    specialties: ['Underwater logistics', 'Eco impact rituals', 'Local partnerships'],
    activeJourneys: ['Philippines Turquoise Journey'],
    dayRate: '€620',
    contact: 'aya@beeyondtheworld.com',
  },
  {
    id: 'freelancer-lina',
    name: 'Lina Marquez',
    role: 'Director of Photography',
    region: 'Mediterranean',
    availability: 'soon',
    specialties: ['Anamorphic sunrise capture', 'Handheld choreography', 'Drone piloting'],
    activeJourneys: ['Maradji - Salt Breeze Chapters'],
    dayRate: '€780',
    contact: 'lina@beeyondtheworld.com',
  },
  {
    id: 'freelancer-nyawira',
    name: 'Nyawira Kamau',
    role: 'Cultural Diplomat',
    region: 'East Africa',
    availability: 'booking',
    specialties: ['Community salons', 'Casting mentorship', 'Impact reporting'],
    activeJourneys: ['Almaaz - Wild Canopy Kenya'],
    dayRate: '€540',
    contact: 'nyawira@beeyondtheworld.com',
  },
  {
    id: 'freelancer-nico',
    name: 'Nico Duarte',
    role: 'Sound Designer',
    region: 'Americas',
    availability: 'now',
    specialties: ['Ambisonic field capture', 'Music direction', 'Immersive playback'],
    activeJourneys: ['Cyclades Milos Odyssey'],
    dayRate: '€680',
    contact: 'nico@beeyondtheworld.com',
  },
];
