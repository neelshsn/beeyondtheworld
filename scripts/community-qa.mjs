import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const accounts = JSON.parse(await readFile('../community-test-credentials.json', 'utf8'));
const base = process.env.BEE_QA_URL || 'http://localhost:3108';
const project = 'b0000000-0000-4000-8000-000000000001';
const clients = {};
const results = [];
for (const a of accounts) {
  const r = await fetch(base + '/api/community/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: base },
    body: JSON.stringify({ email: a.email, password: a.password }),
  });
  assert.equal(r.status, 200, `login ${a.role}`);
  const cookie = r.headers.get('set-cookie').split(';')[0];
  clients[a.role] = async (path, method = 'GET', data) => {
    const res = await fetch(base + path, {
      method,
      headers: {
        Cookie: cookie,
        Origin: base,
        ...(data instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      },
      body: data === undefined ? undefined : data instanceof FormData ? data : JSON.stringify(data),
    });
    const body = await res.json().catch(() => null);
    return { status: res.status, body };
  };
  results.push(`Sign in: ${a.role}`);
}
const read = async (role) =>
  (await clients[role]('/api/community/workspace?project=' + project)).body;
const ngo = await read('ngo');
assert(
  ngo.records.every(
    (r) =>
      r.kind !== 'booking' &&
      r.kind !== 'concept' &&
      (r.kind !== 'allocation' || r.data.layer === 'Impact')
  )
);
const brand = await read('brand');
assert(brand.records.every((r) => !['trust', 'expense', 'booking'].includes(r.kind)));
const expert = await read('expert');
assert(
  expert.records.every((r) => r.data.reviewerId === accounts.find((a) => a.role === 'expert').id)
);
results.push('NGO, brand and expert visibility');
const denied = await clients.brand('/api/community/records', 'POST', {
  projectId: project,
  kind: 'allocation',
  title: 'Forbidden',
  data: {},
});
assert.equal(denied.status, 403);
results.push('Role escalation rejected');
const isolation = await clients.brand('/api/community/records', 'POST', {
  projectId: '00000000-0000-4000-8000-000000000099',
  kind: 'brief',
  title: 'Forbidden',
  data: {},
});
assert.equal(isolation.status, 403);
results.push('Unassigned project rejected');
const unauth = await fetch(base + '/api/community/workspace');
assert.equal(unauth.status, 401);
results.push('Unauthenticated workspace rejected');
if (process.argv.includes('--read-only')) {
  await writeFile(
    '../../outputs/community-live-checks.json',
    JSON.stringify({ url: base, passed: results, checkedAt: new Date().toISOString() }, null, 2)
  );
  console.log(JSON.stringify({ passed: results.length, mode: 'read-only', url: base }));
  process.exit(0);
}
async function patch(role, r, to, comment = 'QA workflow validation') {
  const res = await clients[role]('/api/community/records', 'PATCH', {
    projectId: project,
    id: r.id,
    version: r.version,
    to,
    comment,
  });
  assert.equal(res.status, 200, `${role}: ${to}: ${JSON.stringify(res.body)}`);
  return (await read(role)).records.find((x) => x.id === r.id);
}
const brief = brand.records.find((r) => r.kind === 'brief');
const cross = await clients.ngo('/api/community/records', 'PATCH', {
  projectId: project,
  id: brief.id,
  version: brief.version,
  to: 'approved',
});
assert.equal(cross.status, 403);
results.push('Cross-role record writes rejected');
let record = ngo.records.find((r) => r.kind === 'evidence');
const creation = await clients.ngo('/api/community/records', 'POST', {
  projectId: project,
  kind: 'evidence',
  title: 'QA · dated nursery observation',
  data: {
    actionId: record.data.actionId,
    observed: '2026-10-09',
    location: 'Fictional QA location',
    description: 'Synthetic test attachment for the evidence workflow.',
    method: 'Test fixture only; no real field activity.',
  },
});
assert.equal(creation.status, 200, JSON.stringify(creation.body));
record = (await read('ngo')).records.find((r) => r.id === creation.body.id);
let missing = await clients.ngo('/api/community/records', 'PATCH', {
  projectId: project,
  id: record.id,
  version: record.version,
  to: 'submitted',
});
assert.equal(missing.status, 400);
results.push('Evidence source required');
const file = new FormData();
file.set('projectId', project);
file.set('recordId', record.id);
file.set(
  'file',
  new Blob([await readFile('public/assets/community/garden.webp')], { type: 'image/webp' }),
  'synthetic-qa-scenery.webp'
);
const uploaded = await clients.ngo('/api/community/files', 'POST', file);
assert.equal(uploaded.status, 200, JSON.stringify(uploaded.body));
record = (await read('ngo')).records.find((r) => r.id === record.id);
assert.equal(record.files.length, 1);
results.push('Private file uploaded and read back');
const privateRead = await clients.brand(
  `/api/community/files?project=${project}&id=${record.files[0].id}`
);
assert.equal(privateRead.status, 404);
results.push('Unreviewed attachment hidden from brand');
record = await patch('ngo', record, 'submitted');
const selfReview = await clients.ngo('/api/community/records', 'PATCH', {
  projectId: project,
  id: record.id,
  version: record.version,
  to: 'bee_reviewed',
});
assert.equal(selfReview.status, 403);
results.push('NGO cannot self-validate');
const asBee = (await read('bee')).records.find((r) => r.id === record.id);
record = await patch('bee', asBee, 'bee_reviewed');
const assigned = await clients.bee('/api/community/records', 'PATCH', {
  projectId: project,
  id: record.id,
  version: record.version,
  assignReviewer: accounts.find((a) => a.role === 'expert').id,
});
assert.equal(assigned.status, 200);
record = (await read('expert')).records.find((r) => r.id === record.id);
record = await patch('expert', record, 'expert_validated');
results.push('NGO → Bee review → assigned expert validation');
const indicator = await clients.ngo('/api/community/records', 'POST', {
  projectId: project,
  kind: 'result',
  title: 'QA · nursery indicator',
  data: {
    actionId: record.data.actionId,
    pillar: 'Environmental',
    definition: 'Synthetic workflow indicator',
    baseline: 0,
    target: 8,
    actual: 4,
    unit: 'beds',
    method: 'Synthetic dataset; no external reporting.',
    evidenceId: record.id,
    expertRequired: 'Yes',
    due: '2027-03-19',
  },
});
assert.equal(indicator.status, 200);
let metric = (await read('ngo')).records.find((r) => r.id === indicator.body.id);
metric = await patch('ngo', metric, 'submitted');
metric = (await read('bee')).records.find((r) => r.id === metric.id);
await patch('bee', metric, 'validated');
assert((await read('brand')).records.some((r) => r.id === metric.id));
results.push('Validated indicator becomes visible to brand');
const task = (await read('stylist')).records.find(
  (r) => r.kind === 'task' && r.status === 'in_progress'
);
if (task) {
  const initial = task.version;
  await patch('stylist', task, 'review');
  const stale = await clients.production('/api/community/records', 'PATCH', {
    projectId: project,
    id: task.id,
    version: initial,
    to: 'complete',
  });
  assert.equal(stale.status, 409);
  results.push('Concurrent stale update rejected');
}

