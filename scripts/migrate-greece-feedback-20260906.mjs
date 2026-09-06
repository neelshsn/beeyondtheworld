/**
 * One-time, server-only campaign migration. No environment files are loaded.
 * Read-only: node scripts/migrate-greece-feedback-20260906.mjs
 * Apply:    node scripts/migrate-greece-feedback-20260906.mjs --apply
 * --apply requires VERCEL_ENV=production. Deploy the media first.
 */
import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { isDeepStrictEqual } from 'node:util';

import { neon } from '@neondatabase/serverless';

export const MIGRATION_KEY = 'campaign:veganboost-greece:eugenie-feedback:2026-09-06:v1';
export const SLUG = 'veganboost-greece';
const PREFIX = `/assets/campaigns/${SLUG}/feedback-20260906-`;
const HERO = `${PREFIX}hero.mp4`;
const STORY = `${PREFIX}story.mp4`;
const POSTER = `${PREFIX}hero-poster.webp`;
const IMAGES = Array.from(
  { length: 6 },
  (_, index) => `${PREFIX}photo-${String(index + 1).padStart(2, '0')}.webp`
);
export const REQUIRED_ASSETS = [`${PREFIX}carousel.webp`, HERO, STORY, POSTER, ...IMAGES];
const REPO_ROOT = fileURLToPath(new URL('../', import.meta.url));
const SCRIPT_DIGEST = createHash('sha256')
  .update(readFileSync(fileURLToPath(import.meta.url)))
  .digest('hex');

export const ALLOWED_PATHS = new Set([
  'listing.releaseWindow',
  'listing.season',
  'listing.seasonTags',
  'listing.thumbnail.src',
  'listing.thumbnail.alt',
  'listing.backgroundVideo',
  'listing.cardPoster',
  'showcase.hero.src',
  'showcase.hero.poster',
  'tale.heroVideo',
  'tale.storyVideo',
  'tale.images',
  'tale.videos',
]);

const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const clone = (value) => JSON.parse(JSON.stringify(value));
function fail(message) {
  const error = new Error(message);
  error.safe = true;
  throw error;
}

export function changedPaths(before, after, path = '') {
  if (isDeepStrictEqual(before, after)) return [];
  if (object(before) && object(after)) {
    return [...new Set([...Object.keys(before), ...Object.keys(after)])].flatMap((key) =>
      changedPaths(before[key], after[key], path ? `${path}.${key}` : key)
    );
  }
  return [path];
}

export function revise(content) {
  if (
    !object(content) ||
    content.format !== 'tale' ||
    content.showcase?.slug !== SLUG ||
    !object(content.listing) ||
    !object(content.listing.thumbnail) ||
    !object(content.showcase.hero) ||
    content.showcase.hero.type !== 'video' ||
    !object(content.tale) ||
    (content.tale.videos !== undefined &&
      (!Array.isArray(content.tale.videos) ||
        content.tale.videos.some((src) => typeof src !== 'string')))
  )
    fail('Expected an existing Greece Tale with its listing, video hero and narrative structure.');

  const next = clone(content);
  next.listing.releaseWindow = 'Spring Summer 2024';
  next.listing.season = 'spring-summer';
  next.listing.seasonTags = ['spring-summer'];
  next.listing.thumbnail.src = `${PREFIX}carousel.webp`;
  next.listing.thumbnail.alt = 'Veganboost portrait reflected in a mirror in Milos';
  next.listing.backgroundVideo = HERO;
  next.listing.cardPoster = POSTER;
  next.showcase.hero.src = HERO;
  next.showcase.hero.poster = POSTER;
  const oldHero = next.tale.heroVideo;
  const oldStory = next.tale.storyVideo;
  next.tale.heroVideo = HERO;
  next.tale.storyVideo = STORY;
  next.tale.images = [...IMAGES];
  next.tale.videos = (next.tale.videos ?? []).map((src) => {
    if (src === oldHero || src === `/assets/campaigns/${SLUG}/${SLUG}-hero.mp4`) return HERO;
    if (src === oldStory || src === `/assets/campaigns/${SLUG}/${SLUG}-story.mp4`) return STORY;
    return src;
  });
  if (!next.tale.videos.includes(HERO)) next.tale.videos.unshift(HERO);
  if (!next.tale.videos.includes(STORY)) next.tale.videos.push(STORY);

  if (changedPaths(content, next).some((path) => !ALLOWED_PATHS.has(path))) {
    fail('The proposed migration changed a field outside the approved Greece media patch.');
  }
  return next;
}

