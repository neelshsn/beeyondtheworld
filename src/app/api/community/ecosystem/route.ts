import { rejectCrossSiteWrite } from '@/lib/db/admin-guard';
import { sqlClient, withTransaction } from '@/lib/db/client';
import {
  cleanAsset,
  cleanCreatorApplication,
  cleanDestination,
  cleanLink,
  cleanPartner,
  cleanReviewGate,
  cleanText,
  creatorTransition,
  destinationReadiness,
  isUuid,
  kitReadiness,
  need,
  partnerCanBeProductionValidated,
  partnerTransition,
  requiredAssetSlots,
} from '@/lib/ecosystem/model';
import {
  canAccessAsset,
  ecosystemAccess,
  ecosystemFailure,
  mapAsset,
  mapCreator,
  mapDestination,
  mapKit,
  mapLink,
  mapPartner,
  type EcosystemAccess,
  type EcosystemAssetAccessRow,
} from '@/lib/ecosystem/server';
import type {
  AssetKit,
  CreativeAsset,
  CreatorApplication,
  Destination,
  EcosystemEntityType,
  EcosystemLink,
  EcosystemSnapshot,
  EcosystemConnectionSummary,
  EcosystemTargetOption,
  LocalPartner,
} from '@/lib/ecosystem/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const reply = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'private, no-store' } });

async function body(request: Request) {
  const raw = await request.text();
  need(raw.length <= 64 * 1024, 'Request too large.', 413);
  try {
    const value = JSON.parse(raw);
    need(value && typeof value === 'object' && !Array.isArray(value), 'Invalid request.');
    return value as Record<string, unknown>;
  } catch (error) {
    if (error instanceof Error && error.name === 'EcosystemError') throw error;
    need(false, 'Invalid JSON.');
  }
}

const assertVersion = (actual: number, submitted: unknown) =>
  need(
    Number.isInteger(submitted) && actual === submitted,
    'This record changed. Reload before saving; your form is preserved.',
    409,
    'CONFLICT'
  );

async function audit(
  sql: ReturnType<typeof sqlClient>,
  access: EcosystemAccess,
  entityType: string,
  entityId: string,
  action: string,
  snapshot: unknown
) {
  await sql.query(
    'INSERT INTO bee_ecosystem_events(scope,entity_type,entity_id,actor_id,action,snapshot) VALUES($1,$2,$3,$4,$5,$6::jsonb)',
    [access.scope, entityType, entityId, access.userId, action, JSON.stringify(snapshot)]
  );
}

function stableFilter(value: string | null, label: string, uuid = false) {
  if (!value) return null;
  need(
    uuid ? isUuid(value) : value.length <= 160 && /^[a-zA-Z0-9._:-]+$/.test(value),
    `Invalid ${label}.`
  );
  return value;
}

function entityKey(type: EcosystemEntityType, id: string) {
  return `${type}:${id}`;
}

function filterSnapshot(
  filters: { targetType: EcosystemLink['targetType']; targetId: string }[],
  applications: CreatorApplication[],
  destinations: Destination[],
  kits: AssetKit[],
  assets: CreativeAsset[],
  partners: LocalPartner[],
  links: EcosystemLink[]
) {
  if (!filters.length) return { applications, destinations, kits, assets, partners, links };
  const matching = new Set<string>();
  const byEntity = new Map<string, EcosystemLink[]>();
  for (const link of links) {
    const key = entityKey(link.entityType, link.entityId);
    byEntity.set(key, [...(byEntity.get(key) || []), link]);
  }
  for (const [key, entityLinks] of byEntity)
    if (
      filters.every((filter) =>
        entityLinks.some(
          (link) => link.targetType === filter.targetType && link.targetId === filter.targetId
        )
      )
    )
      matching.add(key);

  const creatorIds = new Set<string>();
  const destinationIds = new Set<string>();
  const kitIds = new Set<string>();
  const assetIds = new Set<string>();
  const partnerIds = new Set<string>();
  for (const key of matching) {
    const [type, id] = key.split(':', 2);
    if (type === 'creator') creatorIds.add(id);
    if (type === 'destination') destinationIds.add(id);
    if (type === 'kit') kitIds.add(id);
    if (type === 'asset') assetIds.add(id);
    if (type === 'partner') partnerIds.add(id);
  }
  for (const asset of assets)
    if (assetIds.has(asset.id)) {
      kitIds.add(asset.kitId);
      destinationIds.add(asset.destinationId);
      if (asset.creatorId) creatorIds.add(asset.creatorId);
    }
  for (const kit of kits)
    if (kitIds.has(kit.id)) {
      destinationIds.add(kit.destinationId);
      for (const asset of assets)
        if (asset.kitId === kit.id) {
          assetIds.add(asset.id);
          if (asset.creatorId) creatorIds.add(asset.creatorId);
        }
    }
  for (const partner of partners)
    if (partnerIds.has(partner.id)) destinationIds.add(partner.destinationId);
  const visibleKeys = new Set([
    ...[...creatorIds].map((id) => entityKey('creator', id)),
    ...[...destinationIds].map((id) => entityKey('destination', id)),
    ...[...kitIds].map((id) => entityKey('kit', id)),
    ...[...assetIds].map((id) => entityKey('asset', id)),
    ...[...partnerIds].map((id) => entityKey('partner', id)),
  ]);
  return {
    applications: applications.filter((item) => creatorIds.has(item.id)),
    destinations: destinations.filter((item) => destinationIds.has(item.id)),
    kits: kits.filter((item) => kitIds.has(item.id)),
    assets: assets.filter((item) => assetIds.has(item.id)),
    partners: partners.filter((item) => partnerIds.has(item.id)),
    links: links.filter((link) => visibleKeys.has(entityKey(link.entityType, link.entityId))),
  };
}

