'use client';

import { useEffect, useRef, useState } from 'react';
import {
  M,
  canProposalEdit,
  proposalPages,
  proposalNames,
  roleKey,
  type ProposalState,
  type ProposalOperation,
} from '@/lib/community/proposal';
import { journeyArtwork } from '@/lib/community/artwork';
import { pages as communityPages } from '@/lib/community/horizon';
import { roleNames, type Workspace } from '@/lib/community/types';
import { proposalIcons } from './proposal-icons';

type Snapshot = {
  version: number;
  state: ProposalState;
  status: string;
  updatedAt: string | null;
  history: { id: string; actor: string; action: string; comment: string; created_at: string }[];
};
type Renderer = { render: () => string; rights: () => string; exportPresentation: () => void };
type Host = Record<string, unknown>;
type TaleWindow = Window & { BeeTaleModel?: typeof M; BeeTaleWorkspace?: (host: Host) => Renderer };
let rendererPromise: Promise<void> | undefined;
function loadRenderer() {
  const win = window as TaleWindow;
  win.BeeTaleModel = M;
  return (rendererPromise ??= new Promise<void>((resolve, reject) => {
    if (win.BeeTaleWorkspace) return resolve();
    const script = document.createElement('script');
    script.src = '/review/tale-workspace.js?v=community-da-20261016';
    script.onload = () => resolve();
    script.onerror = () => {
      rendererPromise = undefined;
      reject(Error('The creative workspace could not load. Please retry.'));
    };
    document.head.appendChild(script);
  }));
}
const esc = (value: unknown) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!
  );
const icon = (name: string) =>
  `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${proposalIcons[name] || proposalIcons.doc}"/></svg>`;
