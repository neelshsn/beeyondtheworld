export const ecosystemScopes = ['studio', 'demo'] as const;
export type EcosystemScope = (typeof ecosystemScopes)[number];

export const ecosystemRoles = ['creator', 'commercial', 'bee', 'curator', 'production'] as const;
export type EcosystemRole = (typeof ecosystemRoles)[number];
export type StaffRole = 'bee' | 'curator' | 'production';

export const creatorStatuses = [
  'requested',
  'review',
  'approved',
  'active',
  'declined',
  'suspended',
] as const;
export type CreatorStatus = (typeof creatorStatuses)[number];

export type CreatorApplication = {
  id: string;
  scope: EcosystemScope;
  userId: string | null;
  email: string;
  displayName: string;
  homeDestination: string;
  portfolioUrl: string;
  biography: string;
  languages: string[];
  coveredDestinations: string[];
  status: CreatorStatus;
  royaltyRateBps: 200;
  royaltyStatus: 'proposed_to_contract';
  contractReference: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type Destination = {
  id: string;
  scope: EcosystemScope;
  title: string;
  country: string;
  territory: string;
  description: string;
  creativeDirectionApproved: boolean;
  productionApproved: boolean;
  globalBudgetReference: string;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export const assetSlots = ['hero', 'reel', 'photo'] as const;
export type AssetSlot = (typeof assetSlots)[number];
export const assetStatuses = [
  'draft',
  'submitted',
  'studio_review',
  'needs_replacement',
  'rejected',
  'approved',
  'published',
] as const;
export type AssetStatus = (typeof assetStatuses)[number];
export type ReviewGate = 'pending' | 'approved' | 'rejected';

export type AssetKit = {
  id: string;
  scope: EcosystemScope;
  destinationId: string;
  title: string;
  status: 'draft' | 'in_review' | 'ready' | 'published';
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type CreativeAsset = {
  id: string;
  scope: EcosystemScope;
  kitId: string;
  destinationId: string;
  creatorId: string | null;
  slot: AssetSlot;
  slotIndex: number;
  title: string;
  description: string;
  location: string;
  credit: string;
  rightsSummary: string;
  rightsEvidence: string;
  rightsScope: 'brand_presentation' | 'public_journeys';
  rightsExpiresAt: string | null;
  originalSourceUrl: string;
  aiDisclosure: 'none_declared' | 'retouching_only' | 'ai_assisted' | 'ai_generated';
  softFadeConsent: boolean;
  width: number | null;
  height: number | null;
  mediaId: string | null;
  publicMediaId: string | null;
  durationSeconds: number | null;
  status: AssetStatus;
  authenticity: ReviewGate;
  rights: ReviewGate;
  safety: ReviewGate;
  humanCreative: ReviewGate;
  reviewNote: string;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export const partnerTypes = [
  'association',
  'territorial',
  'hospitality',
  'food',
  'transport',
  'guide',
  'artisan',
  'venue',
  'local_producer',
] as const;
export type PartnerType = (typeof partnerTypes)[number];
export const partnerStatuses = [
  'discovered',
  'under_review',
  'internally_verified',
  'impact_documented',
  'ready_to_sell',
] as const;
export type PartnerStatus = (typeof partnerStatuses)[number];
export const collaborationTypes = ['paid', 'content_exchange', 'mixed'] as const;
export type CollaborationType = (typeof collaborationTypes)[number];

export type LocalPartner = {
  id: string;
  scope: EcosystemScope;
  destinationId: string;
  name: string;
  type: PartnerType;
  description: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  collaborationType: CollaborationType;
  exchangeValueAmount: number | null;
  exchangeTerms: string;
  deliverables: string;
  status: PartnerStatus;
  evidenceReference: string;
  quoteReference: string;
  budgetAmount: number | null;
  budgetCurrency: string;
  availabilityNote: string;
  safetyNote: string;
  productionValidated: boolean;
  impactNote: string;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export const ecosystemEntityTypes = ['creator', 'destination', 'asset', 'kit', 'partner'] as const;
export type EcosystemEntityType = (typeof ecosystemEntityTypes)[number];
export const ecosystemTargetTypes = [
  'talent',
  'content',
  'collection',
  'project',
  'company',
  'opportunity',
  'production',
  'journey',
  'booking',
] as const;
export type EcosystemTargetType = (typeof ecosystemTargetTypes)[number];

export type EcosystemLink = {
  id: string;
  scope: EcosystemScope;
  entityType: EcosystemEntityType;
  entityId: string;
  targetType: EcosystemTargetType;
  targetId: string;
  label: string;
  createdAt: string;
};

export type EcosystemTargetOption = {
  type: EcosystemTargetType;
  id: string;
  label: string;
  companyId?: string;
};

export type KitReadiness = {
  ready: boolean;
  approved: number;
  required: 14;
  missing: string[];
  invalid: string[];
};

export type DestinationReadiness = {
  ready: boolean;
  checks: {
    creativeKit: boolean;
    creativeDirection: boolean;
    transport: boolean;
    food: boolean;
    accommodation: boolean;
    impactBudget: boolean;
    availabilityAndSafety: boolean;
    globalBudget: boolean;
    headOfProduction: boolean;
  };
  missing: string[];
};

export type EcosystemViewer = {
  role: EcosystemRole;
  scope: EcosystemScope;
  email: string;
  canSwitchDemoRole: boolean;
};

export type EcosystemSnapshot = {
  viewer: EcosystemViewer;
  applications: CreatorApplication[];
  destinations: Destination[];
  kits: AssetKit[];
  assets: CreativeAsset[];
  partners: LocalPartner[];
  links: EcosystemLink[];
  targetOptions: EcosystemTargetOption[];
  readiness: Record<string, KitReadiness>;
  destinationReadiness: Record<string, DestinationReadiness>;
  crm: null | {
    companies: { id: string; name: string }[];
    opportunities: { id: string; companyId: string; title: string; stage: string }[];
    productions: {
      id: string;
      companyId: string;
      opportunityId: string;
      title: string;
      status: string;
    }[];
  };
};

export type EcosystemConnectionSummary = {
  viewer: EcosystemViewer;
  summary: {
    filter: {
      companyId: string | null;
      productionId: string | null;
      journeyId: string | null;
      bookingId: string | null;
      projectId: string | null;
    };
    counts: {
      kits: number;
      assets: number;
      approvedAssets: number;
      partners: number;
      readyPartners: number;
    };
    kits: {
      id: string;
      title: string;
      status: AssetKit['status'];
      readiness: KitReadiness;
    }[];
    partnerStatuses: Partial<Record<PartnerStatus, number>>;
    destinations: {
      id: string;
      title: string;
      readiness: DestinationReadiness;
    }[];
  };
};

export type EcosystemApiError = {
  error: string;
  code?: 'INVALID' | 'UNAUTHENTICATED' | 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT';
};
