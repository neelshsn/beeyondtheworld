import fs from 'node:fs/promises';
const dir = 'src/lib/review/';
try {
  await fs.access(dir + 'gallery-v1.json');
} catch {
  await fs.copyFile(dir + 'gallery.json', dir + 'gallery-v1.json');
}
let html = JSON.parse(await fs.readFile(dir + 'gallery-v1.json', 'utf8'));
const start = html.indexOf('const D=') + 8,
  end = html.indexOf(';const $=', start),
  D = JSON.parse(html.slice(start, end));
const all = Object.keys(D.roles).concat(['set', 'sound']);
D.roles.set = { fr: 'Scénographie / set design', en: 'Head of Set Design' };
D.roles.sound = { fr: 'Création sonore', en: 'Head of Sound' };
D.guides.roles.set = {
  focus: 'Relier les décors, les artisans, les matières, les coûts et leur seconde vie.',
};
D.guides.roles.sound = {
  focus: 'Composer par chapitre à partir de sources sonores traçables et de droits documentés.',
};
const definitions = [
  ['connected-journey', 'One journey, connected', 'Le parcours et les connexions', 0, all, 'map'],
  [
    'label-creative',
    'The Bee Label / Creative Hive',
    'Bee Label · Creative Studio',
    3,
    [
      'bee',
      'art',
      'production',
      'brand',
      'expert',
      'stylist',
      'beauty',
      'set',
      'sound',
      'photo',
      'film',
      'editor',
      'model',
    ],
    'label',
  ],
  [
    'label-bloom',
    'The Bee Label / Bloom',
    'Bee Label · équipe de production',
    7,
    ['bee', 'production', 'art', 'brand', 'expert'],
    'label',
  ],
  [
    'beauty-library',
    'Nectar of Beauty',
    'Beauté · palettes, looks et matières',
    3,
    ['beauty', 'art', 'bee', 'production', 'brand', 'stylist'],
    'beauty',
  ],
  [
    'beauty-origin',
    'Beauty, rooted in place',
    'Beauté · origine et partenaires locaux',
    3,
    ['beauty', 'art', 'bee', 'production', 'expert'],
    'beauty-origin',
  ],
  [
    'designer-network',
    'Art of Wearing',
    'Stylisme · looks et designers locaux',
    3,
    ['stylist', 'art', 'bee', 'production', 'brand', 'model'],
    'styling',
  ],
  [
    'set-studio',
    'Set Design & Artists',
    'Décors · artistes et matières',
    3,
    ['set', 'art', 'bee', 'production', 'brand', 'photo', 'film'],
    'set',
  ],
  [
    'set-detail',
    'Look 02 / set design',
    'Décors · fiche, budget et seconde vie',
    5,
    ['set', 'art', 'bee', 'production', 'stylist', 'expert'],
    'set-detail',
  ],
  [
    'sound-studio',
    'Sound Tale',
    'Son · brief DA et musique par chapitre',
    3,
    ['sound', 'art', 'bee', 'production', 'film', 'editor', 'brand'],
    'sound',
  ],
  [
    'sound-map',
    'Sounds, rooted in place',
    'Son · territoire, talents et droits',
    4,
    ['sound', 'art', 'bee', 'production', 'film', 'editor', 'expert'],
    'sound-map',
  ],
  [
    'co-creation',
    'The co-creation bridge',
    'Co-création · aller-retour Bee et Flower',
    4,
    ['bee', 'art', 'production', 'stylist', 'beauty', 'set', 'sound', 'photo', 'film', 'ngo'],
    'bridge',
  ],
  [
    'authenticator',
    'Bee Authenticator',
    'Authentificator · origine des inspirations',
    3,
    [
      'bee',
      'art',
      'production',
      'beauty',
      'stylist',
      'set',
      'sound',
      'photo',
      'film',
      'editor',
      'expert',
    ],
    'auth',
  ],
  [
    'asset-passport',
    'The asset passport',
    'Passeport · droits, réemploi et provenance',
    10,
    all.filter((x) => x !== 'ngo'),
    'passport',
  ],
  [
    'my-commitments',
    'My Bee commitments',
    'Ma charte métier et mes preuves',
    5,
    all,
    'commitments',
  ],
  [
    'validation-desk',
    'The verification desk',
    'Revue des preuves et corrections',
    11,
    ['bee', 'expert', 'art', 'production', 'ngo'],
    'validation',
  ],
  [
    'brand-value',
    'Honey / value for your brand',
    'ROI · retours créatif, opérationnel et impact',
    12,
    ['bee', 'brand', 'art', 'production', 'expert'],
    'metrics',
  ],
  [
    'metric-trace',
    'Every number has a story',
    'Détail du calcul et des preuves',
    12,
    ['bee', 'brand', 'production', 'expert', 'ngo'],
    'trace',
  ],
  [
    'actor-ledger',
    'The value we create together',
    'Contributions et calculs de tous les acteurs',
    12,
    ['bee', 'production', 'art', 'brand', 'expert'],
    'ledger',
  ],
  [
    'impact-pillars',
    'People, place, planet',
    'Impact · social, environnemental, économique',
    11,
    ['bee', 'brand', 'ngo', 'expert', 'production'],
    'impact',
  ],
  [
    'post-chapters',
    'From chapters to final tales',
    'Postproduction · chapitres et validations',
    9,
    ['bee', 'art', 'production', 'brand', 'editor', 'photo', 'film', 'sound'],
    'post',
  ],
  [
    'tale-brief',
    'Let’s begin with an intention',
    'EUGE DA · 01 Brief & Brand',
    1,
    ['bee', 'art', 'brand', 'production'],
    'tale',
  ],
  [
    'tale-visions',
    'Mutual visions',
    'EUGE DA · 02 Valeurs communes',
    3,
    ['bee', 'art', 'brand', 'production', 'ngo'],
    'tale',
  ],
  [
    'tale-chapters',
    'The visual tale',
    'EUGE DA · 03 Chapitres et univers',
    3,
    ['bee', 'art', 'brand', 'production', 'photo', 'film', 'sound'],
    'tale',
  ],
  [
    'tale-hive',
    'The creative hive',
    'EUGE DA · 04 Talents et options',
    3,
    ['bee', 'art', 'brand', 'production'],
    'tale',
  ],
  [
    'tale-cocreation',
    'From vision to feasibility',
    'EUGE DA · 05 Co-création',
    4,
    ['bee', 'art', 'brand', 'production'],
    'tale',
  ],
  [
    'tale-bloom',
    'The journey comes to life',
    'EUGE DA · 06 Bloomboards',
    5,
    ['bee', 'art', 'brand', 'production', 'film', 'photo', 'sound'],
    'tale',
  ],
  [
    'tale-value',
    'A creation that creates value',
    'EUGE DA · 07 Impact & Multi-ROI',
    12,
    ['bee', 'art', 'brand', 'production'],
    'tale',
  ],
  [
    'tale-export',
    'Ready to tell the story',
    'EUGE DA · 08 Revue & présentation',
    10,
    ['bee', 'art', 'brand', 'production'],
    'tale',
  ],
];
for (const [id, title, fr, stage, roles, type] of definitions)
  for (const role of roles)
    D.pages.push({
      id,
      title,
      fr,
      stage,
      role,
      phase: D.guides.stages.find((s) => s.id === stage)?.title || 'Horizon',
      mode: ['bee', 'art'].includes(role) ? 'edit' : 'read',
      v2: type,
      note: 'Ébauche interactive du 15 octobre 2026. Simulation locale ; feedback partagé sur le VPS.',
      action: 'Explorer les connexions',
      fields: [],
    });
