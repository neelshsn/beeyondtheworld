import 'server-only';
import { currentUser } from '@/lib/community/server';
import { sqlClient } from '@/lib/db/client';
import { CreativeError, need, type CreativeRole } from './model';
export type Catalog = {
  user: { email: string; name: string; role: string };
  companies: {
    id: string;
    name: string;
    owner_id: string | null;
    relationship_owner_id: string | null;
  }[];
  opportunities: {
    id: string;
    company_id: string;
    title: string;
    stage: string;
    owner_id: string | null;
  }[];
  briefs: { id: string; company_id: string; title: string; status: string }[];
  productions: {
    id: string;
    company_id: string;
    opportunity_id: string;
    title: string;
    status: string;
  }[];
};
// Only the CRM session cookie goes to the fixed first-party CRM origin.
export async function crmCatalog(request: Request): Promise<Catalog | null> {
  const cookie = (request.headers.get('cookie') || '')
    .split(';')
    .find((c) => /^\s*(__Host-bee_session|bee_session)=[a-f0-9]{64}$/.test(c));
  if (!cookie) return null;
  const origin =
    process.env.NODE_ENV !== 'production' && process.env.CREATIVE_CRM_ORIGIN
      ? process.env.CREATIVE_CRM_ORIGIN
      : 'https://beeyondtheworld.com';
  try {
    const r = await fetch(origin + '/sales/api/creative-catalog', {
      headers: { cookie: cookie.trim() },
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(12000),
    });
    return r.ok ? await r.json() : null;
  } catch {
    return null;
  }
}
export async function creativeAccess(request: Request) {
  const [user, crm] = await Promise.all([currentUser(), crmCatalog(request)]);
  const scope = new URL(request.url).searchParams.get('scope') === 'demo' ? 'demo' : 'studio';
  const email = (
    scope === 'studio' ? crm?.user.email || user?.email || '' : user?.email || crm?.user.email || ''
  ).toLowerCase();
  need(email, 'Sign in to Community or the sales CRM.', 401);
  const [grant] = await sqlClient().query<{ role: CreativeRole; demo_only: boolean }>(
    'SELECT role,demo_only FROM bee_creative_access WHERE email=$1',
    [email]
  );
  need(grant, 'This creative library is reserved for the studio team.', 403);
  need(
    !grant.demo_only || scope === 'demo',
    'Use the demonstration library with this test account.',
    403
  );
  const [identity] =
    user?.email.toLowerCase() === email
      ? [user]
      : await sqlClient().query(
          'SELECT id FROM bee_community_users WHERE lower(email)=$1 AND NOT disabled',
          [email]
        );
  const projects = identity
    ? await sqlClient().query(
        `SELECT p.id,p.title,p.territory,p.is_demo,m.role FROM bee_community_projects p JOIN bee_community_members m ON m.project_id=p.id WHERE m.user_id=$1 AND m.role IN ('bee','art_director','production') AND p.is_demo=$2 ORDER BY p.title`,
        [identity.id, scope === 'demo']
      )
    : [];
  // Do not join another person's commercial session to the signed-in Community identity.
  const simulated = new URL(request.url).searchParams.get('role');
  const role =
    scope === 'demo' &&
    ['bee', 'curator', 'production', 'contributor', 'viewer'].includes(simulated || '')
      ? (simulated as CreativeRole)
      : grant.role;
  const demoCrm: Catalog = {
    user: { email, name: 'Demo team', role: 'admin' },
    companies: [
      {
        id: 'c0000000-0000-4000-8000-000000000001',
        name: 'Craie · demonstration',
        owner_id: null,
        relationship_owner_id: null,
      },
    ],
    opportunities: [
      {
        id: 'c0000000-0000-4000-8000-000000000002',
        company_id: 'c0000000-0000-4000-8000-000000000001',
        title: 'Carry the light · simulated booking',
        stage: 'won',
        owner_id: null,
      },
    ],
    briefs: [
      {
        id: 'c0000000-0000-4000-8000-000000000003',
        company_id: 'c0000000-0000-4000-8000-000000000001',
        title: 'Morocco · demonstration brief',
        status: 'ready',
      },
    ],
    productions: [],
  };
  return {
    email,
    role,
    scope,
    projects,
    crm: scope === 'demo' ? demoCrm : crm?.user.email.toLowerCase() === email ? crm : null,
    userId: identity?.id || null,
  };
}
export function creativeFailure(e: unknown) {
  return Response.json(
    {
      error:
        e instanceof CreativeError
          ? e.message
          : 'The creative workspace is temporarily unavailable.',
    },
    {
      status: e instanceof CreativeError ? e.status : 503,
      headers: { 'Cache-Control': 'private, no-store' },
    }
  );
}
