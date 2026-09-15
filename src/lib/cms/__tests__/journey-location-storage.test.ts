import { beforeEach, describe, expect, it, vi } from 'vitest';

const store = vi.hoisted(() => ({
  journey: { id: 10, slug: 'india-january-2026', seasonVisuals: {} as Record<string, unknown> },
  locations: [] as Record<string, unknown>[],
  failBatch: false,
  batches: 0,
}));

vi.mock('@/lib/db', async () => {
  const actual = await vi.importActual<typeof import('@/lib/db')>('@/lib/db');
  const locationIdFrom = (condition: { queryChunks: { name?: string; value?: unknown }[] }) => {
    if (!condition.queryChunks.some((chunk) => chunk.name === 'id')) return undefined;
    return condition.queryChunks.find((chunk) => typeof chunk.value === 'number')?.value as
      | number
      | undefined;
  };
  const db = {
    select: () => {
      let table: unknown;
      let locationId: number | undefined;
      const query = {
        from(value: unknown) {
          table = value;
          return query;
        },
        where(condition: Parameters<typeof locationIdFrom>[0]) {
          locationId = locationIdFrom(condition);
          return query;
        },
        limit() {
          return query;
        },
        orderBy() {
          return query;
        },
        then(resolve: (rows: unknown[]) => unknown) {
          return Promise.resolve(
            table === actual.journeys
              ? [store.journey]
              : locationId === undefined
                ? store.locations
                : store.locations.filter((row) => row.id === locationId)
          ).then(resolve);
        },
      };
      return query;
    },
    insert: (table: unknown) => ({
      values: (values: unknown) => {
        const query = { kind: 'insert', table, values, returning: () => query };
        return query;
      },
    }),
    update: (table: unknown) => ({
      set: (values: unknown) => ({
        where: (condition: Parameters<typeof locationIdFrom>[0]) => {
          const query = {
            kind: 'update',
            table,
            values,
            locationId: locationIdFrom(condition),
            returning: () => query,
          };
          return query;
        },
      }),
    }),
    delete: (table: unknown) => ({
      where: (condition: Parameters<typeof locationIdFrom>[0]) => {
        const query = {
          kind: 'delete',
          table,
          values: {},
          locationId: locationIdFrom(condition),
          returning: () => query,
        };
        return query;
      },
    }),
    batch: async (
      queries: {
        kind: string;
        table: unknown;
        values: Record<string, unknown> | Record<string, unknown>[];
        locationId?: number;
      }[]
    ) => {
      store.batches += 1;
      if (store.failBatch) throw new Error('Storage unavailable');
      return queries.map((query) => {
        if (query.kind === 'update' && query.table === actual.journeys) {
          store.journey.seasonVisuals = {
            ...store.journey.seasonVisuals,
            _cms: { locationsManaged: true },
          };
          return [];
        }
        if (query.kind === 'update') {
          const rows = store.locations.filter((row) => row.id === query.locationId);
          rows.forEach((row) => Object.assign(row, query.values));
          return rows;
        }
        if (query.kind === 'delete') {
          const rows = store.locations.filter((row) => row.id === query.locationId);
          store.locations = store.locations.filter((row) => row.id !== query.locationId);
          return rows;
        }
        const values = Array.isArray(query.values) ? query.values : [query.values];
        const firstId = Math.max(0, ...store.locations.map((row) => row.id as number)) + 1;
        const rows = values.map((value, index) => ({ ...value, id: firstId + index }));
        store.locations.push(...rows);
        return rows;
      });
    },
  };
  return { ...actual, getDb: () => db, isDbConfigured: () => true };
});

vi.mock('@/lib/db/admin-guard', () => ({
  requireAdmin: async () => null,
  rejectCrossSiteWrite: () => null,
}));

import { POST } from '@/app/api/admin/journeys/[id]/locations/route';
import { PATCH, DELETE } from '@/app/api/admin/locations/[id]/route';
import { getPublishedJourneyLocationCollection } from '../journey-locations';

