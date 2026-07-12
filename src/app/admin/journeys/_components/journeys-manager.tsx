'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type LocationRecord = {
  id: number;
  journeyId: number;
  name: string;
  subtitle: string | null;
  leftTitle: string[];
  narrative: string;
  image: string | null;
  video: string | null;
  position: number;
  published: boolean;
};

type JourneyRecord = {
  id: number;
  slug: string;
  title: string;
  season: string;
  dateLabel: string;
  dateFrom: string | null;
  dateTo: string | null;
  location: string;
  image: string;
  backgroundVideo: string | null;
  sustainablePdf: string | null;
  position: number;
  published: boolean;
  locations: LocationRecord[];
};

type JourneyDraft = Partial<Omit<JourneyRecord, 'id' | 'locations'>>;
type LocationDraft = Partial<Omit<LocationRecord, 'id' | 'journeyId'>> & { leftTitleText?: string };

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  const payload = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) {
    throw new Error(payload?.error ?? `Erreur ${response.status}`);
  }
  return payload;
}

const fieldClass =
  'w-full rounded-none border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-[#f4bb52]';
const labelClass = 'mb-1 block text-[10px] uppercase tracking-[0.3em] text-white/50';

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {textarea ? (
        <textarea
          className={cn(fieldClass, 'min-h-[88px]')}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          className={fieldClass}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
  );
}

function LocationEditor({
  location,
  onSaved,
  onDeleted,
}: {
  location: LocationRecord;
  onSaved: () => void;
  onDeleted: () => void;
}) {
  const [draft, setDraft] = useState<LocationDraft>({
    name: location.name,
    subtitle: location.subtitle ?? '',
    leftTitleText: location.leftTitle.join('\n'),
    narrative: location.narrative,
    image: location.image ?? '',
    video: location.video ?? '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await api(`/api/admin/locations/${location.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: draft.name,
          subtitle: draft.subtitle || null,
          leftTitle: (draft.leftTitleText ?? '')
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean),
          narrative: draft.narrative,
          image: draft.image || null,
          video: draft.video || null,
        }),
      });
      onSaved();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erreur');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    setError(null);
    try {
      await api(`/api/admin/locations/${location.id}`, { method: 'DELETE' });
      onDeleted();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erreur');
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3 border border-white/10 bg-black/20 p-4">
      <div className="grid gap-3 md:grid-cols-2">
        <Field
          label="Nom"
          value={draft.name ?? ''}
          onChange={(name) => setDraft((d) => ({ ...d, name }))}
        />
        <Field
          label="Sous-titre"
          value={draft.subtitle ?? ''}
          onChange={(subtitle) => setDraft((d) => ({ ...d, subtitle }))}
        />
        <Field
          label="Image (URL)"
          value={draft.image ?? ''}
          onChange={(image) => setDraft((d) => ({ ...d, image }))}
          placeholder="/assets/journeys/…"
        />
        <Field
          label="Vidéo (URL)"
          value={draft.video ?? ''}
          onChange={(video) => setDraft((d) => ({ ...d, video }))}
          placeholder="/assets/journeys/…"
        />
      </div>
      <Field
        label="Titre gauche (1 ligne par entrée)"
        value={draft.leftTitleText ?? ''}
        onChange={(leftTitleText) => setDraft((d) => ({ ...d, leftTitleText }))}
        textarea
      />
      <Field
        label="Narratif"
        value={draft.narrative ?? ''}
        onChange={(narrative) => setDraft((d) => ({ ...d, narrative }))}
        textarea
      />
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={save} disabled={busy}>
          Enregistrer
        </Button>
        <Button size="sm" variant="ghost" onClick={remove} disabled={busy}>
          <Trash2 className="size-4" /> Supprimer
        </Button>
      </div>
    </div>
  );
}

