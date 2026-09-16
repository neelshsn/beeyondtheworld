import assert from 'node:assert/strict';
import test from 'node:test';
import { migrateLocationSeasons } from '../migrate-location-seasons-20260916.mjs';

const readyColumn = { data_type: 'jsonb', is_nullable: 'YES', column_default: null };

test('check is read-only and reports a missing column before deployment', async () => {
  const statements = [];
  const result = await migrateLocationSeasons({
    environment: 'preview',
    query: async (statement) => {
      statements.push(statement);
      return [];
    },
  });
  assert.equal(result.ready, false);
  assert.equal(result.contentChanged, false);
  assert.equal(statements.length, 1);
  assert.match(statements[0], /^SELECT /);
});

test('refuses every write outside production before contacting the database', async () => {
  let calls = 0;
  await assert.rejects(
    migrateLocationSeasons({
      apply: true,
      environment: 'preview',
      query: async () => {
        calls += 1;
        return [];
      },
    })
  );
  assert.equal(calls, 0);
});

test('the additive migration is repeatable and never backfills old Locations', async () => {
  let column;
  const statements = [];
  const query = async (statement) => {
    statements.push(statement);
    if (statement.startsWith('ALTER TABLE')) {
      column = readyColumn;
      return [];
    }
    return column ? [column] : [];
  };
  for (let run = 0; run < 2; run += 1) {
    const result = await migrateLocationSeasons({ apply: true, environment: 'production', query });
    assert.equal(result.ready, true);
  }
  assert.equal(statements.filter((statement) => statement.startsWith('ALTER')).length, 2);
  assert.ok(
    statements.every((statement) =>
      /^SELECT |^ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS season_tags jsonb$/.test(
        statement
      )
    )
  );
});

test('does not accept a column default that would overwrite historical season fallback', async () => {
  const result = await migrateLocationSeasons({
    query: async () => [{ ...readyColumn, column_default: "'[]'::jsonb" }],
  });
  assert.equal(result.ready, false);
});
