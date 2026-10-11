'use client';
import { calculateMetrics, factors } from '@/lib/community/metrics';
import { statusLabel } from '@/lib/community/model';
import type { CommunityRecord, Workspace } from '@/lib/community/types';
import { Icon } from './horizon-icons';
export function ProductionTrace({
  w,
  page,
  open,
  go,
}: {
  w: Workspace;
  page: string;
  open: (r: CommunityRecord) => void;
  go: (id: string) => void;
}) {
  const metrics = calculateMetrics(w.records),
    bookings = w.records.filter((r) => r.kind === 'booking'),
    approved = bookings.filter((r) => r.status === 'approved');
  const euro = (n: number) =>
    new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(n);
  const totalCost = approved.reduce((s, r) => s + Number(r.data.amount || 0), 0),
    localCost = approved
      .filter((r) => r.data.local === 'Yes')
      .reduce((s, r) => s + Number(r.data.amount || 0), 0);
  const environmental = page === 'production-environment',
    economic = page === 'production-economic',
    social = page === 'production-social';
  const team = w.members.filter((m) => !['brand', 'ngo', 'expert'].includes(m.role));
  const cards = environmental
    ? [
        [
          metrics.unestimatedBookings ? 'Partial planning estimate' : 'Planning estimate',
          metrics.estimatedBookings ? metrics.footprint.toFixed(1) + ' kg CO₂e' : 'Not estimated',
          'leaf',
        ],
        ['Activities estimated', `${metrics.estimatedBookings} / ${metrics.bookings}`, 'calendar'],
        ['Pending bookings', String(bookings.length - approved.length), 'clock'],
      ]
    : economic
      ? [
          ['Confirmed production cost', euro(totalCost), 'wallet'],
          ['Local providers', euro(localCost), 'home'],
          [
            'Local share',
            totalCost ? ((localCost / totalCost) * 100).toFixed(0) + '%' : '—',
            'globe',
          ],
        ]
      : social
        ? [
            ['Assigned crew', String(team.length), 'users'],
            [
              'Readiness files',
              String(w.records.filter((r) => r.kind === 'studio:readiness').length),
              'file',
            ],
            [
              'Agreements',
              String(
                w.records.filter((r) => r.kind === 'horizon:agreements' && r.status === 'approved')
                  .length
              ),
              'shield',
            ],
          ]
        : [
            [
              'Creative versions',
              String(w.records.filter((r) => r.kind === 'horizon:version').length),
              'image',
            ],
            ['Confirmed production cost', euro(totalCost), 'wallet'],
            ['Validated indicators', String(metrics.validated.length), 'leaf'],
            [
              'Reviewed evidence',
              String(
                w.records.filter(
                  (r) =>
                    r.kind === 'evidence' && ['bee_reviewed', 'expert_validated'].includes(r.status)
                ).length
              ),
              'shield',
            ],
          ];
  return (
    <>
      <div className="impact-kpis">
        {cards.map(([title, value, icon]) => (
          <button
            key={title}
            onClick={() =>
              go(
                environmental || economic
                  ? 'bookings'
                  : social
                    ? 'team'
                    : icon === 'image'
                      ? 'version'
                      : icon === 'wallet'
                        ? 'budget'
                        : icon === 'leaf'
                          ? 'impact-overview'
                          : 'evidence'
              )
            }
          >
            <Icon name={icon} />
            <span>
              <strong>{value}</strong>
              <b>{title}</b>
              <small>
                {w.project.is_demo ? 'Illustrative workflow' : 'From saved project records'}
              </small>
            </span>
          </button>
        ))}
      </div>
      <div className="impact-metric-grid">
        <section className="source-panel">
          <h2>
            {social
              ? 'Working together'
              : environmental
                ? 'Production activities & factors'
                : economic
                  ? 'Local economic trace'
                  : 'The production trace'}
          </h2>
          {social ? (
            <>
              <p>
                {team.length} people assigned to this journey. Readiness tracks agreements, travel,
                accommodation, equipment, permits and briefing.
              </p>
              <button className="text-link" onClick={() => go('team')}>
                Open team readiness <Icon name="arrow" />
              </button>
            </>
          ) : (
            <div className="source-table-wrap">
              <table className="source-table">
                <thead>
                  <tr>
                    <th>Activity / provider</th>
                    <th>Status</th>
                    <th>Cost</th>
                    <th>Estimated footprint</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <button onClick={() => open(r)}>{r.title}</button>
                        <small>
                          {String(r.data.supplier)} · {String(r.data.category)}
                        </small>
                      </td>
                      <td>{statusLabel(r.status)}</td>
                      <td>{euro(Number(r.data.amount || 0))}</td>
                      <td>
                        {r.status === 'approved'
                          ? factors[String(r.data.factorKey)] && Number(r.data.quantity) > 0
                            ? (
                                (Number(r.data.quantity) || 0) *
                                (factors[String(r.data.factorKey)]?.value || 0)
                              ).toFixed(1) + ' kg CO₂e'
                            : 'Not estimated'
                          : 'Pending confirmation'}
                        <small>{factors[String(r.data.factorKey)]?.label}</small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!bookings.length && (
                <p>
                  No providers booked yet. Add the activity quantity, provider and planning factor
                  in Bookings.
                </p>
              )}
            </div>
          )}
          {!social && (
            <button className="text-link" onClick={() => go('bookings')}>
              Open bookings <Icon name="arrow" />
            </button>
          )}
        </section>
        <aside>
          <section className="source-panel">
            <h2>Measurement scope</h2>
            <p>
              Footprint estimates use the project factor library and approved bookings only. They
              are planning estimates, not a certified carbon assessment. Impact results are tracked
              separately.
            </p>
            <details>
              <summary>View factors</summary>
              {Object.entries(factors).map(([key, f]) => (
                <p key={key}>
                  <b>{f.label}</b>
                  <br />
                  {f.value} kg CO₂e / {f.unit}
                  <br />
                  <small>Source workbook: {f.source}</small>
                </p>
              ))}
            </details>
          </section>
          <section className="source-panel">
            <h2>Evidence coverage</h2>
            <p>
              {metrics.coverage === null
                ? 'No approved impact spend to assess.'
                : `${(metrics.coverage * 100).toFixed(0)}% of approved impact spend is evidenced.`}
            </p>
            <button className="text-link" onClick={() => go('evidence')}>
              Open evidence <Icon name="arrow" />
            </button>
          </section>
        </aside>
      </div>
    </>
  );
}
