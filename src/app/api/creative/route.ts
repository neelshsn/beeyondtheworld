import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { sqlClient, withTransaction } from '@/lib/db/client';
import { rejectCrossSiteWrite } from '@/lib/db/admin-guard';
import { creativeAccess, creativeFailure } from '@/lib/creative/server';
import {
  creativeKinds,
  cleanItem,
  need,
  transition,
  canPublish,
  relatedContent,
  usable,
  type CreativeItem,
  type CreativeKind,
} from '@/lib/creative/model';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const reply = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'private, no-store' } });
export async function GET(request: Request) {
  try {
    const a = await creativeAccess(request);
    const url = new URL(request.url);
    const company = url.searchParams.get('company');
    if (company) {
      need(
        a.crm?.companies.some((x) => x.id === company),
        'CRM brand unavailable.',
        403
      );
      const collections = await sqlClient().query<CreativeItem>(
        "SELECT id,title,status,jsonb_build_object('projectId',data->>'projectId','intention',data->>'intention') AS data FROM bee_creative_items WHERE scope=$1 AND kind='collection' AND data->>'companyId'=$2 AND status<>'archived' ORDER BY updated_at DESC",
        [a.scope, company]
      );
      return reply({ collections });
    }
    const file = url.searchParams.get('file');
    if (file) {
      need(/^[a-f0-9-]{36}$/i.test(file), 'Invalid file.');
      const [f] = await sqlClient().query(
        'SELECT f.bytes,f.mime FROM bee_creative_files f JOIN bee_creative_items i ON i.id=f.item_id WHERE f.id=$1 AND i.scope=$2',
        [file, a.scope]
      );
      need(f, 'Image unavailable.', 404);
      return new Response(new Uint8Array(f.bytes), {
        headers: {
          'Content-Type': f.mime,
          'Cache-Control': 'private, no-store',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }
    const [items, history] = await Promise.all([
      sqlClient().query<CreativeItem>(
        'SELECT * FROM bee_creative_items WHERE scope=$1 ORDER BY updated_at DESC,id',
        [a.scope]
      ),
      sqlClient().query(
        'SELECT e.id,e.item_id,e.actor,e.action,e.created_at FROM bee_creative_events e JOIN bee_creative_items i ON i.id=e.item_id WHERE i.scope=$1 ORDER BY e.created_at DESC LIMIT 60',
        [a.scope]
      ),
    ]);
    return reply({ ...a, items, history });
  } catch (e) {
    return creativeFailure(e);
  }
}
export async function POST(request: Request) {
  const denied = rejectCrossSiteWrite(request);
  if (denied) return denied;
  try {
    const a = await creativeAccess(request);
    need(a.role !== 'viewer', 'Read-only access.', 403);
    const raw = await request.text();
    need(raw.length < 4.2 * 1024 * 1024, 'Request too large.', 413);
    const b = JSON.parse(raw);
    if (b.action === 'create-project') {
      need(a.role === 'bee' && a.userId, 'Bee Community access is required.', 403);
      need(
        typeof b.title === 'string' &&
          b.title.trim().length > 1 &&
          b.title.length <= 160 &&
          typeof b.territory === 'string' &&
          b.territory.trim() &&
          b.territory.length <= 120,
        'Add a production name and destination.'
      );
      const id = randomUUID();
      await withTransaction(async (sql) => {
        await sql.query(
          'INSERT INTO bee_community_projects(id,title,territory,season,is_demo) VALUES($1,$2,$3,$4,$5)',
          [id, b.title.trim(), b.territory.trim(), 'Planning', a.scope === 'demo']
        );
        await sql.query(
          "INSERT INTO bee_community_members(project_id,user_id,role) SELECT $1,u.id,CASE WHEN a.role='bee' THEN 'bee' ELSE 'art_director' END FROM bee_creative_access a JOIN bee_community_users u ON lower(u.email)=a.email WHERE NOT u.disabled AND (a.email=$2 OR (NOT a.demo_only AND a.role IN ('bee','curator')))",
          [id, a.email]
        );
      });
      return reply({ projectId: id });
    }
    need(!b.id || /^[a-f0-9-]{36}$/i.test(b.id), 'Invalid record.');
    return await withTransaction(async (sql) => {
      await sql.query("SELECT pg_advisory_xact_lock(hashtext('creative:'||$1))", [a.scope]);
      const all = await sql.query<CreativeItem>('SELECT * FROM bee_creative_items WHERE scope=$1', [
        a.scope,
      ]);
      const old = all.find((x) => x.id === b.id);
      if (b.id) need(old, 'Record not found.', 404);
      if (old)
        need(
          old.version === b.version,
          'This record changed. Reload before saving; your form is preserved.',
          409
        );
      const kind = (old?.kind || b.kind) as CreativeKind;
      need(creativeKinds.includes(kind), 'Unknown record type.');
      const id = old?.id || randomUUID();
      let title = old?.title || '',
        data = { ...(old?.data || {}) },
        status = old?.status || 'draft';
      if (b.action === 'save') {
        need(old?.status !== 'confirmed', 'Cancel the booking before changing its agreement.');
        const clean = cleanItem(b, kind);
        title = clean.title;
        data = { ...clean.data };
        if (old?.data.mediaId) data.mediaId = old.data.mediaId;
        // Editing any evidence or creative choice reopens approval and removes publication.
        status = 'draft';
        data.verification = 'pending';
        data.published = 'no';
        for (const [field, target] of Object.entries({
          talentId: 'talent',
          destinationId: 'destination',
          collectionId: 'collection',
        })) {
          if (data[field])
            need(
              all.some((x) => x.id === data[field] && x.kind === target && x.status !== 'archived'),
              `Choose an active ${target} from this library.`
            );
        }
        if (kind === 'collection') {
          need(
            (data.talentIds as string[]).every((id) =>
              all.some((x) => x.id === id && x.kind === 'talent' && x.status !== 'archived')
            ),
            'Some linked team members are unavailable.'
          );
          const ids = data.contentIds as string[];
          need(
            ids.every((id) =>
              all.some((x) => x.id === id && x.kind === 'content' && x.status !== 'archived')
            ),
            'Some selected contents are unavailable.'
          );
          if (data.companyId) {
            need(a.crm, 'Sign in to the sales CRM with the same account to link a real brand.');
            need(
              a.crm?.companies.some((x) => x.id === data.companyId),
              'CRM brand not found.'
            );
          }
          if (data.opportunityId)
            need(
              a.crm?.opportunities.some(
                (x) => x.id === data.opportunityId && x.company_id === data.companyId
              ),
              'Choose an opportunity belonging to this brand.'
            );
          if (data.briefId)
            need(
              a.crm?.briefs.some((x) => x.id === data.briefId && x.company_id === data.companyId),
              'Choose a brief belonging to this brand.'
            );
        }
        if (data.projectId)
          need(
            a.projects.some((p) => p.id === data.projectId),
            'You cannot link this production.',
            403
          );
        if (kind === 'activation') {
          const c = all.find((x) => x.id === data.collectionId)!;
          need(c.status === 'approved', 'Approve the portfolio before opening a brand journey.');
          need(
            data.projectId === c.data.projectId && data.opportunityId === c.data.opportunityId,
            'The production and opportunity must match the selected portfolio.'
          );
        }
      } else {
        need(old, 'Save the record first.');
        if (b.action === 'upload') {
          need(kind === 'content', 'Images belong to a content record.');
          need(
            typeof b.image === 'string' && /^data:image\/(png|jpeg|webp);base64,/.test(b.image),
            'Use JPEG, PNG or WebP.'
          );
          const input = Buffer.from(b.image.split(',')[1], 'base64');
          need(input.length <= 3 * 1024 * 1024, 'Maximum image size: 3 MB.');
          const bytes = await sharp(input, { limitInputPixels: 24000000 })
            .rotate()
            .resize({ width: 1800, height: 1400, fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 82 })
            .toBuffer();
          const [usage] = await sql.query(
            'SELECT coalesce(sum(octet_length(f.bytes)),0)::bigint as size FROM bee_creative_files f JOIN bee_creative_items i ON i.id=f.item_id WHERE i.scope=$1',
            [a.scope]
          );
          need(
            Number(usage.size) + bytes.length < 128 * 1024 * 1024,
            'Library image storage is full.'
          );
          const mediaId = randomUUID();
          await sql.query(
            'INSERT INTO bee_creative_files(id,item_id,name,mime,bytes) VALUES($1,$2,$3,$4,$5)',
            [mediaId, id, String(b.name || 'Image').slice(0, 160), 'image/webp', bytes]
          );
          data.mediaId = mediaId;
          data.published = 'no';
          data.verification = 'pending';
          status = 'draft';
        } else if (b.action === 'verify') {
          need(kind === 'content' && a.role === 'bee', 'Bee reviews provenance evidence.', 403);
          need(
            data.evidenceUrl && data.provenance === 'Organic original',
            'Attach evidence of the original source. AI concepts cannot be certified organic.'
          );
          data.verification = 'verified';
          data.verifiedBy = a.email;
        } else if (b.action === 'publish') {
          need(
            a.scope === 'studio' && ['bee', 'curator'].includes(a.role),
            'Public showreel publication is reserved for the real studio.',
            403
          );
          need(
            canPublish(old!, all),
            'Publication requires curation, Bloom feasibility, original-source verification, public rights and an uploaded image.'
          );
          data.published = 'yes';
        } else if (b.action === 'unpublish') {
          need(['bee', 'curator'].includes(a.role), 'Studio access required.', 403);
          data.published = 'no';
        } else if (b.action === 'confirm') {
          need(kind === 'activation' && a.role === 'bee', 'Bee confirms bookings.', 403);
          need(status !== 'confirmed', 'Already confirmed.', 409);
          const c = all.find((x) => x.id === data.collectionId);
          need(
            c && c.status === 'approved' && relatedContent(c, all).every((x) => usable(x, true)),
            'The approved portfolio or its rights changed. Review it again.'
          );
          need(
            a.crm?.opportunities.some((x) => x.id === data.opportunityId && x.stage === 'won'),
            'Mark the linked sale as won in the commercial CRM first.'
          );
          need(
            data.contractUrl && data.bookingDate,
            'Signed booking evidence and confirmation date are required.'
          );
          need(
            a.projects.some((x) => x.id === data.projectId),
            'Production access required.',
            403
          );
          const scouts = [
            ...new Set(relatedContent(c!, all).map((x) => String(x.data.talentId))),
          ].map((id) => all.find((x) => x.id === id)!);
          need(
            relatedContent(c!, all).every((x) =>
              all.some(
                (p) =>
                  p.id === x.data.destinationId &&
                  p.kind === 'destination' &&
                  p.status === 'feasible'
              )
            ),
            'Bloom must validate every selected destination before booking.'
          );
          need(
            scouts.every(
              (x) =>
                x.status !== 'archived' &&
                x.data.agreement &&
                ['Local Line Producer', 'Creative Scout Royalty'].includes(
                  String(x.data.collaboration)
                )
            ),
            'Document each creator’s signed agreement and collaboration model.'
          );
          data.creatorSnapshot = JSON.stringify(
            scouts.map((x) => ({
              id: x.id,
              name: x.title,
              model: x.data.collaboration,
              agreement: x.data.agreement,
            }))
          );
          data.financeStatus = 'Deferred · Revolut integration unavailable';
          data.confirmedBy = a.email;
          status = 'confirmed';
        } else if (b.action === 'cancel') {
          need(
            kind === 'activation' && a.role === 'bee' && status === 'confirmed',
            'Only Bee can cancel a confirmed booking.',
            403
          );
          need(
            typeof b.reason === 'string' && b.reason.trim().length > 4,
            'Give a cancellation reason.'
          );
          status = 'cancelled';
          data.cancellationReason = b.reason.trim().slice(0, 1500);
        } else {
          status = transition(old!, b.action, a.role, all);
          if (status === 'draft' || status === 'archived') data.published = 'no';
        }
      }
      const [row] = old
        ? await sql.query<CreativeItem>(
            'UPDATE bee_creative_items SET title=$1,status=$2,data=$3::jsonb,updated_by=$4,version=version+1,updated_at=now() WHERE id=$5 RETURNING *',
            [title, status, JSON.stringify(data), a.email, id]
          )
        : await sql.query<CreativeItem>(
            'INSERT INTO bee_creative_items(id,scope,kind,title,status,data,created_by,updated_by) VALUES($1,$2,$3,$4,$5,$6::jsonb,$7,$7) RETURNING *',
            [id, a.scope, kind, title, status, JSON.stringify(data), a.email]
          );
      await sql.query(
        'INSERT INTO bee_creative_events(item_id,actor,action,snapshot) VALUES($1,$2,$3,$4::jsonb)',
        [id, a.email, b.action, JSON.stringify(row)]
      );
      // A changed source invalidates every portfolio that depends on it.
      if (kind === 'content' && ['save', 'upload', 'reopen', 'archive'].includes(b.action))
        await sql.query(
          "UPDATE bee_creative_items SET status='draft',version=version+1,updated_at=now() WHERE scope=$1 AND kind='collection' AND data->'contentIds' ? $2 AND status='approved'",
          [a.scope, id]
        );
      return reply({ item: row });
    });
  } catch (e) {
    return creativeFailure(e);
  }
}
