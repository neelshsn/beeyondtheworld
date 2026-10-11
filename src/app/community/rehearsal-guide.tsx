'use client';
import { pages, roleKey } from '@/lib/community/horizon';
import type { Workspace } from '@/lib/community/types';
import { Icon } from './horizon-icons';

const steps = [
  {
    title: 'The intention',
    owner: 'Brand → Bee',
    text: 'Complete the brief, then submit the full intention for Bee review.',
    links: [
      ['brief-scope', 'Brief'],
      ['brief-review', 'Review'],
    ],
    gate: 'brief-review',
    icon: 'feather',
  },
  {
    title: 'The local partner',
    owner: 'Local partner → Bee',
    text: 'Document identity, expertise and local presence. Bee reviews the trust journey.',
    links: [
      ['trust-human', 'Trust journey'],
      ['trust-review', 'Bee review'],
      ['trust-verified', 'Verification'],
    ],
    gate: 'trust-verified',
    icon: 'shield',
  },
  {
    title: 'Scouting & creation',
    owner: 'Production + creative team → Bee → Brand',
    text: 'Explore locations and frames. Assign looks and references before locking the creative direction.',
    links: [
      ['scouting', 'Locations'],
      ['allocation', 'Frames'],
      ['styling', 'Looks'],
      ['creative-lock', 'Creative lock'],
    ],
    gate: 'creative-lock',
    icon: 'pin',
  },
  {
    title: 'Ready to shoot',
    owner: 'Production + crew → Bee',
    text: 'Confirm bookings, team readiness and budget. Review the itinerary and call sheet.',
    links: [
      ['team', 'Team'],
      ['bookings', 'Bookings'],
      ['itinerary', 'Itinerary'],
      ['ready', 'Readiness'],
    ],
    gate: 'ready',
    icon: 'calendar',
  },
  {
    title: 'On set',
    owner: 'Photo + film + styling + beauty + talent',
    text: 'Follow the call sheet, update frames and fitting checks, then upload previews and source files.',
    links: [
      ['call-sheet', 'Call sheet'],
      ['shoot', 'On set'],
      ['fitting', 'Fitting'],
      ['raws', 'Source files'],
    ],
    gate: 'raws',
    icon: 'camera',
  },
  {
    title: 'The final story',
    owner: 'Editor → Bee → Brand',
    text: 'Upload a version. Bee reviews it before the brand. Each review references the current revision.',
    links: [
      ['handoff', 'Handoff'],
      ['version', 'Versions'],
      ['bee-review', 'Bee review'],
      ['brand-review', 'Brand review'],
    ],
    gate: 'brand-review',
    icon: 'layers',
  },
  {
    title: 'Delivery',
    owner: 'Bee + Brand',
    text: 'Document usage rights, approve the reviewed version for delivery, then archive the files.',
    links: [
      ['rights', 'Rights'],
      ['delivery', 'Delivery'],
      ['archive', 'Archive'],
    ],
    gate: 'delivery',
    icon: 'download',
  },
  {
    title: 'The impact trace',
    owner: 'Local partner → Bee → assigned expert',
    text: 'Link actions, expenses and evidence. Review indicators according to their risk before approving the report.',
    links: [
      ['impact-capital', 'Capital'],
      ['field-actions', 'Actions'],
      ['evidence', 'Evidence'],
      ['indicator', 'Indicator'],
      ['expert-review', 'Expert review'],
      ['report', 'Report'],
    ],
    gate: 'report',
    icon: 'leaf',
  },
];

export function RehearsalGuide({ w, go }: { w: Workspace; go: (id: string) => void }) {
  const role = roleKey(w.project.role);
  return (
    <details className="rehearsal-guide">
      <summary>
        <Icon name="map" /> Test the whole production <span>8 stages · 12 roles</span>
      </summary>
      <p>
        Choose a role in the top-right menu. Changes are shared across roles and saved to this test
        journey. These are fictional people, documents and results; approvals do not sign contracts
        or move money.
      </p>
      <ol>
        {steps.map((step) => {
          const done = w.records.some(
            (r) => r.kind === 'horizon:' + step.gate && r.status === 'approved'
          );
          return (
            <li key={step.gate}>
              <Icon name={done ? 'check' : step.icon} />
              <div>
                <h3>{step.title}</h3>
                <small>{step.owner}</small>
                <p>{step.text}</p>
                <div className="rehearsal-links">
                  {step.links.map(([id, label]) => {
                    const allowed = role === 'bee' || pages.find((p) => p.id === id)?.roles[role];
                    return (
                      <button
                        key={id}
                        disabled={!allowed}
                        title={allowed ? label : 'Switch to a role responsible for this step'}
                        onClick={() => go(id)}
                      >
                        {label}
                        <Icon name="arrow" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </details>
  );
}
