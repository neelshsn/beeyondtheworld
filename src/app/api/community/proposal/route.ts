import { NextResponse } from 'next/server';
import { randomUUID, createHash } from 'node:crypto';
import sharp from 'sharp';
import { currentUser, workspace } from '@/lib/community/server';
import { withTransaction, sqlClient } from '@/lib/db/client';
import { rejectCrossSiteWrite } from '@/lib/db/admin-guard';
import {
  initialProposal,
  mutateProposal,
  roleKey,
  sourceKind,
  visualKey,
  M,
  type ProposalState,
  type ProposalOperation,
} from '@/lib/community/proposal';
import type { Workspace } from '@/lib/community/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'private, no-store' };
class Rejected extends Error {
  constructor(
    message: string,
    public status = 400
  ) {
    super(message);
  }
}
type Stored = {
  id: string;
  version: number;
  status: string;
  data: { state: ProposalState; sources: string };
  updated_at: string;
};
const fail = (e: unknown) =>
  NextResponse.json(
    { error: e instanceof Rejected ? e.message : 'The proposal could not be saved. Please retry.' },
    { status: e instanceof Rejected ? e.status : 500, headers }
  );
const statusOf = (s: ProposalState) =>
  s['da-brand-approved']
    ? 'approved'
    : s['da-bee-approved']
      ? 'brand_review'
      : s['da-proposal-submitted']
        ? 'submitted'
        : 'draft';
