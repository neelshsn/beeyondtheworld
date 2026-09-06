// Run with node --test explicitly; excluded by Vitest's *.test.* filename convention.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import {
  ALLOWED_PATHS,
  MIGRATION_KEY,
  REQUIRED_ASSETS,
  SLUG,
  buildApplyStatement,
  changedPaths,
  collectAssetManifest,
  parseMode,
  preparePlan,
  revise,
  runMigration,
} from '../migrate-greece-feedback-20260906.mjs';

function content() {
  return {
    format: 'tale',
    listing: {
      releaseWindow: 'Fall Winter 2023',
      season: 'fall-winter',
      seasonTags: ['fall-winter'],
      thumbnail: { src: '/old-card.webp', alt: 'Old card', width: 900 },
      backgroundVideo: '/old-hero.mp4',
      cardPoster: '/old-poster.webp',
      shootYear: 2023,
      category: 'Accessories',
    },
    showcase: {
      slug: SLUG,
      hero: {
        type: 'video',
        src: '/old-hero.mp4',
        poster: '/old-poster.webp',
        alt: 'Protected hero alt',
      },
      gallery: [{ src: '/independent-gallery.webp' }],
      credits: { director: 'Original credit' },
      cta: { href: '/contact', label: 'Existing CTA' },
    },
    tale: {
      title: 'Memory of the moon',
      body: [{ text: 'Exact published narrative.' }],
      heroVideo: '/old-hero.mp4',
      storyVideo: '/old-story.mp4',
      images: ['/old-image.webp'],
      videos: ['/old-hero.mp4', '/independent.mp4', '/old-story.mp4', '/independent.mp4'],
      arbitraryEditorialMetadata: { keep: true },
    },
    newFutureCmsField: { nested: ['must', 'survive'] },
  };
}
function row() {
  const published = content();
  const draft = structuredClone(published);
  draft.tale.body[0].text = 'Unpublished independent narrative.';
  draft.showcase.credits.director = 'Unpublished director correction';
  draft.tale.videos.push('/unpublished-extra.mp4');
  return {
    id: 17,
    kind: 'campaign',
    slug: SLUG,
    archived: false,
    revision: 8,
    published_revision: 3,
    draft,
    published,
    position: 4,
    updated_by: 'Existing editor',
  };
}
const ENV = { DATABASE_URL: 'postgresql://test:fake@invalid.local/test', VERCEL_ENV: 'production' };
const assets = () => REQUIRED_ASSETS.map((url) => ({ url, bytes: 1, sha256: 'test-only' }));

test('the exact approved paths change, and both independent editorial versions survive', () => {
  const before = row();
  const saved = structuredClone(before);
  const plan = preparePlan(before);
  assert.deepEqual(before, saved, 'planning must not mutate the source snapshot');
  assert.equal(plan.proposed.published.tale.title, 'Memory of the moon');
  assert.equal(plan.proposed.published.tale.body[0].text, 'Exact published narrative.');
  assert.equal(plan.proposed.draft.tale.body[0].text, 'Unpublished independent narrative.');
  assert.equal(plan.proposed.draft.showcase.credits.director, 'Unpublished director correction');
  for (const version of ['draft', 'published']) {
    const after = plan.proposed[version];
    assert.deepEqual(after.showcase.gallery, before[version].showcase.gallery);
    assert.deepEqual(after.showcase.cta, before[version].showcase.cta);
    assert.deepEqual(after.newFutureCmsField, before[version].newFutureCmsField);
    assert.equal(after.listing.shootYear, 2023);
    assert.equal(after.listing.thumbnail.width, 900);
    assert.ok(changedPaths(before[version], after).every((path) => ALLOWED_PATHS.has(path)));
  }
});

test('additional videos, including existing duplicates and draft-only media, remain intact', () => {
  const plan = preparePlan(row());
  assert.equal(
    plan.proposed.draft.tale.videos.filter((src) => src === '/independent.mp4').length,
    2
  );
  assert.ok(plan.proposed.draft.tale.videos.includes('/unpublished-extra.mp4'));
  assert.ok(!plan.proposed.published.tale.videos.includes('/unpublished-extra.mp4'));
  assert.equal(plan.proposed.draft.tale.videos[0], REQUIRED_ASSETS[1]);
  assert.equal(plan.proposed.draft.tale.images.length, 6);
});

