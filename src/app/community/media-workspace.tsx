'use client';

import { useState } from 'react';

import useEmblaCarousel from 'embla-carousel-react';

import * as Tabs from '@radix-ui/react-tabs';

import * as Dialog from '@radix-ui/react-dialog';

import { pages } from '@/lib/community/horizon';

import { kinds, statusLabel } from '@/lib/community/model';

import { studioImage } from '@/lib/community/studio';

import type { CommunityRecord, Workspace } from '@/lib/community/types';

import { RecordEditor, type Editor } from './studio-workspace';

import { ReviewNotes } from './review-notes';

import { journeyArtwork } from '@/lib/community/artwork';

import { Icon } from './horizon-icons';

export const mediaPages = [
  'handoff',

  'raws',

  'selects',

  'version',

  'bee-review',

  'brand-review',

  'delivery',

  'archive',

  'previews',

  'backstage',

  'proposal',

  'moodboard',

  'casting',

  'beauty',
];

const postSteps = [
  ['raws', 'Source files', 'folder'],

  ['selects', 'Selection', 'image'],

  ['handoff', 'Studio brief', 'feather'],

  ['version', 'Versions', 'layers'],

  ['bee-review', 'Bee review', 'shield'],

  ['brand-review', 'Brand review', 'check'],

  ['delivery', 'Delivery', 'download'],
];

