/* EUGE DA creation workspace. Same shared review keys, local production exercise. */
window.BeeTaleWorkspace = function (H) {
  const M = window.BeeTaleModel,
    { esc, icon, shot, link, badge } = H;
  const s = () => H.state(),
    role = () => H.current().role,
    v = (k, f) => M.val(s(), k, f);
  const ids = [
    'tale-brief',
    'tale-visions',
    'tale-chapters',
    'tale-hive',
    'tale-cocreation',
    'tale-bloom',
    'tale-value',
    'tale-export',
  ];
  const names = [
    'Brief & Brand',
    'Mutual Visions',
    'Visual Tale',
    'Creative Hive',
    'Co-creation',
    'Bloom',
    'Impact & Multi-ROI',
    'Review & Export',
  ];
  const assets = [
    'm:frame-fashion-wide',
    'm:craft',
    'm:frame-arch',
    'on-set',
    'fitting',
    'm:field',
    'm:landscape',
    'film-detail',
  ];
  const refs = [
    '1YupNutvcRwP_URWz3O2ogIEXJYuarHRN',
    '1KtT9Mdl5U8qInLm5nT67S2xg2GfsZnYO',
    '1lIIxkduys55aGmCbHJxUSqwPptQhuE_z',
    '1RF9STo1jbkgwQ138zyL61RaCjXYAmfhO',
    '1s2HLv_UOIcgtvYj4PKPTfGSQ1V1odUeC',
    '1Wa_ISa6ZlUBJJ8knyH4ppLHGdHJvWY2g',
    '1yORLWmp_zjyz_neObgdHkdVCt3uFe9Kh',
    '1Fs2EkpwfCj4Fekg6ovumM5nZ9xBvxm0d',
  ];
  const stage = () => Math.max(0, ids.indexOf(H.current().id));
  const ch = () => H.chapter(),
    chapters = () => H.chapters;
  const order = () => {
    const stored = v('da-chapter-order', []),
      rest = chapters().map((_, i) => i);
    return [...new Set([...stored.filter((i) => rest.includes(i)), ...rest])];
  };
  const can = (key) => {
    if (key === 'tale-cost') return role() === 'bee';
    if (key === 'da-review-note') return ['bee', 'brand', 'art'].includes(role());
    const p = M.poles.find((p) => key.endsWith('-' + p.id));
    if (p && key.startsWith('da-')) {
      if (/^da-(content|evidence)-/.test(key)) return M.lead(role()) || role() === p.id;
      if (/^da-feedback-/.test(key)) return M.lead(role()) || role() === M.task(s(), p.id).head;
      return M.lead(role()) || role() === M.task(s(), p.id).head;
    }
    if (M.lead(role())) return true;
    if (role() === 'production' && /^(tale-feasibility|tale-scout|da-board-|da-call-)/.test(key))
      return true;
    return (
      role() === 'brand' &&
      /^(tale-brand|tale-intention|tale-keywords|vision-brand|da-brand-comment)$/.test(key)
    );
  };
  const field = (key, label, fallback = '', kind = 'text', options = []) => {
    const value = v(key, fallback),
      locked = !can(key);
    const choices = options
      .map((x) => {
        const id = typeof x === 'object' ? x.value : x,
          text = typeof x === 'object' ? x.label : key.startsWith('da-head-') ? H.roles[x] || x : x;
        return `<option value="${esc(id)}" ${value === id ? 'selected' : ''}>${esc(text)}</option>`;
      })
      .join('');
    return `<div class="field"><label for="da-${key}">${esc(label)}</label>${kind === 'textarea' ? `<textarea id="da-${key}" data-da-field="${key}" maxlength="2400" ${locked ? 'readonly' : ''}>${esc(value)}</textarea>` : kind === 'select' ? `<select id="da-${key}" data-da-field="${key}" ${locked ? 'disabled' : ''}>${choices}</select>` : `<input id="da-${key}" data-da-field="${key}" type="${kind}" maxlength="250" value="${esc(value)}" ${locked ? 'readonly' : ''}>`}</div>`;
  };
  const check = (key, label, fallback = false) =>
    `<label class="check"><input type="checkbox" data-da-field="${key}" ${v(key, fallback) ? 'checked' : ''} ${can(key) ? '' : 'disabled'}>${esc(label)}</label>`;
  const act = (a, text, ic = 'arrow', extra = '') =>
    `<button type="button" data-da-action="${a}" ${extra}>${icon(ic)}${esc(text)}</button>`;
  const title = (i) => v('chapter-name-' + i, chapters()[i][0]);
  const locationName = (i) => v('chapter-location-' + i, chapters()[i][1]);
  const photo = (key, fallback, alt) => {
    const pick = v('da-visual-' + key, fallback);
    const uploaded = v('da-upload-' + key, '');
    return /^data:image\/jpeg;base64,/.test(uploaded)
      ? `<img class="image" src="${uploaded}" alt="${esc(alt)} · user reference">`
      : shot(pick, alt);
  };
  function picker(key, fallback) {
    return `<details class="da-picker"><summary>${icon('image')}Choose visual / add a reference</summary><div class="da-image-options">${assets.map((a) => `<button data-da-action="image" data-key="${key}" data-asset="${a}" aria-label="Use ${a.replace('m:', '')}" ${M.lead(role()) ? '' : 'disabled'}>${shot(a, 'Morocco concept')}</button>`).join('')}</div><label class="da-upload">${icon('plus')}Upload a reference<input type="file" data-da-upload="${key}" accept="image/jpeg,image/png,image/webp" ${M.lead(role()) ? '' : 'disabled'}></label><small>Private to this browser. JPEG, PNG or WebP, up to 8 MB. Concept / reference, not evidence of origin.</small>${v('da-upload-' + key) ? act('reset-image', 'Use journey asset', 'refresh', `data-key="${key}" data-asset="${fallback}"`) : ''}</details>`;
  }
  const nav = (active) =>
    `<aside class="da-sidebar"><div class="da-wordmark">${icon('bee')}<strong>BEEYONDTHEWORLD</strong><small>CREATIVE STUDIO</small></div><nav aria-label="Proposal steps">${ids.map((id, i) => `<a class="${i === active ? 'active' : ''}" href="#view/${H.go(id)}/${id}" ${i === active ? 'aria-current="step"' : ''}><span>${String(i + 1).padStart(2, '0')}</span>${names[i]}</a>`).join('')}</nav>${link('tale-team', 'Team workspace', 'people')}<div class="da-project">${shot('m:frame-fashion-wide', 'Morocco production')}<strong>${esc(v('tale-brand'))}</strong><small>${esc(v('tale-title'))}</small><small>Revision ${v('da-revision', 1)} · local draft</small></div></aside>`;
  function thumbRail(active) {
    return `<nav class="da-rail" aria-label="Visual proposal navigation">${ids.map((id, i) => `<a class="${i === active ? 'active' : ''}" href="#view/${H.go(id)}/${id}">${shot(assets[i], names[i])}<span><small>${String(i + 1).padStart(2, '0')}</small>${names[i]}</span></a>`).join('')}</nav>`;
  }
  function preview(i, printable = false) {
    const c = ch(),
      story = i === 2 || i === 5;
    let heading = i === 0 ? v('tale-title') : story ? title(c) : names[i];
    let copy =
      i === 0
        ? v('tale-intention')
        : i === 1
          ? 'A shared intention, rooted in place.'
          : story
            ? v('chapter-note-' + c, 'Follow the light, the material and the gesture.')
            : i === 6
              ? v('tale-claim')
              : 'One vision. Many talents. A collective creation.';
    return `<article class="da-preview ${printable ? 'print-preview' : ''}">${photo(story ? 'chapter-' + c : 'cover', story ? chapters()[c][2] : v('da-visual-cover', assets[0]), heading)}<div class="da-preview-top"><span>${esc(v('tale-brand'))}</span><span>BEEYONDTHEWORLD</span></div><div class="da-preview-copy"><small>${story ? 'CHAPTER ' + (order().indexOf(c) + 1) : 'VISUAL TALE · ' + esc(v('tale-destination'))}</small><h2 id="tale-preview-title">${esc(heading)}</h2><p id="tale-preview-copy">${esc(copy)}</p>${
      i === 1
        ? `<div class="da-preview-pillars">${[
            ['people', 'SOCIAL', 'vision-social'],
            ['leaf', 'ENVIRONMENT', 'vision-environment'],
            ['chart', 'ECONOMY', 'vision-economy'],
          ]
            .map(
              ([ic, n, k]) =>
                `<div>${icon(ic)}<strong>${n}</strong><small>${esc(v(k))}</small></div>`
            )
            .join('')}</div>`
        : ''
    }${story ? `<small>${icon('pin')}${esc(locationName(c))}</small>` : ''}</div><div class="da-preview-foot">DRAFT · CONCEPT VISUALS · NO VERIFIED IMPACT CLAIM</div></article>`;
  }
  function chapterList() {
    return `<div class="da-chapter-list">${order()
      .map(
        (n, i) =>
          `<button data-da-action="chapter" data-index="${n}" aria-pressed="${n === ch()}">${photo('chapter-' + n, chapters()[n][2], title(n))}<span><small>${String(i + 1).padStart(2, '0')}</small><strong>${esc(title(n))}</strong><small>${esc(locationName(n))}</small></span></button>`
      )
      .join(
        ''
      )}</div><div class="toolbar">${act('add-chapter', 'Add chapter', 'plus', M.lead(role()) ? '' : 'disabled')}${act('move-up', 'Move earlier', 'back', M.lead(role()) ? '' : 'disabled')}${act('move-down', 'Move later', 'arrow', M.lead(role()) ? '' : 'disabled')}</div>`;
  }
  function tasks() {
    const selected = v('da-selected-pole', M.poles.some((p) => p.id === role()) ? role() : 'photo'),
      p = M.poles.find((x) => x.id === selected) || M.poles[0],
      t = M.task(s(), p.id),
      canHead = M.lead(role()) || role() === t.head;
    return `<div class="da-task-summary">${M.poles
      .map((p) => {
        const t = M.task(s(), p.id);
        return `<button data-da-action="pole" data-pole="${p.id}" aria-pressed="${p.id === selected}">${icon(p.icon)}<span>${p.name}<small>${t.status}</small></span></button>`;
      })
      .join(
        ''
      )}</div><div class="da-task-detail"><div class="da-section-heading"><div><small>CONTRIBUTOR → HEAD → CREATIVE DIRECTOR</small><h3>${p.name}</h3></div>${badge(t.status, t.status === 'Approved for proposal' ? 'ok' : 'pending')}</div><div class="grid2">${field('da-owner-' + p.id, 'Contributor name', '')}${field('da-head-' + p.id, 'Responsible head / role', p.id, 'select', M.poles.map((x) => x.id).concat(['art', 'bee']))}${field('da-due-' + p.id, 'Internal due date', '', 'date')}${field('da-chapter-' + p.id, 'Linked chapter', 'All chapters', 'select', ['All chapters', ...order().map((i) => ({ value: 'chapter:' + i, label: `CH${i + 1} · ${title(i)}` }))])}</div>${field('da-brief-' + p.id, 'Expected contribution', p.brief, 'textarea')}${check('da-required-' + p.id, 'Required for this proposal', p.id !== 'sound' || v('tale-sound'))}${sourceContext(p.id)}<div class="da-contribution">${field('da-content-' + p.id, 'Contribution / creative direction', '', 'textarea')}${field('da-evidence-' + p.id, 'Reference, asset ID or source link', '')}${field('da-feedback-' + p.id, 'Head’s revision request', '', 'textarea')}</div><div class="toolbar">${act('task-submit', 'Submit to head', 'arrow', `data-pole="${p.id}" ${M.lead(role()) || role() === p.id ? '' : 'disabled'}`)}${act('task-approve', 'Approve contribution', 'check', `data-pole="${p.id}" ${canHead ? '' : 'disabled'}`)}${act('task-return', 'Request changes', 'back', `data-pole="${p.id}" ${canHead ? '' : 'disabled'}`)}</div><div class="toolbar">${link(p.page, 'Open ' + p.name + ' workspace', p.icon, p.id)}<a class="vbutton" href="#view/${p.id}/tale-team">${icon('people')}View as ${p.name}</a></div><p class="caption-note">These assignments and decisions are an exercise on this device. No invitation, task notification or real approval is sent.</p></div>`;
  }
  function sourceContext(id) {
    const mapping = {
      beauty: [
        ['beauty-direction', 'Beauty direction'],
        ['beauty-look', 'Look'],
        ['beauty-country', 'Country'],
      ],
      stylist: [
        ['designer-country', 'Country'],
        ['designer-terms', 'Collaboration'],
        ['designer-credit', 'Designer credit'],
      ],
      set: [
        ['set-material', 'Material'],
        ['set-maker', 'Maker'],
      ],
      sound: [
        ['sound-brief-' + ch(), 'Chapter sound brief'],
        ['sound-gps-' + ch(), 'Recording location'],
        ['em-composition-' + ch(), 'Composition'],
      ],
      production: [
        ['scout-note', 'Scouting return'],
        ['tale-feasibility', 'Feasibility'],
      ],
      editor: [
        ['post-version', 'Master version'],
        ['post-return', 'Revision notes'],
      ],
      photo: [
        ['chapter-name-' + ch(), 'Chapter'],
        ['chapter-note-' + ch(), 'Narrative'],
      ],
      film: [
        ['chapter-name-' + ch(), 'Chapter'],
        ['chapter-note-' + ch(), 'Narrative'],
      ],
    };
    const rows = (mapping[id] || []).filter(([key]) => String(v(key, '')).trim());
    return `<details class="da-source-context" open><summary>Connected source / ${esc(title(ch()))}</summary>${rows.length ? rows.map(([key, label]) => `<p><strong>${label}</strong><br>${esc(v(key))}</p>`).join('') : '<p>Open the specialty workspace to prepare the source direction. Its next edit reopens this contribution’s review.</p>'}</details>`;
  }
  function content(i) {
    if (i === 0)
      return `${field('tale-brand', 'Brand')}${field('tale-title', 'Project title')}${field('tale-intention', 'Creative intention', '', 'textarea')}${field('tale-keywords', 'Keywords / comma separated')}<div class="grid2">${field('tale-destination', 'Destination')}${field('da-season', 'Season / production window')}</div><div class="da-mini-mood">${photo('cover', assets[0], 'Cover reference')}${shot('m:craft', 'Texture reference')}${shot('m:field', 'Location reference')}</div>${picker('cover', assets[0])}<div class="kicker space">MAIN DELIVERABLES</div>${check('tale-photo', 'Visual Tale / photography', true)}${check('tale-sound', 'Sound Tale / original composition', true)}${check('tale-bts', 'Behind the scenes / film', true)}${check('da-editorial', 'Editorial content')}${check('da-social-assets', 'Social media assets')}`;
    if (i === 1)
      return `<div class="grid2">${field('vision-brand', 'Brand vision & values', '', 'textarea')}${field('vision-bee', 'Beeyondtheworld vision & values', '', 'textarea')}</div><h3>Shared intention through three pillars.</h3>${[
        ['people', 'Social', 'social'],
        ['leaf', 'Environmental', 'environment'],
        ['chart', 'Economic', 'economy'],
      ]
        .map(
          ([ic, n, k]) =>
            `<div class="da-pillar">${icon(ic)}${field('vision-' + k, n, '', 'textarea')}</div>`
        )
        .join(
          ''
        )}<div class="da-mini-mood">${photo('vision-1', 'm:craft', 'People')}${photo('vision-2', 'm:landscape', 'Environment')}${photo('vision-3', 'fitting', 'Local value')}</div>${picker('vision-1', 'm:craft')}`;
    if (i === 2)
      return `${chapterList()}${field('chapter-name-' + ch(), 'Chapter title', chapters()[ch()][0])}${field('da-subtitle-' + ch(), 'Subtitle / emotion', 'Quiet strength')}${field('chapter-location-' + ch(), 'Location', chapters()[ch()][1])}${field('chapter-note-' + ch(), 'Narrative / atmosphere', 'Follow the light, the material and the gesture.', 'textarea')}${field('da-elements-' + ch(), 'Key elements', 'Light, stone, movement, craft')}${picker('chapter-' + ch(), chapters()[ch()][2])}${link('sound-library', 'Compose this chapter’s Sound Tale', 'sound')}`;
    if (i === 3)
      return `<div class="da-option-grid">${[
        ['Visual Tale', 'film-detail', 'tale-chapters'],
        ['Sound Tale', 'm:landscape', 'sound-library'],
      ]
        .map(
          ([t, a, id]) =>
            `<a href="#view/${H.go(id)}/${id}" class="imagecard">${shot(a, t)}<div class="caption"><h3>${t}</h3><p>One connected story</p></div></a>`
        )
        .join(
          ''
        )}</div><h3>One head for every pole.</h3><p>Assign the contribution, receive the head’s review, then assemble the proposal.</p>${link('tale-team', 'Assign & review contributions', 'people')}<div class="da-people-grid">${M.poles
        .map((p) => {
          const t = M.task(s(), p.id);
          return `<button data-da-action="open-pole" data-pole="${p.id}">${shot(p.asset, p.name)}<strong>${p.name}</strong><small>${esc(t.owner || 'Contributor to appoint')}</small><small>Head: ${esc(H.roles[t.head] || t.head)}</small>${badge(t.status, t.status === 'Approved for proposal' ? 'ok' : 'pending')}</button>`;
        })
        .join('')}</div>`;
    if (i === 4)
      return `<h3>Creative Studio ↔ Flower ↔ Bloom.</h3><p>The local scouting return informs the frame, the people, access and cost before the creative lock.</p>${field('tale-feasibility', 'Scouting / feasibility return', '', 'textarea')}${field('da-access', 'Site access & recording restrictions', 'Permissions and daylight window to confirm.', 'textarea')}${check('tale-scout', 'Scouting and feasibility reviewed')}${check('tale-cost', 'Budget reviewed by Bee')}${check('tale-charter', 'Charter modules assigned')}<div class="toolbar">${link('co-creation', 'Frames & scouting', 'pin')}${link('actor-ledger', 'Costs & allocations', 'chart')}${link('tale-team', 'Request a production return', 'people')}</div>${field('da-brand-comment', 'Brand’s questions for the proposal', '', 'textarea')}<p>Budget approval belongs to Bee. These controls record a local review exercise.</p>`;
    if (i === 5)
      return `${chapterList()}<h3>${esc(title(ch()))}</h3>${field('da-call-' + ch(), 'Production window / call', 'Daylight and access to confirm')}${field('da-board-note-' + ch(), 'Chapter production notes', '', 'textarea')}<div class="da-boards">${['Atmosphere', 'Key scene', 'Details & textures', 'Behind the scene'].map((n, j) => `<div>${photo('board-' + ch() + '-' + j, ['m:frame-arch', 'fitting', 'film-detail', 'on-set'][j], n)}<small>${j + 1}. ${n}</small>${field('da-board-' + ch() + '-' + j, n + ' / direction', '', 'textarea')}${picker('board-' + ch() + '-' + j, ['m:frame-arch', 'fitting', 'film-detail', 'on-set'][j])}</div>`).join('')}</div>${link('co-creation', 'Connect scouting & frames', 'pin')}${link('sound-library', 'Chapter sound & local artists', 'sound')}`;
    if (i === 6) {
      const summary = window.BeeLabelModel.summary(s());
      return `<h3>A creation that creates lasting value.</h3><div class="da-value-flow">${[
        ['bee', 'Bee ecosystem'],
        ['leaf', 'Conscious creation'],
        ['chart', 'Documented value'],
      ]
        .map(([ic, t]) => `<span>${icon(ic)}${t}</span>`)
        .join(
          ''
        )}</div><div class="da-pillar-links">${link('label-social', 'People / social', 'people')}${link('label-environment', 'Planet / environment', 'leaf')}${link('label-economic', 'Place / economy', 'chart')}</div>${field('tale-claim', 'Brand-facing claim', '', 'textarea')}${field('da-creative-return', 'Creative return / intended value', 'Original works, usable formats, agreed usage and campaign objectives.', 'textarea')}${field('da-operational-return', 'Operational return / intended value', 'Shared infrastructure and documented costs.', 'textarea')}${field('da-impact-return', 'Impact return / proposed action', 'Local partner priorities, agreed contribution and evidence to collect.', 'textarea')}<div class="notice">${summary.documented}/${summary.total} criteria documented in this exercise. No certificate issued. A target is not an achieved result.</div>${link('brand-value', 'Inspect calculations & assumptions', 'chart')}${link('bee-certified', 'Label & supporting evidence', 'bee')}`;
    }
    const blocked = M.blockers(s());
    return `<h3>Review the complete story.</h3><div class="da-status-grid"><span>Heads<strong>${M.poles.filter((p) => M.task(s(), p.id).status === 'Approved for proposal').length}/${M.poles.length}</strong></span><span>Bee<strong>${v('da-bee-approved', false) ? 'Reviewed' : 'Pending'}</strong></span><span>Brand<strong>${v('da-brand-approved', false) ? 'Reviewed' : 'Pending'}</strong></span></div><details ${blocked.length ? 'open' : ''}><summary>${blocked.length} items before Bee review</summary><ul>${blocked.map((x) => `<li>${esc(x)}</li>`).join('') || '<li>The required contributions are complete in this exercise.</li>'}</ul></details>${field('da-review-note', 'Revision request / decision note', '', 'textarea')}<div class="toolbar">${act('proposal-submit', 'Submit proposal to Bee', 'arrow', M.lead(role()) ? '' : 'disabled')}${act('proposal-bee', 'Approve as Bee', 'check', role() === 'bee' ? '' : 'disabled')}${act('proposal-brand', 'Approve as brand', 'check', role() === 'brand' ? '' : 'disabled')}${act('proposal-return', 'Request a revision', 'back', ['bee', 'brand'].includes(role()) ? '' : 'disabled')}</div><h3>Presentation & handoff.</h3><p>Export the current story, every chapter and the reviewed contributions. The document remains a clearly marked draft.</p>${act('export', 'Download presentation', 'download')}${act('export-data', 'Download workspace data', 'doc')}${link('asset-passport', 'Distribution rights & provenance', 'shield')}<div class="notice">Bee reviews before the brand. Editing the proposal or an attached contribution reopens approval. No proposal is sent to a client from this workspace.</div>`;
  }
  function render() {
    const i = stage(),
      team = H.current().id === 'tale-team',
      mode = team
        ? 'Collaborate'
        : v('da-ui-mode', 'Create') === 'Preview'
          ? 'Preview'
          : H.current().id === 'tale-export'
            ? 'Export'
            : 'Create';
    return `<div class="da-workspace">${nav(team ? -1 : i)}<div class="da-main"><header class="da-top"><div><small>CREATIVE STUDIO / ${esc(v('tale-brand'))}</small><strong>${team ? 'Team contributions' : 'Visual Tale Proposal'}</strong></div><div>${act('export', 'Export proposal', 'download')}</div></header><div class="da-tabs" role="tablist" aria-label="Proposal workspace mode">${['Create', 'Collaborate', 'Preview', 'Export'].map((t) => `<button data-da-action="mode" data-mode="${t}" role="tab" aria-selected="${(team ? 'Collaborate' : mode) === t}">${t}</button>`).join('')}<small>Saved on this device · revision ${v('da-revision', 1)}</small></div>${team || mode === 'Collaborate' ? `<section class="da-team paper"><div class="da-section-heading"><div><small>DELEGATE · CREATE · REVIEW</small><h2>The team makes the Tale.</h2></div>${link('tale-hive', 'Creative Hive', 'back')}</div>${tasks()}</section>` : `<div class="da-editor ${mode === 'Preview' ? 'da-preview-only' : i === 3 ? 'da-full' : ''}"><section class="da-form paper" ${mode === 'Preview' ? 'hidden' : ''}><div class="da-section-heading"><h2><span>${String(i + 1).padStart(2, '0')}</span>${names[i]}</h2><small>${i + 1} / 8</small></div>${content(mode === 'Export' ? 7 : i)}</section><section class="da-preview-column" ${i === 3 && mode !== 'Preview' ? 'hidden' : ' '}><div class="da-preview-controls"><span>Page ${i + 1} / ${names[i]}</span><div>${act('preview-width', 'Desktop', 'image', 'data-width="desktop"')}${act('preview-width', 'Mobile', 'doc', 'data-width="mobile"')}</div></div><div id="da-preview-host" class="${v('da-ui-width', 'desktop') === 'mobile' ? 'da-narrow' : ''}">${preview(i)}</div><small>Live proposal preview · text and image selections follow the editor.</small></section></div>`}${thumbRail(i)}<details class="da-source"><summary>Original EUGE DA reference</summary><img src="/review/da-oct15/references/${refs[i]}.webp" alt="Original Drive UI reference for ${names[i]}"><a href="https://drive.google.com/file/d/${refs[i]}/view" target="_blank" rel="noopener noreferrer">Open reference</a> · <a href="https://drive.google.com/file/d/10JSlNO5Biz310qFoqlcPre0z9EVjPeS3/view" target="_blank" rel="noopener noreferrer">SATYA presentation / source</a></details></div></div>`;
  }
  function exportPresentation() {
    const sections = ids
      .map(
        (id, i) =>
          `<section><header>${esc(v('tale-brand'))} / ${esc(v('tale-destination'))}<span>${i + 1} / 8 · PROPOSAL SECTION</span></header><h1>${names[i]}</h1>${i === 0 ? `<h2>${esc(v('tale-title'))}</h2>` : ''}${photo('cover', assets[i], names[i])}<div>${
            i === 0
              ? `<p>${esc(v('tale-intention'))}</p><p>${esc(v('tale-keywords'))}</p><p>${esc(v('da-season'))}</p><p>Planned deliverables: ${[
                  'tale-photo',
                  'tale-sound',
                  'tale-bts',
                  'da-editorial',
                  'da-social-assets',
                ]
                  .filter((k) => v(k, false))
                  .map(
                    (k) =>
                      ({
                        'tale-photo': 'Visual Tale / photography',
                        'tale-sound': 'Sound Tale',
                        'tale-bts': 'Behind the scenes',
                        'da-editorial': 'Editorial content',
                        'da-social-assets': 'Social media assets',
                      })[k]
                  )
                  .join(' · ')}</p>`
              : i === 1
                ? [
                    'vision-brand',
                    'vision-bee',
                    'vision-social',
                    'vision-environment',
                    'vision-economy',
                  ]
                    .map((k) => `<p>${esc(v(k))}</p>`)
                    .join('')
                : i === 2 || i === 5
                  ? order()
                      .map(
                        (n) =>
                          `<article><h2>${esc(title(n))}</h2>${photo('chapter-' + n, chapters()[n][2], title(n))}<p>${esc(locationName(n))}</p><p>${esc(v('chapter-note-' + n, 'Narrative to refine.'))}</p>${i === 5 ? [0, 1, 2, 3].map((j) => `<div class="export-board">${photo('board-' + n + '-' + j, ['m:frame-arch', 'fitting', 'film-detail', 'on-set'][j], 'Bloomboard')}<p>${['Atmosphere', 'Key scene', 'Details & textures', 'Behind the scene'][j]}: ${esc(v('da-board-' + n + '-' + j, 'To define'))}</p></div>`).join('') : ''}</article>`
                      )
                      .join('')
                  : i === 3
                    ? M.poles
                        .map((p) => {
                          const t = M.task(s(), p.id);
                          return `<article><h2>${p.name}</h2><p>${esc(t.owner || 'To appoint')} · ${esc(t.status)}</p><p>${esc(t.content || t.brief)}</p><p>Reference: ${esc(t.evidence || 'Pending')}</p></article>`;
                        })
                        .join('')
                    : i === 4
                      ? `<p>${esc(v('tale-feasibility'))}</p><p>${esc(v('da-access', 'Permissions to confirm'))}</p>`
                      : i === 6
                        ? [
                            'tale-claim',
                            'da-creative-return',
                            'da-operational-return',
                            'da-impact-return',
                          ]
                            .map((k) => `<p>${esc(v(k, 'Proposed value to document.'))}</p>`)
                            .join('')
                        : `<h2>Revision ${v('da-revision', 1)}</h2><p>Bee: ${v('da-bee-approved', false) ? 'reviewed in exercise' : 'pending'} / Brand: ${v('da-brand-approved', false) ? 'reviewed in exercise' : 'pending'}</p><p>${esc(v('da-review-note'))}</p><p>Provenance, credits, permissions, territory, channels and term require a documented rights agreement.</p>`
          }</div><footer>LOCAL DRAFT · AI / REFERENCE VISUALS · NO REAL APPROVAL, CERTIFICATION OR VERIFIED IMPACT CLAIM</footer></section>`
      )
      .join('');
    const body = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(v('tale-title'))} / draft proposal</title><style>body{margin:0;color:#23414a;background:#f5f0e7;font:16px/1.7 Arial}section{max-width:1100px;padding:50px;margin:auto;break-before:page;overflow:hidden}header,footer{font-size:10px;letter-spacing:2px}header span{float:right}h1{font:48px Georgia}h2{font:30px Georgia}section>img{width:38%;float:right;margin:0 0 25px 30px}article{break-inside:avoid;margin:20px 0;overflow:hidden}article img{width:160px;float:left;margin:0 20px 10px 0}.export-board{clear:both;overflow:hidden;break-inside:avoid;margin:15px 0}.export-board img{width:140px}p{white-space:pre-line}footer{clear:both;padding-top:30px}button{margin:20px;padding:12px}@media print{button{display:none}section{padding:15mm}body{background:white}}@media(max-width:600px){section{padding:24px}section>img{float:none;width:100%;margin:0}h1{font-size:34px}}</style><button onclick="window.print()">Print / save as PDF</button>${sections}</html>`;
    H.download(
      'beeyond-proposal-draft.html',
      body.replace(/src="\/(?!\/)/g, `src="${location.origin}/`),
      'text/html'
    );
  }
  function refreshPreview() {
    const p = document.querySelector('#da-preview-host');
    if (p) p.innerHTML = preview(stage());
  }
  function handle(target) {
    const d = target.dataset,
      a = d.daAction;
    if (!a) return false;
    let error = null;
    if (a === 'mode') {
      s()['da-ui-mode'] = d.mode;
      if (d.mode === 'Collaborate') location.hash = '#view/' + H.go('tale-team') + '/tale-team';
      else if (d.mode === 'Export') location.hash = '#view/' + H.go('tale-export') + '/tale-export';
      else if (H.current().id === 'tale-team')
        location.hash = '#view/' + H.go('tale-brief') + '/tale-brief';
    } else if (a === 'preview-width') s()['da-ui-width'] = d.width;
    else if (a === 'pole') s()['da-selected-pole'] = d.pole;
    else if (a === 'open-pole') {
      s()['da-selected-pole'] = d.pole;
      location.hash = '#view/' + H.go('tale-team') + '/tale-team';
    } else if (a === 'chapter') s().chapter = Number(d.index);
    else if (a === 'export') {
      exportPresentation();
      return true;
    } else if (a === 'export-data') {
      H.download(
        'beeyond-proposal-workspace-draft.json',
        JSON.stringify(
          {
            type: 'local-proposal-exercise',
            realApproval: false,
            revision: v('da-revision', 1),
            state: Object.fromEntries(
              Object.entries(s()).filter(([k]) => /^(da-|tale-|vision-|chapter-)/.test(k))
            ),
            chapters: chapters(),
          },
          null,
          2
        )
      );
      return true;
    } else if (a.startsWith('task-')) error = M.transition(s(), d.pole, a.slice(5), role());
    else if (a.startsWith('proposal-')) error = M.decide(s(), a.slice(9), role());
    else {
      if (!M.lead(role())) {
        H.toast('La direction artistique prépare la structure de la proposition.');
        return true;
      }
      if (a === 'image' || a === 'reset-image') {
        delete s()['da-upload-' + d.key];
        M.edit(s(), 'da-visual-' + d.key, d.asset);
      }
      if (a === 'add-chapter') {
        if (chapters().length >= 12) {
          H.toast('Douze chapitres maximum pour cet atelier.');
          return true;
        }
        const entry = ['New chapter', 'Location to confirm', 'm:landscape'];
        chapters().push(entry);
        s()['da-extra-chapters'] = chapters().slice(3);
        s().chapter = chapters().length - 1;
        M.invalidate(s());
      }
      if (a === 'move-up' || a === 'move-down') {
        const o = order(),
          i = o.indexOf(ch()),
          j = i + (a === 'move-up' ? -1 : 1);
        if (j >= 0 && j < o.length) {
          [o[i], o[j]] = [o[j], o[i]];
          s()['da-chapter-order'] = o;
          M.invalidate(s());
        }
      }
    }
    H.save();
    H.draw();
    if (error) H.toast(error);
    return true;
  }
  function input(t) {
    if (!t.dataset.daField) return false;
    if (!can(t.dataset.daField)) return true;
    M.edit(s(), t.dataset.daField, t.type === 'checkbox' ? t.checked : t.value);
    H.save();
    refreshPreview();
    return true;
  }
  async function change(t) {
    if (t.dataset.daField) {
      if (t.type === 'checkbox' || t.tagName === 'SELECT') H.draw();
      return true;
    }
    if (!t.dataset.daUpload) return false;
    if (!M.lead(role())) return true;
    const f = t.files?.[0];
    if (!f) return true;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type) || f.size > 8 * 1024 * 1024) {
      H.toast('Choisissez une image JPEG, PNG ou WebP de moins de 8 Mo.');
      return true;
    }
    try {
      const bitmap = await createImageBitmap(f),
        ratio = Math.min(1, 1000 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
      canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
      canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      const data = canvas.toDataURL('image/jpeg', 0.78),
        key = 'da-upload-' + t.dataset.daUpload;
      const total =
        Object.entries(s())
          .filter(([k]) => k.startsWith('da-upload-') && k !== key)
          .reduce((n, [, x]) => n + String(x).length, 0) + data.length;
      if (total > 2_500_000) {
        H.toast(
          'La limite locale de références est atteinte. Remplacez une image ou utilisez un asset du voyage.'
        );
        return true;
      }
      M.edit(s(), key, data);
      H.save();
      H.draw();
      H.toast('Référence ajoutée à cet appareil. Son origine et ses droits restent à documenter.');
    } catch {
      H.toast('Cette image ne peut pas être lue. Essayez une autre image.');
    }
    return true;
  }
  function rights() {
    return `<div class="panel paper space"><div class="kicker">DISTRIBUTION RIGHTS / PART OF THE PASSPORT</div><h3>Where, how and for how long?</h3><p>The passport brings provenance and usage permissions together. It records the agreement; it does not replace it.</p><div class="grid2">${field('da-rights-holder', 'Rights holder / licensor', 'To confirm')}${field('da-rights-asset', 'Asset / master version', 'CM-CH01-v03 / exercise')}${field('da-rights-territory', 'Territories', 'To agree')}${field('da-rights-channels', 'Channels / media', 'To agree')}${field('da-rights-start', 'Licence starts', '', 'date')}${field('da-rights-end', 'Licence ends', '', 'date')}</div>${field('da-rights-restrictions', 'Exclusivity, restrictions and adaptation', 'Not cleared for external use.', 'textarea')}${field('da-rights-document', 'Signed rights agreement / reference', '')}${field('da-rights-credits', 'Required credits', 'Contributors to confirm')}${link('tale-export', 'Return to proposal review', 'back')}</div>`;
  }
  const related = () =>
    ids.includes(H.current().id) || H.current().id === 'tale-team'
      ? ''
      : `<div class="panel space"><div class="kicker">CONNECTED TO THE PROPOSAL</div>${link('tale-team', 'My contribution & head review', 'people')}${link('tale-brief', 'Create the brand proposal', 'doc')}</div>`;
  return {
    render,
    handle,
    input,
    change,
    rights,
    related,
    exportPresentation,
    source: Object.fromEntries(ids.map((id, i) => [id, refs[i]])),
  };
};
