'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import { availableTransitions, canEdit, kinds, statusLabel } from '@/lib/community/model';
import { disciplines, studioImage } from '@/lib/community/studio';
import type { CommunityRecord, RecordData, Workspace } from '@/lib/community/types';
import { assets } from '@/lib/community/horizon';
import examples from '@/data/community-examples.json';
import { journeyArtwork } from '@/lib/community/artwork';
import { Icon } from './horizon-icons';
import { ReviewNotes } from './review-notes';

export const studioPages = [
  'scouting',
  'location',
  'frame',
  'allocation',
  'styling',
  'fitting',
  'items',
  'item',
  'shoot',
];
type Props = {
  w: Workspace;
  page: string;
  refresh: () => Promise<unknown>;
  go: (page: string) => void;
};
export type Editor = {
  kind: string;
  record?: CommunityRecord;
  initial?: RecordData;
  title?: string;
};
const pad = (n: number) => String(n).padStart(2, '0');
const text = (r: CommunityRecord | undefined, key: string, fallback = 'To confirm') =>
  String(r?.data[key] || fallback);
const recordsOf = (w: Workspace, kind: string) =>
  w.records
    .filter((r) => r.kind === `studio:${kind}`)
    .sort(
      (a, b) =>
        Number(a.data.sort || 0) - Number(b.data.sort || 0) || a.title.localeCompare(b.title)
    );
