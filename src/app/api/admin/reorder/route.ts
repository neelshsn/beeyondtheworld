import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getDb, journeys, locations } from '@/lib/db';
import { requireAdmin } from '@/lib/db/admin-guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ReorderPayload = {
  entity: 'journeys' | 'locations';
  orderedIds: number[];
};

/**
 * T-050 — réordonnancement des positions : reçoit la liste complète des ids
 * dans le nouvel ordre et réécrit les positions (0..n).
 */
export async function PATCH(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = (await request.json()) as Partial<ReorderPayload>;
    if (
      (body.entity !== 'journeys' && body.entity !== 'locations') ||
      !Array.isArray(body.orderedIds) ||
      body.orderedIds.some((id) => !Number.isFinite(id))
    ) {
      return NextResponse.json(
        { error: 'Payload attendu : { entity: journeys|locations, orderedIds: number[] }.' },
        { status: 400 }
      );
    }

    const db = getDb();
    const table = body.entity === 'journeys' ? journeys : locations;
    for (const [index, id] of body.orderedIds.entries()) {
      await db
        .update(table)
        .set({ position: index, updatedAt: new Date() })
        .where(eq(table.id, id));
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Réordonnancement impossible.' },
      { status: 500 }
    );
  }
}