function Photo({ src, alt }: { src: string; alt: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" decoding="async" />;
}

export function MediaWorkspace({
  w,

  page,

  go,

  refresh,
}: {
  w: Workspace;

  page: string;

  go: (page: string) => void;

  refresh: () => Promise<unknown>;
}) {
  const [editor, setEditor] = useState<Editor | null>(null),
    [selected, setSelected] = useState(''),
    [query, setQuery] = useState(''),
    [filter, setFilter] = useState('all'),
    [preview, setPreview] = useState<{ src: string; title: string } | null>(null);

  const [carousel, embla] = useEmblaCarousel({ align: 'start', containScroll: 'trimSnaps' });

  const spec = pages.find((p) => p.id === page)!;

  const records = w.records.filter((r) => r.kind === `horizon:${page}`);

  const active = records.find((r) => r.id === selected) || records.at(-1);

  const allMedia = w.records.filter((r) =>
    ['horizon:raws', 'horizon:selects', 'horizon:version', 'horizon:delivery', 'asset'].includes(
      r.kind
    )
  );

  const shown = (
    ['proposal', 'moodboard', 'casting', 'beauty', 'previews', 'backstage'].includes(page)
      ? records
      : allMedia
  ).filter(
    (r) =>
      (filter === 'all' || r.status === filter) &&
      `${r.title} ${r.status}`.toLowerCase().includes(query.toLowerCase())
  );

  const selection = w.records.filter((r) => r.kind === 'horizon:selects');

  const version = w.records.filter((r) => r.kind === 'horizon:version').at(-1);

  const image = (r?: CommunityRecord) =>
    studioImage(r, w, journeyArtwork(w.project, String(r?.data.imageAsset || 'landscape')));

  const add = (id = page) =>
    setEditor({
      kind: `horizon:${id}`,

      initial:
        ['bee-review', 'brand-review', 'delivery'].includes(id) && version
          ? { sourceId: version.id, sourceVersion: version.version }
          : {},
    });

  const open = (r: CommunityRecord) => {
    setSelected(r.id);

    setEditor({ kind: r.kind, record: r });
  };

  const editable = kinds[`horizon:${page}`]?.roles.includes(w.project.role);

  const isCreative = [
    'proposal',

    'moodboard',

    'casting',

    'beauty',

    'previews',

    'backstage',
  ].includes(page);

  const refs = w.records.filter((r) => r.kind === 'studio:frame').slice(0, 5);

  const actualPhotos = allMedia.flatMap((r) =>
    (r.files || [])

      .filter((f) => f.mime.startsWith('image/'))

      .map((f) => ({
        id: f.id,

        title: f.name,

        record: r,

        src: `/api/community/files?project=${w.project.id}&id=${f.id}&inline=1`,
      }))
  );

  const exportManifest = () => {
    const output = {
      project: w.project.title,

      exportedAt: new Date().toISOString(),

      demo: w.project.is_demo,

      records: allMedia.map((r) => ({
        title: r.title,

        status: r.status,

        revision: r.version,

        rights: r.data.rights || '',

        reference: r.data.reference || '',

        files: r.files || [],
      })),
    };

    const url = URL.createObjectURL(
      new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' })
    );

    const a = document.createElement('a');

    a.href = url;

    a.download = 'beeyond-media-manifest.json';

    a.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <section className={`media-workspace ${isCreative ? 'media-creative' : ''}`}>
      <aside className="workflow-rail">
        <span className="eyebrow">{w.project.territory}</span>

        <h2>{isCreative ? 'CREATIVE STUDIO' : 'PRODUCTION'}</h2>

        <p>{w.project.title}</p>

        {(isCreative
          ? [
              ['proposal', 'Creative proposal', 'feather'],

              ['moodboard', 'Moodboard', 'palette'],

              ['casting', 'Casting', 'users'],

              ['beauty', 'Beauty', 'spark'],

              ['scouting', 'Scouting', 'pin'],

              ['allocation', 'Frame allocation', 'camera'],
            ]
          : postSteps
        )

          .filter(
            ([id]) =>
              pages.find((p) => p.id === id)?.roles[
                (
                  { art_director: 'art', photographer: 'photo', filmmaker: 'film' } as Record<
                    string,
                    string
                  >
                )[w.project.role] || w.project.role
              ] || w.project.role === 'bee'
          )

          .map(([id, title, icon], i) => (
            <button key={id} aria-current={page === id ? 'step' : undefined} onClick={() => go(id)}>
              <span>{String(i + 1).padStart(2, '0')}</span>

              <Icon name={icon} />

              <span>{title}</span>
            </button>
          ))}

        <Photo src={image()} alt={w.project.territory} />

        <small>{w.project.is_demo ? 'Illustrative production replay' : w.project.season}</small>
      </aside>

      <div className="media-main">
        <header className="source-heading">
          <div>
            <span className="eyebrow">
              {w.project.title} / {isCreative ? 'Creative direction' : 'Post-production'}
            </span>

            <h1>{page === 'handoff' ? 'POST-PRODUCTION HANDOFF' : spec.title}</h1>

            <p>
              {page === 'handoff'
                ? 'Selection, brief and studio handoff.'
                : isCreative
                  ? 'Shape the direction, collect references and review together.'
                  : 'Organize the source files, review versions and prepare delivery.'}
            </p>
          </div>

          {editable && (
            <button className="main-action" onClick={() => (active ? open(active) : add())}>
              <Icon name={page === 'handoff' ? 'feather' : 'plus'} />

              {page === 'handoff' ? 'Prepare handoff' : active ? 'Open workspace' : 'Create record'}
            </button>
          )}
        </header>

        {!isCreative && (
          <nav className="media-progress" aria-label="Post-production steps">
            {[
              ['selects', 'Selection'],

              ['handoff', 'Studio brief'],

              ['delivery', 'Delivery'],
            ].map(([id, title], i) => {
              const rs = w.records.filter((r) => r.kind === `horizon:${id}`);

              return (
                <button
                  key={id}

                  onClick={() => go(id)}

                  aria-current={page === id ? 'step' : undefined}
                >
                  <span className="progress-circle">{i + 1}</span>

                  <span>
                    <b>{title}</b>

                    <small>
                      {rs.some((r) => r.status === 'approved')
                        ? 'Approved'
                        : rs.length
                          ? 'Pending review'
                          : 'Not started'}
                    </small>
                  </span>

                  <Icon name="arrow" />
                </button>
              );
            })}
          </nav>
        )}

        <div className="media-grid">
          <div className="media-content">
            {isCreative ? (
              <section className="creative-gallery">
                <div className="source-panel-head">
                  <h2>{page === 'casting' ? 'TALENT SHORTLIST' : 'VISUAL REFERENCES'}</h2>
                  <div>
                    <button aria-label="Previous reference" onClick={() => embla?.scrollPrev()}>
                      <Icon name="left" />
                    </button>
                    <button aria-label="Next reference" onClick={() => embla?.scrollNext()}>
                      <Icon name="right" />
                    </button>
                  </div>
                </div>

                <div className="creative-viewport" ref={carousel}>
                  <div className="creative-track">
                    {records.map((r, i) => {
                      const key = String(
                        r.data.imageAsset ||
                          (page === 'casting'
                            ? i % 2
                              ? 'talent'
                              : 'beauty'
                            : page === 'beauty'
                              ? 'beauty'
                              : i % 2
                                ? 'craft'
                                : 'frame-fashion-wide')
                      );
                      const src = studioImage(r, w, journeyArtwork(w.project, key));
                      return (
                        <article className="creative-portrait" key={r.id}>
                          <button className="creative-cover" onClick={() => open(r)}>
                            <Photo src={src} alt={r.title} />
                            <span>
                              <small>
                                {page === 'casting'
                                  ? String(r.data.availability || 'Availability to confirm')
                                  : statusLabel(r.status)}
                              </small>
                              <h3>{r.title}</h3>
                            </span>
                          </button>

                          <div className="creative-card-actions">
                            <button aria-label={'Open ' + r.title} onClick={() => open(r)}>
                              <Icon name="file" />
                            </button>
                            <button
                              aria-label={'Enlarge ' + r.title}
                              onClick={() => setPreview({ src, title: r.title })}
                            >
                              <Icon name="image" />
                            </button>
                            {typeof r.data.portfolio === 'string' &&
                              r.data.portfolio.startsWith('https://') && (
                                <a
                                  href={r.data.portfolio}
                                  target="_blank"
                                  rel="noreferrer"
                                  aria-label="Open portfolio"
                                >
                                  <Icon name="globe" />
                                </a>
                              )}
                            <button className="creative-status" onClick={() => open(r)}>
                              {page === 'casting'
                                ? String(r.data.shortlisted || 'Proposed')
                                : statusLabel(r.status)}
                              <Icon name="arrow" />
                            </button>
                          </div>

                          <small className="source-muted">
                            {r.files?.some((f) => f.mime.startsWith('image/'))
                              ? 'Production reference'
                              : 'AI visual concept · identity to confirm'}
                          </small>
                        </article>
                      );
                    })}

                    {editable && (
                      <button className="creative-add" onClick={() => add()}>
                        <Icon name="plus" />
                        <span>{page === 'casting' ? 'Add a talent' : 'Add a reference'}</span>
                      </button>
                    )}

                    {!records.length && !editable && <p>No references shared yet.</p>}
                  </div>
                </div>
              </section>
            ) : (
              <section className="source-panel">
                <div className="source-panel-head">
                  <h2>Selection & references</h2>

                  <div>
                    <button aria-label="Previous media" onClick={() => embla?.scrollPrev()}>
                      <Icon name="left" />
                    </button>

                    <button aria-label="Next media" onClick={() => embla?.scrollNext()}>
                      <Icon name="right" />
                    </button>
                  </div>
                </div>

                <p>
                  {selection.length
                    ? `${selection.filter((r) => r.status === 'approved').length} of ${selection.length} selections approved`
                    : 'Selection pending review'}
                </p>

                <div className="media-viewport" ref={carousel}>
                  <div className="media-track">
                    {actualPhotos.length
                      ? actualPhotos.map((f) => (
                          <button className="media-tile" key={f.id} onClick={() => setPreview(f)}>
                            <Photo src={f.src} alt={f.title} />

                            <Icon name="image" />

                            <span>
                              {f.title}

                              <small>{statusLabel(f.record.status)}</small>
                            </span>
                          </button>
                        ))
                      : refs.map((r, i) => (
                          <button
                            className="media-tile"

                            key={r.id}

                            onClick={() => setPreview({ src: image(r), title: r.title })}
                          >
                            <Photo src={image(r)} alt={r.title} />

                            <span>
                              Reference {String(i + 1).padStart(2, '0')}
                              <small>
                                {w.project.territory === 'Morocco'
                                  ? 'AI concept · not a deliverable'
                                  : 'Campaign reference · not a delivery'}
                              </small>
                            </span>
                          </button>
                        ))}
                  </div>
                </div>

                {!actualPhotos.length && (
                  <small className="source-muted">
                    Attach originals or a shared HTTPS folder in the workspace.
                  </small>
                )}
              </section>
            )}

            {page === 'handoff' ? (
              <section className="source-panel">
                <div className="source-panel-head">
                  <h2>Brief for post-production</h2>

                  {editable && (
                    <button onClick={() => (active ? open(active) : add())} className="text-link">
                      Edit brief <Icon name="feather" />
                    </button>
                  )}
                </div>

                <div className="handoff-fields">
                  {spec.fields.map((f) => (
                    <button
                      key={f.id}

                      onClick={() => (active ? open(active) : editable && add())}

                      disabled={!active && !editable}
                    >
                      <Icon name={f.icon} />

                      <span>{f.label}</span>

                      <p>{String(active?.data[f.id] || 'To define')}</p>
                    </button>
                  ))}
                </div>
              </section>
            ) : (
              <section className="source-panel">
                <Tabs.Root defaultValue="records">
                  <div className="source-panel-head">
                    <Tabs.List className="source-tabs">
                      <Tabs.Trigger value="records">
                        {isCreative ? 'Boards' : 'Files & versions'}
                      </Tabs.Trigger>

                      <Tabs.Trigger value="originals">Original files</Tabs.Trigger>

                      <Tabs.Trigger value="provenance">Source & usage</Tabs.Trigger>
                    </Tabs.List>

                    {editable && (
                      <button className="text-link" onClick={() => add()}>
                        <Icon name="plus" />
                        Add {isCreative ? 'board' : 'record'}
                      </button>
                    )}
                  </div>

                  <Tabs.Content value="records">
                    <div className="source-filters">
                      <input
                        aria-label="Search media"

                        placeholder="Search media…"

                        value={query}

                        onChange={(e) => setQuery(e.target.value)}
                      />

                      <select
                        aria-label="Media status"

                        value={filter}

                        onChange={(e) => setFilter(e.target.value)}
                      >
                        <option value="all">All statuses</option>

                        {[...new Set(allMedia.map((r) => r.status))].map((s) => (
                          <option key={s} value={s}>
                            {statusLabel(s)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="media-record-list">
                      {shown.map((r) => (
                        <button key={r.id} onClick={() => open(r)}>
                          <Photo src={image(r)} alt={r.title} />

                          <span>
                            <b>{r.title}</b>

                            <small>
                              {kinds[r.kind]?.label} · Revision {r.version}
                            </small>
                          </span>

                          <span>{statusLabel(r.status)}</span>

                          <Icon name="arrow" />
                        </button>
                      ))}

                      {!shown.length && (
                        <p>No records yet. Create the first version for this journey.</p>
                      )}
                    </div>
                  </Tabs.Content>

                  <Tabs.Content value="originals">
                    <div className="media-file-list">
                      {(isCreative ? records : allMedia).flatMap((r) =>
                        (r.files || []).map((f) => (
                          <a
                            key={f.id}

                            href={`/api/community/files?project=${w.project.id}&id=${f.id}`}
                          >
                            <Icon name="file" />

                            <span>
                              {f.name}

                              <small>
                                {(f.size / 1024).toFixed(0)} KB · {r.title}
                              </small>
                            </span>

                            <Icon name="download" />
                          </a>
                        ))
                      )}

                      {!(isCreative ? records : allMedia).some((r) => r.files?.length) && (
                        <p>No original files attached.</p>
                      )}
                    </div>
                  </Tabs.Content>

                  <Tabs.Content value="provenance">
                    <div className="provenance-grid">
                      <div>
                        <Icon name="shield" />

                        <h3>Documented origin</h3>

                        <p>
                          Original files keep their upload date and SHA-256 fingerprint. Image
                          authenticity is a human review, not an automated certification.
                        </p>
                      </div>

                      <div>
                        <Icon name="file" />

                        <h3>Usage rights</h3>

                        <p>
                          Record permitted channels, territories, expiry and agreements before
                          delivery.
                        </p>

                        <button className="text-link" onClick={() => go('rights')}>
                          Open usage rights <Icon name="arrow" />
                        </button>
                      </div>

                      <div>
                        <Icon name="spark" />

                        <h3>AI references</h3>

                        <p>
                          Generated artwork is a creative concept. It is never evidence of a field
                          action.
                        </p>
                      </div>
                    </div>
                  </Tabs.Content>
                </Tabs.Root>
              </section>
            )}
          </div>

          <aside className="media-review">
            <ReviewNotes w={w} recordId={active?.id} refresh={refresh} />

            <section className="source-panel">
              <h3>{isCreative ? 'Creative decisions' : 'Version history'}</h3>

              {records

                .slice()

                .reverse()

                .map((r) => (
                  <button className="source-history" key={r.id} onClick={() => open(r)}>
                    <Icon name="clock" />

                    <span>
                      {r.title}

                      <small>
                        {statusLabel(r.status)} · r{r.version}
                      </small>
                    </span>

                    <Icon name="right" />
                  </button>
                ))}

              {!records.length && <p>No saved record yet.</p>}
            </section>

            {['bee-review', 'brand-review', 'delivery'].includes(page) && (
              <section className="source-panel">
                <h3>Review source</h3>

                <p>
                  {version
                    ? `${version.title} · revision ${version.version}`
                    : 'A saved version is required.'}
                </p>

                {version && (
                  <button className="text-link" onClick={() => open(version)}>
                    Open source <Icon name="arrow" />
                  </button>
                )}
              </section>
            )}

            <button className="source-export" onClick={exportManifest}>
              <Icon name="download" />
              Export media manifest
            </button>
          </aside>
        </div>
      </div>

      {editor && (
        <RecordEditor
          key={editor.record?.id || editor.kind}

          editor={editor}

          w={w}

          close={() => setEditor(null)}

          refresh={refresh}

          image={image}
        />
      )}

      <Dialog.Root open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="studio-overlay" />

          <Dialog.Content className="horizon media-lightbox" aria-describedby={undefined}>
            <Dialog.Title>{preview?.title}</Dialog.Title>

            <Dialog.Close aria-label="Close preview">Close ×</Dialog.Close>

            {preview && <Photo src={preview.src} alt={preview.title} />}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
