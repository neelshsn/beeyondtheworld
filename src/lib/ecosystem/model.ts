import {
  assetSlots,
  collaborationTypes,
  creatorStatuses,
  ecosystemEntityTypes,
  ecosystemTargetTypes,
  partnerStatuses,
  partnerTypes,
  type AssetSlot,
  type CreativeAsset,
  type CreatorStatus,
  type Destination,
  type DestinationReadiness,
  type EcosystemEntityType,
  type EcosystemRole,
  type EcosystemTargetType,
  type KitReadiness,
  type LocalPartner,
  type PartnerStatus,
  type ReviewGate,
} from './types';

export class EcosystemError extends Error {
  constructor(
    message: string,
    public status = 400,
    public code: 'INVALID' | 'UNAUTHENTICATED' | 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT' = 'INVALID'
  ) {
    super(message);
  }
}

export function need(
  condition: unknown,
  message: string,
  status = 400,
  code: EcosystemError['code'] = 'INVALID'
): asserts condition {
  if (!condition) throw new EcosystemError(message, status, code);
}

export const isUuid = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value);

export const grantAllowsScope = (
  grant: { demo_only: boolean } | null | undefined,
  scope: 'studio' | 'demo'
) => Boolean(grant && (!grant.demo_only || scope === 'demo'));

export function requireGrantScope(
  grant: { demo_only: boolean } | null | undefined,
  scope: 'studio' | 'demo'
) {
  if (!grant) return;
  need(
    grantAllowsScope(grant, scope),
    'This account is limited to the demonstration workspace.',
    403,
    'FORBIDDEN'
  );
}

export function cleanText(value: unknown, label: string, max: number, required = false) {
  need(value === undefined || typeof value === 'string', `Invalid ${label}.`);
  const result = String(value || '').trim();
  need(!required || result.length > 0, `${label} is required.`);
  need(result.length <= max, `${label} is too long.`);
  return result;
}

export function cleanHttps(value: unknown, label: string, required = false) {
  const result = cleanText(value, label, 2000, required);
  if (!result) return result;
  try {
    const url = new URL(result);
    need(url.protocol === 'https:' && !url.username && !url.password, `Use an HTTPS ${label}.`);
  } catch (error) {
    if (error instanceof EcosystemError) throw error;
    throw new EcosystemError(`Use an HTTPS ${label}.`);
  }
  return result;
}

export function cleanCurrency(value: unknown) {
  const currency = cleanText(value ?? 'EUR', 'currency', 3, true).toUpperCase();
  need(/^[A-Z]{3}$/.test(currency), 'Use a three-letter currency code.');
  return currency;
}

export function cleanCreatorApplication(input: unknown) {
  need(input && typeof input === 'object' && !Array.isArray(input), 'Invalid application.');
  const body = input as Record<string, unknown>;
  const list = (value: unknown, label: string) => {
    need(Array.isArray(value), `${label} is required.`);
    need(value.length > 0 && value.length <= 30, `Add 1–30 ${label.toLowerCase()}.`);
    const items = value.map((item) => cleanText(item, label, 120, true));
    return [...new Set(items)];
  };
  return {
    displayName: cleanText(body.displayName, 'display name', 120, true),
    homeDestination: cleanText(body.homeDestination, 'home destination', 160, true),
    portfolioUrl: cleanHttps(body.portfolioUrl, 'portfolio link', true),
    biography: cleanText(body.biography, 'biography', 3000, true),
    languages: list(body.languages, 'Languages'),
    coveredDestinations: list(body.coveredDestinations, 'Covered destinations'),
  };
}

export function creatorTransition(current: CreatorStatus, next: unknown, role: EcosystemRole) {
  need(creatorStatuses.includes(next as CreatorStatus), 'Unknown creator status.');
  need(role === 'bee' || role === 'curator', 'Studio review is required.', 403, 'FORBIDDEN');
  const transitions: Record<CreatorStatus, CreatorStatus[]> = {
    requested: ['review', 'declined'],
    review: ['approved', 'declined'],
    approved: ['active', 'suspended'],
    active: ['suspended'],
    declined: ['review'],
    suspended: ['review', 'active'],
  };
  need(
    transitions[current].includes(next as CreatorStatus),
    'Invalid creator transition.',
    409,
    'CONFLICT'
  );
  return next as CreatorStatus;
}

