import type { CommunityRecord, Workspace } from './types';
import { factors } from './metrics';
import { horizonTransitionError } from './horizon';
import { studioTransitionError } from './studio';
export function transitionError(r: CommunityRecord, to: string, w: Workspace): string | null {
  if (r.kind.startsWith('studio:')) return studioTransitionError(r, to, w);
  if (r.kind.startsWith('horizon:')) return horizonTransitionError(r, to, w);
  const trusted = (organization: unknown) =>
    w.records.some(
      (x) =>
        x.organization === organization &&
        ((x.kind === 'trust' && x.status === 'verified') ||
          (x.kind === 'horizon:trust-verified' && x.status === 'approved'))
    );
  const find = (key: string) => w.records.find((x) => x.id === r.data[key]);
  if (r.kind === 'expense' && ['submitted', 'approved'].includes(to)) {
    const allocation = find('allocationId');
    const action = find('actionId');
    const bloom = w.records.find((x) => x.id === action?.data.bloomId);
    if (
      !allocation ||
      allocation.data.layer !== 'Impact' ||
      allocation.data.partner !== r.organization
    )
      return 'The expense must use the Impact Capital allocated to this partner.';
    if (bloom?.data.allocationId !== allocation.id)
      return 'The action and expense must use the same Bloom allocation.';
    if (to === 'approved') {
      if (allocation.status !== 'released')
        return 'Record the capital release before approving expenses.';
      const used = w.records
        .filter(
          (x) =>
            x.id !== r.id &&
            x.kind === 'expense' &&
            x.data.allocationId === allocation.id &&
            ['approved', 'paid', 'evidenced'].includes(x.status)
        )
        .reduce((n, x) => n + Number(x.data.amount || 0), 0);
      if (used + Number(r.data.amount) > Number(allocation.data.amount))
        return 'This expense exceeds the remaining allocation.';
    }
  }
  if (r.kind === 'booking' && to === 'submitted') {
    if (r.data.charter !== 'Yes' || !r.data.agreement)
      return 'Review the quality charter and add an agreement reference first.';
    if (find('locationId')?.status !== 'approved')
      return 'The linked scouting location must be approved.';
    if (
      r.data.factorKey !== 'not_estimated' &&
      factors[String(r.data.factorKey)]?.category !== r.data.category
    )
      return 'The planning factor must match the booking category.';
    if (r.data.factorKey !== 'not_estimated' && Number(r.data.quantity) <= 0)
      return 'Add the activity quantity for this planning estimate.';
  }
  if (
    ['expense', 'evidence', 'asset'].includes(r.kind) &&
    ['submitted', 'internal_review', 'evidenced'].includes(to) &&
    !r.data.reference &&
    !r.files?.length
  )
    return 'Attach a source file or a shared HTTPS source link first.';
  if (
    r.kind === 'result' &&
    ['submitted', 'validated'].includes(to) &&
    (r.data.actual === undefined || r.data.actual === '')
  )
    return 'Record the observed value before submitting this result.';
  if (r.kind === 'result' && to === 'validated') {
    const evidence = find('evidenceId');
    if (!evidence || !['bee_reviewed', 'expert_validated'].includes(evidence.status))
      return 'The linked evidence needs Bee review first.';
    if (evidence.data.actionId !== r.data.actionId)
      return 'The result and its evidence must refer to the same action.';
    if (
      (r.data.expertRequired === 'Yes' ||
        r.data.risk === 'High' ||
        r.data.indicatorType === 'Public claim' ||
        (r.data.risk === 'Medium' && r.data.indicatorType === 'Estimate')) &&
      evidence.status !== 'expert_validated'
    )
      return 'Expert validation is required for this indicator.';
  }
  if (
    r.kind === 'action' &&
    to === 'validated' &&
    !w.records.some(
      (e) =>
        e.kind === 'evidence' &&
        e.data.actionId === r.id &&
        ['bee_reviewed', 'expert_validated'].includes(e.status)
    )
  )
    return 'Review at least one linked evidence record first.';
  if (r.kind === 'production' && to === 'ready') {
    if (!w.records.some((x) => x.kind === 'concept' && x.status === 'locked'))
      return 'Lock the approved creative direction first.';
    if (!w.records.some((x) => x.kind === 'location' && x.status === 'approved'))
      return 'Approve at least one scouting location first.';
    if (w.records.some((x) => x.kind === 'booking' && x.status !== 'approved'))
      return 'All production bookings must be approved first.';
  }
  if (
    r.kind === 'production' &&
    to === 'delivered' &&
    !w.records.some((x) => x.kind === 'asset' && x.status === 'delivered')
  )
    return 'Deliver the approved creative assets first.';
  if (r.kind === 'bloom' && to === 'approved' && !trusted(r.organization))
    return 'The local partner trust journey must be reviewed first.';
  if (
    r.kind === 'allocation' &&
    to === 'released' &&
    r.data.layer === 'Impact' &&
    !trusted(r.data.partner)
  )
    return 'Verify the recipient partner first. This records an allocation; it does not move money.';
  return null;
}