export async function GET(request: Request) {
  try {
    const access = await ecosystemAccess(request);
    const url = new URL(request.url);
    const company = stableFilter(url.searchParams.get('company'), 'company', true);
    const production = stableFilter(url.searchParams.get('production'), 'production', true);
    const journey = stableFilter(url.searchParams.get('journey'), 'journey');
    const booking = stableFilter(url.searchParams.get('booking'), 'booking');
    const project = stableFilter(url.searchParams.get('project'), 'project', true);
    const detailed = url.searchParams.get('detail') === '1';
    need(
      !access.isCommercial ||
        (Boolean(company || production) && !detailed && !project && !journey && !booking),
      'Open this workspace from an accessible CRM brand or production.',
      403,
      'FORBIDDEN'
    );
    need(
      access.isTeam || access.isCommercial || (!company && !production && !booking && !project),
      'Commercial connections are reserved for the Bee team.',
      403,
      'FORBIDDEN'
    );
    const sameCrmIdentity = access.isTeam || access.isCommercial ? access.crm : null;
    if (company)
      need(
        sameCrmIdentity?.companies.some((item) => item.id === company),
        'CRM company unavailable.',
        403,
        'FORBIDDEN'
      );
    if (production) {
      const linkedProduction = sameCrmIdentity?.productions.find((item) => item.id === production);
      need(linkedProduction, 'CRM production unavailable.', 403, 'FORBIDDEN');
      if (company)
        need(
          linkedProduction.company_id === company,
          'This production does not belong to the selected company.',
          403,
          'FORBIDDEN'
        );
    }
    if (project) {
      const [allowedProject] = await sqlClient().query(
        `SELECT p.id FROM bee_community_projects p
         JOIN bee_community_members m ON m.project_id=p.id
         WHERE p.id=$1 AND p.is_demo=$2 AND m.user_id=$3
           AND m.role IN ('bee','art_director','production')`,
        [project, access.scope === 'demo', access.userId]
      );
      need(allowedProject, 'Community project unavailable.', 403, 'FORBIDDEN');
    }
    const broadRead = access.isTeam || access.isCommercial;
    const creatorWhere = broadRead ? 'scope=$1' : 'scope=$1 AND user_id=$2';
    const assetWhere = broadRead
      ? 'a.scope=$1'
      : 'a.scope=$1 AND a.creator_id=(SELECT id FROM bee_ecosystem_creators WHERE scope=$1 AND user_id=$2)';
    const kitWhere = broadRead
      ? 'k.scope=$1'
      : `k.scope=$1 AND EXISTS (
          SELECT 1 FROM bee_ecosystem_assets mine
          JOIN bee_ecosystem_creators c ON c.id=mine.creator_id
          WHERE mine.kit_id=k.id AND c.user_id=$2
        )`;
    const params = broadRead ? [access.scope] : [access.scope, access.userId];
    const [
      creatorRows,
      destinationRows,
      kitRows,
      assetRows,
      partnerRows,
      linkRows,
      projectOptions,
      journeyOptions,
      creativeOptions,
      bookingOptions,
    ] = await Promise.all([
      sqlClient().query(
        `SELECT * FROM bee_ecosystem_creators WHERE ${creatorWhere} ORDER BY updated_at DESC,id`,
        params
      ),
      sqlClient().query(
        broadRead
          ? 'SELECT * FROM bee_ecosystem_destinations WHERE scope=$1 ORDER BY title,id'
          : `SELECT DISTINCT d.* FROM bee_ecosystem_destinations d
               JOIN bee_ecosystem_kits k ON k.destination_id=d.id
               JOIN bee_ecosystem_assets a ON a.kit_id=k.id
               JOIN bee_ecosystem_creators c ON c.id=a.creator_id
               WHERE d.scope=$1 AND c.user_id=$2 ORDER BY d.title,d.id`,
        params
      ),
      sqlClient().query(
        `SELECT k.* FROM bee_ecosystem_kits k WHERE ${kitWhere} ORDER BY k.updated_at DESC,k.id`,
        params
      ),
      sqlClient().query(
        `SELECT a.* FROM bee_ecosystem_assets a WHERE ${assetWhere} ORDER BY a.kit_id,a.slot,a.slot_index`,
        params
      ),
      broadRead
        ? sqlClient().query(
            'SELECT * FROM bee_ecosystem_partners WHERE scope=$1 ORDER BY updated_at DESC,id',
            [access.scope]
          )
        : Promise.resolve([]),
      sqlClient().query(
        broadRead
          ? 'SELECT * FROM bee_ecosystem_links WHERE scope=$1 ORDER BY created_at,id'
          : `SELECT l.* FROM bee_ecosystem_links l
               WHERE l.scope=$1 AND l.target_type IN ('talent','content','journey') AND (
                 (l.entity_type='creator' AND l.entity_id=(SELECT id FROM bee_ecosystem_creators WHERE scope=$1 AND user_id=$2)) OR
                 (l.entity_type='asset' AND l.entity_id IN (
                   SELECT a.id FROM bee_ecosystem_assets a JOIN bee_ecosystem_creators c ON c.id=a.creator_id WHERE a.scope=$1 AND c.user_id=$2
                 )) OR
                 (l.entity_type='kit' AND l.entity_id IN (
                   SELECT a.kit_id FROM bee_ecosystem_assets a JOIN bee_ecosystem_creators c ON c.id=a.creator_id WHERE a.scope=$1 AND c.user_id=$2
                 ))
               ) ORDER BY l.created_at,l.id`,
        params
      ),
      access.isTeam
        ? sqlClient().query(
            `SELECT p.id::text AS id,p.title FROM bee_community_projects p
               JOIN bee_community_members m ON m.project_id=p.id
               WHERE m.user_id=$1 AND m.role IN ('bee','art_director','production') AND p.is_demo=$2
               ORDER BY p.title,p.id`,
            [access.userId, access.scope === 'demo']
          )
        : Promise.resolve([]),
      access.isTeam
        ? sqlClient().query(
            'SELECT slug AS id,title FROM journeys WHERE published ORDER BY position,id'
          )
        : Promise.resolve([]),
      access.isTeam
        ? sqlClient().query(
            "SELECT id::text AS id,kind,title FROM bee_creative_items WHERE scope=$1 AND kind IN ('talent','content','collection') AND status<>'archived' ORDER BY kind,title,id",
            [access.scope]
          )
        : Promise.resolve([]),
      access.isTeam
        ? sqlClient().query(
            `SELECT r.id::text AS id,r.title FROM bee_community_records r
               JOIN bee_community_members m ON m.project_id=r.project_id
               JOIN bee_community_projects p ON p.id=r.project_id
               WHERE m.user_id=$1 AND m.role IN ('bee','art_director','production')
                 AND p.is_demo=$2 AND r.kind='booking'
               ORDER BY r.title,r.id`,
            [access.userId, access.scope === 'demo']
          )
        : Promise.resolve([]),
    ]);
    let visible = filterSnapshot(
      [
        ...(company ? [{ targetType: 'company' as const, targetId: company }] : []),
        ...(production ? [{ targetType: 'production' as const, targetId: production }] : []),
        ...(journey ? [{ targetType: 'journey' as const, targetId: journey }] : []),
        ...(booking ? [{ targetType: 'booking' as const, targetId: booking }] : []),
        ...(project ? [{ targetType: 'project' as const, targetId: project }] : []),
      ],
      creatorRows.map(mapCreator),
      destinationRows.map(mapDestination),
      kitRows.map(mapKit),
      assetRows.map(mapAsset),
      partnerRows.map(mapPartner),
      linkRows.map(mapLink)
    );
    if (!access.isTeam && !access.isCommercial)
      visible = {
        ...visible,
        applications: visible.applications.filter((item) => item.userId === access.userId),
        destinations: visible.destinations.map((destination) => ({
          ...destination,
          globalBudgetReference: '',
        })),
        partners: [],
      };
    const readiness = Object.fromEntries(
      visible.kits.map((kit) => [
        kit.id,
        kitReadiness(visible.assets.filter((asset) => asset.kitId === kit.id)),
      ])
    );
    const destinationReadinessMap = Object.fromEntries(
      visible.destinations.map((destination) => [
        destination.id,
        destinationReadiness(
          destination,
          visible.kits
            .filter((kit) => kit.destinationId === destination.id)
            .map((kit) => ({ readiness: readiness[kit.id] })),
          visible.partners.filter((partner) => partner.destinationId === destination.id)
        ),
      ])
    );
    const targetOptions: EcosystemTargetOption[] = access.isTeam
      ? [
          ...(sameCrmIdentity?.companies.map((item) => ({
            type: 'company' as const,
            id: item.id,
            label: item.name,
          })) || []),
          ...(sameCrmIdentity?.opportunities.map((item) => ({
            type: 'opportunity' as const,
            id: item.id,
            label: item.title,
            companyId: item.company_id,
          })) || []),
          ...(sameCrmIdentity?.productions.map((item) => ({
            type: 'production' as const,
            id: item.id,
            label: item.title,
            companyId: item.company_id,
          })) || []),
          ...projectOptions.map((item) => ({
            type: 'project' as const,
            id: String(item.id),
            label: String(item.title),
          })),
          ...journeyOptions.map((item) => ({
            type: 'journey' as const,
            id: String(item.id),
            label: String(item.title),
          })),
          ...creativeOptions.map((item) => ({
            type: item.kind as 'talent' | 'content' | 'collection',
            id: String(item.id),
            label: String(item.title),
          })),
          ...bookingOptions.map((item) => ({
            type: 'booking' as const,
            id: String(item.id),
            label: String(item.title),
          })),
        ]
      : [];
    if ((company || production || project) && !detailed) {
      const partnerStatuses: EcosystemConnectionSummary['summary']['partnerStatuses'] = {};
      for (const partner of visible.partners)
        partnerStatuses[partner.status] = (partnerStatuses[partner.status] || 0) + 1;
      const summary: EcosystemConnectionSummary = {
        viewer: {
          role: access.role,
          scope: access.scope,
          email: access.email,
          canSwitchDemoRole: access.canSwitchDemoRole,
        },
        summary: {
          filter: {
            companyId: company,
            productionId: production,
            journeyId: journey,
            bookingId: booking,
            projectId: project,
          },
          counts: {
            kits: visible.kits.length,
            assets: visible.assets.length,
            approvedAssets: visible.assets.filter((asset) =>
              ['approved', 'published'].includes(asset.status)
            ).length,
            partners: visible.partners.length,
            readyPartners: visible.partners.filter((partner) => partner.status === 'ready_to_sell')
              .length,
          },
          kits: visible.kits.map((kit) => ({
            id: kit.id,
            title: kit.title,
            status: kit.status,
            readiness: readiness[kit.id],
          })),
          partnerStatuses,
          destinations: visible.destinations.map((destination) => ({
            id: destination.id,
            title: destination.title,
            readiness: destinationReadinessMap[destination.id],
          })),
        },
      };
      return reply(summary);
    }
    const snapshot: EcosystemSnapshot = {
      viewer: {
        role: access.role,
        scope: access.scope,
        email: access.email,
        canSwitchDemoRole: access.canSwitchDemoRole,
      },
      ...visible,
      targetOptions,
      readiness,
      destinationReadiness: destinationReadinessMap,
      crm:
        access.isTeam && sameCrmIdentity
          ? {
              companies: sameCrmIdentity.companies.map((item) => ({
                id: item.id,
                name: item.name,
              })),
              opportunities: sameCrmIdentity.opportunities.map((item) => ({
                id: item.id,
                companyId: item.company_id,
                title: item.title,
                stage: item.stage,
              })),
              productions: sameCrmIdentity.productions.map((item) => ({
                id: item.id,
                companyId: item.company_id,
                opportunityId: item.opportunity_id,
                title: item.title,
                status: item.status,
              })),
            }
          : null,
    };
    return reply(snapshot);
  } catch (error) {
    return ecosystemFailure(error);
  }
}

