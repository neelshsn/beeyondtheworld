'use client';
import { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { pages } from '@/lib/community/horizon';
import { kinds, statusLabel } from '@/lib/community/model';
import { studioImage } from '@/lib/community/studio';
import type { CommunityRecord, Workspace } from '@/lib/community/types';
import { RecordEditor, type Editor } from './studio-workspace';
import { ReviewNotes } from './review-notes';
import { ProductionTrace } from './production-trace';
import { journeyArtwork } from '@/lib/community/artwork';
import { Icon } from './horizon-icons';
export const impactPages = [
  'evidence',
  'field-actions',
  'impact-overview',
  'impact-social',
  'impact-environment',
  'impact-economic',
  'impact-capital',
  'budget',
  'capital-report',
  'expenses',
  'bee-label',
  'production-social',
  'production-environment',
  'production-economic',
  'report',
];
const pillars = [
  ['Social', 'People & community', 'users'],
  ['Environmental', 'The living world', 'leaf'],
  ['Economic', 'Local value', 'globe'],
];
const money = (v: number) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(v);
function Photo({ src, alt }: { src: string; alt: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" decoding="async" />;
}
export function ImpactWorkspace({
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
    [actionId, setActionId] = useState(''),
    [filter, setFilter] = useState('All'),
    [query, setQuery] = useState('');
  const spec = pages.find((p) => p.id === page)!;
  const actions = w.records.filter((r) => r.kind === 'action');
  const action = actions.find((r) => r.id === actionId) || actions[0];
  const evidence = w.records.filter(
    (r) => r.kind === 'evidence' || r.kind === 'horizon:evidence-add'
  );
  const linked = evidence.filter((r) => r.data.actionId === action?.id);
  const allocations = w.records.filter(
    (r) => r.kind === 'allocation' && (page === 'impact-capital' ? r.data.layer === 'Impact' : true)
  );
  const expenses = w.records.filter(
    (r) =>
      r.kind === 'expense' ||
      r.kind === 'horizon:expense-add' ||
      r.kind === 'horizon:impact-expense'
  );
  const indicators = w.records.filter((r) => r.kind === 'result');
  const horizonIndicators = w.records.filter((r) => r.kind === 'horizon:indicator');
  const which =
    page === 'impact-social'
      ? 'Social'
      : page === 'impact-environment'
        ? 'Environmental'
        : page === 'impact-economic'
          ? 'Economic'
          : filter;
  const shownIndicators = indicators.filter(
    (r) =>
      (which === 'All' || r.data.pillar === which) &&
      r.title.toLowerCase().includes(query.toLowerCase())
  );
  const filteredAllocations = allocations.filter(
    (r) => filter === 'All' || r.data.layer === filter || r.data.pillar === filter
  );
  const total = filteredAllocations.reduce((s, r) => s + Number(r.data.amount || 0), 0);
  const image = (r?: CommunityRecord) =>
    studioImage(r, w, journeyArtwork(w.project, String(r?.data.imageAsset || 'landscape')));
  const open = (r: CommunityRecord) => setEditor({ kind: r.kind, record: r });
  const add = (kind: string, initial: Editor['initial'] = {}) => setEditor({ kind, initial });
  const may = (kind: string) => kinds[kind]?.roles.includes(w.project.role);
  const valid = evidence.filter((r) => ['bee_reviewed', 'expert_validated'].includes(r.status));
  const metrics = [
    'impact-overview',
    'impact-social',
    'impact-environment',
    'impact-economic',
    'bee-label',
    'production-social',
    'production-environment',
    'production-economic',
    'report',
  ].includes(page);
  const capital = ['impact-capital', 'budget', 'capital-report'].includes(page);
  const groups = (
    page === 'impact-capital'
      ? pillars.map((p) => p[0])
      : ['Production', 'Creative', 'Impact', 'Bee operations']
  ).map((key, i) => ({
    key,
    amount: filteredAllocations
      .filter((r) => (page === 'impact-capital' ? r.data.pillar : r.data.layer) === key)
      .reduce((s, r) => s + Number(r.data.amount || 0), 0),
    color: ['#dfbb7a', '#7db591', '#88b5c8', '#cfbaa3'][i],
  }));
  const allocatedTotal = groups.reduce((s, g) => s + g.amount, 0);
  if (total > allocatedTotal)
    groups.push({ key: 'Unclassified', amount: total - allocatedTotal, color: '#adad9b' });
  let accumulated = 0;
  const segments = groups
    .filter((g) => g.amount > 0)
    .map((g) => {
      const start = accumulated;
      accumulated += (g.amount / (total || 1)) * 100;
      return `${g.color} ${start}% ${accumulated}%`;
    });
  const download = () => {
    const data = {
      project: w.project.title,
      territory: w.project.territory,
      example: w.project.is_demo,
      exportedAt: new Date().toISOString(),
      allocations: filteredAllocations,
      actions,
      evidence,
      indicators,
      expenses,
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = 'beeyond-production-report.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const sourceFile = (r: CommunityRecord) => (
    <div className="media-file-list">
      {r.files?.map((f) => (
        <a key={f.id} href={`/api/community/files?project=${w.project.id}&id=${f.id}`}>
          <Icon name="file" />
          {f.name}
          <Icon name="download" />
        </a>
      ))}
      {r.data.reference && (
        <a href={String(r.data.reference)} target="_blank" rel="noopener noreferrer">
          <Icon name="globe" />
          Shared source <Icon name="arrow" />
        </a>
      )}
    </div>
  );
  return (
    <section className="impact-workspace">
      <header className="source-heading">
        <div>
          <span className="eyebrow">
            {w.project.title} /{' '}
            {capital ? 'Capital' : page === 'expenses' ? 'Production' : 'Impact'}
          </span>
          <h1>
            {page === 'impact-capital'
              ? 'IMPACT CAPITAL'
              : page === 'impact-environment'
                ? 'ENVIRONMENT'
                : spec.title}
          </h1>
          <p>
            {capital
              ? 'Follow the allocation, use and evidence of every commitment.'
              : metrics
                ? 'Targets, observations and evidence — each with its review status.'
                : 'Connect each action with its original evidence.'}
          </p>
        </div>
        <button className="source-export" onClick={download}>
          <Icon name="download" />
          Export report
        </button>
      </header>
      {capital ? (
        <>
          <div className="capital-grid">
            <section className="source-panel capital-total">
              <div className="source-panel-head">
                <h2>
                  {w.project.is_demo
                    ? 'Planning allocation · illustrative replay'
                    : 'Recorded capital'}
                </h2>
                <select
                  aria-label="Capital filter"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option>All</option>
                  {(page === 'impact-capital'
                    ? pillars.map((p) => p[0])
                    : ['Production', 'Creative', 'Impact', 'Bee operations']
                  ).map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>
              <strong className="capital-amount">{money(total)}</strong>
              <p>Records of allocation; no payment is initiated here.</p>
              <div className="capital-donut-row">
                <div
                  className="capital-donut"
                  role="img"
                  aria-label={groups.map((g) => `${g.key}: ${money(g.amount)}`).join(', ')}
                  style={{
                    background: segments.length
                      ? `conic-gradient(${segments.join(',')})`
                      : 'rgba(255,255,255,.12)',
                  }}
                >
                  <div>
                    <strong>{money(total)}</strong>
                    <small>TOTAL</small>
                  </div>
                </div>
                <div className="capital-legend">
                  {groups.map((g, i) => (
                    <button key={g.key} onClick={() => setFilter(g.key)}>
                      <Icon name={pillars[i]?.[2] || 'circle'} />
                      <span>
                        {g.key}
                        <small>{total ? Math.round((g.amount / total) * 100) : 0}%</small>
                      </span>
                      <b>{money(g.amount)}</b>
                      <Icon name="right" />
                    </button>
                  ))}
                </div>
              </div>
              {may('allocation') && (
                <button
                  className="text-link"
                  onClick={() =>
                    add('allocation', {
                      layer: page === 'impact-capital' ? 'Impact' : 'Production',
                    })
                  }
                >
                  <Icon name="plus" />
                  Add allocation
                </button>
              )}
            </section>
            <div>
              <section className="source-panel">
                <h2>Capital by status</h2>
                <div className="capital-bars">
                  {['committed', 'allocated', 'released'].map((s) => {
                    const amount = filteredAllocations
                      .filter((r) => r.status === s)
                      .reduce((n, r) => n + Number(r.data.amount || 0), 0);
                    return (
                      <div key={s}>
                        <span>{statusLabel(s)}</span>
                        <span className="capital-bar">
                          <i style={{ width: `${total ? (amount / total) * 100 : 0}%` }} />
                        </span>
                        <b>{money(amount)}</b>
                      </div>
                    );
                  })}
                </div>
              </section>
              <section className="source-panel">
                <h2>Allocations & recipients</h2>
                {filteredAllocations.map((r) => (
                  <button className="source-history" key={r.id} onClick={() => open(r)}>
                    <Icon name="users" />
                    <span>
                      {r.title}
                      <small>
                        {String(r.data.partner)} · {statusLabel(r.status)}
                      </small>
                    </span>
                    <b>{money(Number(r.data.amount || 0))}</b>
                  </button>
                ))}
                {!filteredAllocations.length && <p>No allocation in this scope.</p>}
              </section>
            </div>
          </div>
          <div className="impact-outcomes">
            {pillars.map(([p, title, icon]) => (
              <div key={p}>
                <Icon name={icon} />
                <span>
                  {title}
                  <strong>
                    {
                      indicators.filter((r) => r.data.pillar === p && r.status === 'validated')
                        .length
                    }{' '}
                    validated indicators
                  </strong>
                  <small>
                    {indicators.some((r) => r.data.pillar === p)
                      ? 'Open the indicator for values and units'
                      : 'Pending measurement'}
                  </small>
                </span>
                <button
                  aria-label={`Open ${p} indicators`}
                  onClick={() =>
                    go(
                      `impact-${p === 'Environmental' ? 'environment' : p === 'Economic' ? 'economic' : 'social'}`
                    )
                  }
                >
                  <Icon name="right" />
                </button>
              </div>
            ))}
          </div>
        </>
      ) : [
          'bee-label',
          'production-social',
          'production-environment',
          'production-economic',
          'report',
        ].includes(page) ? (
        <ProductionTrace w={w} page={page} open={open} go={go} />
      ) : metrics ? (
        <>
          <nav className="impact-stages">
            {[
              ['co-intentions', 'Intentions', 'feather'],
              ['impact-plan', 'Plan', 'file'],
              ['impact-capital', 'Capital', 'circle'],
              ['field-actions', 'Actions', 'leaf'],
              ['evidence', 'Evidence', 'shield'],
              ['impact-overview', 'Results', 'globe'],
            ].map(([id, title, icon], i) => (
              <button
                key={id}
                onClick={() => go(id)}
                aria-current={page === id ? 'step' : undefined}
              >
                <span>
                  {i + 1}
                  <Icon name={icon} />
                </span>
                {title}
              </button>
            ))}
          </nav>
          <div className="impact-kpis">
            {(shownIndicators.length
              ? shownIndicators.slice(0, 4)
              : pillars.map(([p, title]) => ({
                  id: p,
                  title,
                  status: 'draft',
                  data: { target: '—', unit: '', pillar: p },
                }))
            ).map((r) => (
              <button
                key={r.id}
                onClick={() => ('kind' in r ? open(r as CommunityRecord) : setFilter(r.id))}
              >
                <Icon
                  name={
                    r.data.pillar === 'Environmental'
                      ? 'leaf'
                      : r.data.pillar === 'Social'
                        ? 'users'
                        : 'globe'
                  }
                />
                <span>
                  <strong>
                    {'actual' in r.data && r.status === 'validated'
                      ? String(r.data.actual)
                      : `Target ${r.data.target ?? '—'}`}{' '}
                    <small>{String(r.data.unit || '')}</small>
                  </strong>
                  <b>{r.title}</b>
                  <small>
                    {r.status === 'validated' ? 'Validated observation' : 'Pending evidence'}
                  </small>
                </span>
              </button>
            ))}
          </div>
          <div className="impact-metric-grid">
            <section className="source-panel">
              <div className="source-panel-head">
                <h2>Indicators & evidence</h2>
                {may('result') && (
                  <button className="text-link" onClick={() => add('result')}>
                    <Icon name="plus" />
                    Add indicator
                  </button>
                )}
              </div>
              <div className="source-filters">
                <input
                  aria-label="Search indicators"
                  placeholder="Search indicators…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <select
                  aria-label="Pillar"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option>All</option>
                  {pillars.map(([p]) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="source-table-wrap">
                <table className="source-table">
                  <thead>
                    <tr>
                      <th>Indicator</th>
                      <th>Target</th>
                      <th>Observed</th>
                      <th>Status</th>
                      <th>Evidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shownIndicators.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <button onClick={() => open(r)}>
                            {r.title} <Icon name="right" />
                          </button>
                          <small>{String(r.data.unit || '')}</small>
                        </td>
                        <td>{String(r.data.target ?? '—')}</td>
                        <td>{r.status === 'validated' ? String(r.data.actual ?? '—') : '—'}</td>
                        <td>
                          <span className="status-pill">
                            {r.status === 'validated' ? 'Validated' : 'Pending validation'}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => {
                              const e = evidence.find((e) => e.id === r.data.evidenceId);
                              if (e) open(e);
                              else go('evidence');
                            }}
                          >
                            <Icon name="file" />
                            {evidence.some((e) => e.id === r.data.evidenceId)
                              ? '1 record'
                              : '0 records'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!shownIndicators.length && (
                <p>
                  No indicators in this scope. Add the method, target and evidence before validating
                  an observation.
                </p>
              )}
              {horizonIndicators.map((r) => (
                <button key={r.id} className="source-history" onClick={() => open(r)}>
                  <Icon name="leaf" />
                  <span>
                    {r.title}
                    <small>{statusLabel(r.status)} · Method record</small>
                  </span>
                  <Icon name="right" />
                </button>
              ))}
            </section>
            <aside>
              <section className="source-panel">
                <h2>Evidence chain</h2>
                <div className="impact-chain">
                  {['leaf', 'camera', 'file', 'shield', 'globe'].map((i, n) => (
                    <span key={i}>
                      <Icon name={i} />
                      {['Action', 'Original', 'Method', 'Review', 'Report'][n]}
                    </span>
                  ))}
                </div>
                <p>
                  {valid.length} reviewed evidence records ·{' '}
                  {indicators.filter((r) => r.status === 'validated').length} validated indicators
                </p>
              </section>
              <section className="source-panel">
                <h2>Key initiatives</h2>
                {actions.map((r) => (
                  <button className="source-history" key={r.id} onClick={() => open(r)}>
                    <Icon name="leaf" />
                    <span>
                      {r.title}
                      <small>{statusLabel(r.status)}</small>
                    </span>
                    <Icon name="right" />
                  </button>
                ))}
                {!actions.length && <p>No field actions registered.</p>}
                <button className="text-link" onClick={() => go('field-actions')}>
                  Open actions <Icon name="arrow" />
                </button>
              </section>
            </aside>
          </div>
        </>
      ) : page === 'expenses' ? (
        <section className="source-panel">
          <div className="source-panel-head">
            <h2>Expenses & receipts</h2>
            {may('horizon:expense-add') && (
              <button className="main-action" onClick={() => add('horizon:expense-add')}>
                <Icon name="plus" />
                Add expense
              </button>
            )}
          </div>
          <div className="source-table-wrap">
            <table className="source-table">
              <thead>
                <tr>
                  <th>Expense</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <button onClick={() => open(r)}>{r.title}</button>
                    </td>
                    <td>{money(Number(r.data.amount || r.data['expense-add-1'] || 0))}</td>
                    <td>{statusLabel(r.status)}</td>
                    <td>{sourceFile(r)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!expenses.length && <p>No expenses recorded.</p>}
        </section>
      ) : (
        <div className="evidence-layout">
          <aside className="source-panel evidence-actions">
            <div className="source-panel-head">
              <h2>Field actions</h2>
              {may('action') && (
                <button aria-label="Add field action" onClick={() => add('action')}>
                  <Icon name="plus" />
                </button>
              )}
            </div>
            {actions.map((r) => (
              <button
                key={r.id}
                aria-current={action?.id === r.id ? 'true' : undefined}
                onClick={() => setActionId(r.id)}
              >
                <Photo src={image(r)} alt={r.title} />
                <span>
                  {r.title}
                  <small>{statusLabel(r.status)}</small>
                </span>
                <Icon name="right" />
              </button>
            ))}
            {!actions.length && <p>Start with an agreed action and measurement plan.</p>}
          </aside>
          <div>
            <header className="source-panel evidence-title">
              <div>
                <span className="eyebrow">
                  {action ? String(action.data.pillar) : 'Field evidence'}
                </span>
                <h2>{action?.title || 'Keep the proof close'}</h2>
                <p>
                  {action
                    ? String(action.data.location)
                    : 'Original evidence belongs to a specific action.'}
                </p>
              </div>
              {action && (
                <button className="text-link" onClick={() => open(action)}>
                  Open action <Icon name="arrow" />
                </button>
              )}
              {may('evidence') && (
                <button
                  className="main-action"
                  disabled={!action}
                  onClick={() => add('evidence', { actionId: action!.id })}
                >
                  <Icon name="upload" />
                  Attach original evidence
                </button>
              )}
            </header>
            <section className="source-panel">
              <Tabs.Root defaultValue="evidence">
                <Tabs.List className="source-tabs">
                  {['Evidence', 'Locations', 'Documents', 'Notes'].map((t) => (
                    <Tabs.Trigger key={t} value={t.toLowerCase()}>
                      {t}
                    </Tabs.Trigger>
                  ))}
                </Tabs.List>
                <Tabs.Content value="evidence">
                  <div className="evidence-cards">
                    {linked.map((r) => (
                      <button key={r.id} onClick={() => open(r)}>
                        {r.files?.some((f) => f.mime.startsWith('image/')) ? (
                          <Photo src={image(r)} alt={r.title} />
                        ) : (
                          <div className="evidence-placeholder">
                            <Icon name="file" />
                          </div>
                        )}
                        <span>
                          {r.title}
                          <small>
                            {String(r.data.observed || 'Date to confirm')} · {statusLabel(r.status)}
                          </small>
                        </span>
                      </button>
                    ))}
                  </div>
                  {!linked.length && (
                    <div className="evidence-empty">
                      <Icon name="camera" />
                      <h3>No original evidence attached</h3>
                      <p>
                        Field photos, signed documents and measurements will appear here after
                        upload.
                      </p>
                    </div>
                  )}
                  <p>
                    {linked.filter((r) => r.status === 'expert_validated').length} independently
                    validated · {linked.length} records
                  </p>
                </Tabs.Content>
                <Tabs.Content value="locations">
                  <div className="evidence-metadata">
                    <Icon name="pin" />
                    <h3>{String(action?.data.location || 'Location to confirm')}</h3>
                    <p>{String(action?.data.description || 'Add a location to the action.')}</p>
                    {action && (
                      <button className="text-link" onClick={() => open(action)}>
                        Open location details <Icon name="arrow" />
                      </button>
                    )}
                  </div>
                </Tabs.Content>
                <Tabs.Content value="documents">
                  {linked.map((r) => (
                    <div key={r.id}>
                      <h3>{r.title}</h3>
                      {sourceFile(r)}
                    </div>
                  ))}
                  {!linked.length && <p>No documents attached.</p>}
                </Tabs.Content>
                <Tabs.Content value="notes">
                  <ReviewNotes w={w} recordId={action?.id} refresh={refresh} />
                </Tabs.Content>
              </Tabs.Root>
            </section>
            <section className="source-panel evidence-metadata">
              <Icon name="shield" />
              <div>
                <h3>From observation to validation</h3>
                <p>
                  Original, date, location, collection method and consent. Bee reviews the evidence;
                  an assigned expert reviews claims that require independent validation.
                </p>
              </div>
              <button className="text-link" onClick={() => go('indicator')}>
                Measure with care <Icon name="arrow" />
              </button>
            </section>
          </div>
        </div>
      )}
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
    </section>
  );
}
