import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { randomBytes, scryptSync, randomUUID } from 'node:crypto';
import { createSql } from '../config/postgres.mjs';
import { resolve } from 'node:path';

const envFile = process.argv.includes('--production')
  ? '.env.production.local'
  : '.env.development.local';
process.loadEnvFile(envFile);
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('[SENSITIVE]'))
  throw Error('Database connection missing.');
const sql = createSql(process.env.DATABASE_URL);
const schema = await readFile(new URL('../drizzle/0010-community.sql', import.meta.url), 'utf8');
if (!process.argv.includes('--skip-schema'))
  for (const statement of schema
    .replace(/^--.*$/gm, '')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean))
    await sql.query(statement);
const root = resolve(process.cwd(), '..');
const credentialsPath = resolve(root, 'community-test-credentials.json');
const roleList = [
  'bee',
  'brand',
  'production',
  'art_director',
  'stylist',
  'photographer',
  'filmmaker',
  'beauty',
  'editor',
  'ngo',
  'expert',
];
const names = {
  bee: 'Bee Studio',
  brand: 'Atelier Sol',
  production: 'Alex Rivers',
  art_director: 'Camille Arden',
  stylist: 'Lou Morgan',
  photographer: 'Sacha Reed',
  filmmaker: 'Jules Hart',
  beauty: 'Mila Drew',
  editor: 'Noa Lane',
  ngo: 'Terra Bloom',
  expert: 'Robin Vale',
};
let accounts;
if (existsSync(credentialsPath)) accounts = JSON.parse(await readFile(credentialsPath, 'utf8'));
else {
  accounts = roleList.map((role) => ({
    id: randomUUID(),
    role,
    name: names[role],
    email: `test.${role}@community.beeyondtheworld.com`,
    password: 'Bee-' + randomBytes(18).toString('base64url'),
    organization:
      role === 'ngo'
        ? 'Terra Bloom · Demo'
        : role === 'brand'
          ? 'Atelier Sol · Demo'
          : role === 'expert'
            ? 'Independent Review · Demo'
            : 'Bee Studio · Demo',
  }));
  await writeFile(credentialsPath, JSON.stringify(accounts, null, 2));
}
for (const a of accounts) {
  const salt = randomBytes(16).toString('hex');
  const hash = salt + ':' + scryptSync(a.password, salt, 64).toString('hex');
  await sql.query(
    'INSERT INTO bee_community_users(id,email,name,organization,password_hash,is_test) VALUES($1,$2,$3,$4,$5,true) ON CONFLICT(email) DO NOTHING',
    [a.id, a.email, a.name, a.organization, hash]
  );
}
const projectId = 'b0000000-0000-4000-8000-000000000001';
await sql.query(
  `INSERT INTO bee_community_projects(id,title,territory,season,starts_on,ends_on,is_demo) VALUES($1,'Namibia','Namib Desert · Namibia','Spring / Summer 2027','2027-03-12','2027-03-19',true) ON CONFLICT(id) DO NOTHING`,
  [projectId]
);
for (const a of accounts)
  await sql.query(
    'INSERT INTO bee_community_members(project_id,user_id,role) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',
    [projectId, a.id, a.role]
  );
