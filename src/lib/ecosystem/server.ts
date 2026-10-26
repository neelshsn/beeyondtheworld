import 'server-only';
import { currentUser } from '@/lib/community/server';
import { crmCatalog, type Catalog } from '@/lib/creative/server';
import { sqlClient } from '@/lib/db/client';
import { EcosystemError, grantAllowsScope, need, requireGrantScope } from './model';
import type {
  AssetKit,
  CreativeAsset,
  CreatorApplication,
  Destination,
  EcosystemLink,
  EcosystemRole,
  EcosystemScope,
  LocalPartner,
  StaffRole,
} from './types';

export type EcosystemAccess = {
  userId: string;
  email: string;
  scope: EcosystemScope;
  isTeam: boolean;
  isCommercial: boolean;
  role: EcosystemRole;
  creatorId: string | null;
  creatorStatus: CreatorApplication['status'] | null;
  canSwitchDemoRole: boolean;
  crm: Catalog | null;
};

export async function ecosystemAccess(request: Request): Promise<EcosystemAccess> {
  const [communityUser, crm] = await Promise.all([currentUser(), crmCatalog(request)]);
  const crmEmail = crm?.user.email.toLowerCase() || '';
  const [crmIdentity] =
    !communityUser && crmEmail
      ? await sqlClient().query<{
          id: string;
          email: string;
          is_test: boolean;
        }>(
          'SELECT id,email,is_test FROM bee_community_users WHERE lower(email)=$1 AND NOT disabled',
          [crmEmail]
        )
      : [];
  const user = communityUser || crmIdentity;
  need(
    user,
    'Sign in to Bee Community or the sales CRM with an existing Community account.',
    401,
    'UNAUTHENTICATED'
  );
  const url = new URL(request.url);
  const scope: EcosystemScope = url.searchParams.get('scope') === 'demo' ? 'demo' : 'studio';
  const email = user.email.toLowerCase();
  const [[grant], [creator]] = await Promise.all([
    sqlClient().query<{ role: string; demo_only: boolean }>(
      'SELECT role,demo_only FROM bee_creative_access WHERE lower(email)=$1',
      [email]
    ),
    sqlClient().query<{ id: string; status: CreatorApplication['status'] }>(
      'SELECT id,status FROM bee_ecosystem_creators WHERE scope=$1 AND user_id=$2',
      [scope, user.id]
    ),
  ]);
  requireGrantScope(grant, scope);
  const staffRole: StaffRole | null =
    grant && ['bee', 'curator', 'production'].includes(grant.role)
      ? (grant.role as StaffRole)
      : null;
  const canSwitchDemoRole = Boolean(user.is_test && scope === 'demo');
  const simulated = url.searchParams.get('role');
  const commercial = Boolean(
    !staffRole &&
    grant &&
    grantAllowsScope(grant, scope) &&
    ['contributor', 'viewer'].includes(grant.role) &&
    crm?.user.email.toLowerCase() === email
  );
  let role: EcosystemRole = staffRole || (commercial ? 'commercial' : 'creator');
  if (canSwitchDemoRole && ['creator', 'bee', 'curator', 'production'].includes(simulated || ''))
    role = simulated as EcosystemRole;
  const isCommercial = role === 'commercial';
  const isTeam = !['creator', 'commercial'].includes(role);
  return {
    userId: user.id,
    email,
    scope,
    isTeam,
    isCommercial,
    role,
    creatorId: creator?.id || null,
    creatorStatus: creator?.status || null,
    canSwitchDemoRole,
    crm: crm?.user.email.toLowerCase() === email ? crm : null,
  };
}

export type EcosystemAssetAccessRow = {
  id: string;
  scope: EcosystemScope;
  creator_id: string | null;
  creator_user_id: string | null;
  creator_status: CreatorApplication['status'] | null;
  active_media_id: string | null;
  public_media_id: string | null;
};

export function canAccessAsset(access: EcosystemAccess, asset: EcosystemAssetAccessRow) {
  return (
    asset.scope === access.scope &&
    (access.isTeam ||
      (Boolean(access.creatorId) &&
        asset.creator_id === access.creatorId &&
        asset.creator_user_id === access.userId))
  );
}

export function canUploadToAsset(access: EcosystemAccess, asset: EcosystemAssetAccessRow) {
  return (
    canAccessAsset(access, asset) &&
    (access.isTeam || ['approved', 'active'].includes(asset.creator_status || ''))
  );
}

export async function ecosystemAssetAccess(
  access: EcosystemAccess,
  assetId: string,
  sql = sqlClient()
) {
  const [asset] = await sql.query<EcosystemAssetAccessRow>(
    `SELECT a.id,a.scope,a.creator_id,a.active_media_id,a.public_media_id,
      c.user_id AS creator_user_id,c.status AS creator_status
     FROM bee_ecosystem_assets a
     LEFT JOIN bee_ecosystem_creators c ON c.id=a.creator_id
     WHERE a.id=$1 AND a.scope=$2`,
    [assetId, access.scope]
  );
  need(asset, 'Asset not found.', 404, 'NOT_FOUND');
  need(canAccessAsset(access, asset), 'Asset access denied.', 403, 'FORBIDDEN');
  return asset;
}

const iso = (value: unknown) => (value instanceof Date ? value.toISOString() : String(value || ''));
const numberOrNull = (value: unknown) =>
  value === null || value === undefined || value === '' ? null : Number(value);

