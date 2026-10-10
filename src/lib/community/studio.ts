import type { CommunityRecord, Field, Kind, Role, Workspace } from './types';

const crew: Role[] = [
  'bee',
  'production',
  'art_director',
  'stylist',
  'photographer',
  'filmmaker',
  'beauty',
  'editor',
  'model',
];
const core: Role[] = ['bee', 'production', 'art_director'];
const field = (key: string, label: string, type: Field['type'] = 'text'): Field => ({
  key,
  label,
  type,
});
const link = (key: string, label: string, kind: string): Field => ({
  key,
  label,
  type: 'record',
  linkKind: `studio:${kind}`,
});
const choice = (key: string, label: string, options: string[]): Field => ({
  key,
  label,
  type: 'select',
  options,
});
export const disciplines = [
  ['look', 'Looks', 'hanger'],
  ['styling', 'Styling', 'feather'],
  ['set', 'Set design', 'sun'],
  ['attitude', 'Attitude', 'user'],
  ['beauty', 'Beauty', 'spark'],
  ['direction', 'Direction', 'camera'],
  ['talent', 'Talent', 'users'],
];
const common: Field[] = [
  field('imageAsset', 'Visual reference'),
  field('notes', 'Notes', 'textarea'),
  field('reference', 'Shared source', 'url'),
];
function kind(label: string, roles: Role[], fields: Field[], creative = false): Kind {
  return {
    label,
    group: 'flower',
    roles,
    read: [...crew, 'brand'],
    initial: 'draft',
    fields: [...fields, ...common],
    transitions: {
      draft: [{ to: 'submitted', roles }],
      needs_update: [{ to: 'submitted', roles }],
      submitted: [
        { to: creative ? 'brand_review' : 'approved', roles: ['bee'] },
        { to: 'needs_update', roles: ['bee'] },
      ],
      brand_review: [
        { to: 'approved', roles: ['brand'] },
        { to: 'needs_update', roles: ['brand'] },
      ],
      approved: [{ to: 'needs_update', roles: ['bee'] }],
    },
  };
}
export const studioKinds: Record<string, Kind> = {
  'studio:route': kind(
    'Itinerary',
    ['bee', 'production'],
    [field('stops', 'Location order', 'textarea'), field('description', 'Route notes', 'textarea')]
  ),
  'studio:availability': kind(
    'Crew allocation',
    ['bee', 'production'],
    [
      field('memberId', 'Team member'),
      field('starts', 'First day', 'date'),
      field('ends', 'Last day', 'date'),
      choice('state', 'Availability', ['Proposed', 'Confirmed', 'Unavailable']),
      field('description', 'Assignment', 'textarea'),
    ]
  ),
  'studio:activity': kind('Production activity', core, [
    field('date', 'Date', 'date'),
    field('start', 'Start time'),
    field('end', 'End time'),
    choice('category', 'Activity', [
      'Preparation',
      'Transport',
      'Shoot',
      'Meal',
      'Fitting',
      'Review',
      'Editing',
      'Delivery',
      'Wrap',
    ]),
    link('placeId', 'Location', 'place'),
    field('memberId', 'Team member'),
    field('description', 'Details', 'textarea'),
    choice('state', 'Activity status', ['Planned', 'In progress', 'Complete']),
    field('sort', 'Order', 'number'),
  ]),
  'studio:readiness': kind(
    'Team readiness',
    ['bee', 'production'],
    [
      field('memberId', 'Team member'),
      choice('contract', 'Agreement', ['Pending', 'Documented']),
      choice('travel', 'Travel', ['Pending', 'Booked', 'Not needed']),
      choice('stay', 'Accommodation', ['Pending', 'Booked', 'Not needed']),
      choice('equipment', 'Equipment', ['Pending', 'Ready', 'Not needed']),
      choice('permit', 'Visa / permit', ['Pending', 'Ready', 'Not needed']),
      choice('brief', 'Brief', ['Pending', 'Shared']),
    ]
  ),
  'studio:place': kind('Location', core, [
    field('description', 'Sense of place', 'textarea'),
    field('latitude', 'Latitude', 'number'),
    field('longitude', 'Longitude', 'number'),
    field('light', 'Light window'),
    field('access', 'Access'),
    choice('permit', 'Permit', ['Pending', 'Requested', 'Granted', 'Not required']),
    field('logistics', 'Logistics', 'textarea'),
  ]),
  'studio:frame': kind(
    'Visual frame',
    [...core, 'photographer', 'filmmaker'],
    [
      link('placeId', 'Location', 'place'),
      field('description', 'Shot intention', 'textarea'),
      field('time', 'Time window'),
      field('light', 'Light'),
      field('shot', 'Framing'),
      field('sort', 'Order', 'number'),
      choice('captured', 'Capture status', ['Planned', 'Captured', 'Retake']),
    ],
    true
  ),
  'studio:look': kind(
    'Look',
    [...core, 'stylist'],
    [
      field('description', 'Look intention', 'textarea'),
      field('talent', 'Talent'),
      choice('fitting', 'Fitting', ['Pending', 'Scheduled', 'Ready', 'Changes needed']),
      field('continuity', 'Continuity', 'textarea'),
      field('frontAsset', 'Front view'),
      field('sideAsset', 'Side view'),
      field('backAsset', 'Back view'),
      field('detailAsset', 'Detail view'),
      choice('fitCheck', 'Fit checked', ['Pending', 'Checked']),
      choice('movementCheck', 'Movement checked', ['Pending', 'Checked']),
      choice('alterations', 'Alterations', ['Pending', 'Done', 'Not needed']),
      choice('packed', 'Packed', ['No', 'Yes']),
    ],
    true
  ),
  'studio:product': kind(
    'Collection item',
    [...core, 'stylist', 'brand'],
    [
      link('lookId', 'Look', 'look'),
      field('sku', 'Reference'),
      field('material', 'Material'),
      field('colour', 'Colour'),
      field('size', 'Size'),
      choice('received', 'Shipment status', ['Expected', 'Received', 'On set', 'Returned']),
    ]
  ),
  'studio:reference': kind(
    'Frame reference',
    crew.filter((r) => r !== 'model'),
    [
      link('frameId', 'Frame', 'frame'),
      choice(
        'category',
        'Discipline',
        disciplines.map((d) => d[0])
      ),
      link('lookId', 'Look', 'look'),
      field('description', 'Intention', 'textarea'),
      choice('active', 'Assignment active', ['Yes', 'No']),
    ]
  ),
};
export function studioTransitionError(
  record: CommunityRecord,
  to: string,
  w: Workspace
): string | null {
  if (!record.kind.startsWith('studio:')) return null;
  if (['submitted', 'brand_review', 'approved'].includes(to)) {
    if (
      record.kind === 'studio:frame' &&
      !w.records.some((r) => r.id === record.data.placeId && r.kind === 'studio:place')
    )
      return 'Choose the location for this frame first.';
    if (record.kind === 'studio:reference' && (!record.data.frameId || !record.data.category))
      return 'Choose the frame and discipline first.';
  }
  return null;
}
export function studioMutationError(
  kind: string,
  data: Record<string, string | number | boolean>,
  w: Workspace,
  recordId?: string
): string | null {
  if (data.memberId && !w.members.some((m) => m.id === data.memberId))
    return 'Select a member of this journey.';
  if (
    kind === 'studio:route' &&
    String(data.stops || '')
      .split(',')
      .filter(Boolean)
      .some((id) => !w.records.some((r) => r.id === id && r.kind === 'studio:place'))
  )
    return 'Every itinerary stop must belong to this journey.';
  if (
    kind === 'studio:availability' &&
    data.starts &&
    data.ends &&
    String(data.ends) < String(data.starts)
  )
    return 'The last day must follow the first day.';
  if (kind === 'studio:look' || kind === 'studio:product') {
    const original = w.records.find((r) => r.id === recordId);
    const lookIds = kind === 'studio:look' ? [recordId] : [data.lookId, original?.data.lookId];
    const linked = w.records.filter(
      (r) =>
        r.kind === 'studio:reference' &&
        lookIds.includes(String(r.data.lookId)) &&
        r.data.active !== 'No'
    );
    if (
      linked.some((r) =>
        w.records.some(
          (f) => f.id === r.data.frameId && !['draft', 'needs_update'].includes(f.status)
        )
      )
    )
      return 'Reopen the linked frame before changing this look or its collection items.';
  }
  if (kind !== 'studio:reference') return null;
  const originalReference = w.records.find((r) => r.id === recordId);
  const oldFrame = w.records.find((r) => r.id === originalReference?.data.frameId);
  if (oldFrame && !['draft', 'needs_update'].includes(oldFrame.status))
    return 'Reopen the original frame before changing its references.';
  const frame = w.records.find((r) => r.id === data.frameId && r.kind === 'studio:frame');
  if (!frame) return 'Select a frame in this journey.';
  if (!['draft', 'needs_update'].includes(frame.status))
    return 'Reopen the frame before changing its references.';
  const allowed: Partial<Record<Role, string[]>> = {
    stylist: ['look', 'styling'],
    beauty: ['beauty'],
    photographer: ['set', 'attitude', 'direction'],
    filmmaker: ['set', 'attitude', 'direction'],
    editor: ['direction'],
  };
  if (allowed[w.project.role] && !allowed[w.project.role]?.includes(String(data.category)))
    return 'This reference belongs to another production discipline.';
  return null;
}
export function studioImage(record: CommunityRecord | undefined, w: Workspace, fallback: string) {
  const photo = record?.files?.find((f) => f.mime.startsWith('image/'));
  return photo ? `/api/community/files?project=${w.project.id}&id=${photo.id}&inline=1` : fallback;
}
