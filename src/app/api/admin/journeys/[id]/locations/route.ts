import { asc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getDb, locations, type NewLocationRow } from '@/lib/db';
import { requireAdmin } from '@/lib/db/admin-guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { id } = await context.params;
    const journeyId = Number.parseInt(id, 10);
    if (!Number.isFinite(journeyId)) {
      return NextResponse.json({ error: 'Identifiant invalide.' }, { status: 400 });
    }

    const db = getDb();
    const rows = await db
      .select()
      .from(locations)
      .where(eq(locations.journeyId, journeyId))
      .orderBy(asc(locations.position), asc(locations.id));

    return NextResponse.json({ locations: rows });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur base de données.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { id } = await context.params;
    const journeyId = Number.parseInt(id, 10);
    if (!Number.isFinite(journeyId)) {
      return NextResponse.json({ error: 'Identifiant invalide.' }, { status: 400 });
    }

    const body = (await request.json()) as Partial<NewLocationRow>;
    if (!body.name) {
      return NextResponse.json({ error: 'name est requis.' }, { status: 400 });
    }

    const db = getDb();
    const [created] = await db
      .insert(locations)
      .values({
        journeyId,
        name: body.name,
        subtitle: body.subtitle ?? null,
        leftTitle: body.leftTitle ?? [],
        narrative: body.narrative ?? '',
        image: body.image ?? null,
        video: body.video ?? null,
        media: body.media ?? [],
        position: body.position ?? 0,
        published: body.published ?? true,
      })
      .returning();

    return NextResponse.json({ location: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Création impossible.' },
      { status: 500 }
    );
  }
}