async function assertEntity(
  sql: ReturnType<typeof sqlClient>,
  access: EcosystemAccess,
  type: EcosystemEntityType,
  id: string
) {
  const table = {
    creator: 'bee_ecosystem_creators',
    destination: 'bee_ecosystem_destinations',
    asset: 'bee_ecosystem_assets',
    kit: 'bee_ecosystem_kits',
    partner: 'bee_ecosystem_partners',
  }[type];
  const [row] = await sql.query(`SELECT id FROM ${table} WHERE id=$1 AND scope=$2`, [
    id,
    access.scope,
  ]);
  need(row, 'Linked record not found.', 404, 'NOT_FOUND');
}

async function assertTarget(
  sql: ReturnType<typeof sqlClient>,
  access: EcosystemAccess,
  link: ReturnType<typeof cleanLink>
) {
  if (['talent', 'content', 'collection'].includes(link.targetType)) {
    const [item] = await sql.query(
      "SELECT id FROM bee_creative_items WHERE id::text=$1 AND scope=$2 AND kind=$3 AND status<>'archived'",
      [link.targetId, access.scope, link.targetType]
    );
    need(item, 'Creative Studio target not found.', 404, 'NOT_FOUND');
    return;
  }
  if (link.targetType === 'project') {
    const [project] = await sql.query(
      `SELECT p.id FROM bee_community_projects p
       JOIN bee_community_members m ON m.project_id=p.id
       WHERE p.id::text=$1 AND p.is_demo=$2 AND m.user_id=$3
         AND m.role IN ('bee','art_director','production')`,
      [link.targetId, access.scope === 'demo', access.userId]
    );
    need(project, 'Community project not found.', 404, 'NOT_FOUND');
    return;
  }
  if (link.targetType === 'journey') {
    const [journey] = await sql.query('SELECT id FROM journeys WHERE id::text=$1 OR slug=$1', [
      link.targetId,
    ]);
    need(journey, 'Journey not found.', 404, 'NOT_FOUND');
    return;
  }
  if (link.targetType === 'booking') {
    const [booking] = await sql.query(
      `SELECT r.id FROM bee_community_records r
       JOIN bee_community_projects p ON p.id=r.project_id
       JOIN bee_community_members m ON m.project_id=p.id
       WHERE r.id::text=$1 AND r.kind='booking' AND p.is_demo=$2 AND m.user_id=$3
         AND m.role IN ('bee','art_director','production')`,
      [link.targetId, access.scope === 'demo', access.userId]
    );
    need(booking, 'Booking not found.', 404, 'NOT_FOUND');
    return;
  }
  const crm = access.crm;
  need(
    crm?.user.email.toLowerCase() === access.email,
    'Sign in to the sales CRM with the same account.',
    403,
    'FORBIDDEN'
  );
  const exists =
    link.targetType === 'company'
      ? crm.companies.some((item) => item.id === link.targetId)
      : link.targetType === 'opportunity'
        ? crm.opportunities.some((item) => item.id === link.targetId)
        : crm.productions.some((item) => item.id === link.targetId);
  need(exists, 'CRM target not found.', 404, 'NOT_FOUND');
}

