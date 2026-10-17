export const creativeKinds = [
  'talent',
  'destination',
  'content',
  'collection',
  'activation',
] as const;
export type CreativeKind = (typeof creativeKinds)[number];
export type CreativeRole = 'bee' | 'curator' | 'production' | 'contributor' | 'viewer';
export type CreativeData = Record<string, string | string[]>;
export type CreativeItem = {
  id: string;
  scope: 'studio' | 'demo';
  kind: CreativeKind;
  title: string;
  status: string;
  data: CreativeData;
  version: number;
  updated_at: string;
  created_by: string;
  updated_by: string;
};
export type CreativeField = {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'url' | 'date' | 'select' | 'link';
  options?: string[];
  target?: CreativeKind;
  required?: boolean;
};
export const schemas: Record<CreativeKind, CreativeField[]> = {
  talent: [
    {
      key: 'discipline',
      label: 'Discipline',
      type: 'select',
      options: [
        'Local scout',
        'Local line producer',
        'Creative director',
        'Photography',
        'Film',
        'Beauty',
        'Styling',
        'Set design',
        'Sound',
        'Post-production',
      ],
      required: true,
    },
    { key: 'destinationId', label: 'Home destination', type: 'link', target: 'destination' },
    { key: 'portfolio', label: 'Portfolio', type: 'url' },
    { key: 'contact', label: 'Email / preferred contact' },
    { key: 'style', label: 'Creative identity / styles' },
    { key: 'sector', label: 'Brand sectors' },
    {
      key: 'collaboration',
      label: 'Collaboration model',
      type: 'select',
      options: ['To discuss', 'Local Line Producer', 'Creative Scout Royalty'],
    },
    { key: 'agreement', label: 'Signed agreement reference', type: 'url' },
    { key: 'responsibilities', label: 'Role & responsibilities', type: 'textarea' },
    { key: 'owner', label: 'Relationship owner', required: true },
    { key: 'nextAction', label: 'Next action' },
    { key: 'nextDate', label: 'Next action date', type: 'date' },
    { key: 'notes', label: 'Contact history & notes', type: 'textarea' },
  ],
  destination: [
    { key: 'country', label: 'Country', required: true },
    { key: 'territory', label: 'City / region', required: true },
    { key: 'style', label: 'Styles / atmosphere' },
    { key: 'sector', label: 'Brand sectors' },
    { key: 'description', label: 'The story of this place', type: 'textarea' },
    { key: 'season', label: 'Best season / access' },
    {
      key: 'feasibilityNote',
      label: 'Bloom feasibility · permits, access, safety, logistics',
      type: 'textarea',
    },
    { key: 'owner', label: 'Bloom lead' },
    { key: 'nextAction', label: 'Next action' },
    { key: 'nextDate', label: 'Next action date', type: 'date' },
  ],
  content: [
    {
      key: 'destinationId',
      label: 'Destination',
      type: 'link',
      target: 'destination',
      required: true,
    },
    { key: 'talentId', label: 'Creator / scout', type: 'link', target: 'talent', required: true },
    {
      key: 'medium',
      label: 'Medium',
      type: 'select',
      options: ['Photo', 'Reel', 'Sound', 'Visual Tale', 'Location'],
      required: true,
    },
    { key: 'sourceUrl', label: 'Original source / recording', type: 'url', required: true },
    { key: 'style', label: 'Styles / creative identity' },
    { key: 'sector', label: 'Brand sectors' },
    { key: 'description', label: 'Creative intention', type: 'textarea' },
    { key: 'credit', label: 'Credit line', required: true },
    {
      key: 'rights',
      label: 'Usage permission',
      type: 'select',
      options: ['Internal only', 'Brand presentation', 'Public showreel'],
      required: true,
    },
    { key: 'rightsEvidence', label: 'Permission / licence evidence', type: 'url' },
    { key: 'rightsExpiry', label: 'Permission expiry', type: 'date' },
    {
      key: 'provenance',
      label: 'Origin',
      type: 'select',
      options: ['Unknown', 'Organic original', 'AI concept', 'Mixed'],
      required: true,
    },
    { key: 'evidenceUrl', label: 'Provenance / Bee evidence', type: 'url' },
    { key: 'location', label: 'Recording location / GPS' },
    { key: 'chapter', label: 'Suggested chapter' },
    { key: 'notes', label: 'Credits, constraints & notes', type: 'textarea' },
  ],
  collection: [
    { key: 'intention', label: 'Brand intention', type: 'textarea', required: true },
    { key: 'style', label: 'Matching styles' },
    { key: 'sector', label: 'Brand sector' },
    { key: 'companyId', label: 'CRM brand' },
    { key: 'opportunityId', label: 'CRM opportunity' },
    { key: 'briefId', label: 'CRM brief' },
    { key: 'projectId', label: 'Community production' },
    { key: 'contentIds', label: 'Selected content' },
    { key: 'notes', label: 'Selection notes', type: 'textarea' },
  ],
  activation: [
    {
      key: 'collectionId',
      label: 'Selected portfolio',
      type: 'link',
      target: 'collection',
      required: true,
    },
    { key: 'projectId', label: 'Community production', required: true },
    { key: 'opportunityId', label: 'CRM opportunity', required: true },
    { key: 'contractUrl', label: 'Signed booking evidence', type: 'url' },
    { key: 'bookingDate', label: 'Confirmed booking date', type: 'date' },
    { key: 'notes', label: 'Production handoff / cancellation reason', type: 'textarea' },
  ],
};
export class CreativeError extends Error {
  constructor(
    message: string,
    public status = 400
  ) {
    super(message);
  }
}
export const need = (ok: unknown, message: string, status = 400) => {
  if (!ok) throw new CreativeError(message, status);
};
export function cleanItem(
  input: unknown,
  kind: CreativeKind
): { title: string; data: CreativeData } {
  need(input && typeof input === 'object', 'Invalid form.');
  const b = input as { title?: unknown; data?: Record<string, unknown> };
  need(
    typeof b.title === 'string' && b.title.trim().length > 1 && b.title.length <= 160,
    'Add a name (2–160 characters).'
  );
  const data: CreativeData = {};
  for (const f of schemas[kind]) {
    const raw = b.data?.[f.key];
    if (f.key === 'contentIds') {
      need(
        Array.isArray(raw) &&
          raw.length <= 60 &&
          raw.every((x) => typeof x === 'string' && /^[a-f0-9-]{36}$/i.test(x)),
        'Select up to 60 contents.'
      );
      data[f.key] = [...new Set(raw as string[])];
      continue;
    }
    need(raw === undefined || typeof raw === 'string', `Invalid ${f.label}.`);
    const v = String(raw || '').trim();
    need(v.length <= 5000, `${f.label} is too long.`);
    need(!f.required || v, `${f.label} is required.`);
    if (v && f.type === 'url') {
      try {
        const u = new URL(v);
        need(u.protocol === 'https:' && !u.username && !u.password, 'Use an HTTPS link.');
      } catch {
        throw new CreativeError(`${f.label}: use an HTTPS link.`);
      }
    }
    if (v && f.type === 'date')
      need(
        /^\d{4}-\d{2}-\d{2}$/.test(v) &&
          Number.isFinite(Date.parse(v)) &&
          new Date(v).toISOString().slice(0, 10) === v,
        'Use a valid date.'
      );
    if (v && f.options) need(f.options.includes(v), `Invalid ${f.label}.`);
    if (v && (f.type === 'link' || f.key.endsWith('Id')))
      need(/^[a-f0-9-]{36}$/i.test(v), `Choose a valid ${f.label}.`);
    data[f.key] = v;
  }
  if (data.nextAction) need(data.owner && data.nextDate, 'A follow-up needs an owner and date.');
  return { title: String(b.title).trim(), data };
}
export function usable(
  item: CreativeItem,
  external = false,
  today = new Date().toISOString().slice(0, 10)
) {
  return (
    item.kind === 'content' &&
    item.status === 'curated' &&
    !!item.data.credit &&
    (!external ||
      (['Brand presentation', 'Public showreel'].includes(String(item.data.rights)) &&
        !!item.data.rightsEvidence &&
        (!item.data.rightsExpiry || String(item.data.rightsExpiry) >= today)))
  );
}
export function canPublish(item: CreativeItem, all: CreativeItem[]) {
  const place = all.find((x) => x.id === item.data.destinationId);
  return (
    usable(item, true) &&
    item.data.rights === 'Public showreel' &&
    item.data.provenance === 'Organic original' &&
    item.data.verification === 'verified' &&
    place?.status === 'feasible' &&
    !!item.data.mediaId
  );
}
export function transition(
  item: CreativeItem,
  action: string,
  role: CreativeRole,
  all: CreativeItem[]
): string {
  const manager = ['bee', 'curator'].includes(role);
  const content = all.filter((x) => ((item.data.contentIds as string[]) || []).includes(x.id));
  if (action === 'contacted') {
    need(item.kind === 'talent' && role !== 'viewer' && item.data.contact, 'Add a contact first.');
    return 'contacted';
  }
  if (action === 'curate') {
    need(
      item.kind === 'content' && manager,
      'Creative curation belongs to Bee / Creative Studio.',
      403
    );
    need(
      item.data.sourceUrl && item.data.credit && item.data.talentId && item.data.destinationId,
      'Complete source, credit, creator and destination.'
    );
    return 'curated';
  }
  if (action === 'feasible') {
    need(
      item.kind === 'destination' && ['bee', 'production'].includes(role),
      'Bloom / Bee validates production feasibility.',
      403
    );
    need(item.data.feasibilityNote, 'Document permits, access and logistics.');
    return 'feasible';
  }
  if (action === 'approve') {
    need(item.kind === 'collection' && manager, 'Bee / Creative Studio approves selections.', 403);
    need(
      content.length > 0 &&
        content.length === (item.data.contentIds as string[]).length &&
        content.every((x) => usable(x, true)),
      'Every selected content needs curation, credits and valid brand-use rights.'
    );
    return 'approved';
  }
  if (action === 'reopen') {
    need(
      role !== 'viewer' && item.status !== 'confirmed',
      'Cancel a confirmed booking explicitly.'
    );
    return 'draft';
  }
  if (action === 'archive') {
    need(manager && item.kind !== 'activation', 'Only Bee / Studio can archive this record.', 403);
    return 'archived';
  }
  throw new CreativeError('Unknown action.');
}
export function relatedContent(collection: CreativeItem, all: CreativeItem[]) {
  return all.filter(
    (x) => x.kind === 'content' && ((collection.data.contentIds as string[]) || []).includes(x.id)
  );
}
