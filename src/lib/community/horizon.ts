import catalogue from '@/data/horizon-catalogue.json';
import type { CommunityRecord, Field, Kind, Role, Workspace } from './types';

export type HorizonField = {
  id: string;
  label: string;
  value: string;
  icon: string;
  type: string;
  options: string[];
};
export type HorizonPage = {
  id: string;
  title: string;
  fr: string;
  phase: string;
  kind: string;
  fields: HorizonField[];
  roles: Record<string, string>;
  note: string;
  action: string;
  detail?: string;
  secondary: string;
  projectType: string;
  number: number;
};
export const pages = catalogue.pages as HorizonPage[];
export const assets: Record<string, string> = {
  ...catalogue.study.assets,
  ...Object.fromEntries(
    [
      'frame-fashion-wide',
      'look-front',
      'look-back',
      'look-detail',
      'product-shirt',
      'product-trousers',
      'product-bag',
      'product-sandals',
    ].map((id) => [id, `/assets/community/horizon/morocco-${id}.webp`])
  ),
};
export const roleKey = (role: Role) =>
  ({ art_director: 'art', photographer: 'photo', filmmaker: 'film' })[role as string] || role;
export const serverRole = (role: string): Role =>
  (({ art: 'art_director', photo: 'photographer', film: 'filmmaker' })[role] || role) as Role;
export const pageKind = (id: string) => `horizon:${id}`;
export const pageFromKind = (kind: string) => pages.find((p) => pageKind(p.id) === kind);
export const personalPages = ['profile', 'invite', 'agreements'];
export const utilityPages = ['projects', 'project', 'inbox', 'calendar', 'login', 'profile'];
export const briefPages = pages.filter((p) => p.phase === 'Brief' && p.id !== 'brief-review');
export const trustPages = pages.filter(
  (p) => p.phase === 'Trust' && !['trust-review', 'trust-verified'].includes(p.id)
);
export const pageGroup = (p: HorizonPage) =>
  p.projectType === 'impact' || p.phase.includes('Honey')
    ? 'Impacts'
    : p.phase.includes('Flower') ||
        p.phase === 'Préparation' ||
        p.phase.startsWith('Scouting') ||
        p.phase === 'Post-production' ||
        p.phase === 'Livraison'
      ? 'Journeys'
      : 'Creatives';
export const pageRecord = (w: Workspace, p: HorizonPage) =>
  w.records.filter((r) => r.kind === pageKind(p.id)).at(-1);
export const sourcePages: Record<string, string> = {
  'bee-review': 'version',
  'brand-review': 'version',
  delivery: 'version',
  indicator: 'evidence-add',
  'expert-review': 'indicator',
};
export const privateProductionFields: Record<string, string[]> = {
  'horizon:budget': ['budget-2'],
  'horizon:capital-report': ['capital-report-2'],
};
export function horizonExtraFields(p: HorizonPage): Field[] {
  if (p.id === 'casting')
    return [
      { key: 'imageAsset', label: 'Visual reference' },
      { key: 'agency', label: 'Agency / representation' },
      { key: 'portfolio', label: 'Portfolio', type: 'url' },
      {
        key: 'availability',
        label: 'Availability',
        type: 'select',
        options: ['To confirm', 'Requested', 'Available', 'Unavailable'],
      },
      {
        key: 'shortlisted',
        label: 'Shortlist',
        type: 'select',
        options: ['Proposed', 'Shortlisted', 'Not retained'],
      },
    ];
  if (['moodboard', 'beauty', 'proposal'].includes(p.id))
    return [{ key: 'imageAsset', label: 'Visual reference' }];
  return sourcePages[p.id]
    ? [
        {
          key: 'sourceId',
          label:
            p.id === 'expert-review'
              ? 'Assigned indicator'
              : p.id === 'indicator'
                ? 'Source evidence'
                : 'Version to review',
          type: 'record',
          linkKind: pageKind(sourcePages[p.id]),
        },
        { key: 'sourceVersion', label: 'Source revision', type: 'number' },
      ]
    : [];
}

