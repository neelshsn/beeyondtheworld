'use client';

import Link from 'next/link';
import { ArrowLeft, AlertCircle, LoaderCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { CampaignDetailExperience } from '@/app/campaigns/[slug]/_components/campaign-detail-experience';
import { deriveCampaignCard } from '@/data/campaign-editorial';
import type { CampaignEditorDocument } from '@/types/editorial-content';

export function CampaignDraftPreview({ id }: { id: number }) {
  const [campaigns, setCampaigns] = useState<CampaignEditorDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!Number.isInteger(id)) {
        setError('Cette campagne est introuvable.');
        setLoading(false);
        return;
      }
      try {
        const response = await fetch('/api/admin/campaigns', { cache: 'no-store' });
        const payload = (await response.json().catch(() => ({}))) as
          | CampaignEditorDocument[]
          | { campaigns?: CampaignEditorDocument[]; error?: string };
        if (!response.ok) {
          const message = Array.isArray(payload) ? null : payload.error;
          throw new Error(message ?? 'L’aperçu n’a pas pu être chargé.');
        }
        if (!cancelled) {
          setCampaigns(Array.isArray(payload) ? payload : (payload.campaigns ?? []));
        }
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'L’aperçu n’a pas pu être chargé.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const document = useMemo(
    () => campaigns.find((campaign) => campaign.id === id) ?? null,
    [campaigns, id]
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0d0a07] px-4 text-white">
        <div className="flex min-h-[45vh] items-center justify-center">
          <p className="flex items-center gap-3 text-sm text-white/65" role="status">
            <LoaderCircle className="size-5 animate-spin text-[#f4bb52]" aria-hidden />
            Préparation de l’aperçu…
          </p>
        </div>
      </main>
    );
  }

  if (error || !document) {
    return (
      <main className="min-h-screen bg-[#0d0a07] px-4 text-white">
        <div className="mx-auto max-w-xl border border-red-300/25 bg-red-300/[0.06] p-5 sm:p-7">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-200" aria-hidden />
            <div>
              <h1 className="text-lg font-medium">Aperçu indisponible</h1>
              <p className="mt-2 text-sm leading-6 text-white/60">
                {error ?? 'Cette campagne est introuvable.'}
              </p>
            </div>
          </div>
          <Link
            href={`/admin/campaigns?campaign=${id}`}
            className="mt-6 inline-flex min-h-11 items-center gap-2 border border-[#f4bb52] px-4 text-sm text-[#f4bb52] outline-none transition hover:bg-[#f4bb52] hover:text-black focus-visible:ring-2 focus-visible:ring-[#f4bb52]"
          >
            <ArrowLeft className="size-4" aria-hidden /> Retour à l’éditeur
          </Link>
        </div>
      </main>
    );
  }

  const content = document.draft;
  const card = deriveCampaignCard(content);

  return (
    <main className="min-h-screen bg-[#0d0a07] text-white">
      <div className="flex min-h-16 flex-col justify-center gap-3 border-y border-[#f4bb52]/35 bg-[#17120e] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#f4bb52]">
            Aperçu du brouillon enregistré
          </p>
          <p className="mt-1 text-xs leading-5 text-white/45">
            Cet aperçu n’est visible que dans l’Espace Bee. Il ne publie rien.
          </p>
        </div>
        <Link
          href={`/admin/campaigns?campaign=${id}`}
          className="inline-flex min-h-11 items-center justify-center gap-2 border border-white/20 px-4 text-sm text-white outline-none transition hover:border-[#f4bb52]/60 hover:text-[#f4bb52] focus-visible:ring-2 focus-visible:ring-[#f4bb52]"
        >
          <ArrowLeft className="size-4" aria-hidden /> Retour à l’éditeur
        </Link>
      </div>

      <div className="h-[calc(100svh-13rem)] min-h-[24rem] overflow-hidden bg-black [&>main]:!h-full [&>section]:!min-h-full">
        <CampaignDetailExperience
          campaign={content.showcase}
          meta={card}
          format={content.format}
          tale={content.tale}
          campaignCatalog={campaigns.map((campaign) => campaign.draft.showcase)}
        />
      </div>
    </main>
  );
}