export function mapCreator(row: Record<string, unknown>): CreatorApplication {
  return {
    id: String(row.id),
    scope: row.scope as EcosystemScope,
    userId: row.user_id ? String(row.user_id) : null,
    email: String(row.email),
    displayName: String(row.display_name),
    homeDestination: String(row.home_destination),
    portfolioUrl: String(row.portfolio_url),
    biography: String(row.biography),
    languages: Array.isArray(row.languages) ? row.languages.map(String) : [],
    coveredDestinations: Array.isArray(row.covered_destinations)
      ? row.covered_destinations.map(String)
      : [],
    status: row.status as CreatorApplication['status'],
    royaltyRateBps: 200,
    royaltyStatus: 'proposed_to_contract',
    contractReference: row.contract_reference ? String(row.contract_reference) : null,
    version: Number(row.version),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

export function mapDestination(row: Record<string, unknown>): Destination {
  return {
    id: String(row.id),
    scope: row.scope as EcosystemScope,
    title: String(row.title),
    country: String(row.country),
    territory: String(row.territory),
    description: String(row.description),
    creativeDirectionApproved: Boolean(row.creative_direction_approved),
    productionApproved: Boolean(row.production_approved),
    globalBudgetReference: String(row.global_budget_reference),
    version: Number(row.version),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

export function mapKit(row: Record<string, unknown>): AssetKit {
  return {
    id: String(row.id),
    scope: row.scope as EcosystemScope,
    destinationId: String(row.destination_id),
    title: String(row.title),
    status: row.status as AssetKit['status'],
    version: Number(row.version),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

export function mapAsset(row: Record<string, unknown>): CreativeAsset {
  return {
    id: String(row.id),
    scope: row.scope as EcosystemScope,
    kitId: String(row.kit_id),
    destinationId: String(row.destination_id),
    creatorId: row.creator_id ? String(row.creator_id) : null,
    slot: row.slot as CreativeAsset['slot'],
    slotIndex: Number(row.slot_index),
    title: String(row.title),
    description: String(row.description),
    location: String(row.location),
    credit: String(row.credit),
    rightsSummary: String(row.rights_summary),
    rightsEvidence: String(row.rights_evidence),
    rightsScope: row.rights_scope as CreativeAsset['rightsScope'],
    rightsExpiresAt: row.rights_expires_at ? String(row.rights_expires_at).slice(0, 10) : null,
    originalSourceUrl: String(row.original_source_url),
    aiDisclosure: row.ai_disclosure as CreativeAsset['aiDisclosure'],
    softFadeConsent: Boolean(row.soft_fade_consent),
    width: numberOrNull(row.width),
    height: numberOrNull(row.height),
    mediaId: row.active_media_id ? String(row.active_media_id) : null,
    publicMediaId: row.public_media_id ? String(row.public_media_id) : null,
    durationSeconds: numberOrNull(row.duration_seconds),
    status: row.status as CreativeAsset['status'],
    authenticity: row.authenticity as CreativeAsset['authenticity'],
    rights: row.rights_review as CreativeAsset['rights'],
    safety: row.safety as CreativeAsset['safety'],
    humanCreative: row.human_creative as CreativeAsset['humanCreative'],
    reviewNote: String(row.review_note),
    version: Number(row.version),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

export function mapPartner(row: Record<string, unknown>): LocalPartner {
  return {
    id: String(row.id),
    scope: row.scope as EcosystemScope,
    destinationId: String(row.destination_id),
    name: String(row.name),
    type: row.type as LocalPartner['type'],
    description: String(row.description),
    contactName: String(row.contact_name),
    contactEmail: String(row.contact_email),
    contactPhone: String(row.contact_phone),
    website: String(row.website),
    collaborationType: row.collaboration_type as LocalPartner['collaborationType'],
    exchangeValueAmount: numberOrNull(row.exchange_value_amount),
    exchangeTerms: String(row.exchange_terms),
    deliverables: String(row.deliverables),
    status: row.status as LocalPartner['status'],
    evidenceReference: String(row.evidence_reference),
    quoteReference: String(row.quote_reference),
    budgetAmount: numberOrNull(row.budget_amount),
    budgetCurrency: String(row.budget_currency),
    availabilityNote: String(row.availability_note),
    safetyNote: String(row.safety_note),
    productionValidated: Boolean(row.production_validated),
    impactNote: String(row.impact_note),
    version: Number(row.version),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

export function mapLink(row: Record<string, unknown>): EcosystemLink {
  return {
    id: String(row.id),
    scope: row.scope as EcosystemScope,
    entityType: row.entity_type as EcosystemLink['entityType'],
    entityId: String(row.entity_id),
    targetType: row.target_type as EcosystemLink['targetType'],
    targetId: String(row.target_id),
    label: String(row.label),
    createdAt: iso(row.created_at),
  };
}

export function ecosystemFailure(error: unknown) {
  const known = error instanceof EcosystemError;
  if (!known && process.env.NODE_ENV !== 'production') {
    const failure = error instanceof Error ? error : new Error(String(error));
    console.error('Visual Poets request failed', {
      name: failure.name,
      code: 'code' in failure ? String(failure.code) : undefined,
      message: failure.message,
      stack: failure.stack?.split('\n').slice(0, 6).join('\n'),
    });
  }
  return Response.json(
    {
      error: known ? error.message : 'The Visual Poets workspace is temporarily unavailable.',
      ...(known ? { code: error.code } : {}),
    },
    {
      status: known ? error.status : 503,
      headers: { 'Cache-Control': 'private, no-store' },
    }
  );
}