async function write(w: Workspace, body: object, method = 'POST') {
  const response = await fetch('/api/community/records', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId: w.project.id, ...body }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Could not save. Try again.');
  return data as { id: string };
}
function Photo({ src, alt, eager = false }: { src: string; alt: string; eager?: boolean }) {
  // Local optimized art and authenticated originals; private files cannot use a public image proxy.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" />;
}
function Sheet({
  title,
  children,
  close,
  dirty = false,
}: {
  title: string;
  children: ReactNode;
  close: () => void;
  dirty?: boolean;
}) {
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open && !dirty) close();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="studio-overlay" />
        <Dialog.Content
          className="horizon studio-dialog"
          aria-describedby={undefined}
          onPointerDownOutside={(e) => {
            if (dirty) e.preventDefault();
          }}
        >
          <div className="studio-dialog-heading">
            <Dialog.Title>{title}</Dialog.Title>
            <button onClick={close}>
              {dirty ? 'Discard changes' : 'Close'} <span aria-hidden>×</span>
            </button>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function RecordEditor({
  editor,
  w,
  close,
  refresh,
  image,
}: {
  editor: Editor;
  w: Workspace;
  close: () => void;
  refresh: Props['refresh'];
  image: (r?: CommunityRecord) => string;
}) {
  const live = w.records.find((r) => r.id === editor.record?.id) || editor.record;
  const [data, setData] = useState<RecordData>(live?.data || editor.initial || {});
  const [title, setTitle] = useState(live?.title || editor.title || '');
  const [savedId, setSavedId] = useState(live?.id);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [dirty, setDirty] = useState(false),
    [comment, setComment] = useState('');
  const record = w.records.find((r) => r.id === savedId) || live;
  const spec = kinds[editor.kind];
  const editable = record
    ? canEdit(w.project.role, record, w.user)
    : spec.roles.includes(w.project.role);
  const set = (key: string, value: string) => {
    setData((d) => ({
      ...d,
      [key]: value,
      ...(key === 'sourceId'
        ? { sourceVersion: w.records.find((r) => r.id === value)?.version || '' }
        : {}),
    }));
    setDirty(true);
    setNotice('');
  };
  const run = async (action: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Please retry.');
    } finally {
      setBusy(false);
    }
  };
  const save = async () => {
    const saved = await write(
      w,
      { id: record?.id, version: record?.version, kind: editor.kind, title, data },
      record ? 'PATCH' : 'POST'
    );
    setSavedId(saved.id);
    setDirty(false);
    await refresh();
    setNotice('Saved to this journey');
    return saved.id;
  };
  return (
    <Sheet title={record?.title || `Add ${spec.label.toLowerCase()}`} close={close} dirty={dirty}>
      {record && (
        <div className="studio-record-preview">
          <Photo src={image(record)} alt={record.title} />
          <span>
            {statusLabel(record.status)} · Revision {record.version}
          </span>
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void run(async () => {
            await save();
          });
        }}
      >
        <label>
          Title
          <input
            autoFocus
            value={title}
            required
            maxLength={160}
            readOnly={!editable}
            onChange={(e) => {
              setTitle(e.target.value);
              setDirty(true);
            }}
          />
        </label>
        {spec.fields.map((f) => (
          <label key={f.key}>
            {f.label}
            {f.key === 'sourceVersion' ? (
              <span className="studio-source-revision">
                <span>Selected revision: {String(data.sourceVersion || 'Choose a source')}</span>
                {editable && w.records.some((r) => r.id === data.sourceId) && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      const source = w.records.find((r) => r.id === data.sourceId);
                      if (source) set('sourceVersion', String(source.version));
                    }}
                  >
                    Use latest version · {w.records.find((r) => r.id === data.sourceId)?.version}
                  </button>
                )}
              </span>
            ) : f.key === 'memberId' ? (
              <select
                aria-label={f.label}
                value={String(data[f.key] || '')}
                disabled={!editable || busy}
                onChange={(e) => set(f.key, e.target.value)}
              >
                <option value="">Choose…</option>
                {w.members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            ) : f.type === 'record' || f.type === 'select' ? (
              <select
                aria-label={f.label}
                disabled={!editable || busy}
                value={String(data[f.key] || '')}
                onChange={(e) => set(f.key, e.target.value)}
              >
                <option value="">Choose…</option>
                {f.type === 'record'
                  ? w.records
                      .filter((r) => (f.linkKind || '').split('|').includes(r.kind))
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.title}
                        </option>
                      ))
                  : f.options?.map((o) => <option key={o}>{o}</option>)}
              </select>
            ) : f.key.endsWith('Asset') ? (
              <div className="studio-asset-choices">
                {Object.keys(assets)
                  .filter(
                    (key, i, keys) =>
                      w.project.territory === 'Morocco' ||
                      keys.findIndex(
                        (k) => journeyArtwork(w.project, k) === journeyArtwork(w.project, key)
                      ) === i
                  )
                  .map((key) => (
                    <button
                      type="button"
                      title={key}
                      aria-label={`Use ${key} visual`}
                      aria-pressed={data[f.key] === key}
                      disabled={!editable || busy}
                      key={key}
                      onClick={() => set(f.key, key)}
                    >
                      <Photo
                        src={image({
                          ...record,
                          data: { imageAsset: key },
                          files: [],
                        } as unknown as CommunityRecord)}
                        alt={key}
                      />
                    </button>
                  ))}
              </div>
            ) : f.type === 'textarea' ? (
              <textarea
                aria-label={f.label}
                rows={3}
                maxLength={5000}
                value={String(data[f.key] || '')}
                readOnly={!editable}
                onChange={(e) => set(f.key, e.target.value)}
              />
            ) : (
              <input
                aria-label={f.label}
                type={
                  f.type === 'number'
                    ? 'number'
                    : f.type === 'url'
                      ? 'url'
                      : f.type === 'date'
                        ? 'date'
                        : ['start', 'end'].includes(f.key)
                          ? 'time'
                          : 'text'
                }
                step={f.type === 'number' ? 'any' : undefined}
                maxLength={5000}
                value={String(data[f.key] ?? '')}
                readOnly={!editable}
                onChange={(e) => set(f.key, e.target.value)}
              />
            )}
          </label>
        ))}
        {editable && (
          <button className="main-action" disabled={busy} type="submit">
            {busy ? 'Saving…' : 'Save draft'}
            <Icon name="check" />
          </button>
        )}
      </form>
      {editable && (
        <label className="studio-upload">
          <Icon name="upload" />
          Attach original image or PDF · 3 MB
          <input
            type="file"
            accept=".png,.jpg,.jpeg,.webp,.pdf"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (file)
                void run(async () => {
                  const id = dirty || !record ? await save() : record.id;
                  const form = new FormData();
                  form.set('projectId', w.project.id);
                  form.set('recordId', id);
                  form.set('file', file);
                  const response = await fetch('/api/community/files', {
                    method: 'POST',
                    body: form,
                  });
                  const result = await response.json();
                  if (!response.ok) throw Error(result.error);
                  await refresh();
                  setNotice('Original attached');
                });
            }}
          />
        </label>
      )}
      <div className="studio-files">
        {record?.files?.map((f) => (
          <a key={f.id} href={`/api/community/files?project=${w.project.id}&id=${f.id}`}>
            <Icon name="file" />
            {f.name}
            <Icon name="download" />
          </a>
        ))}
      </div>
      {record &&
        w.project.role === 'bee' &&
        [
          'evidence',
          'result',
          'action',
          'horizon:indicator',
          'horizon:expert-review',
          'horizon:evidence-add',
        ].includes(record.kind) && (
          <label>
            Independent reviewer
            <select
              aria-label="Independent reviewer"
              value={String(record.data.reviewerId || '')}
              disabled={busy}
              onChange={(e) => {
                const reviewer = e.target.value;
                if (reviewer)
                  void run(async () => {
                    await write(
                      w,
                      { id: record.id, version: record.version, assignReviewer: reviewer },
                      'PATCH'
                    );
                    await refresh();
                    setNotice('Expert assigned');
                  });
              }}
            >
              <option value="">Choose an assigned expert…</option>
              {w.members
                .filter((m) => m.role === 'expert')
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
            </select>
          </label>
        )}
      {record && availableTransitions(w.project.role, record, w.user).length > 0 && (
        <div className="studio-review-actions">
          <label>
            Decision note
            <textarea
              value={comment}
              maxLength={2000}
              onChange={(e) => setComment(e.target.value)}
            />
          </label>
          {availableTransitions(w.project.role, record, w.user).map((t) => (
            <button
              key={t.to}
              className={t.to === 'needs_update' ? 'text-link' : 'main-action'}
              disabled={busy || dirty}
              onClick={() =>
                void run(async () => {
                  await write(
                    w,
                    { id: record.id, version: record.version, to: t.to, comment },
                    'PATCH'
                  );
                  await refresh();
                  setNotice('Decision recorded');
                })
              }
            >
              {{
                submitted: 'Submit to Bee',
                brand_review: 'Approve & send to brand',
                approved: 'Approve',
                needs_update: 'Request changes',
              }[t.to] || statusLabel(t.to)}
              <Icon name="arrow" />
            </button>
          ))}
        </div>
      )}
      {record && <ReviewNotes w={w} recordId={record.id} refresh={refresh} />}
      {error && (
        <p role="alert" className="studio-error">
          {error}
        </p>
      )}
      <p role="status">{notice}</p>
    </Sheet>
  );
}