export function cleanDestination(input: unknown) {
  need(input && typeof input === 'object' && !Array.isArray(input), 'Invalid destination.');
  const body = input as Record<string, unknown>;
  return {
    title: cleanText(body.title, 'destination title', 160, true),
    country: cleanText(body.country, 'country', 100, true),
    territory: cleanText(body.territory, 'territory', 160, true),
    description: cleanText(body.description, 'description', 3000),
    creativeDirectionApproved: Boolean(body.creativeDirectionApproved),
    productionApproved: Boolean(body.productionApproved),
    globalBudgetReference: cleanText(body.globalBudgetReference, 'global budget reference', 2000),
  };
}

export function validSlot(
  slot: unknown,
  slotIndex: unknown
): { slot: AssetSlot; slotIndex: number } {
  need(assetSlots.includes(slot as AssetSlot), 'Unknown asset slot.');
  const index = Number(slotIndex);
  need(Number.isInteger(index), 'Invalid asset slot index.');
  const maximum = slot === 'hero' ? 1 : slot === 'reel' ? 3 : 10;
  need(index >= 1 && index <= maximum, 'Invalid asset slot index.');
  return { slot: slot as AssetSlot, slotIndex: index };
}

export const slotKey = (asset: Pick<CreativeAsset, 'slot' | 'slotIndex'>) =>
  `${asset.slot}:${asset.slotIndex}`;

export const requiredAssetSlots = [
  'hero:1',
  'reel:1',
  'reel:2',
  'reel:3',
  ...Array.from({ length: 10 }, (_, index) => `photo:${index + 1}`),
] as const;

export function cleanAsset(input: unknown, slot: AssetSlot) {
  need(input && typeof input === 'object' && !Array.isArray(input), 'Invalid asset.');
  const body = input as Record<string, unknown>;
  const duration =
    body.durationSeconds === '' || body.durationSeconds == null
      ? null
      : Number(body.durationSeconds);
  need(
    duration === null || (Number.isFinite(duration) && duration > 0 && duration <= 600),
    'Invalid duration.'
  );
  if (slot === 'hero' && duration !== null)
    need(duration >= 15 && duration <= 30, 'Hero video duration must be 15–30 seconds.');
  const rightsScope = String(body.rightsScope || '');
  need(['brand_presentation', 'public_journeys'].includes(rightsScope), 'Choose a rights scope.');
  const expires = body.rightsExpiresAt
    ? cleanText(body.rightsExpiresAt, 'rights expiry', 10, true)
    : null;
  if (expires)
    need(
      /^\d{4}-\d{2}-\d{2}$/.test(expires) &&
        Number.isFinite(Date.parse(expires)) &&
        new Date(expires).toISOString().slice(0, 10) === expires,
      'Use a valid rights expiry date.'
    );
  const aiDisclosure = String(body.aiDisclosure || '');
  need(
    ['none_declared', 'retouching_only', 'ai_assisted', 'ai_generated'].includes(aiDisclosure),
    'Declare AI and retouching involvement.'
  );
  const dimension = (value: unknown, label: string) => {
    if (value === '' || value == null) return null;
    const parsed = Number(value);
    need(Number.isInteger(parsed) && parsed > 0 && parsed <= 100000, `Invalid ${label}.`);
    return parsed;
  };
  return {
    title: cleanText(body.title, 'title', 160, true),
    description: cleanText(body.description, 'description', 3000, true),
    location: cleanText(body.location, 'location', 300, true),
    credit: cleanText(body.credit, 'credit', 300, true),
    rightsSummary: cleanText(body.rightsSummary, 'rights summary', 3000, true),
    rightsEvidence: cleanText(body.rightsEvidence, 'rights evidence', 2000, true),
    rightsScope: rightsScope as 'brand_presentation' | 'public_journeys',
    rightsExpiresAt: expires,
    originalSourceUrl: cleanHttps(body.originalSourceUrl, 'original source link', false),
    aiDisclosure: aiDisclosure as
      'none_declared' | 'retouching_only' | 'ai_assisted' | 'ai_generated',
    softFadeConsent: body.softFadeConsent === true,
    width: dimension(body.width, 'width'),
    height: dimension(body.height, 'height'),
    durationSeconds: duration,
  };
}