for (const p of D.pages) {
  if (p.id === 'creative-lock') {
    p.v2 = 'lock';
    p.baseline = true;
  }
  if (p.id === 'beauty') {
    p.v2 = 'beauty';
    p.baseline = true;
  }
  if (p.id === 'styling') {
    p.v2 = 'styling';
    p.baseline = true;
  }
}
D.revision = {
  date: '2026-10-15',
  original: 498,
  added: D.pages.length - 498,
  total: D.pages.length,
};
html = html.slice(0, start) + JSON.stringify(D).replaceAll('</', '<\\/') + html.slice(end);
html = html.replace('<style>', '<link rel="stylesheet" href="/review/v2.css?v=20261015"><style>');
html = html.replace(
  '<script>const D=',
  '<script src="/review/review-metrics.js?v=20261015"></script><script src="/review/v2.js?v=20261015"></script><script>const D='
);
html = html.replace(';const $=', ';window.BEE_REVIEW_DATA=D;const $=');
html = html.replace(
  '<div class="screenwrap">',
  '<div id="revision-tools"><label>Version <select id="revision"><option value="new">Nouveautés & écrans enrichis · 15 octobre</option><option value="all">Tous les écrans, y compris la version initiale</option></select></label><button id="baseline-toggle" hidden>Comparer avec l’écran initial</button></div><div id="interactive"></div><div class="screenwrap">'
);
html = html.replace(
  "D.pages.filter(p=>p.role===$('role').value&&",
  "D.pages.filter(p=>($('revision').value==='all'||p.v2)&&p.role===$('role').value&&"
);
html = html.replace('const n=pdf.index.find', 'const n=pdf?.index.find');
html = html.replace(
  "$('pdfpage').href=pdf.file+'#page='+n;",
  "$('pdfpage').hidden=!!p.v2;$('pdfpage').href=pdf?pdf.file+'#page='+n:'#';"
);
html = html.replace(
  "$('pdfpage').href='/review/carry-light/'+pdf.file+'#page='+n;",
  "$('pdfpage').hidden=!!p.v2;$('pdfpage').href=pdf?'/review/carry-light/'+pdf.file+'#page='+n:'#';"
);
html = html.replace(
  "$('screen').src='/review/",
  "window.BeeReviewV2.render(p);$('screen').src='/review/"
);
html = html.replace(
  "window.BeeReviewV2.render(p);$('screen').src=",
  "window.BeeReviewV2.render(p);if(!p.v2||p.baseline)$('screen').src="
);
html = html.replace(
  "$('role').onchange=",
  "$('revision').onchange=()=>filter(current[i]?.id);$('role').onchange="
);
html = html.replace(
  "filter(route[2]||'frame');",
  "if(route[2]&&!D.pages.find(p=>p.id===route[2]&&p.role===$('role').value)?.v2)$('revision').value='all';filter(route[2]||'connected-journey');"
);
html = html.replace(
  'filter(route[2]);',
  "if(!D.pages.find(p=>p.id===route[2]&&p.role===route[1])?.v2)$('revision').value='all';filter(route[2]);"
);
html = html.replace(
  'filter(r[2]);',
  "if(!D.pages.find(p=>p.id===r[2]&&p.role===r[1])?.v2)$('revision').value='all';filter(r[2]);"
);
html = html.replace("['SELECT','INPUT']", "['SELECT','INPUT','TEXTAREA','BUTTON','A','AUDIO']");
html = html.replace(
  "['SELECT','INPUT','TEXTAREA']",
  "['SELECT','INPUT','TEXTAREA','BUTTON','A','AUDIO']"
);
html = html
  .replaceAll('498 écrans', '694 vues')
  .replaceAll('12 métiers', '14 métiers')
  .replace('/review/feedback.js"', '/review/feedback.js?v=20261015"');