export async function POST(request: Request) {
  const denied = rejectCrossSiteWrite(request);
  if (denied) return denied;
  try {
    const access = await ecosystemAccess(request);
    const input = await body(request);
    const action = String(input.action || '');
    if (action === 'request-creator') {
      need(!access.isCommercial, 'Commercial access is read-only.', 403, 'FORBIDDEN');
      need(!access.creatorId, 'A creator application already exists.', 409, 'CONFLICT');
      const clean = cleanCreatorApplication(input);
      return await withTransaction(async (sql) => {
        const [row] = await sql.query(
          `INSERT INTO bee_ecosystem_creators(scope,user_id,email,display_name,home_destination,portfolio_url,biography,languages,covered_destinations)
           VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
          [
            access.scope,
            access.userId,
            access.email,
            clean.displayName,
            clean.homeDestination,
            clean.portfolioUrl,
            clean.biography,
            clean.languages,
            clean.coveredDestinations,
          ]
        );
        await audit(sql, access, 'creator', row.id, action, row);
        return reply({ entity: mapCreator(row) }, 201);
      });
    }
    need(access.isTeam, 'Bee team access is required.', 403, 'FORBIDDEN');
    if (action === 'create-creator') {
      need(
        ['bee', 'curator'].includes(access.role),
        'Studio access is required.',
        403,
        'FORBIDDEN'
      );
      const clean = cleanCreatorApplication(input);
      const email = cleanText(input.email, 'email', 254, true).toLowerCase();
      need(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), 'Invalid email.');
      return await withTransaction(async (sql) => {
        const [row] = await sql.query(
          `INSERT INTO bee_ecosystem_creators(scope,email,display_name,home_destination,portfolio_url,biography,languages,covered_destinations)
           VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
          [
            access.scope,
            email,
            clean.displayName,
            clean.homeDestination,
            clean.portfolioUrl,
            clean.biography,
            clean.languages,
            clean.coveredDestinations,
          ]
        );
        await audit(sql, access, 'creator', row.id, action, row);
        return reply({ entity: mapCreator(row) }, 201);
      });
    }
    if (action === 'create-destination') {
      const clean = cleanDestination(input);
      return await withTransaction(async (sql) => {
        const [row] = await sql.query(
          `INSERT INTO bee_ecosystem_destinations(scope,title,country,territory,description,creative_direction_approved,production_approved,global_budget_reference,created_by)
           VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
          [
            access.scope,
            clean.title,
            clean.country,
            clean.territory,
            clean.description,
            clean.creativeDirectionApproved,
            clean.productionApproved,
            clean.globalBudgetReference,
            access.userId,
          ]
        );
        await audit(sql, access, 'destination', row.id, action, row);
        return reply({ entity: mapDestination(row) }, 201);
      });
    }
    if (action === 'create-kit') {
      need(isUuid(input.destinationId), 'Invalid destination.');
      need(isUuid(input.creatorId), 'Assign an approved Visual Poet.');
      const title = cleanText(input.title, 'kit title', 160, true);
      return await withTransaction(async (sql) => {
        const [[destination], [creator]] = await Promise.all([
          sql.query('SELECT id FROM bee_ecosystem_destinations WHERE id=$1 AND scope=$2', [
            input.destinationId,
            access.scope,
          ]),
          sql.query(
            "SELECT id FROM bee_ecosystem_creators WHERE id=$1 AND scope=$2 AND status IN ('approved','active')",
            [input.creatorId, access.scope]
          ),
        ]);
        need(destination, 'Destination not found.', 404, 'NOT_FOUND');
        need(creator, 'Assign an approved Visual Poet.', 400);
        const [kit] = await sql.query(
          'INSERT INTO bee_ecosystem_kits(scope,destination_id,title,created_by) VALUES($1,$2,$3,$4) RETURNING *',
          [access.scope, input.destinationId, title, access.userId]
        );
        for (const key of requiredAssetSlots) {
          const [slot, index] = key.split(':');
          await sql.query(
            `INSERT INTO bee_ecosystem_assets(scope,kit_id,destination_id,creator_id,slot,slot_index,created_by)
             VALUES($1,$2,$3,$4,$5,$6,$7)`,
            [
              access.scope,
              kit.id,
              input.destinationId,
              input.creatorId,
              slot,
              Number(index),
              access.userId,
            ]
          );
        }
        await audit(sql, access, 'kit', kit.id, action, kit);
        return reply({ entity: mapKit(kit) }, 201);
      });
    }
    if (action === 'create-partner') {
      need(isUuid(input.destinationId), 'Invalid destination.');
      const clean = cleanPartner(input);
      return await withTransaction(async (sql) => {
        const [destination] = await sql.query(
          'SELECT id FROM bee_ecosystem_destinations WHERE id=$1 AND scope=$2',
          [input.destinationId, access.scope]
        );
        need(destination, 'Destination not found.', 404, 'NOT_FOUND');
        const [row] = await sql.query(
          `INSERT INTO bee_ecosystem_partners(scope,destination_id,name,type,description,contact_name,contact_email,contact_phone,website,collaboration_type,exchange_value_amount,exchange_terms,deliverables,evidence_reference,quote_reference,budget_amount,budget_currency,availability_note,safety_note,impact_note,created_by)
           VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21) RETURNING *`,
          [
            access.scope,
            input.destinationId,
            clean.name,
            clean.type,
            clean.description,
            clean.contactName,
            clean.contactEmail,
            clean.contactPhone,
            clean.website,
            clean.collaborationType,
            clean.exchangeValueAmount,
            clean.exchangeTerms,
            clean.deliverables,
            clean.evidenceReference,
            clean.quoteReference,
            clean.budgetAmount,
            clean.budgetCurrency,
            clean.availabilityNote,
            clean.safetyNote,
            clean.impactNote,
            access.userId,
          ]
        );
        await audit(sql, access, 'partner', row.id, action, row);
        return reply({ entity: mapPartner(row) }, 201);
      });
    }
    if (action === 'add-link') {
      const clean = cleanLink(input);
      await assertEntity(sqlClient(), access, clean.entityType, clean.entityId);
      await assertTarget(sqlClient(), access, clean);
      return await withTransaction(async (sql) => {
        const [row] = await sql.query(
          `INSERT INTO bee_ecosystem_links(scope,entity_type,entity_id,target_type,target_id,label,created_by)
           VALUES($1,$2,$3,$4,$5,$6,$7)
           ON CONFLICT(scope,entity_type,entity_id,target_type,target_id) DO NOTHING
           RETURNING *`,
          [
            access.scope,
            clean.entityType,
            clean.entityId,
            clean.targetType,
            clean.targetId,
            clean.label,
            access.userId,
          ]
        );
        need(row, 'This connection already exists.', 409, 'CONFLICT');
        await audit(sql, access, clean.entityType, clean.entityId, action, row);
        return reply({ entity: mapLink(row) }, 201);
      });
    }
    need(false, 'Unknown action.');
  } catch (error) {
    return ecosystemFailure(error);
  }
}

export async function PATCH(request: Request) {
  const denied = rejectCrossSiteWrite(request);
  if (denied) return denied;
  try {
    const access = await ecosystemAccess(request);
    const input = await body(request);
    const action = String(input.action || '');
    need(isUuid(input.entityId), 'Invalid record.');
    const entityId = input.entityId;
    if (action === 'update-creator') {
      return await withTransaction(async (sql) => {
        const [old] = await sql.query(
          'SELECT * FROM bee_ecosystem_creators WHERE id=$1 AND scope=$2 FOR UPDATE',
          [entityId, access.scope]
        );
        need(old, 'Creator not found.', 404, 'NOT_FOUND');
        need(
          access.isTeam || old.user_id === access.userId,
          'Creator access denied.',
          403,
          'FORBIDDEN'
        );
        assertVersion(Number(old.version), input.version);
        const clean = cleanCreatorApplication(input);
        const status = access.isTeam ? old.status : 'requested';
        const [row] = await sql.query(
          `UPDATE bee_ecosystem_creators SET display_name=$1,home_destination=$2,portfolio_url=$3,biography=$4,
           languages=$5,covered_destinations=$6,status=$7,version=version+1,updated_at=now()
           WHERE id=$8 RETURNING *`,
          [
            clean.displayName,
            clean.homeDestination,
            clean.portfolioUrl,
            clean.biography,
            clean.languages,
            clean.coveredDestinations,
            status,
            entityId,
          ]
        );
        await audit(sql, access, 'creator', entityId, action, row);
        return reply({ entity: mapCreator(row) });
      });
    }
    if (
      [
        'review-creator',
        'approve-creator',
        'activate-creator',
        'decline-creator',
        'suspend-creator',
      ].includes(action)
    ) {
      need(
        access.isTeam && ['bee', 'curator'].includes(access.role),
        'Studio access is required.',
        403,
        'FORBIDDEN'
      );
      const next = {
        'review-creator': 'review',
        'approve-creator': 'approved',
        'activate-creator': 'active',
        'decline-creator': 'declined',
        'suspend-creator': 'suspended',
      }[action]!;
      return await withTransaction(async (sql) => {
        const [old] = await sql.query(
          'SELECT * FROM bee_ecosystem_creators WHERE id=$1 AND scope=$2 FOR UPDATE',
          [entityId, access.scope]
        );
        need(old, 'Creator not found.', 404, 'NOT_FOUND');
        assertVersion(Number(old.version), input.version);
        const status = creatorTransition(old.status, next, access.role);
        const [row] = await sql.query(
          'UPDATE bee_ecosystem_creators SET status=$1,version=version+1,updated_at=now() WHERE id=$2 RETURNING *',
          [status, entityId]
        );
        await audit(sql, access, 'creator', entityId, action, row);
        return reply({ entity: mapCreator(row) });
      });
    }
    if (action === 'save-destination') {
      need(access.isTeam, 'Bee team access is required.', 403, 'FORBIDDEN');
      return await withTransaction(async (sql) => {
        const [old] = await sql.query(
          'SELECT * FROM bee_ecosystem_destinations WHERE id=$1 AND scope=$2 FOR UPDATE',
          [entityId, access.scope]
        );
        need(old, 'Destination not found.', 404, 'NOT_FOUND');
        assertVersion(Number(old.version), input.version);
        const clean = cleanDestination(input);
        if (clean.creativeDirectionApproved !== Boolean(old.creative_direction_approved))
          need(
            ['bee', 'curator'].includes(access.role),
            'Creative direction approval is reserved for Bee / Studio.',
            403,
            'FORBIDDEN'
          );
        if (clean.productionApproved !== Boolean(old.production_approved))
          need(
            ['bee', 'production'].includes(access.role),
            'Head of Production approval is required.',
            403,
            'FORBIDDEN'
          );
        const [row] = await sql.query(
          `UPDATE bee_ecosystem_destinations SET title=$1,country=$2,territory=$3,description=$4,
           creative_direction_approved=$5,production_approved=$6,global_budget_reference=$7,
           version=version+1,updated_at=now() WHERE id=$8 RETURNING *`,
          [
            clean.title,
            clean.country,
            clean.territory,
            clean.description,
            clean.creativeDirectionApproved,
            clean.productionApproved,
            clean.globalBudgetReference,
            entityId,
          ]
        );
        await audit(sql, access, 'destination', entityId, action, row);
        return reply({ entity: mapDestination(row) });
      });
    }
    if (['save-asset', 'submit-asset', 'review-asset'].includes(action)) {
      return await withTransaction(async (sql) => {
        const [oldRow] = await sql.query<
          EcosystemAssetAccessRow & {
            slot: CreativeAsset['slot'];
            kit_id: string;
            status: CreativeAsset['status'];
            version: number;
          }
        >(
          `SELECT a.*,c.user_id AS creator_user_id,c.status AS creator_status
           FROM bee_ecosystem_assets a LEFT JOIN bee_ecosystem_creators c ON c.id=a.creator_id
           WHERE a.id=$1 AND a.scope=$2 FOR UPDATE OF a`,
          [entityId, access.scope]
        );
        need(oldRow, 'Asset not found.', 404, 'NOT_FOUND');
        need(canAccessAsset(access, oldRow), 'Asset access denied.', 403, 'FORBIDDEN');
        assertVersion(Number(oldRow.version), input.version);
        let row;
        if (action === 'save-asset') {
          need(
            access.isTeam || ['approved', 'active'].includes(String(oldRow.creator_status)),
            'Your creator profile must be approved before uploading.',
            403,
            'FORBIDDEN'
          );
          let creatorId = oldRow.creator_id;
          if (access.isTeam && input.creatorId !== undefined) {
            need(isUuid(input.creatorId), 'Assign an approved Visual Poet.');
            const [creator] = await sql.query(
              "SELECT id FROM bee_ecosystem_creators WHERE id=$1 AND scope=$2 AND status IN ('approved','active')",
              [input.creatorId, access.scope]
            );
            need(creator, 'Assign an approved Visual Poet.');
            creatorId = input.creatorId;
          }
          const clean = cleanAsset(input, oldRow.slot);
          [row] = await sql.query(
            `UPDATE bee_ecosystem_assets SET creator_id=$1,title=$2,description=$3,location=$4,credit=$5,rights_summary=$6,
             rights_evidence=$7,rights_scope=$8,rights_expires_at=$9,original_source_url=$10,ai_disclosure=$11,soft_fade_consent=$12,width=$13,height=$14,duration_seconds=$15,
             status='draft',authenticity='pending',rights_review='pending',safety='pending',human_creative='pending',review_note='',public_media_id=NULL,
             version=version+1,updated_at=now() WHERE id=$16 RETURNING *`,
            [
              creatorId,
              clean.title,
              clean.description,
              clean.location,
              clean.credit,
              clean.rightsSummary,
              clean.rightsEvidence,
              clean.rightsScope,
              clean.rightsExpiresAt,
              clean.originalSourceUrl,
              clean.aiDisclosure,
              clean.softFadeConsent,
              clean.width,
              clean.height,
              clean.durationSeconds,
              entityId,
            ]
          );
        } else if (action === 'submit-asset') {
          need(
            access.isTeam || ['approved', 'active'].includes(String(oldRow.creator_status)),
            'Your creator profile must be approved before submitting.',
            403,
            'FORBIDDEN'
          );
          need(
            ['draft', 'needs_replacement'].includes(oldRow.status),
            'Asset cannot be submitted from its current state.',
            409,
            'CONFLICT'
          );
          cleanAsset(mapAsset(oldRow as unknown as Record<string, unknown>), oldRow.slot);
          need(oldRow.active_media_id, 'Upload the original asset first.');
          const [media] = await sql.query(
            "SELECT id FROM bee_ecosystem_media WHERE id=$1 AND asset_id=$2 AND purpose='original' AND storage_state='complete'",
            [oldRow.active_media_id, entityId]
          );
          need(media, 'Original upload is incomplete.');
          [row] = await sql.query(
            "UPDATE bee_ecosystem_assets SET status='submitted',version=version+1,updated_at=now() WHERE id=$1 RETURNING *",
            [entityId]
          );
        } else {
          need(
            access.isTeam && ['bee', 'curator'].includes(access.role),
            'Studio review is required.',
            403,
            'FORBIDDEN'
          );
          need(
            ['submitted', 'studio_review'].includes(oldRow.status),
            'Asset is not awaiting review.',
            409,
            'CONFLICT'
          );
          const decision = cleanText(input.decision, 'review decision', 20, true);
          need(['approve', 'replace', 'reject'].includes(decision), 'Unknown review decision.');
          const note = cleanText(input.reviewNote, 'review note', 3000, decision !== 'approve');
          const authenticity = cleanReviewGate(input.authenticity, 'authenticity');
          const rights = cleanReviewGate(input.rights, 'rights');
          const safety = cleanReviewGate(input.safety, 'safety');
          const humanCreative = cleanReviewGate(input.humanCreative, 'human creative review');
          if (decision === 'approve') {
            need(oldRow.active_media_id, 'Approved assets need a complete original.');
            const reviewed = cleanAsset(
              mapAsset(oldRow as unknown as Record<string, unknown>),
              oldRow.slot
            );
            need(
              reviewed.rightsScope === 'public_journeys',
              'Public Journey rights are required for approval.'
            );
            need(
              reviewed.rightsExpiresAt &&
                reviewed.rightsExpiresAt >= new Date().toISOString().slice(0, 10),
              'A current usage-rights end date is required.'
            );
            if (reviewed.aiDisclosure === 'ai_generated') {
              need(
                access.scope === 'demo',
                'AI-generated assets cannot be approved as human creative work.',
                400,
                'INVALID'
              );
              need(
                /\bdemo(?:nstration)?\b/i.test(note) && /\b(?:ai|ia)\b/i.test(note),
                'Demo AI assets need a review note identifying the AI demonstration.'
              );
              need(
                authenticity === 'rejected' &&
                  rights === 'approved' &&
                  safety === 'approved' &&
                  humanCreative === 'rejected',
                'Demo AI review must reject authenticity and human-creative certification while approving rights and safety.'
              );
            } else {
              need(
                [authenticity, rights, safety, humanCreative].every((gate) => gate === 'approved'),
                'Every review gate must be approved.'
              );
            }
          }
          const status =
            decision === 'approve'
              ? 'approved'
              : decision === 'replace'
                ? 'needs_replacement'
                : 'rejected';
          [row] = await sql.query(
            `UPDATE bee_ecosystem_assets SET status=$1,authenticity=$2,rights_review=$3,safety=$4,human_creative=$5,review_note=$6,
             version=version+1,updated_at=now() WHERE id=$7 RETURNING *`,
            [status, authenticity, rights, safety, humanCreative, note, entityId]
          );
        }
        if (action === 'save-asset' || (action === 'review-asset' && row.status !== 'approved'))
          await sql.query('DELETE FROM bee_ecosystem_journey_assets WHERE asset_id=$1', [entityId]);
        await sql.query(
          "UPDATE bee_ecosystem_kits SET status=CASE WHEN status='published' THEN 'in_review' ELSE status END,version=version+1,updated_at=now() WHERE id=$1",
          [oldRow.kit_id]
        );
        await audit(sql, access, 'asset', entityId, action, row);
        return reply({ entity: mapAsset(row) });
      });
    }
    if (action === 'publish-kit') {
      need(
        access.isTeam && ['bee', 'curator'].includes(access.role),
        'Studio publication is required.',
        403,
        'FORBIDDEN'
      );
      return await withTransaction(async (sql) => {
        const [kitRow] = await sql.query(
          'SELECT * FROM bee_ecosystem_kits WHERE id=$1 AND scope=$2 FOR UPDATE',
          [entityId, access.scope]
        );
        need(kitRow, 'Kit not found.', 404, 'NOT_FOUND');
        assertVersion(Number(kitRow.version), input.version);
        const assetRows = await sql.query(
          'SELECT * FROM bee_ecosystem_assets WHERE kit_id=$1 ORDER BY slot,slot_index FOR UPDATE',
          [entityId]
        );
        const assets = assetRows.map(mapAsset);
        need(
          kitReadiness(assets).ready,
          'The kit needs 1 approved Hero, 3 approved Reels and 10 approved photos.'
        );
        const invalidPublicationAssets = await sql.query(
          `SELECT a.id FROM bee_ecosystem_assets a
           LEFT JOIN bee_ecosystem_creators c ON c.id=a.creator_id
           WHERE a.kit_id=$1 AND (
             a.status NOT IN ('approved','published') OR
             NOT (
               (a.ai_disclosure<>'ai_generated' AND a.authenticity='approved' AND
                 a.rights_review='approved' AND a.safety='approved' AND
                 a.human_creative='approved') OR
               ($2='demo' AND a.ai_disclosure='ai_generated' AND
                 a.authenticity='rejected' AND a.rights_review='approved' AND
                 a.safety='approved' AND a.human_creative='rejected' AND
                 a.review_note ~* '\\mdemo(nstration)?\\M' AND
                 a.review_note ~* '\\m(ai|ia)\\M')
             ) OR
             a.rights_scope<>'public_journeys' OR a.rights_evidence='' OR
             a.rights_expires_at IS NULL OR a.rights_expires_at<CURRENT_DATE OR
             c.id IS NULL OR c.status NOT IN ('approved','active') OR
             ($2='studio' AND a.ai_disclosure='ai_generated')
           )`,
          [entityId, access.scope]
        );
        need(
          !invalidPublicationAssets.length,
          'Every asset needs current public rights, completed review gates and an approved creator.'
        );
        need(
          assets.every((asset) => asset.publicMediaId),
          'Every asset needs a reviewed public rendition.'
        );
        const incomplete = await sql.query(
          `SELECT a.id FROM bee_ecosystem_assets a
           LEFT JOIN bee_ecosystem_media m ON m.id=a.public_media_id AND m.asset_id=a.id AND m.purpose='public_rendition' AND m.storage_state='complete'
           WHERE a.kit_id=$1 AND m.id IS NULL`,
          [entityId]
        );
        need(!incomplete.length, 'A public rendition is incomplete.');
        const unlicensedFade = await sql.query(
          `SELECT a.id FROM bee_ecosystem_assets a
           JOIN bee_ecosystem_media m ON m.id=a.public_media_id
           WHERE a.kit_id=$1 AND coalesce(m.metadata->>'softFade','false')='true' AND NOT a.soft_fade_consent`,
          [entityId]
        );
        need(
          !unlicensedFade.length,
          'Soft-fade public renditions require explicit creator consent.'
        );
        const journeyLinks = await sql.query(
          "SELECT target_id FROM bee_ecosystem_links WHERE scope=$1 AND entity_type='kit' AND entity_id=$2 AND target_type='journey'",
          [access.scope, entityId]
        );
        need(journeyLinks.length === 1, 'Link this kit to exactly one Journey before publication.');
        const [journey] = await sql.query(
          'SELECT id::text AS id FROM journeys WHERE id::text=$1 OR slug=$1',
          [journeyLinks[0].target_id]
        );
        need(journey, 'Linked Journey not found.', 404, 'NOT_FOUND');
        if (access.scope === 'studio') {
          await sql.query('DELETE FROM bee_ecosystem_journey_assets WHERE kit_id=$1', [entityId]);
          let position = 0;
          for (const asset of assets) {
            await sql.query(
              'INSERT INTO bee_ecosystem_journey_assets(journey_id,kit_id,asset_id,public_media_id,position) VALUES($1,$2,$3,$4,$5)',
              [journey.id, entityId, asset.id, asset.publicMediaId, position++]
            );
          }
        }
        await sql.query(
          "UPDATE bee_ecosystem_assets SET status='published',version=version+1,updated_at=now() WHERE kit_id=$1",
          [entityId]
        );
        const [row] = await sql.query(
          "UPDATE bee_ecosystem_kits SET status='published',version=version+1,updated_at=now() WHERE id=$1 RETURNING *",
          [entityId]
        );
        await audit(
          sql,
          access,
          'kit',
          entityId,
          access.scope === 'demo' ? 'simulate-publication' : action,
          row
        );
        return reply({ entity: mapKit(row), simulated: access.scope === 'demo' });
      });
    }
    if (action === 'unpublish-kit') {
      need(
        access.isTeam && ['bee', 'curator'].includes(access.role),
        'Studio publication access is required.',
        403,
        'FORBIDDEN'
      );
      return await withTransaction(async (sql) => {
        const [kitRow] = await sql.query(
          'SELECT * FROM bee_ecosystem_kits WHERE id=$1 AND scope=$2 FOR UPDATE',
          [entityId, access.scope]
        );
        need(kitRow, 'Kit not found.', 404, 'NOT_FOUND');
        assertVersion(Number(kitRow.version), input.version);
        need(
          kitRow.status === 'published',
          'Only a published kit can be unpublished.',
          409,
          'CONFLICT'
        );
        await sql.query('DELETE FROM bee_ecosystem_journey_assets WHERE kit_id=$1', [entityId]);
        await sql.query(
          `UPDATE bee_ecosystem_assets
           SET status='approved',version=version+1,updated_at=now()
           WHERE kit_id=$1 AND status='published'`,
          [entityId]
        );
        const [row] = await sql.query(
          `UPDATE bee_ecosystem_kits
           SET status='ready',version=version+1,updated_at=now()
           WHERE id=$1 RETURNING *`,
          [entityId]
        );
        await audit(sql, access, 'kit', entityId, action, row);
        return reply({ entity: mapKit(row), simulated: access.scope === 'demo' });
      });
    }
    if (['save-partner', 'transition-partner'].includes(action)) {
      need(access.isTeam, 'Bee team access is required.', 403, 'FORBIDDEN');
      return await withTransaction(async (sql) => {
        const [oldRow] = await sql.query(
          'SELECT * FROM bee_ecosystem_partners WHERE id=$1 AND scope=$2 FOR UPDATE',
          [entityId, access.scope]
        );
        need(oldRow, 'Partner not found.', 404, 'NOT_FOUND');
        assertVersion(Number(oldRow.version), input.version);
        let row;
        if (action === 'save-partner') {
          const clean = cleanPartner(input);
          const requestedValidation = Boolean(input.productionValidated);
          if (requestedValidation !== Boolean(oldRow.production_validated))
            need(
              ['bee', 'production'].includes(access.role),
              'Production validation is reserved for Bee / Production.',
              403,
              'FORBIDDEN'
            );
          if (requestedValidation)
            need(
              partnerCanBeProductionValidated({
                ...mapPartner(oldRow),
                ...clean,
                productionValidated: true,
              }),
              'Production validation requires structured contact details and documented exchange value, rights and deliverables.'
            );
          [row] = await sql.query(
            `UPDATE bee_ecosystem_partners SET name=$1,type=$2,description=$3,contact_name=$4,contact_email=$5,contact_phone=$6,website=$7,
             collaboration_type=$8,exchange_value_amount=$9,exchange_terms=$10,deliverables=$11,evidence_reference=$12,quote_reference=$13,
             budget_amount=$14,budget_currency=$15,availability_note=$16,safety_note=$17,impact_note=$18,production_validated=$19,
             status=CASE WHEN status='ready_to_sell' THEN 'under_review' ELSE status END,version=version+1,updated_at=now() WHERE id=$20 RETURNING *`,
            [
              clean.name,
              clean.type,
              clean.description,
              clean.contactName,
              clean.contactEmail,
              clean.contactPhone,
              clean.website,
              clean.collaborationType,
              clean.exchangeValueAmount,
              clean.exchangeTerms,
              clean.deliverables,
              clean.evidenceReference,
              clean.quoteReference,
              clean.budgetAmount,
              clean.budgetCurrency,
              clean.availabilityNote,
              clean.safetyNote,
              clean.impactNote,
              requestedValidation,
              entityId,
            ]
          );
        } else {
          const old = mapPartner(oldRow);
          const status = partnerTransition(old, input.status, access.role);
          [row] = await sql.query(
            'UPDATE bee_ecosystem_partners SET status=$1,version=version+1,updated_at=now() WHERE id=$2 RETURNING *',
            [status, entityId]
          );
        }
        await audit(sql, access, 'partner', entityId, action, row);
        return reply({ entity: mapPartner(row) });
      });
    }
    if (action === 'remove-link') {
      need(access.isTeam, 'Bee team access is required.', 403, 'FORBIDDEN');
      return await withTransaction(async (sql) => {
        const [link] = await sql.query(
          'DELETE FROM bee_ecosystem_links WHERE id=$1 AND scope=$2 RETURNING *',
          [entityId, access.scope]
        );
        need(link, 'Link not found.', 404, 'NOT_FOUND');
        await audit(sql, access, link.entity_type, link.entity_id, action, link);
        return reply({ removed: entityId });
      });
    }
    need(false, 'Unknown action.');
  } catch (error) {
    return ecosystemFailure(error);
  }
}
