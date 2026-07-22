'use client';

import { useCallback, useEffect, useState } from 'react';

type Lead = {
  id: string;
  reference: string;
  kind: 'contact' | 'journey_booking';
  audience: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  journeySlug: string | null;
  notificationStatus: 'pending' | 'sent' | 'failed' | 'not_configured';
  createdAt: string;
};

const statusLabel: Record<Lead['notificationStatus'], string> = {
  pending: 'Notification en attente',
  sent: 'Notification envoyée',
  failed: 'Notification échouée',
  not_configured: 'Notification à configurer',
};

export function LeadInbox() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/leads', { cache: 'no-store' });
      const payload = (await response.json()) as { leads?: Lead[]; error?: string };
      if (!response.ok) throw new Error(payload.error ?? `Erreur ${response.status}`);
      setLeads(payload.leads ?? []);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Chargement impossible.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main className="min-h-screen bg-[#0d0a07] px-6 py-24 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#f4bb52]">P0 conversion</p>
            <h1 className="mt-3 text-4xl uppercase tracking-[0.08em]">Lead Inbox</h1>
            <p className="mt-3 max-w-2xl text-sm text-white/55">
              Chaque demande est sauvegardée avant toute tentative de notification.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.25em] hover:border-[#f4bb52]"
          >
            Actualiser
          </button>
        </div>

        {loading ? <p className="mt-12 text-sm text-white/50">Chargement…</p> : null}
        {error ? <p className="mt-12 text-sm text-red-400">{error}</p> : null}
        {!loading && !error && leads.length === 0 ? (
          <p className="mt-12 border border-white/10 p-6 text-sm text-white/50">
            Aucune demande enregistrée.
          </p>
        ) : null}

        <div className="mt-10 grid gap-4">
          {leads.map((lead) => (
            <article key={lead.id} className="border border-white/10 bg-white/[0.03] p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-[#f4bb52]">
                    {lead.reference}
                  </p>
                  <h2 className="mt-2 text-lg">
                    {lead.company ?? lead.name ?? lead.email ?? lead.phone ?? 'Contact'}
                  </h2>
                  <p className="mt-2 text-sm text-white/55">
                    {lead.kind === 'journey_booking' ? 'Booking Journey' : lead.audience} ·{' '}
                    {new Date(lead.createdAt).toLocaleString('fr-FR')}
                  </p>
                </div>
                <span className="border border-white/15 px-3 py-1 text-xs text-white/65">
                  {statusLabel[lead.notificationStatus]}
                </span>
              </div>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
                {lead.name ? <span>{lead.name}</span> : null}
                {lead.email ? <a href={`mailto:${lead.email}`}>{lead.email}</a> : null}
                {lead.phone ? <span>{lead.phone}</span> : null}
                {lead.journeySlug ? <span>Journey : {lead.journeySlug}</span> : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
