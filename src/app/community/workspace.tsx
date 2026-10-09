'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  Bell,
  Check,
  ChevronDown,
  Download,
  ExternalLink,
  FileText,
  Flower2,
  Hexagon,
  Leaf,
  LoaderCircle,
  LogOut,
  MapPin,
  Menu,
  Plus,
  Search,
  ShieldCheck,
  Users,
  X,
  CalendarDays,
  Layers,
  Clock,
  Coins,
  Pencil,
  Paperclip,
  LockKeyhole,
  AlertCircle,
} from 'lucide-react';
import { availableTransitions, canEdit, kinds, statusLabel } from '@/lib/community/model';
import { calculateMetrics, factors } from '@/lib/community/metrics';
import { roleNames, type CommunityRecord, type Workspace, type Field } from '@/lib/community/types';

const art = '/assets/community/namibia.webp';
const garden = '/assets/community/garden.webp';
const photo = '/assets/campaigns/craie-maroc/craie-maroc-gallery-01.jpg';
const photo2 = '/assets/campaigns/craie-maroc/craie-maroc-gallery-03.jpg';
const money = (n: unknown) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);
const date = (v: unknown) =>
  v
    ? new Date(String(v)).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'To be scheduled';
const viewInfo: Record<
  string,
  { title: string; kicker: string; description: string; kinds: string[] }
> = {
  overview: {
    title: 'Namibia',
    kicker: 'YOUR SHARED JOURNEY',
    description: 'A creative intention. A shared journey. Something that remains.',
    kinds: [],
  },
  creatives: {
    title: 'Essence of intentions.',
    kicker: '01 / BEE · CONCEPTION',
    description:
      'Shape the creative truth. Bring the brief, visual direction and approvals together.',
    kinds: ['brief', 'concept'],
  },
  trust: {
    title: 'Partner with impact.',
    kicker: '01 / BEE · TRUST JOURNEY',
    description:
      'Human connection comes first. Document identity, expertise and local presence for Bee review.',
    kinds: ['trust'],
  },
  team: {
    title: 'Shape your hive.',
    kicker: '01 / BEE · PEOPLE & PREPARATION',
    description:
      'One creative direction. Many complementary talents. Clear responsibilities for every handoff.',
    kinds: ['task'],
  },
  scouting: {
    title: 'A sense of place.',
    kicker: '01 / BEE · SCOUTING',
    description: 'Find the light, understand the place and prepare each frame.',
    kinds: ['location'],
  },
  bloom: {
    title: 'From intention to bloom.',
    kicker: '01 / BEE · DESIGN & ACTIONS',
    description:
      'Turn shared intentions into a practical plan with a baseline, owner and milestones.',
    kinds: ['bloom'],
  },
  production: {
    title: 'Journey of creation.',
    kicker: '02 / FLOWER · PRODUCTION',
    description:
      'From preparation to the field. Coordinate the shoot and carry the creative intention through.',
    kinds: ['production', 'task'],
  },
  bookings: {
    title: 'Travel with intention.',
    kicker: '02 / FLOWER · LOGISTICS',
    description:
      'Local people, thoughtful resources and traceable decisions. Plan each booking at source.',
    kinds: ['booking'],
  },
  capital: {
    title: 'Capital, made tangible.',
    kicker: '02 / FLOWER · CAPITAL TRACE',
    description:
      'Follow commitments and allocations into action. Recorded movements do not initiate payments.',
    kinds: ['allocation', 'expense'],
  },
  field: {
    title: 'Actions that take root.',
    kicker: '02 / FLOWER · FIELD ACTIONS',
    description:
      'Record what happens on the ground, with context and proof attached to each action.',
    kinds: ['action'],
  },
  evidence: {
    title: 'Beauty creates attention.\nEvidence creates trust.',
    kicker: '02 / FLOWER · PROOF & EVIDENCE',
    description:
      'A clear trail from the field to human review. Every source keeps its date, context and history.',
    kinds: ['evidence'],
  },
  assets: {
    title: 'Visual tales.',
    kicker: '03 / HONEY · CREATIVE DELIVERY',
    description:
      'Select, refine and deliver. Keep every version, approval and usage right in one place.',
    kinds: ['asset'],
  },
  honey: {
    title: 'What remains.',
    kicker: '03 / HONEY · IMPACT & VALUE',
    description:
      'Specific actions. Visible evidence. Social, environmental and economic value, with its limits made clear.',
    kinds: ['result'],
  },
  activity: {
    title: 'The thread of your journey.',
    kicker: 'PROJECT HISTORY',
    description: 'Changes, decisions and handoffs, linked to the person and record behind them.',
    kinds: [],
  },
};
const navGroups = [
  {
    name: 'BEE',
    subtitle: 'Imagine & prepare',
    icon: Hexagon,
    items: [
      ['creatives', 'Creatives'],
      ['trust', 'Trust journey'],
      ['team', 'The hive'],
      ['scouting', 'Scouting'],
      ['bloom', 'Bloom design'],
    ],
  },
  {
    name: 'FLOWER',
    subtitle: 'Make & act',
    icon: Flower2,
    items: [
      ['production', 'Production'],
      ['bookings', 'Bookings'],
      ['capital', 'Capital & expenses'],
      ['field', 'Field actions'],
      ['evidence', 'Proof & evidence'],
    ],
  },
  {
    name: 'HONEY',
    subtitle: 'Reveal & grow',
    icon: Layers,
    items: [
      ['assets', 'Visual tales'],
      ['honey', 'Impact & reporting'],
    ],
  },
];
function Badge({ status }: { status: string }) {
  const good = [
    'approved',
    'verified',
    'validated',
    'expert_validated',
    'delivered',
    'complete',
    'locked',
    'released',
    'bee_reviewed',
  ].includes(status);
  return (
    <span className={`bee-badge ${good ? 'good' : status === 'needs_update' ? 'attention' : ''}`}>
      <span />
      {statusLabel(status)}
    </span>
  );
}
function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="bee-eyebrow">{children}</p>;
}
function Symbol({ phase }: { phase: 'bee' | 'flower' | 'honey' }) {
  return phase === 'bee' ? <Hexagon /> : phase === 'flower' ? <Flower2 /> : <Layers />;
}
async function api(url: string, init?: RequestInit) {
  const res = await fetch(url, { ...init, cache: 'no-store' });
  const data = await res.json();
  if (!res.ok) throw Error(data.error || 'Please try again.');
  return data;
}