function Coverflow({
  frames,
  selected,
  select,
  image,
  open,
}: {
  frames: CommunityRecord[];
  selected?: string;
  select: (id: string) => void;
  image: (r: CommunityRecord) => string;
  open: (r: CommunityRecord) => void;
}) {
  const [ref, embla] = useEmblaCarousel({
    align: 'center',
    loop: false,
    containScroll: false,
    startIndex: Math.max(
      0,
      frames.findIndex((f) => f.id === selected)
    ),
    duration: 25,
  });
  const selectRef = useRef(select);
  selectRef.current = select;
  useEffect(() => {
    if (!embla) return;
    const change = () => {
      const f = frames[embla.selectedScrollSnap()];
      if (f) selectRef.current(f.id);
    };
    embla.on('select', change);
    return () => {
      embla.off('select', change);
    };
  }, [embla, frames]);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      embla?.reInit({ duration: 0 });
  }, [embla]);
  const index = frames.findIndex((f) => f.id === selected);
  return (
    <section
      className="studio-coverflow"
      aria-label="Visual frames"
      aria-roledescription="carousel"
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
      <div className="studio-cover-viewport" ref={ref}>
        <div className="studio-cover-track">
          {frames.map((f, i) => (
            <div
              className={`studio-cover-slide ${selected === f.id ? 'is-current' : ''}`}
              style={{
                zIndex:
                  frames.length -
                  Math.min(Math.abs(i - index), frames.length - Math.abs(i - index)),
              }}
              key={f.id}
            >
              <button
                className="studio-cover-card"
                aria-label={`${f.title}${selected === f.id ? ', open details' : ''}`}
                aria-current={selected === f.id ? 'true' : undefined}
                onClick={() => (selected === f.id ? open(f) : embla?.scrollTo(i))}
              >
                <Photo src={image(f)} alt={f.title} eager />
                <span>
                  <Icon name="pin" />
                  <span>
                    <small>{text(f, 'shot', f.title)}</small>
                    <strong>Frame {pad(i + 1)}</strong>
                  </span>
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>
      <button
        className="studio-round prev"
        aria-label="Previous frame"
        onClick={() => embla?.scrollTo((index - 1 + frames.length) % frames.length)}
      >
        <Icon name="back" />
      </button>
      <button
        className="studio-round next"
        aria-label="Next frame"
        onClick={() => embla?.scrollTo((index + 1) % frames.length)}
      >
        <Icon name="arrow" />
      </button>
      <div className="studio-dots">
        {frames.map((f, i) => (
          <button
            key={f.id}
            aria-label={`Go to frame ${i + 1}`}
            aria-current={selected === f.id ? 'true' : undefined}
            onClick={() => embla?.scrollTo(i)}
          />
        ))}
      </div>
      <span className="sr-only" aria-live="polite">
        Frame {index + 1} of {frames.length}
      </span>
    </section>
  );
}

export function StudioWorkspace({ w, page, refresh, go }: Props) {
  const [locationId, setLocationId] = useState(''),
    [frameId, setFrameId] = useState(''),
    [lookId, setLookId] = useState('');
  const [editor, setEditor] = useState<Editor | null>(null),
    [lightbox, setLightbox] = useState(false),
    [offset, setOffset] = useState(0),
    [tab, setTab] = useState('frames');
  const [assetPreview, setAssetPreview] = useState<{ src: string; title: string } | null>(null);
  const [savingId, setSavingId] = useState(''),
    [operationError, setOperationError] = useState('');
  const places = recordsOf(w, 'place'),
    allFrames = recordsOf(w, 'frame'),
    looks = recordsOf(w, 'look'),
    products = recordsOf(w, 'product'),
    references = recordsOf(w, 'reference').filter((r) => r.data.active !== 'No');
  const place = places.find((p) => p.id === locationId) || places[0];
  const localFrames = allFrames.filter((f) => f.data.placeId === place?.id);
  const frames = localFrames;
  const frame = frames.find((f) => f.id === frameId) || frames[Math.min(2, frames.length - 1)];
  const look = looks.find((l) => l.id === lookId) || looks[0];
  const example = examples.find((p) => p.id === w.project.id);
  const asset = useCallback((key: string) => journeyArtwork(w.project, key), [w.project]);
  const image = (r?: CommunityRecord) =>
    studioImage(r, w, asset(text(r, 'imageAsset', 'landscape')));
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setLocationId(q.get('place') || '');
    setFrameId(q.get('frame') || '');
    setLookId(q.get('look') || '');
  }, [w.project.id]);
  const select = (type: 'place' | 'frame' | 'look', id: string) => {
    const url = new URL(location.href);
    url.searchParams.set(type, id);
    history.replaceState(null, '', url);
    if (type === 'place') {
      setLocationId(id);
      setFrameId('');
      setOffset(0);
    }
    if (type === 'frame') setFrameId(id);
    if (type === 'look') setLookId(id);
  };
  const open = (record: CommunityRecord) => setEditor({ kind: record.kind, record });
  const add = (kind: string, initial: RecordData = {}) =>
    setEditor({ kind: `studio:${kind}`, initial });
  const permitted = (kind: string) => kinds[`studio:${kind}`].roles.includes(w.project.role);
  const update = async (record: CommunityRecord, changes: RecordData) => {
    if (savingId) return;
    setSavingId(record.id);
    setOperationError('');
    try {
      await write(
        w,
        {
          id: record.id,
          version: record.version,
          title: record.title,
          data: { ...record.data, ...changes },
        },
        'PATCH'
      );
      await refresh();
    } catch (e) {
      setOperationError(e instanceof Error ? e.message : 'Could not save.');
    } finally {
      setSavingId('');
    }
  };
  const quick = (f: CommunityRecord) => (
    <div className="studio-quick-actions">
      {[
        ['pin', 'Location'],
        ['hanger', 'Looks'],
        ['spark', 'Beauty'],
        ['sun', 'Light'],
        ['file', 'Files'],
      ].map(([icon, label]) => (
        <button
          key={label}
          title={label}
          aria-label={`${label} for ${f.title}`}
          onClick={() => {
            select('frame', f.id);
            if (label === 'Location' && place) open(place);
            else if (label === 'Looks') {
              go('styling');
            } else if (label === 'Beauty') {
              add('reference', { frameId: f.id, category: 'beauty' });
            } else open(f);
          }}
        >
          <Icon name={icon} />
        </button>
      ))}
    </div>
  );
  const frameCard = (f: CommunityRecord, i: number, detailed = false) => (
    <article className={`studio-frame-card ${frame?.id === f.id ? 'selected' : ''}`} key={f.id}>
      <button
        className="studio-frame-photo"
        onClick={() => {
          select('frame', f.id);
          if (detailed) open(f);
        }}
      >
        <Photo src={image(f)} alt={f.title} />
        <span>{pad(i + 1)}</span>
      </button>
      {detailed ? (
        <div className="studio-frame-copy">
          <small>FRAME {pad(i + 1)}</small>
          <h3>{f.title}</h3>
          <p>{text(f, 'description', 'Add the shot intention')}</p>
          <dl>
            <div>
              <dt>
                <Icon name="clock" />
                Time
              </dt>
              <dd>{text(f, 'time')}</dd>
            </div>
            <div>
              <dt>
                <Icon name="sun" />
                Light
              </dt>
              <dd>{text(f, 'light')}</dd>
            </div>
            <div>
              <dt>
                <Icon name="pin" />
                Location
              </dt>
              <dd>{place?.title}</dd>
            </div>
          </dl>
          <button className="text-link" onClick={() => open(f)}>
            {statusLabel(f.status)}
            <Icon name="arrow" />
          </button>
        </div>
      ) : (
        quick(f)
      )}
    </article>
  );
  const nav = (
    <nav className="studio-phase-nav" aria-label="Production phases">
      {[
        ['Bee', 'brief-scope'],
        ['Scouting', 'scouting'],
        ['Flower', 'call-sheet'],
        ['Honey', 'report'],
      ].map(([label, id]) => (
        <button
          aria-current={id === 'scouting' ? 'step' : undefined}
          key={id}
          onClick={() => go(id)}
        >
          <span />
          {label}
        </button>
      ))}
    </nav>
  );
  const empty = (kind: string, label: string) => (
    <div className="studio-empty">
      <Icon name="image" />
      <h2>{label}</h2>
      <p>This journey has no {kind}s yet.</p>
      {permitted(kind) && (
        <button
          className="main-action"
          onClick={() => add(kind, kind === 'frame' ? { placeId: place?.id || '' } : {})}
        >
          Add {kind}
          <Icon name="plus" />
        </button>
      )}
    </div>
  );
  const tray = (
    <section className="studio-allocation-tray">
      <header>
        <Icon name="flower" />
        <span>{example?.brand || w.project.title}</span>
        <small>{frame?.title || 'Select a frame'}</small>
      </header>
      <div className="studio-disciplines">
        {disciplines.map(([category, label, icon]) => {
          const linked = references.filter(
            (r) => r.data.frameId === frame?.id && r.data.category === category
          );
          return (
            <section key={category}>
              <h3>
                <Icon name={icon} />
                {label}
              </h3>
              <div>
                {linked.map((r) => (
                  <button key={r.id} aria-label={`Open ${r.title}`} onClick={() => open(r)}>
                    <Photo src={image(r)} alt={r.title} />
                  </button>
                ))}
                {permitted('reference') && frame && (
                  <button
                    className="studio-add-reference"
                    aria-label={`Add ${label} to ${frame.title}`}
                    onClick={() => add('reference', { frameId: frame.id, category })}
                  >
                    <Icon name="plus" />
                  </button>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
  const thumbnailGallery = (
    <div className="studio-thumbnails">{frames.map((f, i) => frameCard(f, i))}</div>
  );
  const locationSide = (
    <aside className="studio-location-list">
      {places.map((p, i) => (
        <button
          className={p.id === place?.id ? 'selected' : ''}
          key={p.id}
          onClick={() => select('place', p.id)}
        >
          <Photo src={image(p)} alt={p.title} />
          <span>
            <small>{pad(i + 1)}</small>
            {p.title}
            <small>{allFrames.filter((f) => f.data.placeId === p.id).length} frames</small>
          </span>
        </button>
      ))}
      {permitted('place') && (
        <button className="studio-add" onClick={() => add('place')}>
          <Icon name="plus" />
          Add location
        </button>
      )}
    </aside>
  );
  const metadata = (
    <dl className="studio-metadata">
      {[
        [
          'pin',
          'GPS',
          place?.data.latitude !== undefined && place?.data.longitude !== undefined
            ? `${place.data.latitude}, ${place.data.longitude}`
            : 'To confirm',
        ],
        ['car', 'Access', text(place, 'access')],
        ['shield', 'Permit', text(place, 'permit', 'Pending')],
        ['sun', 'Light', text(place, 'light')],
      ].map(([icon, label, value]) => (
        <div key={label}>
          <dt>
            <Icon name={icon} />
            {label}
          </dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
  return (
    <div className={`studio studio-${page}`}>
      {['allocation', 'frame', 'shoot'].includes(page) ? (
        <>
          <header className="studio-hero-heading">
            <p>
              {example?.brand || w.project.title} / {w.project.territory}
            </p>
            <h1>{page === 'shoot' ? 'On set' : 'Visual direction'}</h1>
            {nav}
          </header>
          {frames.length ? (
            <>
              <Coverflow
                frames={frames}
                selected={frame?.id}
                select={(id) => select('frame', id)}
                image={image}
                open={open}
              />
              {tray}
              <div className="studio-bottom-actions">
                <span>
                  <Icon name="layers" />
                  {frame?.title} selected
                </span>
                {frame && (
                  <button className="main-action" onClick={() => open(frame)}>
                    {page === 'shoot' ? 'Record capture' : 'Review frame'}
                    <Icon name="arrow" />
                  </button>
                )}
              </div>
            </>
          ) : (
            empty('frame', 'Create your first visual frame')
          )}
        </>
      ) : page === 'location' ? (
        <div className="studio-immersive">
          <aside className="studio-scenic-rail">
            <Photo src={image(place)} alt={place?.title || w.project.territory} />
            <div>
              <h2>{w.project.territory}</h2>
              {nav}
            </div>
          </aside>
          <div className="studio-location-main">
            <header>
              <div>
                <small>SCOUTING</small>
                <h1>{place?.title || 'Locations'}</h1>
                <p>
                  <Icon name="pin" />
                  {text(place, 'latitude', 'Pin to confirm')}
                  {place?.data.longitude !== undefined ? `, ${place.data.longitude}` : ''}
                </p>
                <p>{text(place, 'description', 'Capture the sense of place.')}</p>
              </div>
              {permitted('frame') && place && (
                <button className="studio-add" onClick={() => add('frame', { placeId: place.id })}>
                  <Icon name="plus" />
                  Add frame
                </button>
              )}
            </header>
            {frame ? (
              <button
                className="studio-panorama"
                aria-label={`Enlarge ${frame.title}`}
                onClick={() => setLightbox(true)}
              >
                <Photo src={image(frame)} alt={frame.title} eager />
                <span>
                  {frame.title}
                  <Icon name="image" />
                </span>
              </button>
            ) : (
              empty('frame', 'Explore this location')
            )}
            <Tabs.Root defaultValue="frames">
              <Tabs.List className="studio-tabs" aria-label="Location content">
                <Tabs.Trigger value="frames">Frames ({frames.length})</Tabs.Trigger>
                <Tabs.Trigger value="notes">Notes</Tabs.Trigger>
                <Tabs.Trigger value="files">Files</Tabs.Trigger>
              </Tabs.List>
              <Tabs.Content value="frames">{thumbnailGallery}</Tabs.Content>
              <Tabs.Content value="notes">
                <div className="studio-notes">
                  <p>{text(place, 'notes', 'No notes recorded for this location.')}</p>
                  {place && (
                    <button className="text-link" onClick={() => open(place)}>
                      Open location notes
                      <Icon name="arrow" />
                    </button>
                  )}
                </div>
              </Tabs.Content>
              <Tabs.Content value="files">
                <div className="studio-files">
                  {place?.files?.map((f) => (
                    <a key={f.id} href={`/api/community/files?project=${w.project.id}&id=${f.id}`}>
                      <Icon name="file" />
                      {f.name}
                      <Icon name="download" />
                    </a>
                  ))}
                  {place && (
                    <button onClick={() => open(place)}>
                      <Icon name="upload" />
                      Manage location files
                    </button>
                  )}
                </div>
              </Tabs.Content>
            </Tabs.Root>
          </div>
        </div>
      ) : page === 'scouting' ? (
        <>
          <header className="studio-workbench-heading">
            <div>
              <small>
                {example?.brand || w.project.title} / {w.project.territory}
              </small>
              <h1>Scouting</h1>
              <p>Capture, share and validate locations and frames on the ground.</p>
            </div>
            <div>
              <button onClick={() => go('team')}>
                <Icon name="users" />
                Manage team
              </button>
              <button onClick={() => go('itinerary')}>
                <Icon name="compass" />
                Itinerary
              </button>
            </div>
          </header>
          <div className="studio-scout-grid">
            <nav className="studio-steps" aria-label="Scouting steps">
              {[
                ['Brands & needs', 'brief-review'],
                ['Locations', 'scouting'],
                ['Itinerary', 'itinerary'],
                ['Resources', 'equipment'],
                ['Review', 'creative-lock'],
              ].map(([label, id], i) => (
                <button
                  key={id}
                  className={id === 'scouting' ? 'selected' : ''}
                  onClick={() => go(id)}
                >
                  <small>{pad(i + 1)}</small>
                  {label}
                </button>
              ))}
            </nav>
            {locationSide}
            <section className="studio-glass studio-frame-workbench">
              <header>
                <div>
                  <h2>{place?.title || 'Your locations'}</h2>
                  <p>{text(place, 'description', 'Add a location to begin.')}</p>
                </div>
                {place && (
                  <button onClick={() => open(place)}>
                    Edit location
                    <Icon name="feather" />
                  </button>
                )}
              </header>
              <Tabs.Root value={tab} onValueChange={setTab}>
                <Tabs.List className="studio-tabs" aria-label="Scouting details">
                  <Tabs.Trigger value="frames">Visual frames ({localFrames.length})</Tabs.Trigger>
                  <Tabs.Trigger value="info">Location info</Tabs.Trigger>
                  <Tabs.Trigger value="logistics">Logistics</Tabs.Trigger>
                  <Tabs.Trigger value="notes">Team notes</Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value="frames">
                  <div className="studio-detailed-frames">
                    {localFrames
                      .slice(offset, offset + 3)
                      .map((f, i) => frameCard(f, offset + i, true))}
                  </div>
                  {localFrames.length > 3 && (
                    <div className="studio-frame-paging">
                      <button
                        disabled={offset === 0}
                        onClick={() => setOffset(Math.max(0, offset - 3))}
                      >
                        <Icon name="back" />
                        Previous
                      </button>
                      <span>
                        {offset + 1}–{Math.min(offset + 3, localFrames.length)} /{' '}
                        {localFrames.length}
                      </span>
                      <button
                        disabled={offset + 3 >= localFrames.length}
                        onClick={() => setOffset(offset + 3)}
                      >
                        Next
                        <Icon name="arrow" />
                      </button>
                    </div>
                  )}
                  {permitted('frame') && place && (
                    <button
                      className="studio-add wide"
                      onClick={() => add('frame', { placeId: place.id })}
                    >
                      <Icon name="plus" />
                      <span>
                        Add a visual frame<small>Photos, shot intention, light & notes</small>
                      </span>
                    </button>
                  )}
                </Tabs.Content>
                <Tabs.Content value="info">
                  {metadata}
                  {place && (
                    <button
                      className="text-link"
                      onClick={() => {
                        select('place', place.id);
                        go('location');
                      }}
                    >
                      Open immersive view
                      <Icon name="arrow" />
                    </button>
                  )}
                </Tabs.Content>
                <Tabs.Content value="logistics">
                  <p className="studio-notes">
                    {text(place, 'logistics', 'Logistics are not documented yet.')}
                  </p>
                  {place && (
                    <button onClick={() => open(place)}>
                      Edit logistics
                      <Icon name="arrow" />
                    </button>
                  )}
                </Tabs.Content>
                <Tabs.Content value="notes">
                  <p className="studio-notes">{text(place, 'notes', 'No team notes yet.')}</p>
                  {place && (
                    <button onClick={() => open(place)}>
                      Edit team notes
                      <Icon name="arrow" />
                    </button>
                  )}
                </Tabs.Content>
              </Tabs.Root>
            </section>
            <aside className="studio-review-column">
              <section className="studio-glass">
                <h3>Location overview</h3>
                <button
                  className="studio-map-preview"
                  onClick={() => {
                    if (place) {
                      select('place', place.id);
                      go('location');
                    }
                  }}
                >
                  <Photo src={image(place)} alt={place?.title || 'Location'} />
                  <span>
                    <Icon name="pin" />
                    Explore location
                  </span>
                </button>
                {metadata}
              </section>
              <section className="studio-glass">
                <h3>Bee review</h3>
                {[
                  [
                    'Frames',
                    localFrames.length > 0 &&
                      localFrames.every((f) => ['brand_review', 'approved'].includes(f.status)),
                  ],
                  ['Location', place?.status === 'approved'],
                ].map(([label, done]) => (
                  <p className="studio-review-line" key={String(label)}>
                    <Icon name={done ? 'check' : 'circle'} />
                    {label}
                    <span>{done ? 'Reviewed' : 'Not completed'}</span>
                  </p>
                ))}
                <button
                  className="main-action"
                  onClick={() => (frame ? open(frame) : place ? open(place) : add('place'))}
                >
                  Review
                  <Icon name="arrow" />
                </button>
              </section>
              <section className="studio-glass">
                <h3>Brand review</h3>
                <p>{example?.brand || w.project.title}</p>
                <p>
                  {localFrames.some((f) => f.status === 'brand_review')
                    ? 'Frames await brand review'
                    : 'Waiting for Bee'}
                </p>
                <button className="text-link" onClick={() => go('creative-lock')}>
                  Creative sign-off
                  <Icon name="arrow" />
                </button>
              </section>
            </aside>
          </div>
          <div className="studio-process">
            {['Scout', 'Select', 'Align', 'Validate', 'Shoot'].map((label, i) => (
              <button
                key={label}
                onClick={() =>
                  go(['scouting', 'location', 'allocation', 'creative-lock', 'shoot'][i])
                }
              >
                <span>{pad(i + 1)}</span>
                {label}
              </button>
            ))}
          </div>
        </>
      ) : ['styling', 'fitting'].includes(page) ? (
        <>
          <header className="studio-workbench-heading">
            <div>
              <small>
                {example?.brand || w.project.title} / {w.project.territory}
              </small>
              <h1>{page === 'fitting' ? 'Fitting & continuity' : 'Styling'}</h1>
              <p>Connect every look to its frame.</p>
            </div>
            <button onClick={() => go('items')}>
              <Icon name="bag" />
              Collection
            </button>
          </header>
          <div className="studio-styling-grid">
            <aside className="studio-glass studio-styling-location">
              <h3>Locations & frames</h3>
              {place ? (
                <>
                  <button className="studio-style-place" onClick={() => go('location')}>
                    <Photo src={image(place)} alt={place.title} />
                    <span>{place.title}</span>
                  </button>
                  <div className="studio-mini-places">
                    {places.map((p) => (
                      <button
                        key={p.id}
                        aria-label={`Choose ${p.title}`}
                        aria-pressed={p.id === place.id}
                        onClick={() => select('place', p.id)}
                      >
                        <Photo src={image(p)} alt={p.title} />
                      </button>
                    ))}
                  </div>
                  {localFrames.map((f, i) => (
                    <button
                      className="studio-frame-row"
                      key={f.id}
                      aria-pressed={frame?.id === f.id}
                      onClick={() => select('frame', f.id)}
                    >
                      <span>{pad(i + 1)}</span>
                      {f.title}
                      <Icon name="arrow" />
                    </button>
                  ))}
                </>
              ) : (
                empty('place', 'Add a location')
              )}
            </aside>
            <section className="studio-style-assignments">
              <header>
                <h2>Frame to look</h2>
                {permitted('look') && (
                  <button onClick={() => add('look')}>
                    <Icon name="plus" />
                    New look
                  </button>
                )}
              </header>
              {localFrames.map((f, i) => (
                <article className="studio-glass studio-style-frame" key={f.id}>
                  <button
                    className="studio-style-shot"
                    onClick={() => {
                      select('frame', f.id);
                      open(f);
                    }}
                  >
                    <Photo src={image(f)} alt={f.title} />
                    <span>
                      Frame {pad(i + 1)} · {f.title}
                    </span>
                  </button>
                  <div className="studio-look-links">
                    {references
                      .filter((r) => r.data.frameId === f.id && r.data.category === 'look')
                      .map((r) => {
                        const item = looks.find((l) => l.id === r.data.lookId);
                        return (
                          <button
                            key={r.id}
                            onClick={() => (item ? select('look', item.id) : open(r))}
                          >
                            <Photo src={image(item || r)} alt={item?.title || r.title} />
                            <span>{item?.title || r.title}</span>
                          </button>
                        );
                      })}
                    {permitted('reference') && (
                      <button
                        className="studio-add"
                        aria-label={`Assign look to ${f.title}`}
                        onClick={() => add('reference', { frameId: f.id, category: 'look' })}
                      >
                        <Icon name="plus" />
                        Assign look
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </section>
            <aside className="studio-glass studio-look-detail">
              {look ? (
                <>
                  <header>
                    <h2>{look.title}</h2>
                    <button onClick={() => open(look)}>
                      {statusLabel(look.status)}
                      <Icon name="feather" />
                    </button>
                  </header>
                  <div className="studio-look-select">
                    {looks.map((l) => (
                      <button
                        aria-pressed={l.id === look.id}
                        key={l.id}
                        onClick={() => select('look', l.id)}
                      >
                        {l.title}
                      </button>
                    ))}
                  </div>
                  <div className="studio-look-views">
                    {[
                      ['Front', 'frontAsset'],
                      ['Side', 'sideAsset'],
                      ['Back', 'backAsset'],
                      ['Detail', 'detailAsset'],
                    ].map(([label, key], i) => {
                      const file = look.files?.filter((f) => f.mime.startsWith('image/'))[i];
                      const src = file
                        ? `/api/community/files?project=${w.project.id}&id=${file.id}&inline=1`
                        : look.data[key] &&
                            (w.project.territory === 'Morocco' || key === 'frontAsset')
                          ? asset(String(look.data[key]))
                          : null;
                      return (
                        <button
                          key={key}
                          onClick={() =>
                            src
                              ? setAssetPreview({ src, title: `${look.title} / ${label}` })
                              : open(look)
                          }
                          aria-label={`${label} view of ${look.title}`}
                        >
                          {src ? (
                            <Photo src={src} alt={`${look.title} / ${label}`} />
                          ) : (
                            <span className="studio-view-empty">
                              <Icon name="plus" />
                            </span>
                          )}
                          <span>{label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p>{text(look, 'description', 'Document the look intention.')}</p>
                  <h3 className="studio-fit-title">Fitting status</h3>
                  <div className="studio-fit-checks">
                    {[
                      ['fitCheck', 'Fit', 'hanger', 'Pending', 'Checked'],
                      ['movementCheck', 'Movement', 'user', 'Pending', 'Checked'],
                      ['alterations', 'Alterations', 'ruler', 'Pending', 'Done'],
                      ['packed', 'Packed', 'bag', 'No', 'Yes'],
                    ].map(([key, label, icon, off, on]) => (
                      <button
                        key={key}
                        disabled={!!savingId || !canEdit(w.project.role, look, w.user)}
                        aria-pressed={look.data[key] === on}
                        onClick={() =>
                          void update(look, { [key]: look.data[key] === on ? off : on })
                        }
                      >
                        <Icon name={icon} />
                        <span>{label}</span>
                        <small>{text(look, key, off)}</small>
                      </button>
                    ))}
                  </div>
                  <div className="studio-assigned-heading">
                    <h3>Assigned frames</h3>
                    {permitted('reference') && (
                      <button
                        onClick={() => add('reference', { lookId: look.id, category: 'look' })}
                      >
                        <Icon name="plus" />
                        Add to frame
                      </button>
                    )}
                  </div>
                  <div className="studio-assigned-list">
                    {references
                      .filter((r) => r.data.lookId === look.id)
                      .map((r) => {
                        const f = allFrames.find((f) => f.id === r.data.frameId);
                        return (
                          <div key={r.id}>
                            <button
                              onClick={() => {
                                if (f) {
                                  select('place', String(f.data.placeId));
                                  select('frame', f.id);
                                  go('allocation');
                                }
                              }}
                            >
                              {f && <Photo src={image(f)} alt={f.title} />}
                              <span>{f?.title || r.title}</span>
                            </button>
                            <button
                              disabled={!!savingId || !canEdit(w.project.role, r, w.user)}
                              onClick={() => void update(r, { active: 'No' })}
                              aria-label={`Remove ${look.title} from ${f?.title || r.title}`}
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                  </div>
                  <h3>Products in this look</h3>
                  <div className="studio-product-strip">
                    {products
                      .filter((p) => p.data.lookId === look.id)
                      .map((p) => (
                        <button key={p.id} aria-label={`Open ${p.title}`} onClick={() => open(p)}>
                          <Photo src={image(p)} alt={p.title} />
                          <span>{p.title}</span>
                        </button>
                      ))}
                    {permitted('product') && (
                      <button
                        className="studio-add"
                        onClick={() => add('product', { lookId: look.id })}
                      >
                        <Icon name="plus" />
                        Add item
                      </button>
                    )}
                  </div>
                  <button className="main-action" onClick={() => open(look)}>
                    Review look
                    <Icon name="arrow" />
                  </button>
                </>
              ) : (
                empty('look', 'Build the first look')
              )}
            </aside>
          </div>
        </>
      ) : (
        <>
          <header className="studio-workbench-heading">
            <div>
              <small>{example?.brand || w.project.title}</small>
              <h1>Collection</h1>
              <p>Products, materials and the looks they belong to.</p>
            </div>
            {permitted('product') && (
              <button className="studio-add" onClick={() => add('product')}>
                <Icon name="plus" />
                Add item
              </button>
            )}
          </header>
          <div className="studio-products">
            {products.map((p) => (
              <button className="studio-glass" key={p.id} onClick={() => open(p)}>
                <Photo src={image(p)} alt={p.title} />
                <h2>{p.title}</h2>
                <p>
                  {text(p, 'material', 'Material to document')} /{' '}
                  {text(p, 'colour', 'Colour to document')}
                </p>
                <span>
                  {text(p, 'received', 'Expected')}
                  <Icon name="arrow" />
                </span>
              </button>
            ))}
          </div>
          {!products.length && empty('product', 'Your collection')}
        </>
      )}
      {operationError && (
        <p role="alert" className="studio-error">
          {operationError}
        </p>
      )}
      {assetPreview && (
        <Sheet title={assetPreview.title} close={() => setAssetPreview(null)}>
          <div className="studio-lightbox">
            <Photo src={assetPreview.src} alt={assetPreview.title} eager />
          </div>
        </Sheet>
      )}
      {editor && (
        <RecordEditor
          key={editor.record?.id || `${editor.kind}-${editor.initial?.frameId || ''}`}
          editor={editor}
          w={w}
          close={() => setEditor(null)}
          refresh={refresh}
          image={image}
        />
      )}
      {lightbox && frame && (
        <Sheet title={frame.title} close={() => setLightbox(false)}>
          <div className="studio-lightbox">
            <Photo src={image(frame)} alt={frame.title} eager />
          </div>
          <div className="studio-frame-paging">
            <button
              onClick={() =>
                select(
                  'frame',
                  frames[(frames.indexOf(frame) - 1 + frames.length) % frames.length].id
                )
              }
            >
              <Icon name="back" />
              Previous
            </button>
            <button
              onClick={() =>
                select('frame', frames[(frames.indexOf(frame) + 1) % frames.length].id)
              }
            >
              Next
              <Icon name="arrow" />
            </button>
          </div>
        </Sheet>
      )}
    </div>
  );
}
