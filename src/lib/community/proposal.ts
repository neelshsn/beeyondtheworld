import M from '../../../public/review/tale-model';
import type { Member, Project } from './types';

export { M };
export type ProposalState = Record<string, unknown>;
export const proposalPages = [
  'tale-brief',
  'tale-visions',
  'tale-chapters',
  'tale-hive',
  'tale-cocreation',
  'tale-bloom',
  'tale-value',
  'tale-export',
  'tale-team',
  'tale-rights',
  'tale-sound',
];
export const proposalNames = [
  'Brief & Brand',
  'Mutual Visions',
  'Visual Tale',
  'Creative Hive',
  'Co-creation',
  'Bloom',
  'Impact & Multi-ROI',
  'Review & Export',
  'Team contributions',
  'Distribution rights',
  'Sound Tale',
];
export const visualKey =
  /^(cover|vision-[123]|chapter-(?:[0-9]|1[01])|board-(?:[0-9]|1[01])-[0-3])$/;
export const visualAssets = [
  'm:frame-fashion-wide',
  'm:craft',
  'm:frame-arch',
  'on-set',
  'fitting',
  'm:field',
  'm:landscape',
  'film-detail',
];
export const roleKey = (role: string) =>
  ({ art_director: 'art', photographer: 'photo', filmmaker: 'film' })[role] || role;
export const sourceKind = (kind: string) =>
  /^(studio:|horizon:(scouting|location|frame|beauty|styling|moodboard|casting|items|item|fitting|budget|allocation|creative-lock|post-calendar|version|rights)$)/.test(
    kind
  );
