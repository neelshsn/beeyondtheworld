import 'server-only';

import { randomBytes, randomUUID } from 'node:crypto';

import { desc, eq, sql } from 'drizzle-orm';

import {
  getDb,
  leadSubmissions,
  type LeadNotificationStatus,
  type LeadSubmissionRow,
} from '@/lib/db';
import type { NormalizedLead } from './normalize';

function createReference(now = new Date()): string {
  const date = now.toISOString().slice(0, 10).replaceAll('-', '');
  return `BTW-${date}-${randomBytes(3).toString('hex').toUpperCase()}`;
}

export async function persistLead(lead: NormalizedLead): Promise<{
  lead: LeadSubmissionRow;
  created: boolean;
}> {
  const db = getDb();
  const idempotencyKey = lead.idempotencyKey || randomUUID();
  const [created] = await db
    .insert(leadSubmissions)
    .values({
      id: randomUUID(),
      reference: createReference(),
      ...lead,
      idempotencyKey,
      notificationStatus: 'pending',
    })
    .onConflictDoNothing({ target: leadSubmissions.idempotencyKey })
    .returning();

  if (created) return { lead: created, created: true };
  const [existing] = await db
    .select()
    .from(leadSubmissions)
    .where(eq(leadSubmissions.idempotencyKey, idempotencyKey))
    .limit(1);
  if (!existing) throw new Error('Lead persistence conflict could not be recovered.');
  return { lead: existing, created: false };
}

export async function updateNotification(
  id: string,
  status: LeadNotificationStatus,
  error?: string
): Promise<void> {
  const db = getDb();
  await db
    .update(leadSubmissions)
    .set({
      notificationStatus: status,
      notificationAttempts:
        status === 'not_configured' ? 0 : sql`${leadSubmissions.notificationAttempts} + 1`,
      notificationLastError: error?.slice(0, 500) ?? null,
      notifiedAt: status === 'sent' ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(leadSubmissions.id, id));
}

export async function listLeads(limit = 100): Promise<LeadSubmissionRow[]> {
  return getDb()
    .select()
    .from(leadSubmissions)
    .orderBy(desc(leadSubmissions.createdAt))
    .limit(Math.min(Math.max(limit, 1), 200));
}
