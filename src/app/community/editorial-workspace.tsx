'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Film,
  Flower2,
  Folder,
  ImageIcon,
  Layers,
  LogOut,
  MapPin,
  Maximize2,
  Menu,
  Palette,
  Plus,
  Search,
  Scissors,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  X,
  type LucideIcon,
} from 'lucide-react';
import { kinds, statusLabel } from '@/lib/community/model';
import {
  roleNames,
  roles,
  type CommunityRecord,
  type Role,
  type Workspace,
} from '@/lib/community/types';
import { calculateMetrics } from '@/lib/community/metrics';
import './editorial.css';
import examples from '@/data/community-examples.json';

const landscape = (n: number) =>
  `/assets/journeys/namibia-feb-2025/namibia-feb-2025-gallery-${String(n).padStart(2, '0')}.png`;
const namibiaFrames = [
  { image: landscape(15), label: 'Dune lines', place: 'Sossusvlei' },
  { image: landscape(14), label: 'Open horizons', place: 'Sossusvlei' },
  { image: landscape(2), label: 'Stillness', place: 'Deadvlei' },
  { image: landscape(28), label: 'Texture & silhouette', place: 'Deadvlei' },
  { image: landscape(32), label: 'Light & shadow', place: 'Deadvlei' },
];
const roleIntent: Record<Role, string> = {
  set: 'Connect materials, makers and the scene.',
  sound: 'Compose each chapter and document its sources.',
  agency: 'Coordinate talent, availability and usage rights.',
  model: 'Prepare your availability, agreement and personal call time.',
  bee: 'Connect the intention, the people and every decision.',
  brand: 'Your brief. Your creative direction. Your final selection.',
  production: 'Prepare the places, the people and the day ahead.',
  art_director: 'Give every frame a shared creative language.',
  stylist: 'Shape each look, then carry it through to the set.',
  photographer: 'Follow the light. Prepare and share your photographs.',
  filmmaker: 'From the first sequence to the final story.',
  beauty: 'Define each look and preserve its continuity.',
  editor: 'Bring the sources together. Refine, review and deliver.',
  ngo: 'Turn shared intentions into documented local action.',
  expert: 'Review the evidence entrusted to you, in its context.',
};
const poles: { role: Role; label: string; icon: LucideIcon; image: string }[] = [
  { role: 'art_director', label: 'Art direction', icon: Palette, image: landscape(15) },
  {
    role: 'stylist',
    label: 'Styling',
    icon: Scissors,
    image: '/assets/campaigns/craie-maroc/craie-maroc-gallery-01.jpg',
  },
  { role: 'photographer', label: 'Photography', icon: Camera, image: landscape(2) },
  { role: 'filmmaker', label: 'Film', icon: Film, image: landscape(28) },
  {
    role: 'beauty',
    label: 'Beauty',
    icon: Sparkles,
    image: '/assets/campaigns/craie-maroc/craie-maroc-gallery-03.jpg',
  },
  { role: 'editor', label: 'Post-production', icon: Layers, image: landscape(14) },
];
type Props = {
  w: Workspace;
  view: string;
  info: { title: string; kicker: string; description: string; kinds: string[] };
  groups: { name: string; subtitle: string; icon: LucideIcon; items: string[][] }[];
  nextActions: CommunityRecord[];
  busy: boolean;
  error: string;
  onNavigate: (view: string) => void;
  onOpen: (r: CommunityRecord) => void;
  onCreate: (kind: string) => void;
  onSwitchRole: (role: string) => void;
  onProject: (projectId: string) => void;
  onLogout: () => void;
  onExport: () => void;
  onRetry: () => void;
};
function State({ value }: { value: string }) {
  return (
    <span
      className={`ed-state ${['approved', 'locked', 'delivered', 'validated', 'verified', 'complete', 'expert_validated', 'bee_reviewed'].includes(value) ? 'done' : ''}`}
    >
      <i />
      {statusLabel(value)}
    </span>
  );
}
function Tabs({
  tabs,
  value,
  onChange,
  name,
}: {
  tabs: string[];
  value: string;
  onChange: (s: string) => void;
  name: string;
}) {
  function keyboard(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next =
      e.key === 'ArrowRight'
        ? (index + 1) % tabs.length
        : e.key === 'ArrowLeft'
          ? (index + tabs.length - 1) % tabs.length
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? tabs.length - 1
              : -1;
    if (next < 0) return;
    e.preventDefault();
    onChange(tabs[next]);
    (e.currentTarget.parentElement?.children[next] as HTMLElement)?.focus();
  }
  return (
    <div className="ed-tabs" role="tablist" aria-label={name}>
      {tabs.map((tab, i) => (
        <button
          key={tab}
          role="tab"
          id={`${name}-${i}`}
          aria-controls={`${name}-panel`}
          aria-selected={value === tab}
          tabIndex={value === tab ? 0 : -1}
          onKeyDown={(e) => keyboard(e, i)}
          onClick={() => onChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
function Lightbox({
  image,
  caption,
  onClose,
}: {
  image: string;
  caption: string;
  onClose: () => void;
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
      className="ed-lightbox"
      aria-label={caption}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button className="ed-icon" aria-label="Close image" onClick={onClose}>
        <X />
      </button>
      <Image width={1600} height={1000} src={image} alt={caption} />
      <p>{caption} · Visual reference, not field evidence</p>
    </dialog>
  );
}
function Gallery({ onExplore, frames }: { onExplore: () => void; frames: typeof namibiaFrames }) {
  const [reduced, setReduced] = useState(false);
  const [ref, embla] = useEmblaCarousel({
    align: 'center',
    loop: true,
    startIndex: 2,
    duration: reduced ? 0 : 28,
  });
  const [index, setIndex] = useState(2);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!embla) return;
    const update = () => setIndex(embla.selectedScrollSnap());
    update();
    embla.on('select', update);
    return () => {
      embla.off('select', update);
    };
  }, [embla]);
  return (
    <section
      className="ed-gallery"
      aria-roledescription="carousel"
      aria-label="Landscape references"
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          embla?.scrollPrev();
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          embla?.scrollNext();
        }
      }}
    >
      <div className="ed-carousel-viewport" ref={ref}>
        <div className="ed-carousel-track">
          {frames.map((f, i) => (
            <div
              key={f.image}
              className={`ed-slide ${index === i ? 'selected' : ''}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${frames.length}`}
            >
              <button
                tabIndex={index === i ? 0 : -1}
                aria-label={`Explore ${f.place}: ${f.label}`}
                onClick={() => (index === i ? onExplore() : embla?.scrollTo(i))}
              >
                <Image
                  src={f.image}
                  width={1000}
                  height={700}
                  alt={`${f.place} landscape reference`}
                  priority={i === 2}
                  sizes="(max-width: 700px) 85vw, 50vw"
                />
                <span className="ed-frame-caption">
                  <MapPin size={14} />
                  <span>
                    <small>{f.place}</small>
                    <strong>{f.label}</strong>
                  </span>
                  <ArrowUpRight size={19} />
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="ed-gallery-controls">
        <button
          className="ed-icon"
          aria-label="Previous reference"
          onClick={() => embla?.scrollPrev()}
        >
          <ChevronLeft />
        </button>
        <div>
          {frames.map((f, i) => (
            <button
              key={f.image}
              className={i === index ? 'active' : ''}
              aria-label={`Show reference ${i + 1}`}
              aria-current={i === index ? 'true' : undefined}
              onClick={() => embla?.scrollTo(i)}
            />
          ))}
        </div>
        <button className="ed-icon" aria-label="Next reference" onClick={() => embla?.scrollNext()}>
          <ChevronRight />
        </button>
      </div>
      <span className="sr-only" aria-live="polite">
        Reference {index + 1} of {frames.length}: {frames[index].label}
      </span>
    </section>
  );
}

export function EditorialWorkspace({
  w,
  view,
  info,
  groups,
  nextActions,
  busy,
  error,
  onNavigate,
  onOpen,
  onCreate,
  onSwitchRole,
  onProject,
  onLogout,
  onExport,
  onRetry,
}: Props) {
  const example = examples.find((e) => e.id === w.project.id);
  const frames = example?.frames || namibiaFrames;
  const [menu, setMenu] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [tab, setTab] = useState('Frames');
  const [frame, setFrame] = useState(0);
  const [locationId, setLocationId] = useState('');
  const [lightbox, setLightbox] = useState(false);
  const [pole, setPole] = useState<Role | ''>('');
  const menuRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    setQuery('');
    setStatus('all');
    setTab('Frames');
    setFrame(0);
    setNotifications(false);
    setMenu(false);
  }, [view, w.project.role, w.project.id]);
  useEffect(() => {
    if (menu) menuRef.current?.showModal();
    else menuRef.current?.close();
  }, [menu]);
  const ngo = ['ngo', 'expert'].includes(w.project.role);
  const allowed = (key: string) =>
    key === 'overview' ||
    key === 'activity' ||
    (groups.flatMap((g) => g.items).some(([id]) => id === key) &&
      Object.values(kinds).some(
        (k) => k.read.includes(w.project.role) && (key === 'team' ? k.label === 'Team task' : false)
      ));
  const viewKinds: Record<string, string[]> = {
    creatives: ['brief', 'concept'],
    trust: ['trust'],
    team: ['task'],
    scouting: ['location'],
    bloom: ['bloom'],
    production: ['production', 'task'],
    bookings: ['booking'],
    capital: ['allocation', 'expense'],
    field: ['action'],
    evidence: ['evidence'],
    assets: ['asset'],
    honey: ['result'],
    activity: [],
    overview: [],
  };
  const canSee = (key: string) =>
    allowed(key) || viewKinds[key]?.some((k) => kinds[k].read.includes(w.project.role));
  const relevantGroups = groups
    .map((g) => ({ ...g, items: g.items.filter(([key]) => canSee(key)) }))
    .filter((g) => g.items.length);
  const activeGroup =
    relevantGroups.find((g) => g.items.some(([key]) => key === view)) || relevantGroups[0];
  const nav = (key: string) => {
    setMenu(false);
    if (key !== 'team') setPole('');
    onNavigate(key);
  };
  const locations = w.records.filter((r) => r.kind === 'location');
  const location = locations.find((r) => r.id === locationId) || locations[0];
  const filtered = w.records
    .filter((r) => info.kinds.includes(r.kind))
    .filter(
      (r) =>
        !query || `${r.title} ${JSON.stringify(r.data)}`.toLowerCase().includes(query.toLowerCase())
    )
    .filter((r) => status === 'all' || r.status === status)
    .filter((r) => view !== 'team' || !pole || r.data.assignedRole === pole);
  const createKinds = info.kinds.filter((k) => kinds[k].roles.includes(w.project.role));
  const stats = calculateMetrics(w.records);
  const title =
    view === 'scouting' && location
      ? location.title.split(' · ')[0]
      : view === 'overview'
        ? example?.territory || w.project.title
        : info.title;
  const date = (v: string) =>
    new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const navContent = (
    <>
      <button className="ed-back" onClick={() => nav('projects')}>
        <ArrowLeft size={13} /> All my productions
      </button>
      <button className="ed-project-title" onClick={() => nav('overview')}>
        {example?.territory || w.project.title}
        <small>{w.project.season}</small>
      </button>
      <div className="ed-phase-nav" aria-label="Journey phases">
        {relevantGroups.map((g, i) => (
          <button
            key={g.name}
            aria-current={activeGroup?.name === g.name ? 'step' : undefined}
            onClick={() => nav(g.items[0][0])}
          >
            <i />
            <span>
              {g.name}
              <small>{g.subtitle}</small>
            </span>
            <span>0{i + 1}</span>
          </button>
        ))}
      </div>
      <nav className="ed-chapter-nav" aria-label="Workspace chapters">
        {activeGroup?.items.map(([key, label]) => (
          <button
            key={key}
            className={view === key ? 'active' : ''}
            aria-current={view === key ? 'page' : undefined}
            onClick={() => nav(key)}
          >
            {label}
            <ArrowUpRight size={13} />
          </button>
        ))}
      </nav>
      <div className="ed-nav-bottom">
        <a href="/community/production-map.html" target="_blank" rel="noopener noreferrer">
          <Layers size={14} /> Production A–Z <ArrowUpRight size={12} />
        </a>
        <button onClick={() => nav('activity')}>
          <Clock size={14} /> Project history
        </button>
        <button onClick={onLogout}>
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </>
  );
  if (view === 'projects')
    return (
      <ProjectIndex
        w={w}
        busy={busy}
        onRole={onSwitchRole}
        onProject={onProject}
        onLogout={onLogout}
      />
    );
  return (
    <>
      {example && (
        <div
          className="ed-campaign-backdrop"
          style={{
            backgroundImage: `linear-gradient(110deg,#173a4aeb,#294d60d6 55%,#4d6268b8),url("${example.cover}")`,
          }}
        />
      )}
      <a className="bee-skip" href="#ed-main">
        Skip to workspace
      </a>
      <aside className="ed-sidebar">{navContent}</aside>
      <dialog
        className="ed-mobile-dialog"
        ref={menuRef}
        onCancel={() => setMenu(false)}
        aria-label="Workspace navigation"
      >
        <button
          className="ed-icon ed-menu-close"
          aria-label="Close navigation"
          onClick={() => setMenu(false)}
        >
          <X />
        </button>
        {navContent}
      </dialog>
      <div className="ed-workspace" aria-busy={busy}>
        <header className="ed-topbar">
          <button
            className="ed-icon ed-menu"
            aria-label="Open navigation"
            onClick={() => setMenu(true)}
          >
            <Menu />
          </button>
          <a className="ed-mark" href="/dashboard/test" aria-label="Bee Community home">
            <Image width={24} height={28} src="/assets/icones/Ico Gold BEE-13.svg" alt="" />
          </a>
          <span className="ed-test-label">TEST EXPERIENCE</span>
          <div className="ed-controls">
            <label className="ed-role">
              <span>Explore as</span>
              <select
                aria-label="Test role"
                value={w.project.role}
                disabled={busy}
                onChange={(e) => onSwitchRole(e.target.value)}
              >
                {roles
                  .filter((r) => w.testRoles?.includes(r))
                  .map((r) => (
                    <option key={r} value={r}>
                      {roleNames[r]}
                    </option>
                  ))}
              </select>
              <ChevronDown size={13} />
            </label>
            <button
              className="ed-icon ed-bell"
              aria-label="Open next actions"
              aria-expanded={notifications}
              onClick={() => setNotifications(!notifications)}
            >
              <Bell size={19} />
              {nextActions.length > 0 && <i />}
            </button>
          </div>
        </header>
        {notifications && (
          <section className="ed-notifications" aria-label="Your next actions">
            <p className="ed-kicker">YOUR NEXT STEPS</p>
            {nextActions.slice(0, 6).map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  onOpen(r);
                  setNotifications(false);
                }}
              >
                <span>
                  {r.title}
                  <small>{statusLabel(r.status)}</small>
                </span>
                <ArrowUpRight size={16} />
              </button>
            ))}
            {!nextActions.length && <p>Nothing is waiting for your review.</p>}
          </section>
        )}
        <main id="ed-main" className={`ed-main ed-view-${view}`}>
          {error && (
            <div role="alert" className="bee-error">
              {error}
              <button onClick={onRetry}>Retry</button>
            </div>
          )}
          {!canSee(view) && view !== 'overview' && view !== 'activity' ? (
            <div className="ed-empty">
              <ShieldCheck />
              <h1>This chapter belongs to another role.</h1>
              <button onClick={() => nav('overview')}>Return to your journey</button>
            </div>
          ) : (
            <>
              <section className={`ed-heading ${view === 'overview' ? 'centered' : ''}`}>
                <div>
                  <p className="ed-kicker">
                    {view === 'overview'
                      ? ngo
                        ? 'THE BLOOMING GARDEN'
                        : example
                          ? `${example.brand} / A SHARED CREATIVE JOURNEY`
                          : 'A SHARED CREATIVE JOURNEY'
                      : info.kicker}
                  </p>
                  <h1>{title}</h1>
                  {view === 'overview' ? (
                    <p className="ed-dates">
                      {example ? (
                        <>
                          {example.stage} <i /> HISTORICAL CAMPAIGN REPLAY
                        </>
                      ) : (
                        <>
                          {date(w.project.starts_on)} <i /> {date(w.project.ends_on)}
                        </>
                      )}
                    </p>
                  ) : view === 'scouting' && location ? (
                    <>
                      <p className="ed-coordinates">
                        <MapPin size={15} />
                        {location.data.latitude !== undefined
                          ? `${location.data.latitude}°, ${location.data.longitude}°`
                          : 'Exact coordinates to document'}{' '}
                        <i />
                      </p>
                      <p className="ed-description">{String(location.data.description || '')}</p>
                    </>
                  ) : (
                    <p className="ed-description">{info.description}</p>
                  )}
                </div>
                {view !== 'overview' && (
                  <div className="ed-heading-actions">
                    {view === 'honey' && (
                      <button className="ed-action" onClick={onExport}>
                        <Download size={18} /> Export report
                      </button>
                    )}
                    {createKinds.map((k) => (
                      <button className="ed-action" key={k} onClick={() => onCreate(k)}>
                        <span>
                          <Plus size={20} />
                        </span>
                        {kinds[k].label}
                      </button>
                    ))}
                  </div>
                )}
              </section>
              {view === 'overview' ? (
                <>
                  {!ngo ? (
                    <Gallery frames={frames} onExplore={() => nav(example?.view || 'scouting')} />
                  ) : (
                    <button
                      className="ed-impact-hero"
                      onClick={() => nav(w.project.role === 'ngo' ? 'field' : 'evidence')}
                    >
                      <Image
                        width={1400}
                        height={800}
                        src={example?.cover || '/assets/community/garden.webp'}
                        alt={
                          example
                            ? `${example.brand} campaign archive`
                            : 'Illustrative garden landscape'
                        }
                      />
                      <span>
                        <small>
                          {example ? 'HISTORICAL CAMPAIGN REPLAY' : 'FROM INTENTION TO EVIDENCE'}
                        </small>
                        <strong>
                          {example
                            ? 'Impact scope to document.'
                            : w.project.role === 'ngo'
                              ? 'A living legacy.'
                              : 'A closer look.'}
                        </strong>
                        <span>
                          {example
                            ? 'No NGO action or measured impact is asserted.'
                            : w.project.role === 'ngo'
                              ? 'Explore field actions'
                              : 'Review assigned evidence'}{' '}
                          <ArrowUpRight size={18} />
                        </span>
                      </span>
                    </button>
                  )}
                  <div className="ed-role-context">
                    <div>
                      <p className="ed-kicker">{roleNames[w.project.role]}</p>
                      <p>{roleIntent[w.project.role]}</p>
                    </div>
                    {nextActions[0] ? (
                      <button onClick={() => onOpen(nextActions[0])}>
                        <span>
                          YOUR NEXT STEP<strong>{nextActions[0].title}</strong>
                        </span>
                        <ArrowRight size={20} />
                      </button>
                    ) : (
                      <span className="ed-caught-up">
                        <Check size={16} /> No pending decisions
                      </span>
                    )}
                  </div>
                  {!ngo && (
                    <section className="ed-pole-dock" aria-label="Creative team poles">
                      {poles.map((p) => (
                        <button
                          key={p.role}
                          onClick={() => {
                            setPole(p.role);
                            onNavigate('team');
                          }}
                        >
                          <p>
                            <p.icon size={17} />
                            {p.label}
                          </p>
                          <div>
                            <Image
                              src={
                                example?.frames[poles.indexOf(p) % example.frames.length].image ||
                                p.image
                              }
                              width={180}
                              height={100}
                              alt="Creative reference"
                            />
                            <span>
                              <ArrowUpRight size={16} />
                            </span>
                          </div>
                        </button>
                      ))}
                    </section>
                  )}
                  {ngo && (
                    <div className="ed-impact-links">
                      {relevantGroups
                        .flatMap((g) => g.items)
                        .filter(([key]) =>
                          ['trust', 'bloom', 'field', 'evidence', 'honey'].includes(key)
                        )
                        .map(([key, label], i) => (
                          <button onClick={() => nav(key)} key={key}>
                            <span>0{i + 1}</span>
                            <strong>{label}</strong>
                            <ArrowUpRight size={18} />
                          </button>
                        ))}
                    </div>
                  )}
                  <p className="ed-provenance">
                    {example ? (
                      <>
                        Real campaign archive · Replayed workflow, not historical approvals ·{' '}
                        <a href={example.source} target="_blank" rel="noopener noreferrer">
                          View published campaign
                        </a>
                      </>
                    ) : (
                      'Visual library references · Demonstration project and dates · No real production results'
                    )}
                  </p>
                </>
              ) : view === 'scouting' ? (
                <>
                  {location ? (
                    <>
                      <div className="ed-location-selector">
                        {locations.map((r) => (
                          <button
                            key={r.id}
                            className={r.id === location.id ? 'active' : ''}
                            onClick={() => {
                              setLocationId(r.id);
                              setFrame(r.title.includes('Deadvlei') ? 2 : 0);
                            }}
                          >
                            {r.title.split(' · ')[0]}
                          </button>
                        ))}
                        <button className="ed-location-details" onClick={() => onOpen(location)}>
                          Location details <ArrowUpRight size={14} />
                        </button>
                      </div>
                      <button
                        className="ed-main-frame"
                        onClick={() => setLightbox(true)}
                        aria-label="Enlarge selected landscape reference"
                      >
                        <Image
                          width={1600}
                          height={900}
                          src={frames[frame].image}
                          alt={`${frames[frame].place}: ${frames[frame].label}`}
                          priority
                          sizes="(max-width: 700px) 100vw, 80vw"
                        />
                        <span>
                          VISUAL REFERENCE <span>{frames[frame].label}</span>
                          <Maximize2 size={17} />
                        </span>
                      </button>
                      <Tabs
                        tabs={['Frames', 'Notes', 'Files']}
                        value={tab}
                        onChange={setTab}
                        name="scout"
                      />
                      <div
                        className="ed-scout-panel"
                        id="scout-panel"
                        role="tabpanel"
                        aria-labelledby={`scout-${['Frames', 'Notes', 'Files'].indexOf(tab)}`}
                        tabIndex={0}
                      >
                        {tab === 'Frames' ? (
                          <>
                            <div className="ed-thumbnails">
                              {frames.map((f, i) => (
                                <button
                                  key={f.image}
                                  className={frame === i ? 'selected' : ''}
                                  aria-pressed={frame === i}
                                  aria-label={`Select frame ${i + 1}: ${f.label}`}
                                  onClick={() => setFrame(i)}
                                >
                                  <Image width={400} height={260} src={f.image} alt={f.label} />
                                  <span>
                                    <small>0{i + 1}</small>
                                    <strong>{f.label}</strong>
                                    <MapPin size={13} />
                                  </span>
                                </button>
                              ))}
                            </div>
                            <p className="ed-provenance">
                              {example
                                ? 'Published campaign references, not a location survey.'
                                : 'References from the existing Namibia visual library.'}{' '}
                              Upload field photographs through Location details → Attach file.
                            </p>
                          </>
                        ) : tab === 'Notes' ? (
                          <div className="ed-notes">
                            <div>
                              <p className="ed-kicker">LIGHT & CALL TIME</p>
                              <h3>{String(location.data.light || 'To be confirmed')}</h3>
                            </div>
                            <div>
                              <p className="ed-kicker">ACCESS & PERMITS</p>
                              <p>{String(location.data.permit || 'To be confirmed')}</p>
                            </div>
                            <button className="ed-action" onClick={() => onOpen(location)}>
                              Open location & review <ArrowUpRight size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="ed-file-list">
                            {location.data.reference && (
                              <a
                                href={String(location.data.reference)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Folder size={22} />
                                <span>
                                  Scouting source<small>Shared reference folder or file</small>
                                </span>
                                <ArrowUpRight size={16} />
                              </a>
                            )}
                            {location.files?.map((f) => (
                              <a
                                key={f.id}
                                href={`/api/community/files?project=${w.project.id}&id=${f.id}`}
                              >
                                <ImageIcon size={22} />
                                <span>
                                  {f.name}
                                  <small>
                                    {Math.ceil(f.size / 1024)} KB · private project file
                                  </small>
                                </span>
                                <Download size={16} />
                              </a>
                            ))}
                            {!location.files?.length && (
                              <p className="ed-provenance">
                                No private file attached to this location yet.
                              </p>
                            )}
                            <button className="ed-action" onClick={() => onOpen(location)}>
                              Manage location files <ArrowUpRight size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="ed-empty">
                      <MapPin />
                      <h2>Your first location.</h2>
                      <p>Add a scouting location to begin.</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {view === 'team' && (
                    <div className="ed-people">
                      <button className={!pole ? 'active' : ''} onClick={() => setPole('')}>
                        All poles
                      </button>
                      {w.members.map((m) => (
                        <button
                          key={m.id}
                          className={pole === m.role ? 'active' : ''}
                          onClick={() => setPole(m.role)}
                        >
                          <span>
                            {m.name
                              .split(' ')
                              .map((s) => s[0])
                              .slice(0, 2)
                              .join('')}
                          </span>
                          <strong>
                            {m.name}
                            <small>{roleNames[m.role]}</small>
                          </strong>
                        </button>
                      ))}
                    </div>
                  )}
                  {view === 'production' && (
                    <div className="ed-production-line">
                      {['Planning', 'Ready', 'On set', 'Post-production', 'Delivered'].map(
                        (s, i) => (
                          <span key={s}>
                            <i>0{i + 1}</i>
                            {s}
                            {i < 4 && <ArrowRight size={15} />}
                          </span>
                        )
                      )}
                    </div>
                  )}
                  {view === 'honey' && (
                    <div className="ed-impact-links">
                      {['Social', 'Environmental', 'Economic'].map((p) => (
                        <button key={p} onClick={() => setQuery(query === p ? '' : p)}>
                          <Flower2 size={22} />
                          <strong>
                            {p}
                            <small>
                              {stats.validated.filter((r) => r.data.pillar === p).length} validated
                              indicators
                            </small>
                          </strong>
                          <ArrowUpRight size={16} />
                        </button>
                      ))}
                    </div>
                  )}
                  {view === 'activity' ? (
                    <section className="ed-history">
                      {w.events.map((e) => (
                        <button
                          key={e.id}
                          onClick={() => {
                            const r = w.records.find((r) => r.id === e.record_id);
                            if (r) onOpen(r);
                          }}
                        >
                          <time>{new Date(e.created_at).toLocaleDateString('en-GB')}</time>
                          <span>
                            <strong>{w.records.find((r) => r.id === e.record_id)?.title}</strong>
                            <small>
                              {e.actor} · {statusLabel(e.new_state)}
                            </small>
                            {e.comment && <p>{e.comment}</p>}
                          </span>
                          <ArrowUpRight size={16} />
                        </button>
                      ))}
                      {!w.events.length && <p>No changes recorded yet.</p>}
                    </section>
                  ) : (
                    <>
                      <div className="ed-filters">
                        <label>
                          <Search size={16} />
                          <input
                            aria-label="Search records"
                            placeholder="Find in this chapter…"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                          />
                        </label>
                        <label>
                          <SlidersHorizontal size={14} />
                          <select
                            aria-label="Filter by status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                          >
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
                          {filtered.length} {filtered.length === 1 ? 'record' : 'records'}
                        </span>
                      </div>
                      <section
                        className={`ed-records ${['creatives', 'assets', 'bloom'].includes(view) ? 'visual' : ''}`}
                        aria-label="Project records"
                      >
                        {filtered.map((r, i) => (
                          <button key={r.id} className="ed-record" onClick={() => onOpen(r)}>
                            {['creatives', 'assets', 'bloom'].includes(view) && (
                              <div className="ed-record-image">
                                <Image
                                  width={700}
                                  height={450}
                                  src={
                                    example
                                      ? example.frames[i % example.frames.length].image
                                      : r.kind === 'bloom'
                                        ? '/assets/community/garden.webp'
                                        : r.kind === 'asset'
                                          ? poles[1 + (i % 2)].image
                                          : frames[i % frames.length].image
                                  }
                                  alt="Illustrative creative reference"
                                />
                                <span>REFERENCE · ILLUSTRATIVE</span>
                              </div>
                            )}
                            <div className="ed-record-body">
                              <div>
                                <p className="ed-kicker">{kinds[r.kind].label}</p>
                                <h2>{r.title}</h2>
                                {r.data.description && (
                                  <p className="ed-record-description">
                                    {String(r.data.description)}
                                  </p>
                                )}
                              </div>
                              <div className="ed-record-bottom">
                                <State value={r.status} />
                                <span>
                                  {r.data.due
                                    ? new Date(String(r.data.due)).toLocaleDateString('en-GB')
                                    : r.kind === 'allocation'
                                      ? `${Number(r.data.amount || 0).toLocaleString('en-GB')} EUR`
                                      : `V${r.version}`}
                                </span>
                                <ArrowUpRight size={18} />
                              </div>
                            </div>
                          </button>
                        ))}
                        {!filtered.length && (
                          <div className="ed-empty">
                            <Folder size={30} />
                            <h2>
                              {query || status !== 'all' || pole
                                ? 'Nothing in this selection.'
                                : 'A new chapter is waiting.'}
                            </h2>
                            <p>
                              {query || status !== 'all' || pole
                                ? 'Try another search, status or team pole.'
                                : 'Your shared project records will appear here.'}
                            </p>
                            {(query || status !== 'all' || pole) && (
                              <button
                                className="ed-action"
                                onClick={() => {
                                  setQuery('');
                                  setStatus('all');
                                  setPole('');
                                }}
                              >
                                Clear filters <X size={14} />
                              </button>
                            )}
                          </div>
                        )}
                      </section>
                    </>
                  )}
                </>
              )}
            </>
          )}
          <footer className="ed-footer">
            <span>BEEYONDTHEWORLD</span>
            <p>One intention. Many hands. Something that remains.</p>
            <small>Test workspace · fictional project data</small>
          </footer>
        </main>
      </div>
      {lightbox && (
        <Lightbox
          image={frames[frame].image}
          caption={`${frames[frame].place} / ${frames[frame].label}`}
          onClose={() => setLightbox(false)}
        />
      )}
    </>
  );
}

function ProjectIndex({
  w,
  busy,
  onRole,
  onProject,
  onLogout,
}: {
  w: Workspace;
  busy: boolean;
  onRole: (role: string) => void;
  onProject: (id: string) => void;
  onLogout: () => void;
}) {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const projects = examples.filter((e) => w.projects.some((p) => p.id === e.id));
  const phase = (i: number) => (i < 2 ? 'Bee' : i === 2 ? 'Flower' : 'Honey');
  const visible = projects.filter(
    (e) =>
      (filter === 'All' || phase(e.index) === filter) &&
      `${e.title} ${e.stage}`.toLowerCase().includes(search.toLowerCase())
  );
  const nextFor = (e: (typeof examples)[number]) => {
    if (w.project.role === 'ngo' || w.project.role === 'expert') return 'Impact scope to document';
    if (w.project.role === 'brand')
      return [
        'Complete the brief',
        'Follow the preparations',
        'Follow the production',
        'Review the creative selection',
        'Explore the delivered campaign',
      ][e.index];
    if (
      w.project.role === 'bee' ||
      w.project.role === 'production' ||
      w.project.role === 'art_director'
    )
      return e.action;
    return [
      'Discover the intention',
      'Prepare your contribution',
      'Open your production tasks',
      'Follow versions & feedback',
      'Consult the final archive',
    ][e.index];
  };
  return (
    <div className="ed-portfolio" aria-busy={busy}>
      <div className="ed-campaign-backdrop portfolio-background" />
      <header className="ed-portfolio-top">
        <Link href="/" className="ed-portfolio-brand">
          <Image width={27} height={32} src="/assets/icones/Ico Gold BEE-13.svg" alt="" />
          <span>
            BEEYONDTHEWORLD<small>THE COMMUNITY</small>
          </span>
        </Link>
        <div className="ed-controls">
          <label className="ed-role">
            <span>Test view</span>
            <select
              aria-label="Test role"
              value={w.project.role}
              disabled={busy}
              onChange={(e) => onRole(e.target.value)}
            >
              {roles
                .filter((r) => w.testRoles?.includes(r))
                .map((r) => (
                  <option value={r} key={r}>
                    {roleNames[r]}
                  </option>
                ))}
            </select>
            <ChevronDown size={13} />
          </label>
          <button className="ed-icon" aria-label="Sign out" onClick={onLogout}>
            <LogOut size={17} />
          </button>
        </div>
      </header>
      <main>
        <section className="ed-portfolio-heading">
          <div>
            <p className="ed-kicker">{roleNames[w.project.role]} / YOUR SHARED WORLD</p>
            <h1>Your productions.</h1>
            <p>{roleIntent[w.project.role]}</p>
          </div>
          <a
            href="/community/production-map.html"
            target="_blank"
            rel="noopener noreferrer"
            className="ed-map-link"
          >
            <Layers size={18} />
            <span>
              Understand the journey<small>From the first brief to delivery</small>
            </span>
            <ArrowUpRight size={17} />
          </a>
        </section>
        <div className="ed-portfolio-toolbar">
          <Tabs
            tabs={['All', 'Bee', 'Flower', 'Honey']}
            value={filter}
            onChange={setFilter}
            name="portfolio"
          />
          <label>
            <Search size={16} />
            <input
              aria-label="Search projects"
              placeholder="Find a production…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>
        <p className="ed-replay-note">
          Five real campaigns, replayed at different stages. Media are from the archive; workflow
          states are for testing.
        </p>
        <div
          className="ed-project-grid"
          role="tabpanel"
          id="portfolio-panel"
          aria-labelledby={`portfolio-${['All', 'Bee', 'Flower', 'Honey'].indexOf(filter)}`}
        >
          {visible.map((e) => (
            <button
              key={e.id}
              className="ed-project-card"
              aria-label={`Open ${e.title}`}
              disabled={busy}
              onClick={() => onProject(e.id)}
            >
              <div className="ed-project-cover">
                <Image
                  src={e.cover}
                  width={1000}
                  height={700}
                  alt={`${e.brand} campaign in ${e.territory}`}
                  priority={e.index < 2}
                  sizes="(max-width: 700px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <span className="ed-project-phase">
                  {phase(e.index)} <i /> {e.stage}
                </span>
                <div>
                  <small>{e.brand}</small>
                  <h2>{e.territory}</h2>
                </div>
                <span className="ed-open-project">
                  <ArrowUpRight size={22} />
                </span>
              </div>
              <div className="ed-project-foot">
                <span>
                  YOUR NEXT STEP<strong>{nextFor(e)}</strong>
                </span>
                <span className="ed-replay-tag">REPLAY</span>
              </div>
            </button>
          ))}
          {!visible.length && (
            <div className="ed-empty">
              <Folder />
              <h2>
                {projects.length ? 'No matching production.' : 'Your productions will appear here.'}
              </h2>
              {projects.length > 0 && (
                <button
                  onClick={() => {
                    setSearch('');
                    setFilter('All');
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
        {w.projects.some((p) => p.id === 'b0000000-0000-4000-8000-000000000001') && (
          <button
            className="ed-sandbox-link"
            disabled={busy}
            onClick={() => onProject('b0000000-0000-4000-8000-000000000001')}
          >
            Namibia design & impact sandbox <ArrowUpRight size={15} />
            <span>Fictional workspace · complete NGO / expert test flow</span>
          </button>
        )}
        <footer className="ed-footer">
          <span>BEEYONDTHEWORLD</span>
          <p>One intention. Many hands. Something that remains.</p>
          <small>Private test experience · no historical approvals implied</small>
        </footer>
      </main>
    </div>
  );
}
