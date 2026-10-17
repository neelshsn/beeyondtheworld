'use client';

/* The Horizon layouts follow the approved A catalogue. All values and permissions
 * below come from the authenticated workspace; catalogue examples are never saves. */
import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import {
  assets,
  pages,
  pageGroup,
  pageKind,
  pageRecord,
  roleKey,
  privateProductionFields,
  type HorizonField,
} from '@/lib/community/horizon';
import { availableTransitions, canEdit, kinds, statusLabel } from '@/lib/community/model';
import { roleNames, type RecordData, type Workspace } from '@/lib/community/types';
import examples from '@/data/community-examples.json';
import { OnboardingDialog } from './onboarding-dialog';
import { journeyArtwork } from '@/lib/community/artwork';
import { Icon } from './horizon-icons';
import { StudioWorkspace, studioPages } from './studio-workspace';
import { ProductionWorkspace, productionPages } from './production-workspace';
import { MediaWorkspace, mediaPages } from './media-workspace';
import { ImpactWorkspace, impactPages } from './impact-workspace';
import { RehearsalGuide } from './rehearsal-guide';
import dynamic from 'next/dynamic';
const ItineraryWorkspace = dynamic(
  () => import('./itinerary-workspace').then((m) => m.ItineraryWorkspace),
  { ssr: false }
);
import { proposalPages } from '@/lib/community/proposal';
const ProposalWorkspace = dynamic(
  () => import('./proposal-workspace').then((m) => m.ProposalWorkspace),
  { ssr: false }
);
import './horizon.css';
import './horizon-interactions.css';
import './proposal.css';
import './studio.css';
import './production.css';
import './source-workspaces.css';

async function api(path: string, body?: unknown, method = 'POST') {
  const r = await fetch(path, {
    cache: 'no-store',
    ...(body !== undefined
      ? { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
      : {}),
  });
  const data = await r.json();
  if (!r.ok) throw Error(data.error || 'Please try again.');
  return data;
}
const order = ['fashion', 'craft', 'landscape', 'product'];
const choiceIcons: Record<string, string> = {
  Digital: 'globe',
  Print: 'file',
  Retail: 'home',
  Editorial: 'image',
  Lifestyle: 'user',
  Lookbook: 'hanger',
  Backstage: 'camera',
  Train: 'car',
  'Shared van': 'car',
  Flight: 'plane',
  'Local stay': 'home',
  'Eco-lodge': 'leaf',
  'Small hotel': 'moon',
  'Local meal': 'home',
  'Plant-based': 'leaf',
  Breakfast: 'sun',
  'Local action': 'leaf',
  Knowledge: 'book',
  Community: 'users',
  Biodiversity: 'leaf',
  'Local livelihoods': 'users',
  Culture: 'palette',
  Freedom: 'feather',
  Intimacy: 'moon',
  Curiosity: 'sun',
  'The collection': 'hanger',
  'The craft': 'feather',
  'A story': 'book',
  'Fixed dates': 'lock',
  'A few days': 'calendar',
  Flexible: 'compass',
  'Pro camera': 'camera',
  Phone: 'film',
  'This journey': 'pin',
  'A new journey': 'compass',
};
const transitionName: Record<string, string> = {
  submitted: 'Submit for Bee review',
  brand_review: 'Approve & send to brand',
  approved: 'Approve',
  needs_update: 'Request changes',
  expert_validated: 'Validate expert opinion',
};
const legacyViews: Record<string, string> = {
  overview: 'project',
  creatives: 'brief-intention',
  trust: 'trust-start',
  team: 'team',
  scouting: 'scouting',
  bloom: 'co-intentions',
  production: 'call-sheet',
  bookings: 'bookings',
  capital: 'budget',
  field: 'field-actions',
  evidence: 'evidence',
  assets: 'selects',
  honey: 'impact-overview',
  activity: 'inbox',
};
const primaryNext: Record<string, string> = {
  project: 'brief-scope',
  scouting: 'location',
  location: 'frame',
  frame: 'allocation',
  allocation: 'creative-lock',
  proposal: 'moodboard',
  items: 'item',
  casting: 'brief-casting-details',
  'trust-verified': 'co-intentions',
  bookings: 'transport',
  shoot: 'previews',
  previews: 'raws',
  raws: 'handoff',
  handoff: 'post-calendar',
  selects: 'version',
  version: 'bee-review',
  'bee-review': 'brand-review',
  'brand-review': 'rights',
  rights: 'delivery',
  delivery: 'archive',
  archive: 'report',
  'field-actions': 'field-action',
  evidence: 'evidence-add',
  'impact-overview': 'indicator',
};

function Photo({
  src,
  className = '',
  alt = 'AI visual concept · Morocco',
}: {
  src: string;
  className?: string;
  alt?: string;
}) {
  // Optimized local WebP assets already match the art-directed crop.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} className={className} alt={alt} decoding="async" />;
}
function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    d?.showModal();
    return () => d?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="horizon-dialog"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dialog-head">
        <span className="eyebrow">{title}</span>
        <button type="button" onClick={onClose} aria-label="Close panel">
          Close ×
        </button>
      </div>
      {children}
    </dialog>
  );
}