const account = (role) => accounts.find((a) => a.role === role);
const id = (n) => 'c0000000-0000-4000-8000-' + String(n).padStart(12, '0');
const samples = [
  [
    1,
    'brief',
    'The poetry of a shared journey',
    'submitted',
    'brand',
    {
      intention:
        'Create an intimate dialogue between natural textures, movement and the desert landscape.',
      emotion: 'Quiet confidence. Freedom. Connection to place.',
      aesthetic: 'Earth tones, sculptural silhouettes, soft golden-hour light.',
      casting: 'Two adult talents; inclusive casting to be reviewed with the brand.',
      looks: 12,
      deliverables: '12 editorial stills, 24 lookbook images, one 30-second film.',
      rights: 'Digital editorial · Europe · 12 months from delivery; draft rights for review.',
      due: '2027-02-12',
    },
  ],
  [
    2,
    'concept',
    'African Solstice · visual direction',
    'brand_review',
    'art_director',
    {
      description:
        'A campaign shaped by warm textures, the stillness of the landscape and effortless movement.',
      mood: 'Mineral, tactile and human. Wide frames alternate with intimate details.',
      styling: 'Sand, ivory and ochre. Natural skin and softly textured hair.',
      due: '2027-02-19',
      reference: 'https://beeyondtheworld.com/campaigns',
    },
  ],
  [
    3,
    'trust',
    'Terra Bloom · partner profile',
    'verified',
    'ngo',
    {
      contact: 'Terra Bloom demonstration team',
      identity: 'DEMO-ORG-001 · fictional registration reference',
      expertise: 'Demonstration of nursery planning, field monitoring and community coordination.',
      presence: 'Fictional local partner for the shared Namibia demonstration project.',
      integrity:
        'Demo safeguarding and conflict-of-interest statement. No actual verification is claimed.',
      reference: 'https://beeyondtheworld.com/concept',
    },
  ],
  [
    4,
    'location',
    'Sossusvlei · morning light',
    'approved',
    'production',
    {
      description:
        'Sculptural dunes and a wide open horizon. A quiet setting for the first editorial sequence.',
      latitude: -24.7273,
      longitude: 15.3424,
      light: '05:45 arrival · sunrise setup',
      permit: 'Scouting example. Access permission must be obtained for a real shoot.',
      due: '2027-03-12',
      reference: 'https://drive.google.com/file/d/1RV_rAGYWYW_UfUebGv31H2cKSG2dabLg/view',
    },
  ],
  [
    5,
    'location',
    'Deadvlei · texture & silhouette',
    'draft',
    'art_director',
    {
      description:
        'A graphic landscape for a considered play between fabric, silhouette and negative space.',
      latitude: -24.7595,
      longitude: 15.2925,
      light: '06:15 to 08:00 · soft light',
      permit: 'Walk-in access and equipment footprint to be confirmed.',
      due: '2027-03-13',
    },
  ],
  [
    6,
    'allocation',
    'Local production resources',
    'allocated',
    'bee',
    {
      layer: 'Production',
      partner: 'Bee Studio · Demo',
      amount: 18000,
      description: 'Fictional production budget for testing. No money is committed or moved.',
    },
  ],
  [
    7,
    'allocation',
    'Terra Bloom · first bloom',
    'released',
    'bee',
    {
      layer: 'Impact',
      partner: 'Terra Bloom · Demo',
      amount: 6000,
      description:
        'Fictional Impact Capital allocation. A demonstration ledger entry only; no payment has been made.',
    },
  ],
  [
    8,
    'allocation',
    'Art direction & creative development',
    'allocated',
    'bee',
    {
      layer: 'Creative',
      partner: 'Bee Studio · Demo',
      amount: 4500,
      description: 'Illustrative creative allocation for the demo project.',
    },
  ],
  [
    9,
    'bloom',
    'Native garden · a first bloom',
    'approved',
    'ngo',
    {
      description:
        'Prepare a native plant nursery and a small training programme with a local partner.',
      pillar: 'Environmental',
      allocationId: id(7),
      baseline:
        'Demo baseline: 0 nursery beds. Track beds established with dated photos and a site log.',
      due: '2027-03-19',
    },
  ],
  [
    10,
    'action',
    'Prepare the nursery beds',
    'in_progress',
    'ngo',
    {
      description:
        'Prepare the growing beds, document materials and record the first field observations.',
      pillar: 'Environmental',
      bloomId: id(9),
      location: 'Demonstration garden · Namibia',
      due: '2027-03-15',
    },
  ],
  [
    11,
    'action',
    'A workshop with local growers',
    'planned',
    'ngo',
    {
      description:
        'Plan a practical knowledge-sharing session. Record participation using a consent-based register.',
      pillar: 'Social',
      bloomId: id(9),
      location: 'Demonstration partner site',
      due: '2027-03-17',
    },
  ],
  [
    12,
    'expense',
    'Nursery materials · local supplier',
    'draft',
    'ngo',
    {
      actionId: id(10),
      allocationId: id(7),
      supplier: 'Local nursery · fictional supplier',
      amount: 420,
      invoice: 'DEMO-INV-001',
      local: 'Yes',
      description:
        'Illustrative expense for nursery materials. Add a test receipt before submitting.',
      due: '2027-03-14',
    },
  ],
  [
    13,
    'evidence',
    'Nursery baseline · field record',
    'submitted',
    'ngo',
    {
      actionId: id(10),
      observed: '2027-03-12',
      location: 'Demonstration site · Namibia',
      description:
        'Fictional evidence record for reviewing the complete workflow. The source is contextual, not proof of actual field work.',
      method: 'Demo field notes. No beneficiary data or real consent records.',
      reference: 'https://beeyondtheworld.com/concept',
      reviewerId: account('expert').id,
    },
  ],
  [
    14,
    'result',
    'Nursery beds established',
    'draft',
    'ngo',
    {
      actionId: id(10),
      pillar: 'Environmental',
      definition: 'Number of growing beds completed at the demo site.',
      baseline: 0,
      target: 8,
      actual: 4,
      unit: 'beds',
      method: 'Fictional example. Count against a dated site register and reviewed field evidence.',
      evidenceId: id(13),
      expertRequired: 'Yes',
      due: '2027-03-19',
      reviewerId: account('expert').id,
    },
  ],
  [
    15,
    'result',
    'Growers attending the workshop',
    'draft',
    'ngo',
    {
      actionId: id(11),
      pillar: 'Social',
      definition: 'Unique participants attending the demonstration workshop.',
      baseline: 0,
      target: 12,
      actual: 0,
      unit: 'people',
      method: 'Consent-based attendance register, counted once per person. Demo only.',
      evidenceId: id(13),
      expertRequired: 'No',
      due: '2027-03-19',
    },
  ],
  [
    16,
    'booking',
    'Shared crew transfer · day one',
    'submitted',
    'production',
    {
      category: 'Transport',
      supplier: 'Desert Routes · demo supplier',
      locationId: id(4),
      quantity: 960,
      factorKey: 'shared_van',
      amount: 280,
      local: 'Yes',
      charter: 'Yes',
      agreement: 'DEMO-AGREEMENT-001',
      due: '2027-03-12',
      reference: 'https://beeyondtheworld.com/concept',
    },
  ],
  [
    17,
    'booking',
    'Local guesthouse · crew nights',
    'draft',
    'production',
    {
      category: 'Accommodation',
      supplier: 'Namib Guesthouse · demo supplier',
      locationId: id(4),
      quantity: 24,
      factorKey: 'homestay',
      amount: 1440,
      local: 'Yes',
      charter: 'Yes',
      agreement: 'DEMO-AGREEMENT-002',
      due: '2027-03-12',
    },
  ],
  [
    18,
    'production',
    'Namibia · production readiness',
    'planning',
    'production',
    {
      description:
        'Lock the creative direction, approve locations and clear logistics before starting the shoot.',
      due: '2027-03-11',
    },
  ],
  [
    19,
    'task',
    'Confirm the first twelve looks',
    'in_progress',
    'stylist',
    {
      description:
        'Match the collection to the frames, record fitting notes and prepare the continuity sheet.',
      assignedRole: 'stylist',
      due: '2027-02-24',
    },
  ],
  [
    20,
    'task',
    'A shared visual language',
    'review',
    'photographer',
    {
      description: 'Review light, framing and equipment needs with the artistic director.',
      assignedRole: 'photographer',
      due: '2027-02-22',
    },
  ],
  [
    21,
    'task',
    'Beauty & continuity board',
    'planned',
    'beauty',
    {
      description: 'Prepare skin, hair and continuity references for the first shooting day.',
      assignedRole: 'beauty',
      due: '2027-02-25',
    },
  ],
  [
    22,
    'task',
    'Motion treatment & shot list',
    'planned',
    'filmmaker',
    {
      description:
        'Translate the visual direction into the 30-second film and shooting requirements.',
      assignedRole: 'filmmaker',
      due: '2027-02-25',
    },
  ],
  [
    23,
    'task',
    'Post-production handoff',
    'planned',
    'editor',
    {
      description:
        'Confirm source file organization, colour workflow, version naming and delivery formats.',
      assignedRole: 'editor',
      due: '2027-03-19',
    },
  ],
  [
    24,
    'asset',
    'Solstice · first creative selection',
    'brand_review',
    'editor',
    {
      type: 'Photo',
      description:
        'Sample creative selection for testing approval and delivery. Campaign images in the interface are illustrative references.',
      versionLabel: 'v01',
      rights: 'Demo review only · no commercial rights are granted through this sample.',
      ai: 'None declared',
      reference: 'https://beeyondtheworld.com/campaigns',
      due: '2027-03-26',
    },
  ],
];
for (const [n, kind, title, status, role, data] of samples) {
  const a = account(role);
  await sql.query(
    `WITH inserted AS (INSERT INTO bee_community_records(id,project_id,kind,title,status,data,organization,created_by) VALUES($1,$2,$3,$4,$5,$6::jsonb,$7,$8) ON CONFLICT(id) DO NOTHING RETURNING id) INSERT INTO bee_community_events(id,project_id,record_id,actor_id,action,new_state,comment) SELECT $9,$2,id,$8,'demo_initialized',$5,'Fictional starting state for testing; not an actual business approval.' FROM inserted`,
    [
      id(n),
      projectId,
      kind,
      title,
      status,
      JSON.stringify(data),
      a.organization,
      a.id,
      randomUUID(),
    ]
  );
}
const output = resolve(root, '..', 'outputs');
await mkdir(output, { recursive: true });
const escape = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  );
const html = `<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Bee Community · Accès privés de test</title><style>body{font:15px system-ui;background:#132d3b;color:#f3e8d0;max-width:1050px;margin:50px auto;padding:25px}h1{font:44px Georgia}a{color:#e7c486}table{border-collapse:collapse;width:100%}td,th{text-align:left;padding:13px;border-bottom:1px solid #ffffff25}code{font-size:12px}p{line-height:1.7;color:#c5d1d3}.wrap{overflow:auto}</style><h1>Votre Bee Community.</h1><p><a href="https://beeyondtheworld.com/community">Ouvrir les dashboards</a> · Comptes de test privés, limités au projet de démonstration Namibia. Données fictives, aucun paiement ni message externe. Conserver ce fichier privé.</p><div class="wrap"><table><tr><th>Vue</th><th>Identifiant</th><th>Mot de passe</th></tr>${accounts.map((a) => `<tr><td>${escape(a.role)}</td><td>${escape(a.email)}</td><td><code>${escape(a.password)}</code></td></tr>`).join('')}</table></div><p>Parcours conseillé : marque → direction artistique → production → ONG → Bee Core → expert → marque. Les mots de passe sont uniques. Aucun de ces comptes ne donne accès à l'administration du site public.</p></html>`;
await writeFile(resolve(output, 'beeyond-community-acces.html'), html);
console.log(
  JSON.stringify({
    migration: 'applied',
    testAccounts: accounts.length,
    project: projectId,
    sampleRecords: samples.length,
    credentialsFile: 'outputs/beeyond-community-acces.html',
  })
);