test('revision increments preserve the exact unpublished gap, and an aligned pair stays aligned', () => {
  const before = row();
  const plan = preparePlan(before);
  assert.equal(plan.revision, 9);
  assert.equal(plan.publishedRevision, 4);
  assert.equal(plan.revision - plan.publishedRevision, before.revision - before.published_revision);
  before.revision = before.published_revision;
  const aligned = preparePlan(before);
  assert.equal(aligned.revision, aligned.publishedRevision);
});

test('already-correct content does not increment revisions when the durable receipt is first recorded', () => {
  const before = row();
  before.draft = revise(before.draft);
  before.published = revise(before.published);
  const plan = preparePlan(before);
  assert.equal(plan.hasChanges, false);
  assert.equal(plan.revision, before.revision);
  assert.equal(plan.publishedRevision, before.published_revision);
  assert.deepEqual(revise(before.draft), before.draft);
});

test('rejects another campaign, malformed source, archives and impossible revision ordering', () => {
  assert.throws(() => preparePlan({ ...row(), slug: 'another-campaign' }));
  assert.throws(() => revise({ ...content(), showcase: { slug: 'another-campaign' } }));
  assert.throws(() => revise({ ...content(), tale: null }));
  assert.throws(() => preparePlan({ ...row(), archived: true }));
  assert.throws(() => preparePlan({ ...row(), published: null }));
  assert.throws(() => preparePlan({ ...row(), published_revision: 9 }));
  assert.throws(() => preparePlan({ ...row(), revision: 2147483647 }));
});

test('default and explicit dry-run never create schema or invoke a write transaction', async () => {
  const calls = [];
  const sql = {
    query(text, params) {
      calls.push({ text, params });
      if (text.includes('to_regclass')) return Promise.resolve([{ ledger: null }]);
      if (text.startsWith('SELECT * FROM')) return Promise.resolve([row()]);
      assert.fail('Unexpected query in dry-run');
    },
    transaction() {
      assert.fail('Dry-run must not create or update anything');
    },
  };
  const result = await runMigration({ env: ENV, createSql: () => sql, assetManifest: assets });
  assert.equal(result.status, 'dry-run');
  assert.equal(calls.length, 2);
  assert.ok(calls.every(({ text }) => text.startsWith('SELECT')));
  assert.equal(parseMode([]), 'dry-run');
  assert.equal(parseMode(['--dry-run']), 'dry-run');
  assert.throws(() => parseMode(['--apply', '--slug', 'other']));
});

test('refuses an independently changed image hero rather than creating an image pointing at an MP4', () => {
  const before = row();
  before.draft.showcase.hero = { type: 'image', src: '/independent-draft-image.webp' };
  assert.throws(() => preparePlan(before), /video hero/);
  assert.equal(before.draft.showcase.hero.src, '/independent-draft-image.webp');
});

test('a permanent ledger receipt prevents all future content reads and rewrites', async () => {
  const receipt = {
    migration_key: MIGRATION_KEY,
    document_id: 17,
    document_kind: 'campaign',
    document_slug: SLUG,
    script_sha256: 'earlier-script',
    applied_at: '2026-09-06T18:00:00Z',
  };
  const sql = {
    query(text) {
      if (text.includes('to_regclass'))
        return Promise.resolve([{ ledger: 'content_migration_ledger', valid_key: true }]);
      if (text.includes('FROM public.content_migration_ledger')) return Promise.resolve([receipt]);
      assert.fail('Do not read or overwrite later administrator changes');
    },
    transaction() {
      assert.fail('A successful migration cannot run a second time');
    },
  };
  const result = await runMigration({
    apply: true,
    env: ENV,
    createSql: () => sql,
    assetManifest: () => assert.fail('Already applied must not require old local media'),
  });
  assert.equal(result.status, 'already-applied');
});

