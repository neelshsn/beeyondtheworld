/* Proposal workflow for the review sandbox. No real assignments or approvals are sent. */
(function (root, factory) {
  const model = factory();
  if (typeof module === 'object' && module.exports) module.exports = model;
  else root.BeeTaleModel = model;
})(typeof window === 'undefined' ? this : window, function () {
  const poles = [
    [
      'photo',
      'Photography',
      'camera',
      'm:frame-fashion-wide',
      'Frame, light and image language',
      'tale-chapters',
    ],
    ['film', 'Film', 'film', 'on-set', 'Sequence, movement and delivery formats', 'tale-chapters'],
    [
      'stylist',
      'Styling',
      'hanger',
      'fitting',
      'Looks, local designers and continuity',
      'designer-network',
    ],
    [
      'beauty',
      'Beauty',
      'beauty',
      'beauty-prep',
      'Skin, hair, textures and product origins',
      'beauty-library',
    ],
    ['set', 'Set design', 'box', 'm:craft', 'Local craft, materials and second life', 'set-studio'],
    [
      'sound',
      'Sound',
      'sound',
      'm:landscape',
      'Chapter cue, local recordings and rights',
      'sound-library',
    ],
    [
      'agency',
      'Casting',
      'people',
      'm:talent',
      'Talent, availability, consent and looks',
      'casting-agencies',
    ],
    [
      'production',
      'Bloom / production',
      'pin',
      'm:frame-arch',
      'Scouting, access, feasibility and timing',
      'co-creation',
    ],
    [
      'editor',
      'Post-production',
      'film',
      'film-detail',
      'Masters, versions, delivery and credits',
      'post-chapters',
    ],
  ].map(([id, name, icon, asset, brief, page]) => ({ id, name, icon, asset, brief, page }));
  const defaults = {
    'tale-brand': 'Craie Studio / exercise',
    'tale-title': 'Carry the light',
    'tale-intention': 'A tactile journey between light, gesture and material in Morocco.',
    'tale-keywords': 'Natural light, texture, movement, quiet strength',
    'tale-destination': 'Morocco',
    'da-season': 'November 2026 / exercise',
    'vision-brand': 'Craftsmanship, durable objects and freedom of movement.',
    'vision-bee': 'Local collaboration, conscious production and traceable creative value.',
    'vision-social': 'Credit and fairly compensate contributors.',
    'vision-environment': 'Reuse materials and document resource choices.',
    'vision-economy': 'Plan local sourcing and track value retained locally.',
    'tale-feasibility':
      'Confirm site access, daylight, products, crew and sound recording permissions.',
    'tale-claim':
      'Proposed production framework. Results and certifications remain subject to evidence.',
    'tale-photo': true,
    'tale-sound': true,
    'tale-bts': true,
  };
  const val = (s, key, fallback = '') => s[key] ?? defaults[key] ?? fallback;
  const lead = (role) => ['bee', 'art'].includes(role);
  const task = (s, id) => {
    const p = poles.find((x) => x.id === id);
    return {
      owner: val(s, 'da-owner-' + id, ''),
      head: val(s, 'da-head-' + id, id),
      brief: val(s, 'da-brief-' + id, p?.brief || ''),
      chapter: val(s, 'da-chapter-' + id, 'All chapters'),
      due: val(s, 'da-due-' + id),
      content: val(s, 'da-content-' + id),
      evidence: val(s, 'da-evidence-' + id),
      feedback: val(s, 'da-feedback-' + id),
      status: val(s, 'da-status-' + id, 'Draft'),
      required: val(s, 'da-required-' + id, id !== 'sound' || val(s, 'tale-sound')),
    };
  };
  function invalidate(s) {
    const reviewed = s['da-proposal-submitted'] || s['da-bee-approved'] || s['da-brand-approved'];
    s['da-bee-approved'] = false;
    s['da-brand-approved'] = false;
    s['da-proposal-submitted'] = false;
    s['da-revision'] = Number(val(s, 'da-revision', 1)) + (reviewed ? 1 : 0);
    if (['bee-approved', 'brand-approved'].includes(s['lock-state'])) {
      s['lock-state'] = 'draft';
      s['lock-status'] = 'Proposal changed. Bee and brand review must be renewed.';
    }
  }
  function edit(s, key, value) {
    if (val(s, key) === value) return;
    s[key] = value;
    const pole = poles.find((p) =>
      new RegExp('^da-(owner|head|brief|chapter|due|content|evidence|required)-' + p.id + '$').test(
        key
      )
    );
    if (pole) s['da-status-' + pole.id] = 'Draft';
    invalidate(s);
  }
  function sourceChanged(s, key) {
    const mapping = {
      beauty: 'beauty',
      designer: 'stylist',
      set: 'set',
      sound: 'sound',
      scout: 'production',
      post: 'editor',
    };
    let id = mapping[key.split('-')[0]];
    if (/^em-(composition|cue)-/.test(key)) id = 'sound';
    if (/^em-talent-/.test(key)) id = 'agency';
    if (id) s['da-status-' + id] = 'Draft';
    invalidate(s);
  }
  function transition(s, id, action, role) {
    const t = task(s, id);
    if (!poles.some((p) => p.id === id)) return 'Unknown pole.';
    if (action === 'submit') {
      if (!(lead(role) || role === id))
        return 'Only the contributor or creative lead can submit this contribution.';
      if (!t.owner.trim() || !t.content.trim() || !t.evidence.trim())
        return 'Add an assignee, contribution and reference before submitting.';
      if (!['Draft', 'Changes requested'].includes(t.status))
        return 'This contribution is already in review.';
      invalidate(s);
      s['da-status-' + id] = 'Head review';
    } else {
      if (!(lead(role) || role === t.head)) return 'The assigned head reviews this contribution.';
      if (t.status !== 'Head review') return 'The contribution must be submitted first.';
      if (action === 'return' && !t.feedback.trim()) return 'Add a precise revision request first.';
      invalidate(s);
      s['da-status-' + id] = action === 'approve' ? 'Approved for proposal' : 'Changes requested';
    }
    return null;
  }
  function blockers(s) {
    const out = [];
    for (const [key, name] of [
      ['tale-brand', 'Brand'],
      ['tale-title', 'Title'],
      ['tale-intention', 'Creative intention'],
    ])
      if (!String(val(s, key)).trim()) out.push(name + ' is missing');
    for (const p of poles)
      if (task(s, p.id).required && task(s, p.id).status !== 'Approved for proposal')
        out.push(p.name + ' awaits head review');
    if (!val(s, 'tale-scout', false)) out.push('Scouting feasibility awaits review');
    if (!val(s, 'tale-cost', false)) out.push('Budget awaits Bee review');
    return out;
  }
  function decide(s, action, role) {
    if (action === 'submit') {
      if (!lead(role)) return 'The creative lead submits the assembled proposal.';
      const b = blockers(s);
      if (b.length) return b[0];
      s['da-proposal-submitted'] = true;
    } else if (action === 'bee') {
      if (role !== 'bee' || !s['da-proposal-submitted'] || blockers(s).length)
        return 'Bee reviews a complete submitted revision first.';
      s['da-bee-approved'] = true;
      s['da-brand-approved'] = false;
    } else if (action === 'brand') {
      if (role !== 'brand' || !s['da-bee-approved'] || blockers(s).length)
        return 'Brand review follows Bee approval of this revision.';
      s['da-brand-approved'] = true;
    } else if (action === 'return') {
      if (!['bee', 'brand'].includes(role) || (role === 'brand' && !s['da-bee-approved']))
        return 'This role cannot return this revision yet.';
      if (!String(val(s, 'da-review-note')).trim()) return 'Add the requested changes first.';
      invalidate(s);
    }
    return null;
  }
  return {
    poles,
    defaults,
    val,
    lead,
    task,
    edit,
    invalidate,
    sourceChanged,
    transition,
    blockers,
    decide,
  };
});
