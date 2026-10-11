/** Additive rehearsal only. Never overwrites an existing case or user's edits. */
import { readFile } from 'node:fs/promises';
import { createHash, randomBytes, scryptSync } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createPool } from '../config/postgres.mjs';
const expected = process.argv[2];
if (!['bee_site', 'bee_site_qa'].includes(expected))
  throw Error('Pass the expected VPS database name.');
const root = new URL('../', import.meta.url);
const seed = JSON.parse(await readFile(new URL('scripts/fixtures/carry-light.json', root), 'utf8'));
const pool = createPool(),
  client = await pool.connect();
try {
  if ((await client.query('select current_database() as name')).rows[0].name !== expected)
    throw Error('Wrong database.');
  await client.query('BEGIN');
  if (
    (await client.query('select id from bee_community_projects where id=$1', [seed.project.id]))
      .rows.length
  )
    throw Error('Case exists; nothing was overwritten.');
  for (const [role, u] of Object.entries(seed.users)) {
    if (role === 'bee') {
      if (
        !(
          await client.query(
            'select id from bee_community_users where id=$1 and is_test and not disabled',
            [u.id]
          )
        ).rows.length
      )
        throw Error('Existing test Bee account required.');
      continue;
    }
    const salt = randomBytes(16).toString('hex');
    const hash = salt + ':' + scryptSync(randomBytes(32), salt, 64).toString('hex');
    await client.query(
      'insert into bee_community_users(id,email,name,organization,password_hash,is_test,profile) values($1,$2,$3,$4,$5,true,$6)',
      [u.id, u.email, u.name, u.organization, hash, JSON.stringify(u.profile)]
    );
  }
  const p = seed.project;
  await client.query(
    'insert into bee_community_projects(id,title,territory,season,starts_on,ends_on,is_demo) values($1,$2,$3,$4,$5,$6,true)',
    [p.id, p.title, p.territory, p.season, p.starts_on, p.ends_on]
  );
  for (const m of seed.members)
    await client.query(
      'insert into bee_community_members(project_id,user_id,role) values($1,$2,$3)',
      [p.id, m.id, m.role]
    );
  for (const r of seed.records)
    await client.query(
      'insert into bee_community_records(id,project_id,kind,title,status,data,organization,created_by,version,created_at,updated_at) values($1,$2,$3,$4,$5,$6,$7,$8,1,$9,$10)',
      [
        r.id,
        p.id,
        r.kind,
        r.title,
        r.status,
        JSON.stringify(r.data),
        r.organization,
        r.created_by,
        r.created_at,
        r.updated_at,
      ]
    );
  for (const f of seed.files) {
    const content = await readFile(fileURLToPath(new URL(f.path, root)));
    if (content.length > 3145728) throw Error('File too large: ' + f.name);
    await client.query(
      'insert into bee_community_files(id,record_id,name,mime,size,content,sha256,created_at) values($1,$2,$3,$4,$5,$6,$7,$8)',
      [
        f.id,
        f.record_id,
        f.name,
        f.mime,
        content.length,
        content,
        createHash('sha256').update(content).digest('hex'),
        f.created_at,
      ]
    );
  }
  await client.query('COMMIT');
  console.log(
    JSON.stringify({
      database: expected,
      project: p.id,
      roles: seed.members.length,
      records: seed.records.length,
      files: seed.files.length,
    })
  );
} catch (e) {
  await client.query('ROLLBACK');
  throw e;
} finally {
  client.release();
  await pool.end();
}