const routes: Record<string, string> = {
  'beauty-library': 'beauty',
  'designer-network': 'styling',
  'set-studio': 'tale-team',
  'sound-library': 'tale-sound',
  'casting-agencies': 'casting',
  'co-creation': 'scouting',
  'actor-ledger': 'budget',
  'post-chapters': 'post-calendar',
  'label-social': 'production-social',
  'label-environment': 'production-environment',
  'label-economic': 'production-economic',
  'brand-value': 'report',
  'bee-certified': 'bee-label',
  'asset-passport': 'tale-rights',
};
function download(name: string, body: string, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([body], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
export function ProposalWorkspace({
  w,
  page,
  go,
  registerFlush,
}: {
  w: Workspace;
  page: string;
  go: (id: string) => void;
  registerFlush: (flush: (() => Promise<boolean>) | null) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const context = useRef({ w, page, go });
  context.current = { w, page, go };
  const snapshot = useRef<Snapshot | null>(null),
    state = useRef<ProposalState>({}),
    pending = useRef<Record<string, unknown>>({});
  const ui = useRef<ProposalState>({ chapter: 0 }),
    renderer = useRef<Renderer | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined),
    queue = useRef<Promise<boolean>>(Promise.resolve(true));
  const active = useRef(true),
    inFlight = useRef(false),
    blocked = useRef(false);
  const [notice, setNotice] = useState('Loading shared proposal…'),
    [error, setError] = useState(''),
    [ready, setReady] = useState(false);
  const drawRef = useRef<() => void>(() => {}),
    saveRef = useRef<() => Promise<boolean>>(() => Promise.resolve(true));
  const chapters = () => [
    ['Light on stone', 'Courtyard', 'm:frame-arch'],
    ['Earth in motion', 'Olive grove', 'film-detail'],
    ['The human gesture', 'Local atelier', 'm:craft'],
    ...((state.current['da-extra-chapters'] || []) as string[][]),
  ];
  const fetchSnapshot = async () => {
    const r = await fetch(`/api/community/proposal?project=${w.project.id}`, { cache: 'no-store' });
    const data = await r.json();
    if (!r.ok) throw Error(data.error);
    return data as Snapshot;
  };
  const accept = (data: Snapshot) => {
    snapshot.current = data;
    state.current = { ...data.state, ...pending.current, ...ui.current };
    if (active.current) {
      setNotice(Object.keys(pending.current).length ? 'Unsaved changes' : 'Saved to Community');
      setError('');
    }
  };
  const persist = (operation?: ProposalOperation, file?: File, key?: string): Promise<boolean> => {
    if (file && file.size > 4 * 1024 * 1024) {
      setError('Choose a JPEG, PNG or WebP image smaller than 4 MB.');
      return Promise.resolve(false);
    }
    clearTimeout(timer.current);
    const task = async () => {
      if (blocked.current) return false;
      const edits = { ...pending.current };
      if (!Object.keys(edits).length && !operation && !file) return true;
      inFlight.current = true;
      if (active.current) setNotice('Saving to Community…');
      try {
        const send = async (op?: ProposalOperation) => {
          let response: Response;
          if (file && !op) {
            const form = new FormData();
            form.set('projectId', w.project.id);
            form.set('version', String(snapshot.current?.version || 0));
            form.set('key', key!);
            form.set('file', file);
            response = await fetch('/api/community/proposal', { method: 'POST', body: form });
          } else
            response = await fetch('/api/community/proposal', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                projectId: w.project.id,
                version: snapshot.current?.version || 0,
                operation: op,
              }),
            });
          const data = await response.json();
          if (!response.ok) {
            if (response.status === 409) blocked.current = true;
            throw Error(data.error || 'Could not save.');
          }
          return data as Snapshot;
        };
        if (Object.keys(edits).length) {
          const data = await send({ action: 'edit', fields: edits });
          for (const [k, v] of Object.entries(edits))
            if (pending.current[k] === v) delete pending.current[k];
          accept(data);
        }
        if (operation || file) accept(await send(operation));
        drawRef.current();
        return true;
      } catch (e) {
        if (active.current) {
          setError(e instanceof Error ? e.message : 'Could not save.');
          setNotice('Changes not saved');
        }
        return false;
      } finally {
        inFlight.current = false;
      }
    };
    const next = queue.current.then(task, task);
    queue.current = next;
    return next;
  };
  saveRef.current = () => persist();
  const navigate = async (id: string) => {
    const destination = routes[id] || id;
    if (
      !communityPages.some(
        (p) =>
          p.id === destination && (p.roles[roleKey(w.project.role)] || w.project.role === 'bee')
      )
    ) {
      setError(
        'This source workspace belongs to another project role. Ask its assigned team to update the contribution.'
      );
      return;
    }
    if (await persist()) context.current.go(destination);
  };
  const workspaceLink = (id: string, label: string, ic: string) => {
    const destination = routes[id] || id;
    const available = communityPages.some(
      (p) => p.id === destination && (p.roles[roleKey(w.project.role)] || w.project.role === 'bee')
    );
    return available
      ? `<a class="vbutton" href="#${destination}">${icon(ic)}${esc(label)}</a>`
      : '<p class="notice">This source workspace is managed by its assigned team.</p>';
  };
  const connected = (raw: string) =>
    raw
      .replaceAll('up to 8 MB', 'up to 4 MB')
      .replaceAll('Saved on this device', 'Shared on Community')
      .replaceAll(' · local draft', ' · shared proposal')
      .replaceAll('Private to this browser.', 'Private to this project. Saved on the VPS.')
      .replaceAll(
        'These assignments and decisions are an exercise on this device. No invitation, task notification or real approval is sent.',
        w.project.is_demo
          ? 'Shared test production. Decisions are saved for the team; no external invitation is sent.'
          : 'Assignments and reviews are saved for project members. Invite new members from the Community team workspace.'
      )
      .replaceAll(
        'These controls record a local review exercise.',
        'Review decisions are recorded in this project’s activity history.'
      )
      .replaceAll('in this exercise', 'in this project')
      .replaceAll('criteria documented', 'evidence records approved')
      .replaceAll(
        'LOCAL DRAFT · AI / REFERENCE VISUALS · NO REAL APPROVAL, CERTIFICATION OR VERIFIED IMPACT CLAIM',
        w.project.is_demo
          ? 'DEMO PRODUCTION · AI / REFERENCE VISUALS · NO CERTIFICATION OR VERIFIED IMPACT CLAIM'
          : 'CREATIVE PROPOSAL · REFERENCE VISUALS · RIGHTS AND IMPACT EVIDENCE REQUIRED'
      )
      .replaceAll('reviewed in exercise', 'reviewed on Community')
      .replaceAll(
        'The document remains a clearly marked draft.',
        'The export includes the current revision and its review status.'
      );
  const sound = () => {
    const c = Number(ui.current.chapter || 0),
      can = canProposalEdit(roleKey(w.project.role), 'sound-brief-' + c, state.current);
    return `<div class="da-workspace"><aside class="da-sidebar"><h2>Sound Tale</h2><a href="#tale-hive">${icon('back')} Creative Hive</a></aside><div class="da-main"><section class="da-form paper"><div class="da-section-heading"><h2>One sound for each chapter.</h2></div><div class="da-chapter-list">${chapters()
      .map(
        (ch, i) =>
          `<button data-da-action="chapter" data-index="${i}" aria-pressed="${i === c}">${icon('sound')} ${esc(state.current['chapter-name-' + i] || ch[0])}</button>`
      )
      .join('')}</div>${[
      ['brief', 'Musical direction / narrative'],
      ['gps', 'Recording place / coordinates'],
      ['composer', 'Composer, performer & credits'],
      ['rights', 'Source, licence, territory and term'],
      ['reference', 'Audio reference / asset link'],
    ]
      .map(
        ([key, label]) =>
          `<div class="field"><label for="sound-${key}-${c}">${label}</label><textarea id="sound-${key}-${c}" data-da-field="sound-${key}-${c}" maxlength="2400" ${can ? '' : 'readonly'}>${esc(state.current['sound-' + key + '-' + c])}</textarea></div>`
      )
      .join(
        ''
      )}<p class="notice">Document original recordings, permissions and contributors before making any origin or impact claim.</p><a class="vbutton" href="#tale-team">${icon('people')} Submit the sound contribution to its head</a></section></div></div>`;
  };
  drawRef.current = () => {
    if (!host.current || !renderer.current || !active.current) return;
    const focused = document.activeElement as HTMLInputElement | HTMLTextAreaElement | null;
    const focusKey = focused?.dataset.daField,
      start = focused?.selectionStart,
      end = focused?.selectionEnd;
    const open = [...host.current.querySelectorAll('details[open]')].map(
      (e) => e.querySelector('summary')?.textContent
    );
    let html =
      context.current.page === 'tale-rights'
        ? renderer.current.rights()
        : context.current.page === 'tale-sound'
          ? sound()
          : renderer.current.render();
    html = connected(html).replace(
      /href="#view\/[^/]+\/([^"/]+)"/g,
      (_, id) => `href="#${routes[id] || id}"`
    );
    const data = snapshot.current;
    html += `<details class="da-activity"><summary>${icon('clock')} Shared activity · ${data?.history.length || 0} recent events</summary>${data?.history.map((e) => `<p><strong>${esc(e.actor)}</strong> · ${esc(e.action.replaceAll('_', ' '))}<small>${esc(e.comment)} · ${esc(new Date(e.created_at).toLocaleString('en-GB'))}</small></p>`).join('') || '<p>Your first save starts the project history.</p>'}</details>`;
    host.current.innerHTML = html;
    for (const d of host.current.querySelectorAll('details'))
      if (open.includes(d.querySelector('summary')?.textContent)) d.open = true;
    if (focusKey) {
      const el = host.current.querySelector<HTMLInputElement | HTMLTextAreaElement>(
        `[data-da-field="${CSS.escape(focusKey)}"]`
      );
      el?.focus({ preventScroll: true });
      try {
        if (start != null && end != null) el?.setSelectionRange(start, end);
      } catch {}
    }
  };
  useEffect(() => {
    active.current = true;
    const start = async () => {
      try {
        const [data] = await Promise.all([fetchSnapshot(), loadRenderer()]);
        if (!active.current) return;
        accept(data);
        const image = (name: string) =>
          name.startsWith('m:')
            ? journeyArtwork(w.project, name.slice(2))
            : w.project.territory === 'Morocco'
              ? `/review/carry-light/assets/${name}.webp`
              : journeyArtwork(w.project, 'fashion');
        const H: Host = {
          persisted: true,
          state: () => state.current,
          current: () => ({
            id: context.current.page,
            role: roleKey(context.current.w.project.role),
          }),
          chapter: () => Number(ui.current.chapter || 0),
          get chapters() {
            return chapters();
          },
          roles: Object.fromEntries(Object.entries(roleNames).map(([r, n]) => [roleKey(r), n])),
          esc,
          icon,
          shot: (a: string, alt: string) =>
            `<img class="image" src="${esc(image(a))}" alt="${esc(alt)}" loading="lazy">`,
          link: workspaceLink,
          go: () => roleKey(w.project.role),
          badge: (t: string, cls: string) => `<span class="badge ${cls}">${esc(t)}</span>`,
          sourceContext: (pole: string) => {
            const sourcePage: Record<string, string> = {
              photo: 'frame',
              film: 'frame',
              stylist: 'styling',
              beauty: 'beauty',
              set: 'moodboard',
              sound: 'tale-sound',
              agency: 'casting',
              production: 'scouting',
              editor: 'post-calendar',
            };
            const source = sourcePage[pole];
            const records = w.records
              .filter(
                (r) =>
                  r.kind === 'horizon:' + source || (pole === 'photo' && r.kind === 'studio:frame')
              )
              .slice(-3);
            return `<details class="da-source-context" open><summary>Connected project sources</summary>${records.map((r) => `<p><strong>${esc(r.title)}</strong><br>${esc(r.status)} · version ${r.version}</p>`).join('') || '<p>No source record attached yet. Prepare the direction in its workspace and reference it below.</p>'}${workspaceLink(source, 'Open source workspace', 'link')}</details>`;
          },
          can: (k: string) => canProposalEdit(roleKey(w.project.role), k, state.current),
          members: (pole: string) =>
            w.members
              .filter((m) => [pole, 'art', 'bee'].includes(roleKey(m.role)))
              .map((m) => ({ value: m.id, label: m.name })),
          memberName: (id: string) => w.members.find((m) => m.id === id)?.name || '',
          summary: () => ({
            documented: w.records.filter(
              (r) =>
                ['evidence', 'horizon:evidence-add'].includes(r.kind) &&
                ['approved', 'expert_validated'].includes(r.status)
            ).length,
            total: w.records.filter((r) => ['evidence', 'horizon:evidence-add'].includes(r.kind))
              .length,
          }),
          download: async (name: string, body: string, type: string) => {
            try {
              // Embed only our own assets and authorised project images for a portable export.
              const documentExport = new DOMParser().parseFromString(connected(body), 'text/html');
              const assets = [...new Set([...documentExport.images].map((img) => img.src))];
              for (const src of assets) {
                const url = new URL(src, location.origin);
                if (url.origin !== location.origin) continue;
                const response = await fetch(url);
                if (!response.ok) throw Error('An export image could not load.');
                const blob = await response.blob();
                const data = await new Promise<string>((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onload = () => resolve(String(reader.result));
                  reader.onerror = () => reject(Error('Image export failed.'));
                  reader.readAsDataURL(blob);
                });
                for (const img of documentExport.images) if (img.src === src) img.src = data;
              }
              download(name, '<!doctype html>' + documentExport.documentElement.outerHTML, type);
              setNotice('Presentation downloaded');
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Export failed.');
            }
          },
        };
        renderer.current = (window as TaleWindow).BeeTaleWorkspace!(H);
        setReady(true);
        drawRef.current();
      } catch (e) {
        if (active.current) setError(e instanceof Error ? e.message : 'Could not load.');
      }
    };
    void start();
    const flush = () => saveRef.current();
    registerFlush(flush);
    const unload = (e: BeforeUnloadEvent) => {
      if (inFlight.current || Object.keys(pending.current).length) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', unload);
    return () => {
      active.current = false;
      clearTimeout(timer.current);
      registerFlush(null);
      window.removeEventListener('beforeunload', unload);
    };
    // The parent remounts this workspace when project or effective role changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    drawRef.current();
  }, [page]);
  const action = async (target: HTMLElement) => {
    const d = target.dataset,
      a = d.daAction;
    if (!a) return;
    if (a === 'mode') {
      if (!(await persist())) return;
      ui.current['da-ui-mode'] = d.mode;
      Object.assign(state.current, ui.current);
      if (d.mode === 'Collaborate') return go('tale-team');
      if (d.mode === 'Export') return go('tale-export');
      if (page === 'tale-team') return go('tale-brief');
      drawRef.current();
      return;
    }
    if (['chapter', 'pole', 'preview-width', 'open-pole'].includes(a)) {
      if (!(await persist())) return;
      if (a === 'chapter') ui.current.chapter = Number(d.index);
      else if (a === 'preview-width') ui.current['da-ui-width'] = d.width;
      else ui.current['da-selected-pole'] = d.pole;
      Object.assign(state.current, ui.current);
      if (a === 'open-pole') go('tale-team');
      else drawRef.current();
      return;
    }
    if (a === 'export' || a === 'export-data') {
      if (!(await persist())) return;
      if (a === 'export') renderer.current?.exportPresentation();
      else
        download(
          'beeyond-community-proposal.json',
          JSON.stringify(
            { project: w.project.title, isDemo: w.project.is_demo, ...snapshot.current },
            null,
            2
          )
        );
      return;
    }
    if (
      await persist({
        action: a,
        pole: d.pole,
        key: d.key,
        asset: d.asset,
        chapter: Number(ui.current.chapter || 0),
      })
    ) {
      if (a === 'add-chapter') {
        ui.current.chapter = chapters().length - 1;
        Object.assign(state.current, ui.current);
        drawRef.current();
      }
    }
  };
  const input = (target: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) => {
    const key = target.dataset.daField;
    if (!key) return;
    const value =
      target instanceof HTMLInputElement && target.type === 'checkbox'
        ? target.checked
        : target.value;
    if (!canProposalEdit(roleKey(w.project.role), key, state.current)) return;
    state.current[key] = value;
    pending.current[key] = value;
    setNotice('Unsaved changes');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => void persist(), 650);
    // Update only the preview while typing, preserving focus, selection and open image pickers.
    if (renderer.current) {
      const html = new DOMParser().parseFromString(renderer.current.render(), 'text/html');
      const preview = host.current?.querySelector('#da-preview-host');
      const replacement = html.querySelector('#da-preview-host');
      if (preview && replacement) preview.innerHTML = replacement.innerHTML;
    }
  };
  const reload = async () => {
    try {
      const data = await fetchSnapshot();
      pending.current = {};
      blocked.current = false;
      accept(data);
      drawRef.current();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not reload.');
    }
  };
  return (
    <section className="community-da" aria-label="Shared creative proposal">
      <label className="da-mobile-navigation">
        Proposal step
        <select
          aria-label="Proposal step"
          value={page}
          onChange={(e) => void navigate(e.target.value)}
        >
          {proposalPages.map((id, i) => (
            <option key={id} value={id}>
              {i < 8 ? `${i + 1}. ` : ''}
              {proposalNames[i]}
            </option>
          ))}
        </select>
      </label>
      <div className="da-sync">
        <span role="status">{notice}</span>
        <span>{w.project.is_demo ? 'TEST PRODUCTION · SHARED DATA' : w.project.title}</span>
        <button disabled={!ready} onClick={() => void persist()}>
          Save now
        </button>
      </div>
      {error && (
        <div className="da-error" role="alert">
          <p>{error}</p>
          <button onClick={() => void persist()}>Retry save</button>
          <button
            onClick={() =>
              download(
                'proposal-unsaved-draft.json',
                JSON.stringify({ state: state.current, pending: pending.current }, null, 2)
              )
            }
          >
            Download my pending edits
          </button>
          <button
            onClick={() => {
              if (
                !Object.keys(pending.current).length ||
                window.confirm('Discard your unsaved changes and reload the shared proposal?')
              )
                void reload();
            }}
          >
            Reload shared version
          </button>
        </div>
      )}
      {!!state.current['da-source-notice'] && (
        <p className="da-source-warning">{String(state.current['da-source-notice'])}</p>
      )}
      <div
        ref={host}
        onClick={(e) => {
          const t = (e.target as HTMLElement).closest<HTMLElement>('[data-da-action],a');
          if (!t) return;
          if (t instanceof HTMLAnchorElement) {
            if (t.getAttribute('href')?.startsWith('#')) {
              e.preventDefault();
              void navigate(t.hash.slice(1));
            }
          } else if (!(t as HTMLButtonElement).disabled) void action(t);
        }}
        onInput={(e) => input(e.target as HTMLInputElement)}
        onChange={(e) => {
          const t = e.target as HTMLInputElement;
          if (t.dataset.daUpload && t.files?.[0])
            void persist(undefined, t.files[0], t.dataset.daUpload);
          else if (t.dataset.daField && (t.type === 'checkbox' || t.tagName === 'SELECT')) input(t);
        }}
      />
    </section>
  );
}
export { proposalPages };