export function assetIsApproved(asset: CreativeAsset) {
  const today = new Date().toISOString().slice(0, 10);
  const demoAiReview =
    asset.scope === 'demo' &&
    asset.aiDisclosure === 'ai_generated' &&
    asset.authenticity === 'rejected' &&
    asset.rights === 'approved' &&
    asset.safety === 'approved' &&
    asset.humanCreative === 'rejected' &&
    /\bdemo(?:nstration)?\b/i.test(asset.reviewNote) &&
    /\b(?:ai|ia)\b/i.test(asset.reviewNote);
  const humanReview =
    asset.authenticity === 'approved' &&
    asset.rights === 'approved' &&
    asset.safety === 'approved' &&
    asset.humanCreative === 'approved' &&
    asset.aiDisclosure !== 'ai_generated';
  return (
    ['approved', 'published'].includes(asset.status) &&
    (humanReview || demoAiReview) &&
    Boolean(asset.mediaId) &&
    Boolean(asset.rightsEvidence) &&
    asset.rightsScope === 'public_journeys' &&
    Boolean(asset.rightsExpiresAt) &&
    asset.rightsExpiresAt! >= today &&
    (asset.slot !== 'hero' ||
      (asset.durationSeconds !== null &&
        asset.durationSeconds >= 15 &&
        asset.durationSeconds <= 30))
  );
}

export function destinationReadiness(
  destination: Destination,
  kits: { readiness: KitReadiness }[],
  partners: LocalPartner[]
): DestinationReadiness {
  const readyPartner = (type: LocalPartner['type']) =>
    partners.some((partner) => partner.type === type && partner.status === 'ready_to_sell');
  const impactPartners = partners.filter((partner) =>
    ['association', 'territorial'].includes(partner.type)
  );
  const requiredPartners = partners.filter((partner) =>
    ['transport', 'food', 'hospitality', 'association', 'territorial'].includes(partner.type)
  );
  const checks = {
    creativeKit: kits.some((kit) => kit.readiness.ready),
    creativeDirection: destination.creativeDirectionApproved,
    transport: readyPartner('transport'),
    food: readyPartner('food'),
    accommodation: readyPartner('hospitality'),
    impactBudget: impactPartners.some(
      (partner) =>
        ['impact_documented', 'ready_to_sell'].includes(partner.status) &&
        partner.budgetAmount !== null &&
        Boolean(partner.evidenceReference)
    ),
    availabilityAndSafety:
      requiredPartners.length >= 4 &&
      requiredPartners.every(
        (partner) => Boolean(partner.availabilityNote) && Boolean(partner.safetyNote)
      ),
    globalBudget: Boolean(destination.globalBudgetReference),
    headOfProduction: destination.productionApproved,
  };
  const missing = Object.entries(checks)
    .filter(([, ready]) => !ready)
    .map(([name]) => name);
  return { ready: missing.length === 0, checks, missing };
}

export function kitReadiness(assets: CreativeAsset[]): KitReadiness {
  const keys = new Map<string, CreativeAsset[]>();
  for (const asset of assets) {
    const key = slotKey(asset);
    keys.set(key, [...(keys.get(key) || []), asset]);
  }
  const missing: string[] = [];
  const invalid: string[] = [];
  let approved = 0;
  for (const required of requiredAssetSlots) {
    const records = keys.get(required) || [];
    if (!records.length) missing.push(required);
    else if (records.length !== 1 || !assetIsApproved(records[0])) invalid.push(required);
    else approved += 1;
  }
  for (const key of keys.keys()) if (!requiredAssetSlots.includes(key as never)) invalid.push(key);
  return {
    ready: approved === 14 && missing.length === 0 && invalid.length === 0,
    approved,
    required: 14,
    missing,
    invalid: [...new Set(invalid)],
  };
}

export function cleanReviewGate(value: unknown, label: string): ReviewGate {
  need(['approved', 'rejected'].includes(String(value)), `Review ${label}.`);
  return value as ReviewGate;
}

