import type { CommunityRecord, Field, Kind, Role, User } from './types';
import { horizonKinds, pageFromKind, personalPages } from './horizon';
import { studioKinds } from './studio';
const all: Role[] = [
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
const prod: Role[] = [
  'bee',
  'production',
  'art_director',
  'stylist',
  'photographer',
  'filmmaker',
  'beauty',
  'editor',
];
const core: Role[] = ['bee'];
const description: Field = {
  key: 'description',
  label: 'Details',
  type: 'textarea',
  required: true,
};
const due: Field = { key: 'due', label: 'Due date', type: 'date', required: true };
const pillar: Field = {
  key: 'pillar',
  label: 'Pillar',
  type: 'select',
  options: ['Social', 'Environmental', 'Economic'],
  required: true,
};
const reference: Field = { key: 'reference', label: 'Source or shared file link', type: 'url' };
const action: Field = {
  key: 'actionId',
  label: 'Linked field action',
  type: 'record',
  linkKind: 'action',
  required: true,
};
const review = (authors: Role[], reviewers: Role[] = core) => ({
  draft: [{ to: 'submitted', roles: authors }],
  submitted: [
    { to: 'approved', roles: reviewers },
    { to: 'needs_update', roles: reviewers },
  ],
  needs_update: [{ to: 'submitted', roles: authors }],
});
export const kinds: Record<string, Kind> = {
  ...horizonKinds,
  ...studioKinds,
  brief: {
    label: 'Creative brief',
    group: 'bee',
    roles: ['bee', 'brand'],
    read: all.filter((r) => r !== 'expert'),
    initial: 'draft',
    fields: [
      { key: 'intention', label: 'Essence of intentions', type: 'textarea', required: true },
      { key: 'emotion', label: 'Emotion & message', required: true },
      {
        key: 'aesthetic',
        label: 'Art of blooming · visual direction',
        type: 'textarea',
        required: true,
      },
      { key: 'casting', label: 'Casting & talent needs', type: 'textarea' },
      { key: 'looks', label: 'Number of looks', type: 'number', required: true },
      { key: 'deliverables', label: 'Photos, films & formats', type: 'textarea', required: true },
      { key: 'rights', label: 'Channels, territories & usage duration', required: true },
      due,
      reference,
    ],
    transitions: review(['bee', 'brand']),
  },
  concept: {
    label: 'Creative direction',
    group: 'bee',
    roles: ['bee', 'art_director'],
    read: prod.concat('brand'),
    initial: 'draft',
    fields: [
      description,
      { key: 'mood', label: 'Visual treatment', type: 'textarea', required: true },
      { key: 'styling', label: 'Styling & beauty notes', type: 'textarea' },
      due,
      reference,
    ],
    transitions: {
      draft: [{ to: 'internal_review', roles: ['bee', 'art_director'] }],
      internal_review: [
        { to: 'brand_review', roles: ['bee', 'production'] },
        { to: 'needs_update', roles: ['bee', 'production'] },
      ],
      brand_review: [
        { to: 'approved', roles: ['bee', 'brand'] },
        { to: 'needs_update', roles: ['bee', 'brand'] },
      ],
      needs_update: [{ to: 'internal_review', roles: ['bee', 'art_director'] }],
      approved: [{ to: 'locked', roles: ['bee', 'art_director'] }],
    },
  },
  trust: {
    label: 'Partner trust journey',
    group: 'bee',
    roles: ['bee', 'ngo'],
    read: ['bee', 'ngo'],
    initial: 'draft',
    fields: [
      { key: 'contact', label: 'Human connection · contact', required: true },
      { key: 'identity', label: 'Organization registration reference', required: true },
      { key: 'expertise', label: 'Expertise & track record', type: 'textarea', required: true },
      { key: 'presence', label: 'Local presence', type: 'textarea', required: true },
      {
        key: 'integrity',
        label: 'Governance, safeguarding & conflicts',
        type: 'textarea',
        required: true,
      },
      reference,
    ],
    transitions: {
      draft: [{ to: 'submitted', roles: ['bee', 'ngo'] }],
      submitted: [
        { to: 'verified', roles: core },
        { to: 'needs_update', roles: core },
      ],
      needs_update: [{ to: 'submitted', roles: ['bee', 'ngo'] }],
    },
  },
  location: {
    label: 'Scouting location',
    group: 'bee',
    roles: ['bee', 'production', 'art_director'],
    read: prod.concat('brand'),
    initial: 'draft',
    fields: [
      description,
      { key: 'latitude', label: 'Latitude', type: 'number', required: true },
      { key: 'longitude', label: 'Longitude', type: 'number', required: true },
      { key: 'light', label: 'Light / call time', required: true },
      { key: 'permit', label: 'Access & permit notes', required: true },
      due,
      reference,
    ],
    transitions: review(['bee', 'production', 'art_director'], ['bee', 'art_director']),
  },
  task: {
    label: 'Team task',
    group: 'bee',
    roles: prod,
    read: prod.concat('brand'),
    initial: 'planned',
    fields: [
      description,
      {
        key: 'assignedRole',
        label: 'Production pole',
        type: 'select',
        options: prod,
        required: true,
      },
      due,
      reference,
    ],
    transitions: {
      planned: [{ to: 'in_progress', roles: prod }],
      in_progress: [{ to: 'review', roles: prod }],
      review: [
        { to: 'complete', roles: ['bee', 'production', 'art_director'] },
        { to: 'in_progress', roles: ['bee', 'production', 'art_director'] },
      ],
    },
  },
  booking: {
    label: 'Production booking',
    group: 'flower',
    roles: ['bee', 'production'],
    read: ['bee', 'production'],
    initial: 'draft',
    fields: [
      {
        key: 'category',
        label: 'Category',
        type: 'select',
        options: ['Transport', 'Accommodation', 'Catering', 'Production'],
        required: true,
      },
      { key: 'supplier', label: 'Supplier', required: true },
      {
        key: 'locationId',
        label: 'Approved location',
        type: 'record',
        linkKind: 'location|studio:place',
        required: true,
      },
      { key: 'quantity', label: 'Activity quantity', type: 'number', required: true },
      {
        key: 'factorKey',
        label: 'Planning factor',
        type: 'select',
        options: [
          'shared_van',
          'rail',
          'homestay',
          'ecolodge',
          'plant_meal',
          'local_meal',
          'local_equipment',
        ],
        required: true,
      },
      { key: 'amount', label: 'Cost', type: 'number', unit: 'EUR', required: true },
      {
        key: 'local',
        label: 'Locally owned supplier',
        type: 'select',
        options: ['Yes', 'No'],
        required: true,
      },
      {
        key: 'charter',
        label: 'Quality charter reviewed',
        type: 'select',
        options: ['Yes', 'No'],
        required: true,
      },
      { key: 'agreement', label: 'Agreement reference', required: true },
      due,
      reference,
    ],
    transitions: review(['bee', 'production']),
  },
  production: {
    label: 'Production milestone',
    group: 'flower',
    roles: ['bee', 'production'],
    read: prod.concat('brand'),
    initial: 'planning',
    fields: [description, due, reference],
    transitions: {
      planning: [{ to: 'ready', roles: ['bee', 'production'] }],
      ready: [{ to: 'in_production', roles: ['bee', 'production'] }],
      in_production: [{ to: 'post_production', roles: ['bee', 'production'] }],
      post_production: [{ to: 'delivered', roles: ['bee', 'production'] }],
    },
  },
  allocation: {
    label: 'Capital allocation',
    group: 'flower',
    roles: core,
    read: ['bee', 'brand', 'ngo', 'production'],
    initial: 'committed',
    fields: [
      {
        key: 'layer',
        label: 'Capital layer',
        type: 'select',
        options: ['Production', 'Impact', 'Creative', 'Bee operations'],
        required: true,
      },
      { key: 'partner', label: 'Recipient organization', required: true },
      {
        key: 'pillar',
        label: 'Impact pillar',
        type: 'select',
        options: ['Social', 'Environmental', 'Economic'],
      },
      { key: 'amount', label: 'Allocated capital', type: 'number', unit: 'EUR', required: true },
      description,
    ],
    transitions: {
      committed: [{ to: 'allocated', roles: core }],
      allocated: [{ to: 'released', roles: core }],
    },
  },
  bloom: {
    label: 'Bloom / impact milestone',
    group: 'bee',
    roles: ['bee', 'ngo'],
    read: ['bee', 'ngo', 'brand'],
    initial: 'draft',
    fields: [
      description,
      pillar,
      {
        key: 'allocationId',
        label: 'Impact allocation',
        type: 'record',
        linkKind: 'allocation',
        required: true,
      },
      { key: 'baseline', label: 'Baseline & measurement plan', type: 'textarea', required: true },
      due,
    ],
    transitions: review(['bee', 'ngo']),
  },
  action: {
    label: 'Field action',
    group: 'flower',
    roles: ['bee', 'ngo'],
    read: ['bee', 'ngo', 'brand', 'expert'],
    initial: 'planned',
    fields: [
      description,
      pillar,
      { key: 'bloomId', label: 'Bloom', type: 'record', linkKind: 'bloom', required: true },
      { key: 'location', label: 'Field location', required: true },
      due,
      reference,
    ],
    transitions: {
      planned: [{ to: 'in_progress', roles: ['bee', 'ngo'] }],
      in_progress: [{ to: 'submitted', roles: ['bee', 'ngo'] }],
      submitted: [
        { to: 'validated', roles: core },
        { to: 'needs_update', roles: core },
      ],
      needs_update: [{ to: 'in_progress', roles: ['bee', 'ngo'] }],
    },
  },
  expense: {
    label: 'Impact expense',
    group: 'flower',
    roles: ['bee', 'ngo'],
    read: ['bee', 'ngo'],
    initial: 'draft',
    fields: [
      action,
      {
        key: 'allocationId',
        label: 'Impact allocation',
        type: 'record',
        linkKind: 'allocation',
        required: true,
      },
      { key: 'supplier', label: 'Supplier', required: true },
      { key: 'amount', label: 'Amount', type: 'number', unit: 'EUR', required: true },
      { key: 'invoice', label: 'Invoice / receipt reference', required: true },
      {
        key: 'local',
        label: 'Local supplier',
        type: 'select',
        options: ['Yes', 'No'],
        required: true,
      },
      description,
      due,
      reference,
    ],
    transitions: {
      ...review(['bee', 'ngo']),
      approved: [{ to: 'paid', roles: core }],
      paid: [{ to: 'evidenced', roles: core }],
    },
  },
  evidence: {
    label: 'Field evidence',
    group: 'flower',
    roles: ['bee', 'ngo'],
    read: ['bee', 'ngo', 'brand', 'expert'],
    initial: 'draft',
    fields: [
      action,
      { key: 'observed', label: 'Observation date', type: 'date', required: true },
      { key: 'location', label: 'Location / GPS reference', required: true },
      description,
      { key: 'method', label: 'Collection method & consent', type: 'textarea', required: true },
      reference,
    ],
    transitions: {
      draft: [{ to: 'submitted', roles: ['bee', 'ngo'] }],
      submitted: [
        { to: 'bee_reviewed', roles: core },
        { to: 'needs_update', roles: core },
      ],
      bee_reviewed: [
        { to: 'expert_validated', roles: ['expert'] },
        { to: 'needs_update', roles: ['expert'] },
      ],
      needs_update: [{ to: 'submitted', roles: ['bee', 'ngo'] }],
    },
  },
  result: {
    label: 'Impact indicator',
    group: 'honey',
    roles: ['bee', 'ngo'],
    read: ['bee', 'ngo', 'brand', 'expert'],
    initial: 'draft',
    fields: [
      action,
      pillar,
      { key: 'definition', label: 'Metric definition', required: true },
      { key: 'baseline', label: 'Baseline', type: 'number', required: true },
      { key: 'target', label: 'Target', type: 'number', required: true },
      { key: 'actual', label: 'Observed value', type: 'number' },
      { key: 'unit', label: 'Unit', required: true },
      { key: 'risk', label: 'Risk level', type: 'select', options: ['Low', 'Medium', 'High'] },
      {
        key: 'indicatorType',
        label: 'Indicator type',
        type: 'select',
        options: ['Observation', 'Estimate', 'Public claim'],
      },
      { key: 'method', label: 'Method & reporting period', type: 'textarea', required: true },
      {
        key: 'evidenceId',
        label: 'Supporting evidence',
        type: 'record',
        linkKind: 'evidence',
        required: true,
      },
      {
        key: 'expertRequired',
        label: 'Expert validation required',
        type: 'select',
        options: ['Yes', 'No'],
        required: true,
      },
      due,
    ],
    transitions: {
      draft: [{ to: 'submitted', roles: ['bee', 'ngo'] }],
      submitted: [
        { to: 'validated', roles: core },
        { to: 'needs_update', roles: core },
      ],
      needs_update: [{ to: 'submitted', roles: ['bee', 'ngo'] }],
    },
  },
  asset: {
    label: 'Creative asset',
    group: 'honey',
    roles: prod,
    read: prod.concat('brand'),
    initial: 'draft',
    fields: [
      {
        key: 'type',
        label: 'Format',
        type: 'select',
        options: ['Photo', 'Film', 'Look', 'Beauty', 'Treatment'],
        required: true,
      },
      description,
      { key: 'versionLabel', label: 'Version', required: true },
      { key: 'rights', label: 'Usage rights · territories · expiry', required: true },
      {
        key: 'ai',
        label: 'AI involvement',
        type: 'select',
        options: ['Not documented', 'None declared', 'AI assisted', 'AI generated'],
        required: true,
      },
      reference,
      due,
    ],
    transitions: {
      draft: [{ to: 'internal_review', roles: prod }],
      internal_review: [
        { to: 'brand_review', roles: ['bee', 'art_director'] },
        { to: 'needs_update', roles: ['bee', 'art_director'] },
      ],
      brand_review: [
        { to: 'approved', roles: ['bee', 'brand'] },
        { to: 'needs_update', roles: ['bee', 'brand'] },
      ],
      needs_update: [{ to: 'internal_review', roles: prod }],
      approved: [{ to: 'delivered', roles: ['bee', 'editor'] }],
    },
  },
};
export function canRead(
  role: Role,
  r: CommunityRecord,
  user: Pick<User, 'organization' | 'id'>
): boolean {
  if (!kinds[r.kind]?.read.includes(role)) return false;
  if (role === 'bee') return true;
  const page = pageFromKind(r.kind);
  if (page && personalPages.includes(page.id))
    return r.created_by === user.id || r.data.assigneeId === user.id || role === 'production';
  if (page && role === 'ngo' && page.projectType === 'impact')
    return r.organization === user.organization;
  if (
    page &&
    role === 'model' &&
    ['bookings', 'call-sheet', 'transport', 'stay', 'fitting'].includes(page.id)
  )
    return r.created_by === user.id || r.data.assigneeId === user.id;
  if (
    r.kind === 'task' &&
    ['stylist', 'photographer', 'filmmaker', 'beauty', 'editor'].includes(role)
  )
    return r.data.assignedRole === role;
  if (r.kind === 'allocation') {
    if (role === 'ngo') return r.data.layer === 'Impact' && r.data.partner === user.organization;
    if (role === 'production') return r.data.layer === 'Production';
    if (role === 'brand') return r.data.layer !== 'Bee operations';
  }
  if (
    role === 'ngo' &&
    ['trust', 'bloom', 'action', 'expense', 'evidence', 'result'].includes(r.kind)
  )
    return r.organization === user.organization;
  if (role === 'expert') return r.data.reviewerId === user.id;
  if (role === 'brand' && ['evidence', 'result'].includes(r.kind))
    return ['bee_reviewed', 'expert_validated', 'validated'].includes(r.status);
  return true;
}
export function canEdit(role: Role, r: CommunityRecord, user: Pick<User, 'organization' | 'id'>) {
  return (
    canRead(role, r, user) &&
    kinds[r.kind].roles.includes(role) &&
    ['draft', 'needs_update', 'planned', 'planning'].includes(r.status) &&
    (role === 'bee' ||
      r.created_by === user.id ||
      Boolean(pageFromKind(r.kind)) ||
      r.kind.startsWith('studio:') ||
      (['production', 'art_director'].includes(role) &&
        ['task', 'location', 'concept', 'production'].includes(r.kind)))
  );
}
export function availableTransitions(
  role: Role,
  r: CommunityRecord,
  user: Pick<User, 'organization' | 'id'>
) {
  if (!canRead(role, r, user)) return [];
  return (kinds[r.kind]?.transitions[r.status] || [])
    .filter((t) => t.roles.includes(role))
    .filter(
      (t) =>
        !(
          ['verified', 'validated', 'bee_reviewed', 'expert_validated'].includes(t.to) &&
          r.kind !== 'horizon:expert-review' &&
          r.created_by === user.id
        )
    );
}
export function validateFields(
  kind: string,
  input: unknown
): { data: Record<string, string | number | boolean>; error?: string } {
  if (!kinds[kind] || !input || typeof input !== 'object' || Array.isArray(input))
    return { data: {}, error: 'Invalid record.' };
  const src = input as Record<string, unknown>;
  const data: Record<string, string | number | boolean> = {};
  for (const f of kinds[kind].fields) {
    const v = src[f.key];
    if (f.required && (v === undefined || v === null || String(v).trim() === ''))
      return { data: {}, error: `${f.label} is required.` };
    if (v === undefined || v === null || v === '') continue;
    if (f.type === 'number') {
      const n = Number(v);
      if (
        !Number.isFinite(n) ||
        Math.abs(n) > 1e9 ||
        (!['latitude', 'longitude', 'baseline', 'actual'].includes(f.key) && n < 0)
      )
        return { data: {}, error: `Invalid ${f.label}.` };
      if (
        (f.key === 'latitude' && Math.abs(n) > 90) ||
        (f.key === 'longitude' && Math.abs(n) > 180)
      )
        return { data: {}, error: 'Invalid coordinates.' };
      data[f.key] = n;
    } else {
      if (typeof v !== 'string' || v.length > 5000)
        return { data: {}, error: `Invalid ${f.label}.` };
      const s = v.trim();
      if (f.type === 'select' && !f.options?.includes(s))
        return { data: {}, error: `Invalid ${f.label}.` };
      if (f.type === 'url') {
        try {
          if (new URL(s).protocol !== 'https:') throw Error();
        } catch {
          return { data: {}, error: 'Use a full HTTPS link.' };
        }
      }
      if (f.type === 'date' && (!/^\d{4}-\d{2}-\d{2}$/.test(s) || !Number.isFinite(Date.parse(s))))
        return { data: {}, error: 'Use a valid date.' };
      data[f.key] = s;
    }
  }
  return { data };
}
export const statusLabel = (s: string) =>
  s.replaceAll('_', ' ').replace(/^./, (c) => c.toUpperCase());