function JourneyEditor({ journey, onChanged }: { journey: JourneyRecord; onChanged: () => void }) {
  const [draft, setDraft] = useState<JourneyDraft>({
    slug: journey.slug,
    title: journey.title,
    season: journey.season,
    dateLabel: journey.dateLabel,
    dateFrom: journey.dateFrom ?? '',
    dateTo: journey.dateTo ?? '',
    location: journey.location,
    image: journey.image,
    backgroundVideo: journey.backgroundVideo ?? '',
    sustainablePdf: journey.sustainablePdf ?? '',
  });
  const [newLocationName, setNewLocationName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await api(`/api/admin/journeys/${journey.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          slug: draft.slug,
          title: draft.title,
          season: draft.season,
          dateLabel: draft.dateLabel,
          dateFrom: draft.dateFrom || null,
          dateTo: draft.dateTo || null,
          location: draft.location,
          image: draft.image,
          backgroundVideo: draft.backgroundVideo || null,
          sustainablePdf: draft.sustainablePdf || null,
        }),
      });
      onChanged();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erreur');
    } finally {
      setBusy(false);
    }
  };

  const addLocation = async () => {
    if (!newLocationName.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await api(`/api/admin/journeys/${journey.id}/locations`, {
        method: 'POST',
        body: JSON.stringify({ name: newLocationName.trim(), position: journey.locations.length }),
      });
      setNewLocationName('');
      onChanged();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erreur');
    } finally {
      setBusy(false);
    }
  };

  const moveLocation = async (index: number, direction: -1 | 1) => {
    const ordered = [...journey.locations].map((location) => location.id);
    const target = index + direction;
    if (target < 0 || target >= ordered.length) return;
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    await api('/api/admin/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ entity: 'locations', orderedIds: ordered }),
    });
    onChanged();
  };

  return (
    <div className="space-y-5 border-t border-white/10 p-5">
      <div className="grid gap-3 md:grid-cols-2">
        <Field
          label="Slug"
          value={draft.slug ?? ''}
          onChange={(slug) => setDraft((d) => ({ ...d, slug }))}
        />
        <Field
          label="Titre"
          value={draft.title ?? ''}
          onChange={(title) => setDraft((d) => ({ ...d, title }))}
        />
        <label className="block">
          <span className={labelClass}>Saison</span>
          <select
            className={fieldClass}
            value={draft.season}
            onChange={(event) => setDraft((d) => ({ ...d, season: event.target.value }))}
          >
            <option value="spring-summer">Spring Summer</option>
            <option value="fall-winter">Fall Winter</option>
          </select>
        </label>
        <Field
          label="Lieu"
          value={draft.location ?? ''}
          onChange={(location) => setDraft((d) => ({ ...d, location }))}
        />
        <Field
          label="Libellé de dates"
          value={draft.dateLabel ?? ''}
          onChange={(dateLabel) => setDraft((d) => ({ ...d, dateLabel }))}
          placeholder="From 1st May to 30th September"
        />
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="From"
            value={draft.dateFrom ?? ''}
            onChange={(dateFrom) => setDraft((d) => ({ ...d, dateFrom }))}
          />
          <Field
            label="To"
            value={draft.dateTo ?? ''}
            onChange={(dateTo) => setDraft((d) => ({ ...d, dateTo }))}
          />
        </div>
        <Field
          label="Image (URL)"
          value={draft.image ?? ''}
          onChange={(image) => setDraft((d) => ({ ...d, image }))}
        />
        <Field
          label="Vidéo de fond (URL)"
          value={draft.backgroundVideo ?? ''}
          onChange={(backgroundVideo) => setDraft((d) => ({ ...d, backgroundVideo }))}
        />
        <Field
          label="PDF Sustainable Impact (URL)"
          value={draft.sustainablePdf ?? ''}
          onChange={(sustainablePdf) => setDraft((d) => ({ ...d, sustainablePdf }))}
          placeholder="/pdfs/…"
        />
      </div>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
      <Button size="sm" onClick={save} disabled={busy}>
        Enregistrer le voyage
      </Button>

      <div className="space-y-3">
        <h4 className="text-[11px] uppercase tracking-[0.3em] text-white/60">
          Locations ({journey.locations.length})
        </h4>
        {journey.locations.map((location, index) => (
          <div key={location.id} className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-white/80">
              <span className="flex-1">
                {index + 1}. {location.name}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => moveLocation(index, -1)}
                disabled={index === 0}
              >
                <ArrowUp className="size-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => moveLocation(index, 1)}
                disabled={index === journey.locations.length - 1}
              >
                <ArrowDown className="size-4" />
              </Button>
            </div>
            <LocationEditor location={location} onSaved={onChanged} onDeleted={onChanged} />
          </div>
        ))}
        <div className="flex items-center gap-2">
          <input
            className={cn(fieldClass, 'max-w-xs')}
            value={newLocationName}
            placeholder="Nom de la nouvelle location"
            onChange={(event) => setNewLocationName(event.target.value)}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={addLocation}
            disabled={busy || !newLocationName.trim()}
          >
            <Plus className="size-4" /> Ajouter
          </Button>
        </div>
      </div>
    </div>
  );
}

export function JourneysManager() {
  const [journeys, setJourneys] = useState<JourneyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [newSlug, setNewSlug] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    setError(null);
    try {
      const payload = await api<{ journeys: JourneyRecord[] }>('/api/admin/journeys');
      setJourneys(payload.journeys);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const seed = async () => {
    setBusy(true);
    setError(null);
    try {
      await api('/api/admin/seed', { method: 'POST' });
      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Seed impossible');
    } finally {
      setBusy(false);
    }
  };

  const createJourney = async () => {
    if (!newSlug.trim() || !newTitle.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await api('/api/admin/journeys', {
        method: 'POST',
        body: JSON.stringify({
          slug: newSlug.trim(),
          title: newTitle.trim(),
          position: journeys.length,
        }),
      });
      setNewSlug('');
      setNewTitle('');
      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Création impossible');
    } finally {
      setBusy(false);
    }
  };

  const removeJourney = async (id: number) => {
    setBusy(true);
    setError(null);
    try {
      await api(`/api/admin/journeys/${id}`, { method: 'DELETE' });
      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Suppression impossible');
    } finally {
      setBusy(false);
    }
  };

  const moveJourney = async (index: number, direction: -1 | 1) => {
    const ordered = journeys.map((journey) => journey.id);
    const target = index + direction;
    if (target < 0 || target >= ordered.length) return;
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    await api('/api/admin/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ entity: 'journeys', orderedIds: ordered }),
    });
    await reload();
  };

  return (
    <main className="min-h-screen bg-[#0d0a07] px-6 py-24 text-white">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.4em] text-[#f4bb52]">Dashboard</p>
          <h1 className="font-display text-3xl uppercase tracking-[0.2em]">Journeys CMS</h1>
          <p className="text-sm text-white/60">
            Créer et éditer les voyages & locations : textes, médias (URLs), dates, ordre
            d&apos;affichage.{' '}
            <Link href="/admin" className="underline underline-offset-4">
              ← Retour admin
            </Link>
          </p>
        </header>

        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-[0.3em]">Actions</CardTitle>
            <CardDescription className="text-white/50">
              Le seed importe les voyages actuellement codés en dur (ré-exécutable, upsert par
              slug).
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Button size="sm" variant="outline" onClick={seed} disabled={busy}>
              <RefreshCw className="size-4" /> Seed depuis le contenu du site
            </Button>
            <input
              className={cn(fieldClass, 'max-w-[160px]')}
              value={newSlug}
              placeholder="slug"
              onChange={(event) => setNewSlug(event.target.value)}
            />
            <input
              className={cn(fieldClass, 'max-w-[200px]')}
              value={newTitle}
              placeholder="Titre"
              onChange={(event) => setNewTitle(event.target.value)}
            />
            <Button
              size="sm"
              onClick={createJourney}
              disabled={busy || !newSlug.trim() || !newTitle.trim()}
            >
              <Plus className="size-4" /> Nouveau voyage
            </Button>
          </CardContent>
        </Card>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        {loading ? <p className="text-sm text-white/50">Chargement…</p> : null}

        <div className="space-y-4">
          {journeys.map((journey, index) => (
            <Card key={journey.id} className="border-white/10 bg-white/5 text-white">
              <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                <button
                  type="button"
                  className="flex flex-1 items-center gap-3 text-left"
                  onClick={() =>
                    setExpandedId((current) => (current === journey.id ? null : journey.id))
                  }
                >
                  {expandedId === journey.id ? (
                    <ChevronDown className="size-4 text-white/50" />
                  ) : (
                    <ChevronRight className="size-4 text-white/50" />
                  )}
                  <span className="font-display text-sm uppercase tracking-[0.25em]">
                    {journey.title}
                  </span>
                  <span className="text-xs text-white/40">/{journey.slug}</span>
                  <span className="text-xs text-white/40">{journey.season}</span>
                </button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => moveJourney(index, -1)}
                  disabled={index === 0}
                >
                  <ArrowUp className="size-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => moveJourney(index, 1)}
                  disabled={index === journeys.length - 1}
                >
                  <ArrowDown className="size-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeJourney(journey.id)}
                  disabled={busy}
                >
                  <Trash2 className="size-4" />
                </Button>
              </CardHeader>
              {expandedId === journey.id ? (
                <JourneyEditor journey={journey} onChanged={reload} />
              ) : null}
            </Card>
          ))}
          {!loading && journeys.length === 0 ? (
            <p className="text-sm text-white/50">
              Aucun voyage en base — lance le seed pour importer le contenu actuel du site.
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
