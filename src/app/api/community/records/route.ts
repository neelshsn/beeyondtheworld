import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { workspace, sqlClient } from '@/lib/community/server';
import { availableTransitions, canEdit, kinds, validateFields } from '@/lib/community/model';
import { withTransaction } from '@/lib/db/client';
import type { CommunityRecord } from '@/lib/community/types';
import { transitionError } from '@/lib/community/rules';
import { rejectCrossSiteWrite } from '@/lib/db/admin-guard';
import { privateProductionFields } from '@/lib/community/horizon';
import { studioMutationError } from '@/lib/community/studio';
export const runtime = 'nodejs';
function fail(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}
export async function POST(request: Request) {
  return mutate(request, false);
}
export async function PATCH(request: Request) {
  return mutate(request, true);
}
async function mutate(request: Request, update: boolean) {
  const denied = rejectCrossSiteWrite(request);
  if (denied) return denied;
  try {
    const raw = await request.text();
    if (raw.length > 50000) return fail('Record is too large.');
    const body = JSON.parse(raw);
    if (typeof body.projectId !== 'string') return fail('Select a project.');
    const w = await workspace(body.projectId);
    if (!w) return fail('Access denied.', 403);
    const sql = sqlClient();
    const id = update ? body.id : randomUUID();
    const existing = update ? w.records.find((r) => r.id === id) : null;
    if (update && !existing) return fail('Record not found.', 404);
    const kind = existing?.kind || body.kind;
    const spec = kinds[kind];
    if (!spec) return fail('Unknown record type.');
    const comment = typeof body.comment === 'string' ? body.comment.trim().slice(0, 2000) : '';
    let title = existing?.title || '';
    let data = existing?.data || {};
    let status = existing?.status || spec.initial;
    let event = 'created';
    if (body.to) {
      if (
        !existing ||
        !availableTransitions(w.project.role, existing, w.user).some((t) => t.to === body.to)
      )
        return fail('This transition is not available to your role.', 403);
      const error = transitionError(existing, body.to, w);
      if (error) return fail(error);
      if (body.to === 'needs_update' && !comment) return fail('Explain the changes needed.');
      status = body.to;
      event = 'transition';
    } else if (body.assignMember) {
      if (
        !existing ||
        !['bee', 'production'].includes(w.project.role) ||
        !['invite', 'agreements', 'bookings', 'call-sheet', 'transport', 'stay', 'fitting']
          .map((id) => 'horizon:' + id)
          .includes(kind)
      )
        return fail('Only the coordination team can assign this record.', 403);
      const [member] = await sql.query(
        'SELECT user_id FROM bee_community_members WHERE project_id=$1 AND user_id=$2',
        [w.project.id, body.assignMember]
      );
      if (!member) return fail('Select a project member.');
      data = { ...data, assigneeId: body.assignMember };
      event = 'member_assigned';
    } else if (body.assignReviewer) {
      if (
        !existing ||
        w.project.role !== 'bee' ||
        ![
          'evidence',
          'result',
          'action',
          'horizon:indicator',
          'horizon:expert-review',
          'horizon:evidence-add',
        ].includes(kind)
      )
        return fail('Only Bee Core can assign an expert.', 403);
      const [expert] = await sql.query(
        "SELECT user_id FROM bee_community_members WHERE project_id=$1 AND user_id=$2 AND role='expert'",
        [w.project.id, body.assignReviewer]
      );
      if (!expert) return fail('Select an assigned expert.');
      data = { ...data, reviewerId: body.assignReviewer };
      event = 'reviewer_assigned';
    } else {
      if (
        existing ? !canEdit(w.project.role, existing, w.user) : !spec.roles.includes(w.project.role)
      )
        return fail('This record cannot be edited by your role.', 403);
      title = typeof body.title === 'string' ? body.title.trim() : '';
      if (!title || title.length > 160) return fail('Add a title of up to 160 characters.');
      const parsed = validateFields(kind, body.data);
      if (parsed.error) return fail(parsed.error);
      data = parsed.data;
      const studioError = studioMutationError(kind, data, w, existing?.id);
      if (studioError) return fail(studioError, 403);
      if (w.project.role === 'production') {
        const hidden = privateProductionFields[kind] || [];
        if (hidden.some((key) => Object.hasOwn(data, key)))
          return fail('This budget layer belongs to Bee.', 403);
        if (existing && hidden.length) {
          const [original] = await sql.query(
            'SELECT data FROM bee_community_records WHERE id=$1 AND project_id=$2',
            [existing.id, w.project.id]
          );
          for (const key of hidden)
            if (original.data[key] !== undefined) data[key] = original.data[key];
        }
      }
      if (
        kind === 'task' &&
        !['bee', 'production', 'art_director'].includes(w.project.role) &&
        data.assignedRole !== w.project.role
      )
        return fail('Create tasks for your own production pole.', 403);
      if (existing?.data.reviewerId) data.reviewerId = existing.data.reviewerId;
      if (existing?.data.assigneeId) data.assigneeId = existing.data.assigneeId;
      for (const f of spec.fields.filter((f) => f.type === 'record')) {
        const linked = w.records.find((r) => r.id === data[f.key] && (f.linkKind || '').split('|').includes(r.kind));
        if (data[f.key] && !linked) return fail(`Select an accessible ${f.label.toLowerCase()}.`);
        if (linked?.kind === 'allocation' && linked.data.layer !== 'Impact')
          return fail('Use an Impact Capital allocation.');
      }
      if (existing) event = 'updated';
    }
    if (existing && Number(body.version) !== existing.version)
      return fail('This record changed. Refresh and try again.', 409);
    return await withTransaction(async (sql) => {
      if (kind.startsWith('studio:') || (existing && body.to && kind.startsWith('horizon:'))) {
        await sql.query('SELECT pg_advisory_xact_lock(hashtext($1)::bigint)', [w.project.id]);
        const fresh = await sql.query<CommunityRecord>(
          'SELECT * FROM bee_community_records WHERE project_id=$1',
          [w.project.id]
        );
        const files = await sql.query(
          'SELECT id,record_id,name,mime,size,sha256 FROM bee_community_files WHERE record_id IN (SELECT id FROM bee_community_records WHERE project_id=$1)',
          [w.project.id]
        );
        for (const r of fresh)
          r.files = files.filter((f) => f.record_id === r.id) as CommunityRecord['files'];
        const current = fresh.find((r) => r.id === existing?.id);
        if (existing && (!current || current.version !== existing.version))
          return fail('This record changed. Refresh and try again.', 409);
        const error =
          body.to && current
            ? transitionError(current, status, { ...w, records: fresh })
            : studioMutationError(kind, data, { ...w, records: fresh }, existing?.id);
        if (error) return fail(error);
      }
      if (existing?.kind === 'expense' && status === 'approved') {
        // Lock the allocation, then read a fresh snapshot so simultaneous reviews
        // cannot reserve more than the available amount.
        await sql.query(
          'SELECT id FROM bee_community_records WHERE id=$1 AND project_id=$2 FOR UPDATE',
          [existing.data.allocationId, w.project.id]
        );
        const fresh = await sql.query<CommunityRecord>(
          'SELECT * FROM bee_community_records WHERE project_id=$1',
          [w.project.id]
        );
        const error = transitionError(existing, status, { ...w, records: fresh });
        if (error) return fail(error);
      }
      let rows;
      if (existing) {
        rows = await sql.query(
          `WITH changed AS (UPDATE bee_community_records SET title=$1,status=$2,data=$3::jsonb,version=version+1,updated_at=now() WHERE id=$4 AND project_id=$5 AND version=$6 RETURNING *), logged AS (INSERT INTO bee_community_events(id,project_id,record_id,actor_id,action,previous_state,new_state,comment,snapshot) SELECT $7,project_id,id,$8,$9,$10,status,$11,to_jsonb(changed) FROM changed) SELECT id FROM changed`,
          [
            title,
            status,
            JSON.stringify(data),
            id,
            w.project.id,
            existing.version,
            randomUUID(),
            w.user.id,
            event,
            existing.status,
            comment,
          ]
        );
      } else {
        rows = await sql.query(
          `WITH changed AS (INSERT INTO bee_community_records(id,project_id,kind,title,status,data,organization,created_by) VALUES($1,$2,$3,$4,$5,$6::jsonb,$7,$8) RETURNING *), logged AS (INSERT INTO bee_community_events(id,project_id,record_id,actor_id,action,new_state,comment,snapshot) SELECT $9,project_id,id,$8,'created',status,$10,to_jsonb(changed) FROM changed) SELECT id FROM changed`,
          [
            id,
            w.project.id,
            kind,
            title,
            status,
            JSON.stringify(data),
            w.user.organization,
            w.user.id,
            randomUUID(),
            comment,
          ]
        );
      }
      if (!rows.length) return fail('The record changed. Refresh and try again.', 409);
      return NextResponse.json({ ok: true, id });
    });
  } catch {
    return fail('The record could not be saved. Please retry.', 500);
  }
}