type Sql = ReturnType<typeof sqlClient>;
async function sources(sql: Sql, project: string) {
  const records = await sql.query(
    'SELECT id,kind,version FROM bee_community_records WHERE project_id=$1 ORDER BY id',
    [project]
  );
  const creative = await sql.query(
    `SELECT i.id,i.version FROM bee_creative_items i WHERE (i.kind='collection' AND i.data->>'projectId'=$1) OR (i.kind='content' AND EXISTS(SELECT 1 FROM bee_creative_items c WHERE c.kind='collection' AND c.scope=i.scope AND c.data->>'projectId'=$1 AND c.data->'contentIds' ? i.id::text)) ORDER BY i.id`,
    [project]
  );
  const core = records.filter((r) => sourceKind(r.kind)).map((r) => [r.id, r.version]);
  return JSON.stringify(
    creative.length ? [...core, ...creative.map((r) => [r.id, r.version])] : core
  );
}
async function log(
  sql: Sql,
  w: Workspace,
  actor: string,
  r: Stored,
  previous: string,
  action: string
) {
  await sql.query(
    `INSERT INTO bee_community_events(id,project_id,record_id,actor_id,action,previous_state,new_state,comment,snapshot) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)`,
    [
      randomUUID(),
      w.project.id,
      r.id,
      actor,
      action,
      previous,
      r.status,
      `${w.project.is_demo ? 'Demo · ' : ''}${roleKey(w.project.role)}`,
      JSON.stringify({ version: r.version, role: w.project.role, state: r.data.state }),
    ]
  );
}
async function save(
  sql: Sql,
  w: Workspace,
  actor: string,
  existing: Stored | undefined,
  state: ProposalState,
  sourceStamp: string,
  action: string
) {
  const data = { state, sources: sourceStamp };
  const [row] = existing
    ? await sql.query<Stored>(
        'UPDATE bee_community_records SET data=$1::jsonb,title=$2,status=$3,version=version+1,updated_at=now() WHERE id=$4 RETURNING *',
        [
          JSON.stringify(data),
          String(state['tale-title'] || 'Creative proposal').slice(0, 160),
          statusOf(state),
          existing.id,
        ]
      )
    : await sql.query<Stored>(
        `INSERT INTO bee_community_records(id,project_id,kind,title,status,data,organization,created_by) VALUES($1,$2,'da:proposal',$3,$4,$5::jsonb,$6,$7) RETURNING *`,
        [
          randomUUID(),
          w.project.id,
          String(state['tale-title'] || 'Creative proposal').slice(0, 160),
          statusOf(state),
          JSON.stringify(data),
          w.user.organization,
          actor,
        ]
      );
  await log(sql, w, actor, row, existing?.status || '', action);
  return row;
}
async function response(sql: Sql, w: Workspace, r?: Stored) {
  const history = r
    ? await sql.query(
        `SELECT e.id,e.action,e.new_state,e.comment,e.created_at,u.name AS actor FROM bee_community_events e JOIN bee_community_users u ON u.id=e.actor_id WHERE e.record_id=$1 ORDER BY e.created_at DESC LIMIT 30`,
        [r.id]
      )
    : [];
  return NextResponse.json(
    {
      id: r?.id || null,
      version: r?.version || 0,
      state: r?.data.state || initialProposal(w.project),
      status: r?.status || 'draft',
      updatedAt: r?.updated_at || null,
      history,
    },
    { headers }
  );
}
export async function GET(request: Request) {
  try {
    const q = new URL(request.url).searchParams;
    const project = q.get('project');
    if (!project || !/^[a-f0-9-]{36}$/.test(project)) throw new Rejected('Select a project.');
    const w = await workspace(project),
      actor = await currentUser();
    if (!w || !actor) throw new Rejected('Access denied.', 403);
    const file = q.get('file');
    if (file) {
      if (!/^[a-f0-9-]{36}$/.test(file)) throw new Rejected('Image not found.', 404);
      const [f] = await sqlClient().query(
        `SELECT f.content,f.mime FROM bee_community_files f JOIN bee_community_records r ON r.id=f.record_id WHERE f.id=$1 AND r.project_id=$2 AND r.kind='da:proposal'`,
        [file, project]
      );
      if (!f) throw new Rejected('Image not found.', 404);
      return new Response(new Uint8Array(f.content), {
        headers: {
          ...headers,
          'Content-Type': f.mime,
          'X-Content-Type-Options': 'nosniff',
          'Content-Disposition': 'inline',
        },
      });
    }
    return await withTransaction(async (sql) => {
      await sql.query('SELECT pg_advisory_xact_lock(hashtext($1)::bigint)', [project]);
      let [r] = await sql.query<Stored>(
        `SELECT * FROM bee_community_records WHERE project_id=$1 AND kind='da:proposal'`,
        [project]
      );
      if (r) {
        const stamp = await sources(sql, project);
        if (r.data.sources !== stamp) {
          M.invalidate(r.data.state);
          for (const p of M.poles) r.data.state['da-status-' + p.id] = 'Draft';
          r.data.state['da-source-notice'] =
            'Connected production records changed. Review the contributions again.';
          r = await save(sql, w, actor.id, r, r.data.state, stamp, 'proposal_sources_changed');
        }
      }
      return response(sql, w, r);
    });
  } catch (e) {
    return fail(e);
  }
}
export async function PATCH(request: Request) {
  return write(request, false);
}
export async function POST(request: Request) {
  return write(request, true);
}
async function write(request: Request, upload: boolean) {
  const denied = rejectCrossSiteWrite(request);
  if (denied) return denied;
  try {
    const actor = await currentUser();
    if (!actor) throw new Rejected('Access denied.', 403);
    let body: { projectId: string; version: number; operation: ProposalOperation };
    let image: { bytes: Buffer; name: string; key: string } | undefined;
    if (upload) {
      if (Number(request.headers.get('content-length')) > 4.3 * 1024 * 1024)
        throw new Rejected('Image must be smaller than 4 MB.');
      const form = await request.formData();
      const file = form.get('file'),
        key = String(form.get('key') || '');
      if (
        !(file instanceof File) ||
        file.size > 4 * 1024 * 1024 ||
        !visualKey.test(key) ||
        !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
      )
        throw new Rejected('Choose a JPEG, PNG or WebP image smaller than 4 MB.');
      body = {
        projectId: String(form.get('projectId')),
        version: Number(form.get('version')),
        operation: { action: 'upload' },
      };
      // Decode before storage; original names, metadata and executable formats never become URLs.
      const bytes = await sharp(Buffer.from(await file.arrayBuffer()), {
        limitInputPixels: 40_000_000,
      })
        .rotate()
        .resize(1800, 1800, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 84 })
        .toBuffer();
      if (bytes.length > 3 * 1024 * 1024)
        throw new Rejected('This image is too large after optimisation.');
      image = { bytes, name: file.name.slice(0, 180), key };
    } else {
      const raw = await request.text();
      if (raw.length > 200000) throw new Rejected('Too many edits at once.');
      body = JSON.parse(raw);
    }
    if (
      !/^[a-f0-9-]{36}$/.test(body.projectId) ||
      !Number.isInteger(body.version) ||
      !body.operation ||
      typeof body.operation.action !== 'string'
    )
      throw new Rejected('Invalid proposal request.');
    const w = await workspace(body.projectId);
    if (!w) throw new Rejected('Access denied.', 403);
    return await withTransaction(async (sql) => {
      await sql.query('SELECT pg_advisory_xact_lock(hashtext($1)::bigint)', [w.project.id]);
      let [r] = await sql.query<Stored>(
        `SELECT * FROM bee_community_records WHERE project_id=$1 AND kind='da:proposal' FOR UPDATE`,
        [w.project.id]
      );
      if ((r?.version || 0) !== body.version)
        throw new Rejected(
          'Another person updated this proposal. Reload the shared version before continuing; your pending edits remain on screen.',
          409
        );
      const stamp = await sources(sql, w.project.id);
      if (r && r.data.sources !== stamp)
        throw new Rejected('Connected production records changed. Reload before continuing.', 409);
      const state: ProposalState = structuredClone(r?.data.state || initialProposal(w.project));
      if (image) {
        if (!M.lead(roleKey(w.project.role)))
          throw new Rejected('The creative lead manages the proposal visuals.', 403);
        const [usage] = await sql.query(
          'SELECT COALESCE(sum(size),0) AS bytes FROM bee_community_files WHERE record_id=$1',
          [r?.id || randomUUID()]
        );
        if (Number(usage.bytes) + image.bytes.length > 48 * 1024 * 1024)
          throw new Rejected('The proposal image library reached its 48 MB limit.');
        if (!r) r = await save(sql, w, actor.id, undefined, state, stamp, 'proposal_created');
        const id = randomUUID();
        await sql.query(
          'INSERT INTO bee_community_files(id,record_id,name,mime,size,content,sha256) VALUES($1,$2,$3,$4,$5,$6,$7)',
          [
            id,
            r.id,
            image.name,
            'image/webp',
            image.bytes.length,
            image.bytes,
            createHash('sha256').update(image.bytes).digest('hex'),
          ]
        );
        M.edit(
          state,
          'da-upload-' + image.key,
          `/api/community/proposal?project=${w.project.id}&file=${id}`
        );
      } else {
        const error = mutateProposal(
          state,
          body.operation,
          roleKey(w.project.role),
          w.members,
          w.user.id
        );
        if (error) throw new Rejected(error, 403);
      }
      r = await save(sql, w, actor.id, r, state, stamp, 'proposal_' + body.operation.action);
      return response(sql, w, r);
    });
  } catch (e) {
    return fail(e);
  }
}
