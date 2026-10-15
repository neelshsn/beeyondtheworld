/* October email: connected visual review, using the same local scenario and shared feedback. */
window.BeeEmailRevision = function (H) {
  const {
    esc,
    icon,
    shot,
    field,
    check,
    badge,
    button,
    link,
    card,
    stat,
    connections,
    subs,
    value,
    money,
    percent,
    chapter,
    chapterStrip,
  } = H;
  const M = window.BeeLabelModel,
    metrics = M.metrics;
  const state = () => H.state(),
    current = () => H.current();
  const source = {
    'creative-metrics': '1Ow_kCrwsDx11zA-DftBrpK_KueX1j0JH',
    'bloom-metrics': '1dGuniNE77UpK2FT-W98-HNMJt8MglBV3',
    'bee-certified': '1FPWE5Q1ym6EUV0g0giAP5tMKIdTh1Tgv',
    'label-social': '1OmlpvuiZnl879Od3Ea7EdgBp5YKYYaZQ',
    'label-environment': '11Di4hHymmGg95iD3yVLeRtlSg1_n-SB8',
    'label-economic': '14xfHf2m_acmtoqUbBDmqk5s_CMUwTPFE',
    'casting-agencies': '1kFwSFiaeoeVg_Hvvfa27yu6cU0Ek3DMJ',
    'casting-talent': '1kFwSFiaeoeVg_Hvvfa27yu6cU0Ek3DMJ',
    'visual-upcycling': '1iyohQvW2nRHW_dgUd15J51e-GcBcJT_7',
    'evidence-register': '1yGEf1WULB8dp_kk-62y5jp2VswdCrwqv',
    'bloom-operations': '16JgKrnlOXPYMxdH-yvrk8IS25-P2kled',
    'honey-library': '1yGEf1WULB8dp_kk-62y5jp2VswdCrwqv',
    'label-method': '1yGEf1WULB8dp_kk-62y5jp2VswdCrwqv',
    'sound-library': '11-XGmGV_UgGZxwjr7m4AGlWabmMSPd0b',
  };
  const nav = [
    ['creative-metrics', 'Creative Hive', 'camera'],
    ['bloom-metrics', 'Bloom Hive', 'pin'],
    ['casting-agencies', 'Casting & talent', 'people'],
    ['visual-upcycling', 'Visual upcycling', 'image'],
    ['sound-library', 'Sound library', 'sound'],
    ['bee-certified', 'Bee Certified', 'bee'],
    ['evidence-register', 'Evidence', 'doc'],
    ['tale-brief', 'Tales proposal', 'film'],
  ];
  const shell = (body) =>
    `<div class="em-layout"><nav class="em-sidebar" aria-label="Connected workspace">${nav.map(([id, t, ic]) => `<div class="${current().id === id ? 'active' : ''}">${link(id, t, ic)}</div>`).join('')}<div class="em-side-foot">MOROCCO<br>Carry the light<br><small>Illustrative production</small></div></nav><div class="em-main">${body}<details class="em-reference"><summary>Original Drive reference / compare the composition</summary><img loading="lazy" src="/review/email-oct15/references/${source[current().id]}.webp" alt="Original reference supplied by Eugénie; its numbers are design examples"><p>Reference composition. Example numbers and badges in this image are not verified campaign results.</p><a href="https://drive.google.com/file/d/${source[current().id]}/view" target="_blank" rel="noopener noreferrer">Open source in Drive</a></details></div></div>`;
  const hero = (title, copy, asset = 'on-set') =>
    `<div class="em-hero">${shot(asset, title)}<div><div class="kicker">MOROCCO · CARRY THE LIGHT</div><h2>${title}</h2><p>${copy}</p></div></div>`;
  const fmt = (m) => {
    const r = M.measure(m, state());
    return r.value === null
      ? '—'
      : r.kind === 'ratio'
        ? percent(r.value)
        : new Intl.NumberFormat('en-GB', { maximumFractionDigits: 1 }).format(r.value);
  };
  const get = (id) => metrics.find((m) => m.id === id);
  const metricLink = (id, label) =>
    `<button class="vbutton" data-em-metric="${id}">${icon('chart')}${esc(label || get(id).label)}</button>`;
  const metricCard = (id) => {
    const m = get(id),
      r = M.measure(m, state());
    return `<button class="em-stat" data-em-metric="${id}">${icon(m.pillar === 'environment' ? 'leaf' : m.pillar === 'social' ? 'people' : 'chart')}<strong>${fmt(m)}</strong><span>${m.label}</span><small>${r.kind === 'ratio' ? `${r.n ?? '—'} / ${r.d ?? '—'} ${m.unit}` : m.unit} · scenario</small></button>`;
  };
  const ring = (n, total, label) =>
    `<div class="em-ring" style="--progress:${total ? (n / total) * 100 : 0}%"><div>${icon('bee')}<strong>${n}/${total}</strong><small>${label}</small></div></div>`;
  const rows = (list) =>
    `<div class="em-metric-rows">${list
      .map((m) => {
        const r = M.measure(m, state()),
          e = M.evidence(m, state());
        return `<button data-em-metric="${m.id}"><span>${icon(m.pillar === 'environment' ? 'leaf' : 'people')}${m.label}<small>${H.roles[m.owner] || m.owner} · ${m.unit}</small></span><span class="em-bar"><i style="width:${r.kind === 'ratio' && r.value !== null ? r.value * 100 : 0}%"></i></span><strong>${fmt(m)}</strong><small>${e.accepted ? 'Reviewed in exercise' : e.reference ? 'Evidence draft' : 'Evidence pending'}</small></button>`;
      })
      .join('')}</div>`;
  function graph(pole) {
    const history = value('em-history-' + pole, []),
      s = M.summary(state(), pole);
    const points = [
      ...history.slice(-5).map((x) => ({ n: x.documented, label: x.label })),
      { n: s.documented, label: 'Current' },
    ];
    const xy = points
      .map(
        (p, i) =>
          `${35 + i * (310 / Math.max(1, points.length - 1))},${155 - (p.n / s.total) * 120}`
      )
      .join(' ');
    return `<div class="panel"><div class="kicker">DOCUMENTATION OVER TIME</div><svg viewBox="0 0 380 200" class="em-chart" role="img" aria-label="${points.length} local documentation snapshots"><path d="M35 20V155H350M35 95H350M35 35H350" fill="none" stroke="#ffffff25"/><polyline points="${xy}" fill="none" stroke="#dfbc7e" stroke-width="2"/>${points.map((p, i) => `<circle cx="${35 + i * (310 / Math.max(1, points.length - 1))}" cy="${155 - (p.n / s.total) * 120}" r="4" fill="#dfbc7e"/><text x="${35 + i * (310 / Math.max(1, points.length - 1))}" y="185" text-anchor="middle">${esc(p.label)}</text>`).join('')}</svg><small>Evidence completeness, not an impact or certification score.</small>${button('em-snapshot-' + pole, 'Record current snapshot', 'plus')}</div>`;
  }
  function dashboard() {
    const creative = current().id === 'creative-metrics',
      pole = creative ? 'creative' : 'bloom',
      s = M.summary(state(), pole);
    const items = metrics.filter((m) => m.pole === pole),
      groups = [...new Set(items.map((m) => m.group))],
      selected = value('em-group-' + pole, 'All');
    const filtered = selected === 'All' ? items : items.filter((m) => m.group === selected);
    const images = creative
      ? ['m:talent', 'fitting', 'beauty-origin', 'film-detail', 'm:craft', 'm:landscape']
      : [
          'on-set',
          'm:frame-arch',
          'local-workshop',
          'm:landscape',
          'm:frame-shadow',
          'm:field',
          'm:craft',
        ];
    return shell(`${hero(creative ? 'Local value. Creative integrity.' : 'Local production. Shared responsibility.', creative ? 'Artists · craft · territory · traceable participation' : 'People · places · resources · field evidence')}
      <div class="em-strip" aria-label="Metric categories"><button data-em-group="All" data-em-pole="${pole}" aria-pressed="${selected === 'All'}">${icon('chart')}<span>All categories</span></button>${groups.map((g, i) => `<button data-em-group="${g}" data-em-pole="${pole}" aria-pressed="${g === selected}">${shot(images[i % images.length], g)}<span>${g}</span></button>`).join('')}</div>
      <div class="em-dashboard-grid"><div class="panel"><div class="kicker">${creative ? 'CREATIVE' : 'PRODUCTION'} / EVIDENCE</div>${ring(s.documented, s.total, 'documented metrics')}${badge('Certification pending')}<small>Complete input + reference required.</small></div>${graph(pole)}<div class="panel"><div class="kicker">CONTRIBUTIONS BY PILLAR</div>${[
        'social',
        'environment',
        'economic',
      ]
        .map((p) => {
          const ms = items.filter((m) => m.pillar === p);
          return `<div class="em-pillar-count">${link('label-' + p, p === 'environment' ? 'Environmental' : p === 'economic' ? 'Economic' : 'Social', p === 'environment' ? 'leaf' : 'people')}<strong>${ms.length}</strong><small>tracked criteria</small></div>`;
        })
        .join(
          ''
        )}<small>Counts describe coverage. They do not sum unlike impact units.</small></div></div>
      <div class="panel space"><div class="car-head"><h3>${selected === 'All' ? 'Every contribution' : esc(selected)}</h3>${link('evidence-register', 'Open shared register', 'doc')}</div>${rows(filtered)}</div>
      <div class="grid2 space"><div class="panel"><h3>Next actions</h3>${
        filtered
          .filter((m) => !M.evidence(m, state()).complete)
          .slice(0, 3)
          .map((m) => `<p>${metricLink(m.id)}<small>${m.proof}</small></p>`)
          .join('') || '<p>All references entered. Human review remains.</p>'
      }</div><div class="panel"><h3>One brand, one journey</h3>${shot('m:frame-fashion-wide', 'Craie Morocco story')}<p>Craie Studio / review scenario. No other brand participation is assumed.</p>${link('tale-value', 'Carry the evidence into the proposal')}${link('label-method', 'Method & certification rules', 'shield')}</div></div>${connections(
        [
          [creative ? 'label-creative' : 'label-bloom', 'Pole commitments'],
          ['bee-certified', 'Consolidated Bee view'],
          ['actor-ledger', 'Cost and allocation register'],
          ['honey-library', 'Reusable assets'],
        ]
      )}`);
  }
  function certified() {
    const a = M.summary(state(), 'creative'),
      b = M.summary(state(), 'bloom'),
      s = M.summary(state()),
      l = H.ledger();
    return shell(`${hero('Bee Label. One connected view.', 'Creative Hive and Bloom Hive contribute to the same production record. Every claim keeps its scope and evidence.')}
    <div class="statrow">${stat('Production plan', money(l.creative + l.production), 'Creative + Bloom, counted once')}${stat('Local production spend', money(l.local), 'Within Bloom only')}${stat('Documented criteria', s.documented + ' / ' + s.total, 'Same shared evidence register')}${stat('Certificate', 'Pending', 'Method and authorised review required')}</div>
    <div class="em-consolidation"><div class="panel"><h3>Creative Hive</h3>${ring(a.documented, a.total, 'documented')}${link('creative-metrics', 'Explore creative metrics', 'camera')}</div><div class="em-center-seal">${icon('bee')}<h2>Bee Certified</h2>${badge('Not issued')}<p>Collect → connect → measure → verify</p>${link('label-method', 'Inspect the review framework', 'shield')}</div><div class="panel"><h3>Bloom Hive</h3>${ring(b.documented, b.total, 'documented')}${link('bloom-metrics', 'Explore production metrics', 'pin')}</div></div>
    <div class="grid3 space em-pillar-cards">${[
      ['social', 'People & culture', 'local-workshop', 'People, consent, fair work and community.'],
      ['environment', 'Lower footprint', 'm:landscape', 'Travel, resources, materials and waste.'],
      ['economic', 'Local value', 'm:craft', 'Local spend, procurement, jobs and partnerships.'],
    ]
      .map(
        ([id, t, img, copy]) =>
          `<div class="panel">${card(img, t, copy, 'label-' + id)}<div class="toolbar">${metrics
            .filter((m) => m.pillar === id)
            .slice(0, 2)
            .map((m) => metricCard(m.id))
            .join('')}</div>${link('label-' + id, 'Open the pillar')}</div>`
      )
      .join('')}</div>
    <div class="notice">Two different structures: Bee Label reports Social / Environmental / Economic practices; Honey reports creative / operational / impact returns. NGO outcomes retain their own evidence and are never carbon offsets.</div>${connections(
      [
        ['brand-value', 'Honey / brand returns'],
        ['tale-value', 'Tales / value page'],
        ['evidence-register', 'Review every input'],
        ['impact-pillars', 'Separate NGO action register'],
      ]
    )}`);
  }
  const pillarTabs = {
    social: ['Overview', 'Crew & Talent', 'Suppliers', 'Community', 'Wellbeing & Inclusion'],
    environment: [
      'Overview',
      'Transport',
      'Equipment & Sets',
      'Energy & Resources',
      'Catering & Accommodation',
      'Waste',
    ],
    economic: ['Overview', 'Local Spend', 'Suppliers', 'Employment', 'Value Creation'],
  };
  function pillar() {
    const p = current().id.replace('label-', ''),
      t = pillarTabs[p],
      index = H.tabs['em-pillar-' + p] || 0;
    const base = metrics.filter((m) => m.pillar === p);
    const mapping = {
      social: [
        null,
        ['Casting', 'Crew', 'Styling', 'Visual sources', 'Sound'],
        ['Accommodation', 'Catering'],
        ['Experience'],
        ['Crew', 'Casting'],
      ],
      environment: [
        null,
        ['Transport'],
        ['Equipment', 'Set design', 'Visual sources'],
        ['Energy'],
        ['Catering', 'Accommodation', 'Beauty'],
        ['Waste'],
      ],
      economic: [
        null,
        [],
        ['Suppliers', 'Styling', 'Beauty'],
        ['Crew', 'Casting', 'Sound', 'Set design', 'Locations'],
        ['Suppliers', 'Sound', 'Set design'],
      ],
    };
    const visible = index === 0 ? base : base.filter((m) => mapping[p][index].includes(m.group));
    const titles = {
      social: [
        'People, culture, stronger communities.',
        'Fair conditions and meaningful local participation.',
        'local-workshop',
      ],
      environment: [
        'Lower impact, smarter choices.',
        'Measure the resources used, the alternatives and the scope.',
        'm:landscape',
      ],
      economic: [
        'Long-term value, responsible growth.',
        'Track where value goes, who receives it and what is shared.',
        'on-set',
      ],
    };
    const [title, copy, asset] = titles[p],
      l = H.ledger();
    const selected =
      p === 'social'
        ? [
            'local-crew',
            'local-talent',
            'talent-consent',
            'local-stays',
            'local-meals',
            'fair-work',
          ]
        : p === 'environment'
          ? [
              'travel-avoided',
              'shared-vehicles',
              'local-equipment',
              'reused-set',
              'plant-meals',
              'single-plastic',
            ]
          : [
              'local-suppliers',
              'local-jobs',
              'designers',
              'local-artists',
              'local-musicians',
              'long-partners',
            ];
    return shell(`${link('bee-certified', 'Back to Bee Label', 'back')}${hero(title, copy, asset)}<div class="em-stats">${selected.map(metricCard).join('')}</div>${subs('em-pillar-' + p, t)}
    <div class="grid2"><div><div class="heroimage">${shot(asset, title)}</div><div class="panel space"><div class="kicker">${esc(t[index])}</div><h3>${p === 'economic' ? 'Value, with a clear boundary.' : p === 'social' ? 'Every person has a role and rights.' : 'A footprint with a defined scope.'}</h3><p>${p === 'social' ? 'Local crew, talent and suppliers use distinct denominators. A paid engagement is not automatically a newly created job. Inclusion is assessed through fair process and voluntary records.' : p === 'environment' ? 'A local choice is not automatically low carbon. We keep travel, energy, materials and waste separate, with activities, factors and supporting records.' : 'Local spend is calculated from unique production allocations. Creative fees and NGO capital are separate; nothing is added twice.'}</p>${p === 'economic' ? `<div class="statrow">${stat('Local spend plan', money(l.local), 'Unique Bloom allocations')}${stat('Local procurement', percent(l.localShare), 'Local € / production €')}${stat('Impact Capital', money(l.impact), 'Allocated, not spent or verified')}</div>${link('actor-ledger', 'Inspect costs and actors')}` : p === 'environment' ? `<div class="statrow">${stat('CO₂ reduction', percent(window.BeeReviewMath.carbon(value('carbon-actual', ''), value('carbon-baseline', ''), value('carbon-covered', false) ? 1 : 0)), 'Comparable full scope required')}</div>${link('metric-trace', 'Carbon baseline, factors and coverage')}` : link('casting-agencies', 'People and talent network')}</div></div>
    <div class="panel"><h3>${esc(t[index])} / inputs & evidence</h3>${visible.length ? rows(visible) : `<p>The monetary figures come directly from the actor ledger.</p>${link('actor-ledger', 'Open allocations')}`}</div></div>${connections(
      [
        ['creative-metrics', 'Creative contributions'],
        ['bloom-metrics', 'Bloom contributions'],
        ['evidence-register', 'Proof and reviewer'],
        ['tale-value', 'Brand presentation'],
        ['impact-pillars', 'NGO outcomes, separate scope'],
      ]
    )}`);
  }
  const castingCards = [
    ['Local agencies', 'm:talent', 'Partner network by territory', 'local-talent'],
    ['Wild casting', 'local-workshop', 'Open calls and local recommendations', 'wild-casting'],
    ['Inclusive casting', 'fitting', 'Fair process and cultural respect', 'inclusion'],
    ['Local participation', 'm:craft', 'Local talent and paid engagements', 'local-talent'],
    ['Consent & contracts', 'collection-kit', 'Terms, release and usage scope', 'talent-consent'],
    ['Emerging talent', 'beauty-prep', 'Mentoring and opportunities', 'emerging'],
  ];
  function casting(detail = false) {
    if (detail)
      return shell(
        `${hero('One talent. Every connection.', 'A casting decision connects the person, look, chapter, call and rights.', 'm:talent')}<div class="grid2"><div class="panel paper">${field('em-talent-name', 'Talent display name', 'Talent A · fictional')}${field('em-talent-representation', 'Representation', 'In-house', 'select', ['In-house', 'Partner agency'])}${field('em-talent-agency', 'Agency / casting lead', 'Bee casting team · exercise')}${field('em-talent-country', 'Country', 'Morocco', 'select', ['Morocco', 'Namibia', 'Philippines', 'Mexico', 'India'])}${field('em-talent-route', 'Discovery channel', 'Community recommendation', 'select', ['Partner agency', 'Open call', 'Street casting', 'Community recommendation', 'Local artist network'])}${field('em-talent-look', 'Assigned look', 'Look 01 / Ivory', 'select', ['Look 01 / Ivory', 'Look 02 / Rust'])}${field(
          'em-talent-chapter',
          'Chapter',
          'The first light',
          'select',
          H.chapters.map((x) => x[0])
        )}${field('em-talent-call', 'Fitting / call', 'Fitting 08:00 · courtyard · exercise')}${field('em-talent-scope', 'Usage and restrictions', 'Media, territory, term, exclusivity and consent to document.', 'textarea')}</div><div><div class="panel"><h3>Consent & fair terms</h3>${['Adult status checked without public ID data', 'Participation consent documented', 'Image release and usage scope agreed', 'Fee, commission and payment date recorded', 'Wellbeing / accessibility contact assigned'].map((x, i) => check('em-talent-check-' + i, x)).join('')}${field('em-talent-proof', 'Evidence reference', '')}${badge('No contract or real engagement created')}${link('my-commitments', 'Talent commitments', 'people', 'model')}</div><div class="panel space"><h3>Production handoff</h3><p>${esc(value('em-talent-name', 'Talent A · fictional'))} · ${esc(value('em-talent-look', 'Look 01 / Ivory'))}<br>${esc(value('em-talent-chapter', 'The first light'))}<br>${esc(value('em-talent-call', 'Fitting 08:00 · courtyard · exercise'))}</p>${link('designer-network', 'Fitting & styling', 'hanger')}${link('beauty-library', 'Beauty preparation', 'beauty')}${link('co-creation', 'Frame and location', 'pin')}${metricLink('talent-contracts', 'Update casting evidence')}</div></div></div>${connections(
          [
            ['casting-agencies', 'Back to the casting network'],
            ['creative-metrics', 'Creative contribution'],
            ['label-social', 'Social pillar'],
            ['actor-ledger', 'Talent allocation'],
          ]
        )}`
      );
    const country = value('em-casting-country', 'Morocco'),
      route = value('em-casting-route', 'Open call');
    return shell(`${hero('Casting & Talent', 'Human integrity. Local representation. Meaningful participation.', 'm:talent')}<div class="em-strip">${castingCards.map(([t, a, copy, id]) => `<button data-em-metric="${id}">${shot(a, t)}<span>${t}</span><small>${copy}</small><strong>${fmt(get(id))}</strong></button>`).join('')}</div>
    <div class="em-consolidation"><div class="panel"><h3>Country casting network</h3><div class="em-country-row">${['Morocco', 'Namibia', 'Philippines', 'Mexico', 'India'].map((c) => `<button data-em-country="${c}" aria-pressed="${country === c}">${icon('pin')}${c}</button>`).join('')}</div><h4>${esc(country)}</h4><p>${country === 'Morocco' ? 'In-house casting / example roster. Partner agencies remain to be qualified.' : 'No qualified agency in this review scenario. Add a partner proposal below.'}</p>${field('em-agency-name-' + country, 'Partner / agency proposal', '')}${field('em-agency-mode-' + country, 'Operating mode', 'In-house', 'select', ['In-house', 'Partner agency', 'Hybrid'])}${link('casting-talent', 'Open the talent record', 'people')}</div><div class="em-center-seal">${icon('bee')}<h3>Bee Label</h3><p>Human integrity</p>${badge('Evidence pending')}</div><div class="panel"><h3>Wild casting</h3>${shot('local-workshop', 'Community casting concept')}${field('em-casting-route', 'Discovery route', 'Open call', 'select', ['Open call', 'Street casting', 'Community recommendation', 'Local faces', 'Cultural authenticity'])}<p>${esc(route)} → voluntary application → human review → consent → fitting.</p>${field('em-casting-notes', 'Casting notes', 'Accessible calls, fair criteria and cultural permission. No sensitive identity scoring.', 'textarea')}</div></div>
    <div class="em-stats">${['local-talent', 'wild-casting', 'talent-contracts', 'talent-consent', 'emerging', 'inclusion'].map(metricCard).join('')}</div><div class="panel"><h3>Validation & evidence</h3><div class="em-proof-strip">${['Casting sheets', 'Agency roster', 'Consent forms', 'Release forms', 'Contracts', 'Talent origin', 'Inclusion notes'].map((t) => `<button data-em-metric="${t === 'Contracts' ? 'talent-contracts' : t === 'Inclusion notes' ? 'inclusion' : 'talent-consent'}">${icon('doc')}<span>${t}</span><small>Open evidence record</small></button>`).join('')}</div></div>${connections(
      [
        ['label-creative', 'Creative Hive'],
        ['casting-talent', 'Talent profile'],
        ['label-social', 'Social metrics'],
        ['tale-hive', 'Tales team'],
        ['actor-ledger', 'Fees and attribution'],
      ]
    )}`);
  }
  function upcycling() {
    const channels = [
      'Local photographers',
      'Archive books',
      'Editorial tear sheets',
      'NGO documentation',
      'Brand archives',
      'Partner creators',
    ];
    return shell(
      `${hero('Visual Upcycling', 'Original references. Clear rights. Every inspiration keeps its source.', 'film-detail')}<div class="em-stats">${['visual-original', 'source-rights', 'upcycled-references'].map(metricCard).join('')}<div class="em-stat">${icon('shield')}<strong>Excluded</strong><span>AI concepts from organic evidence</span></div></div><div class="em-consolidation"><div class="panel"><h3>Bee Authenticator</h3>${shot('m:frame-arch', 'Source inspection')}<ul class="list">${['Metadata and original file', 'Source channel verification', 'Rights and credit review', 'Human origin review', 'AI / unknown source exclusion'].map((t) => `<li>${icon('shield')}${t}</li>`).join('')}</ul>${link('authenticator', 'Inspect a source', 'shield')}</div><div class="em-center-seal">${icon('bee')}<h3>Source integrity</h3>${badge('No automatic authentication')}<p>Declared → documented → reviewed</p></div><div class="panel"><h3>Source channels</h3><div class="grid3">${channels.map((x, i) => `<button class="em-source" data-em-channel="${x}" aria-pressed="${value('em-channel', channels[0]) === x}">${shot(['on-set', 'collection-kit', 'fitting', 'local-workshop', 'film-detail', 'm:craft'][i], x)}<small>${x}</small></button>`).join('')}</div><div class="space">${field('em-source-title', 'Reference title', 'CM-01 / texture inspiration')}${field('em-source-url', 'Source URL / archive reference', '')}${field('em-source-credit', 'Creator / credit / licence', '')}${field('em-source-capture', 'Capture date / territory / original metadata', '')}${field('em-source-type', 'Source declaration', 'AI concept', 'select', ['Original capture', 'Licensed archive original', 'AI concept', 'Unknown'])}</div></div></div><div class="grid3 space"><div class="panel"><h3>Recycled inspirations</h3><div class="tiles">${['m:frame-arch', 'film-detail', 'm:craft'].map((x) => shot(x, 'Illustrative reference')).join('')}</div>${field('em-source-derivative', 'Parent → derivative → use', 'CM-01 → Chapter 01 board → texture treatment', 'textarea')}</div><div class="panel"><h3>Originals only / label evidence</h3><p>AI-generated UI illustrations remain marked as concepts. They do not enter the authenticated reference library or count as organic production evidence.</p>${badge(value('em-source-type', 'AI concept') === 'AI concept' ? 'AI concept · excluded' : 'Provenance review required')}</div><div class="panel"><h3>Rights & delivery</h3>${metricLink('source-rights')}${link('asset-passport', 'Open asset passport', 'doc')}${link('honey-library', 'Find the delivery version', 'image')}</div></div>${connections(
        [
          ['evidence-register', 'Source proof library'],
          ['creative-metrics', 'Creative data'],
          ['tale-chapters', 'Reference → chapter'],
          ['bee-certified', 'Label consolidation'],
        ]
      )}`
    );
  }
  function evidence() {
    const filter = value('em-register-pole', 'All'),
      list = metrics.filter((m) => filter === 'All' || m.pole === filter);
    let selected = get(value('em-metric', 'local-talent'));
    if (!list.includes(selected)) selected = list[0];
    const m = selected,
      r = M.measure(m, state()),
      e = M.evidence(m, state()),
      reviewer = ['bee', 'expert'].includes(current().role);
    return shell(
      `${hero('Every number carries a trace.', 'One metric ID connects the contributor, calculation, evidence, review and brand report.', 'collection-kit')}<div class="em-evidence-grid"><div class="panel">${field('em-register-pole', 'Source pole', 'All', 'select', ['All', 'creative', 'bloom'])}<div class="em-reg-list">${list.map((x) => `<button data-em-select="${x.id}" aria-pressed="${x.id === m.id}">${x.label}<small>${x.pole} / ${x.pillar} · ${fmt(x)}</small></button>`).join('')}</div></div><div><div class="panel paper"><div class="kicker">${m.id.toUpperCase()} · ${m.pole.toUpperCase()} / ${m.pillar.toUpperCase()}</div><h3>${m.label}</h3><p>Owner: ${H.roles[m.owner]}. Unit: ${m.unit}.</p><div class="grid2">${field('em-' + m.id + '-n', m.d === null ? 'Measured quantity' : 'Qualifying quantity', m.n ?? '', 'number')}${m.d === null ? '' : field('em-' + m.id + '-d', 'Eligible total', m.d, 'number')}</div><div class="em-result">${fmt(m)}<small>${m.d === null ? 'Count in ' + m.unit : 'Qualifying quantity / eligible total × 100'}</small></div>${r.valid ? '' : '<p role="alert">Missing or invalid input. A ratio requires a positive denominator and a numerator within that total.</p>'}${field('em-' + m.id + '-scope', 'Boundary / period / definition', 'Morocco / Carry the light / planned production. Unique records only.', 'textarea')}${field('em-' + m.id + '-ref', 'Evidence reference / URL', '')}${field('em-' + m.id + '-note', 'Method and collection notes', m.proof, 'textarea')}<small>Required proof: ${m.proof}. References here are local drafts; use shared feedback below to exchange images.</small></div><div class="panel space"><h3>Review and responsibility</h3>${field('em-' + m.id + '-risk', 'Risk level', e.risk, 'select', ['Standard', 'Elevated'])}${reviewer ? `${field('em-' + m.id + '-review', 'Evidence review', 'Pending', 'select', ['Pending', 'Correction requested', 'Reviewed in exercise'])}${field('em-' + m.id + '-decision', 'Criterion decision', 'Pending', 'select', ['Pending', 'Correction requested', 'Accepted in exercise'])}${check('em-' + m.id + '-independent', 'Independent review documented in this exercise')}${field('em-' + m.id + '-reviewer', 'Reviewer and review note', '', 'textarea')}` : '<p>Bee or the independent reviewer records the review. Switch role to explore that handoff.</p>'}${badge(e.accepted ? 'Accepted in exercise' : e.reviewed ? (e.risk === 'Elevated' && !e.independent ? 'Independent review required' : 'Review complete; decision pending') : e.complete ? 'Evidence draft; review pending' : 'Evidence incomplete')}${link(m.page, 'Return to the responsible workflow', 'back', m.owner)}${link('label-' + m.pillar, 'View the reporting pillar', 'chart')}${link('label-method', 'Certification criteria', 'shield')}</div></div></div><div class="toolbar">${button('em-export-evidence', 'Download evidence register', 'download')}${link('bee-certified', 'Consolidated view')}</div>`
    );
  }
  function soundLibrary() {
    const types = ['Voices', 'Instruments', 'Nature', 'Ambience'],
      type = value('em-sound-type', 'Nature'),
      c = chapter();
    return shell(
      `${chapterStrip()}${hero('Sound Tale / original sounds, real places.', 'Composition · sound upcycling · local production · creative board.', 'm:landscape')}<div class="grid2"><div><div class="panel paper"><div class="kicker">01 / COMPOSITION</div><h3>${esc(value('chapter-name-' + c, H.chapters[c][0]))}</h3>${field('em-composition-' + c, 'Musical concept', 'Intimate natural textures, slow movement and room for the visual story.', 'textarea')}${field('sound-brief-' + c, 'DA musical brief', H.chapters[c][0] + ' / tactile, intimate, spacious; leave room for the visual rhythm.', 'textarea')}</div><div class="panel space"><div class="kicker">02 / SOUND INSPIRATIONS</div><h3>World sound library</h3><div class="em-country-row">${types.map((t) => `<button data-em-sound="${t}" aria-pressed="${type === t}">${icon('sound')}${t}</button>`).join('')}</div>${field('em-cue-name-' + c, 'Cue / source name', type + ' study / chapter ' + (c + 1))}${field('em-cue-parent-' + c, 'Original source / reused sample ID', 'Pending original recording')}${field('em-cue-author-' + c, 'Artist / musician / recordist', 'Local contributor to appoint')}${field('em-cue-place-' + c, 'Country / location / capture date', 'Morocco / ' + H.chapters[c][1] + ' / date pending')}${field('sound-gps-' + c, 'Geolocation / capture coordinates', ['Courtyard · 31.426, -7.881 · approximate', 'Olive grove · 31.432, -7.872 · approximate', 'Terrace · 31.438, -7.863 · approximate'][c])}${field('em-cue-licence-' + c, 'Master / composition / performance / sample rights', 'Rights, consent, territory and term to document.', 'textarea')}</div></div><div><div class="panel"><div class="kicker">03 / LOCAL PRODUCTION</div><div class="grid2">${types.map((t, i) => `<button class="em-source" data-em-sound="${t}">${shot(['m:talent', 'm:craft', 'm:field', 'm:frame-arch'][i], t)}<span>${t}</span></button>`).join('')}</div><p>${esc(type)} sources connect to their authors, permissions, location and source file.</p>${link('sound-studio', 'Open audio audition & producer budget', 'sound')}${link('sound-map', 'Locate chapter sources', 'pin')}</div><div class="panel space"><div class="kicker">04 / CREATIVE BOARD</div>${shot(H.chapters[c][2], H.chapters[c][0])}${link('tale-bloom', 'Open attached Bloomboard', 'image')}${link('asset-passport', 'Source → edit → master passport', 'shield')}</div></div></div><div class="em-flowline">DA concept → Bee review → brand validation → sound production → mix & masters</div><div class="em-stats">${['local-musicians', 'sound-original', 'sound-rights'].map(metricCard).join('')}</div>${connections(
        [
          ['creative-lock', 'Review the chapter revision'],
          ['tale-hive', 'Visual Tale + Sound Tale'],
          ['creative-metrics', 'Provenance & talent metrics'],
          ['honey-library', 'Reusable masters'],
        ]
      )}`
    );
  }
  function operations() {
    const groups = [...new Set(metrics.filter((m) => m.pole === 'bloom').map((m) => m.group))],
      selected = value('em-operations', 'Crew');
    return shell(
      `${hero('Bloom Hive / field operations.', 'Every line producer, local guide and supplier contributes to the same evidence trail.')}<div class="em-country-row">${groups.map((g) => `<button data-em-operation="${g}" aria-pressed="${g === selected}">${icon('pin')}${g}</button>`).join('')}</div><div class="grid2 space"><div class="panel paper"><h3>${esc(selected)} / activity record</h3>${field('em-op-' + selected + '-actor', 'Actor / supplier', 'Local ' + selected.toLowerCase() + ' partner · to qualify')}${field('em-op-' + selected + '-action', 'Action and location', 'Carry the light / Morocco / scope to confirm', 'textarea')}${field('em-op-' + selected + '-date', 'Activity date', '2026-11-09', 'date')}${field('em-op-' + selected + '-proof', 'Document / invoice / permit reference', '')}${field('em-op-' + selected + '-handoff', 'Next owner and required return', 'Production → Bee review → label metrics', 'textarea')}${link('actor-ledger', 'Related cost and payment allocation', 'chart')}</div><div class="panel"><h3>Measurement & proofs</h3>${rows(metrics.filter((m) => m.pole === 'bloom' && m.group === selected))}${link('evidence-register', 'Enter the supporting data', 'doc')}<p>One metric ID is reused in Bloom metrics and the social, environmental or economic pillar.</p></div></div>${connections(
        [
          ['co-creation', 'Scouting and feasibility'],
          ['label-bloom', 'Bloom charter'],
          ['bloom-metrics', 'Production metrics'],
          ['bee-certified', 'Bee consolidation'],
        ]
      )}`
    );
  }
  function honey() {
    return shell(
      `${hero('The value that remains.', 'Original work, reusable assets and documented value after the production.', 'film-detail')}<div class="em-strip">${[
        ['Organic sound tales', 'm:landscape', 'sound-library'],
        ['Circular art & materials', 'm:craft', 'set-detail'],
        ['Visual archives', 'film-detail', 'visual-upcycling'],
        ['Asset passports', 'collection-kit', 'asset-passport'],
        ['Final masters', 'on-set', 'post-chapters'],
      ]
        .map(([t, a, id]) => card(a, t, 'Source · author · version · rights', id))
        .join(
          ''
        )}</div><div class="grid2"><div class="panel"><h3>Asset library / current delivery</h3>${field('em-master-version', 'Delivery version', 'CM-CH01-v03 / exercise')}${field('em-master-scope', 'Licence / territory / term', 'Not cleared for external reuse', 'textarea')}${field('em-master-credit', 'Credits', 'All contributors to confirm', 'textarea')}${field('em-master-parent', 'Original and derivative IDs', 'CM-01 → CH01 board → CM-CH01-v03')}${link('post-chapters', 'Versions & brand approval', 'film')}</div><div class="panel"><h3>Production → brand report</h3>${link('bee-certified', 'Bee Label / three pillars', 'bee')}${link('brand-value', 'Honey / three returns', 'chart')}${link('impact-pillars', 'NGO outcomes / separate scope', 'leaf')}${link('tale-value', 'Tales / presentation data', 'doc')}<p>Reuse follows permissions and credits. A delivery file is not an additional original work. Elixir of Honey, the future magazine, is outside this release.</p></div></div>`
    );
  }
  function method() {
    const s = M.summary(state()),
      reviewer = ['bee', 'expert'].includes(current().role);
    return shell(
      `${hero('A label built on evidence.', 'Charter → actions → metrics → evidence → human review.', 'm:craft')}<div class="statrow">${stat('Tracked criteria', s.total, 'Creative + Bloom, unique IDs')}${stat('Evidence drafts', s.documented, 'Valid measure + source reference')}${stat('Accepted in exercise', s.accepted, 'Risk-based review conditions')}${stat('Bee score', 'Not defined', 'No invented weighting or threshold')}</div><div class="grid2"><div class="panel paper"><h3>Reference framework</h3>${field('em-label-version', 'Charter version', 'Draft / criteria to validate')}${field('em-label-owner', 'Framework owner', 'Bee / to designate')}${field('em-label-scope', 'Certification scope', 'Creative Hive and Bloom Hive / this production only', 'textarea')}${field('em-label-rules', 'Scoring rules, weights and mandatory criteria', 'Not established by the supplied screens. Validate a versioned methodology before issuing a score.', 'textarea')}${field('em-label-validity', 'Validity and renewal', 'To define')}${field('em-label-independence', 'Independent review rule', 'Elevated risk or sensitive origin / impact claims require an independent reviewer.', 'textarea')}</div><div class="panel"><h3>Decision record</h3><p>References and checkboxes in this comparator are illustrative declarations. No certificate is issued here, including when every exercise criterion is accepted.</p>${reviewer ? `${field('em-label-decision', 'Draft decision', 'Not reviewed', 'select', ['Not reviewed', 'Corrections required', 'Ready for formal audit'])}${field('em-label-reviewer', 'Reviewer / date / rationale', '', 'textarea')}` : '<p>Bee and the independent reviewer prepare the decision record.</p>'}${badge('No real certificate issued')}${button('em-export-label', 'Download draft review record', 'download')}${link('evidence-register', 'Inspect all criteria', 'shield')}${link('bee-certified', 'Return to consolidated view', 'back')}</div></div><div class="notice">The label measures production practices. Independent NGO outcomes remain separate. Original photography or sound, natural ingredient composition, organic product certification and cultural permissions are distinct evidence types.</div>`
    );
  }
  function handle(target) {
    const d = target.dataset,
      s = state();
    if (d.emMetric) {
      s['em-metric'] = d.emMetric;
      s['em-register-pole'] = 'All';
      H.save();
      location.hash = '#view/' + H.go('evidence-register') + '/evidence-register';
      return true;
    }
    if (d.emSelect) s['em-metric'] = d.emSelect;
    else if (d.emGroup) s['em-group-' + d.emPole] = d.emGroup;
    else if (d.emCountry) s['em-casting-country'] = d.emCountry;
    else if (d.emChannel) s['em-channel'] = d.emChannel;
    else if (d.emSound) s['em-sound-type'] = d.emSound;
    else if (d.emOperation) s['em-operations'] = d.emOperation;
    else if (d.action?.startsWith('em-snapshot-')) {
      const pole = d.action.slice(12),
        sum = M.summary(s, pole);
      s['em-history-' + pole] = [
        ...value('em-history-' + pole, []),
        {
          documented: sum.documented,
          label: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        },
      ].slice(-20);
    } else if (d.action === 'em-export-evidence') {
      H.download(
        'bee-evidence-register-draft.json',
        JSON.stringify(
          {
            type: 'local-review-draft',
            certified: false,
            metrics: metrics.map((m) => ({
              ...m,
              measurement: M.measure(m, s),
              evidence: M.evidence(m, s),
            })),
          },
          null,
          2
        )
      );
      return true;
    } else if (d.action === 'em-export-label') {
      H.download(
        'bee-label-review-draft.json',
        JSON.stringify(
          {
            type: 'local-review-draft',
            certified: false,
            summary: M.summary(s),
            framework: Object.fromEntries(
              Object.entries(s).filter(([k]) => k.startsWith('em-label-'))
            ),
          },
          null,
          2
        )
      );
      return true;
    } else return false;
    H.save();
    H.draw();
    return true;
  }
  function related() {
    if (current().v2.startsWith('email-')) return '';
    const mapping = {
      beauty: ['natural-beauty', 'local-beauty'],
      'beauty-origin': ['natural-beauty', 'local-beauty'],
      styling: ['designers', 'designer-credit'],
      set: ['local-artists', 'reused-set'],
      'set-detail': ['local-artists', 'reused-set'],
      sound: ['local-musicians', 'sound-original', 'sound-rights'],
      'sound-map': ['local-musicians', 'sound-original', 'sound-rights'],
      auth: ['visual-original', 'source-rights'],
      passport: ['visual-original', 'source-rights'],
    };
    const ms = mapping[current().v2] || [];
    if (ms.length)
      return `<div class="panel space"><div class="kicker">THIS WORK CONTRIBUTES TO THE LABEL</div><div class="toolbar">${ms.map((id) => metricLink(id)).join('')}${link('creative-metrics', 'Creative metrics', 'chart')}${link('bee-certified', 'Consolidated label', 'bee')}</div></div>`;
    if (
      ['validation', 'commitments', 'metrics', 'impact', 'ledger', 'tale', 'post'].includes(
        current().v2
      )
    )
      return connections([
        ['evidence-register', 'Shared metric & evidence register'],
        ['bee-certified', 'Bee Certified / three pillars'],
        ['honey-library', 'Reusable creative assets'],
      ]);
    return '';
  }
  return {
    renderers: {
      'email-metrics': dashboard,
      'email-certified': certified,
      'email-pillar': pillar,
      'email-casting': () => casting(false),
      'email-talent': () => casting(true),
      'email-upcycling': upcycling,
      'email-evidence': evidence,
      'email-sound': soundLibrary,
      'email-operations': operations,
      'email-honey': honey,
      'email-method': method,
    },
    handle,
    metricLink,
    source,
    related,
  };
};