export function cleanPartner(input: unknown) {
  need(input && typeof input === 'object' && !Array.isArray(input), 'Invalid partner.');
  const body = input as Record<string, unknown>;
  need(partnerTypes.includes(body.type as (typeof partnerTypes)[number]), 'Unknown partner type.');
  const amount =
    body.budgetAmount === '' || body.budgetAmount == null ? null : Number(body.budgetAmount);
  need(
    amount === null || (Number.isFinite(amount) && amount >= 0 && amount <= 1_000_000_000),
    'Invalid budget.'
  );
  const exchangeValue =
    body.exchangeValueAmount === '' || body.exchangeValueAmount == null
      ? null
      : Number(body.exchangeValueAmount);
  need(
    exchangeValue === null ||
      (Number.isFinite(exchangeValue) && exchangeValue >= 0 && exchangeValue <= 1_000_000_000),
    'Invalid exchange value.'
  );
  const collaborationType = String(body.collaborationType || 'paid');
  need(
    collaborationTypes.includes(collaborationType as (typeof collaborationTypes)[number]),
    'Unknown collaboration type.'
  );
  const contactEmail = cleanText(body.contactEmail, 'contact email', 320);
  need(!contactEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail), 'Invalid contact email.');
  return {
    name: cleanText(body.name, 'partner name', 160, true),
    type: body.type as (typeof partnerTypes)[number],
    description: cleanText(body.description, 'description', 3000, true),
    contactName: cleanText(body.contactName, 'contact name', 160),
    contactEmail,
    contactPhone: cleanText(body.contactPhone, 'contact phone', 60),
    website: cleanHttps(body.website, 'partner website'),
    collaborationType: collaborationType as (typeof collaborationTypes)[number],
    exchangeValueAmount: exchangeValue,
    exchangeTerms: cleanText(body.exchangeTerms, 'exchange terms and rights', 3000),
    deliverables: cleanText(body.deliverables, 'deliverables', 3000),
    evidenceReference: cleanText(body.evidenceReference, 'evidence reference', 2000),
    quoteReference: cleanText(body.quoteReference, 'quote reference', 2000),
    budgetAmount: amount,
    budgetCurrency: cleanCurrency(body.budgetCurrency),
    availabilityNote: cleanText(body.availabilityNote, 'availability note', 2000),
    safetyNote: cleanText(body.safetyNote, 'safety note', 2000),
    impactNote: cleanText(body.impactNote, 'impact note', 3000),
  };
}

export function partnerCanBeProductionValidated(partner: LocalPartner) {
  const hasContact = Boolean(partner.contactName && (partner.contactEmail || partner.contactPhone));
  const exchangeReady =
    partner.collaborationType === 'paid' ||
    (partner.exchangeValueAmount !== null &&
      Boolean(partner.exchangeTerms) &&
      Boolean(partner.deliverables));
  return hasContact && exchangeReady;
}

export function partnerTransition(partner: LocalPartner, next: unknown, role: EcosystemRole) {
  need(partnerStatuses.includes(next as PartnerStatus), 'Unknown partner status.');
  need(role !== 'creator', 'Partner review is reserved for Bee.', 403, 'FORBIDDEN');
  const allowed: Record<PartnerStatus, PartnerStatus[]> = {
    discovered: ['under_review'],
    under_review: ['internally_verified', 'discovered'],
    internally_verified: ['impact_documented', 'under_review'],
    impact_documented: ['ready_to_sell', 'under_review'],
    ready_to_sell: ['under_review'],
  };
  need(
    allowed[partner.status].includes(next as PartnerStatus),
    'Invalid partner transition.',
    409,
    'CONFLICT'
  );
  if (next === 'internally_verified')
    need(partner.evidenceReference, 'Internal verification needs supporting evidence.');
  if (next === 'impact_documented')
    need(
      partner.evidenceReference && partner.impactNote,
      'Document impact and supporting evidence.'
    );
  if (next === 'ready_to_sell')
    need(
      partner.evidenceReference &&
        partner.quoteReference &&
        partner.budgetAmount !== null &&
        partner.availabilityNote &&
        partner.safetyNote &&
        partner.productionValidated &&
        partnerCanBeProductionValidated(partner),
      'Ready to sell requires structured contact details, documented exchange terms, evidence, quote, budget, availability, safety and production validation.'
    );
  return next as PartnerStatus;
}

export function cleanLink(input: unknown) {
  need(input && typeof input === 'object' && !Array.isArray(input), 'Invalid link.');
  const body = input as Record<string, unknown>;
  need(
    ecosystemEntityTypes.includes(body.entityType as EcosystemEntityType),
    'Unknown entity type.'
  );
  need(isUuid(body.entityId), 'Invalid entity.');
  need(
    ecosystemTargetTypes.includes(body.targetType as EcosystemTargetType),
    'Unknown link target.'
  );
  const targetId = cleanText(body.targetId, 'target ID', 160, true);
  need(/^[a-zA-Z0-9._:-]+$/.test(targetId), 'Invalid target ID.');
  return {
    entityType: body.entityType as EcosystemEntityType,
    entityId: body.entityId,
    targetType: body.targetType as EcosystemTargetType,
    targetId,
    label: cleanText(body.label, 'link label', 200),
  };
}