test('production guard runs before any database or asset operation', async () => {
  await assert.rejects(
    runMigration({
      apply: true,
      env: { ...ENV, VERCEL_ENV: 'preview' },
      createSql: () => assert.fail('Preview must not connect'),
    }),
    /restricted to Vercel production/
  );
});

test('an existing ledger without its unique migration primary key is refused before any write', async () => {
  const sql = {
    query() {
      return Promise.resolve([{ ledger: 'content_migration_ledger', valid_key: false }]);
    },
    transaction() {
      assert.fail('A malformed ledger must not allow a content update');
    },
  };
  await assert.rejects(
    runMigration({ apply: true, env: ENV, createSql: () => sql, assetManifest: assets }),
    /primary key/
  );
});

test('the transaction backs up and updates together, and rejection does not become success', async () => {
  const current = row();
  let schemaExists = false;
  let transactionCalls = 0;
  const sql = {
    query(text, params) {
      if (text.startsWith('SELECT') && text.includes('to_regclass'))
        return Promise.resolve([
          { ledger: schemaExists ? 'content_migration_ledger' : null, valid_key: schemaExists },
        ]);
      if (text.startsWith('SELECT * FROM')) return Promise.resolve([current]);
      if (text.startsWith('SELECT migration_key')) return Promise.resolve([]);
      return { text, params };
    },
    transaction(queries, options) {
      transactionCalls += 1;
      assert.equal(options.isolationLevel, 'Serializable');
      assert.equal(queries.length, 3);
      assert.match(queries[0].text, /^CREATE TABLE IF NOT EXISTS/);
      assert.match(queries[1].text, /RAISE EXCEPTION/);
      assert.match(queries[2].text, /FOR UPDATE OF c/);
      assert.match(queries[2].text, /to_jsonb\(s\), to_jsonb\(u\)/);
      assert.match(queries[2].text, /c\.published IS NOT DISTINCT FROM \$6::jsonb/);
      assert.doesNotMatch(queries[2].text, /ON CONFLICT/);
      assert.equal(queries[2].params[0], current.id);
      assert.equal(queries[2].params[1], SLUG);
      assert.equal(queries[2].params[4], JSON.stringify(current.draft));
      assert.equal(queries[2].params[5], JSON.stringify(current.published));
      schemaExists = true;
      return Promise.resolve([[], [], []]); // A concurrent editor invalidated the guarded snapshot.
    },
  };
  await assert.rejects(
    runMigration({ apply: true, env: ENV, createSql: () => sql, assetManifest: assets }),
    /guard rejected/
  );
  assert.equal(transactionCalls, 1, 'Do not retry and overwrite a newly changed CMS document');
});

test('asset preflight covers exactly ten nonempty files and detects a missing/empty file', () => {
  const root = mkdtempSync(join(tmpdir(), 'bee-greece-migration-test-'));
  try {
    for (const url of REQUIRED_ASSETS) {
      const path = join(root, 'public', url);
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, 'fixture-media');
    }
    assert.equal(collectAssetManifest(root).length, 10);
    const target = join(root, 'public', REQUIRED_ASSETS[0]);
    writeFileSync(target, '');
    assert.throws(() => collectAssetManifest(root), /empty/);
    rmSync(target);
    assert.throws(() => collectAssetManifest(root), /missing/);
  } finally {
    // mkdtemp generated this test-only absolute directory; do not use a configurable path.
    assert.ok(root.startsWith(join(tmpdir(), 'bee-greece-migration-test-')));
    rmSync(root, { recursive: true, force: true });
  }
});

test('the fixed SQL target cannot be changed by editorial strings in the source', () => {
  const current = row();
  current.draft.tale.body[0].text = "'; DELETE FROM content_documents; --";
  const statement = buildApplyStatement(preparePlan(current), assets());
  assert.ok(!statement.text.includes(current.draft.tale.body[0].text));
  assert.ok(
    statement.params.some((value) => typeof value === 'string' && value.includes('DELETE FROM'))
  );
});