// Drafts may be partial. Required fields are checked at the submission boundary.
export const horizonKinds: Record<string, Kind> = Object.fromEntries(
  pages
    .filter((p) => !utilityPages.includes(p.id))
    .map((p) => {
      const read = Object.keys(p.roles).map(serverRole);
      if (!read.includes('bee')) read.unshift('bee');
      const authors = Object.entries(p.roles)
        .filter(([, m]) => m === 'edit')
        .map(([r]) => serverRole(r));
      if (read.includes('bee') && !authors.includes('bee')) authors.unshift('bee');
      const reviewer: Role[] = ['bee'];
      const creative = ['proposal', 'moodboard', 'casting', 'creative-lock', 'selects'].includes(
        p.id
      );
      const transitions: Kind['transitions'] = {
        draft: [{ to: 'submitted', roles: authors }],
        needs_update: [{ to: 'submitted', roles: authors }],
        submitted: [
          { to: creative ? 'brand_review' : 'approved', roles: reviewer },
          { to: 'needs_update', roles: reviewer },
        ],
        brand_review: [
          { to: 'approved', roles: ['brand'] },
          { to: 'needs_update', roles: ['brand'] },
        ],
        approved: [{ to: 'needs_update', roles: ['bee'] }],
      };
      if (p.id === 'expert-review')
        transitions.submitted = [
          { to: 'expert_validated', roles: ['expert'] },
          { to: 'needs_update', roles: ['expert'] },
        ];
      if (p.id === 'brand-review')
        transitions.submitted = [
          { to: 'approved', roles: ['brand'] },
          { to: 'needs_update', roles: ['brand'] },
        ];
      return [
        pageKind(p.id),
        {
          label: p.title,
          group:
            p.projectType === 'impact' || p.phase.includes('Honey')
              ? 'honey'
              : pageGroup(p) === 'Journeys'
                ? 'flower'
                : 'bee',
          roles: authors,
          read,
          initial: 'draft',
          fields: [
            ...p.fields.map((f) => ({
              key: f.id,
              label: f.label,
              type:
                f.type === 'number'
                  ? ('number' as const)
                  : f.type === 'date'
                    ? ('date' as const)
                    : f.type === 'select' || f.type === 'choices'
                      ? ('select' as const)
                      : ('text' as const),
              options: f.options,
            })),
            { key: 'notes', label: 'Notes', type: 'textarea' },
            { key: 'reference', label: 'Source link', type: 'url' },
            ...horizonExtraFields(p),
            ...(p.id === 'indicator'
              ? [
                  {
                    key: 'risk',
                    label: 'Risk level',
                    type: 'select' as const,
                    options: ['Low', 'Medium', 'High'],
                  },
                  {
                    key: 'indicatorType',
                    label: 'Indicator type',
                    type: 'select' as const,
                    options: ['Observation', 'Estimate', 'Public claim'],
                  },
                ]
              : []),
          ],
          transitions,
        } satisfies Kind,
      ];
    })
);