export function HorizonApp() {
  const proposalFlush = useRef<null | (() => Promise<boolean>)>(null);
  const registerProposalFlush = useCallback((flush: (() => Promise<boolean>) | null) => {
    proposalFlush.current = flush;
  }, []);
  const [w, setW] = useState<Workspace | null>(null),
    [loading, setLoading] = useState(true),
    [signedOut, setSignedOut] = useState(false),
    [pageId, setPageId] = useState('projects');
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [message, setMessage] = useState(''),
    [panel, setPanel] = useState(''),
    [navGroup, setNavGroup] = useState('Creatives');
  const [values, setValues] = useState<RecordData>({}),
    [dirty, setDirty] = useState(false),
    [comment, setComment] = useState(''),
    [recordId, setRecordId] = useState<string | null>(null),
    [newRecord, setNewRecord] = useState(false),
    [projectIndex, setProjectIndex] = useState(0);
  const pending = useRef<(() => void) | null>(null),
    requestCount = useRef(0);
  const load = useCallback(async (project?: string) => {
    const n = ++requestCount.current;
    const data: Workspace = await api(
      '/api/community/workspace' + (project ? '?project=' + encodeURIComponent(project) : '')
    );
    if (n === requestCount.current) {
      setW(data);
      setSignedOut(false);
    }
    return data;
  }, []);
  useEffect(() => {
    const url = new URL(location.href),
      old = url.searchParams.get('view');
    setPageId(url.hash.slice(1).split('/')[0] || legacyViews[old || ''] || 'projects');
    load(url.searchParams.get('project') || undefined)
      .catch(async (e) => {
        const a = await api('/api/community/auth').catch(() => ({}));
        if (!a.user) setSignedOut(true);
        else setError(e.message);
      })
      .finally(() => setLoading(false));
    const hash = async () => {
      if (proposalFlush.current && !(await proposalFlush.current())) return;
      setPageId(location.hash.slice(1).split('/')[0] || 'projects');
      setRecordId(null);
      setNewRecord(false);
      setPanel('');
    };
    window.addEventListener('hashchange', hash);
    return () => window.removeEventListener('hashchange', hash);
  }, [load]);
  const role = w ? roleKey(w.project.role) : 'brand';
  const pageSpec = pages.find((x) => x.id === pageId) || pages[0];
  const p = {
    ...pageSpec,
    fields: pageSpec.fields.filter(
      (f) =>
        role !== 'production' ||
        !(privateProductionFields[pageKind(pageSpec.id)] || []).includes(f.id)
    ),
  };
  const allowed = pages.filter((x) => (x.roles[role] || role === 'bee') && x.id !== 'login'),
    visible = allowed.some((x) => x.id === p.id);
  const records = w?.records.filter((r) => r.kind === pageKind(p.id)) || [];
  const record = newRecord
    ? undefined
    : records.find((r) => r.id === recordId) ||
      records.filter((r) => !r.data.assigneeId).at(-1) ||
      records.at(-1);
  const editable =
    !!w &&
    visible &&
    (p.id === 'profile' ||
      (record
        ? canEdit(w.project.role, record, w.user)
        : !!kinds[pageKind(p.id)]?.roles.includes(w.project.role)));
  const transitions = w && record ? availableTransitions(w.project.role, record, w.user) : [];
  const mode = editable ? 'edit' : transitions.length ? 'approve' : 'read';
  useEffect(() => {
    setValues(
      p.id === 'profile'
        ? { 'profile-0': w?.user.name || '', 'profile-2': w?.user.email || '', ...w?.user.profile }
        : record?.data || {}
    );
    setDirty(false);
    setComment('');
  }, [record, p.id, w?.project.id, w?.user]);
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);
  const perform = async (action: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };
  const go = (id: string, saved = false) => {
    if (!pages.some((p) => p.id === id && (p.roles[role] || role === 'bee'))) return;
    const navigate = () => {
      setPageId(id);
      setRecordId(null);
      setNewRecord(false);
      setPanel('');
      setError('');
      setMessage('');
      const url = new URL(location.href);
      url.searchParams.set('project', w?.project.id || '');
      url.hash = id;
      history.pushState(null, '', url);
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    if (dirty && !saved) {
      pending.current = navigate;
      setPanel('unsaved');
    } else if (proposalFlush.current)
      void proposalFlush.current().then((ok) => {
        if (ok) navigate();
      });
    else navigate();
  };
  const next = (saved = false) => {
    const index = allowed.findIndex((x) => x.id === p.id);
    const id = primaryNext[p.id];
    go(id && allowed.some((x) => x.id === id) ? id : allowed[index + 1]?.id || 'project', saved);
  };
  const set = (key: string, value: string) => {
    setValues((old) => ({ ...old, [key]: value }));
    setDirty(true);
    setMessage('');
  };
  const save = async () => {
    if (!w || !editable) throw Error('This page is read only for your role.');
    if (p.id === 'profile') {
      await api('/api/community/profile', { projectId: w.project.id, data: values }, 'PATCH');
      await load(w.project.id);
      setDirty(false);
      setMessage('Profile saved');
      return w.user.id;
    }
    const response = await api(
      '/api/community/records',
      {
        projectId: w.project.id,
        id: record?.id,
        version: record?.version,
        kind: pageKind(p.id),
        title: p.title,
        data: values,
      },
      record ? 'PATCH' : 'POST'
    );
    await load(w.project.id);
    setRecordId(response.id);
    setNewRecord(false);
    setDirty(false);
    setMessage('Saved');
    return response.id as string;
  };
  const guardNavigation = (navigate: () => void) => {
    if (dirty) {
      pending.current = navigate;
      setPanel('unsaved');
    } else if (proposalFlush.current)
      void proposalFlush.current().then((ok) => {
        if (ok) navigate();
      });
    else navigate();
  };
  const switchRole = (nextRole: string) =>
    guardNavigation(
      () =>
        void perform(async () => {
          if (!w) return;
          await api('/api/community/demo-role', { projectId: w.project.id, role: nextRole });
          await load(w.project.id);
          setRecordId(null);
          setNewRecord(false);
          setDirty(false);
          setPanel('');
        })
    );
  const changeProject = (id: string) =>
    guardNavigation(
      () =>
        void perform(async () => {
          if (!w) return;
          if (w.user.is_test && w.projects.find((x) => x.id === id)?.is_demo)
            await api('/api/community/demo-role', { projectId: id, role: w.project.role });
          await load(id);
          setDirty(false);
          setPageId('project');
          setNewRecord(false);
          setRecordId(null);
          history.pushState(null, '', `${location.pathname}?project=${id}#project`);
        })
    );
  const logout = () =>
    void perform(async () => {
      await api('/api/community/auth', {}, 'DELETE');
      setW(null);
      setSignedOut(true);
      setPanel('');
    });
  const upload = (file: File) =>
    void perform(async () => {
      if (!w) return;
      const id = dirty || !record ? await save() : record.id;
      const f = new FormData();
      f.set('projectId', w.project.id);
      f.set('recordId', id);
      f.set('file', file);
      const r = await fetch('/api/community/files', { method: 'POST', body: f });
      const result = await r.json();
      if (!r.ok) throw Error(result.error);
      await load(w.project.id);
      setMessage('File attached');
    });
  const transition = (to: string) =>
    void perform(async () => {
      if (!w || !record) return;
      if (dirty) throw Error('Save your changes before submitting.');
      await api(
        '/api/community/records',
        { projectId: w.project.id, id: record.id, version: record.version, to, comment },
        'PATCH'
      );
      await load(w.project.id);
      setComment('');
      setMessage('Decision recorded');
    });
  const exportReport = () => {
    if (!w) return;
    const blob = new Blob(
      [
        JSON.stringify(
          {
            project: w.project,
            exportedAt: new Date().toISOString(),
            illustrative: w.project.is_demo,
            records: w.records,
            history: w.events,
          },
          null,
          2
        ),
      ],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob),
      a = document.createElement('a');
    a.href = url;
    a.download = 'beeyond-journey.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const ai = (name: string) => journeyArtwork(w?.project, name);
  const isImpact = p.projectType === 'impact',
    group = pageGroup(p),
    artwork = ['items', 'item', 'styling', 'fitting'].includes(p.id)
      ? 'product'
      : isImpact
        ? 'field'
        : p.id.includes('intention')
          ? 'craft'
          : 'landscape';
  const fieldValue = (f: HorizonField) => String(values[f.id] ?? '');
  const display = (f: HorizonField) => fieldValue(f) || 'Not documented';
  const field = (f: HorizonField, index: number, inPanel = false): ReactNode => {
    const read = !editable,
      inputId = f.id + (inPanel ? '-detail' : '');
    if (f.type === 'choices' && f.options.length > 0)
      return (
        <section className={`choice-group ${index === 0 ? 'first-choice' : ''}`} key={f.id}>
          <h2 id={inputId + '-label'}>{f.label}</h2>
          <div className="visual-options" role="group" aria-labelledby={inputId + '-label'}>
            {f.options.map((v, k) => (
              <button
                type="button"
                className={`visual-option ${v === fieldValue(f) ? 'selected' : ''}`}
                key={v}
                aria-pressed={v === fieldValue(f)}
                disabled={read || busy}
                onClick={() => set(f.id, v)}
              >
                {p.id === 'brief-intention' && index === 0 ? (
                  <Photo src={ai(order[k])} className="option-photo" />
                ) : null}
                <span className="option-caption">
                  <Icon name={choiceIcons[v] || f.icon} />
                  <span>{v}</span>
                  {v === fieldValue(f) && <Icon name="check" className="check" />}
                </span>
              </button>
            ))}
          </div>
        </section>
      );
    if (f.type === 'upload')
      return (
        <div className={`field upload ${read ? 'readonly' : ''}`} key={f.id}>
          <label className="field-label" htmlFor={inputId}>
            <Icon name={f.icon} />
            {f.label}
          </label>
          <div className="upload-content">
            <Icon name={read ? 'file' : 'plus'} />
            {read ? (
              <span>{display(f)}</span>
            ) : (
              <input
                id={inputId}
                type="text"
                placeholder="File description or shared reference"
                value={fieldValue(f)}
                onChange={(e) => set(f.id, e.target.value)}
                maxLength={5000}
              />
            )}
            <button
              type="button"
              className="icon-button"
              onClick={() => setPanel('details')}
              aria-label={`Attach ${f.label}`}
            >
              <Icon name="upload" />
            </button>
          </div>
        </div>
      );
    return (
      <div className={`field ${read ? 'readonly' : ''}`} key={f.id}>
        <label className="field-label" htmlFor={inputId}>
          <Icon name={f.icon} />
          {f.label}
        </label>
        {read ? (
          <div className={'field-value ' + f.type}>{display(f)}</div>
        ) : f.type === 'select' && f.options.length > 0 ? (
          <select
            id={inputId}
            className="field-value"
            value={fieldValue(f)}
            onChange={(e) => set(f.id, e.target.value)}
          >
            <option value="">Choose…</option>
            {f.options.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        ) : (
          <input
            id={inputId}
            className="field-value"
            type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
            min={f.type === 'number' ? 0 : undefined}
            maxLength={5000}
            placeholder={
              f.type === 'chips' ? 'Three words, separated by /' : 'Add ' + f.label.toLowerCase()
            }
            value={fieldValue(f)}
            onChange={(e) => set(f.id, e.target.value)}
            disabled={busy}
          />
        )}
      </div>
    );
  };
  const rows = (fields = p.fields) => (
    <div className="quiet-rows">
      {fields.map((f) => (
        <button type="button" className="quiet-row" key={f.id} onClick={() => setPanel('details')}>
          <span className="row-icon">
            <Icon name={f.icon} />
          </span>
          <span>
            <h3>{f.label}</h3>
            <p>{display(f)}</p>
          </span>
          <span className="row-end">
            <Icon name="arrow" />
          </span>
        </button>
      ))}
    </div>
  );
  const gallery = (fields = p.fields) => (
    <div className={'image-gallery ' + p.kind}>
      {fields.map((f, j) => (
        <button
          type="button"
          className={`image-tile ${j === 1 ? 'featured' : ''}`}
          key={f.id}
          onClick={() => setPanel('details')}
        >
          <Photo
            src={ai(
              isImpact
                ? 'field'
                : p.id === 'items'
                  ? 'product'
                  : p.id === 'casting'
                    ? ['beauty', 'talent'][j % 2]
                    : p.id === 'beauty'
                      ? ['beauty', 'fashion', 'beauty'][j % 3]
                      : p.id === 'scouting'
                        ? ['landscape', 'frame-arch', 'frame-shadow'][j % 3]
                        : order[j % 4]
            )}
          />
          <span className="tile-caption">
            <Icon name={f.icon} />
            <span>
              <h3>{f.label}</h3>
              <p>{display(f)}</p>
            </span>
            <Icon name="arrow" />
          </span>
        </button>
      ))}
    </div>
  );

  if (loading)
    return (
      <div className="horizon loading">
        <Icon name="flower" />
        <p>Opening your journey…</p>
      </div>
    );
  if (signedOut)
    return (
      <HorizonLogin
        onSuccess={() =>
          void perform(async () => {
            const url = new URL(location.href);
            await load(url.searchParams.get('project') || undefined);
            setPageId(url.hash.slice(1).split('/')[0] || 'projects');
          })
        }
      />
    );
  if (!w)
    return (
      <div className="horizon loading">
        <p role="alert">{error || 'No journey has been assigned yet.'}</p>
        <button
          className="main-action"
          onClick={() =>
            void perform(async () => {
              await load();
            })
          }
        >
          Try again
        </button>
        <button onClick={logout}>Sign out</button>
      </div>
    );
  const activeProject = w.projects[projectIndex % w.projects.length],
    activeExample = examples.find((x) => x.id === activeProject.id);
  const decisionStatus = dirty
    ? 'Unsaved changes'
    : message ||
      (record
        ? statusLabel(record.status)
        : editable
          ? 'New draft'
          : mode === 'approve'
            ? 'Decision pending'
            : 'Read only');
  const brief = pages.filter(
      (x) => x.phase === 'Brief' && !['brief-scope', 'brief-review'].includes(x.id)
    ),
    step = brief.findIndex((x) => x.id === p.id);
  const pager =
    step >= 0
      ? `${String(step + 1).padStart(2, '0')} / 12`
      : p.phase.startsWith('Scouting')
        ? 'BEE → SCOUTING → FLOWER'
        : isImpact
          ? 'BEE / FLOWER / HONEY'
          : group.toUpperCase();
  let content: ReactNode;
  if (!visible)
    content = (
      <div className="review-layout">
        <div className="review-art">
          <Photo src={ai('landscape')} />
        </div>
        <div>
          <h2>Your workspace</h2>
          <p>This step belongs to another role.</p>
          <button className="text-link" onClick={() => go('project')}>
            Open your journey <Icon name="arrow" />
          </button>
        </div>
      </div>
    );
  else if (p.kind === 'choice')
    content = (
      <div className="choices">
        {p.id !== 'brief-intention' && (
          <div className="choice-illustration">
            <Photo src={ai(isImpact ? 'field' : 'landscape')} />
          </div>
        )}
        {p.fields.map((f, i) => field(f, i))}
      </div>
    );
  else if (p.id === 'profile')
    content = (
      <div className="form-layout">
        <div className="form-art">
          <Photo src={ai('craft')} />
        </div>
        <div className="form-fields">
          {p.fields.map((f, i) => field({ ...f, type: f.type === 'upload' ? 'text' : f.type }, i))}
          <p>{roleNames[w.project.role]}</p>
          <button className="text-link" onClick={logout}>
            Sign out <Icon name="arrow" />
          </button>
        </div>
      </div>
    );
  else if (p.kind === 'form')
    content = (
      <div className="form-layout">
        <div className="form-art">
          <Photo src={ai(artwork)} />
          <span className="image-caption">A sense of {isImpact ? 'purpose' : 'place'}</span>
        </div>
        <div className="form-fields">{p.fields.map((f, i) => field(f, i))}</div>
      </div>
    );
  else if (p.kind === 'projects')
    content = (
      <>
        <div className="portfolio">
          <Photo
            src={
              activeProject.territory === 'Morocco'
                ? assets.landscape
                : activeExample?.cover || assets.landscape
            }
          />
          <div className="portfolio-title">
            <span className="eyebrow">YOUR JOURNEY</span>
            <h2>{activeProject.territory}</h2>
            <p>{activeExample?.brand || activeProject.title}</p>
            <button className="text-link" onClick={() => changeProject(activeProject.id)}>
              Open journey <Icon name="arrow" />
            </button>
          </div>
          <span className="portfolio-count">
            {String(projectIndex + 1).padStart(2, '0')} /{' '}
            {String(w.projects.length).padStart(2, '0')}
          </span>
        </div>
        <div className="project-switcher" aria-label="Your projects">
          {w.projects.map((x, i) => (
            <button aria-pressed={i === projectIndex} key={x.id} onClick={() => setProjectIndex(i)}>
              {x.territory}
            </button>
          ))}
        </div>
      </>
    );
  else if (p.kind === 'overview')
    content = (
      <div className="project-overview">
        <Photo src={ai('landscape')} />
        <div className="overview-next">
          <span className="eyebrow">YOUR WORKSPACE</span>
          <h2>
            {role === 'brand'
              ? 'Shape the intention'
              : role === 'bee'
                ? 'Connect the next step'
                : role === 'production'
                  ? 'Prepare the journey'
                  : role === 'ngo'
                    ? 'Document your action'
                    : role === 'expert'
                      ? 'Your assigned review'
                      : 'Bring your craft'}
          </h2>
          <div className="phase-path">
            {[
              ['Bee', 'brief-scope'],
              ['Scouting', 'scouting'],
              ['Flower', 'call-sheet'],
              ['Honey', 'report'],
            ].map(([label, id]) => (
              <button key={id} disabled={!allowed.some((x) => x.id === id)} onClick={() => go(id)}>
                {label}
              </button>
            ))}
          </div>
          <p>
            {roleNames[w.project.role]} · {w.project.territory}
          </p>
          <button
            className="text-link"
            onClick={() => {
              setNavGroup(role === 'ngo' || role === 'expert' ? 'Impacts' : 'Creatives');
              setPanel('nav');
            }}
          >
            Explore the journey <Icon name="arrow" />
          </button>
        </div>
      </div>
    );
  else if (p.id === 'inbox')
    content = (
      <div className="list-layout">
        <div className="list-art">
          <Photo src={ai('craft')} />
        </div>
        <div className="quiet-rows">
          {w.records
            .filter((r) => availableTransitions(w.project.role, r, w.user).length > 0)
            .slice(0, 6)
            .map((r) => (
              <button
                className="quiet-row"
                key={r.id}
                onClick={() => {
                  if (r.kind.startsWith('horizon:')) go(r.kind.slice(8));
                  else if (r.kind.startsWith('studio:'))
                    go(
                      (
                        {
                          'studio:frame': 'allocation',
                          'studio:reference': 'allocation',
                          'studio:place': 'scouting',
                          'studio:look': 'styling',
                          'studio:product': 'items',
                          'studio:readiness': 'team',
                          'studio:activity': 'call-sheet',
                          'studio:route': 'itinerary',
                          'studio:availability': 'calendar',
                        } as Record<string, string>
                      )[r.kind] || 'project'
                    );
                  else {
                    setPanel('legacy');
                  }
                }}
              >
                <Icon name="flag" />
                <span>
                  <h3>{r.title}</h3>
                  <p>{statusLabel(r.status)}</p>
                </span>
                <Icon name="arrow" />
              </button>
            ))}
          {!w.records.some((r) => availableTransitions(w.project.role, r, w.user).length > 0) && (
            <p>Nothing awaiting your decision.</p>
          )}
        </div>
      </div>
    );
  else if (p.id === 'calendar')
    content = (
      <div className="calendar-view">
        <div className="calendar-art">
          <Photo src={ai('landscape')} />
          <span>THE SHARED RHYTHM</span>
        </div>
        <div className="agenda">
          {w.records
            .filter((r) => r.data.due || Object.keys(r.data).some((k) => /dates|deadline/.test(k)))
            .slice(0, 5)
            .map((r) => (
              <button
                className="agenda-row"
                key={r.id}
                onClick={() =>
                  r.kind.startsWith('horizon:') ? go(r.kind.slice(8)) : setPanel('legacy')
                }
              >
                <span className="agenda-time">{String(r.data.due || 'Planned')}</span>
                <i />
                <Icon name="calendar" />
                <h3>{r.title}</h3>
              </button>
            ))}
          <button className="text-link" onClick={() => go('call-sheet')}>
            Open call sheet <Icon name="arrow" />
          </button>
        </div>
      </div>
    );
  else if (p.kind === 'gallery' || p.kind === 'board') content = gallery();
  else if (['scout', 'allocation'].includes(p.kind))
    content = (
      <div className="scout-layout">
        <div className="scout-photo">
          <Photo src={ai(p.kind === 'allocation' ? 'fashion' : 'landscape')} />
          <div className="photo-overlay">
            <span>01 / {w.project.territory.toUpperCase()}</span>
            <Icon name="pin" />
            <span>{p.kind === 'allocation' ? 'The look in the frame' : 'A frame to explore'}</span>
            <button
              className="icon-button"
              onClick={() => setPanel('image')}
              aria-label="Enlarge frame"
            >
              <Icon name="image" />
            </button>
          </div>
        </div>
        {p.kind === 'allocation' ? (
          <div className="allocation-strip">
            {p.fields.map((f, i) => (
              <div key={f.id}>
                <button type="button" onClick={() => setPanel('details')}>
                  <Icon name={f.icon} />
                  <h3>{f.label}</h3>
                  <Photo
                    src={ai(
                      [
                        'product',
                        'fashion',
                        'frame-shadow',
                        'fashion',
                        'beauty',
                        'frame-arch',
                        'talent',
                      ][i % 7]
                    )}
                  />
                  <p>{display(f)}</p>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="scout-detail">
            {rows()}
            <div className="frame-strip">
              {['landscape', 'frame-arch', 'frame-shadow'].map((n, i) => (
                <div key={n}>
                  <button onClick={() => go('frame')}>
                    <Photo src={ai(n)} />
                    <span>Frame 0{i + 1}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  else if (p.kind === 'asset')
    content = (
      <div className="asset-layout">
        <figure>
          <Photo src={ai(artwork === 'landscape' ? 'fashion' : artwork)} />
          <div className="asset-thumbs">
            {['product', 'fashion', 'craft'].map((n) => (
              <Photo src={ai(n)} key={n} />
            ))}
          </div>
        </figure>
        {rows()}
      </div>
    );
  else if (p.kind === 'calendar')
    content = (
      <div className="calendar-view">
        <div className="calendar-art">
          <Photo src={ai('landscape')} />
          <span>{p.id === 'call-sheet' ? 'DAY 01 / PRODUCTION' : 'THE SHARED RHYTHM'}</span>
        </div>
        <div className="agenda">
          {p.fields.map((f) => (
            <button className="agenda-row" key={f.id} onClick={() => setPanel('details')}>
              <span className="agenda-time">{f.label}</span>
              <i />
              <Icon name={f.icon} />
              <h3>{display(f)}</h3>
            </button>
          ))}
        </div>
      </div>
    );
  else if (p.kind === 'map')
    content = (
      <div className="map-layout">
        <div className="map-photo">
          <Photo src={ai('landscape')} />
          <svg className="map-route" viewBox="0 0 600 420">
            <path d="M90 320C140 210 310 330 350 170S450 60 520 100" />
            <circle cx="90" cy="320" r="9" />
            <circle cx="350" cy="170" r="9" />
            <circle cx="520" cy="100" r="9" />
          </svg>
          <span className="map-caption">PLANNING DIAGRAM / NOT A GPS ROUTE</span>
        </div>
        {rows()}
      </div>
    );
  else if (p.kind === 'review' || p.kind === 'status')
    content = (
      <div className="review-layout">
        <div className="review-art">
          <Photo src={ai(isImpact ? 'field' : p.id.includes('brief') ? 'craft' : 'fashion')} />
          <span className="art-status">
            <Icon name="shield" />
            {record ? statusLabel(record.status) : 'A considered decision'}
          </span>
        </div>
        <div className="review-list">
          {rows()}
          {transitions.length > 0 && (
            <div className="decision-options">
              {transitions.map((t) => (
                <button onClick={() => setPanel('details')} key={t.to}>
                  <Icon name={t.to === 'needs_update' ? 'message' : 'check'} />
                  {transitionName[t.to] || statusLabel(t.to)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  else if (p.kind === 'metrics' || p.kind === 'capital')
    content = (
      <div className="impact-layout">
        <div className="impact-panorama">
          <Photo src={ai(isImpact ? 'field' : 'landscape')} />
          <span>{isImpact ? 'THE LOCAL ACTION TRACE' : 'THE PRODUCTION TRACE'}</span>
        </div>
        <div className="metric-grid">
          {p.fields.map((f) => (
            <div className="metric" key={f.id}>
              <Icon name={f.icon} />
              <h2>{f.label}</h2>
              <p>{display(f)}</p>
              <button className="text-link" onClick={() => setPanel('details')}>
                View record <Icon name="arrow" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  else if (p.kind === 'team' || p.kind === 'bookings')
    content = (
      <div className="team-layout">
        {p.fields.map((f, j) => (
          <button className="team-member" key={f.id} onClick={() => setPanel('details')}>
            <Icon name={f.icon} />
            <h2>{f.label}</h2>
            {p.kind === 'team' && (
              <Photo
                src={ai(j === 0 ? 'fashion' : j === 1 ? 'craft' : 'landscape')}
                className="team-portrait"
              />
            )}
            <p>{display(f)}</p>
            <span>
              <Icon name="arrow" />
            </span>
          </button>
        ))}
      </div>
    );
  else
    content = (
      <div className="list-layout">
        <div className="list-art">
          <Photo src={ai(isImpact ? 'field' : 'craft')} />
        </div>
        {rows()}
      </div>
    );

  const primaryLabel = !visible
    ? 'Open your journey'
    : p.id === 'projects'
      ? 'Open journey'
      : p.id === 'report'
        ? 'Export report'
        : p.id === 'profile'
          ? 'Save profile'
          : p.id === 'project'
            ? 'Continue journey'
            : ['form', 'choice'].includes(p.kind) && editable
              ? 'Save & continue'
              : mode === 'approve'
                ? 'Review & decide'
                : primaryNext[p.id]
                  ? 'Continue journey'
                  : editable
                    ? 'Open & edit'
                    : 'View details';
  const primary = () => {
    if (!visible) {
      go('project');
      return;
    }
    if (p.id === 'projects') {
      changeProject(activeProject.id);
      return;
    }
    if (p.id === 'report') {
      exportReport();
      return;
    }
    if (p.id === 'profile') {
      void perform(async () => {
        await save();
        go('projects', true);
      });
      return;
    }
    if (['form', 'choice'].includes(p.kind) && editable) {
      void perform(async () => {
        await save();
        next(true);
      });
      return;
    }
    if (p.id === 'project') {
      setNavGroup(role === 'ngo' || role === 'expert' ? 'Impacts' : 'Creatives');
      setPanel('nav');
      return;
    }
    if (primaryNext[p.id] && mode !== 'approve') {
      next();
      return;
    }
    setPanel('details');
  };
  return (
    <div
      className={`horizon direction-A kind-${p.kind} ${isImpact ? 'is-impact' : ''} mode-${mode} ${visible && [...studioPages, ...productionPages, ...mediaPages, ...impactPages, ...proposalPages].includes(p.id) ? 'source-layout' : ''}`}
      data-page={p.id}
      aria-busy={busy}
    >
      <div className="ambient" style={{ backgroundImage: `url('${ai('landscape')}')` }} />
      <header className="topbar">
        <button className="back-link" onClick={() => go('projects')}>
          <Icon name="back" />
          My projects
        </button>
        <button className="wordmark" onClick={() => go('project')}>
          BEEYONDTHEWORLD
        </button>
        <div className="profile-mark">
          <button className="icon-button" onClick={() => go('inbox')} aria-label="Your next steps">
            <Icon name="bell" />
          </button>
          {w.user.is_test && w.project.is_demo ? (
            <select
              aria-label="Test role"
              value={w.project.role}
              disabled={busy}
              onChange={(e) => switchRole(e.target.value)}
            >
              {w.testRoles?.map((r) => (
                <option key={r} value={r}>
                  {roleNames[r]}
                </option>
              ))}
            </select>
          ) : (
            <span>{roleNames[w.project.role]}</span>
          )}
          <button className="icon-button" aria-label="Your profile" onClick={() => go('profile')}>
            <Icon name="user" />
          </button>
        </div>
      </header>
      <aside className="global-nav" aria-label="Journey sections">
        {['Creatives', 'Journeys', 'Impacts'].map((name, i) => (
          <button
            className={`nav-entry ${group === name ? 'active' : ''}`}
            key={name}
            onClick={() => {
              setNavGroup(name);
              setPanel('nav');
            }}
          >
            <Icon name={['feather', 'flower', 'leaf'][i]} />
            <span>{name}</span>
          </button>
        ))}
      </aside>
      <main>
        <div className="page-meta">
          <button onClick={() => go('project')}>{w.project.title}</button>
          <button
            onClick={() => {
              setNavGroup(group);
              setPanel('nav');
            }}
            aria-label="Choose a journey step"
          >
            {pager}
          </button>
        </div>
        <div className="heading">
          <span className="section-symbol">
            <Icon
              name={
                isImpact
                  ? 'leaf'
                  : p.phase === 'Brief'
                    ? 'feather'
                    : group === 'Journeys'
                      ? 'pin'
                      : 'spark'
              }
            />
          </span>
          <h1>{visible ? p.title : 'Your journey'}</h1>
        </div>
        <div className="workspace">
          {p.id === 'projects' && w.project.role === 'bee' && (
            <button
              className="source-export new-journey-button"
              onClick={() => setPanel('create-project')}
            >
              <Icon name="plus" />
              New journey
            </button>
          )}
          {visible && proposalPages.includes(p.id) ? (
            <ProposalWorkspace
              key={w.project.id + w.project.role}
              w={w}
              page={p.id}
              go={go}
              registerFlush={registerProposalFlush}
            />
          ) : visible && p.id === 'itinerary' ? (
            <ItineraryWorkspace
              key={w.project.id}
              w={w}
              go={go}
              refresh={() => load(w.project.id)}
            />
          ) : visible && impactPages.includes(p.id) ? (
            <ImpactWorkspace
              key={w.project.id + p.id}
              w={w}
              page={p.id}
              refresh={() => load(w.project.id)}
              go={go}
            />
          ) : visible && mediaPages.includes(p.id) ? (
            <MediaWorkspace
              key={w.project.id + p.id}
              w={w}
              page={p.id}
              refresh={() => load(w.project.id)}
              go={go}
            />
          ) : visible && productionPages.includes(p.id) ? (
            <ProductionWorkspace
              key={w.project.id}
              w={w}
              page={p.id}
              refresh={() => load(w.project.id)}
              go={go}
            />
          ) : visible && studioPages.includes(p.id) ? (
            <StudioWorkspace
              key={w.project.id}
              w={w}
              page={p.id}
              refresh={() => load(w.project.id)}
              go={go}
            />
          ) : (
            content
          )}
          {p.id === 'project' && (
            <button className="proposal-entry" onClick={() => go('tale-brief')}>
              <span>
                <strong>Creative Studio</strong>
                <small>Create the proposal · chapters, contributions, Bee & brand review</small>
              </span>
              <Icon name="arrow" />
            </button>
          )}
          {p.id === 'project' && w.project.is_demo && <RehearsalGuide w={w} go={go} />}
        </div>
        {error && (
          <div className="feedback error" role="alert">
            {error}
          </div>
        )}
        {!proposalPages.includes(p.id) && (
          <footer className="page-action">
            <span className="access-state" role="status">
              <Icon
                name={
                  dirty
                    ? 'clock'
                    : mode === 'read'
                      ? 'lock'
                      : mode === 'approve'
                        ? 'shield'
                        : 'check'
                }
              />
              {busy ? 'Saving…' : decisionStatus}
            </span>
            {visible && !['projects', 'profile'].includes(p.id) && (
              <button className="detail-button" onClick={() => setPanel('details')}>
                <Icon name="plus" />
                {p.detail || p.secondary || 'View details'}
              </button>
            )}
            <button className="main-action" disabled={busy} onClick={primary}>
              {primaryLabel}
              <Icon name="arrow" />
            </button>
          </footer>
        )}
      </main>
      <div className="study-footer">
        <span>{w.project.is_demo ? 'DEMO JOURNEY · ILLUSTRATIVE WORKFLOW' : w.project.title}</span>
        <span>AI VISUAL CONCEPTS / HORIZON</span>
      </div>
      {panel === 'create-project' && (
        <OnboardingDialog kind="project" w={w} close={() => setPanel('')} />
      )}
      {panel === 'nav' && (
        <Modal title="Explore your journey" onClose={() => setPanel('')}>
          <div className="section-tabs">
            {['Creatives', 'Journeys', 'Impacts'].map((g) => (
              <button key={g} aria-pressed={navGroup === g} onClick={() => setNavGroup(g)}>
                {g}
              </button>
            ))}
          </div>
          <nav className="journey-index">
            {[
              ...new Set(
                allowed
                  .filter(
                    (x) =>
                      pageGroup(x) === navGroup && !['projects', 'project', 'login'].includes(x.id)
                  )
                  .map((x) => x.phase)
              ),
            ].map((phase) => (
              <section key={phase}>
                <h3>{phase}</h3>
                {allowed
                  .filter(
                    (x) =>
                      x.phase === phase &&
                      pageGroup(x) === navGroup &&
                      !['projects', 'project', 'login'].includes(x.id)
                  )
                  .map((x) => (
                    <button
                      className={x.id === p.id ? 'current' : ''}
                      key={x.id}
                      onClick={() => go(x.id)}
                    >
                      <span>{x.title}</span>
                      <Icon name={pageRecord(w, x) ? 'check' : 'arrow'} />
                    </button>
                  ))}
              </section>
            ))}
          </nav>
        </Modal>
      )}
      {panel === 'details' && (
        <Modal title={p.title} onClose={() => setPanel('')}>
          <h2>{p.title}</h2>
          <p className="detail-status">
            {record
              ? `${statusLabel(record.status)} · Version ${record.version}`
              : 'Not yet recorded'}
          </p>
          {records.length > 1 && (
            <label className="field-label">
              Record
              <select
                value={record?.id || ''}
                disabled={dirty}
                onChange={(e) => {
                  setRecordId(e.target.value);
                  setNewRecord(false);
                }}
              >
                {records.map((r, i) => (
                  <option key={r.id} value={r.id}>
                    {r.title} · {i + 1} · {statusLabel(r.status)}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="form-fields">
            {p.fields.map((f, i) => field(f, i, true))}
            {record &&
              ['bee', 'production'].includes(w.project.role) &&
              [
                'invite',
                'agreements',
                'bookings',
                'call-sheet',
                'transport',
                'stay',
                'fitting',
              ].includes(p.id) && (
                <label className="field">
                  For a specific team member
                  <select
                    className="field-value"
                    value={String(record.data.assigneeId || '')}
                    disabled={busy || dirty}
                    onChange={(e) =>
                      void perform(async () => {
                        await api(
                          '/api/community/records',
                          {
                            projectId: w.project.id,
                            id: record.id,
                            version: record.version,
                            assignMember: e.target.value,
                          },
                          'PATCH'
                        );
                        await load(w.project.id);
                      })
                    }
                  >
                    <option value="" disabled>
                      Choose a member…
                    </option>
                    {w.members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} · {roleNames[m.role]}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            {(kinds[pageKind(p.id)]?.fields || [])
              .filter((f) => ['sourceId', 'risk', 'indicatorType'].includes(f.key))
              .map((f) => (
                <label className="field" key={f.key}>
                  {f.label}
                  {editable ? (
                    <select
                      className="field-value"
                      value={String(values[f.key] || '')}
                      onChange={(e) => {
                        set(f.key, e.target.value);
                        if (f.key === 'sourceId') {
                          const source = w.records.find((r) => r.id === e.target.value);
                          set('sourceVersion', String(source?.version || ''));
                        }
                      }}
                    >
                      <option value="">Choose…</option>
                      {f.type === 'record'
                        ? w.records
                            .filter((r) => r.kind === f.linkKind)
                            .map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.title} · revision {r.version} · {statusLabel(r.status)}
                              </option>
                            ))
                        : f.options?.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <div className="field-value">
                      {f.type === 'record'
                        ? w.records.find((r) => r.id === values[f.key])?.title || 'Not documented'
                        : String(values[f.key] || 'Not documented')}
                    </div>
                  )}
                </label>
              ))}
            {editable && (
              <>
                <label className="field">
                  Notes
                  <textarea
                    className="field-value"
                    value={String(values.notes || '')}
                    maxLength={5000}
                    onChange={(e) => set('notes', e.target.value)}
                  />
                </label>
                <label className="field">
                  Shared source
                  <input
                    className="field-value"
                    type="url"
                    placeholder="https://"
                    value={String(values.reference || '')}
                    onChange={(e) => set('reference', e.target.value)}
                  />
                </label>
                <button
                  className="main-action"
                  disabled={busy}
                  onClick={() =>
                    void perform(async () => {
                      await save();
                    })
                  }
                >
                  Save draft
                  <Icon name="check" />
                </button>
              </>
            )}
          </div>
          <div className="files-list">
            {record?.files?.map((f) => (
              <a href={`/api/community/files?project=${w.project.id}&id=${f.id}`} key={f.id}>
                <Icon name="file" />
                {f.name}
                <Icon name="download" />
              </a>
            ))}
            {editable && (
              <label className="upload-content">
                <Icon name="upload" />
                <span>Attach PDF or image · up to 3 MB</span>
                <input
                  type="file"
                  aria-label="Attach a file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  disabled={busy}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) upload(f);
                    e.target.value = '';
                  }}
                />
              </label>
            )}
          </div>
          {transitions.length > 0 && (
            <div className="review-controls">
              <label>
                Decision note
                <textarea
                  className="field-value"
                  value={comment}
                  maxLength={2000}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Explain your decision or requested changes"
                />
              </label>
              {transitions.map((t) => (
                <button
                  className={t.to === 'needs_update' ? 'text-link' : 'main-action'}
                  key={t.to}
                  disabled={busy || dirty}
                  onClick={() => transition(t.to)}
                >
                  {transitionName[t.to] || statusLabel(t.to)}
                  <Icon name="arrow" />
                </button>
              ))}
            </div>
          )}
          {record &&
            w.project.role === 'bee' &&
            ['indicator', 'expert-review', 'evidence-add'].includes(p.id) && (
              <label className="field-label">
                Independent reviewer
                <select
                  defaultValue={String(record.data.reviewerId || '')}
                  onChange={(e) =>
                    void perform(async () => {
                      await api(
                        '/api/community/records',
                        {
                          projectId: w.project.id,
                          id: record.id,
                          version: record.version,
                          assignReviewer: e.target.value,
                        },
                        'PATCH'
                      );
                      await load(w.project.id);
                    })
                  }
                >
                  <option value="">Assign an expert…</option>
                  {w.members
                    .filter((m) => m.role === 'expert')
                    .map((m) => (
                      <option value={m.id} key={m.id}>
                        {m.name}
                      </option>
                    ))}
                </select>
              </label>
            )}
          {kinds[pageKind(p.id)]?.roles.includes(w.project.role) &&
            !['Brief', 'Trust'].includes(p.phase) &&
            !dirty && (
              <button
                className="text-link"
                onClick={() => {
                  setNewRecord(true);
                  setRecordId(null);
                  setValues({});
                  setDirty(false);
                }}
              >
                Create another record <Icon name="plus" />
              </button>
            )}
          <details className="history">
            <summary>History & previous versions</summary>
            {w.events
              .filter((e) => e.record_id === record?.id)
              .map((e) => (
                <p key={e.id}>
                  <strong>{e.actor}</strong> · {statusLabel(e.action)} ·{' '}
                  {new Date(e.created_at).toLocaleString('en-GB')}
                  <br />
                  {e.comment || statusLabel(e.new_state)}
                </p>
              ))}
            {!record && <p>No recorded changes.</p>}
          </details>
          {error && (
            <p className="feedback error" role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className="feedback" role="status">
              {message}
            </p>
          )}
        </Modal>
      )}
      {panel === 'image' && (
        <Modal title="Scouting frame · AI illustration" onClose={() => setPanel('')}>
          <Photo src={ai(p.kind === 'allocation' ? 'fashion' : 'landscape')} />
        </Modal>
      )}
      {panel === 'legacy' && (
        <Modal title="Project records" onClose={() => setPanel('')}>
          <p>Earlier project records remain available in the operations workspace.</p>
          <a className="main-action" href={`/community/operations?project=${w.project.id}`}>
            Open operations <Icon name="arrow" />
          </a>
        </Modal>
      )}
      {panel === 'unsaved' && (
        <Modal
          title="Your changes"
          onClose={() => {
            setPanel('');
            pending.current = null;
          }}
        >
          <h2>Keep this draft?</h2>
          <p>You have unsaved changes on this step.</p>
          {error && <p role="alert">{error}</p>}
          <div className="review-controls">
            <button
              className="main-action"
              disabled={busy}
              onClick={() =>
                void perform(async () => {
                  await save();
                  pending.current?.();
                  pending.current = null;
                })
              }
            >
              Save & continue <Icon name="check" />
            </button>
            <button
              className="text-link"
              disabled={busy}
              onClick={() => {
                setDirty(false);
                pending.current?.();
                pending.current = null;
              }}
            >
              Discard changes <Icon name="arrow" />
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function HorizonLogin({ onSuccess }: { onSuccess: () => void }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const f = new FormData(e.currentTarget);
    try {
      await api('/api/community/auth', { email: f.get('email'), password: f.get('password') });
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="horizon kind-form">
      <div className="ambient" style={{ backgroundImage: `url('${assets.landscape}')` }} />
      <header className="topbar">
        <Link href="/" className="back-link">
          <Icon name="back" />
          Beeyondtheworld
        </Link>
        <span className="wordmark">BEEYONDTHEWORLD</span>
        <Icon name="user" />
      </header>
      <main>
        <div className="page-meta">
          <span>YOUR SHARED JOURNEY</span>
        </div>
        <div className="heading">
          <Icon name="spark" />
          <h1>Enter the journey</h1>
        </div>
        <form onSubmit={submit}>
          <div className="form-layout">
            <div className="form-art">
              <Photo src={assets.landscape} />
              <span className="image-caption">A sense of place</span>
            </div>
            <div className="form-fields">
              <label className="field">
                <span className="field-label">
                  <Icon name="mail" />
                  Email address
                </span>
                <input
                  className="field-value"
                  type="email"
                  name="email"
                  autoComplete="username"
                  required
                />
              </label>
              <label className="field">
                <span className="field-label">
                  <Icon name="lock" />
                  Password
                </span>
                <input
                  className="field-value"
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  required
                />
              </label>
              {error && <p role="alert">{error}</p>}
              <button className="main-action" disabled={busy}>
                {busy ? 'Opening…' : 'Enter the journey'}
                <Icon name="arrow" />
              </button>
            </div>
          </div>
        </form>
      </main>
      <div className="study-footer">
        <span>BEE COMMUNITY</span>
        <span>AI VISUAL CONCEPTS / HORIZON</span>
      </div>
    </div>
  );
}
