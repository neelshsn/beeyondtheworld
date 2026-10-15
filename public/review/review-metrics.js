/* Deterministic calculations for the clearly labelled review scenario. */
(function (root) {
  const number = (v) =>
    v !== null && v !== undefined && v !== '' && Number.isFinite(Number(v)) ? Number(v) : null;
  const ratio = (n, d) => (number(n) !== null && number(d) > 0 ? Number(n) / Number(d) : null);
  const sum = (rows) => rows.reduce((total, row) => total + Number(row.amount || 0), 0);
  function ledger(rows) {
    const ids = new Set();
    for (const row of rows) {
      if (ids.has(row.id)) throw Error('Duplicate allocation: ' + row.id);
      ids.add(row.id);
      if (number(row.amount) === null || row.amount < 0) throw Error('Invalid allocation');
    }
    const production = rows.filter((r) => r.bucket === 'production'),
      local = production.filter((r) => r.local === true);
    return {
      total: sum(rows),
      production: sum(production),
      local: sum(local),
      localShare: ratio(sum(local), sum(production)),
      impact: sum(rows.filter((r) => r.bucket === 'impact')),
      creative: sum(rows.filter((r) => r.bucket === 'creative')),
      operations: sum(rows.filter((r) => r.bucket === 'operations')),
    };
  }
  function carbon(actual, baseline, coverage) {
    return number(actual) !== null && number(baseline) > 0 && number(coverage) === 1
      ? (Number(baseline) - Number(actual)) / Number(baseline)
      : null;
  }
  function attribution(outcome, contributions) {
    if (number(outcome) === null || contributions.some((c) => number(c) === null || c < 0))
      return null;
    const total = contributions.reduce((a, b) => a + Number(b), 0);
    return total > 0 ? contributions.map((c) => (Number(outcome) * Number(c)) / total) : null;
  }
  function authenticator({ origin, original, rights, consent, reviewer, certificate }) {
    const checks = [original, rights, consent, reviewer, certificate];
    return origin === 'ai'
      ? { status: 'AI concept · not organic evidence', eligible: false }
      : origin === 'unknown'
        ? { status: 'Origin unresolved', eligible: false }
        : checks.every(Boolean)
          ? { status: 'Evidence complete · final decision required', eligible: true }
          : { status: 'Evidence incomplete · cannot certify', eligible: false };
  }
  const api = { number, ratio, ledger, carbon, attribution, authenticator };
  if (typeof module !== 'undefined') module.exports = api;
  else root.BeeReviewMath = api;
})(typeof window === 'undefined' ? {} : window);