export function CommunityApp() {
  const [w, setW] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginNeeded, setLoginNeeded] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState('overview');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [mobile, setMobile] = useState(false);
  const [selected, setSelected] = useState<CommunityRecord | null>(null);
  const [editing, setEditing] = useState<CommunityRecord | null>(null);
  const [creating, setCreating] = useState('');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');
  const [notifications, setNotifications] = useState(false);
  const activeId = useRef('');
  const load = useCallback(async (project?: string) => {
    setError('');
    try {
      const data = await api(
        '/api/community/workspace' + (project ? '?project=' + encodeURIComponent(project) : '')
      );
      setW(data);
      activeId.current = data.project.id;
      setLoginNeeded(false);
      setSelected((old) =>
        old ? data.records.find((r: CommunityRecord) => r.id === old.id) || null : null
      );
    } catch (e) {
      const auth = await fetch('/api/community/auth')
        .then((r) => r.json())
        .catch(() => ({}));
      if (!auth.user) setLoginNeeded(true);
      else setError(e instanceof Error ? e.message : 'Unable to load.');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const v = p.get('view');
    if (v && viewInfo[v]) setView(v);
    void load(p.get('project') || undefined);
  }, [load]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 5000);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    if (!mobile) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const escape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobile(false);
    };
    window.addEventListener('keydown', escape);
    return () => {
      document.body.style.overflow = old;
      window.removeEventListener('keydown', escape);
    };
  }, [mobile]);
  const navigate = (next: string) => {
    setView(next);
    setQuery('');
    setStatus('all');
    setMobile(false);
    setNotifications(false);
    window.history.replaceState(null, '', `/community?project=${activeId.current}&view=${next}`);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  async function logout() {
    try {
      await api('/api/community/auth', { method: 'DELETE' });
      setW(null);
      setLoginNeeded(true);
      setSelected(null);
    } catch (e) {
      setError(String(e));
    }
  }
  async function changeRecord(r: CommunityRecord, to: string, comment = '') {
    setBusy(true);
    try {
      await api('/api/community/records', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: w?.project.id,
          id: r.id,
          version: r.version,
          to,
          comment,
        }),
      });
      await load(activeId.current);
      setToast('Decision saved. The project history has been updated.');
    } catch (e) {
      setToast(e instanceof Error ? e.message : 'Could not save.');
    } finally {
      setBusy(false);
    }
  }
  async function saveRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!w) return;
    const f = new FormData(event.currentTarget);
    const data: Record<string, string | number> = {};
    const kind = editing?.kind || creating;
    for (const field of kinds[kind].fields) {
      const val = f.get(field.key);
      if (val !== null && val !== '')
        data[field.key] = field.type === 'number' ? Number(val) : String(val);
    }
    setBusy(true);
    try {
      const saved = await api('/api/community/records', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: w.project.id,
          id: editing?.id,
          version: editing?.version,
          kind,
          title: f.get('title'),
          data,
        }),
      });
      setCreating('');
      setEditing(null);
      await load(w.project.id);
      const refreshed = await api('/api/community/workspace?project=' + w.project.id);
      setW(refreshed);
      setSelected(refreshed.records.find((r: CommunityRecord) => r.id === saved.id));
      setToast('Saved to your project.');
    } catch (e) {
      setToast(e instanceof Error ? e.message : 'Could not save.');
    } finally {
      setBusy(false);
    }
  }
  function exportReport() {
    if (!w) return;
    const esc = (v: unknown) =>
      '"' +
      String(v ?? '')
        .replace(/^[=+@-]/, "'$&")
        .replaceAll('"', '""') +
      '"';
    const rows = [
      ['Project', 'Demo', 'Type', 'Title', 'Status', 'Data', 'Updated'],
      ...w.records.map((r) => [
        w.project.title,
        w.project.is_demo ? 'DEMO / NOT ACTUAL RESULTS' : 'No',
        kinds[r.kind]?.label,
        r.title,
        r.status,
        JSON.stringify(r.data),
        r.updated_at,
      ]),
    ];
    const blob = new Blob(['\uFEFF' + rows.map((row) => row.map(esc).join(',')).join('\r\n')], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bee-project-report.csv';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setToast('Report exported with the records visible to your role.');
  }
  if (loading)
    return (
      <div className="bee-app bee-loading">
        <LoaderCircle className="bee-spin" />
        <span>Opening your journey…</span>
      </div>
    );
  if (loginNeeded)
    return (
      <Login
        onSuccess={() => {
          setLoading(true);
          void load();
        }}
      />
    );
  if (!w)
    return (
      <div className="bee-app bee-loading">
        <AlertCircle />
        <p>{error || 'No project is assigned to this account.'}</p>
        <button className="bee-button" onClick={() => void load()}>
          Try again
        </button>
        <button className="bee-link" onClick={logout}>
          Sign out
        </button>
      </div>
    );
  const ngo = w.project.role === 'ngo';
  const info = viewInfo[view];
  const allowed = (key: string) =>
    key === 'overview' ||
    key === 'activity' ||
    viewInfo[key].kinds.some((k) => kinds[k].read.includes(w.project.role));
  const visibleRecords = w.records
    .filter((r) => info.kinds.includes(r.kind))
    .filter(
      (r) =>
        !query || `${r.title} ${JSON.stringify(r.data)}`.toLowerCase().includes(query.toLowerCase())
    )
    .filter((r) => status === 'all' || r.status === status);
  const nextActions = w.records.filter(
    (r) =>
      availableTransitions(w.project.role, r, w.user).length > 0 &&
      !['delivered', 'complete', 'released'].includes(r.status)
  );
  const stats = calculateMetrics(w.records);
  const isHoney =
    view === 'honey' ||
    ngo ||
    view === 'trust' ||
    view === 'bloom' ||
    view === 'field' ||
    view === 'evidence';
  return (
    <div
      className={`bee-app ${isHoney ? 'bee-warm' : ''}`}
      style={{ '--bee-scene': `url("${isHoney ? garden : art}")` } as React.CSSProperties}
    >
      <a className="bee-skip" href="#bee-main">
        Skip to workspace
      </a>
      <aside className={`bee-sidebar ${mobile ? 'open' : ''}`} aria-label="Workspace navigation">
        <Link className="bee-wordmark" href="/" aria-label="Beeyondtheworld home">
          <Image width={960} height={640} src="/assets/icones/Ico Gold BEE-13.svg" alt="" />
          <span>
            BEE<span>BEYONDTHEWORLD</span>
          </span>
        </Link>
        <button
          className={`bee-overview-link ${view === 'overview' ? 'active' : ''}`}
          onClick={() => navigate('overview')}
        >
          <span className="bee-project-dot" />
          My journey
          <ArrowUpRight size={15} />
        </button>
        <nav>
          {navGroups.map((g) => {
            const items = g.items.filter(([key]) => allowed(key));
            if (!items.length) return null;
            return (
              <div className="bee-nav-group" key={g.name}>
                <p>
                  <g.icon />
                  <span>
                    {g.name}
                    <small>{g.subtitle}</small>
                  </span>
                </p>
                {items.map(([key, label]) => (
                  <button
                    key={key}
                    className={view === key ? 'active' : ''}
                    aria-current={view === key ? 'page' : undefined}
                    onClick={() => navigate(key)}
                  >
                    {label}
                    {view === key && <span />}
                  </button>
                ))}
              </div>
            );
          })}
        </nav>
        <div className="bee-sidebar-bottom">
          <button onClick={() => navigate('activity')}>
            <Clock />
            Project history
          </button>
          <button onClick={logout}>
            <LogOut />
            Sign out
          </button>
          <p>FROM INTENTION TO BLOOM.</p>
        </div>
      </aside>
      {mobile && (
        <button
          className="bee-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <div className="bee-workspace">
        <header className="bee-topbar">
          <button
            className="bee-icon-button bee-mobile-menu"
            aria-label="Open navigation"
            aria-expanded={mobile}
            onClick={() => setMobile(!mobile)}
          >
            <Menu />
          </button>
          <div className="bee-project-switch">
            <MapPin size={15} />
            <label className="sr-only" htmlFor="bee-project">
              Project
            </label>
            <select
              id="bee-project"
              value={w.project.id}
              onChange={(e) => {
                setSelected(null);
                void load(e.target.value);
              }}
            >
              {w.projects.map((p) => (
                <option value={p.id} key={p.id}>
                  {p.title} · {p.season}
                </option>
              ))}
            </select>
            <ChevronDown size={13} />
          </div>
          <div className="bee-topbar-right">
            <span className="bee-demo">
              {w.project.is_demo ? 'DEMO WORKSPACE' : w.project.territory}
            </span>
            <button
              className="bee-icon-button bee-notify"
              aria-label={`Notifications: ${nextActions.length} ${nextActions.length === 1 ? 'item needs' : 'items need'} attention`}
              onClick={() => setNotifications(!notifications)}
            >
              <Bell size={19} />
              {nextActions.length > 0 && <span />}
            </button>
            <div className="bee-avatar" title={w.user.name}>
              {w.user.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div className="bee-user">
              <strong>{w.user.name}</strong>
              <small>{roleNames[w.project.role]}</small>
            </div>
          </div>
        </header>
        {notifications && (
          <section className="bee-notifications" aria-label="Items needing attention">
            <h2>Your next steps</h2>
            {nextActions.length ? (
              nextActions.slice(0, 7).map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setSelected(r);
                    setNotifications(false);
                  }}
                >
                  <span>
                    {r.title}
                    <small>
                      {statusLabel(r.status)} · {kinds[r.kind].label}
                    </small>
                  </span>
                  <ArrowUpRight size={16} />
                </button>
              ))
            ) : (
              <p>You are up to date.</p>
            )}
          </section>
        )}
        <main id="bee-main" className="bee-main">
          {error && (
            <div role="alert" className="bee-error">
              {error}
              <button onClick={() => void load(activeId.current)}>Retry</button>
            </div>
          )}
          {view === 'overview' ? (
            <>
              <section className="bee-hero">
                <div className="bee-hero-copy">
                  <Eyebrow>
                    {ngo ? 'YOUR IMPACT JOURNEY' : 'ONE PROJECT. A WORLD OF POSSIBILITIES.'}
                  </Eyebrow>
                  <h1>{ngo ? 'A living legacy.' : w.project.title}</h1>
                  <p className="bee-hero-subtitle">
                    {ngo
                      ? 'From shared intentions to lasting local value.'
                      : 'Where intention becomes creation.'}
                  </p>
                  <div className="bee-meta">
                    <span>
                      <MapPin />
                      {w.project.territory}
                    </span>
                    <span>
                      <CalendarDays />
                      {w.project.season}
                    </span>
                    <span>
                      {date(w.project.starts_on)} — {date(w.project.ends_on)}
                    </span>
                  </div>
                  <button
                    className="bee-button"
                    onClick={() =>
                      nextActions[0]
                        ? setSelected(nextActions[0])
                        : navigate(ngo ? 'field' : 'creatives')
                    }
                  >
                    {ngo ? 'Continue your bloom' : 'Continue the journey'}
                    <ArrowRight size={16} />
                  </button>
                </div>
                <div className="bee-hero-art" aria-hidden>
                  <Image width={960} height={640} src={ngo ? garden : art} alt="" />
                  <div className="bee-art-caption">
                    {ngo ? 'THE BLOOMING GARDEN' : 'NAMIB DESERT'}
                    <span>Creative landscape · illustrative</span>
                  </div>
                </div>
              </section>
              <section className="bee-phase-path" aria-label="Journey stages">
                {[
                  {
                    phase: 'bee',
                    name: 'Bee',
                    text: 'Imagine & prepare',
                    dest: ngo ? 'bloom' : 'creatives',
                  },
                  {
                    phase: 'flower',
                    name: 'Flower',
                    text: 'Make & act',
                    dest: ngo ? 'field' : 'production',
                  },
                  { phase: 'honey', name: 'Honey', text: 'Reveal & grow', dest: 'honey' },
                ].map((p, i) => (
                  <button key={p.phase} onClick={() => navigate(p.dest)}>
                    <span className="bee-phase-number">0{i + 1}</span>
                    <Symbol phase={p.phase as 'bee' | 'flower' | 'honey'} />
                    <span>
                      <strong>{p.name}</strong>
                      <small>{p.text}</small>
                    </span>
                    <ArrowUpRight />
                  </button>
                ))}
              </section>
              <div className="bee-overview-grid">
                <section>
                  <div className="bee-section-heading">
                    <div>
                      <Eyebrow>THE JOURNEY, AT A GLANCE</Eyebrow>
                      <h2>{ngo ? 'Your bloom in motion' : 'A shared creative world'}</h2>
                    </div>
                    <button
                      className="bee-link"
                      onClick={() => navigate(ngo ? 'field' : 'scouting')}
                    >
                      Explore
                      <ArrowUpRight size={15} />
                    </button>
                  </div>
                  <div className="bee-story-grid">
                    {(ngo
                      ? [
                          {
                            image: garden,
                            title: 'Field actions',
                            sub: 'Make your intentions tangible',
                            dest: 'field',
                          },
                          {
                            image: art,
                            title: 'Proof & evidence',
                            sub: 'Attach context to every action',
                            dest: 'evidence',
                          },
                          {
                            image: garden,
                            title: 'Honey',
                            sub: 'See what has been validated',
                            dest: 'honey',
                          },
                        ]
                      : [
                          {
                            image: art,
                            title: 'The places',
                            sub: 'Light, landscape & possibilities',
                            dest: 'scouting',
                          },
                          {
                            image: photo,
                            title: 'The creative direction',
                            sub: 'A visual language, together',
                            dest: 'creatives',
                          },
                          {
                            image: photo2,
                            title: 'The visual tales',
                            sub: 'From the first frame to delivery',
                            dest: 'assets',
                          },
                        ]
                    ).map((c, i) => (
                      <button key={c.title} className="bee-story" onClick={() => navigate(c.dest)}>
                        <Image width={960} height={640} src={c.image} alt="" />
                        <span className="bee-story-index">0{i + 1}</span>
                        <span className="bee-story-title">
                          <strong>{c.title}</strong>
                          <small>{c.sub}</small>
                        </span>
                        <ArrowUpRight />
                      </button>
                    ))}
                  </div>
                </section>
                <section className="bee-next-panel">
                  <Eyebrow>YOUR NEXT MEANINGFUL STEP</Eyebrow>
                  <h2>{nextActions[0]?.title || 'Everything is in place.'}</h2>
                  <p>
                    {nextActions[0]
                      ? `${kinds[nextActions[0].kind].label} · ${statusLabel(nextActions[0].status)}`
                      : 'Explore the project or prepare the next chapter.'}
                  </p>
                  {nextActions[0] && (
                    <button
                      className="bee-button outline"
                      onClick={() => setSelected(nextActions[0])}
                    >
                      Open & review
                      <ArrowRight size={16} />
                    </button>
                  )}
                  <div className="bee-mini-stats">
                    <span>
                      <strong>
                        {w.records.filter((r) => r.kind === (ngo ? 'evidence' : 'asset')).length}
                      </strong>
                      {ngo ? 'Evidence records' : 'Creative assets'}
                    </span>
                    <span>
                      <strong>{w.records.filter((r) => r.kind === 'action').length}</strong>Field
                      actions
                    </span>
                    <span>
                      <strong>{stats.validated.length}</strong>Validated indicators
                    </span>
                  </div>
                </section>
              </div>
              <section className="bee-recent">
                <div className="bee-section-heading">
                  <h2>The latest in your journey</h2>
                  <button className="bee-link" onClick={() => navigate('activity')}>
                    View history
                    <ArrowUpRight size={15} />
                  </button>
                </div>
                {w.events.slice(0, 3).map((e) => (
                  <button
                    key={e.id}
                    onClick={() => setSelected(w.records.find((r) => r.id === e.record_id) || null)}
                  >
                    <span className="bee-event-dot" />
                    <span>
                      <strong>{w.records.find((r) => r.id === e.record_id)?.title}</strong>
                      <small>
                        {e.actor} · {statusLabel(e.action)} · {statusLabel(e.new_state)}
                      </small>
                    </span>
                    <time>{date(e.created_at)}</time>
                    <ArrowUpRight size={16} />
                  </button>
                ))}
                {!w.events.length && (
                  <p className="bee-empty-inline">
                    Your project history will appear here as the team contributes.
                  </p>
                )}
              </section>
            </>
          ) : (
            <>
              <section className="bee-page-heading">
                <div>
                  <Eyebrow>{info.kicker}</Eyebrow>
                  <h1>{view === 'capital' && ngo ? 'Impact Capital.' : info.title}</h1>
                  <p>{info.description}</p>
                </div>
                <div className="bee-heading-actions">
                  {view === 'honey' && (
                    <button className="bee-button outline" onClick={exportReport}>
                      <Download size={16} />
                      Export report
                    </button>
                  )}
                  {info.kinds
                    .filter((k) => kinds[k].roles.includes(w.project.role))
                    .map((k) => (
                      <button
                        className="bee-button"
                        key={k}
                        onClick={() => {
                          setEditing(null);
                          setCreating(k);
                        }}
                      >
                        <Plus size={16} />
                        {kinds[k].label}
                      </button>
                    ))}
                </div>
              </section>
              {view === 'team' && (
                <section className="bee-hive">
                  {w.members.map((m) => (
                    <div key={m.id}>
                      <span className="bee-member-avatar">
                        {m.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </span>
                      <h3>{m.name}</h3>
                      <p>{roleNames[m.role]}</p>
                      <small>{m.organization}</small>
                    </div>
                  ))}
                </section>
              )}
              {view === 'scouting' && (
                <div className="bee-scout-banner">
                  <Image
                    width={960}
                    height={640}
                    src={art}
                    alt="Illustrative Namib desert landscape"
                  />
                  <div>
                    <Eyebrow>SCOUTING AT GOLDEN HOUR</Eyebrow>
                    <h2>Every place has a story.</h2>
                    <p>
                      Capture the location, light, permits and creative possibilities before the
                      shoot.
                    </p>
                  </div>
                </div>
              )}
              {view === 'production' && (
                <section className="bee-production-stages">
                  {['Planning', 'Ready to produce', 'On set', 'Post-production', 'Delivery'].map(
                    (s, i) => (
                      <div key={s}>
                        <span>0{i + 1}</span>
                        {s}
                      </div>
                    )
                  )}
                </section>
              )}
              {view === 'capital' && (
                <section className="bee-capital-strip">
                  <Metric
                    icon={<Coins />}
                    value={money(
                      w.records
                        .filter(
                          (r) => r.kind === 'allocation' && (ngo ? r.data.layer === 'Impact' : true)
                        )
                        .reduce((a, r) => a + Number(r.data.amount || 0), 0)
                    )}
                    label={ngo ? 'Impact Capital allocated' : 'Visible allocations'}
                  />
                  <Metric
                    icon={<ArrowUpRight />}
                    value={money(stats.spent)}
                    label="Approved impact expenses"
                  />
                  <Metric
                    icon={<ShieldCheck />}
                    value={stats.coverage === null ? '—' : Math.round(stats.coverage * 100) + '%'}
                    label="Expense evidence coverage"
                  />
                </section>
              )}
              {view === 'bookings' && (
                <div className="bee-note">
                  <Leaf />
                  <div>
                    <strong>Production footprint · {stats.footprint.toFixed(1)} kgCO₂e</strong>
                    <p>
                      Planning estimate from {stats.bookings} approved bookings. Activity × factor,
                      from the supplied Bee carbon framework. Positive impact is reported
                      separately.
                    </p>
                  </div>
                </div>
              )}
              {view === 'honey' && (
                <>
                  <section className="bee-pillar-grid">
                    {[
                      {
                        title: 'Social',
                        icon: Users,
                        sub: 'People, culture, stronger communities.',
                      },
                      {
                        title: 'Environmental',
                        icon: Leaf,
                        sub: 'Care for the places that inspire us.',
                      },
                      { title: 'Economic', icon: Coins, sub: 'Creating long-term local value.' },
                    ].map((p, i) => {
                      const vals = stats.validated.filter((r) => r.data.pillar === p.title);
                      return (
                        <button
                          key={p.title}
                          className="bee-pillar"
                          onClick={() => setQuery(query === p.title ? '' : p.title)}
                          style={{
                            backgroundImage: `linear-gradient(0deg,rgba(29,18,10,.97),rgba(40,32,20,.08)),url('${i === 1 ? art : garden}')`,
                          }}
                        >
                          <p>
                            <p.icon />
                            <span>0{i + 1}</span>
                          </p>
                          <h2>{p.title}</h2>
                          <small>{p.sub}</small>
                          <div>
                            <strong>{vals.length}</strong>validated indicators
                            <ArrowRight size={16} />
                          </div>
                        </button>
                      );
                    })}
                  </section>
                  <div className="bee-note">
                    <ShieldCheck />
                    <div>
                      <strong>Evidence before claims.</strong>
                      <p>
                        {w.project.is_demo
                          ? 'This workspace contains fictional test data. It is not a report of actual project performance.'
                          : 'Only indicators with a completed human review count as validated results.'}{' '}
                        Financial value, production footprint and local impact are shown separately.
                        A Bee review is not a sustainability certification.
                      </p>
                    </div>
                  </div>
                </>
              )}
              {view === 'activity' ? (
                <section className="bee-history">
                  {w.events.map((e) => (
                    <article key={e.id}>
                      <span className="bee-event-dot" />
                      <time>{new Date(e.created_at).toLocaleString('en-GB')}</time>
                      <div>
                        <h3>{w.records.find((r) => r.id === e.record_id)?.title}</h3>
                        <p>
                          {e.actor} · {statusLabel(e.action)} ·{' '}
                          {e.previous_state ? statusLabel(e.previous_state) + ' → ' : ''}
                          {statusLabel(e.new_state)}
                        </p>
                        {e.comment && <blockquote>{e.comment}</blockquote>}
                      </div>
                      <button
                        className="bee-icon-button"
                        aria-label="Open record"
                        onClick={() =>
                          setSelected(w.records.find((r) => r.id === e.record_id) || null)
                        }
                      >
                        <ArrowUpRight />
                      </button>
                    </article>
                  ))}
                </section>
              ) : (
                <>
                  <div className="bee-filterbar">
                    <div className="bee-search">
                      <Search size={17} />
                      <input
                        aria-label="Search records"
                        placeholder="Find in this chapter…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                      {query && (
                        <button aria-label="Clear search" onClick={() => setQuery('')}>
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    <label>
                      <span className="sr-only">Filter by status</span>
                      <select value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="all">All statuses</option>
                        {Array.from(
                          new Set(
                            w.records
                              .filter((r) => info.kinds.includes(r.kind))
                              .map((r) => r.status)
                          )
                        ).map((s) => (
                          <option key={s} value={s}>
                            {statusLabel(s)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <span>
                      {visibleRecords.length} {visibleRecords.length === 1 ? 'record' : 'records'}
                    </span>
                  </div>
                  <section
                    className={`bee-records ${['scouting', 'assets', 'bloom'].includes(view) ? 'visual' : ''}`}
                    aria-label={info.title}
                  >
                    {visibleRecords.map((r) => (
                      <RecordCard
                        key={r.id}
                        r={r}
                        onClick={() => setSelected(r)}
                        visual={['scouting', 'assets', 'bloom'].includes(view)}
                      />
                    ))}
                    {!visibleRecords.length && (
                      <div className="bee-empty">
                        <Flower2 />
                        <h2>
                          {query || status !== 'all'
                            ? 'No matching records.'
                            : 'A new chapter is waiting.'}
                        </h2>
                        <p>
                          {query || status !== 'all'
                            ? 'Try another search or status.'
                            : 'Start with the action above. Your team will see the same project as it takes shape.'}
                        </p>
                        {(query || status !== 'all') && (
                          <button
                            className="bee-button outline"
                            onClick={() => {
                              setQuery('');
                              setStatus('all');
                            }}
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    )}
                  </section>
                </>
              )}
            </>
          )}
          <footer className="bee-footer">
            <span>BEEYONDTHEWORLD</span>
            <p>
              The Bee carries an intention. The Flower gives it life. The Honey is what remains.
            </p>
            <small>
              {w.project.is_demo
                ? 'Demonstration · fictional project data'
                : 'Private project workspace'}{' '}
              · Ambient visuals are illustrative.
            </small>
          </footer>
        </main>
      </div>
      {toast && (
        <div className="bee-toast" role="status">
          <span>{toast}</span>
          <button aria-label="Dismiss notification" onClick={() => setToast('')}>
            <X size={16} />
          </button>
        </div>
      )}
      {selected && !editing && !creating && (
        <Detail
          r={selected}
          w={w}
          busy={busy}
          onClose={() => setSelected(null)}
          onEdit={() => setEditing(selected)}
          onTransition={changeRecord}
          reload={() => load(w.project.id)}
          onToast={setToast}
        />
      )}
      {(creating || editing) && (
        <Modal
          onClose={() => {
            setCreating('');
            setEditing(null);
          }}
          title={editing ? 'Edit ' + kinds[editing.kind].label : 'New ' + kinds[creating].label}
        >
          <form className="bee-form" onSubmit={saveRecord}>
            <label>
              Title
              <input
                name="title"
                required
                maxLength={160}
                defaultValue={editing?.title}
                autoFocus
              />
            </label>
            {kinds[editing?.kind || creating].fields.map((f) => (
              <FieldInput key={f.key} field={f} record={editing} w={w} />
            ))}
            <div className="bee-form-foot">
              <p>Saved as a draft. Review and submit when ready.</p>
              <button className="bee-button" disabled={busy} type="submit">
                {busy ? <LoaderCircle className="bee-spin" size={16} /> : <Check size={16} />}Save{' '}
                {editing ? 'changes' : 'draft'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Metric({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <div className="bee-metric">
      {icon}
      <span>
        <strong>{value}</strong>
        <small>{label}</small>
      </span>
    </div>
  );
}
function RecordCard({
  r,
  onClick,
  visual,
}: {
  r: CommunityRecord;
  onClick: () => void;
  visual: boolean;
}) {
  const source = r.kind === 'bloom' ? garden : r.kind === 'asset' ? photo : art;
  return (
    <button className="bee-record" type="button" aria-label={`Open ${r.title}`} onClick={onClick}>
      {visual && (
        <div className="bee-record-image">
          <Image width={960} height={640} src={source} alt="" />
          <span>Illustrative visual</span>
        </div>
      )}
      <div className="bee-record-body">
        <div className="bee-record-top">
          <Eyebrow>{kinds[r.kind]?.label}</Eyebrow>
          <Badge status={r.status} />
        </div>
        <h2>{r.title}</h2>
        <p>
          {String(
            r.data.description ||
              r.data.intention ||
              r.data.definition ||
              r.data.expertise ||
              'Open to view the details, sources and review history.'
          )}
        </p>
        <div className="bee-record-meta">
          {r.data.pillar && (
            <span>
              <Leaf size={13} />
              {String(r.data.pillar)}
            </span>
          )}
          {r.data.amount !== undefined && <span>{money(r.data.amount)}</span>}
          {r.data.due && (
            <span>
              <CalendarDays size={13} />
              {date(r.data.due)}
            </span>
          )}
          {r.kind === 'result' && (
            <span>
              {String(r.data.actual)} {String(r.data.unit)} · Target {String(r.data.target)}
            </span>
          )}
          <span className="bee-record-arrow">
            <ArrowUpRight size={18} />
          </span>
        </div>
      </div>
    </button>
  );
}
function FieldInput({
  field: f,
  record,
  w,
}: {
  field: Field;
  record: CommunityRecord | null;
  w: Workspace;
}) {
  const common = {
    name: f.key,
    required: f.required,
    defaultValue: String(record?.data[f.key] ?? ''),
  };
  return (
    <label>
      {f.label}
      {f.unit && <small> · {f.unit}</small>}
      {f.type === 'textarea' ? (
        <textarea {...common} rows={3} maxLength={5000} />
      ) : f.type === 'select' ? (
        <select {...common}>
          <option value="">Select…</option>
          {f.options?.map((o) => (
            <option key={o} value={o}>
              {f.key === 'factorKey' ? `${factors[o]?.label} · ${factors[o]?.unit}` : o}
            </option>
          ))}
        </select>
      ) : f.type === 'record' ? (
        <select {...common}>
          <option value="">Select…</option>
          {w.records
            .filter(
              (r) => r.kind === f.linkKind && (r.kind !== 'allocation' || r.data.layer === 'Impact')
            )
            .map((r) => (
              <option key={r.id} value={r.id}>
                {r.title} · {statusLabel(r.status)}
              </option>
            ))}
        </select>
      ) : (
        <input
          {...common}
          type={f.type || 'text'}
          step={f.type === 'number' ? 'any' : undefined}
          maxLength={5000}
        />
      )}
    </label>
  );
}
function Modal({
  children,
  onClose,
  title,
}: {
  children: ReactNode;
  onClose: () => void;
  title: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = old;
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="bee-dialog"
      aria-label={title}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bee-dialog-inner">
        <header>
          <div>
            <Eyebrow>BEE COMMUNITY</Eyebrow>
            <h2>{title}</h2>
          </div>
          <button className="bee-icon-button" onClick={onClose} aria-label="Close dialog">
            <X />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}
function Detail({
  r,
  w,
  busy,
  onClose,
  onEdit,
  onTransition,
  reload,
  onToast,
}: {
  r: CommunityRecord;
  w: Workspace;
  busy: boolean;
  onClose: () => void;
  onEdit: () => void;
  onTransition: (r: CommunityRecord, to: string, comment?: string) => Promise<void>;
  reload: () => Promise<void>;
  onToast: (message: string) => void;
}) {
  const [comment, setComment] = useState('');
  const [uploading, setUploading] = useState(false);
  const [expert, setExpert] = useState('');
  const edit = canEdit(w.project.role, r, w.user);
  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3145728) {
      onToast('Use a file up to 3 MB, or add a shared link.');
      return;
    }
    setUploading(true);
    try {
      const f = new FormData();
      f.set('projectId', w.project.id);
      f.set('recordId', r.id);
      f.set('file', file);
      await api('/api/community/files', { method: 'POST', body: f });
      await reload();
      onToast('File attached privately.');
    } catch (e) {
      onToast(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }
  async function assign() {
    try {
      await api('/api/community/records', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: w.project.id,
          id: r.id,
          version: r.version,
          assignReviewer: expert,
        }),
      });
      await reload();
      onToast('Expert assigned to this evidence.');
    } catch (e) {
      onToast(e instanceof Error ? e.message : 'Could not assign.');
    }
  }
  return (
    <Modal onClose={onClose} title={r.title}>
      <div className="bee-detail-head">
        <Badge status={r.status} />
        <span>
          {kinds[r.kind].label} · Version {r.version}
        </span>
        {edit && (
          <button className="bee-link" onClick={onEdit}>
            <Pencil size={14} />
            Edit details
          </button>
        )}
      </div>
      <dl className="bee-detail-fields">
        {kinds[r.kind].fields.map(
          (f) =>
            r.data[f.key] !== undefined && (
              <div key={f.key}>
                <dt>{f.label}</dt>
                <dd>
                  {f.type === 'url' ? (
                    <a href={String(r.data[f.key])} target="_blank" rel="noopener noreferrer">
                      Open source
                      <ExternalLink size={13} />
                    </a>
                  ) : f.type === 'record' ? (
                    w.records.find((x) => x.id === r.data[f.key])?.title || 'Linked record'
                  ) : f.type === 'date' ? (
                    date(r.data[f.key])
                  ) : f.key === 'amount' ? (
                    money(r.data[f.key])
                  ) : (
                    String(r.data[f.key])
                  )}
                </dd>
              </div>
            )
        )}
      </dl>
      {r.kind === 'location' && (
        <a
          className="bee-button outline"
          target="_blank"
          rel="noopener noreferrer"
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.data.latitude + ',' + r.data.longitude)}`}
        >
          <MapPin size={15} />
          Open coordinates in Maps
          <ExternalLink size={14} />
        </a>
      )}
      {r.kind === 'booking' && factors[String(r.data.factorKey)] && (
        <div className="bee-note">
          <Leaf />
          <p>
            {Number(r.data.quantity) * factors[String(r.data.factorKey)].value} kgCO₂e · planning
            estimate.
            <br />
            {String(r.data.quantity)} {factors[String(r.data.factorKey)].unit} ×{' '}
            {factors[String(r.data.factorKey)].value}. Source: Bee Production Carbon Booking
            Framework v2, {factors[String(r.data.factorKey)].source}. Internal proxy; review
            methodology before external reporting.
          </p>
        </div>
      )}
      <section className="bee-attachments">
        <h3>Sources & attachments</h3>
        {r.files?.map((f) => (
          <a key={f.id} href={`/api/community/files?project=${w.project.id}&id=${f.id}`}>
            <FileText size={16} />
            <span>
              {f.name}
              <small>{Math.ceil(f.size / 1024)} KB · Stored privately</small>
            </span>
            <Download size={15} />
          </a>
        ))}
        {!r.files?.length && (
          <p>No file attached yet. Shared source links appear in the details above.</p>
        )}
        {edit && (
          <label className="bee-button outline">
            {uploading ? <LoaderCircle size={15} className="bee-spin" /> : <Paperclip size={15} />}
            Attach file
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={upload}
              disabled={uploading}
              className="sr-only"
            />
            <small>PDF / image · up to 3 MB</small>
          </label>
        )}
      </section>
      {w.project.role === 'bee' && ['evidence', 'action', 'result'].includes(r.kind) && (
        <div className="bee-expert">
          <label>
            Expert review
            <select value={expert} onChange={(e) => setExpert(e.target.value)}>
              <option value="">Select an expert…</option>
              {w.members
                .filter((m) => m.role === 'expert')
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
            </select>
          </label>
          <button className="bee-button outline" disabled={!expert} onClick={assign}>
            Assign
          </button>
        </div>
      )}
      {availableTransitions(w.project.role, r, w.user).length > 0 && (
        <section className="bee-review">
          <h3>The next step</h3>
          <label>
            Review note
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              placeholder="Context for the team. Required when requesting an update."
              maxLength={2000}
            />
          </label>
          <div>
            {availableTransitions(w.project.role, r, w.user).map((t) => (
              <button
                className={`bee-button ${t.to === 'needs_update' ? 'outline' : ''}`}
                key={t.to}
                disabled={busy}
                onClick={() => void onTransition(r, t.to, comment)}
              >
                {busy ? (
                  <LoaderCircle className="bee-spin" size={14} />
                ) : t.to === 'needs_update' ? (
                  <Pencil size={14} />
                ) : (
                  <Check size={14} />
                )}{' '}
                {t.to === 'needs_update' ? 'Request changes' : statusLabel(t.to)}
              </button>
            ))}
          </div>
          {r.kind === 'allocation' && (
            <p className="bee-small">This updates the capital register only. No payment is made.</p>
          )}
        </section>
      )}
      <section className="bee-detail-history">
        <h3>Traceable history</h3>
        {w.events
          .filter((e) => e.record_id === r.id)
          .map((e) => (
            <div key={e.id}>
              <span className="bee-event-dot" />
              <p>
                <strong>{e.actor}</strong> · {statusLabel(e.action)} → {statusLabel(e.new_state)}
                <small>
                  {new Date(e.created_at).toLocaleString('en-GB')}
                  {e.comment && ' · ' + e.comment}
                </small>
              </p>
            </div>
          ))}
      </section>
    </Modal>
  );
}
function Login({ onSuccess }: { onSuccess: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError('');
    try {
      await api('/api/community/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: f.get('email'), password: f.get('password') }),
      });
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Please retry.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div
      className="bee-app bee-login"
      style={{ '--bee-scene': `url("${art}")` } as React.CSSProperties}
    >
      <Link href="/" className="bee-login-home">
        <ArrowLeft size={15} />
        Back to Beeyondtheworld
      </Link>
      <section className="bee-login-vision">
        <Image
          width={960}
          height={640}
          src="/assets/icones/Ico Gold BEE-13.svg"
          alt="Beeyondtheworld"
        />
        <Eyebrow>THE BEE COMMUNITY</Eyebrow>
        <h1>
          From intention
          <br />
          to bloom.
          <br />
          <em>To what remains.</em>
        </h1>
        <p>
          A shared space for brands, visual artisans
          <br />
          and the people who bring lasting change.
        </p>
        <div>
          <span>
            <Hexagon />
            Bee
          </span>
          <span>
            <Flower2 />
            Flower
          </span>
          <span>
            <Layers />
            Honey
          </span>
        </div>
      </section>
      <section className="bee-login-panel">
        <Eyebrow>WELCOME TO YOUR JOURNEY</Eyebrow>
        <h2>
          Good to have
          <br />
          you here.
        </h2>
        <p>
          Enter your private workspace. Your role connects you to the right people, projects and
          next steps.
        </p>
        <form className="bee-form" onSubmit={submit}>
          <label>
            Email address
            <input
              type="email"
              name="email"
              required
              autoComplete="username"
              placeholder="you@organization.com"
            />
          </label>
          <label>
            Password
            <input name="password" type="password" required autoComplete="current-password" />
          </label>
          {error && (
            <p role="alert" className="bee-error">
              {error}
            </p>
          )}
          <button className="bee-button" disabled={busy} type="submit">
            {busy ? <LoaderCircle className="bee-spin" size={16} /> : null}Enter the journey
            <ArrowRight size={16} />
          </button>
        </form>
        <div className="bee-private-note">
          <LockKeyhole size={15} />
          <span>
            Private access, by invitation.
            <br />
            Need an account?{' '}
            <Link href="/contact">
              Connect with the Bee team
              <ArrowUpRight size={12} />
            </Link>
          </span>
        </div>
      </section>
      <span className="bee-login-footer">
        BEEYONDTHEWORLD · BEAUTY CREATES ATTENTION. EVIDENCE CREATES TRUST.
      </span>
    </div>
  );
}