export function preparePlan(current) {
  if (
    !current ||
    current.kind !== 'campaign' ||
    current.slug !== SLUG ||
    current.archived !== false ||
    !current.published ||
    !Number.isSafeInteger(current.id) ||
    current.id <= 0 ||
    !Number.isSafeInteger(current.revision) ||
    !Number.isSafeInteger(current.published_revision) ||
    current.published_revision < 0 ||
    current.revision < 1 ||
    current.revision < current.published_revision
  )
    fail('Expected exactly one active, published Greece document with valid revisions.');

  // Never derive the published version from the draft: independent edits stay independent.
  const proposed = { draft: revise(current.draft), published: revise(current.published) };
  const changes = {
    draft: changedPaths(current.draft, proposed.draft),
    published: changedPaths(current.published, proposed.published),
  };
  const hasChanges = changes.draft.length > 0 || changes.published.length > 0;
  const increment = hasChanges ? 1 : 0;
  const revision = current.revision + increment;
  const publishedRevision = current.published_revision + increment;
  if (revision > 2147483647 || publishedRevision > 2147483647) fail('Revision limit reached.');
  return { current, proposed, changes, hasChanges, revision, publishedRevision };
}

export function collectAssetManifest(root = REPO_ROOT) {
  return REQUIRED_ASSETS.map((url) => {
    const path = resolve(root, `public${url}`);
    let bytes;
    try {
      if (!statSync(path).isFile()) fail(`Required media is not a file: ${url}`);
      bytes = readFileSync(path);
    } catch {
      fail(`Required media is missing: ${url}`);
    }
    if (!bytes.length) fail(`Required media is empty: ${url}`);
    return { url, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') };
  });
}

export const LEDGER_DDL = `CREATE TABLE IF NOT EXISTS public.content_migration_ledger (
  migration_key text PRIMARY KEY,
  document_id integer NOT NULL,
  document_kind text NOT NULL,
  document_slug text NOT NULL,
  script_sha256 text NOT NULL,
  before_state jsonb NOT NULL,
  after_state jsonb NOT NULL,
  changed_fields jsonb NOT NULL,
  assets jsonb NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now()
)`;

const VALID_LEDGER_KEY = `EXISTS (
  SELECT 1 FROM pg_catalog.pg_constraint k
  JOIN pg_catalog.pg_attribute a ON a.attrelid = k.conrelid AND a.attname = 'migration_key'
  WHERE k.conrelid = to_regclass('public.content_migration_ledger')
    AND k.contype = 'p' AND k.conkey = ARRAY[a.attnum]
)`;

export const LEDGER_GUARD = `DO $$ BEGIN
  IF NOT (${VALID_LEDGER_KEY}) THEN
    RAISE EXCEPTION 'content_migration_ledger requires a primary key on migration_key';
  END IF;
END $$`;

async function readReceipt(sql) {
  const [schema] = await sql.query(
    `SELECT to_regclass('public.content_migration_ledger') AS ledger, ${VALID_LEDGER_KEY} AS valid_key`
  );
  if (!schema?.ledger) return null;
  if (schema.valid_key !== true)
    fail('The existing migration ledger requires a primary key on migration_key.');
  const [receipt] = await sql.query(
    'SELECT migration_key, document_id, document_kind, document_slug, script_sha256, applied_at FROM public.content_migration_ledger WHERE migration_key = $1',
    [MIGRATION_KEY]
  );
  if (receipt && (receipt.document_kind !== 'campaign' || receipt.document_slug !== SLUG)) {
    fail('Migration key is already assigned to an unexpected document.');
  }
  return receipt ?? null;
}

function alreadyApplied(receipt) {
  return {
    status: 'already-applied',
    migrationKey: MIGRATION_KEY,
    documentId: receipt.document_id,
    appliedAt: receipt.applied_at,
    scriptChangedSinceApply: receipt.script_sha256 !== SCRIPT_DIGEST,
  };
}

export function buildApplyStatement(plan, assets) {
  const { current, proposed, changes, revision, publishedRevision, hasChanges } = plan;
  return {
    // The backup is the locked pre-update row. INSERT follows UPDATE through RETURNING.
    // Do not add ON CONFLICT DO NOTHING: a ledger conflict must roll back the update.
    text: `WITH source AS MATERIALIZED (
      SELECT c.* FROM public.content_documents c
      WHERE c.id = $1 AND c.kind = 'campaign' AND c.slug = $2 AND c.archived = false
        AND c.revision = $3 AND c.published_revision = $4
        AND c.draft = $5::jsonb AND c.published IS NOT DISTINCT FROM $6::jsonb
        AND NOT EXISTS (SELECT 1 FROM public.content_migration_ledger WHERE migration_key = $7)
      FOR UPDATE OF c
    ), updated AS (
      UPDATE public.content_documents c SET
        draft = $8::jsonb, published = $9::jsonb,
        revision = $10, published_revision = $11,
        updated_by = CASE WHEN $12::boolean THEN $7 ELSE c.updated_by END,
        updated_at = CASE WHEN $12::boolean THEN now() ELSE c.updated_at END,
        published_at = CASE WHEN $12::boolean THEN now() ELSE c.published_at END
      FROM source s
      WHERE c.id = s.id AND c.kind = 'campaign' AND c.slug = $2 AND c.archived = false
        AND c.revision = s.revision AND c.published_revision = s.published_revision
        AND c.draft = s.draft AND c.published IS NOT DISTINCT FROM s.published
      RETURNING c.*
    ), recorded AS (
      INSERT INTO public.content_migration_ledger
        (migration_key, document_id, document_kind, document_slug, script_sha256,
         before_state, after_state, changed_fields, assets)
      SELECT $7, s.id, s.kind, s.slug, $13, to_jsonb(s), to_jsonb(u), $14::jsonb, $15::jsonb
      FROM source s JOIN updated u ON u.id = s.id
      RETURNING migration_key, document_id, applied_at, after_state
    ) SELECT migration_key, document_id, applied_at, after_state FROM recorded`,
    params: [
      current.id,
      SLUG,
      current.revision,
      current.published_revision,
      JSON.stringify(current.draft),
      JSON.stringify(current.published),
      MIGRATION_KEY,
      JSON.stringify(proposed.draft),
      JSON.stringify(proposed.published),
      revision,
      publishedRevision,
      hasChanges,
      SCRIPT_DIGEST,
      JSON.stringify(changes),
      JSON.stringify(assets),
    ],
  };
}

export async function runMigration({
  apply = false,
  env = process.env,
  createSql = neon,
  assetManifest = collectAssetManifest,
} = {}) {
  if (apply && env.VERCEL_ENV !== 'production') fail('--apply is restricted to Vercel production.');
  if (
    !/^postgres(?:ql)?:\/\//.test(env.DATABASE_URL ?? '') ||
    env.DATABASE_URL.includes('[SENSITIVE]')
  ) {
    fail('A server-provided DATABASE_URL is required. No environment file is loaded.');
  }
  const sql = createSql(env.DATABASE_URL);
  const receipt = await readReceipt(sql);
  // Permanent: do not inspect or overwrite later CMS changes when this key already exists.
  if (receipt) return alreadyApplied(receipt);

  const rows = await sql.query(
    "SELECT * FROM public.content_documents WHERE kind = 'campaign' AND slug = $1",
    [SLUG]
  );
  if (rows.length !== 1)
    fail('Expected exactly one Greece campaign. No document is seeded or created.');
  const plan = preparePlan(rows[0]);
  const assets = assetManifest();
  const summary = {
    migrationKey: MIGRATION_KEY,
    documentId: plan.current.id,
    changedFields: plan.changes,
    beforeRevision: plan.current.revision,
    beforePublishedRevision: plan.current.published_revision,
    afterRevision: plan.revision,
    afterPublishedRevision: plan.publishedRevision,
    hasUnpublishedChanges: plan.revision !== plan.publishedRevision,
    localAssetCount: assets.length,
  };
  if (!apply) return { status: 'dry-run', ...summary };

  const statement = buildApplyStatement(plan, assets);
  let result;
  try {
    result = await sql.transaction(
      [sql.query(LEDGER_DDL), sql.query(LEDGER_GUARD), sql.query(statement.text, statement.params)],
      { isolationLevel: 'Serializable' }
    );
  } catch {
    // A parallel successful run may have committed this exact key. Otherwise do not
    // retry a new plan automatically or print a connection error containing credentials.
    const concurrentReceipt = await readReceipt(sql).catch(() => null);
    if (concurrentReceipt) return alreadyApplied(concurrentReceipt);
    fail(
      'Migration completion is unconfirmed. Run the default dry-run to inspect the ledger before retrying; no successful write is claimed.'
    );
  }
  const applied = result[2];
  if (applied.length !== 1) {
    const concurrentReceipt = await readReceipt(sql);
    if (concurrentReceipt) return alreadyApplied(concurrentReceipt);
    fail(
      'The revision/JSON guard rejected the migration. No campaign was changed; review a fresh dry-run.'
    );
  }
  const after = applied[0].after_state;
  if (
    !isDeepStrictEqual(after.draft, plan.proposed.draft) ||
    !isDeepStrictEqual(after.published, plan.proposed.published) ||
    after.revision !== plan.revision ||
    after.published_revision !== plan.publishedRevision
  )
    fail(
      'Migration receipt differs from the planned content. Inspect the server ledger before any further operation.'
    );
  return {
    status: plan.hasChanges ? 'applied' : 'already-correct-recorded',
    ...summary,
    appliedAt: applied[0].applied_at,
  };
}

export function parseMode(args) {
  if (args.length === 0 || (args.length === 1 && args[0] === '--dry-run')) return 'dry-run';
  if (args.length === 1 && args[0] === '--apply') return 'apply';
  if (args.length === 1 && args[0] === '--help') return 'help';
  fail(
    'Use no arguments (dry-run), --dry-run, --apply or --help. No other campaign or environment-file option is accepted.'
  );
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try {
    const mode = parseMode(process.argv.slice(2));
    if (mode === 'help') {
      console.info(
        'Greece feedback migration: default --dry-run is read-only. --apply requires VERCEL_ENV=production and server DATABASE_URL. Deploy the ten media assets before applying. No environment files or public endpoints are used.'
      );
    } else {
      console.info(JSON.stringify(await runMigration({ apply: mode === 'apply' }), null, 2));
    }
  } catch (error) {
    console.error(
      error.safe
        ? error.message
        : 'Migration failed. Credentials and raw database errors are not printed; completion is not confirmed. Inspect the ledger with a dry-run.'
    );
    process.exitCode = 1;
  }
}