const expenseData = ngo.records.find((r) => r.kind === 'expense').data;
const allocation = ngo.records.find((r) => r.id === expenseData.allocationId);
const all = (await read('bee')).records;
const used = all
  .filter(
    (r) =>
      r.kind === 'expense' &&
      r.data.allocationId === allocation.id &&
      ['approved', 'paid', 'evidenced'].includes(r.status)
  )
  .reduce((n, r) => n + Number(r.data.amount), 0);
const remaining = Number(allocation.data.amount) - used;
if (remaining > 1) {
  const expenses = [];
  for (let i = 0; i < 2; i++) {
    const created = await clients.ngo('/api/community/records', 'POST', {
      projectId: project,
      kind: 'expense',
      title: 'QA concurrent expense ' + i,
      data: {
        ...expenseData,
        amount: Math.ceil(remaining * 0.7),
        reference: 'https://beeyondtheworld.com/concept',
      },
    });
    assert.equal(created.status, 200);
    const r = (await read('ngo')).records.find((x) => x.id === created.body.id);
    expenses.push(await patch('ngo', r, 'submitted'));
  }
  const concurrent = await Promise.all(
    expenses.map((r) =>
      clients.bee('/api/community/records', 'PATCH', {
        projectId: project,
        id: r.id,
        version: r.version,
        to: 'approved',
      })
    )
  );
  assert.deepEqual(concurrent.map((r) => r.status).sort(), [200, 400]);
  results.push('Concurrent expense approvals cannot exceed the allocation');
}
await writeFile(
  '../../outputs/community-qa-checks.json',
  JSON.stringify({ url: base, passed: results, checkedAt: new Date().toISOString() }, null, 2)
);
console.log(JSON.stringify({ passed: results.length, checks: results }));
