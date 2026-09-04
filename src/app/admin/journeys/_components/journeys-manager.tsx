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
import type { JourneySeason } from '@/types/journey';

import { MediaUploadField } from '../../_components/media-upload-field';

type LocationMedia = {
  url: string;
  type: 'image' | 'video';
  alt?: string;
};

type SeasonVisual = {
  image?: string;
  backgroundVideo?: string;
};

type LocationRecord = {
  id: number;
  journeyId: number;
  name: string;
  subtitle: string | null;
  leftTitle: string[];
  narrative: string;
  image: string | null;
  video: string | null;
  media: LocationMedia[];
  position: number;
  published: boolean;
};

type JourneyRecord = {
  id: number;
  slug: string;
  title: string;
  season: string;
  seasonTags: JourneySeason[];
  seasonVisuals: Partial<Record<JourneySeason, SeasonVisual>>;
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
type EditableLocationMedia = LocationMedia & { editorId: string };
type LocationDraft = Partial<Omit<LocationRecord, 'id' | 'journeyId' | 'media'>> & {
  leftTitleText: string;
  media: EditableLocationMedia[];
};
type EditorActivity = { dirty: boolean; uploading: boolean };

const EMPTY_ACTIVITY: EditorActivity = { dirty: false, uploading: false };

const SEASONS: { value: JourneySeason; label: string }[] = [
  { value: 'spring-summer', label: 'Spring Summer' },
  { value: 'fall-winter', label: 'Fall Winter' },
];

function createLocationDraft(location: LocationRecord): LocationDraft {
  return {
    name: location.name,
    subtitle: location.subtitle ?? '',
    leftTitleText: location.leftTitle.join('\n'),
    narrative: location.narrative,
    image: location.image ?? '',
    video: location.video ?? '',
    media: (location.media ?? []).map((item, index) => ({
      ...item,
      editorId: `saved-${location.id}-${index}`,
    })),
    published: location.published,
  };
}

function createMediaEditorId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `media-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function useUploadTracker() {
  const [uploadingKeys, setUploadingKeys] = useState<Set<string>>(() => new Set());
  const setUploadState = useCallback((key: string, uploading: boolean) => {
    setUploadingKeys((current) => {
      const next = new Set(current);
      if (uploading) next.add(key);
      else next.delete(key);
      return next;
    });
  }, []);

  return { uploadingKeys, setUploadState, uploading: uploadingKeys.size > 0 };
}

function useDraftNavigationGuard(shouldBlock: boolean) {
  useEffect(() => {
    if (!shouldBlock) return;

    const message =
      'Tu as des modifications non enregistrées ou un fichier en cours d’envoi. Quitter cette page les perdra.';
    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    const guardAdminLink = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const control =
        event.target instanceof Element ? event.target.closest('a[href], button') : null;
      if (control instanceof HTMLButtonElement) {
        if (control.getAttribute('aria-label') !== 'Se déconnecter de l’Espace Bee') return;
      } else if (control instanceof HTMLAnchorElement) {
        const rawHref = control.getAttribute('href');
        if (!rawHref || rawHref.startsWith('#') || control.target === '_blank') return;
        const nextUrl = new URL(control.href, window.location.href);
        if (nextUrl.origin !== window.location.origin || nextUrl.href === window.location.href)
          return;
      } else {
        return;
      }
      if (window.confirm(message)) return;
      event.preventDefault();
      event.stopPropagation();
    };

    window.addEventListener('beforeunload', beforeUnload);
    document.addEventListener('click', guardAdminLink, true);
    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
      document.removeEventListener('click', guardAdminLink, true);
    };
  }, [shouldBlock]);
}

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
  'min-h-11 w-full rounded-none border border-white/15 bg-white/5 px-3 py-2 text-base text-white outline-none transition-colors focus-visible:border-[#f4bb52] focus-visible:ring-2 focus-visible:ring-[#f4bb52]/30 disabled:cursor-not-allowed disabled:opacity-55 sm:text-sm';
const labelClass = 'mb-1 block text-xs uppercase tracking-[0.22em] text-white/65';

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea = false,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  textarea?: boolean;
  disabled?: boolean;
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
          disabled={disabled}
        />
      ) : (
        <input
          className={fieldClass}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
        />
      )}
    </label>
  );
}

function LocationEditor({
  location,
  onSaved,
  onDeleted,
  onActivityChange,
}: {
  location: LocationRecord;
  onSaved: () => void | Promise<void>;
  onDeleted: () => void | Promise<void>;
  onActivityChange: (locationId: number, activity: EditorActivity) => void;
}) {
  const [draft, setDraft] = useState<LocationDraft>(() => createLocationDraft(location));
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const { uploadingKeys, setUploadState, uploading } = useUploadTracker();

  const updateDraft = (updater: (current: LocationDraft) => LocationDraft) => {
    setDraft(updater);
    setDirty(true);
    setNotice(null);
  };

  useEffect(() => {
    onActivityChange(location.id, { dirty, uploading });
  }, [dirty, location.id, onActivityChange, uploading]);

  useEffect(() => {
    return () => onActivityChange(location.id, EMPTY_ACTIVITY);
  }, [location.id, onActivityChange]);

  const save = async () => {
    const incompleteMedia = draft.media.find((item) => !item.url.trim());
    if (incompleteMedia) {
      setError('Ajoute un fichier dans chaque ligne de galerie, ou supprime la ligne vide.');
      return;
    }
    if (uploading) {
      setError('Attends la fin de l’envoi du fichier avant d’enregistrer.');
      return;
    }

    setBusy(true);
    setError(null);
    setNotice(null);
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
          media: draft.media.map(({ url, type, alt }) => ({
            url: url.trim(),
            type,
            alt: alt?.trim() || undefined,
          })),
          published: draft.published ?? false,
        }),
      });
      await onSaved();
      setDirty(false);
      setNotice('Location enregistrée.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erreur');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    const confirmed = window.confirm(
      `Supprimer définitivement la Location « ${location.name} » ? Cette action est irréversible.`
    );
    if (!confirmed) return;
    setBusy(true);
    setError(null);
    try {
      await api(`/api/admin/locations/${location.id}`, { method: 'DELETE' });
      await onDeleted();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erreur');
      setBusy(false);
    }
  };

  return (
    <fieldset disabled={busy} className="min-w-0 space-y-3 border border-white/10 bg-black/20 p-4">
      <div className="grid gap-3 md:grid-cols-2">
        <Field
          label="Nom"
          value={draft.name ?? ''}
          onChange={(name) => updateDraft((current) => ({ ...current, name }))}
        />
        <Field
          label="Sous-titre"
          value={draft.subtitle ?? ''}
          onChange={(subtitle) => updateDraft((current) => ({ ...current, subtitle }))}
        />
        <MediaUploadField
          label="Image principale"
          value={draft.image ?? ''}
          onChange={(image) => updateDraft((current) => ({ ...current, image }))}
          disabled={busy}
          onBusyChange={(active) => setUploadState('location-image', active)}
        />
        <MediaUploadField
          label="Vidéo principale"
          kind="video"
          value={draft.video ?? ''}
          onChange={(video) => updateDraft((current) => ({ ...current, video }))}
          disabled={busy}
          onBusyChange={(active) => setUploadState('location-video', active)}
        />
      </div>
      <Field
        label="Titre gauche (1 ligne par entrée)"
        value={draft.leftTitleText ?? ''}
        onChange={(leftTitleText) => updateDraft((current) => ({ ...current, leftTitleText }))}
        textarea
      />
      <Field
        label="Texte du Tale"
        value={draft.narrative ?? ''}
        onChange={(narrative) => updateDraft((current) => ({ ...current, narrative }))}
        textarea
      />
      <div className="space-y-3 border-t border-white/10 pt-4">
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">Galerie du Tale</p>
            <p className="mt-1 text-xs text-white/45">
              La première image sert de grand visuel dans le Tale.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            type="button"
            className="min-h-11 w-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white sm:w-auto"
            onClick={() =>
              updateDraft((current) => ({
                ...current,
                media: [
                  ...current.media,
                  { editorId: createMediaEditorId(), url: '', type: 'image', alt: '' },
                ],
              }))
            }
          >
            <Plus className="size-4" /> Ajouter un média
          </Button>
        </div>
        {(draft.media ?? []).map((media, index) => (
          <div
            key={media.editorId}
            className="grid gap-2 border border-white/10 bg-white/[0.03] p-3 md:grid-cols-[130px_1fr_1fr_auto]"
          >
            <label className="block">
              <span className={labelClass}>Type</span>
              <select
                className={fieldClass}
                value={media.type}
                disabled={busy || uploadingKeys.has(`media-${media.editorId}`)}
                onChange={(event) => {
                  const nextType = event.target.value as LocationMedia['type'];
                  if (
                    media.url &&
                    !window.confirm(
                      'Changer le type retirera le fichier actuel de cette ligne. Continuer ?'
                    )
                  ) {
                    return;
                  }
                  updateDraft((current) => ({
                    ...current,
                    media: current.media.map((item) =>
                      item.editorId === media.editorId ? { ...item, type: nextType, url: '' } : item
                    ),
                  }));
                }}
              >
                <option value="image">Image</option>
                <option value="video">Vidéo</option>
              </select>
            </label>
            <MediaUploadField
              label={`Fichier ${index + 1}`}
              kind={media.type}
              value={media.url}
              disabled={busy}
              onBusyChange={(active) => setUploadState(`media-${media.editorId}`, active)}
              onChange={(url) =>
                updateDraft((current) => ({
                  ...current,
                  media: current.media.map((item) =>
                    item.editorId === media.editorId ? { ...item, url } : item
                  ),
                }))
              }
            />
            <Field
              label="Texte alternatif"
              value={media.alt ?? ''}
              onChange={(alt) =>
                updateDraft((current) => ({
                  ...current,
                  media: current.media.map((item) =>
                    item.editorId === media.editorId ? { ...item, alt } : item
                  ),
                }))
              }
              placeholder="Description du visuel"
            />
            <Button
              size="sm"
              variant="ghost"
              type="button"
              className="min-h-11 min-w-11 self-end"
              aria-label={`Supprimer le média ${index + 1}`}
              disabled={busy || uploadingKeys.has(`media-${media.editorId}`)}
              onClick={() =>
                updateDraft((current) => ({
                  ...current,
                  media: current.media.filter((item) => item.editorId !== media.editorId),
                }))
              }
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        {draft.media.length === 0 ? (
          <p className="text-xs text-white/35">Aucun média de galerie pour le moment.</p>
        ) : null}
      </div>
      <label className="flex min-h-11 items-center gap-3 text-sm text-white/70">
        <input
          type="checkbox"
          checked={draft.published ?? false}
          onChange={(event) =>
            updateDraft((current) => ({ ...current, published: event.target.checked }))
          }
          className="size-4 accent-[#f4bb52]"
        />
        Visible sur la page Journey
      </label>
      {uploading ? (
        <p className="text-xs text-[#f4bb52]" role="status">
          Un fichier est en cours d’envoi. Attends avant d’enregistrer.
        </p>
      ) : null}
      {dirty && !uploading ? (
        <p className="text-xs text-[#f4bb52]" role="status">
          Modifications non enregistrées.
        </p>
      ) : null}
      {error ? (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="text-xs text-emerald-300" role="status">
          {notice}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          className="min-h-11"
          size="sm"
          onClick={save}
          disabled={busy || uploading || !dirty}
        >
          {busy ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
        <Button
          className="min-h-11"
          size="sm"
          variant="ghost"
          onClick={remove}
          disabled={busy || uploading}
        >
          <Trash2 className="size-4" /> Supprimer
        </Button>
      </div>
    </fieldset>
  );
}

function JourneyEditor({
  journey,
  onChanged,
  onActivityChange,
}: {
  journey: JourneyRecord;
  onChanged: () => void | Promise<void>;
  onActivityChange: (journeyId: number, activity: EditorActivity) => void;
}) {
  const [draft, setDraft] = useState<JourneyDraft>({
    slug: journey.slug,
    title: journey.title,
    season: journey.season,
    seasonTags:
      journey.seasonTags?.length > 0
        ? journey.seasonTags
        : [(journey.season as JourneySeason) || 'spring-summer'],
    seasonVisuals: journey.seasonVisuals ?? {},
    dateLabel: journey.dateLabel,
    dateFrom: journey.dateFrom ?? '',
    dateTo: journey.dateTo ?? '',
    location: journey.location,
    image: journey.image,
    backgroundVideo: journey.backgroundVideo ?? '',
    sustainablePdf: journey.sustainablePdf ?? '',
    published: journey.published,
  });
  const [dirty, setDirty] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [locationActivities, setLocationActivities] = useState<Record<number, EditorActivity>>({});
  const { setUploadState, uploading } = useUploadTracker();
  const locationDirty = Object.values(locationActivities).some((activity) => activity.dirty);
  const locationUploading = Object.values(locationActivities).some(
    (activity) => activity.uploading
  );
  const hasUnsavedChanges = dirty || locationDirty || Boolean(newLocationName.trim());
  const hasActiveUpload = uploading || locationUploading;

  const updateDraft = (updater: (current: JourneyDraft) => JourneyDraft) => {
    setDraft(updater);
    setDirty(true);
    setNotice(null);
  };

  const updateLocationActivity = useCallback((locationId: number, activity: EditorActivity) => {
    setLocationActivities((current) => {
      const previous = current[locationId] ?? EMPTY_ACTIVITY;
      if (previous.dirty === activity.dirty && previous.uploading === activity.uploading) {
        return current;
      }
      return { ...current, [locationId]: activity };
    });
  }, []);

  useEffect(() => {
    onActivityChange(journey.id, {
      dirty: hasUnsavedChanges,
      uploading: hasActiveUpload,
    });
  }, [hasActiveUpload, hasUnsavedChanges, journey.id, onActivityChange]);

  useEffect(() => {
    return () => onActivityChange(journey.id, EMPTY_ACTIVITY);
  }, [journey.id, onActivityChange]);

  const toggleSeason = (season: JourneySeason) => {
    updateDraft((current) => {
      const selected = current.seasonTags ?? [];
      if (selected.includes(season)) {
        if (selected.length === 1) return current;
        return { ...current, seasonTags: selected.filter((item) => item !== season) };
      }
      return { ...current, seasonTags: [...selected, season] };
    });
  };

  const updateSeasonVisual = (season: JourneySeason, field: keyof SeasonVisual, value: string) => {
    updateDraft((current) => ({
      ...current,
      seasonVisuals: {
        ...(current.seasonVisuals ?? {}),
        [season]: {
          ...(current.seasonVisuals?.[season] ?? {}),
          [field]: value,
        },
      },
    }));
  };

  const save = async () => {
    if (uploading) {
      setError('Attends la fin de l’envoi du fichier avant d’enregistrer.');
      return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const seasonTags =
        draft.seasonTags && draft.seasonTags.length > 0
          ? draft.seasonTags
          : (['spring-summer'] as JourneySeason[]);
      const primarySeason = seasonTags.includes(draft.season as JourneySeason)
        ? draft.season
        : seasonTags[0];
      const seasonVisuals = Object.fromEntries(
        seasonTags.map((season) => [
          season,
          {
            image: draft.seasonVisuals?.[season]?.image?.trim() || undefined,
            backgroundVideo: draft.seasonVisuals?.[season]?.backgroundVideo?.trim() || undefined,
          },
        ])
      );
      await api(`/api/admin/journeys/${journey.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          slug: draft.slug,
          title: draft.title,
          season: primarySeason,
          seasonTags,
          seasonVisuals,
          dateLabel: draft.dateLabel,
          dateFrom: draft.dateFrom || null,
          dateTo: draft.dateTo || null,
          location: draft.location,
          image: draft.image,
          backgroundVideo: draft.backgroundVideo || null,
          sustainablePdf: draft.sustainablePdf || null,
          published: draft.published ?? false,
        }),
      });
      await onChanged();
      setDirty(false);
      setNotice('Voyage enregistré.');
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
        body: JSON.stringify({
          name: newLocationName.trim(),
          position: journey.locations.length,
          published: false,
        }),
      });
      setNewLocationName('');
      await onChanged();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erreur');
    } finally {
      setBusy(false);
    }
  };

  const moveLocation = async (index: number, direction: -1 | 1) => {
    if (hasUnsavedChanges || hasActiveUpload) {
      setError('Enregistre d’abord tes modifications avant de changer l’ordre.');
      return;
    }
    const ordered = [...journey.locations].map((location) => location.id);
    const target = index + direction;
    if (target < 0 || target >= ordered.length) return;
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    setBusy(true);
    setError(null);
    try {
      await api('/api/admin/reorder', {
        method: 'PATCH',
        body: JSON.stringify({ entity: 'locations', orderedIds: ordered }),
      });
      await onChanged();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Impossible de changer l’ordre.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <fieldset
      id={`journey-editor-${journey.id}`}
      disabled={busy}
      className="min-w-0 space-y-5 border-t border-white/10 p-4 sm:p-5"
    >
      <div className="grid gap-3 md:grid-cols-2">
        <Field
          label="Slug"
          value={draft.slug ?? ''}
          onChange={(slug) => updateDraft((current) => ({ ...current, slug }))}
        />
        <Field
          label="Titre"
          value={draft.title ?? ''}
          onChange={(title) => updateDraft((current) => ({ ...current, title }))}
        />
        <Field
          label="Lieu"
          value={draft.location ?? ''}
          onChange={(location) => updateDraft((current) => ({ ...current, location }))}
        />
        <Field
          label="Libellé de dates"
          value={draft.dateLabel ?? ''}
          onChange={(dateLabel) => updateDraft((current) => ({ ...current, dateLabel }))}
          placeholder="From 1st May to 30th September"
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field
            label="From"
            value={draft.dateFrom ?? ''}
            onChange={(dateFrom) => updateDraft((current) => ({ ...current, dateFrom }))}
          />
          <Field
            label="To"
            value={draft.dateTo ?? ''}
            onChange={(dateTo) => updateDraft((current) => ({ ...current, dateTo }))}
          />
        </div>
        <MediaUploadField
          label="Image par défaut"
          value={draft.image ?? ''}
          onChange={(image) => updateDraft((current) => ({ ...current, image }))}
          help="Utilisée si une saison n’a pas encore son propre visuel."
          disabled={busy}
          onBusyChange={(active) => setUploadState('journey-image', active)}
        />
        <MediaUploadField
          label="Vidéo de fond par défaut"
          kind="video"
          value={draft.backgroundVideo ?? ''}
          onChange={(backgroundVideo) =>
            updateDraft((current) => ({ ...current, backgroundVideo }))
          }
          help="Utilisée si une saison n’a pas encore son propre fond."
          disabled={busy}
          onBusyChange={(active) => setUploadState('journey-background-video', active)}
        />
        <MediaUploadField
          label="PDF Sustainable Impact"
          kind="document"
          value={draft.sustainablePdf ?? ''}
          onChange={(sustainablePdf) => updateDraft((current) => ({ ...current, sustainablePdf }))}
          disabled={busy}
          onBusyChange={(active) => setUploadState('journey-sustainable-pdf', active)}
        />
      </div>
      <section className="space-y-4 border border-[#f4bb52]/25 bg-[#f4bb52]/[0.04] p-4">
        <div>
          <h4 className="text-[11px] uppercase tracking-[0.3em] text-[#f4bb52]">
            Saisons et miniatures
          </h4>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-white/55">
            Coche les saisons où ce Journey doit apparaître. Le site choisira automatiquement la
            bonne miniature et le bon fond selon le filtre Spring Summer ou Fall Winter.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {SEASONS.map((season) => {
            const selected = (draft.seasonTags ?? []).includes(season.value);
            return (
              <button
                key={season.value}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleSeason(season.value)}
                className={cn(
                  'min-h-11 border px-4 py-2 text-xs uppercase tracking-[0.2em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4bb52]',
                  selected
                    ? 'border-[#f4bb52] bg-[#f4bb52] text-black'
                    : 'border-white/15 bg-white/5 text-white/55 hover:border-white/35'
                )}
              >
                {selected ? '✓ ' : ''}
                {season.label}
              </button>
            );
          })}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {SEASONS.filter((season) => (draft.seasonTags ?? []).includes(season.value)).map(
            (season) => (
              <div key={season.value} className="space-y-3 border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/75">{season.label}</p>
                <MediaUploadField
                  label={`Miniature ${season.label}`}
                  value={draft.seasonVisuals?.[season.value]?.image ?? ''}
                  onChange={(value) => updateSeasonVisual(season.value, 'image', value)}
                  disabled={busy}
                  onBusyChange={(active) => setUploadState(`${season.value}-image`, active)}
                />
                <MediaUploadField
                  label={`Vidéo de fond ${season.label}`}
                  kind="video"
                  value={draft.seasonVisuals?.[season.value]?.backgroundVideo ?? ''}
                  onChange={(value) => updateSeasonVisual(season.value, 'backgroundVideo', value)}
                  disabled={busy}
                  onBusyChange={(active) =>
                    setUploadState(`${season.value}-background-video`, active)
                  }
                />
              </div>
            )
          )}
        </div>
      </section>
      <label className="flex min-h-11 items-center gap-3 text-sm text-white/70">
        <input
          type="checkbox"
          checked={draft.published ?? false}
          onChange={(event) =>
            updateDraft((current) => ({ ...current, published: event.target.checked }))
          }
          className="size-4 accent-[#f4bb52]"
        />
        Voyage visible sur le site
      </label>
      <p className="text-xs leading-relaxed text-white/45">
        Les changements d’un voyage déjà visible apparaissent après « Enregistrer le voyage ».
        Décoche cette case avant une grosse modification si tu préfères le cacher temporairement.
      </p>
      {uploading ? (
        <p className="text-xs text-[#f4bb52]" role="status">
          Un fichier du voyage est en cours d’envoi. Attends avant d’enregistrer.
        </p>
      ) : null}
      {dirty && !uploading ? (
        <p className="text-xs text-[#f4bb52]" role="status">
          Modifications du voyage non enregistrées.
        </p>
      ) : null}
      {error ? (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="text-xs text-emerald-300" role="status">
          {notice}
        </p>
      ) : null}
      <Button className="min-h-11" size="sm" onClick={save} disabled={busy || uploading || !dirty}>
        {busy ? 'Enregistrement…' : 'Enregistrer le voyage'}
      </Button>

      <div className="space-y-3">
        <div>
          <h4 className="text-[11px] uppercase tracking-[0.3em] text-white/60">
            Locations / Tales ({journey.locations.length})
          </h4>
          <p className="mt-2 text-xs leading-relaxed text-white/45">
            Chaque Location contient sa carte et son Tale : titre, texte, visuels, vidéo et galerie.
            Enregistre la Location puis active « Visible sur la page Journey ».
          </p>
        </div>
        {journey.locations.map((location, index) => (
          <div key={location.id} className="space-y-2">
            <div className="flex min-w-0 items-center gap-2 text-sm text-white/80">
              <span className="min-w-0 flex-1">
                {index + 1}. {location.name}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => moveLocation(index, -1)}
                disabled={busy || hasUnsavedChanges || hasActiveUpload || index === 0}
                className="min-h-11 min-w-11"
                aria-label={`Monter ${location.name}`}
              >
                <ArrowUp className="size-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => moveLocation(index, 1)}
                disabled={
                  busy ||
                  hasUnsavedChanges ||
                  hasActiveUpload ||
                  index === journey.locations.length - 1
                }
                className="min-h-11 min-w-11"
                aria-label={`Descendre ${location.name}`}
              >
                <ArrowDown className="size-4" />
              </Button>
            </div>
            <LocationEditor
              location={location}
              onSaved={onChanged}
              onDeleted={onChanged}
              onActivityChange={updateLocationActivity}
            />
          </div>
        ))}
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-end">
          <label className="min-w-0 flex-1">
            <span className={labelClass}>Nom de la nouvelle Location / Tale</span>
            <input
              className={fieldClass}
              value={newLocationName}
              placeholder="Nom de la nouvelle Location / Tale"
              onChange={(event) => {
                setNewLocationName(event.target.value);
                setNotice(null);
              }}
            />
          </label>
          <Button
            size="sm"
            variant="outline"
            className="min-h-11 w-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white sm:w-auto"
            onClick={addLocation}
            disabled={busy || hasActiveUpload || !newLocationName.trim()}
          >
            <Plus className="size-4" /> Ajouter
          </Button>
        </div>
      </div>
    </fieldset>
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
  const [notice, setNotice] = useState<string | null>(null);
  const [activeEditorActivity, setActiveEditorActivity] = useState<
    EditorActivity & { journeyId: number | null }
  >({ ...EMPTY_ACTIVITY, journeyId: null });
  const createDraftDirty = Boolean(newSlug.trim() || newTitle.trim());
  const hasBlockingDraft =
    createDraftDirty || activeEditorActivity.dirty || activeEditorActivity.uploading;

  useDraftNavigationGuard(hasBlockingDraft);

  const updateEditorActivity = useCallback((journeyId: number, activity: EditorActivity) => {
    setActiveEditorActivity((current) => {
      if (
        current.journeyId === journeyId &&
        current.dirty === activity.dirty &&
        current.uploading === activity.uploading
      ) {
        return current;
      }
      return { journeyId, ...activity };
    });
  }, []);

  const confirmDiscardDraft = (includeCreateDraft = true) => {
    const hasDraftToDiscard =
      activeEditorActivity.dirty ||
      activeEditorActivity.uploading ||
      (includeCreateDraft && createDraftDirty);
    if (!hasDraftToDiscard) return true;
    return window.confirm(
      activeEditorActivity.uploading
        ? 'Un fichier est encore en cours d’envoi. Quitter cet éditeur annulera cet envoi. Continuer ?'
        : 'Tu as des modifications non enregistrées. Les abandonner ?'
    );
  };

  const toggleJourney = (journeyId: number) => {
    if (expandedId !== null && !confirmDiscardDraft(false)) return;
    setActiveEditorActivity({ ...EMPTY_ACTIVITY, journeyId: null });
    setExpandedId((current) => (current === journeyId ? null : journeyId));
  };

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
    if (activeEditorActivity.uploading) {
      setError('Attends la fin de l’envoi du fichier avant cette opération.');
      return;
    }
    if (hasBlockingDraft && !confirmDiscardDraft()) return;
    const confirmation = window.prompt(
      'Cette action peut écraser des dates et des contenus déjà modifiés. Pour confirmer, écris exactement REINITIALISER.'
    );
    if (confirmation !== 'REINITIALISER') {
      if (confirmation !== null)
        setError('Réinitialisation annulée : le mot saisi était différent.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api('/api/admin/seed', { method: 'POST' });
      setExpandedId(null);
      setActiveEditorActivity({ ...EMPTY_ACTIVITY, journeyId: null });
      setNewSlug('');
      setNewTitle('');
      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Seed impossible');
    } finally {
      setBusy(false);
    }
  };

  const seedLocations = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const result = await api<{ seededJourneys: number; seededLocations: number }>(
        '/api/admin/locations/seed',
        { method: 'POST' }
      );
      setNotice(
        result.seededLocations > 0
          ? `${result.seededLocations} Locations / Tales importés dans ${result.seededJourneys} Journeys.`
          : 'Tous les Tales existants sont déjà importés. Aucun contenu n’a été écrasé.'
      );
      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Import des Tales impossible');
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
    const journey = journeys.find((item) => item.id === id);
    const confirmed = window.confirm(
      `Supprimer définitivement le voyage « ${journey?.title ?? 'sans titre'} » et toutes ses Locations ? Cette action est irréversible.`
    );
    if (!confirmed) return;
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
    if (hasBlockingDraft) {
      setError('Enregistre d’abord tes modifications avant de changer l’ordre.');
      return;
    }
    const ordered = journeys.map((journey) => journey.id);
    const target = index + direction;
    if (target < 0 || target >= ordered.length) return;
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    setBusy(true);
    setError(null);
    try {
      await api('/api/admin/reorder', {
        method: 'PATCH',
        body: JSON.stringify({ entity: 'journeys', orderedIds: ordered }),
      });
      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Impossible de changer l’ordre.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0d0a07] px-4 pb-24 pt-36 text-white sm:px-6 sm:pt-24">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.4em] text-[#f4bb52]">Dashboard</p>
          <h1 className="font-display text-3xl uppercase tracking-[0.2em]">Journeys CMS</h1>
          <p className="text-sm text-white/60">
            Créer et éditer les voyages & locations : textes, médias (URLs), dates, ordre
            d&apos;affichage.{' '}
            <Link
              href="/admin"
              className="inline-flex min-h-11 items-center rounded-sm underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a24a] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              ← Retour admin
            </Link>
          </p>
        </header>

        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-[0.3em]">Actions</CardTitle>
            <CardDescription className="text-white/50">
              L’import des Tales complète uniquement les Journeys vides. Il ne modifie ni tes dates,
              ni les Locations déjà éditées.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-end">
              <Button
                className="min-h-11 w-full sm:w-auto"
                size="sm"
                onClick={seedLocations}
                disabled={busy || hasBlockingDraft}
              >
                <RefreshCw className="size-4" /> Importer les Tales existants
              </Button>
              <label className="min-w-0 flex-1 sm:max-w-[180px]">
                <span className={labelClass}>Adresse courte du voyage</span>
                <input
                  className={fieldClass}
                  value={newSlug}
                  placeholder="exemple-portugal"
                  disabled={busy}
                  onChange={(event) => setNewSlug(event.target.value)}
                />
              </label>
              <label className="min-w-0 flex-1 sm:max-w-[240px]">
                <span className={labelClass}>Titre du nouveau voyage</span>
                <input
                  className={fieldClass}
                  value={newTitle}
                  placeholder="Portugal"
                  disabled={busy}
                  onChange={(event) => setNewTitle(event.target.value)}
                />
              </label>
              <Button
                className="min-h-11 w-full sm:w-auto"
                size="sm"
                onClick={createJourney}
                disabled={busy || !newSlug.trim() || !newTitle.trim()}
              >
                <Plus className="size-4" /> Nouveau voyage
              </Button>
            </div>

            <details className="border-t border-white/10 pt-3 text-sm text-white/65">
              <summary className="flex min-h-11 cursor-pointer items-center outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-[#f4bb52]">
                Maintenance avancée
              </summary>
              <div className="space-y-3 border-l-2 border-red-400/50 pl-3">
                <p className="text-xs leading-5 text-white/60">
                  À utiliser seulement pour repartir du contenu du site. Des dates et des textes
                  déjà modifiés peuvent être remplacés.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-auto min-h-11 w-full whitespace-normal border-red-300/50 bg-transparent py-3 text-center text-red-200 hover:bg-red-400/10 hover:text-red-100 sm:w-auto"
                  onClick={seed}
                  disabled={busy || activeEditorActivity.uploading}
                >
                  <RefreshCw className="size-4" /> Réinitialiser les voyages depuis le site
                </Button>
              </div>
            </details>
          </CardContent>
        </Card>

        {hasBlockingDraft ? (
          <p className="text-sm text-[#f4bb52]" role="status">
            {activeEditorActivity.uploading
              ? 'Un fichier est en cours d’envoi.'
              : 'Modifications non enregistrées.'}
          </p>
        ) : null}
        {error ? (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p className="text-sm text-emerald-300" role="status">
            {notice}
          </p>
        ) : null}
        {loading ? (
          <p className="text-sm text-white/50" role="status">
            Chargement…
          </p>
        ) : null}

        <div className="space-y-4">
          {journeys.map((journey, index) => (
            <Card key={journey.id} className="border-white/10 bg-white/5 text-white">
              <CardHeader className="flex flex-row flex-wrap items-center gap-2 space-y-0 sm:gap-3">
                <button
                  type="button"
                  className="flex min-h-11 min-w-0 flex-[1_1_220px] items-center gap-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#f4bb52]"
                  onClick={() => toggleJourney(journey.id)}
                  aria-expanded={expandedId === journey.id}
                  aria-controls={`journey-editor-${journey.id}`}
                >
                  {expandedId === journey.id ? (
                    <ChevronDown className="size-4 text-white/50" />
                  ) : (
                    <ChevronRight className="size-4 text-white/50" />
                  )}
                  <span className="font-display text-sm uppercase tracking-[0.25em]">
                    {journey.title}
                  </span>
                  <span className="hidden text-xs text-white/40 sm:inline">/{journey.slug}</span>
                  <span className="hidden text-xs text-white/40 md:inline">
                    {(journey.seasonTags?.length ? journey.seasonTags : [journey.season]).join(
                      ' + '
                    )}
                  </span>
                </button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => moveJourney(index, -1)}
                  disabled={busy || hasBlockingDraft || index === 0}
                  className="min-h-11 min-w-11"
                  aria-label={`Monter le voyage ${journey.title}`}
                >
                  <ArrowUp className="size-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => moveJourney(index, 1)}
                  disabled={busy || hasBlockingDraft || index === journeys.length - 1}
                  className="min-h-11 min-w-11"
                  aria-label={`Descendre le voyage ${journey.title}`}
                >
                  <ArrowDown className="size-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeJourney(journey.id)}
                  disabled={busy || activeEditorActivity.uploading}
                  className="min-h-11 min-w-11"
                  aria-label={`Supprimer le voyage ${journey.title}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              </CardHeader>
              {expandedId === journey.id ? (
                <JourneyEditor
                  journey={journey}
                  onChanged={reload}
                  onActivityChange={updateEditorActivity}
                />
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