export function horizonTransitionError(
  record: CommunityRecord,
  to: string,
  w: Workspace
): string | null {
  const p = pageFromKind(record.kind);
  if (!p) return null;
  const approved = (id: string) =>
    w.records.some((r) => r.kind === pageKind(id) && r.status === 'approved');
  const source = w.records.find(
    (r) => r.id === record.data.sourceId && r.kind === pageKind(sourcePages[p.id])
  );
  if (sourcePages[p.id] && ['submitted', 'approved', 'expert_validated'].includes(to)) {
    if (!source || Number(record.data.sourceVersion) !== source.version)
      return 'Select the source record and its current revision first.';
  }
  if (to === 'submitted') {
    const fields = p.fields.filter((f) => f.type !== 'upload');
    if (!['review', 'status', 'metrics', 'capital', 'gallery', 'board', 'tasks'].includes(p.kind)) {
      const missing = fields.find(
        (f) => record.data[f.id] === undefined || String(record.data[f.id]).trim() === ''
      );
      if (missing) return `Complete ${missing.label.toLowerCase()} before submitting.`;
    }
    if (p.id === 'brief-review') {
      const incomplete = briefPages.find(
        (b) =>
          !w.records.some(
            (r) =>
              r.kind === pageKind(b.id) &&
              b.fields
                .filter((f) => f.type !== 'upload')
                .every((f) => r.data[f.id] !== undefined && String(r.data[f.id]).trim() !== '')
          )
      );
      if (incomplete) return `Complete ${incomplete.title.toLowerCase()} first.`;
    }
    if (p.id === 'trust-review') {
      const ids = [
        'trust-human',
        'trust-identity',
        'trust-organization',
        'trust-integrity',
        'trust-expertise',
        'trust-presence',
      ];
      const missing = ids.find(
        (id) =>
          !w.records.some(
            (r) =>
              r.kind === pageKind(id) &&
              r.organization === record.organization &&
              Object.keys(r.data).length
          )
      );
      if (missing)
        return 'Complete the identity, organization, integrity and local presence records first.';
    }
    if (
      ['raws', 'version', 'evidence-add', 'expense-add', 'impact-expense'].includes(p.id) &&
      !record.data.reference &&
      !record.files?.length
    )
      return 'Attach a file or an HTTPS source link before submitting.';
    if (
      p.id === 'brand-review' &&
      !w.records.some(
        (r) =>
          r.kind === pageKind('bee-review') &&
          r.status === 'approved' &&
          r.data.sourceId === source?.id &&
          r.data.sourceVersion === source?.version
      )
    )
      return 'Bee must review this version first.';
    if (p.id === 'indicator' && (!record.data.risk || !record.data.indicatorType))
      return 'Document the indicator type and risk level first.';
  }
  if (to === 'approved') {
    if (['budget', 'impact-capital'].includes(p.id) && w.project.role !== 'bee')
      return 'Bee approval is required for budgets.';
    if (
      p.id === 'trust-verified' &&
      !w.records.some(
        (r) =>
          r.kind === pageKind('trust-review') &&
          r.status === 'approved' &&
          r.organization === record.organization
      )
    )
      return 'Complete this partner’s Bee trust review first.';
    if (p.id === 'ready') {
      for (const id of ['creative-lock', 'budget'])
        if (!approved(id))
          return `Approve ${pages.find((p) => p.id === id)?.title.toLowerCase()} first.`;
      if (
        !approved('location') &&
        !w.records.some((r) => r.kind === 'studio:place' && r.status === 'approved')
      )
        return 'Approve a scouting location first.';
      const crew = (w.members || []).filter(
        (m) => !['bee', 'brand', 'ngo', 'expert'].includes(m.role)
      );
      const prepared =
        crew.length > 0 &&
        crew.every((m) =>
          w.records.some(
            (r) =>
              r.kind === 'studio:readiness' &&
              r.data.memberId === m.id &&
              r.status === 'approved' &&
              ['contract', 'travel', 'stay', 'equipment', 'permit', 'brief'].every(
                (k) => r.data[k] && r.data[k] !== 'Pending'
              )
          )
        );
      if (!approved('team') && !prepared)
        return 'Approve the readiness of every assigned crew member first.';
      if (w.records.some((r) => r.kind === 'booking' && r.status !== 'approved'))
        return 'Approve the production bookings first.';
    }
    if (
      p.id === 'delivery' &&
      (!w.records.some(
        (r) =>
          r.kind === pageKind('brand-review') &&
          r.status === 'approved' &&
          r.data.sourceId === source?.id &&
          r.data.sourceVersion === source?.version
      ) ||
        !approved('rights'))
    )
      return 'Approve the final version and document the usage rights first.';
    if (
      p.id === 'indicator' &&
      (record.data.risk !== 'Low' || record.data.indicatorType === 'Public claim') &&
      !w.records.some(
        (r) =>
          r.kind === pageKind('expert-review') &&
          r.data.reviewerId &&
          r.data.sourceId === record.id &&
          r.data.sourceVersion === record.version &&
          r.status === 'expert_validated'
      )
    )
      return 'An assigned independent expert must validate the evidence for this indicator.';
    if (
      [
        'impact-overview',
        'impact-social',
        'impact-environment',
        'impact-economic',
        'report',
      ].includes(p.id) &&
      !approved('indicator')
    )
      return 'Validate the indicator and its evidence before approving an impact report.';
  }
  if (
    to === 'expert_validated' &&
    (record.data.reviewerId !== w.user.id || source?.created_by === w.user.id)
  )
    return 'An assigned independent reviewer is required.';
  return null;
}
