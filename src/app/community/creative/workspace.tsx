'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  X,
  MapPin,
  Users,
  Images,
  Layers,
  Compass,
  Check,
  ExternalLink,
  Upload,
  Download,
  Search,
  RefreshCw,
} from 'lucide-react';
import {
  schemas,
  relatedContent,
  usable,
  type CreativeItem,
  type CreativeKind,
  type CreativeRole,
  type CreativeData,
} from '@/lib/creative/model';
import type { Catalog } from '@/lib/creative/server';
import './workspace.css';
type Snapshot = {
  email: string;
  role: CreativeRole;
  scope: string;
  items: CreativeItem[];
  projects: { id: string; title: string; territory: string }[];
  crm: Catalog | null;
  history: { id: string; item_id: string; actor: string; action: string; created_at: string }[];
};
const tabs: { id: CreativeKind; label: string; icon: typeof Users }[] = [
  { id: 'destination', label: 'Destinations', icon: Compass },
  { id: 'talent', label: 'Local souls', icon: Users },
  { id: 'content', label: 'Visual library', icon: Images },
  { id: 'collection', label: 'Brand portfolios', icon: Layers },
  { id: 'activation', label: 'Brand journeys', icon: MapPin },
];
const blank = (kind: CreativeKind) =>
  Object.fromEntries(
    schemas[kind].map((f) => [
      f.key,
      ['contentIds', 'talentIds'].includes(f.key) ? [] : f.options?.[0] || '',
    ])
  ) as CreativeData;
const text = (v: unknown) => String(v || '');
const esc = (s: unknown) =>
  text(s).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!
  );
