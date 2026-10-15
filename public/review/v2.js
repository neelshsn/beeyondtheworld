/* Horizon review surfaces. Scenario edits stay local; shared reviewer notes use feedback.js. */
(() => {
  'use strict';
  const esc = (s) =>
    String(s ?? '').replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
    );
  const A = '/review/carry-light/assets/',
    H = '/assets/community/horizon/morocco-';
  const img = (n) =>
    n === 'beauty-origin'
      ? '/review/oct15/beauty-origin.webp'
      : n.startsWith('m:')
        ? H + n.slice(2) + '.webp'
        : A + n + '.webp';
  const paths = {
    bee: 'M12 8v12m-4-7h8M9 8 6 4m9 4 3-4M9 10C2-2-4 11 7 13m8-3c7-12 13 1 2 3M9 16h6M10 20h4',
    leaf: 'M4 20C4 7 12 4 21 3c0 12-6 18-14 14m0 0L17 7',
    pin: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM9 10a3 3 0 1 0 6 0 3 3 0 1 0-6 0',
    people:
      'M3 21v-3c0-5 12-5 12 0v3M6 7a3 3 0 1 0 6 0 3 3 0 1 0-6 0m10 5c4 0 5 2 5 5v4M17 4c4 0 4 6 0 6',
    sound: 'M3 10v4m4-8v12m5-16v20m5-16v12m4-8v4',
    arrow: 'M4 12h16m-6-6 6 6-6 6',
    back: 'M20 12H4m6-6-6 6 6 6',
    plus: 'M12 4v16M4 12h16',
    check: 'm5 12 4 4L20 5',
    shield: 'M12 2 3 6v7c0 6 9 9 9 9s9-3 9-9V6Zm-5 10 3 3 7-7',
    image: 'M3 3h18v18H3Zm0 13 5-5 5 5 3-3 5 5M15 6h3v3h-3Z',
    link: 'm8 16 8-8M7 13l-2 2a4 4 0 0 0 6 6l3-3M10 6l3-3a4 4 0 0 1 6 6l-2 2',
    hanger: 'M9 5a3 3 0 1 1 6 0c0 2-3 2-3 4L2 18h20L12 9',
    camera: 'M3 6h5l2-3h4l2 3h5v14H3Zm5 7a4 4 0 1 0 8 0 4 4 0 1 0-8 0',
    film: 'M3 4h18v16H3ZM3 8h18M7 4v4m5-4v4m5-4v4m-7 3 5 3-5 3Z',
    box: 'm12 2 10 5v10l-10 5L2 17V7Zm0 10v10M2 7l10 5 10-5M7 4l10 5',
    chart: 'M4 21V12h4v9m3 0V7h4v14m3 0V2h4v19',
    doc: 'M5 2h9l5 5v15H5Zm9 0v6h5M8 12h8m-8 4h8',
    sun: 'M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2M7 12a5 5 0 1 0 10 0 5 5 0 1 0-10 0',
    clock: 'M12 8v5l4 2M2 12a10 10 0 1 0 20 0 10 10 0 1 0-20 0',
    download: 'M12 3v12m-5-5 5 5 5-5M4 15v6h16v-6',
    beauty: 'M7 21V10h10v11Zm2-11V5l6-3v8M6 21h12',
    refresh: 'M4 7a9 9 0 0 1 16 3m0-6v6h-6M20 17a9 9 0 0 1-16-3m0 6v-6h6',
  };
  const icon = (n) =>
    `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[n] || paths.doc}"/></svg>`;
  let local = {};
  try {
    local = JSON.parse(localStorage.getItem('bee-review-oct15-scenario-v1') || '{}');
  } catch {}
  let current = null,
    host = null,
    baseline = false,
    audioURL = null;
  const tabs = {};
  const save = () => {
    try {
      localStorage.setItem('bee-review-oct15-scenario-v1', JSON.stringify(local));
    } catch {
      toast('Le navigateur ne permet pas de conserver cet essai.');
    }
  };
  const value = (key, fallback) => local[key] ?? fallback;
  const editable = () =>
    !['brand', 'expert', 'model'].includes(current.role) ||
    (current.role === 'expert' && ['validation', 'commitments'].includes(current.v2)) ||
    (['brand', 'model'].includes(current.role) && current.v2 === 'commitments') ||
    (current.role === 'brand' && ['tale-brief', 'tale-visions'].includes(current.id));
  const field = (key, label, fallback = '', kind = 'text', options) =>
    `<div class="field"><label for="v-${key}">${esc(label)}</label>${kind === 'textarea' ? `<textarea id="v-${key}" data-field="${key}" ${editable() ? '' : 'readonly'}>${esc(value(key, fallback))}</textarea>` : kind === 'select' ? `<select id="v-${key}" data-field="${key}" ${editable() ? '' : 'disabled'}>${options.map((x) => `<option ${value(key, fallback) === x ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select>` : `<input id="v-${key}" data-field="${key}" type="${kind}" value="${esc(value(key, fallback))}" ${editable() ? '' : 'readonly'} ${kind === 'number' ? 'min="0" step="any"' : ''}>`}</div>`;
  const check = (key, label, checked = false) =>
    `<label class="check"><input type="checkbox" data-field="${key}" ${value(key, checked) ? 'checked' : ''} ${editable() ? '' : 'disabled'}>${esc(label)}</label>`;
  const badge = (s, c = 'pending') =>
    `<span class="badge ${c}">${icon(c === 'ok' ? 'check' : 'clock')}${esc(s)}</span>`;
  const button = (action, label, ic = 'arrow', gold = false, extra = '') =>
    `<button type="button" data-action="${action}" class="${gold ? 'gold' : ''}" ${extra}>${icon(ic)}${esc(label)}</button>`;
  const go = (id, preferred) => {
    const D = window.BEE_REVIEW_DATA;
    return (
      D.pages.find((p) => p.id === id && p.role === current.role)?.role ||
      D.pages.find((p) => p.id === id && p.role === preferred)?.role ||
      D.pages.find((p) => p.id === id)?.role ||
      'bee'
    );
  };
  const link = (id, label, ic = 'arrow', preferred) =>
    `<a class="vbutton" href="#view/${go(id, preferred)}/${id}">${icon(ic)}${esc(label)}</a>`;
  const shot = (asset, alt, cls = '') =>
    `<img class="image ${cls}" src="${img(asset)}" alt="${esc(alt)} · concept IA" loading="eager">`;
  const card = (asset, title, sub, id, preferred) =>
    `<a class="imagecard" href="#view/${go(id, preferred)}/${id}">${shot(asset, title)}<div class="caption"><h3>${esc(title)}</h3><p>${esc(sub)}</p></div></a>`;
  const mini = (asset, title, sub, id) =>
    `<div class="mini">${shot(asset, title)}<div><strong>${esc(title)}</strong><small>${esc(sub)}</small></div>${link(id, 'Open')}</div>`;
  const stat = (label, n, note) =>
    `<div><small>${esc(label)}</small><strong>${esc(n)}</strong><small>${esc(note)}</small></div>`;
  const connections = (items) =>
    `<div class="connections"><small>Connected to this moment</small>${items.map(([id, name, role]) => link(id, name, 'link', role)).join('')}</div>`;
  const sourceMap = {
    label: ['1d63un6FCWYGZ-W9IdvxQyXcqfjxl-QjT', '16JgKrnlOXPYMxdH-yvrk8IS25-P2kled'],
    beauty: ['1tm2U0uxe42XK7UqG3taDeY9nEKu8_jr9', '1KLAf6f6_04jGNG7pRXQNp4LwUxqwuDP0'],
    'beauty-origin': ['1WeTZB2bUw1tXFSapSHVAOM8MdqjBA-Aj'],
    styling: ['1Ny8yS6ZM8QGQa4O-Dr6BLIH7PSVCWPw7', '1TlwVSYp2ePRHWCYWLEWQInW-wWfUKWmQ'],
    set: ['1AnpxOTzz4tTXrZfGx3JdgtS6ZCa7nlHY'],
    'set-detail': ['1Qtw5abAeolkaDnOFK55hu9QhYrYOpzmf'],
    sound: ['1XJIJ26z-bvsFmB2eMoXV5lRgqoJfyUlc'],
    'sound-map': ['1d1A2g1WJkTsikRYKBiePCFXK5wuE0qLj'],
    auth: ['1e6DXzleeLJGsn6QcIzB_Jv3Xzn2kBrGA'],
    passport: ['1e6DXzleeLJGsn6QcIzB_Jv3Xzn2kBrGA'],
    metrics: ['10JSlNO5Biz310qFoqlcPre0z9EVjPeS3', '14oC3bgAzPXWo1BXWCq8xYJo06hDNafiS'],
    trace: ['1E8pPkDEY6hv2J6_bbYdkmr1ptdyw9R-m'],
    ledger: ['1hbEjg00dpt1c5-Lb9_ZYsTVIm3IpZAQP'],
    impact: ['1w3hWblaGVG237qqjfkBCJ_dT61Ex_--P'],
    tale: ['10JSlNO5Biz310qFoqlcPre0z9EVjPeS3'],
    post: ['1Fs2EkpwfCj4Fekg6ovumM5nZ9xBvxm0d'],
    map: ['1CA2BNAI8BOQ7rQitcTYDElpDlZouzJ5r'],
    bridge: ['1CA2BNAI8BOQ7rQitcTYDElpDlZouzJ5r'],
    validation: ['1G-geBtHgevqyDVFni-ZvNrpuLOH1sOkl'],
    commitments: ['1UJnfC56g5oyQ6-Qd4LLgbCT73ZqC4fMb'],
  };
  const roleNames = {
    brand: 'Brand',
    bee: 'Bee Coordination',
    art: 'Art Director',
    production: 'Production Director',
    stylist: 'Head of Stylism',
    beauty: 'Head of Beauty',
    set: 'Head of Set Design',
    sound: 'Head of Sound',
    photo: 'Photographer',
    film: 'Film Director',
    editor: 'Postproduction',
    model: 'Talent',
    ngo: 'Local Impact Partner',
    expert: 'Independent Reviewer',
  };
  const rolePurpose = {
    brand: 'Review the intention, approve after Bee and read the evidence.',
    bee: 'Orchestrate the shared journey, budget, charter and approvals.',
    art: 'Connect the visual intention to people, place and materials.',
    production: 'Connect creative choices to feasibility, bookings and field evidence.',
    stylist: 'Connect looks to designers, fittings, frames and circular use.',
    beauty: 'Connect palettes and textures to looks, local products and documented origins.',
    set: 'Connect each scene to its maker, materials and next use.',
    sound: 'Connect each chapter to field recordings, authorship and music rights.',
    photo: 'Capture the frames and preserve originals, credits and metadata.',
    film: 'Connect the treatment, chapters, footage and sound sources.',
    editor: 'Keep versions, derivatives, rights and approval history connected.',
    model: 'See your looks, fittings, calls and consent requirements.',
    ngo: 'Design local actions and document the allocated Impact Capital.',
    expert: 'Review assigned indicators, evidence and provenance by risk.',
  };
  const subs = (key, labels) =>
    `<div class="tabs" role="tablist" aria-label="${esc(key)}">${labels.map((x, i) => `<button role="tab" aria-selected="${(tabs[key] ?? 0) === i}" data-tab="${key}" data-index="${i}">${esc(x)}</button>`).join('')}</div>`;
  const palette = [
    ['Nude', '#c8a18c'],
    ['Earth', '#a56d49'],
    ['Rose', '#bd7769'],
    ['Terracotta', '#aa5439'],
    ['Berry', '#955966'],
    ['Deep', '#5b3934'],
  ];
  const chapters = [
    ['The first light', 'Courtyard', 'm:frame-arch'],
    ['Earth in motion', 'Olive grove', 'film-detail'],
    ['What remains', 'Terrace', 'm:frame-shadow'],
  ];
  const chapter = () => Math.max(0, Number(value('chapter', 0)) || 0) % chapters.length;
  const chapterStrip = () =>
    `<div class="chapter-list">${chapters.map(([t, l, a], i) => `<button data-chapter="${i}" aria-pressed="${chapter() === i}">${shot(a, t)}<span><small>CHAPTER ${String(i + 1).padStart(2, '0')}</small><br>${esc(t)}<br><small>${esc(l)}</small></span></button>`).join('')}</div>`;
  const charterRows = [
    ['Creative integrity', 'Art Director', 'Source, rights, originals', 'authenticator', 'image'],
    [
      'Conscious wardrobe',
      'Stylist',
      'Loans, local designers, returns',
      'designer-network',
      'hanger',
    ],
    ['Conscious beauty', 'Beauty', 'Products, origin, hygiene, refill', 'beauty-origin', 'beauty'],
    ['Circular art & craft', 'Set Designer', 'Materials, makers, second life', 'set-detail', 'box'],
    ['Organic sound tales', 'Sound', 'Recordings, authorship, rights', 'sound-map', 'sound'],
    ['Production & territory', 'Production', 'Bookings, invoices, footprint', 'label-bloom', 'pin'],
  ];
  function mapView() {
    return `<div class="flow"><a class="diagram-node" href="#view/${go('label-creative')}/label-creative">${icon('bee')}<h3>Creative Hive</h3><p>DA · Styling · Beauty · Set · Sound<br>Photo · Film · Talent · Post</p><small>One intention. Shared creative objects.</small></a><a class="diagram-node" href="#view/${go('co-creation')}/co-creation">${icon('link')}<h3>Co-creation</h3><p>Scouting · Feasibility · Local sourcing<br>Brief ↔ frames ↔ cost</p><small>Bee and Flower work together here.</small></a><a class="diagram-node" href="#view/${go('label-bloom')}/label-bloom">${icon('pin')}<h3>Production Bloom</h3><p>Local crew · Travel · Stay · Catering<br>Equipment · Materials · Waste</p><small>Turn the approved vision into reality.</small></a></div><div class="arrowline">${icon('arrow')} One project · one history · role-specific views</div><div class="grid2"><div class="panel"><div class="kicker">Production quality</div><h3>The Bee Label</h3><p>Charter → commitments → metrics → evidence → verification.</p>${link('my-commitments', 'My commitments', 'shield')}${link('authenticator', 'Source provenance', 'image')}</div><div class="panel"><div class="kicker">Partner-led action</div><h3>Impact Capital</h3><p>Co-intention → allocation → field action → evidence → outcomes.</p>${link('impact-pillars', 'Social · Environment · Economy', 'leaf', 'ngo')}</div></div><div class="arrowline">${icon('arrow')} Separate evidence streams, one brand report</div><div class="grid3">${[
      ['Creative return', 'Assets, usage rights, engagement', 'camera'],
      ['Operational return', 'Shared costs, local spend, resources', 'chart'],
      ['Impact return', 'Documented actions and verified outcomes', 'leaf'],
    ]
      .map(
        ([t, s, i]) =>
          `<a class="diagram-node" href="#view/${go('brand-value')}/brand-value">${icon(i)}<h3>${t}</h3><p>${s}</p></a>`
      )
      .join(
        ''
      )}</div><div class="notice">Un même objet circule entre les métiers : un chapitre contient des lieux, des frames, des looks, du beauty, un décor et du son. Chaque objet conserve son auteur, sa version, ses droits et ses preuves.</div>${connections(
      [
        ['tale-brief', 'Start with the brand brief'],
        ['co-creation', 'Explore the scouting bridge'],
        ['actor-ledger', 'Follow every contribution'],
        ['validation-desk', 'Review the evidence'],
      ]
    )}`;
  }
  const polesCreative = [
    ['Casting & talent', 'm:talent', 'people', 'my-commitments', 'Consent & fair terms'],
    ['Visual upcycling', 'film-detail', 'image', 'authenticator', 'Originals & source rights'],
    ['Makeup & hair', 'beauty-origin', 'beauty', 'beauty-library', 'Natural claims need proof'],
    ['Styling & designers', 'fitting', 'hanger', 'designer-network', 'Loans & local credit'],
    ['Photography', 'm:frame-fashion-wide', 'camera', 'asset-passport', 'Original capture chain'],
    ['Film / direction', 'on-set', 'film', 'post-chapters', 'Footage & chapter links'],
    ['Set design & artists', 'm:craft', 'box', 'set-studio', 'Materials & second life'],
    ['Sound / creative post', 'm:landscape', 'sound', 'sound-studio', 'Recordings & usage rights'],
  ];
  const polesBloom = [
    ['Line producer', 'on-set', 'doc', 'actor-ledger', 'Daily reports'],
    ['Scout & local guides', 'm:landscape', 'pin', 'co-creation', 'Access & permits'],
    ['Transport & mobility', 'm:frame-arch', 'pin', 'actor-ledger', 'Routes & occupancy'],
    ['Accommodation', 'm:frame-shadow', 'sun', 'actor-ledger', 'Nights & local ownership'],
    ['Catering', 'm:field', 'leaf', 'actor-ledger', 'Meals & sourcing'],
    ['Local crew & suppliers', 'local-workshop', 'people', 'actor-ledger', 'Invoices & payments'],
    ['Equipment & energy', 'on-set', 'camera', 'actor-ledger', 'Sharing & consumption'],
    ['Waste & materials', 'm:craft', 'box', 'set-detail', 'Mass & destination'],
  ];
  function labelView() {
    const bloom = current.id === 'label-bloom',
      poles = bloom ? polesBloom : polesCreative;
    return `<div class="car-head"><div><h3>${bloom ? 'Territory care. Measurable operations.' : 'Local value. Measurable artistry.'}</h3><small>Select a pole to follow its commitments and evidence.</small></div><div>${button('carousel-back', 'Previous', 'back')}${button('carousel-next', 'Next', 'arrow')}</div></div><div class="carousel" data-carousel>${poles.map(([t, a, i, id, n]) => `<a class="imagecard" href="#view/${go(id)}/${id}">${shot(a, t)}<div class="caption">${icon(i)}<h3>${t}</h3><p>${n}</p><p>Evidence pending</p></div></a>`).join('')}</div><div class="label-seal"><div class="seal">${icon('bee')}BEE LABEL<small>REVIEW PENDING</small></div></div><div class="statrow">${stat('Charter modules', 8, 'Assigned by specialty')}${stat('Verified claims', '—', 'No real evidence in this scenario')}${stat('Certification', 'Pending', 'Human decision required')}${stat('Reporting', '3 pillars', 'Social · Environmental · Economic')}</div><div class="grid2"><div class="panel"><h3>From commitment to proof</h3><p>Every pole records an action, a measurable input and the evidence that supports it. The lead reviews completeness before Bee verification.</p>${link('my-commitments', 'Open my charter', 'doc')}${link('validation-desk', 'Open verification desk', 'shield')}</div><div class="panel"><h3>What the label covers</h3><p>Production quality and provenance. NGO outcomes follow a separate action and evidence register, then join Honey without being used to offset the footprint.</p>${link(bloom ? 'label-creative' : 'label-bloom', bloom ? 'Creative Studio label' : 'Bloom team label', 'link')}${link('impact-pillars', 'NGO impact register', 'leaf')}</div></div>${connections(
      [
        ['authenticator', 'Bee Authenticator'],
        ['actor-ledger', 'All actors & calculations'],
        ['brand-value', 'Brand Honey report'],
      ]
    )}`;
  }
  function beautyView() {
    const n = Number(value('palette', 0)),
      tone = palette[n];
    const t = tabs.beauty || 0;
    return `${subs('beauty-mode', ['Makeup', 'Hair'])}<div class="swatches">${palette.map(([name, color], i) => `<button class="swatch" data-palette="${i}" aria-pressed="${n === i}" style="--swatch:${color}"><i></i><span>${name.toUpperCase()}</span></button>`).join('')}</div><div class="grid2"><div><div class="heroimage">${shot(tabs['beauty-mode'] === 1 ? 'beauty-prep' : 'beauty-origin', tabs['beauty-mode'] === 1 ? 'Hair movement and preparation' : 'Mineral pigment, argan oil and rose textures')}<div class="photo-overlay"><div class="kicker">MAKEUP & HAIR · MOROCCO</div><h2>${tabs['beauty-mode'] === 1 ? 'Natural movement' : tone[0]}</h2><p>Texture. Light. A connection to place.</p></div></div><div class="caption-note">AI visual concept · no product composition or origin is certified.</div><div class="toolbar">${link('beauty-origin', 'Explore local origins', 'leaf')}${button('attach-beauty', 'Add to the creative brief', 'plus', true)}</div></div><div class="panel paper"><div class="kicker">NECTAR OF BEAUTY</div><h3>${tone[0]} / natural radiance</h3>${subs('beauty', ['Looks', 'Models', 'Locations', 'Suppliers'])}${t === 0 ? `${mini('beauty-prep', 'Look 01 / Ivory', 'Warm skin · diffuse finish · continuity photo', 'designer-network')}${mini('fitting', 'Look 02 / Rust', 'Soft terracotta · movement · sun exposure', 'designer-network')}` : t === 1 ? `${mini('m:talent', 'Camille R.', 'Fictional talent · consent & private checks', 'my-commitments')}<p>Skin sensitivities and hygiene checks belong to a restricted production record.</p>` : t === 2 ? `${mini('m:frame-arch', 'Courtyard', 'Diffuse shade · chapter 01', 'co-creation')}${mini('m:field', 'Olive grove', 'Late light · chapter 02', 'co-creation')}` : `${mini('beauty-origin', 'Atlas botanical supplier', 'Proposed fictional partner · Morocco', 'beauty-origin')}<p>Country, ingredient, batch and certificate are checked before a natural claim is shown.</p>`}<div class="space">${field('beauty-direction', 'Direction', 'A warm matte complexion, sheer rose and naturally moving hair.', 'textarea')}${field('beauty-look', 'Assigned look', 'Look 01 / Ivory', 'select', ['Look 01 / Ivory', 'Look 02 / Rust'])}</div>${badge(value('beauty-added', false) ? 'Added to draft brief' : 'Draft creative choice', 'concept')}</div></div>${connections(
      [
        ['beauty-origin', 'Ingredients & certificates'],
        ['designer-network', 'Look continuity'],
        ['co-creation', 'Light & location'],
        ['authenticator', 'Authenticate inspiration'],
        ['label-creative', 'Bee Label'],
      ]
    )}`;
  }
  function beautyOrigin() {
    return `<div class="grid2"><div><div class="heroimage tall">${shot('beauty-origin', 'Proposed natural beauty palette')}</div><div class="tiles space">${['beauty-origin', 'beauty-prep', 'm:beauty'].map((x) => shot(x, 'Beauty inspiration')).join('')}</div></div><div class="panel paper"><div class="kicker">COUNTRY SOURCING</div><h3>Beauty, rooted in ${esc(value('beauty-country', 'Morocco'))}.</h3>${field('beauty-country', 'Country', 'Morocco', 'select', ['Morocco', 'Namibia', 'Philippines'])}${field('beauty-material', 'Ingredient / texture', 'Argan oil', 'select', ['Argan oil', 'Rose water', 'Mineral pigments'])}${field('beauty-supplier', 'Supplier / brand', 'Atlas botanical supplier · fictional')}${field('beauty-region', 'Region of origin', 'Essaouira / Morocco · proposed')}${field('beauty-batch', 'Batch and product reference', 'Pending supplier documentation')}${field('beauty-cert', 'Certificate / issuer / validity', 'No certificate supplied')}${badge('Natural / organic claim not verified')}<div class="notice">Natural, organic and locally sourced are different claims. Composition, chain of custody and a valid certificate must support each applicable claim. Never infer safety from a natural origin.</div>${link('authenticator', 'Open the evidence checklist', 'shield')}${link('beauty-library', 'Return to palette', 'back')}</div></div>${connections(
      [
        ['label-creative', 'Conscious Beauty charter'],
        ['actor-ledger', 'Supplier spend'],
        ['asset-passport', 'Image rights & source'],
        ['co-creation', 'Confirm availability with production'],
      ]
    )}`;
  }
  function stylingView() {
    return `<div class="toolbar">${badge('Morocco', 'concept')}${badge('Ready-to-wear', 'concept')}${button('look-next', 'Next look', 'arrow')}${link('set-detail', 'Match with set design', 'box')}</div><div class="grid2" style="grid-template-columns:1.65fr 1fr"><div class="look-grid">${card(Number(value('look', 0)) % 2 ? 'fitting' : 'm:look-front', Number(value('look', 0)) % 2 ? 'Look 02 / Rust' : 'Look 01 / Ivory', 'Front · side · back · detail', 'styling-look2')}${card('look2-side', 'Movement', 'Continuity reference', 'styling-look2')}${card('look2-detail', 'Material', 'Product and texture', 'asset-passport')}${card('collection-kit', 'Look items', 'Collection kit / CM-01', 'brief-collection')}${card('m:craft', 'Local craft', 'Credit the hands behind the work', 'set-studio')}</div><div class="panel"><div class="kicker">LOCAL DESIGNERS</div><h3>Art of Wearing</h3>${field('designer-country', 'Country', 'Morocco', 'select', ['Morocco', 'Namibia', 'Philippines'])}${field('designer-category', 'Specialty', 'Textiles & apparel', 'select', ['Textiles & apparel', 'Accessories', 'Jewellery'])}<p>${value('designer-country', 'Morocco') === 'Morocco' ? 'Two proposed collaborators to qualify.' : 'No qualified collaborators yet for this country. Source a local designer before adding a look.'}</p>${value('designer-country', 'Morocco') === 'Morocco' ? `${mini('m:craft', 'Atlas textile atelier', 'Fictional · textile craft · Marrakech', 'set-detail')}${mini('collection-kit', 'Medina accessories studio', 'Fictional · loan pieces · Marrakech', 'asset-passport')}` : ''}${field('designer-terms', 'Collaboration', 'Borrow pieces', 'select', ['Borrow pieces', 'Rent pieces', 'Purchase', 'Custom collaboration'])}${field('designer-credit', 'Designer credit', 'Name and usage agreement to confirm')}${button('attach-designer', 'Attach to look', 'plus', true)}<p class="caption-note">Local selection is based on documented expertise and agreed terms; no invented match percentage.</p></div></div>${connections(
      [
        ['beauty-library', 'Beauty for this look'],
        ['set-detail', 'Set & props'],
        ['co-creation', 'Assign look to a frame'],
        ['authenticator', 'Inspiration & reuse rights'],
        ['actor-ledger', 'Fees and local value'],
      ]
    )}`;
  }
  function setView(detail = false) {
    return `<div class="grid2"><div><div class="heroimage tall">${shot(detail ? 'fitting' : 'm:frame-fashion-wide', 'Set concept for Carry the light')}<div class="photo-overlay"><div class="kicker">${detail ? 'LOOK 02 · CHAPTER 02' : 'MOROCCO · CREATIVE STUDIO'}</div><h2>${detail ? 'Earth in motion' : 'Paint your reality.'}</h2></div></div><div class="tiles space">${['fitting', 'm:craft', 'look2-detail', 'm:frame-arch'].map((a, i) => `<button data-set-image="${a}" aria-label="View set reference ${i + 1}">${shot(a, 'Set reference ' + (i + 1))}</button>`).join('')}</div></div><div><div class="panel"><h3>Set design & props</h3><div class="grid3 space">${['Wind fabrics', 'Ceramic vessels', 'Reused linen'].map((t, i) => `<div>${shot(['look2-detail', 'm:craft', 'collection-kit'][i], t)}<small>${t}</small></div>`).join('')}</div>${field('set-material', 'Material & provenance', '12 kg reclaimed linen; 6 borrowed ceramic vessels', 'textarea')}${field('set-maker', 'Local artist / maker', 'Atlas textile atelier · fictional')}${field('set-terms', 'Sourcing choice', 'Borrow', 'select', ['Borrow', 'Rent', 'Buy', 'Custom fabrication'])}</div><div class="panel space"><h3>After the last frame.</h3>${field('set-return', 'Second life / return destination', 'Return vessels to maker; return linen to the atelier', 'textarea')}${field('set-budget', 'Estimated EUR', 450, 'number')}<div class="toolbar">${badge('Bee budget review required')}${link('set-detail', 'Open set detail', 'box')}</div>${button('attach-set', 'Add to creative brief', 'plus', true)}</div></div></div>${connections(
      [
        ['designer-network', 'Look 02 & styling'],
        ['co-creation', 'Location access & feasibility'],
        ['authenticator', 'Source and material evidence'],
        ['label-bloom', 'Materials and waste'],
        ['actor-ledger', 'Maker fee & reuse calculation'],
      ]
    )}`;
  }
  function soundView(map = false) {
    const c = chapters[chapter()];
    return `${chapterStrip()}<div class="grid2 space"><div><div class="${map ? 'map' : 'heroimage'}">${
      map
        ? `<svg viewBox="0 0 600 300" fill="none"><path d="M40 280 Q130 60 310 210 T550 30M0 100Q230 290 600 70" stroke="#eddbad" stroke-width="2" stroke-dasharray="5 6"/></svg>${[
            ['Courtyard', 28, 40],
            ['Olive grove', 58, 64],
            ['Terrace', 78, 29],
          ]
            .map(
              ([t, x, y], i) =>
                `<button style="--x:${x}%;--y:${y}%" data-chapter="${i}">${icon('pin')}${t}</button>`
            )
            .join(
              ''
            )}<span class="map-label">SCHEMATIC MAP · approximate demonstration locations</span>`
        : `${shot(c[2], c[0])}<div class="photo-overlay"><div class="kicker">CHAPTER ${chapter() + 1}</div><h2>${c[0]}</h2><p>${c[1]} · art direction linked to every sound.</p></div>`
    }</div><div class="panel space"><div class="kicker">ORGANIC SOUND LIBRARY</div><h3>${['Wind through the courtyard', 'Olive leaves in motion', 'Steps on mineral ground'][chapter()]}</h3><div class="wave space" aria-label="Illustrative waveform, no recording supplied">${Array.from({ length: 56 }, (_, i) => `<i style="--h:${8 + Math.abs(Math.sin(i * 1.8)) * 40}px"></i>`).join('')}</div><p class="caption-note">Waveform illustration. No field recording has been supplied. Load an audio file locally to audition it.</p><audio controls ${audioURL ? 'src="' + audioURL + '"' : ''} aria-label="Local audio audition"></audio><label for="sound-file">Audition audio locally</label><input id="sound-file" type="file" accept="audio/*"><small>Audio stays in this browser tab. Use the feedback fields below to share comments and images.</small></div></div><div class="panel paper"><div class="kicker">BRIEF → CHAPTER → SOURCE → MASTER</div><h3>The sound of this place.</h3>${field('sound-brief-' + chapter(), 'DA brief', c[0] + ' / tactile, intimate, spacious; leave room for the visual rhythm.', 'textarea')}${field('sound-creator', 'Composer / recordist', 'Local sound artist · to appoint')}${field('sound-origin', 'Source provenance', 'Field recording', 'select', ['Field recording', 'Original composition', 'Licensed source', 'AI / synthetic', 'Unknown'])}${field('sound-gps-' + chapter(), 'Capture location / coordinates', ['Courtyard · 31.426, -7.881 · approximate', 'Olive grove · 31.432, -7.872 · approximate', 'Terrace · 31.438, -7.863 · approximate'][chapter()])}${field('sound-rights', 'Rights / consent / territory', 'Master and composition rights pending; consent required for identifiable voices', 'textarea')}<div class="grid2">${field('sound-sessions', 'Sessions', 2, 'number')}${field('sound-rate', 'Fee per session EUR', 250, 'number')}</div>${field('sound-rights-fee', 'Rights fee EUR', 150, 'number')}<div class="notice">Illustrative sound budget: <strong id="sound-total">${money(Number(value('sound-sessions', 2)) * Number(value('sound-rate', 250)) + Number(value('sound-rights-fee', 150)))}</strong><br>Sessions × fee + usage rights. Bee reviews the budget.</div>${button('attach-sound', 'Link cue to chapter', 'link', true)}</div></div>${connections(
      [
        ['tale-chapters', 'Creative brief'],
        ['sound-map', 'Map & source register'],
        ['authenticator', 'Check original recording'],
        ['post-chapters', 'Stems, mix & masters'],
        ['actor-ledger', 'Talent fee & local value'],
      ]
    )}`;
  }
  function bridgeView(lock = false) {
    return `<div class="grid2"><div><div class="heroimage">${shot('m:frame-arch', 'Courtyard scouting')}<div class="photo-overlay"><div class="kicker">SCOUTING · BEE ↔ FLOWER</div><h2>The courtyard.</h2><p>Chapter 01 · morning shade · frame 01</p></div></div><div class="carousel space" data-carousel>${[
      ['m:frame-arch', 'Frame 01', 'Architecture & shade'],
      ['m:frame-fashion-wide', 'Frame 02', 'Look 01 / Ivory'],
      ['film-detail', 'Frame 03', 'Material & movement'],
    ]
      .map(([a, t, n]) => card(a, t, n, 'frame'))
      .join(
        ''
      )}</div></div><div class="panel"><div class="kicker">${lock ? 'CREATIVE LOCK' : 'CO-CREATION BRIDGE'}</div><h3>${lock ? 'One approved version.' : 'From intention to feasibility.'}</h3><ul class="list"><li><span>Art Director<small>Proposes frame, light and narrative.</small></span>${link('tale-chapters', 'Brief')}</li><li><span>Production Director<small>Checks access, permits, timing and budget.</small></span>${link('label-bloom', 'Feasibility')}</li><li><span>Specialty heads<small>Link look, beauty, set and sound.</small></span>${link('label-creative', 'Creative poles')}</li><li><span>Local guide / partner<small>Confirms local conditions and permissions.</small></span>${link('my-commitments', 'Evidence')}</li></ul>${field('scout-note', 'Production return', 'Access window and sound restrictions need local confirmation.', 'textarea')}${check('scout-feasible', 'Feasibility checked in the exercise')}${check('scout-version', 'All disciplines attached to the same revision')}${button('request-lock', 'Send current revision to Bee', 'shield', true)}<div class="notice" id="lock-status">${esc(value('lock-status', 'Draft · Bee review precedes brand approval. Any source revision reopens affected validations.'))}</div>${current.role === 'bee' ? button('bee-decision', 'Approve revision in exercise', 'check', true) : ''}${current.role === 'brand' ? button('brand-decision', 'Record brand decision in exercise', 'check', true) : ''}</div></div><div class="grid4 space">${[
      ['designer-network', 'Look 01', 'hanger'],
      ['beauty-library', 'Beauty palette', 'beauty'],
      ['set-detail', 'Set & materials', 'box'],
      ['sound-studio', 'Sound cue', 'sound'],
    ]
      .map(
        ([id, t, ic]) =>
          `<div class="panel">${icon(ic)}<h3>${t}</h3>${link(id, 'Open linked object')}</div>`
      )
      .join('')}</div>${connections([
      ['tale-cocreation', 'Brand presentation'],
      ['authenticator', 'Sources & rights'],
      ['my-commitments', 'Readiness'],
      ['post-chapters', 'Version history'],
    ])}`;
  }
  function authView(passport = false) {
    const origin = value('auth-origin', 'AI / synthetic'),
      status = window.BeeReviewMath.authenticator({
        origin: origin === 'AI / synthetic' ? 'ai' : origin === 'Unknown' ? 'unknown' : 'original',
        original: value('auth-original', false),
        rights: value('auth-rights', false),
        consent: value('auth-consent', false),
        reviewer: value('auth-review', false),
        certificate: value('auth-certificate', false),
      });
    return `<div class="toolbar">${['01 Source', '02 Evidence', '03 Review', '04 Passport'].map((t, i) => `<span class="badge ${i === (passport ? 3 : 0) ? 'ok' : 'concept'}">${t}</span>`).join('')}</div><div class="grid2"><div><div class="heroimage">${shot('film-detail', 'Image whose provenance is being reviewed')}</div><div class="panel space"><div class="kicker">ASSET CHAIN</div><h3>Inspiration → original → derivative</h3><div class="mini">${icon('image')}<div><strong>Reference / CM-01</strong><small>Creator, original source and reuse permission.</small></div></div><div class="mini">${icon('camera')}<div><strong>Original / capture file</strong><small>Date, territory, author, original bytes and consent.</small></div></div><div class="mini">${icon('film')}<div><strong>Delivery / campaign version</strong><small>Edits, rights, credits and links to the source.</small></div></div>${field('auth-parent', 'Parent asset / inspiration ID', 'CM-01-concept')}${field('auth-reuse', 'Visual upcycling use', 'Reference for the texture treatment; no authenticated photographic source supplied.', 'textarea')}</div></div><div class="panel paper"><div class="kicker">BEE AUTHENTICATOR</div><h3>${passport ? 'The asset passport.' : 'Verify the origin.'}</h3>${field('auth-origin', 'Origin declaration', 'AI / synthetic', 'select', ['Original photographic capture', 'Original field sound', 'Reused licensed original', 'AI / synthetic', 'Unknown'])}${field('auth-author', 'Creator and source', 'ChatGPT Image / exercise concept')}${field('auth-issuer', 'Certificate issuer & scope', 'No external certificate supplied')}${check('auth-original', 'Original file and capture record supplied')}${check('auth-rights', 'Usage rights and creator credit documented')}${check('auth-consent', 'Required consent / territorial permission documented')}${check('auth-review', 'Assigned human reviewer checked the chain')}${check('auth-certificate', 'Applicable natural / organic certificate checked')}<div class="verdict" id="auth-status">${status.status}</div><div class="filebox">${icon('shield')}<p>Inspect a file fingerprint</p><input type="file" id="auth-file" aria-label="Choose a file to fingerprint"><p class="mono" id="fingerprint">${esc(value('auth-fingerprint', 'No file selected.'))}</p></div><p class="caption-note" style="color:#66746d">SHA-256 identifies file bytes. It does not prove a natural origin, a date, consent or a certification. No automatic AI detector or blockchain verification is claimed.</p>${button('export-passport', 'Download draft passport', 'download')}${link('validation-desk', 'Request human review', 'shield')}<div class="notice">An AI concept cannot become organic evidence by ticking checkboxes. The passport records declarations and missing proofs; it never issues a certificate.</div></div></div>${connections(
      [
        ['label-creative', 'Creative integrity'],
        ['beauty-origin', 'Product certificates'],
        ['sound-map', 'Recording provenance'],
        ['post-chapters', 'Versions & derivatives'],
        ['brand-value', 'Evidence shown to brand'],
      ]
    )}`;
  }
  function commitmentsView() {
    const own = charterRows.filter(
      (x) =>
        current.role === 'bee' ||
        current.role === 'production' ||
        current.role === 'art' ||
        { stylist: 'Stylist', beauty: 'Beauty', set: 'Set Designer', sound: 'Sound' }[
          current.role
        ] === x[1]
    );
    const specific = {
      brand: [
        [
          'Brand commitments',
          'Brand',
          'Accurate brief, agreed usage, approved version and channel evidence',
          'tale-brief',
          'doc',
        ],
      ],
      photo: [
        [
          'Photographic integrity',
          'Photographer',
          'Original captures, location metadata, creator credit and image rights',
          'asset-passport',
          'camera',
        ],
      ],
      film: [
        [
          'Film integrity',
          'Film Director',
          'Original footage, treatment, shot permissions and final master rights',
          'post-chapters',
          'film',
        ],
      ],
      editor: [
        [
          'Transparent postproduction',
          'Postproduction',
          'Parent originals, edit history, derivatives, sound stems and version reviews',
          'post-chapters',
          'film',
        ],
      ],
      model: [
        [
          'Talent care and consent',
          'Talent',
          'Session scope, usage territory, duration, fitting and consent requirements',
          'asset-passport',
          'people',
        ],
      ],
      ngo: [
        [
          'Partner-led action',
          'Local Impact Partner',
          'Agreed action, allocated capital, receipts, field observations and follow-up',
          'impact-pillars',
          'leaf',
        ],
      ],
      expert: [
        [
          'Independent evidence review',
          'Independent Reviewer',
          'Review scope, method, evidence gaps, conflicts and reasoned determination',
          'validation-desk',
          'shield',
        ],
      ],
    };
    const rows = specific[current.role] || own;
    return `<div class="grid2"><div><div class="kicker">RIGHT PERSON · RIGHT MOMENT</div><h2>A charter inside your work.</h2><p>${rolePurpose[current.role]}</p>${rows.map(([t, owner, proof, id, ic]) => `<div class="panel space"><div class="kicker">${owner}</div><h3>${icon(ic)} ${t}</h3><p>${proof}</p>${check('commit-' + current.role + '-' + id, 'I have reviewed the relevant requirement')}${link(id, 'Open the working object')}</div>`).join('')}</div><div class="panel paper"><h3>Your next handoff</h3><ul class="list"><li><span>01 / Capture the source<small>File, date, country, actor and linked object.</small></span></li><li><span>02 / Attach supporting evidence<small>Rights, receipts, agreements or observations.</small></span></li><li><span>03 / Send to your lead<small>DA for creative integrity; production for field operations.</small></span></li><li><span>04 / Correct or escalate<small>Bee verification; independent expert according to risk.</small></span></li></ul>${field('commit-note-' + current.role, 'Handoff note', 'List missing evidence and the next owner.', 'textarea')}${button('submit-commitment', 'Record the handoff in the exercise', 'arrow', true)}<p class="caption-note" style="color:#66746d">For NGO roles, only the allocated Impact Capital and assigned actions are visible in the operational product.</p></div></div>${connections(
      [
        ['label-creative', 'Creative charter'],
        ['label-bloom', 'Field charter'],
        ['validation-desk', 'Correction queue'],
        ['impact-pillars', 'Local partner actions'],
      ]
    )}`;
  }
  function validationView() {
    return `<div class="statrow">${stat('Evidence streams', '2', 'Production / NGO impact')}${stat('Claim under review', 'Organic', 'Original image provenance')}${stat('Risk', 'Elevated', 'Independent review when required')}${stat('Decision', 'Pending', 'No certification issued')}</div><div class="grid2"><div class="panel"><h3>Verification queue</h3><ul class="list">${[
      ['Image origin', 'AI concept supplied', 'authenticator'],
      ['Natural products', 'Issuer and batch missing', 'beauty-origin'],
      ['Sound rights', 'Master / composition rights missing', 'sound-map'],
      ['Production footprint', 'Coverage / baseline missing', 'metric-trace'],
      ['NGO outcomes', 'Monitoring evidence required', 'impact-pillars'],
    ]
      .map(([t, s, id]) => `<li><span>${t}<small>${s}</small></span>${link(id, 'Review')}</li>`)
      .join(
        ''
      )}</ul></div><div class="panel paper"><div class="kicker">ASSIGNED REVIEW</div><h3>Request the right proof.</h3>${field('validation-scope', 'Review scope', 'Image provenance', 'select', ['Image provenance', 'Natural product claim', 'Sound rights', 'Production metric', 'NGO outcome'])}${field('validation-risk', 'Risk level', 'Elevated', 'select', ['Standard', 'Elevated', 'Independent expert required'])}${field('validation-decision', 'Decision', 'Correction requested', 'select', ['Correction requested', 'Evidence complete', 'Rejected'])}${field('validation-reason', 'Reason / missing proof', 'Original capture and creator permission missing. AI mockup cannot substantiate an organic source.', 'textarea')}${button('review-decision', 'Save review simulation', 'shield', true)}<div class="notice">The label and NGO impact are reviewed separately. A reviewer records scope, evidence, date and reason. A material revision reopens the decision.</div></div></div>${connections(
      [
        ['my-commitments', 'Return correction to owner'],
        ['authenticator', 'Provenance chain'],
        ['brand-value', 'Published claims in Honey'],
      ]
    )}`;
  }
  const initialLedger = [
    {
      id: 'C-01',
      actor: 'Art / photography / film / post',
      bucket: 'creative',
      amount: 12000,
      local: null,
      proof: 'Contracts, deliverables, rights',
      owner: 'Art Director',
    },
    {
      id: 'P-01',
      actor: 'Shared van',
      bucket: 'production',
      amount: 1800,
      local: true,
      proof: 'Route, occupancy, invoice',
      owner: 'Production',
    },
    {
      id: 'P-02',
      actor: 'Local accommodation',
      bucket: 'production',
      amount: 3360,
      local: true,
      proof: 'Nights, ownership, invoice',
      owner: 'Production',
    },
    {
      id: 'P-03',
      actor: 'Catering',
      bucket: 'production',
      amount: 1440,
      local: true,
      proof: 'Meals, sourcing, invoice',
      owner: 'Production',
    },
    {
      id: 'P-04',
      actor: 'Equipment',
      bucket: 'production',
      amount: 2400,
      local: false,
      proof: 'Rental, energy, shared days',
      owner: 'Production',
    },
    {
      id: 'P-05',
      actor: 'Locations & guides',
      bucket: 'production',
      amount: 2000,
      local: true,
      proof: 'Permits, guide contract',
      owner: 'Production',
    },
    {
      id: 'P-06',
      actor: 'Local crew',
      bucket: 'production',
      amount: 3000,
      local: true,
      proof: 'Contracts, days, payments',
      owner: 'Production',
    },
    {
      id: 'B-01',
      actor: 'Bee coordination',
      bucket: 'operations',
      amount: 6000,
      local: null,
      proof: 'Allocation agreement',
      owner: 'Bee',
    },
    {
      id: 'I-01',
      actor: 'Local partner / NGO',
      bucket: 'impact',
      amount: 2500,
      local: true,
      proof: 'Action budget, tranche receipt',
      owner: 'NGO + Bee',
    },
  ];
  const ledger = () =>
    initialLedger.map((r) => ({ ...r, amount: Number(value('amount-' + r.id, r.amount)) }));
  const money = (n) =>
    n === null
      ? 'Not available'
      : new Intl.NumberFormat('en-GB', {
          style: 'currency',
          currency: 'EUR',
          maximumFractionDigits: 0,
        }).format(n);
  const percent = (n) => (n === null ? 'Not available' : (n * 100).toFixed(1) + '%');
  function metricsView() {
    const m = window.BeeReviewMath.ledger(ledger()),
      files = Number(value('metric-files', 18)),
      works = Number(value('metric-works', 15));
    return `<div class="kicker">ILLUSTRATIVE PLAN · NO VERIFIED CAMPAIGN RESULTS</div><div class="statrow">${stat('Creative Capital', money(m.total), 'Sum of unique allocations')}${stat('Production allocation', money(m.production), 'Includes local suppliers')}${stat('Impact Capital', money(m.impact), 'Separate action portfolio')}${stat('Verified outcomes', 'Pending', 'Evidence has not been supplied')}</div><div class="grid3 pillars"><article>${icon('camera')}<h3>Creative return</h3><div class="big">${files} files</div><p>${works} distinct works planned · exports are counted separately.</p><div class="metric"><strong>${money(window.BeeReviewMath.ratio(m.creative + m.production, works))}</strong><small>Planned creative + production cost / original work</small></div><div class="metric"><strong>Not available</strong><small>Reach, engagement and brand lift require channel data.</small></div>${link('metric-trace', 'Inspect creative calculation')}</article><article>${icon('chart')}<h3>Operational return</h3><div class="big">${percent(m.localShare)}</div><p>Planned local production spend / eligible production allocation.</p><div class="metric"><strong>${money(m.local)}</strong><small>Local suppliers and crew · planning classification</small></div><div class="metric"><strong>Not available</strong><small>Cost and CO₂ savings need a comparable standalone baseline.</small></div>${link('actor-ledger', 'Inspect every allocation')}</article><article>${icon('leaf')}<h3>Impact return</h3><div class="big">${money(m.impact)}</div><p>Allocated Impact Capital. Deployment and outcomes remain separate.</p><div class="metric"><strong>3 pillars</strong><small>Social · Environmental · Economic</small></div><div class="metric"><strong>Pending evidence</strong><small>Partner receipt, action evidence and monitoring.</small></div>${link('impact-pillars', 'Open impact evidence')}</article></div><div class="notice">No financial ROI percentage is shown without attributed margin and a matching investment period. We never add euros, reach and ecological outcomes into a single invented score.</div>${connections(
      [
        ['metric-trace', 'Formulas, denominator & evidence'],
        ['actor-ledger', 'Contributions from all actors'],
        ['asset-passport', 'Rights & usable assets'],
        ['validation-desk', 'Verification status'],
        ['tale-value', 'Brand presentation'],
      ]
    )}`;
  }
  function traceView() {
    const m = window.BeeReviewMath.ledger(ledger()),
      f = Number(value('metric-files', 18)),
      w = Number(value('metric-works', 15));
    const c = window.BeeReviewMath.carbon(
      value('carbon-actual', ''),
      value('carbon-baseline', ''),
      value('carbon-covered', false) ? 1 : 0
    );
    return `<div class="grid2"><div class="panel"><div class="kicker">CREATIVE & OPERATIONAL RETURN</div><h3>Show the numerator. Show the proof.</h3>${field('metric-files', 'Planned delivery files', 18, 'number')}${field('metric-works', 'Distinct creative works', 15, 'number')}<div class="notice">12 stills + 3 original films = 15 works.<br>3 films × 2 aspect ratios = 6 exports.<br>12 stills + 6 exports = 18 delivery files.</div><div class="statrow">${stat('Cost / work', money(window.BeeReviewMath.ratio(m.creative + m.production, w)), 'Creative + production / original works')}${stat('Cost / file', money(window.BeeReviewMath.ratio(m.creative + m.production, f)), 'Creative + production / exports')}</div><p>Formula source: Journey comparison / 02_Metrics, creative cost per usable asset. The denominator here is a plan; final reporting requires accepted files and usage rights.</p>${link('asset-passport', 'Rights & acceptance record')}</div><div class="panel paper"><div class="kicker">ENVIRONMENTAL COMPARISON</div><h3>Comparable scope, documented factors.</h3>${field('carbon-actual', 'Scenario kgCO₂e', '', 'number')}${field('carbon-baseline', 'Standalone baseline kgCO₂e', '', 'number')}${check('carbon-covered', 'Both scenarios cover the same complete scope')}<div class="statrow">${stat('Avoided emissions', percent(c), '(Baseline − scenario) / baseline')}</div><p>Missing activity, factor or coverage is unavailable, never zero. Record the factor source, version, unit and uncertainty.</p>${field('carbon-factor', 'Factor reference / version', 'Pending verified activity data', 'textarea')}${link('actor-ledger', 'Travel, nights, meals & energy')}</div></div><div class="panel space"><h3>Brand attribution / a separate example</h3><p>Illustration from the 5-brand CSR model: allocate verified outcomes by the brand’s share of the relevant pillar funding. This is financing attribution, not exclusive causal ownership.</p><div class="grid3">${field('attr-result', 'Verified project outcome (example)', 40, 'number')}${field('attr-own', 'Brand contribution EUR (example)', 2000, 'number')}${field('attr-other', 'Other brands EUR (example)', 8000, 'number')}</div><p class="notice">Attributable share in this exercise: <strong>${(() => {
      const a = window.BeeReviewMath.attribution(value('attr-result', 40), [
        value('attr-own', 2000),
        value('attr-other', 8000),
      ]);
      return a ? a[0].toFixed(2) : 'Not available';
    })()}</strong> outcome units. This separate €10k example does not alter the €2.5k Morocco allocation.</p></div>${connections(
      [
        ['brand-value', 'Return to brand value'],
        ['impact-pillars', 'KPI methods'],
        ['validation-desk', 'Evidence review'],
      ]
    )}`;
  }
  function ledgerView() {
    const m = window.BeeReviewMath.ledger(ledger());
    return `<div class="statrow">${stat('Total allocation', money(m.total), 'Budget plan, not payments')}${stat('Production', money(m.production), 'One row per allocation')}${stat('Local production', money(m.local), 'Within production only')}${stat('Impact', money(m.impact), 'Not added twice to local spend')}</div>${creativeAllocationView(m.creative)}<div class="panel"><div class="car-head"><h3>Capital → actor → action → proof</h3>${button('export-ledger', 'Export register', 'download')}</div><div class="table-wrap"><table><thead><tr><th>ID / ACTOR</th><th>ALLOCATION EUR</th><th>LOCAL</th><th>EVIDENCE / OWNER</th><th>STATUS</th></tr></thead><tbody>${ledger()
      .map(
        (r) =>
          `<tr><td>${r.id} · ${r.actor}<small>${r.bucket}</small></td><td><input type="number" min="0" data-field="amount-${r.id}" aria-label="Allocation ${r.actor}" value="${r.amount}" ${editable() ? '' : 'readonly'}></td><td>${r.local === null ? 'Not classified' : r.local ? 'Proposed local' : 'Outside local numerator'}</td><td>${r.proof}<small>${r.owner}</small></td><td>${badge('Planned', 'concept')}</td></tr>`
      )
      .join(
        ''
      )}</tbody></table></div></div><div class="grid2 space"><div class="panel"><h3>Artistic contributions within the plan</h3><p>Beauty, stylism, set and sound attach their quote, quantities, rates and rights to an existing allocation. Their subtotals are not added again to the project total.</p><ul class="list">${[
      ['beauty-origin', 'Beauty products / consumables'],
      ['designer-network', 'Stylist / designer loans and fees'],
      ['set-detail', 'Set materials / maker fee / return'],
      ['sound-studio', 'Sessions × fee + music rights'],
    ]
      .map(([id, t]) => `<li>${t}${link(id, 'Detail')}</li>`)
      .join(
        ''
      )}</ul></div><div class="panel"><h3>Evidence ownership</h3><p>Brand: accepted assets and channel analytics. DA and creators: sources, author credits and original works. Production: bookings, activity data, invoices. Local partners: action evidence and observations. Expert: assigned review. Bee: allocation and reconciliation.</p>${link('my-commitments', 'Actor responsibilities', 'people')}${link('metric-trace', 'Calculation methods', 'chart')}</div></div>${connections(
      [
        ['brand-value', 'Updated ROI view'],
        ['label-creative', 'Creative Studio'],
        ['label-bloom', 'Bloom'],
        ['impact-pillars', 'Partner outcomes'],
      ]
    )}`;
  }
  function creativeAllocationView(envelope) {
    const rows = [
      ['Art direction', 'creative-art', 2000, 'Brief, scope & rights'],
      ['Styling / designers', 'creative-stylist', 1600, 'Fees, pieces, loan & credit'],
      ['Beauty', 'creative-beauty', 900, 'Artist fee, products, batch'],
      ['Set / maker', 'set-budget', 450, 'Materials, fee & return'],
      [
        'Sound',
        'sound-budget',
        Number(value('sound-sessions', 2)) * Number(value('sound-rate', 250)) +
          Number(value('sound-rights-fee', 150)),
        'Sessions × rate + rights',
      ],
      ['Photography', 'creative-photo', 2200, 'Capture, originals & rights'],
      ['Film', 'creative-film', 2200, 'Shooting, master & rights'],
      ['Postproduction', 'creative-post', 1200, 'Versions, edits & delivery'],
      ['Talent', 'creative-talent', 800, 'Sessions, consent & usage'],
    ];
    const total = rows.reduce(
      (n, [, k, v]) => n + Number(k === 'sound-budget' ? v : value(k, v)),
      0
    );
    return `<details class="panel space"><summary><strong>Creative contributors / ${money(total)} of ${money(envelope)}</strong> · expand the calculation</summary><p>Illustrative suballocations inside C01, never added again to the project total. Sound and set figures are connected to their specialty screens. Any difference needs Bee reconciliation.</p><div class="table-wrap"><table><thead><tr><th>ACTOR</th><th>PLANNED EUR</th><th>REQUIRED EVIDENCE</th></tr></thead><tbody>${rows.map(([t, k, v, p]) => `<tr><td>${t}</td><td>${k === 'sound-budget' ? `${money(v)} ${link('sound-studio', 'Edit')}` : field(k, t + ' allocation', v, 'number')}</td><td>${p}</td></tr>`).join('')}</tbody></table></div><p class="notice">${total === envelope ? 'Reconciled in the example.' : `${money(envelope - total)} remaining / difference to reconcile.`} All amounts are planned examples; no contributor has been paid through this screen.</p></details>`;
  }
  function impactView() {
    return `<div class="grid3 pillars">${[
      [
        'Social',
        'people',
        'People & capabilities',
        '12 adult participants',
        'Attendance and consent register; avoid counting visits as unique people.',
        'ngo',
      ],
      [
        'Environmental',
        'leaf',
        'Nature & resources',
        '54 / 60 pots at J+30',
        '90% survival in the fictional exercise. Not a biodiversity, carbon or restoration claim.',
        'expert',
      ],
      [
        'Economic',
        'chart',
        'Local value retained',
        '€2,500 allocated',
        'Distinguish approved, committed, released, spent and verified amounts.',
        'bee',
      ],
    ]
      .map(
        ([t, ic, s, val, n, r]) =>
          `<article>${icon(ic)}<h3>${t}</h3><p>${s}</p><div class="big">${val}</div><p>${n}</p>${badge('Scenario only', 'concept')}<div class="space">${link('validation-desk', 'Review evidence', 'shield', r)}</div></article>`
      )
      .join(
        ''
      )}</div><div class="grid2 space"><div class="panel"><h3>From the local partner</h3>${field('impact-action', 'Action', 'Atelier Atlas / pollinator containers and knowledge sharing · fictional', 'textarea')}${field('impact-baseline', 'Baseline / unit / method', '60 planted pots; count living pots on day 30; record species and conditions.', 'textarea')}${field('impact-proof', 'Evidence references', 'Attendance, dated observations, invoices and consent: pending real documents.', 'textarea')}</div><div class="panel paper"><h3>What the brand can say</h3><p>In the example, a brand finances a documented local action. No actual result or certification is established by these demonstration screens.</p><div class="notice">Bee Label evaluates production practices. The NGO impact register evaluates partner actions and outcomes. They meet in Honey with separate scopes and proof.</div>${field('impact-followup', 'Monitoring / next bloom', 'J+30 review, then J+90 follow-up and local maintenance plan.', 'textarea')}${button('impact-note', 'Save monitoring draft', 'doc', true)}</div></div>${connections(
      [
        ['metric-trace', 'Funding attribution'],
        ['actor-ledger', 'Capital trail'],
        ['validation-desk', 'Risk-based independent review'],
        ['brand-value', 'Honey report'],
      ]
    )}`;
  }
  const taleIds = [
    'tale-brief',
    'tale-visions',
    'tale-chapters',
    'tale-hive',
    'tale-cocreation',
    'tale-bloom',
    'tale-value',
    'tale-export',
  ];
  const taleNames = [
    'Brief & Brand',
    'Mutual Visions',
    'Visual Tale',
    'Creative Hive',
    'Co-creation',
    'Bloom',
    'Impact & Multi-ROI',
    'Review & Export',
  ];
  function taleView() {
    const step = taleIds.indexOf(current.id),
      c = chapters[chapter()];
    const previewTitle =
      step === 0
        ? value('tale-title', 'Carry the light')
        : step === 1
          ? 'Mutual visions'
          : step === 2 || step === 5
            ? value('chapter-name-' + chapter(), c[0])
            : taleNames[step];
    let left = '';
    if (step === 0)
      left = `${field('tale-brand', 'Brand', 'Craie Studio / exercise')}${field('tale-title', 'Project title', 'Carry the light')}${field('tale-intention', 'Creative intention', 'A tactile journey between light, gesture and material in Morocco.', 'textarea')}${field('tale-keywords', 'Keywords', 'Natural light · texture · movement · quiet strength')}${field('tale-destination', 'Destination / season', 'Morocco · November 2026 / exercise')}<div class="toolbar">${check('tale-photo', 'Visual Tale / photography', true)}${check('tale-sound', 'Sound Tale', true)}${check('tale-bts', 'Behind the scenes', true)}</div>`;
    if (step === 1)
      left = `<div class="grid2">${field('vision-brand', 'Brand values', 'Craftsmanship, durable objects and freedom of movement.', 'textarea')}${field('vision-bee', 'Bee values', 'Local collaboration, conscious production and traceable creative value.', 'textarea')}</div>${[
        ['Social', 'social', 'Credit and fairly compensate contributors.'],
        ['Environmental', 'environment', 'Reuse materials and document resource choices.'],
        ['Economic', 'economy', 'Plan local sourcing and track value retained locally.'],
      ]
        .map(([t, k, v]) => field('vision-' + k, t, v, 'textarea'))
        .join('')}`;
    if (step === 2 || step === 5)
      left = `${chapterStrip()}${field('chapter-name-' + chapter(), 'Chapter title', c[0])}${field('chapter-location-' + chapter(), 'Location', c[1])}${field('chapter-note-' + chapter(), 'Narrative / atmosphere', 'Follow the light, the texture of the bag and the gesture of the talent.', 'textarea')}<div class="kicker space">${step === 5 ? 'BLOOMBOARD · FOUR CONNECTED VIEWS' : 'KEY VISUALS & REFERENCES'}</div><div class="grid4">${['m:frame-arch', 'fitting', 'film-detail', 'on-set'].map((a, i) => `<div>${shot(a, ['Atmosphere', 'Key scene', 'Texture', 'Behind the scene'][i])}<small>${['Atmosphere', 'Key scene', 'Texture', 'Behind the scene'][i]}</small></div>`).join('')}</div>${link('co-creation', 'Assign frames and specialties', 'link')}${link('sound-studio', 'Chapter music', 'sound')}`;
    if (step === 3)
      left = `<h3>Core team & local collaborators</h3><p>Appoint each contributor with a clear role, credit, scope and fair terms.</p><div class="grid2">${card('beauty-prep', 'Nectar of Beauty', 'Beauty direction and local products', 'beauty-library')}${card('fitting', 'Art of Wearing', 'Looks and local designers', 'designer-network')}${card('m:craft', 'Set Design & Artists', 'Maker, materials and second life', 'set-studio')}${card('m:landscape', 'Sound Tale', 'Organic recordings and authorship', 'sound-studio')}</div><div class="notice">Bee Authenticator is part of the source and delivery chain. Sound Tale scope depends on the agreed offer and chapter brief.</div>`;
    if (step === 4)
      left = `<h3>Creative Studio ↔ Production</h3><p>Convert the intention into feasible frames, local collaborations, allocations and a shared schedule.</p>${field('tale-feasibility', 'Feasibility return', 'Confirm site access, daylight, products, crew and sound recording permissions.', 'textarea')}${check('tale-scout', 'Scouting feedback reviewed')}${check('tale-cost', 'Budget reviewed by Bee')}${check('tale-charter', 'Relevant charter modules assigned')}${link('co-creation', 'Open co-creation and scouting', 'pin')}${link('creative-lock', 'Review the current revision', 'shield', 'production')}`;
    if (step === 6)
      left = `<h3>Three returns. Three impact pillars.</h3><p>Creative: original works, usable assets and rights.<br>Operational: costs, shared resources and local value.<br>Impact: documented actions and outcomes across social, environmental and economic pillars.</p>${link('brand-value', 'Open live scenario calculations', 'chart')}${link('impact-pillars', 'Open impact methods', 'leaf')}${field('tale-claim', 'Claim for the presentation', 'Proposed production framework. Results and certifications remain subject to evidence.', 'textarea')}<div class="notice">Never turn a planning target into an achieved result in a brand presentation.</div>`;
    if (step === 7)
      left = `<h3>A presentation ready for review.</h3><ul class="list">${taleIds
        .slice(0, 7)
        .map(
          (id, i) =>
            `<li><span>${String(i + 1).padStart(2, '0')} / ${taleNames[i]}</span>${link(id, 'Review')}</li>`
        )
        .join(
          ''
        )}</ul><p>The export uses your current local text and the selected Morocco visuals. It is marked as a draft and contains no certification.</p>${button('export-tale', 'Download the 8-page presentation', 'download', true)}${button('export-scenario', 'Export scenario data', 'doc')}<div class="notice">Bee creative validation comes before brand validation. This exercise does not send the proposal or sign an agreement.</div>`;
    return `<div class="stepper">${taleIds.map((id, i) => `<a class="${i === step ? 'active' : ''}" href="#view/${go(id, 'art')}/${id}"><small>${String(i + 1).padStart(2, '0')}</small>${taleNames[i]}</a>`).join('')}</div><div class="grid2"><div class="panel paper">${left}</div><div><div class="preview">${shot(step === 2 || step === 5 ? c[2] : step === 3 ? 'on-set' : 'm:frame-fashion-wide', 'Presentation preview')}<div class="kicker">CRAIE STUDIO · MOROCCO</div><h2 id="tale-preview-title">${esc(previewTitle)}</h2><p id="tale-preview-copy">${esc(step === 0 ? value('tale-intention', 'A tactile journey between light, gesture and material.') : step === 2 || step === 5 ? value('chapter-note-' + chapter(), 'An intimate chapter, rooted in place.') : 'From intention to creation. From creation to shared value.')}</p><small>DRAFT PRESENTATION · CONCEPT IMAGES</small></div><p class="caption-note">EUGE DA process: brief, shared values, tale, team, co-creation, bloomboards, returns and review. The right side previews the brand-facing story.</p></div></div>${connections(
      [
        ['authenticator', 'Reference provenance'],
        ['post-chapters', 'Editorial planning'],
        ['tale-export', 'Review & export'],
      ]
    )}`;
  }
  function postView() {
    return `${subs('post', ['Calendar', 'List'])}<div class="panel ${tabs.post === 1 ? 'post-list' : ''}">${chapters.map(([t, , a], i) => `<div class="two-lines"><div>${shot(a, t)}<small>CHAPTER ${i + 1} · ${t}</small></div><div class="panel">Editing<small>9–12 November</small>${badge('Draft', 'concept')}</div><div class="panel">Bee review<small>13–16 November</small>${link('asset-passport', 'Sources & rights')}</div><div class="panel">Brand validation<small>17–20 November</small>${link('creative-lock', 'Current revision', 'shield', 'brand')}</div></div>`).join('')}</div><div class="grid2 space"><div class="panel"><h3>What travels with every version</h3><p>Chapter ID, source originals, creator credit, edit history, sound stems, master/composition rights and review decisions.</p>${field('post-version', 'Version', 'CM-CH01-v03 / exercise')}${field('post-return', 'Review notes', 'Keep skin texture; align the sound cue with the approved chapter; attach all source rights.', 'textarea')}${button('post-save', 'Save revision notes', 'doc', true)}</div><div class="panel paper"><h3>Version changes reopen review.</h3><p>A brand decision refers to a specific version. A new image, mix or usage scope cannot silently inherit an old approval.</p>${link('authenticator', 'Source chain', 'link')}${link('sound-studio', 'Sound handoff', 'sound')}${link('asset-passport', 'Delivery passport', 'shield')}</div></div>${connections(
      [
        ['tale-chapters', 'Original chapter brief'],
        ['brand-value', 'Usable asset count'],
        ['validation-desk', 'Outstanding evidence'],
      ]
    )}`;
  }
  function toast(message) {
    const el = host?.querySelector('.vtoast');
    if (el) {
      el.hidden = false;
      el.textContent = message;
    }
  }
  function download(name, body, type = 'application/json') {
    const url = URL.createObjectURL(new Blob([body], { type }));
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function exportTale() {
    const pages = taleNames
      .map(
        (name, i) =>
          `<section><small>CRAIE STUDIO / MOROCCO · DRAFT · ${i + 1}/8</small><h1>${esc(name)}</h1><img src="${location.origin + img(i === 3 ? 'on-set' : chapters[i % 3][2])}" alt="AI concept"><h2>${esc(i === 0 ? value('tale-title', 'Carry the light') : i === 2 ? value('chapter-name-' + chapter(), chapters[chapter()][0]) : name)}</h2><p>${esc([value('tale-intention', 'A tactile journey between light, gesture and material.'), value('vision-brand', 'Craftsmanship and freedom of movement.') + ' / ' + value('vision-bee', 'Local collaboration and traceable value.'), chapters.map((c, n) => value('chapter-name-' + n, c[0]) + ': ' + value('chapter-note-' + n, 'Narrative to refine.')).join('\n'), 'Beauty, styling, set, sound, photography, film, post and local collaborators. All appointments and rights to confirm.', value('tale-feasibility', 'Scouting, access and budget review pending.'), chapters.map((c, n) => value('chapter-location-' + n, c[1])).join(' / '), value('tale-claim', 'Results and certifications remain subject to evidence.'), 'Bee review, then brand validation. No approval or certification is issued by this export.'][i])}</p><footer>Fictional scenario inspired by Craie Morocco. AI concept images are not evidence. Generated ${new Date().toLocaleDateString('fr-FR')}.</footer></section>`
      )
      .join('');
    download(
      'beeyond-carry-the-light-proposal.html',
      `<!doctype html><html lang="en"><meta charset="utf-8"><title>Carry the light · draft proposal</title><style>body{margin:0;background:#f5f0e6;color:#244555;font:17px/1.7 Arial}section{padding:55px;max-width:1100px;margin:auto;min-height:90vh;break-after:page}h1{font:54px Georgia}h2{font:32px Georgia}img{float:right;width:48%;max-height:520px;object-fit:cover;margin:0 0 30px 30px}p{white-space:pre-line}small,footer{font-size:11px}footer{clear:both;padding-top:35px}@media print{section{min-height:0;height:90vh}}@media(max-width:600px){section{padding:25px}img{float:none;width:100%;margin:0}h1{font-size:36px}}</style><p style="padding:20px">Draft presentation · Open in your browser and print to PDF if needed.</p>${pages}</html>`,
      'text/html'
    );
  }
  function attachEvents() {
    host.addEventListener('click', (e) => {
      const target = e.target.closest(
        '[data-action],[data-tab],[data-palette],[data-chapter],[data-set-image]'
      );
      if (!target) return;
      if (target.dataset.tab) {
        tabs[target.dataset.tab] = Number(target.dataset.index);
        draw();
        return;
      }
      if (target.dataset.palette) {
        local.palette = Number(target.dataset.palette);
        save();
        draw();
        return;
      }
      if (target.dataset.chapter) {
        local.chapter = Number(target.dataset.chapter);
        save();
        draw();
        return;
      }
      if (target.dataset.setImage) {
        host.querySelector('.heroimage .image').src = img(target.dataset.setImage);
        return;
      }
      const a = target.dataset.action;
      if (a === 'carousel-back' || a === 'carousel-next') {
        host.querySelector('[data-carousel]')?.scrollBy({
          left: a === 'carousel-next' ? 600 : -600,
          behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        });
        return;
      }
      if (a === 'look-next') {
        local.look = (Number(value('look', 0)) + 1) % 2;
        save();
        draw();
        return;
      }
      if (a === 'export-tale') {
        exportTale();
        return;
      }
      if (a === 'export-scenario') {
        download(
          'beeyond-review-scenario.json',
          JSON.stringify(
            {
              disclosure: 'Local fictional review scenario; no real approvals or certifications',
              revision: '2026-10-15',
              values: local,
            },
            null,
            2
          )
        );
        return;
      }
      if (a === 'export-passport') {
        download(
          'bee-draft-asset-passport.json',
          JSON.stringify(
            {
              status: 'DRAFT - NOT A CERTIFICATE',
              source: value('auth-origin', 'AI / synthetic'),
              creator: value('auth-author', 'ChatGPT Image'),
              fingerprint: value('auth-fingerprint', 'Not supplied'),
              parent: value('auth-parent', 'CM-01-concept'),
              declaredChecks: Object.fromEntries(
                ['original', 'rights', 'consent', 'review', 'certificate'].map((k) => [
                  k,
                  !!value('auth-' + k, false),
                ])
              ),
              missingProofs: ['original', 'rights', 'consent', 'review', 'certificate'].filter(
                (k) => !value('auth-' + k, false)
              ),
              eligibility:
                value('auth-origin', 'AI / synthetic') === 'AI / synthetic'
                  ? 'AI concept: never organic evidence'
                  : 'Human determination pending',
              generatedAt: new Date().toISOString(),
            },
            null,
            2
          )
        );
        return;
      }
      if (a === 'export-ledger') {
        download(
          'bee-scenario-allocations.csv',
          'ID,Actor,Bucket,EUR,Local,Status\n' +
            ledger()
              .map((r) =>
                [r.id, r.actor, r.bucket, r.amount, r.local ?? 'Unknown', 'Planned / scenario']
                  .map((x) => '"' + String(x).replaceAll('"', '""') + '"')
                  .join(',')
              )
              .join('\n'),
          'text/csv'
        );
        return;
      }
      if (!editable() && a !== 'brand-decision') {
        toast(
          'Ce rôle consulte cette partie. Changez de métier dans le comparateur pour essayer la saisie.'
        );
        return;
      }
      if (a === 'request-lock') {
        if (!value('scout-feasible', false) || !value('scout-version', false)) {
          toast(
            'Confirmez la faisabilité et le rattachement à la même version avant le passage à Bee.'
          );
          return;
        }
        local['lock-state'] = 'submitted';
        local['lock-status'] = 'Exercise · submitted to Bee. Brand approval remains pending.';
        save();
        draw();
        toast('Simulation enregistrée localement ; aucun accord réel envoyé.');
        return;
      }
      if (a === 'bee-decision') {
        if (current.role !== 'bee' || value('lock-state', 'draft') !== 'submitted') {
          toast('La production doit d’abord soumettre la version et sa faisabilité à Bee.');
          return;
        }
        local['lock-state'] = 'bee-approved';
        local['lock-status'] =
          'Exercise · Bee approved this revision. Brand review is now available.';
        save();
        draw();
        toast('Validation Bee simulée sur cet appareil.');
        return;
      }
      if (a === 'brand-decision') {
        if (current.role !== 'brand' || value('lock-state', 'draft') !== 'bee-approved') {
          toast('La marque attend une validation Bee de cette version.');
          return;
        }
        local['lock-state'] = 'brand-approved';
        local['lock-status'] =
          'Exercise · Bee then brand approved this revision. A creative change reopens review.';
        save();
        draw();
        toast('Validation marque simulée sur cet appareil ; aucun accord réel.');
        return;
      }
      if (a === 'attach-beauty') local['beauty-added'] = true;
      local['last-' + a] = { at: new Date().toISOString(), role: current.role, chapter: chapter() };
      save();
      toast(
        'Choix ajouté au brouillon de ce cas sur cet appareil. Les feedbacks ci-dessous sont les contributions partagées.'
      );
    });
    host.addEventListener('input', (e) => {
      const t = e.target;
      if (!t.dataset.field || t.readOnly || t.disabled) return;
      if (t.type === 'number' && t.dataset.field.startsWith('carbon-') && t.value.trim() === '') {
        t.setCustomValidity('');
        delete local[t.dataset.field];
        save();
        return;
      }
      if (
        t.type === 'number' &&
        (t.value.trim() === '' || !Number.isFinite(Number(t.value)) || Number(t.value) < 0)
      ) {
        t.setCustomValidity('Saisissez un nombre positif ou zéro.');
        return;
      }
      t.setCustomValidity('');
      local[t.dataset.field] = t.type === 'checkbox' ? t.checked : t.value;
      if (
        /^(scout-|chapter-|beauty-|set-|sound-|designer-|tale-|post-version)/.test(
          t.dataset.field
        ) &&
        ['bee-approved', 'brand-approved'].includes(value('lock-state', 'draft'))
      ) {
        local['lock-state'] = 'draft';
        local['lock-status'] =
          'Exercise · source changed. Bee and brand must review the new revision.';
      }
      save();
      if (t.dataset.field === 'tale-title') {
        const p = host.querySelector('#tale-preview-title');
        if (p) p.textContent = t.value;
      }
      if (t.dataset.field === 'tale-intention') {
        const p = host.querySelector('#tale-preview-copy');
        if (p) p.textContent = t.value;
      }
      if (t.dataset.field.startsWith('sound-')) {
        const total = host.querySelector('#sound-total');
        if (total)
          total.textContent = money(
            Number(value('sound-sessions', 2)) * Number(value('sound-rate', 250)) +
              Number(value('sound-rights-fee', 150))
          );
      }
    });
    host.addEventListener('change', async (e) => {
      const t = e.target;
      if (t.id === 'sound-file') {
        const f = t.files[0];
        if (!f) return;
        if (!f.type.startsWith('audio/')) {
          toast('Choisissez un fichier audio.');
          return;
        }
        if (audioURL) URL.revokeObjectURL(audioURL);
        audioURL = URL.createObjectURL(f);
        const audio = host.querySelector('audio');
        audio.src = audioURL;
        toast('Audio chargé localement. Son origine reste à documenter.');
        return;
      }
      if (t.id === 'auth-file') {
        const f = t.files[0];
        if (!f) return;
        if (f.size > 50 * 1024 * 1024) {
          toast('Choisissez un fichier inférieur à 50 Mo pour cet essai.');
          return;
        }
        const hash = await crypto.subtle.digest('SHA-256', await f.arrayBuffer());
        local['auth-fingerprint'] =
          f.name +
          ' · SHA-256 ' +
          Array.from(new Uint8Array(hash), (x) => x.toString(16).padStart(2, '0')).join('');
        save();
        const p = host.querySelector('#fingerprint');
        if (p) p.textContent = local['auth-fingerprint'];
        toast('Empreinte calculée. Ce calcul ne certifie pas une origine naturelle.');
        return;
      }
      if (t.dataset.field && t.type === 'number' && !t.checkValidity()) {
        t.reportValidity();
        toast('Valeur non enregistrée : un nombre positif ou zéro est attendu.');
        return;
      }
      if (t.dataset.field === 'beauty-country') {
        local['beauty-supplier'] =
          t.value === 'Morocco'
            ? 'Atlas botanical supplier · fictional'
            : 'No qualified supplier yet';
        local['beauty-region'] =
          t.value === 'Morocco' ? 'Essaouira / Morocco · proposed' : 'Origin to document';
        local['beauty-cert'] = 'No certificate supplied';
        save();
      }
      if (
        t.dataset.field &&
        (t.tagName === 'SELECT' ||
          t.type === 'checkbox' ||
          current.v2 === 'trace' ||
          current.v2 === 'ledger')
      )
        draw();
    });
  }
  function draw() {
    if (!current?.v2) return;
    const renderers = {
      map: mapView,
      label: labelView,
      beauty: beautyView,
      'beauty-origin': beautyOrigin,
      styling: stylingView,
      set: () => setView(false),
      'set-detail': () => setView(true),
      sound: () => soundView(false),
      'sound-map': () => soundView(true),
      bridge: () => bridgeView(false),
      lock: () => bridgeView(true),
      auth: () => authView(false),
      passport: () => authView(true),
      commitments: commitmentsView,
      validation: validationView,
      metrics: metricsView,
      trace: traceView,
      ledger: ledgerView,
      impact: impactView,
      tale: taleView,
      post: postView,
    };
    host.innerHTML = `<div class="v2"><div class="vnav"><a class="mark" href="#view/${go('connected-journey')}/connected-journey">${icon('bee')}BEEYONDTHEWORLD</a><div class="vhead-right"><small>CRAIE / MOROCCO</small>${badge('Design review · 15 Oct', 'concept')}</div></div><div class="vsub">${link('connected-journey', 'The whole journey', 'back')}<span>${roleNames[current.role]}</span><span> / </span><span>${esc(current.phase)}</span></div><div class="vbody"><div class="vtitle"><div><div class="kicker">${current.v2 === 'label' ? 'CONSCIOUS CREATIVE PRODUCTION' : current.v2 === 'tale' ? 'EUGE DA · VISUAL TALE PROPOSAL' : 'CARRY THE LIGHT · HORIZON'}</div><h1>${esc(current.title)}</h1></div><div class="role-note">${rolePurpose[current.role]}<br><small>${editable() ? 'Editable exercise · saved on this device' : 'Review view · change role to explore editing'}</small></div></div>${(renderers[current.v2] || mapView)()}<div class="sourcelinks">${(sourceMap[current.v2] || sourceMap.map).map((id, i) => `<a href="https://drive.google.com/file/d/${id}/view" target="_blank" rel="noopener noreferrer">Source Drive ${i + 1}</a>`).join('')}</div></div><div class="vfooter"><span>Ébauche interactive · scénario fictif · visuels IA · aucune certification réelle</span><span>Essais locaux. Feedbacks Eugénie / Rachid partagés ci-dessous.</span></div><div class="vtoast" role="status" aria-live="polite" hidden></div></div>`;
  }
  window.BeeReviewV2 = {
    render(p) {
      current = p;
      host = document.getElementById('interactive');
      if (!host.dataset.bound) {
        attachEvents();
        host.dataset.bound = 'true';
      }
      baseline = false;
      const toggle = document.getElementById('baseline-toggle');
      toggle.hidden = !p.baseline;
      toggle.textContent = 'Comparer avec l’écran initial';
      toggle.onclick = () => {
        baseline = !baseline;
        host.hidden = baseline;
        document.querySelector('.screenwrap').hidden = !baseline;
        toggle.textContent = baseline
          ? 'Revenir à l’écran enrichi'
          : 'Comparer avec l’écran initial';
      };
      host.hidden = !p.v2;
      document.querySelector('.screenwrap').hidden = !!p.v2;
      if (p.v2) draw();
      else host.innerHTML = '';
    },
    data() {
      return { role: current?.role, page: current?.id };
    },
  };
})();
