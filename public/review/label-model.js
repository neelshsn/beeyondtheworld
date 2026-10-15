/* Shared, explicit scenario inputs. Values are illustrative; evidence never implies certification. */
(function (root) {
  const metric = (id, label, pole, pillar, owner, page, n, d, unit, proof, group) => ({
    id,
    label,
    pole,
    pillar,
    owner,
    page,
    n,
    d,
    unit,
    proof,
    group,
  });
  const metrics = [
    metric(
      'local-talent',
      'Local talent',
      'creative',
      'social',
      'agency',
      'casting-agencies',
      3,
      4,
      'people',
      'Talent roster, declared residence and engagement',
      'Casting'
    ),
    metric(
      'wild-casting',
      'Wild casting',
      'creative',
      'social',
      'agency',
      'casting-agencies',
      1,
      4,
      'people',
      'Opt-in casting record and source channel',
      'Casting'
    ),
    metric(
      'talent-consent',
      'Consent collected',
      'creative',
      'social',
      'agency',
      'casting-talent',
      0,
      4,
      'releases',
      'Dated consent, usage scope, adult status and restrictions',
      'Casting'
    ),
    metric(
      'talent-contracts',
      'Contracts documented',
      'creative',
      'social',
      'agency',
      'casting-talent',
      0,
      4,
      'contracts',
      'Signed talent / agency terms and payment schedule',
      'Casting'
    ),
    metric(
      'emerging',
      'Emerging talents supported',
      'creative',
      'social',
      'agency',
      'casting-agencies',
      2,
      null,
      'people',
      'Opt-in mentoring / development record',
      'Casting'
    ),
    metric(
      'inclusion',
      'Inclusive casting process',
      'creative',
      'social',
      'agency',
      'casting-agencies',
      0,
      4,
      'checks',
      'Accessible call, fair criteria, cultural consent and wellbeing',
      'Casting'
    ),
    metric(
      'designers',
      'Local designers',
      'creative',
      'economic',
      'stylist',
      'designer-network',
      2,
      3,
      'designers',
      'Designer directory, country, credit and loan agreement',
      'Styling'
    ),
    metric(
      'designer-credit',
      'Designer credits',
      'creative',
      'social',
      'stylist',
      'designer-network',
      0,
      3,
      'credits',
      'Approved credits and rights agreement',
      'Styling'
    ),
    metric(
      'natural-beauty',
      'Documented natural products',
      'creative',
      'environment',
      'beauty',
      'beauty-origin',
      0,
      5,
      'products',
      'Composition, batch, supplier and applicable certificate',
      'Beauty'
    ),
    metric(
      'local-beauty',
      'Local beauty sourcing',
      'creative',
      'economic',
      'beauty',
      'beauty-origin',
      3,
      5,
      'products',
      'Country of production and supplier records',
      'Beauty'
    ),
    metric(
      'visual-original',
      'Original capture records',
      'creative',
      'social',
      'photo',
      'visual-upcycling',
      0,
      15,
      'assets',
      'Original file, metadata, author and rights',
      'Visual sources'
    ),
    metric(
      'source-rights',
      'Source rights & credits',
      'creative',
      'social',
      'art',
      'visual-upcycling',
      0,
      15,
      'assets',
      'Licence, permission, release and creator attribution',
      'Visual sources'
    ),
    metric(
      'upcycled-references',
      'Reused references',
      'creative',
      'environment',
      'art',
      'visual-upcycling',
      6,
      15,
      'assets',
      'Parent reference and derivative chain',
      'Visual sources'
    ),
    metric(
      'local-artists',
      'Local artists engaged',
      'creative',
      'economic',
      'set',
      'set-studio',
      3,
      null,
      'people',
      'Maker agreement, territory, fee and delivery',
      'Set design'
    ),
    metric(
      'reused-set',
      'Reusable / reclaimed materials',
      'creative',
      'environment',
      'set',
      'set-detail',
      12,
      18,
      'kg',
      'Material weights, purchase/loan source and return destination',
      'Set design'
    ),
    metric(
      'local-musicians',
      'Local musicians',
      'creative',
      'economic',
      'sound',
      'sound-library',
      2,
      3,
      'people',
      'Composer / performer agreement and territory',
      'Sound'
    ),
    metric(
      'sound-original',
      'Original sound records',
      'creative',
      'social',
      'sound',
      'sound-library',
      0,
      3,
      'recordings',
      'Raw audio, recordist, location, date and consent',
      'Sound'
    ),
    metric(
      'sound-rights',
      'Sound rights cleared',
      'creative',
      'social',
      'sound',
      'sound-library',
      0,
      3,
      'cues',
      'Master + composition + performance rights',
      'Sound'
    ),
    metric(
      'local-crew',
      'Local crew',
      'bloom',
      'social',
      'production',
      'bloom-operations',
      10,
      12,
      'people',
      'Unique crew IDs, residence declarations and engagement',
      'Crew'
    ),
    metric(
      'local-jobs',
      'Local engagements supported',
      'bloom',
      'economic',
      'production',
      'bloom-operations',
      10,
      null,
      'people',
      'Unique paid engagements, distinguished from new jobs created',
      'Crew'
    ),
    metric(
      'fair-work',
      'Fair work checks',
      'bloom',
      'social',
      'production',
      'bloom-operations',
      0,
      12,
      'people',
      'Agreements, hours, pay, rest and safety briefing',
      'Crew'
    ),
    metric(
      'reports',
      'Daily reports received',
      'bloom',
      'social',
      'production',
      'bloom-operations',
      0,
      3,
      'reports',
      'Dated and signed line production reports',
      'Crew'
    ),
    metric(
      'guides',
      'Local guides',
      'bloom',
      'economic',
      'production',
      'bloom-operations',
      2,
      2,
      'people',
      'Guide directory, permits and territory permissions',
      'Locations'
    ),
    metric(
      'local-suppliers',
      'Local suppliers',
      'bloom',
      'economic',
      'production',
      'bloom-operations',
      5,
      6,
      'vendors',
      'Unique supplier IDs, local ownership and invoices',
      'Suppliers'
    ),
    metric(
      'long-partners',
      'Long-term partnerships',
      'bloom',
      'economic',
      'bee',
      'bloom-operations',
      2,
      null,
      'partners',
      'Agreement term and repeat collaboration record',
      'Suppliers'
    ),
    metric(
      'shared-vehicles',
      'Shared vehicles',
      'bloom',
      'environment',
      'production',
      'bloom-operations',
      2,
      3,
      'vehicles',
      'Routes, vehicle IDs, occupancy and project allocation',
      'Transport'
    ),
    metric(
      'travel-avoided',
      'Travel distance avoided',
      'bloom',
      'environment',
      'production',
      'bloom-operations',
      400,
      1200,
      'km',
      'Comparable baseline distance minus planned journey distance',
      'Transport'
    ),
    metric(
      'local-stays',
      'Locally owned accommodation',
      'bloom',
      'social',
      'production',
      'bloom-operations',
      24,
      24,
      'room-nights',
      'Accommodation register, ownership and paid nights',
      'Accommodation'
    ),
    metric(
      'local-meals',
      'Locally sourced meals',
      'bloom',
      'social',
      'production',
      'bloom-operations',
      32,
      36,
      'meals',
      'Menu, supplier invoices and origin',
      'Catering'
    ),
    metric(
      'plant-meals',
      'Plant-based meals',
      'bloom',
      'environment',
      'production',
      'bloom-operations',
      24,
      36,
      'meals',
      'Separate meal count and menu; not inferred from local sourcing',
      'Catering'
    ),
    metric(
      'local-equipment',
      'Equipment rented locally',
      'bloom',
      'environment',
      'production',
      'bloom-operations',
      6,
      8,
      'items',
      'Rental register, location and equipment IDs',
      'Equipment'
    ),
    metric(
      'shared-equipment',
      'Shared equipment days',
      'bloom',
      'environment',
      'production',
      'bloom-operations',
      4,
      8,
      'item-days',
      'Rental dates and shared project allocations',
      'Equipment'
    ),
    metric(
      'energy',
      'Energy consumption',
      'bloom',
      'environment',
      'production',
      'bloom-operations',
      null,
      null,
      'kWh',
      'Meter readings, fuel conversion and factor source',
      'Energy'
    ),
    metric(
      'water',
      'Water consumption',
      'bloom',
      'environment',
      'production',
      'bloom-operations',
      null,
      null,
      'litres',
      'Meter / supplier records and reporting boundary',
      'Energy'
    ),
    metric(
      'waste-traced',
      'Waste with known destination',
      'bloom',
      'environment',
      'production',
      'bloom-operations',
      0,
      18,
      'kg',
      'Weighed materials, collection and destination receipts',
      'Waste'
    ),
    metric(
      'single-plastic',
      'Single-use plastic items',
      'bloom',
      'environment',
      'production',
      'bloom-operations',
      null,
      null,
      'items',
      'Complete procurement and waste inventory',
      'Waste'
    ),
    metric(
      'immersive',
      'Local cultural sessions',
      'bloom',
      'social',
      'production',
      'bloom-operations',
      1,
      null,
      'sessions',
      'Host consent, cultural permission, compensation and attendance',
      'Experience'
    ),
  ];
  const num = (v) =>
    v === '' || v === null || v === undefined || !Number.isFinite(Number(v)) || Number(v) < 0
      ? null
      : Number(v);
  function measure(m, state = {}) {
    const read = (k, f) => (Object.prototype.hasOwnProperty.call(state, k) ? state[k] : f);
    const n = num(read('em-' + m.id + '-n', m.n)),
      d = m.d === null ? null : num(read('em-' + m.id + '-d', m.d));
    const valid = n !== null && (m.d === null || (d > 0 && n <= d));
    return {
      n,
      d,
      valid,
      value: valid ? (m.d === null ? n : n / d) : null,
      kind: m.d === null ? 'count' : 'ratio',
    };
  }
  function evidence(m, state = {}) {
    const ref = String(state['em-' + m.id + '-ref'] || '').trim();
    const reviewed = state['em-' + m.id + '-review'] === 'Reviewed in exercise';
    const valid = measure(m, state).valid;
    const decision = state['em-' + m.id + '-decision'] === 'Accepted in exercise';
    const independent = state['em-' + m.id + '-independent'] === true;
    const risk =
      state['em-' + m.id + '-risk'] ||
      (['environment', 'social'].includes(m.pillar) ? 'Elevated' : 'Standard');
    return {
      reference: ref,
      complete: valid && !!ref,
      reviewed: valid && !!ref && reviewed,
      accepted: valid && !!ref && reviewed && decision && (risk !== 'Elevated' || independent),
      risk,
      independent,
    };
  }
  function summary(state = {}, pole) {
    const list = metrics.filter((m) => !pole || m.pole === pole);
    return {
      total: list.length,
      measured: list.filter((m) => measure(m, state).valid).length,
      documented: list.filter((m) => evidence(m, state).complete).length,
      reviewed: list.filter((m) => evidence(m, state).reviewed).length,
      accepted: list.filter((m) => evidence(m, state).accepted).length,
      score: null,
      certified: false,
    };
  }
  const api = { metrics, num, measure, evidence, summary };
  if (typeof module !== 'undefined') module.exports = api;
  else root.BeeLabelModel = api;
})(typeof window === 'undefined' ? {} : window);