function download(name: string, body: string, mime: string) {
  const url = URL.createObjectURL(new Blob([body], { type: mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
export function CreativeWorkspace() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null),
    [scope, setScope] = useState(''),
    [role, setRole] = useState(''),
    [tab, setTab] = useState<CreativeKind>('destination'),
    [query, setQuery] = useState(''),
    [filter, setFilter] = useState('active'),
    [selected, setSelected] = useState(''),
    [editing, setEditing] = useState<{
      id?: string;
      version?: number;
      kind: CreativeKind;
      title: string;
      data: CreativeData;
    } | null>(null),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [busy, setBusy] = useState(false),
    [newProject, setNewProject] = useState(false);
  const rail = useRef<HTMLDivElement>(null),
    dialog = useRef<HTMLDialogElement>(null),
    file = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    setScope(q.get('scope') === 'demo' ? 'demo' : 'studio');
    const t = q.get('tab');
    if (tabs.some((x) => x.id === t)) setTab(t as CreativeKind);
    setSelected(q.get('item') || '');
  }, []);
  const endpoint = '/api/creative?scope=' + scope + (role ? '&role=' + role : '');
  async function load() {
    const r = await fetch(endpoint, { cache: 'no-store' });
    const s = await r.json();
    if (!r.ok) throw Error(s.error);
    setSnapshot(s);
    return s as Snapshot;
  }
  useEffect(() => {
    if (!scope) return;
    let active = true;
    setSnapshot(null);
    setError('');
    fetch(endpoint, { cache: 'no-store' })
      .then(async (r) => {
        const s = await r.json();
        if (!r.ok) throw Error(s.error);
        if (active) setSnapshot(s);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [endpoint, scope]);
  useEffect(() => {
    if (editing || newProject) dialog.current?.showModal();
    else dialog.current?.close();
  }, [editing, newProject]);
  useEffect(() => {
    if (!editing) return;
    const prevent = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', prevent);
    return () => window.removeEventListener('beforeunload', prevent);
  }, [editing]);
  const all = snapshot?.items || [],
    current = all.find((x) => x.id === selected),
    writable = snapshot?.role !== 'viewer';
  const visible = all.filter(
    (x) =>
      x.kind === tab &&
      (filter === 'all' || x.status !== 'archived') &&
      (!query ||
        [x.title, ...Object.values(x.data)].join(' ').toLowerCase().includes(query.toLowerCase()))
  );
  const due = all.filter(
    (x) =>
      x.status !== 'archived' &&
      x.data.nextAction &&
      x.data.nextDate &&
      text(x.data.nextDate) <= new Date().toISOString().slice(0, 10)
  );
  async function perform(
    action: string,
    extras: Record<string, unknown> = {},
    item: CreativeItem | null | undefined = current
  ) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item?.id, version: item?.version, action, ...extras }),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error);
      await load();
      if (d.item) setSelected(d.item.id);
      setNotice(
        action === 'confirm'
          ? 'Booking recorded. Creator agreements retained; finance remains deferred.'
          : 'Saved for the team.'
      );
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.');
      return false;
    } finally {
      setBusy(false);
    }
  }
  function openNew(kind = tab) {
    setEditing({ kind, title: '', data: blank(kind) });
    setError('');
  }
  function edit(item: CreativeItem) {
    setEditing({
      id: item.id,
      version: item.version,
      kind: item.kind,
      title: item.title,
      data: { ...item.data },
    });
  }
  function choose(item: CreativeItem) {
    setSelected(item.id);
    const url = new URL(location.href);
    url.searchParams.set('item', item.id);
    url.searchParams.set('tab', item.kind);
    history.replaceState(null, '', url);
  }
  async function save(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const ok = await perform(
      'save',
      editing,
      editing.id ? all.find((x) => x.id === editing.id) : null
    );
    if (ok) setEditing(null);
  }
  function setField(key: string, value: string | string[]) {
    setEditing((v) =>
      v
        ? {
            ...v,
            data: {
              ...v.data,
              [key]: value,
              ...(key === 'companyId' ? { opportunityId: '', briefId: '' } : {}),
            },
          }
        : v
    );
  }
  function hero(item: CreativeItem): string {
    const content =
      item.kind === 'content'
        ? item
        : all.find(
            (x) =>
              x.kind === 'content' &&
              x.data.mediaId &&
              (x.data.destinationId === item.id ||
                x.data.talentId === item.id ||
                ((item.data.contentIds as string[]) || []).includes(x.id))
          );
    if (content?.data.mediaId) return endpoint + '&file=' + content.data.mediaId;
    return scope === 'demo'
      ? text(item.data.demoImage || content?.data.demoImage) ||
          '/assets/community/horizon/morocco-landscape.webp'
      : '';
  }
  async function portfolio(item: CreativeItem) {
    setError('');
    setBusy(true);
    try {
      const fresh = await load();
      const c = fresh.items.find((x) => x.id === item.id)!;
      const contents = relatedContent(c, fresh.items);
      if (c.status !== 'approved' || !contents.length || contents.some((x) => !usable(x, true)))
        throw Error('Approve the selection and complete all usage rights before exporting.');
      const cards = await Promise.all(
        contents.map(async (x) => {
          let image = '';
          if (x.data.mediaId) {
            const r = await fetch(endpoint + '&file=' + x.data.mediaId);
            if (!r.ok) throw Error('An image could not be exported.');
            const blob = await r.blob();
            image = await new Promise<string>((resolve) => {
              const fr = new FileReader();
              fr.onload = () => resolve(String(fr.result));
              fr.readAsDataURL(blob);
            });
          }
          return `<article>${image ? `<img src="${image}" alt="${esc(x.title)}">` : ''}<h2>${esc(x.title)}</h2><p>${esc(x.data.description)}</p><p>${esc(x.data.credit)} · ${esc(x.data.provenance)}</p><small>Usage: ${esc(x.data.rights)}${x.data.rightsExpiry ? ` · until ${esc(x.data.rightsExpiry)}` : ''}</small></article>`;
        })
      );
      download(
        'beeyond-' + item.id + '.html',
        `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(c.title)}</title><style>body{margin:auto;max-width:1050px;padding:6vw;background:#f7f2e9;color:#233f49;font:17px Georgia}header{border-bottom:1px solid #bc9863;padding:40px 0}h1{font-weight:400;font-size:52px}article{margin:50px 0;break-inside:avoid}img{width:100%;max-height:650px;object-fit:cover}small{color:#59676a}@media print{body{padding:20px}header{break-after:page}}</style><header><small>BEEYONDTHEWORLD · ${fresh.scope === 'demo' ? 'DEMONSTRATION · ' : ''}PRIVATE BRAND PORTFOLIO</small><h1>${esc(c.title)}</h1><p>${esc(c.data.intention)}</p></header>${cards.join('')}<footer>Selection v${c.version} · ${new Date().toISOString().slice(0, 10)} · Credits and usage permissions retained. Image provenance is stated individually.</footer></html>`,
        'text/html'
      );
      setNotice('Portfolio downloaded. Open it and print to PDF if needed.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed.');
    } finally {
      setBusy(false);
    }
  }
  const label = (id: unknown) => all.find((x) => x.id === id)?.title || text(id);
  return (
    <div className="creative-crm">
      <header className="cc-top">
        <a href="/community">
          <ArrowLeft size={16} /> Community
        </a>
        <a className="cc-word" href="/community/creative">
          BEEYONDTHEWORLD
        </a>
        <a href="/sales/">
          Sales CRM <ArrowRight size={16} />
        </a>
      </header>
      <main>
        <div className="cc-title">
          <div>
            <span className="cc-eyebrow">THE CREATIVE ECOSYSTEM</span>
            <h1>
              Local souls.
              <br />
              <em>Shared horizons.</em>
            </h1>
            <p>Discover. Curate. Co-create. Bring a brand journey to life.</p>
          </div>
          <div className="cc-context">
            <label>
              Library
              <select
                value={scope}
                onChange={(e) => {
                  setSelected('');
                  location.href = '/community/creative?scope=' + e.target.value;
                }}
              >
                <option value="studio">Creative Studio</option>
                <option value="demo">Demonstration · Morocco</option>
              </select>
            </label>
            {scope === 'demo' && (
              <label>
                Explore a role
                <select
                  value={role || snapshot?.role || 'curator'}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setSelected('');
                  }}
                >
                  <option value="curator">Creative Studio</option>
                  <option value="production">Bloom Production</option>
                  <option value="bee">Bee Core</option>
                  <option value="contributor">Scout / business development</option>
                  <option value="viewer">Read-only</option>
                </select>
              </label>
            )}
            <span>{snapshot?.email}</span>
          </div>
        </div>
        <div className="cc-journey" aria-label="Creative workflow">
          {['Local Scout', 'Creative Studio', 'Bloom Production', 'Brand Journey'].map((s, i) => (
            <span key={s}>
              <small>0{i + 1}</small>
              {s}
              {i < 3 && <ArrowRight size={14} />}
            </span>
          ))}
        </div>
        {scope === 'demo' && (
          <p className="cc-note">
            Demonstration only. AI concepts and fictional scout profiles illustrate the Morocco
            workflow. No real booking, certification or payment.
          </p>
        )}
        {error && (
          <div className="cc-alert" role="alert">
            {error}
            <button
              onClick={() =>
                void load()
                  .then(() => setError(''))
                  .catch((e) => setError(e.message))
              }
            >
              <RefreshCw size={14} /> Retry
            </button>
            {!snapshot && (
              <>
                <a href="/community">Community sign in</a>
                <a href="/sales/login">Sales sign in</a>
                <a href="?scope=demo">Open demonstration</a>
              </>
            )}
          </div>
        )}
        {notice && (
          <p className="cc-notice" role="status">
            <Check size={16} />
            {notice}
          </p>
        )}
        {snapshot && (
          <>
            <nav className="cc-tabs" aria-label="Creative library">
              {tabs.map(({ id, label, icon: I }) => (
                <button
                  key={id}
                  className={tab === id ? 'active' : ''}
                  aria-current={tab === id ? 'page' : undefined}
                  onClick={() => {
                    setTab(id);
                    setSelected('');
                    setQuery('');
                  }}
                >
                  <I size={19} />
                  {label}
                  <small>
                    {all.filter((x) => x.kind === id && x.status !== 'archived').length}
                  </small>
                </button>
              ))}
            </nav>
            <div className="cc-tools">
              <label className="cc-search">
                <Search size={17} />
                <input
                  aria-label="Search creative library"
                  placeholder="Style, country, discipline, brand…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <select
                aria-label="Record visibility"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="active">Active records</option>
                <option value="all">Include archived</option>
              </select>
              {writable && (
                <button className="cc-gold" onClick={() => openNew()}>
                  <Plus size={16} /> Add {tab === 'talent' ? 'local soul' : tab}
                </button>
              )}
            </div>
            {due.length > 0 && (
              <details className="cc-follow">
                <summary>
                  {due.length} follow-up{due.length > 1 ? 's' : ''} due
                </summary>
                {due.map((x) => (
                  <button
                    key={x.id}
                    onClick={() => {
                      setTab(x.kind);
                      choose(x);
                    }}
                  >
                    {x.title} · {text(x.data.nextAction)}{' '}
                    <small>
                      {text(x.data.owner)} · {text(x.data.nextDate)}
                    </small>
                  </button>
                ))}
              </details>
            )}
            {visible.length ? (
              <>
                <div className="cc-rail-head">
                  <span>{tabs.find((x) => x.id === tab)?.label}</span>
                  <div>
                    <button
                      aria-label="Previous cards"
                      onClick={() => rail.current?.scrollBy({ left: -460, behavior: 'smooth' })}
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <button
                      aria-label="Next cards"
                      onClick={() => rail.current?.scrollBy({ left: 460, behavior: 'smooth' })}
                    >
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
                <div ref={rail} className="cc-cards">
                  {visible.map((item) => (
                    <button
                      className={'cc-card ' + (selected === item.id ? 'selected' : '')}
                      key={item.id}
                      onClick={() => choose(item)}
                    >
                      <div className="cc-image">
                        {hero(item) ? (
                          // The authenticated endpoint already returns an optimised WebP.
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={hero(item)}
                            alt=""
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.visibility = 'hidden';
                            }}
                          />
                        ) : (
                          <Images
                            size={38}
                            aria-label="Preview not imported · open original source"
                            style={{
                              position: 'absolute',
                              inset: 0,
                              margin: 'auto',
                              color: 'var(--cc-gold, #c7a66c)',
                            }}
                          />
                        )}
                        <span>{item.status.replaceAll('_', ' ')}</span>
                        {item.data.provenance === 'AI concept' && <small>AI concept</small>}
                      </div>
                      <div className="cc-card-body">
                        <small>
                          {text(item.data.country || item.data.discipline || item.data.medium) ||
                            'BEEYONDTHEWORLD'}
                        </small>
                        <h2>{item.title}</h2>
                        <p>
                          {text(
                            item.data.style ||
                              item.data.intention ||
                              item.data.description ||
                              item.data.nextAction
                          ).slice(0, 130)}
                        </p>
                        <ArrowRight size={19} />
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="cc-empty">
                <Compass size={38} />
                <h2>{query ? 'No matching stories.' : 'The next story starts here.'}</h2>
                <p>
                  {query
                    ? 'Try another style, place or discipline.'
                    : 'Add a local talent, a destination or a first inspiration. The team can build the journey together.'}
                </p>
                {writable && (
                  <button className="cc-gold" onClick={() => openNew()}>
                    <Plus size={16} /> Add the first {tab}
                  </button>
                )}
                {scope === 'studio' && !query && (
                  <a href="?scope=demo">
                    Explore the Morocco demonstration <ArrowRight size={14} />
                  </a>
                )}
              </div>
            )}
            {current && (
              <section className="cc-detail" aria-label="Selected record">
                <div className="cc-detail-title">
                  <div>
                    <span className="cc-eyebrow">
                      {current.kind} · {current.status}
                    </span>
                    <h2>{current.title}</h2>
                  </div>
                  <div>
                    {writable && <button onClick={() => edit(current)}>Edit record</button>}
                    <button aria-label="Close record" onClick={() => setSelected('')}>
                      <X size={19} />
                    </button>
                  </div>
                </div>
                <div className="cc-detail-grid">
                  <dl>
                    {schemas[current.kind]
                      .filter(
                        (f) => current.data[f.key] && !['contentIds', 'talentIds'].includes(f.key)
                      )
                      .map((f) => (
                        <div key={f.key}>
                          <dt>{f.label}</dt>
                          <dd>
                            {f.type === 'url' ? (
                              <a href={text(current.data[f.key])} target="_blank" rel="noreferrer">
                                Open source <ExternalLink size={12} />
                              </a>
                            ) : f.key === 'projectId' ? (
                              <a
                                href={
                                  '/community?project=' + current.data.projectId + '#tale-brief'
                                }
                              >
                                {snapshot.projects.find((p) => p.id === current.data.projectId)
                                  ?.title || 'Open production'}{' '}
                                <ArrowRight size={12} />
                              </a>
                            ) : f.key === 'companyId' ? (
                              <a href={'/sales/#brands/' + current.data.companyId}>
                                {snapshot.crm?.companies.find(
                                  (c) => c.id === current.data.companyId
                                )?.name || 'Open CRM brand'}
                              </a>
                            ) : f.key === 'opportunityId' ? (
                              snapshot.crm?.opportunities.find(
                                (c) => c.id === current.data.opportunityId
                              )?.title || 'CRM opportunity'
                            ) : f.key === 'briefId' ? (
                              snapshot.crm?.briefs.find((c) => c.id === current.data.briefId)
                                ?.title || 'CRM brief'
                            ) : f.type === 'link' ? (
                              <button
                                onClick={() => {
                                  const linked = all.find((x) => x.id === current.data[f.key]);
                                  if (linked) {
                                    setTab(linked.kind);
                                    choose(linked);
                                  }
                                }}
                              >
                                {label(current.data[f.key])}
                                <ArrowRight size={12} />
                              </button>
                            ) : (
                              text(current.data[f.key])
                            )}
                          </dd>
                        </div>
                      ))}
                  </dl>
                  <aside>
                    {current.kind === 'collection' && (
                      <details open>
                        <summary>Selected stories & connected people</summary>
                        {[
                          ...((current.data.contentIds as string[]) || []),
                          ...((current.data.talentIds as string[]) || []),
                        ].map((id) => {
                          const linked = all.find((x) => x.id === id);
                          return (
                            linked && (
                              <button
                                key={id}
                                onClick={() => {
                                  setTab(linked.kind);
                                  choose(linked);
                                }}
                              >
                                {linked.title}
                                {linked.kind === 'talent' && (
                                  <small> · {text(linked.data.sourceContext)}</small>
                                )}{' '}
                                <ArrowRight size={12} />
                              </button>
                            )
                          );
                        })}
                      </details>
                    )}
                    {all
                      .filter(
                        (x) =>
                          x.kind === 'collection' &&
                          x.status !== 'archived' &&
                          (((x.data.talentIds as string[]) || []).includes(current.id) ||
                            ((x.data.contentIds as string[]) || []).some(
                              (id) =>
                                id === current.id ||
                                all.some(
                                  (c) =>
                                    c.id === id &&
                                    (c.data.destinationId === current.id ||
                                      c.data.talentId === current.id)
                                )
                            ))
                      )
                      .map((x) => (
                        <p key={x.id}>
                          <button
                            onClick={() => {
                              setTab('collection');
                              choose(x);
                            }}
                          >
                            {x.title} <ArrowRight size={12} />
                          </button>
                        </p>
                      ))}
                    <span className="cc-eyebrow">NEXT STEP</span>
                    <div className="cc-actions">
                      {current.kind === 'talent' && writable && (
                        <button disabled={busy} onClick={() => void perform('contacted')}>
                          <Check size={16} /> Mark contacted
                        </button>
                      )}
                      {current.kind === 'destination' &&
                        ['bee', 'production'].includes(snapshot.role) && (
                          <button disabled={busy} onClick={() => void perform('feasible')}>
                            <Check size={16} /> Validate Bloom feasibility
                          </button>
                        )}
                      {current.kind === 'content' && (
                        <>
                          {writable && (
                            <>
                              <input
                                ref={file}
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                hidden
                                onChange={async (e) => {
                                  const f = e.target.files?.[0];
                                  if (!f) return;
                                  if (f.size > 3 * 1024 * 1024) {
                                    setError('Maximum image size: 3 MB.');
                                    return;
                                  }
                                  const r = new FileReader();
                                  r.onload = () =>
                                    void perform('upload', { image: r.result, name: f.name });
                                  r.readAsDataURL(f);
                                  e.target.value = '';
                                }}
                              />
                              <button disabled={busy} onClick={() => file.current?.click()}>
                                <Upload size={16} /> Upload image · 3 MB
                              </button>
                            </>
                          )}
                          {['bee', 'curator'].includes(snapshot.role) && (
                            <button disabled={busy} onClick={() => void perform('curate')}>
                              <Check size={16} /> Curate for the studio
                            </button>
                          )}
                          {snapshot.role === 'bee' && (
                            <button disabled={busy} onClick={() => void perform('verify')}>
                              Verify original-source evidence
                            </button>
                          )}
                          <p>
                            Provenance: {text(current.data.verification) || 'pending'}
                            <br />
                            Public showreel:{' '}
                            {current.data.published === 'yes' ? 'Published' : 'Not published'}
                          </p>
                          {scope === 'studio' && ['bee', 'curator'].includes(snapshot.role) && (
                            <button
                              disabled={busy}
                              onClick={() =>
                                void perform(
                                  current.data.published === 'yes' ? 'unpublish' : 'publish'
                                )
                              }
                            >
                              {current.data.published === 'yes' ? 'Remove from' : 'Publish to'}{' '}
                              Travel Showreel
                            </button>
                          )}
                        </>
                      )}
                      {current.kind === 'collection' && (
                        <>
                          {relatedContent(current, all).map((x) => (
                            <button
                              key={x.id}
                              onClick={() => {
                                setTab('content');
                                choose(x);
                              }}
                            >
                              <Images size={15} />
                              {x.title}
                              <span>{usable(x, true) ? 'Ready' : 'Rights / review needed'}</span>
                            </button>
                          ))}
                          {['bee', 'curator'].includes(snapshot.role) && (
                            <button disabled={busy} onClick={() => void perform('approve')}>
                              <Check size={16} /> Approve brand portfolio
                            </button>
                          )}
                          <button disabled={busy} onClick={() => void portfolio(current)}>
                            <Download size={16} /> Export approved portfolio
                          </button>
                          {writable && (
                            <button
                              onClick={() =>
                                setEditing({
                                  kind: 'activation',
                                  title: current.title + ' · journey',
                                  data: {
                                    ...blank('activation'),
                                    collectionId: current.id,
                                    projectId: text(current.data.projectId),
                                    opportunityId: text(current.data.opportunityId),
                                  },
                                })
                              }
                            >
                              <ArrowRight size={16} /> Prepare brand journey
                            </button>
                          )}
                        </>
                      )}
                      {current.kind === 'activation' && (
                        <>
                          <p>
                            Sale → signed booking → creator agreement record.
                            <br />
                            Finance and payments are deferred.
                          </p>
                          {snapshot.role === 'bee' &&
                            (current.status !== 'confirmed' ? (
                              <button disabled={busy} onClick={() => void perform('confirm')}>
                                <Check size={16} /> Confirm booking
                              </button>
                            ) : (
                              <>
                                <span className="cc-note">
                                  Creator agreements recorded. No royalty amount calculated or
                                  payment initiated.
                                </span>
                                <button
                                  disabled={busy}
                                  onClick={() => {
                                    const reason = prompt('Cancellation reason');
                                    if (reason) void perform('cancel', { reason });
                                  }}
                                >
                                  Cancel booking
                                </button>
                              </>
                            ))}
                          {current.data.creatorSnapshot && (
                            <p>
                              {(
                                JSON.parse(text(current.data.creatorSnapshot)) as {
                                  name: string;
                                  model: string;
                                }[]
                              )
                                .map((s) => s.name + ' · ' + s.model)
                                .join('\n')}
                            </p>
                          )}
                        </>
                      )}
                      {writable && current.status !== 'confirmed' && (
                        <button disabled={busy} onClick={() => void perform('reopen')}>
                          Reopen for review
                        </button>
                      )}
                      {['bee', 'curator'].includes(snapshot.role) &&
                        current.kind !== 'activation' && (
                          <button disabled={busy} onClick={() => void perform('archive')}>
                            Archive record
                          </button>
                        )}
                    </div>
                    <details>
                      <summary>Activity history</summary>
                      {snapshot.history
                        .filter((h) => h.item_id === current.id)
                        .map((h) => (
                          <p key={h.id}>
                            {h.action} · {h.actor}
                            <small>{new Date(h.created_at).toLocaleString()}</small>
                          </p>
                        ))}
                    </details>
                  </aside>
                </div>
              </section>
            )}
            <footer className="cc-footer">
              <a href="/travel-showreel">
                Travel Showreel <ExternalLink size={14} />
              </a>
              <span>Finance deferred · Revolut Business API not connected</span>
              {snapshot.role === 'bee' && (
                <button onClick={() => setNewProject(true)}>
                  <Plus size={15} /> Create a Community production
                </button>
              )}
            </footer>
          </>
        )}
        {!snapshot && !error && <p role="status">Opening the creative library…</p>}
      </main>
      <dialog
        ref={dialog}
        onCancel={() => {
          setEditing(null);
          setNewProject(false);
        }}
        className="cc-dialog"
      >
        <div className="cc-dialog-top">
          <span className="cc-eyebrow">{newProject ? 'COMMUNITY PRODUCTION' : editing?.kind}</span>
          <button
            aria-label="Close form"
            onClick={() => {
              setEditing(null);
              setNewProject(false);
            }}
          >
            <X size={22} />
          </button>
        </div>
        {newProject ? (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              if (
                await perform(
                  'create-project',
                  { title: f.get('title'), territory: f.get('territory') },
                  undefined
                )
              )
                setNewProject(false);
            }}
          >
            <h2>Begin a production.</h2>
            <label>
              Name
              <input name="title" required maxLength={160} />
            </label>
            <label>
              Destination
              <input name="territory" required maxLength={120} />
            </label>
            <p>
              Shared with Bee and Creative Studio.{' '}
              {scope === 'demo' ? 'Demonstration' : 'Real production'}.
            </p>
            <button disabled={busy} className="cc-gold">
              Create production
            </button>
          </form>
        ) : (
          editing && (
            <form onSubmit={save}>
              <h2>{editing.id ? 'Shape the story.' : 'A new connection.'}</h2>
              <label>
                Name
                <input
                  autoFocus
                  required
                  maxLength={160}
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
              </label>
              <div className="cc-form-grid">
                {schemas[editing.kind]
                  .filter(
                    (f) =>
                      ![
                        'companyId',
                        'opportunityId',
                        'briefId',
                        'projectId',
                        'contentIds',
                        'talentIds',
                      ].includes(f.key)
                  )
                  .map((f) => (
                    <label key={f.key} className={f.type === 'textarea' ? 'wide' : ''}>
                      {f.label}
                      {f.type === 'textarea' ? (
                        <textarea
                          rows={3}
                          value={text(editing.data[f.key])}
                          onChange={(e) => setField(f.key, e.target.value)}
                          required={f.required}
                        />
                      ) : f.type === 'link' || f.type === 'select' ? (
                        <select
                          value={text(editing.data[f.key])}
                          onChange={(e) => setField(f.key, e.target.value)}
                          required={f.required}
                        >
                          <option value="">Choose…</option>
                          {f.type === 'link'
                            ? all
                                .filter((x) => x.kind === f.target && x.status !== 'archived')
                                .map((x) => (
                                  <option key={x.id} value={x.id}>
                                    {x.title}
                                  </option>
                                ))
                            : f.options?.map((x) => <option key={x}>{x}</option>)}
                        </select>
                      ) : (
                        <input
                          type={f.type === 'url' ? 'url' : f.type === 'date' ? 'date' : 'text'}
                          value={text(editing.data[f.key])}
                          onChange={(e) => setField(f.key, e.target.value)}
                          required={f.required}
                        />
                      )}
                    </label>
                  ))}
              </div>
              {['collection', 'activation'].includes(editing.kind) && (
                <fieldset>
                  <legend>Connected journey</legend>
                  {!snapshot?.crm && (
                    <p>
                      Sign in to the{' '}
                      <a href="/sales/login" target="_blank" rel="noreferrer">
                        sales CRM
                      </a>{' '}
                      with the same account, then{' '}
                      <button
                        type="button"
                        onClick={() => void load().catch((e) => setError(e.message))}
                      >
                        refresh connections
                      </button>
                      .
                    </p>
                  )}
                  {editing.kind === 'collection' && (
                    <>
                      <label>
                        Brand
                        <select
                          value={text(editing.data.companyId)}
                          onChange={(e) => setField('companyId', e.target.value)}
                        >
                          <option value="">Not linked yet</option>
                          {snapshot?.crm?.companies.map((x) => (
                            <option key={x.id} value={x.id}>
                              {x.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Brief
                        <select
                          value={text(editing.data.briefId)}
                          onChange={(e) => setField('briefId', e.target.value)}
                        >
                          <option value="">Not linked yet</option>
                          {snapshot?.crm?.briefs
                            .filter((x) => x.company_id === editing.data.companyId)
                            .map((x) => (
                              <option key={x.id} value={x.id}>
                                {x.title}
                              </option>
                            ))}
                        </select>
                      </label>
                    </>
                  )}
                  <label>
                    Opportunity
                    <select
                      required={editing.kind === 'activation'}
                      value={text(editing.data.opportunityId)}
                      onChange={(e) => setField('opportunityId', e.target.value)}
                    >
                      <option value="">Not linked yet</option>
                      {snapshot?.crm?.opportunities
                        .filter(
                          (x) =>
                            editing.kind === 'activation' || x.company_id === editing.data.companyId
                        )
                        .map((x) => (
                          <option key={x.id} value={x.id}>
                            {x.title} · {x.stage}
                          </option>
                        ))}
                    </select>
                  </label>
                  <label>
                    Community production
                    <select
                      required={editing.kind === 'activation'}
                      value={text(editing.data.projectId)}
                      onChange={(e) => setField('projectId', e.target.value)}
                    >
                      <option value="">Not linked yet</option>
                      {snapshot?.projects.map((x) => (
                        <option key={x.id} value={x.id}>
                          {x.title}
                        </option>
                      ))}
                    </select>
                  </label>
                </fieldset>
              )}
              {editing.kind === 'collection' && (
                <fieldset>
                  <legend>Connected team · source-backed roles</legend>
                  <div className="cc-checklist">
                    {all
                      .filter((x) => x.kind === 'talent' && x.status !== 'archived')
                      .map((x) => (
                        <label key={x.id}>
                          <input
                            type="checkbox"
                            checked={((editing.data.talentIds as string[]) || []).includes(x.id)}
                            onChange={(e) =>
                              setField(
                                'talentIds',
                                e.target.checked
                                  ? [...((editing.data.talentIds as string[]) || []), x.id]
                                  : ((editing.data.talentIds as string[]) || []).filter(
                                      (id) => id !== x.id
                                    )
                              )
                            }
                          />
                          <span>
                            {x.title}
                            <small>
                              {text(x.data.discipline)} · {text(x.data.sourceContext)}
                            </small>
                          </span>
                        </label>
                      ))}
                  </div>
                </fieldset>
              )}
              {editing.kind === 'collection' && (
                <fieldset>
                  <legend>
                    Choose the stories · {((editing.data.contentIds as string[]) || []).length}{' '}
                    selected
                  </legend>
                  <p>
                    Select by style, territory and credit. External export requires valid brand-use
                    rights.
                  </p>
                  <div className="cc-checklist">
                    {all
                      .filter((x) => x.kind === 'content' && x.status !== 'archived')
                      .map((x) => (
                        <label key={x.id}>
                          <input
                            type="checkbox"
                            checked={((editing.data.contentIds as string[]) || []).includes(x.id)}
                            onChange={(e) =>
                              setField(
                                'contentIds',
                                e.target.checked
                                  ? [...((editing.data.contentIds as string[]) || []), x.id]
                                  : (editing.data.contentIds as string[]).filter(
                                      (id) => id !== x.id
                                    )
                              )
                            }
                          />
                          <span>
                            {x.title}
                            <small>
                              {text(x.data.style)} · {text(x.data.credit)} ·{' '}
                              {usable(x, true)
                                ? 'Ready for presentation'
                                : 'Review / rights pending'}
                            </small>
                          </span>
                        </label>
                      ))}
                  </div>
                </fieldset>
              )}
              {error && (
                <p role="alert" className="cc-alert">
                  {error}
                </p>
              )}
              <div className="cc-form-actions">
                <p>Changes reopen approvals. No message or payment is sent.</p>
                <button type="submit" disabled={busy} className="cc-gold">
                  {busy ? 'Saving…' : 'Save to the studio'}
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )
        )}
      </dialog>
    </div>
  );
}