export function initialProposal(p: Project): ProposalState {
  const s: ProposalState = {
    ...M.defaults,
    'tale-title': p.title,
    'tale-destination': p.territory,
    'da-season': p.season || '',
    'tale-brand': '',
    'da-revision': 1,
  };
  if (p.is_demo) {
    s['tale-brand'] = p.title.includes('Craie') ? 'Craie Studio' : p.title.split(' · ')[0];
    s['tale-intention'] =
      `A tactile journey between light, gesture and material in ${p.territory}.`;
    s['da-owner-production'] = '';
  } else {
    for (const k of Object.keys(M.defaults)) if (typeof M.defaults[k] === 'string') s[k] = '';
    s['tale-title'] = p.title;
    s['tale-destination'] = p.territory;
  }
  return s;
}
export function canProposalEdit(role: string, key: string, state: ProposalState): boolean {
  if (key === 'tale-cost') return role === 'bee';
  if (key === 'da-review-note') return ['bee', 'brand', 'art'].includes(role);
  const pole = M.poles.find((p) => key.endsWith('-' + p.id));
  if (pole && key.startsWith('da-')) {
    if (/^da-(content|evidence)-/.test(key)) return M.lead(role) || role === pole.id;
    if (/^da-feedback-/.test(key)) return M.lead(role) || role === M.task(state, pole.id).head;
    return M.lead(role);
  }
  if (M.lead(role)) return true;
  if (role === 'sound' && /^sound-(brief|gps|composer|rights|reference)-\d+$/.test(key))
    return true;
  if (
    role === 'production' &&
    /^(tale-feasibility|tale-scout|da-access|da-board-|da-call-)/.test(key)
  )
    return true;
  return (
    role === 'brand' &&
    /^(tale-brand|tale-intention|tale-keywords|vision-brand|da-brand-comment)$/.test(key)
  );
}
const textKeys = new Set([
  'tale-brand',
  'tale-title',
  'tale-intention',
  'tale-keywords',
  'tale-destination',
  'tale-feasibility',
  'tale-claim',
  'da-season',
  'da-access',
  'da-brand-comment',
  'da-creative-return',
  'da-operational-return',
  'da-impact-return',
  'da-review-note',
  'vision-brand',
  'vision-bee',
  'vision-social',
  'vision-environment',
  'vision-economy',
  ...[
    'holder',
    'asset',
    'territory',
    'channels',
    'start',
    'end',
    'restrictions',
    'document',
    'credits',
  ].map((k) => 'da-rights-' + k),
]);
const boolKeys = new Set([
  'tale-photo',
  'tale-sound',
  'tale-bts',
  'tale-scout',
  'tale-cost',
  'tale-charter',
  'da-editorial',
  'da-social-assets',
]);
export function fieldError(
  key: string,
  value: unknown,
  s: ProposalState,
  role: string,
  members: Member[]
): string | null {
  const pole = M.poles.find((p) => key.endsWith('-' + p.id));
  const taskField =
    pole && /^da-(owner|head|brief|chapter|due|content|evidence|feedback|required)-/.test(key);
  const chapterField =
    /^(chapter-(name|location|note)|da-(subtitle|elements|call|board-note)|sound-(brief|gps|composer|rights|reference))-(?:[0-9]|1[01])$/.test(
      key
    ) || /^da-board-(?:[0-9]|1[01])-[0-3]$/.test(key);
  if (!textKeys.has(key) && !boolKeys.has(key) && !taskField && !chapterField)
    return 'Unknown proposal field.';
  if (!canProposalEdit(role, key, s)) return 'This field is reserved for its responsible role.';
  const boolean = boolKeys.has(key) || key.startsWith('da-required-');
  if (boolean ? typeof value !== 'boolean' : typeof value !== 'string' || value.length > 2400)
    return 'Invalid field value (maximum 2400 characters).';
  if (
    key.startsWith('da-owner-') &&
    value &&
    !members.some((m) => m.id === value && [pole!.id, 'art', 'bee'].includes(roleKey(m.role)))
  )
    return 'Choose a project member in this pole.';
  if (
    key.startsWith('da-head-') &&
    ![...M.poles.map((p) => p.id), 'art', 'bee'].includes(String(value))
  )
    return 'Choose a responsible head role.';
  if (
    /^da-(due-|rights-(start|end))/.test(key) &&
    value &&
    !/^\d{4}-\d{2}-\d{2}$/.test(String(value))
  )
    return 'Choose a valid date.';
  if (
    key.startsWith('da-chapter-') &&
    value !== 'All chapters' &&
    !/^chapter:(?:[0-9]|1[01])$/.test(String(value))
  )
    return 'Choose a chapter.';
  return null;
}
export type ProposalOperation = {
  action: string;
  fields?: Record<string, unknown>;
  pole?: string;
  key?: string;
  asset?: string;
  chapter?: number;
};
export function mutateProposal(
  s: ProposalState,
  op: ProposalOperation,
  role: string,
  members: Member[],
  userId: string
): string | null {
  if (op.action === 'edit') {
    if (!op.fields || Array.isArray(op.fields) || Object.keys(op.fields).length > 80)
      return 'Invalid edits.';
    for (const [key, value] of Object.entries(op.fields)) {
      const error = fieldError(key, value, s, role, members);
      if (error) return error;
    }
    for (const [key, value] of Object.entries(op.fields)) {
      // A decision note must not cancel the approval that a brand is responding to.
      if (key === 'da-review-note' || key.startsWith('da-feedback-')) s[key] = value;
      else M.edit(s, key, value);
      if (key.startsWith('sound-')) M.sourceChanged(s, key);
    }
    return null;
  }
  if (/^task-(submit|approve|return)$/.test(op.action)) {
    if (!M.poles.some((p) => p.id === op.pole)) return 'Unknown pole.';
    const task = M.task(s, op.pole!);
    if (!M.lead(role) && op.action === 'task-submit' && task.owner !== userId)
      return 'Only the assigned contributor can submit this task.';
    if (op.action === 'task-submit' && !members.some((m) => m.id === task.owner))
      return 'Assign a project member first.';
    return M.transition(s, op.pole!, op.action.slice(5), role);
  }
  if (/^proposal-(submit|bee|brand|return)$/.test(op.action)) {
    const error = M.decide(s, op.action.slice(9), role);
    if (!error && op.action === 'proposal-submit') delete s['da-source-notice'];
    return error;
  }
  if (!M.lead(role)) return 'The creative lead manages the proposal structure.';
  if (op.action === 'image' || op.action === 'reset-image') {
    if (!visualKey.test(op.key || '') || !visualAssets.includes(op.asset || ''))
      return 'Choose a journey visual.';
    delete s['da-upload-' + op.key];
    M.edit(s, 'da-visual-' + op.key, op.asset);
    M.invalidate(s);
    return null;
  }
  const extras = (s['da-extra-chapters'] || []) as string[][];
  const count = 3 + extras.length;
  if (op.action === 'add-chapter') {
    if (count >= 12) return 'A proposal supports up to twelve chapters.';
    s['da-extra-chapters'] = [...extras, ['New chapter', 'Location to confirm', 'm:landscape']];
    M.invalidate(s);
    return null;
  }
  if (op.action === 'move-up' || op.action === 'move-down') {
    if (!Number.isInteger(op.chapter) || op.chapter! < 0 || op.chapter! >= count)
      return 'Unknown chapter.';
    const all = Array.from({ length: count }, (_, i) => i);
    const order = [
      ...new Set([
        ...((s['da-chapter-order'] as number[]) || []).filter((i) => all.includes(i)),
        ...all,
      ]),
    ];
    const i = order.indexOf(op.chapter!),
      j = i + (op.action === 'move-up' ? -1 : 1);
    if (j >= 0 && j < count) {
      [order[i], order[j]] = [order[j], order[i]];
      s['da-chapter-order'] = order;
      M.invalidate(s);
    }
    return null;
  }
  return 'Unknown proposal operation.';
}
