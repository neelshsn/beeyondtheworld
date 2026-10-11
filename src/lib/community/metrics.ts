import type { CommunityRecord } from './types';
export const factors: Record<
  string,
  { label: string; category: string; value: number; unit: string; source: string }
> = {
  shared_van: {
    label: 'Shared van / car',
    category: 'Transport',
    value: 0.09,
    unit: 'passenger-km',
    source: 'Factor_Library!D10',
  },
  rail: {
    label: 'Rail',
    category: 'Transport',
    value: 0.035,
    unit: 'passenger-km',
    source: 'Factor_Library!D6',
  },
  homestay: {
    label: 'Homestay / local guesthouse',
    category: 'Accommodation',
    value: 3,
    unit: 'person-night',
    source: 'Factor_Library!D18',
  },
  ecolodge: {
    label: 'Eco-lodge',
    category: 'Accommodation',
    value: 5,
    unit: 'person-night',
    source: 'Factor_Library!D20',
  },
  plant_meal: {
    label: 'Plant-based farm-to-table',
    category: 'Catering',
    value: 0.8,
    unit: 'meal',
    source: 'Factor_Library!D27',
  },
  local_meal: {
    label: 'Local mixed meal · fish / poultry',
    category: 'Catering',
    value: 2,
    unit: 'meal',
    source: 'Factor_Library!D29',
  },
  local_equipment: {
    label: 'Local equipment rental',
    category: 'Production',
    value: 1.5,
    unit: 'equipment-day',
    source: 'Factor_Library!D33',
  },
};
export function calculateMetrics(records: CommunityRecord[]) {
  const expenses = records.filter(
    (r) => r.kind === 'expense' && ['approved', 'paid', 'evidenced'].includes(r.status)
  );
  const spent = expenses.reduce((s, r) => s + Number(r.data.amount || 0), 0);
  const evidenced = expenses
    .filter((r) => r.status === 'evidenced' && (r.files?.length || r.data.reference))
    .reduce((s, r) => s + Number(r.data.amount || 0), 0);
  const bookings = records.filter((r) => r.kind === 'booking' && r.status === 'approved');
  const estimated = bookings.filter(
    (r) => factors[String(r.data.factorKey)] && Number(r.data.quantity) > 0
  );
  const footprint = estimated.reduce(
    (s, r) => s + Number(r.data.quantity || 0) * (factors[String(r.data.factorKey)]?.value || 0),
    0
  );
  return {
    spent,
    evidenced,
    coverage: spent ? evidenced / spent : null,
    footprint,
    bookings: bookings.length,
    estimatedBookings: estimated.length,
    unestimatedBookings: bookings.length - estimated.length,
    validated: records.filter((r) => r.kind === 'result' && r.status === 'validated'),
    localSpend: expenses
      .filter((r) => r.data.local === 'Yes')
      .reduce((s, r) => s + Number(r.data.amount || 0), 0),
  };
}