function createLocation(body: Record<string, unknown>) {
  return POST(
    new Request('http://localhost/api/admin/journeys/10/locations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id: '10' }) }
  );
}

function partialPortugal() {
  store.journey.slug = 'azores';
  store.locations = [
    {
      id: 1,
      journeyId: 10,
      name: 'Azores',
      subtitle: 'Volcanic Lakes',
      leftTitle: ['Azores'],
      narrative: 'Existing editor text',
      image: '/azores.jpg',
      video: null,
      media: [],
      position: 0,
      published: true,
    },
  ];
}

function editLocation(id: number, body: Record<string, unknown>) {
  return PATCH(
    new Request(`http://localhost/api/admin/locations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id: String(id) }) }
  );
}

function deleteLocation(id: number) {
  return DELETE(new Request(`http://localhost/api/admin/locations/${id}`, { method: 'DELETE' }), {
    params: Promise.resolve({ id: String(id) }),
  });
}

describe('Journey Location storage through its API', () => {
  beforeEach(() => {
    store.journey = { id: 10, slug: 'india-january-2026', seasonVisuals: {} };
    store.locations = [];
    store.failBatch = false;
    store.batches = 0;
  });

  it('preserves legacy Madeira and Lisboa before the first Azores edit in the same batch', async () => {
    partialPortugal();
    expect((await editLocation(1, { narrative: 'Updated editor text' })).status).toBe(200);
    expect(store.batches).toBe(1);
    const collection = await getPublishedJourneyLocationCollection('azores');
    expect(collection.locations.map((row) => row.name)).toEqual(['Azores', 'Madeira', 'Lisboa']);
    expect(collection.locations[0].narrative).toBe('Updated editor text');
    expect(collection.edited).toBe(true);
  });

  it('preserves the other legacy Portugal steps on deletion and never resurrects after all are deleted', async () => {
    partialPortugal();
    expect((await deleteLocation(1)).status).toBe(200);
    expect(store.batches).toBe(1);
    expect(
      (await getPublishedJourneyLocationCollection('azores')).locations.map((row) => row.name)
    ).toEqual(['Madeira', 'Lisboa']);
    for (const id of store.locations.map((row) => row.id as number))
      expect((await deleteLocation(id)).status).toBe(200);
    expect(await getPublishedJourneyLocationCollection('azores')).toEqual({
      locations: [],
      managed: true,
      edited: true,
    });
  });

  it('keeps the legacy Portugal steps when adding a new Location', async () => {
    partialPortugal();
    expect((await createLocation({ name: 'Editor supplied place', published: true })).status).toBe(
      201
    );
    expect(store.batches).toBe(1);
    expect(
      (await getPublishedJourneyLocationCollection('azores')).locations.map((row) => row.name)
    ).toEqual(['Azores', 'Madeira', 'Lisboa', 'Editor supplied place']);
  });

  it('does not import legacy Portugal steps if an edit batch fails', async () => {
    partialPortugal();
    store.failBatch = true;
    expect((await editLocation(1, { narrative: 'Failed edit' })).status).toBe(500);
    expect(store.locations.map((row) => row.name)).toEqual(['Azores']);
    expect(store.locations[0].narrative).toBe('Existing editor text');
    expect(store.journey.seasonVisuals).toEqual({});
  });

  it('preserves India’s existing steps and creates an unpublished draft in one batch', async () => {
    const response = await createLocation({ name: '  Editor supplied place  ', position: 0 });
    expect(response.status).toBe(201);
    expect(store.batches).toBe(1);
    expect(store.locations.map((row) => row.name)).toEqual([
      'Rajasthan',
      'Kerala',
      'Goa',
      'Editor supplied place',
    ]);
    expect(store.locations[3]).toMatchObject({ position: 3, published: false, narrative: '' });
    const collection = await getPublishedJourneyLocationCollection('india-january-2026');
    expect(collection.managed).toBe(true);
    expect(collection.locations.map((row) => row.name)).toEqual(['Rajasthan', 'Kerala', 'Goa']);
  });

  it('does not leave imported steps behind if the creation batch fails', async () => {
    store.failBatch = true;
    const response = await createLocation({ name: 'Editor supplied place' });
    expect(response.status).toBe(500);
    expect(store.locations).toEqual([]);
    expect(store.journey.seasonVisuals).toEqual({});
  });

  it('does not resurrect deleted static steps when the final CMS step was removed', async () => {
    store.journey.seasonVisuals = { _cms: { locationsManaged: true } };
    const response = await createLocation({ name: 'Only the new step' });
    expect(response.status).toBe(201);
    expect(store.locations.map((row) => row.name)).toEqual(['Only the new step']);
    expect(await getPublishedJourneyLocationCollection('india-january-2026')).toEqual({
      locations: [],
      managed: true,
      edited: true,
    });
  });

  it('stores supplied Tale fields and media and exposes them in the public collection', async () => {
    store.journey.slug = 'new-journey';
    const response = await createLocation({
      name: 'Actual place',
      narrative: 'Editor text',
      leftTitle: ['Editor title'],
      image: '/image.jpg',
      media: [{ type: 'image', url: '/tale.jpg' }],
      published: true,
    });
    expect(response.status).toBe(201);
    const collection = await getPublishedJourneyLocationCollection('new-journey');
    expect(collection.locations[0]).toMatchObject({
      name: 'Actual place',
      narrative: 'Editor text',
      leftTitle: ['Editor title'],
      image: '/image.jpg',
      media: [{ type: 'image', url: '/tale.jpg' }],
    });
  });
});