html = html
  .replaceAll('Une production entière · 12 métiers', 'Une production entière · 14 métiers')
  .replace(
    'Carry the light — les 12 parcours métiers',
    'Beeyond · les métiers, la création et les preuves'
  );
html = html.replace(
  'Une production imaginée pour voir le parcours en situation : un brief rempli, deux looks, une équipe, le scouting, le plateau, les versions et le bilan.',
  'Une production imaginée, enrichie avec le Creative Studio, Bloom, les métiers artistiques, le Bee Label, la provenance et les trois retours pour la marque.'
);
html = html.replace(
  'Chaque vue reprend les composants du dashboard avec les données de ce cas. Cliquez sur l’image pour l’agrandir.',
  'Les nouveautés sont interactives : carrousels, connexions, formulaires et calculs. Les essais restent sur cet appareil ; les feedbacks et leurs images sont partagés entre Eugénie et Rachid.'
);
html = html.replace(
  'Galerie de captures : les commandes à l’intérieur des images ne sont pas cliquables. Aucun enregistrement dans les données réelles. Les réservations, accords et preuves montrés sont des exemples de parcours.',
  'Les vues initiales restent des captures. Les nouveaux écrans sont une ébauche interactive : aucun accord réel, paiement ou certification n’est émis. Vos retours restent attachés au métier et à la page.'
);
html = html
  .replace('Un PDF pour chaque métier.', 'Les guides de la version initiale.')
  .replace(
    'Parcours A à Z cliquable, captures en grand format, rôle de chaque écran et passages de relais en français.',
    'Archives du 11 octobre : les nouveaux écrans du 15 octobre sont accessibles dans le comparateur ci-dessus.'
  );
html = html.replace(
  '<section id="experience"',
  '<section id="revision-report" class="section"><div class="eyebrow">Mise à jour · 15 octobre 2026</div><h2>Les connexions prennent forme.</h2><p>Deux nouveaux métiers, les chartes Hive et Bloom, l’Authentificator, huit pages de présentation Tales et un bilan dont chaque chiffre explique sa provenance.</p><div class="links"><a class="btn primary" href="#view/bee/connected-journey">Voir le parcours complet</a><a class="btn" href="#view/beauty/beauty-library">Nectar of Beauty</a><a class="btn" href="#view/brand/brand-value">ROI & preuves</a><a class="btn" href="/review/oct15/report.html" target="_blank" rel="noopener">Rapport des changements</a></div></section><section id="experience"'
);
await fs.writeFile(dir + 'gallery.json', JSON.stringify(html));
await fs.writeFile(
  dir + 'screen-keys.json',
  JSON.stringify(
    D.pages.map((p) => `${p.role}/${p.id}`),
    null,
    2
  ) + '\n'
);
await fs.writeFile(
  'public/review/oct15/catalogue.json',
  JSON.stringify({ revision: D.revision, definitions, roles: D.roles }, null, 2)
);
console.log(JSON.stringify(D.revision));
