'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  BookOpenText,
  Check,
  CheckCircle2,
  ExternalLink,
  GalleryHorizontalEnd,
  ImageIcon,
  LoaderCircle,
  Plus,
  RefreshCw,
  Save,
  Send,
  Trash2,
  Video,
} from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';

import { MediaUploadField } from '@/app/admin/_components/media-upload-field';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { CampaignShowcase, ShowcaseMedia } from '@/data/showcases';
import type {
  CampaignEditorContent,
  CampaignEditorDocument,
  CampaignTaleContent,
} from '@/types/editorial-content';

type EditorSection = 'information' | 'texts' | 'format' | 'media' | 'listing';
type Feedback = { tone: 'success' | 'error' | 'info'; message: string };

const EDITOR_SECTIONS: Array<{
  id: EditorSection;
  step: string;
  label: string;
  description: string;
}> = [
  {
    id: 'information',
    step: '1',
    label: 'Informations',
    description: 'Nom, destination, saison et année',
  },
  {
    id: 'texts',
    step: '2',
    label: 'Textes',
    description: 'Résumé, histoire et crédits',
  },
  {
    id: 'format',
    step: '3',
    label: 'Format',
    description: 'Tale ou Gallery',
  },
  {
    id: 'media',
    step: '4',
    label: 'Médias',
    description: 'Images et vidéos dans leur ordre',
  },
  {
    id: 'listing',
    step: '5',
    label: 'Fiche campagne',
    description: 'Carte, logo et équipe',
  },
];

const inputClass =
  'min-h-11 w-full rounded-none border border-white/20 bg-white/[0.045] px-3 py-2.5 text-base text-white outline-none transition placeholder:text-white/30 hover:border-white/35 focus-visible:border-[#f4bb52] focus-visible:ring-2 focus-visible:ring-[#f4bb52]/25 sm:text-sm';
const textareaClass = cn(inputClass, 'min-h-28 resize-y leading-6');
const actionFocusClass =
  'outline-none focus-visible:ring-2 focus-visible:ring-[#f4bb52] focus-visible:ring-offset-2 focus-visible:ring-offset-[#17120e]';

const UploadBusyContext = createContext<(busy: boolean) => void>(() => undefined);

function CampaignMediaUploadField(props: ComponentProps<typeof MediaUploadField>) {
  const reportBusy = useContext(UploadBusyContext);

  return (
    <MediaUploadField
      {...props}
      onBusyChange={(busy) => {
        props.onBusyChange?.(busy);
        reportBusy(busy);
      }}
    />
  );
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function sameContent(left: CampaignEditorContent | null, right: CampaignEditorContent | null) {
  if (!left || !right) return left === right;
  return JSON.stringify(left) === JSON.stringify(right);
}

function formatDate(value: string | null) {
  if (!value) return 'Jamais publiée';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date inconnue';
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function publishIssues(content: CampaignEditorContent): string[] {
  const issues: string[] = [];
  const { showcase, listing, tale, format } = content;

  if (!showcase.title.trim()) issues.push('Ajoute le nom de la campagne.');
  if (!listing.client.trim()) issues.push('Ajoute le nom de la marque.');
  if (!showcase.destination.trim()) issues.push('Ajoute la destination.');
  if (!listing.country.trim()) issues.push('Ajoute le pays.');
  if (!listing.releaseWindow.trim()) issues.push('Ajoute la saison ou la période affichée.');
  if (!showcase.headline.trim()) issues.push('Ajoute le grand titre éditorial.');
  if (!showcase.summary.trim()) issues.push('Ajoute le résumé.');
  if (!showcase.hero.src.trim()) issues.push('Ajoute le média principal.');
  if (!showcase.hero.alt.trim()) issues.push('Décris le média principal.');
  if (!listing.thumbnail.src.trim()) issues.push('Ajoute l’image de la carte campagne.');
  if (!listing.thumbnail.alt.trim()) issues.push('Décris l’image de la carte campagne.');
  if (!listing.logo.src.trim()) issues.push('Ajoute le logo de la marque.');
  if (!listing.logo.alt.trim()) issues.push('Décris le logo de la marque.');

  const galleryWithoutSource = showcase.gallery.findIndex((item) => !item.src.trim());
  if (galleryWithoutSource >= 0) {
    issues.push(`Ajoute le fichier du média ${galleryWithoutSource + 1} ou retire ce bloc.`);
  }
  const imageWithoutAlt = showcase.gallery.findIndex(
    (item) => item.type === 'image' && !item.alt.trim()
  );
  if (imageWithoutAlt >= 0) {
    issues.push(`Décris l’image ${imageWithoutAlt + 1} de la galerie.`);
  }

  if (format === 'gallery' && showcase.gallery.length === 0) {
    issues.push('Ajoute au moins un média à la Gallery.');
  }
  if (format === 'tale') {
    if (!tale.title.trim()) issues.push('Ajoute le titre du Tale.');
    if (!tale.body.trim()) issues.push('Ajoute le texte du Tale.');
    if (tale.images.filter(Boolean).length === 0) {
      issues.push('Ajoute au moins une image au Tale.');
    }
  }

  return issues;
}

function statusFor(document: CampaignEditorDocument, dirty: boolean) {
  if (dirty) {
    return {
      label: 'Modifications non enregistrées',
      className: 'border-amber-300/40 bg-amber-300/10 text-amber-200',
    };
  }
  if (!document.published) {
    return {
      label: 'Brouillon uniquement',
      className: 'border-sky-300/40 bg-sky-300/10 text-sky-200',
    };
  }
  if (document.hasUnpublishedChanges) {
    return {
      label: 'Brouillon enregistré',
      className: 'border-amber-300/40 bg-amber-300/10 text-amber-200',
    };
  }
  return {
    label: 'En ligne',
    className: 'border-emerald-300/40 bg-emerald-300/10 text-emerald-200',
  };
}

export function CampaignsEditor() {
  const searchParams = useSearchParams();
  const requestedCampaignId = Number.parseInt(searchParams.get('campaign') ?? '', 10);
  const selectedIdRef = useRef<number | null>(null);

  const [campaigns, setCampaigns] = useState<CampaignEditorDocument[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [draft, setDraft] = useState<CampaignEditorContent | null>(null);
  const [savedDraft, setSavedDraft] = useState<CampaignEditorContent | null>(null);
  const [activeSection, setActiveSection] = useState<EditorSection>('information');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [activeUploadCount, setActiveUploadCount] = useState(0);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [validationIssues, setValidationIssues] = useState<string[]>([]);

  const selectedDocument = useMemo(
    () => campaigns.find((campaign) => campaign.id === selectedId) ?? null,
    [campaigns, selectedId]
  );
  const dirty = useMemo(() => !sameContent(draft, savedDraft), [draft, savedDraft]);
  const uploadBusy = activeUploadCount > 0;
  const busy = saving || publishing || uploadBusy;

  const reportUploadBusy = useCallback((isBusy: boolean) => {
    setActiveUploadCount((current) => Math.max(0, current + (isBusy ? 1 : -1)));
  }, []);

  const hydrateCampaign = useCallback((document: CampaignEditorDocument) => {
    selectedIdRef.current = document.id;
    setSelectedId(document.id);
    setDraft(clone(document.draft));
    setSavedDraft(clone(document.draft));
    setValidationIssues([]);
  }, []);

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const response = await fetch('/api/admin/campaigns', { cache: 'no-store' });
      const payload = (await response.json().catch(() => ({}))) as
        | CampaignEditorDocument[]
        | { campaigns?: CampaignEditorDocument[]; error?: string };
      if (!response.ok) {
        const message = Array.isArray(payload) ? null : payload.error;
        throw new Error(message ?? 'Les campagnes ne peuvent pas être chargées.');
      }
      const records = Array.isArray(payload) ? payload : (payload.campaigns ?? []);
      setCampaigns(records);

      const current = records.find((item) => item.id === selectedIdRef.current);
      const requested = Number.isInteger(requestedCampaignId)
        ? records.find((item) => item.id === requestedCampaignId)
        : null;
      const next = current ?? requested ?? records[0];
      if (next) {
        hydrateCampaign(next);
      } else {
        selectedIdRef.current = null;
        setSelectedId(null);
        setDraft(null);
        setSavedDraft(null);
      }
    } catch (cause) {
      setFeedback({
        tone: 'error',
        message:
          cause instanceof Error ? cause.message : 'Les campagnes ne peuvent pas être chargées.',
      });
    } finally {
      setLoading(false);
    }
  }, [hydrateCampaign, requestedCampaignId]);

  useEffect(() => {
    void loadCampaigns();
  }, [loadCampaigns]);

  useEffect(() => {
    if (!dirty && !uploadBusy) return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeLeaving);
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
  }, [dirty, uploadBusy]);

  useEffect(() => {
    if (!dirty && !uploadBusy) return;
    const guardEditorLink = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>('a[href]');
      if (!anchor) return;

      if (uploadBusy) {
        event.preventDefault();
        event.stopPropagation();
        setFeedback({
          tone: 'info',
          message: 'Attends la fin de l’envoi du fichier avant de quitter cet écran.',
        });
        return;
      }

      if (!dirty || anchor.target === '_blank') return;
      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (
        destination.pathname === window.location.pathname &&
        destination.search === window.location.search
      ) {
        return;
      }
      if (!window.confirm('Abandonner les modifications non enregistrées et quitter cet écran ?')) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    document.addEventListener('click', guardEditorLink, true);
    return () => document.removeEventListener('click', guardEditorLink, true);
  }, [dirty, uploadBusy]);

  const replaceDocument = useCallback((next: CampaignEditorDocument) => {
    setCampaigns((current) =>
      current.map((campaign) => (campaign.id === next.id ? next : campaign))
    );
    selectedIdRef.current = next.id;
    setSelectedId(next.id);
    setDraft(clone(next.draft));
    setSavedDraft(clone(next.draft));
    setValidationIssues([]);
  }, []);

  const updateDraft = useCallback(
    (updater: (current: CampaignEditorContent) => CampaignEditorContent) => {
      setDraft((current) => (current ? updater(current) : current));
      setFeedback(null);
      setValidationIssues([]);
    },
    []
  );

  const updateShowcase = useCallback(
    (patch: Partial<CampaignShowcase>) => {
      updateDraft((current) => ({
        ...current,
        showcase: { ...current.showcase, ...patch },
      }));
    },
    [updateDraft]
  );

  const updateListing = useCallback(
    (patch: Partial<CampaignEditorContent['listing']>) => {
      updateDraft((current) => ({
        ...current,
        listing: { ...current.listing, ...patch },
      }));
    },
    [updateDraft]
  );

  const updateTale = useCallback(
    (patch: Partial<CampaignTaleContent>) => {
      updateDraft((current) => ({
        ...current,
        tale: { ...current.tale, ...patch },
      }));
    },
    [updateDraft]
  );

  const chooseCampaign = (id: number) => {
    if (id === selectedId) return;
    if (uploadBusy) {
      setFeedback({
        tone: 'info',
        message: 'Attends la fin de l’envoi du fichier avant de changer de campagne.',
      });
      return;
    }
    if (
      dirty &&
      !window.confirm(
        'Cette campagne contient des modifications non enregistrées. Les abandonner et ouvrir une autre campagne ?'
      )
    ) {
      return;
    }
    const next = campaigns.find((campaign) => campaign.id === id);
    if (!next) return;
    hydrateCampaign(next);
    setActiveSection('information');
    setFeedback(null);
  };

  const saveDraft = async (): Promise<CampaignEditorDocument | null> => {
    if (!selectedDocument || !draft || saving || publishing || uploadBusy) return null;
    setSaving(true);
    setFeedback({ tone: 'info', message: 'Enregistrement du brouillon…' });
    try {
      const response = await fetch(`/api/admin/campaigns/${selectedDocument.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revision: selectedDocument.revision, content: draft }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        campaign?: CampaignEditorDocument;
        error?: string;
      };
      if (!response.ok || !payload.campaign) {
        throw new Error(payload.error ?? "Le brouillon n'a pas été enregistré.");
      }
      replaceDocument(payload.campaign);
      setFeedback({
        tone: 'success',
        message: "Brouillon enregistré. Le site public n'a pas changé.",
      });
      return payload.campaign;
    } catch (cause) {
      setFeedback({
        tone: 'error',
        message: cause instanceof Error ? cause.message : "Le brouillon n'a pas été enregistré.",
      });
      return null;
    } finally {
      setSaving(false);
    }
  };

  const requestPublish = () => {
    if (!draft || !selectedDocument) return;
    if (uploadBusy) {
      setFeedback({
        tone: 'info',
        message: 'Attends la fin de l’envoi du fichier avant de publier.',
      });
      return;
    }
    const issues = publishIssues(draft);
    if (issues.length) {
      setValidationIssues(issues);
      setFeedback({
        tone: 'error',
        message: 'Complète les éléments indiqués avant de publier.',
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setPublishDialogOpen(true);
  };

  const publishCampaign = async () => {
    if (!selectedDocument || !draft || publishing || uploadBusy) return;
    setPublishDialogOpen(false);
    setPublishing(true);
    setFeedback({ tone: 'info', message: 'Préparation de la publication…' });

    try {
      let documentToPublish = selectedDocument;

      if (dirty) {
        const saveResponse = await fetch(`/api/admin/campaigns/${selectedDocument.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ revision: selectedDocument.revision, content: draft }),
        });
        const savePayload = (await saveResponse.json().catch(() => ({}))) as {
          campaign?: CampaignEditorDocument;
          error?: string;
        };
        if (!saveResponse.ok || !savePayload.campaign) {
          throw new Error(savePayload.error ?? "Le brouillon n'a pas été enregistré.");
        }
        documentToPublish = savePayload.campaign;
        replaceDocument(savePayload.campaign);
      }

      setFeedback({ tone: 'info', message: 'Publication sur le site…' });
      const response = await fetch(`/api/admin/campaigns/${documentToPublish.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revision: documentToPublish.revision }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        campaign?: CampaignEditorDocument;
        error?: string;
      };
      if (!response.ok || !payload.campaign) {
        throw new Error(payload.error ?? "La campagne n'a pas été publiée.");
      }
      replaceDocument(payload.campaign);
      setFeedback({
        tone: 'success',
        message: 'La campagne est maintenant en ligne.',
      });
    } catch (cause) {
      setFeedback({
        tone: 'error',
        message:
          cause instanceof Error
            ? cause.message
            : "La campagne n'a pas été publiée. L'ancienne version reste en ligne.",
      });
    } finally {
      setPublishing(false);
    }
  };

  const reload = () => {
    if (uploadBusy) {
      setFeedback({
        tone: 'info',
        message: 'Attends la fin de l’envoi du fichier avant d’actualiser.',
      });
      return;
    }
    if (
      dirty &&
      !window.confirm('Abandonner les modifications non enregistrées et recharger les campagnes ?')
    ) {
      return;
    }
    void loadCampaigns();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0d0a07] px-3 pb-20 text-white sm:px-6 lg:px-10">
        <div className="mx-auto flex min-h-[45vh] max-w-7xl items-center justify-center">
          <p className="flex items-center gap-3 text-sm text-white/65" role="status">
            <LoaderCircle className="size-5 animate-spin text-[#f4bb52]" aria-hidden />
            Chargement des campagnes…
          </p>
        </div>
      </main>
    );
  }

  return (
    <UploadBusyContext.Provider value={reportUploadBusy}>
      <main className="min-h-screen bg-[#0d0a07] px-3 pb-24 text-white sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[96rem]">
          <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#f4bb52]">
                Campagnes & Tales
              </p>
              <h1 className="mt-3 text-3xl font-medium leading-tight sm:text-4xl">
                Choisis une campagne, puis modifie-la étape par étape.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60 sm:text-base sm:leading-7">
                Enregistrer crée un brouillon. Rien ne change sur le site tant que tu ne choisis pas
                « Publier ».
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={reload}
              disabled={busy}
              className={cn(
                'min-h-11 w-full rounded-none border-white/20 bg-transparent text-white hover:bg-white/[0.06] hover:text-white xl:w-auto',
                actionFocusClass
              )}
            >
              <RefreshCw className="size-4" aria-hidden /> Actualiser
            </Button>
          </header>

          {feedback ? (
            <div
              className={cn(
                'mt-6 flex items-start gap-3 border px-4 py-3 text-sm leading-6',
                feedback.tone === 'success' &&
                  'border-emerald-300/30 bg-emerald-300/[0.08] text-emerald-100',
                feedback.tone === 'error' && 'border-red-300/30 bg-red-300/[0.08] text-red-100',
                feedback.tone === 'info' && 'border-sky-300/30 bg-sky-300/[0.08] text-sky-100'
              )}
              role={feedback.tone === 'error' ? 'alert' : 'status'}
              aria-live="polite"
            >
              {feedback.tone === 'success' ? (
                <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden />
              ) : feedback.tone === 'error' ? (
                <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden />
              ) : (
                <LoaderCircle
                  className={cn('mt-0.5 size-5 shrink-0', busy && 'animate-spin')}
                  aria-hidden
                />
              )}
              <span>{feedback.message}</span>
            </div>
          ) : null}

          {uploadBusy ? (
            <div
              className="mt-4 flex items-start gap-3 border border-[#f4bb52]/35 bg-[#f4bb52]/[0.08] px-4 py-3 text-sm leading-6 text-amber-50"
              role="status"
              aria-live="polite"
            >
              <LoaderCircle className="mt-0.5 size-5 shrink-0 animate-spin" aria-hidden />
              <span>
                Un fichier est en cours d’envoi. Attends la fin avant de changer de page,
                d’enregistrer ou de publier.
              </span>
            </div>
          ) : null}

          {validationIssues.length ? (
            <section
              className="mt-4 border border-amber-300/30 bg-amber-300/[0.07] p-4"
              aria-labelledby="campaign-validation-title"
            >
              <h2 id="campaign-validation-title" className="text-sm font-semibold text-amber-100">
                À compléter avant publication
              </h2>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-50/80">
                {validationIssues.map((issue) => (
                  <li key={issue} className="flex items-start gap-2">
                    <span className="mt-2 size-1.5 shrink-0 bg-[#f4bb52]" aria-hidden />
                    {issue}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {campaigns.length === 0 ? (
            <section className="mt-8 border border-white/10 bg-white/[0.035] p-6 sm:p-8">
              <h2 className="text-xl font-medium">Aucune campagne disponible</h2>
              <p className="mt-3 text-sm leading-6 text-white/60">
                Rien n’a été modifié. Actualise la page ou demande à Rachid de vérifier la connexion
                du site.
              </p>
            </section>
          ) : (
            <>
              <div className="mt-8 lg:hidden">
                <label
                  htmlFor="campaign-mobile-picker"
                  className="mb-2 block text-sm text-white/70"
                >
                  Campagne à modifier
                </label>
                <select
                  id="campaign-mobile-picker"
                  value={selectedId ?? ''}
                  onChange={(event) => chooseCampaign(Number(event.target.value))}
                  disabled={uploadBusy}
                  className={inputClass}
                >
                  {campaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id} className="bg-[#17120e]">
                      {campaign.draft.listing.client || campaign.draft.showcase.title} —{' '}
                      {campaign.hasUnpublishedChanges ? 'brouillon' : 'en ligne'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-6 grid min-w-0 gap-6 lg:mt-8 lg:grid-cols-[17rem_minmax(0,1fr)] xl:grid-cols-[19rem_minmax(0,1fr)]">
                <CampaignList
                  campaigns={campaigns}
                  selectedId={selectedId}
                  dirty={dirty}
                  disabled={uploadBusy}
                  onSelect={chooseCampaign}
                />

                {selectedDocument && draft ? (
                  <article className="min-w-0 border border-white/10 bg-[#15100d] shadow-[0_30px_90px_rgba(0,0,0,0.3)]">
                    <EditorHeader
                      document={selectedDocument}
                      draft={draft}
                      dirty={dirty}
                      busy={busy}
                      uploadBusy={uploadBusy}
                      saving={saving}
                      publishing={publishing}
                      onSave={() => void saveDraft()}
                      onRequestPublish={requestPublish}
                    />

                    <SectionNavigation
                      value={activeSection}
                      disabled={uploadBusy}
                      onChange={setActiveSection}
                    />

                    <div className="p-4 sm:p-6 xl:p-8">
                      {activeSection === 'information' ? (
                        <InformationSection
                          content={draft}
                          onShowcaseChange={updateShowcase}
                          onListingChange={updateListing}
                        />
                      ) : null}
                      {activeSection === 'texts' ? (
                        <TextsSection content={draft} onShowcaseChange={updateShowcase} />
                      ) : null}
                      {activeSection === 'format' ? (
                        <FormatSection
                          content={draft}
                          onFormatChange={(format) =>
                            updateDraft((current) => ({ ...current, format }))
                          }
                          onTaleChange={updateTale}
                        />
                      ) : null}
                      {activeSection === 'media' ? (
                        <MediaSection
                          content={draft}
                          slug={selectedDocument.slug}
                          onShowcaseChange={updateShowcase}
                          onTaleChange={updateTale}
                        />
                      ) : null}
                      {activeSection === 'listing' ? (
                        <ListingSection
                          content={draft}
                          slug={selectedDocument.slug}
                          onListingChange={updateListing}
                        />
                      ) : null}
                    </div>

                    <footer className="border-t border-white/10 bg-black/15 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:p-6">
                      <p className="text-xs leading-5 text-white/45">
                        {dirty
                          ? 'Tes dernières modifications sont uniquement sur cet écran.'
                          : selectedDocument.hasUnpublishedChanges
                            ? 'Le brouillon est enregistré, mais pas encore visible sur le site.'
                            : 'Cette version correspond au contenu actuellement en ligne.'}
                      </p>
                      <Button
                        type="button"
                        onClick={() => void saveDraft()}
                        disabled={!dirty || busy}
                        className={cn(
                          'mt-4 min-h-11 w-full rounded-none bg-[#f4bb52] text-black hover:bg-[#ffd27a] sm:mt-0 sm:w-auto',
                          actionFocusClass
                        )}
                      >
                        {saving ? (
                          <LoaderCircle className="size-4 animate-spin" aria-hidden />
                        ) : (
                          <Save className="size-4" aria-hidden />
                        )}
                        Enregistrer le brouillon
                      </Button>
                    </footer>
                  </article>
                ) : null}
              </div>
            </>
          )}
        </div>

        <PublishDialog
          open={publishDialogOpen}
          dirty={dirty}
          title={draft?.listing.client || draft?.showcase.title || 'cette campagne'}
          onOpenChange={setPublishDialogOpen}
          onConfirm={() => void publishCampaign()}
        />
      </main>
    </UploadBusyContext.Provider>
  );
}

function CampaignList({
  campaigns,
  selectedId,
  dirty,
  disabled,
  onSelect,
}: {
  campaigns: CampaignEditorDocument[];
  selectedId: number | null;
  dirty: boolean;
  disabled: boolean;
  onSelect: (id: number) => void;
}) {
  return (
    <aside className="hidden lg:block" aria-label="Liste des campagnes">
      <div className="sticky top-36 max-h-[calc(100vh-10rem)] overflow-y-auto border border-white/10 bg-white/[0.025] p-2">
        <p className="px-3 pb-2 pt-2 text-[0.68rem] font-medium uppercase tracking-[0.22em] text-white/45">
          {campaigns.length} campagnes
        </p>
        <div className="space-y-1">
          {campaigns.map((campaign) => {
            const active = campaign.id === selectedId;
            const localDirty = active && dirty;
            const status = statusFor(campaign, localDirty);
            return (
              <button
                key={campaign.id}
                type="button"
                onClick={() => onSelect(campaign.id)}
                disabled={disabled}
                aria-current={active ? 'true' : undefined}
                className={cn(
                  'grid min-h-[5.25rem] w-full grid-cols-[3.5rem_minmax(0,1fr)] gap-3 border p-2 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-[#f4bb52]',
                  active
                    ? 'border-[#f4bb52]/60 bg-[#f4bb52]/[0.08]'
                    : 'border-transparent hover:border-white/15 hover:bg-white/[0.04]',
                  disabled && 'cursor-wait opacity-60'
                )}
              >
                <span className="relative block h-[4.1rem] overflow-hidden bg-black/30">
                  {campaign.draft.listing.thumbnail.src ? (
                    // The editor supports arbitrary authenticated Blob URLs, so a native image is intentional.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={campaign.draft.listing.thumbnail.src}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-white/30">
                      <ImageIcon className="size-5" aria-hidden />
                    </span>
                  )}
                </span>
                <span className="min-w-0 self-center">
                  <span className="block truncate text-sm font-medium text-white">
                    {campaign.draft.listing.client || campaign.draft.showcase.title}
                  </span>
                  <span className="mt-1 block truncate text-xs text-white/45">
                    {campaign.draft.showcase.destination || 'Destination à compléter'}
                  </span>
                  <span
                    className={cn(
                      'mt-2 inline-flex border px-2 py-0.5 text-[0.62rem] leading-4',
                      status.className
                    )}
                  >
                    {status.label}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

function EditorHeader({
  document,
  draft,
  dirty,
  busy,
  uploadBusy,
  saving,
  publishing,
  onSave,
  onRequestPublish,
}: {
  document: CampaignEditorDocument;
  draft: CampaignEditorContent;
  dirty: boolean;
  busy: boolean;
  uploadBusy: boolean;
  saving: boolean;
  publishing: boolean;
  onSave: () => void;
  onRequestPublish: () => void;
}) {
  const status = statusFor(document, dirty);

  return (
    <header className="border-b border-white/10 p-4 sm:p-6 xl:flex xl:items-start xl:justify-between xl:gap-8">
      <div className="min-w-0">
        <span className={cn('inline-flex border px-2.5 py-1 text-xs', status.className)}>
          {status.label}
        </span>
        <h2 className="mt-3 break-words text-2xl font-medium leading-tight sm:text-3xl">
          {draft.listing.client || draft.showcase.title}
        </h2>
        <p className="mt-2 break-all text-xs text-white/45">
          Adresse publique : /campaigns/{document.slug}
        </p>
        <p className="mt-2 text-xs text-white/35">
          Dernière publication : {formatDate(document.publishedAt)}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 xl:mt-0 xl:flex xl:shrink-0 xl:flex-wrap xl:justify-end">
        <Link
          href={`/admin/campaigns/${document.id}/preview`}
          target="_blank"
          aria-disabled={dirty || uploadBusy || undefined}
          onClick={(event) => {
            if (dirty || uploadBusy) event.preventDefault();
          }}
          className={cn(
            'inline-flex min-h-11 items-center justify-center gap-2 border border-white/20 px-3 text-sm font-medium text-white outline-none transition hover:border-[#f4bb52]/60 hover:text-[#f4bb52] focus-visible:ring-2 focus-visible:ring-[#f4bb52]',
            (dirty || uploadBusy) && 'cursor-not-allowed opacity-40'
          )}
          title={
            uploadBusy
              ? 'Attends la fin de l’envoi pour ouvrir l’aperçu.'
              : dirty
                ? 'Enregistre d’abord le brouillon pour l’afficher dans l’aperçu.'
                : undefined
          }
        >
          <ExternalLink className="size-4" aria-hidden /> Aperçu
        </Link>
        <Button
          type="button"
          variant="outline"
          onClick={onSave}
          disabled={!dirty || busy}
          className={cn(
            'min-h-11 rounded-none border-white/20 bg-transparent px-3 text-white hover:bg-white/[0.06] hover:text-white',
            actionFocusClass
          )}
        >
          {saving ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
          ) : (
            <Save className="size-4" aria-hidden />
          )}
          Enregistrer
        </Button>
        <Button
          type="button"
          onClick={onRequestPublish}
          disabled={busy}
          className={cn(
            'col-span-2 min-h-11 rounded-none bg-[#f4bb52] px-4 text-black hover:bg-[#ffd27a] xl:col-span-1',
            actionFocusClass
          )}
        >
          {publishing ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
          ) : (
            <Send className="size-4" aria-hidden />
          )}
          Publier
        </Button>
      </div>

      {dirty || uploadBusy ? (
        <p className="mt-3 text-xs leading-5 text-amber-200 xl:hidden">
          {uploadBusy
            ? 'Attends la fin de l’envoi pour continuer.'
            : 'Enregistre le brouillon pour ouvrir son aperçu.'}
        </p>
      ) : null}
    </header>
  );
}

function SectionNavigation({
  value,
  disabled,
  onChange,
}: {
  value: EditorSection;
  disabled: boolean;
  onChange: (section: EditorSection) => void;
}) {
  return (
    <nav
      aria-label="Étapes de modification de la campagne"
      className="overflow-x-auto border-b border-white/10 bg-black/15"
    >
      <div className="flex min-w-max p-2 sm:p-3">
        {EDITOR_SECTIONS.map((section) => {
          const active = value === section.id;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onChange(section.id)}
              disabled={disabled}
              aria-current={active ? 'step' : undefined}
              className={cn(
                'relative flex min-h-14 min-w-[9.5rem] items-center gap-3 px-3 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#f4bb52]',
                active ? 'bg-[#f4bb52]/[0.09] text-white' : 'text-white/50 hover:bg-white/[0.04]',
                disabled && 'cursor-wait opacity-60'
              )}
            >
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center border text-xs font-semibold',
                  active ? 'border-[#f4bb52] text-[#f4bb52]' : 'border-white/20 text-white/50'
                )}
              >
                {section.step}
              </span>
              <span>
                <span className="block text-sm font-medium">{section.label}</span>
                <span className="mt-0.5 hidden text-[0.65rem] leading-4 text-white/35 2xl:block">
                  {section.description}
                </span>
              </span>
              {active ? (
                <span className="absolute inset-x-3 bottom-0 h-0.5 bg-[#f4bb52]" aria-hidden />
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="mb-7 max-w-3xl">
      <p className="text-[0.68rem] font-medium uppercase tracking-[0.22em] text-[#f4bb52]">
        {eyebrow}
      </p>
      <h3 className="mt-2 text-xl font-medium sm:text-2xl">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/55">{description}</p>
    </header>
  );
}

function Field({
  id,
  label,
  help,
  children,
}: {
  id: string;
  label: string;
  help?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-white/85">
        {label}
      </label>
      {children}
      {help ? <p className="mt-2 text-xs leading-5 text-white/40">{help}</p> : null}
    </div>
  );
}

function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputClass, className)} {...props} />;
}

function TextArea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(textareaClass, className)} {...props} />;
}

function InformationSection({
  content,
  onShowcaseChange,
  onListingChange,
}: {
  content: CampaignEditorContent;
  onShowcaseChange: (patch: Partial<CampaignShowcase>) => void;
  onListingChange: (patch: Partial<CampaignEditorContent['listing']>) => void;
}) {
  const { showcase, listing } = content;

  return (
    <section aria-labelledby="campaign-information-title">
      <SectionIntro
        eyebrow="Étape 1 sur 5"
        title="Informations principales"
        description="Ces informations apparaissent sur la carte de la campagne et en haut de sa page."
      />
      <div className="grid gap-5 md:grid-cols-2">
        <Field id="campaign-title" label="Nom complet de la campagne">
          <TextInput
            id="campaign-title"
            value={showcase.title}
            onChange={(event) => onShowcaseChange({ title: event.target.value })}
            placeholder="Ex. Almaaz - Kenya"
          />
        </Field>
        <Field id="campaign-client" label="Marque">
          <TextInput
            id="campaign-client"
            value={listing.client}
            onChange={(event) => onListingChange({ client: event.target.value })}
            placeholder="Ex. Almaaz"
          />
        </Field>
        <Field id="campaign-destination" label="Destination affichée">
          <TextInput
            id="campaign-destination"
            value={showcase.destination}
            onChange={(event) => onShowcaseChange({ destination: event.target.value })}
            placeholder="Ex. Mombasa, Kenya"
          />
        </Field>
        <Field id="campaign-country" label="Pays utilisé dans les filtres">
          <TextInput
            id="campaign-country"
            value={listing.country}
            onChange={(event) => onListingChange({ country: event.target.value })}
            placeholder="Ex. Kenya"
          />
        </Field>
        <Field id="campaign-release" label="Saison ou période affichée">
          <TextInput
            id="campaign-release"
            value={listing.releaseWindow}
            onChange={(event) => onListingChange({ releaseWindow: event.target.value })}
            placeholder="Ex. Spring Summer 2026"
          />
        </Field>
        <Field id="campaign-year" label="Année du shooting">
          <TextInput
            id="campaign-year"
            type="number"
            min={1900}
            max={2200}
            inputMode="numeric"
            value={listing.shootYear}
            onChange={(event) => onListingChange({ shootYear: Number(event.target.value) })}
          />
        </Field>
        <Field id="campaign-season" label="Saison principale">
          <select
            id="campaign-season"
            value={listing.season}
            onChange={(event) =>
              onListingChange({
                season: event.target.value as CampaignEditorContent['listing']['season'],
              })
            }
            className={inputClass}
          >
            <option value="spring-summer" className="bg-[#17120e]">
              Spring Summer
            </option>
            <option value="fall-winter" className="bg-[#17120e]">
              Fall Winter
            </option>
          </select>
        </Field>
        <Field id="campaign-brand-type" label="Type de marque">
          <TextInput
            id="campaign-brand-type"
            value={listing.brandType}
            onChange={(event) => onListingChange({ brandType: event.target.value })}
            placeholder="Ex. Accessories"
          />
        </Field>
      </div>

      <fieldset className="mt-6 border border-white/10 p-4 sm:p-5">
        <legend className="px-2 text-sm font-medium text-white/85">Saisons visibles</legend>
        <p className="text-xs leading-5 text-white/45">
          Coche les deux si la campagne doit apparaître dans les deux filtres.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {(
            [
              ['spring-summer', 'Spring Summer'],
              ['fall-winter', 'Fall Winter'],
            ] as const
          ).map(([value, label]) => {
            const checked = listing.seasonTags.includes(value);
            return (
              <label
                key={value}
                className={cn(
                  'flex min-h-12 cursor-pointer items-center gap-3 border px-4 text-sm outline-none transition focus-within:ring-2 focus-within:ring-[#f4bb52]',
                  checked
                    ? 'border-[#f4bb52]/60 bg-[#f4bb52]/[0.08] text-white'
                    : 'border-white/15 bg-white/[0.025] text-white/65'
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const next = checked
                      ? listing.seasonTags.filter((item) => item !== value)
                      : [...listing.seasonTags, value];
                    onListingChange({ seasonTags: next.length ? next : [listing.season] });
                  }}
                  className="size-4 accent-[#f4bb52]"
                />
                {label}
              </label>
            );
          })}
        </div>
      </fieldset>
    </section>
  );
}

function TextsSection({
  content,
  onShowcaseChange,
}: {
  content: CampaignEditorContent;
  onShowcaseChange: (patch: Partial<CampaignShowcase>) => void;
}) {
  const { showcase } = content;

  return (
    <section aria-labelledby="campaign-texts-title">
      <SectionIntro
        eyebrow="Étape 2 sur 5"
        title="Textes éditoriaux"
        description="Chaque bloc correspond à un texte visible sur la page de la campagne."
      />
      <div className="space-y-7">
        <Field id="campaign-headline" label="Grand titre éditorial">
          <TextArea
            id="campaign-headline"
            rows={3}
            value={showcase.headline}
            onChange={(event) => onShowcaseChange({ headline: event.target.value })}
          />
        </Field>
        <Field id="campaign-summary" label="Résumé">
          <TextArea
            id="campaign-summary"
            rows={5}
            value={showcase.summary}
            onChange={(event) => onShowcaseChange({ summary: event.target.value })}
          />
        </Field>
        <StringListEditor
          idBase="campaign-story"
          label="Paragraphes de l’histoire"
          values={showcase.story}
          addLabel="Ajouter un paragraphe"
          onChange={(story) => onShowcaseChange({ story })}
        />
        <StringListEditor
          idBase="campaign-highlights"
          label="Points forts"
          values={showcase.highlights}
          addLabel="Ajouter un point fort"
          onChange={(highlights) => onShowcaseChange({ highlights })}
        />
        <StringListEditor
          idBase="campaign-impact"
          label="Impacts"
          values={showcase.impact}
          addLabel="Ajouter un impact"
          onChange={(impact) => onShowcaseChange({ impact })}
        />
        <CreditsEditor
          values={showcase.credits}
          onChange={(credits) => onShowcaseChange({ credits })}
        />

        <fieldset className="border border-white/10 p-4 sm:p-5">
          <legend className="px-2 text-sm font-medium text-white/85">Bouton final</legend>
          <div className="mt-2 grid gap-5 md:grid-cols-2">
            <Field id="campaign-cta-label" label="Texte du bouton">
              <TextInput
                id="campaign-cta-label"
                value={showcase.cta?.label ?? ''}
                onChange={(event) =>
                  onShowcaseChange({
                    cta: { label: event.target.value, href: showcase.cta?.href ?? '/contact' },
                  })
                }
                placeholder="Ex. Begin the journey"
              />
            </Field>
            <Field
              id="campaign-cta-href"
              label="Destination du bouton"
              help="Utilise une adresse du site comme /contact ou une adresse https:// complète."
            >
              <TextInput
                id="campaign-cta-href"
                value={showcase.cta?.href ?? ''}
                onChange={(event) =>
                  onShowcaseChange({
                    cta: { label: showcase.cta?.label ?? '', href: event.target.value },
                  })
                }
                placeholder="/contact"
              />
            </Field>
          </div>
        </fieldset>
      </div>
    </section>
  );
}

function FormatSection({
  content,
  onFormatChange,
  onTaleChange,
}: {
  content: CampaignEditorContent;
  onFormatChange: (format: CampaignEditorContent['format']) => void;
  onTaleChange: (patch: Partial<CampaignTaleContent>) => void;
}) {
  return (
    <section aria-labelledby="campaign-format-title">
      <SectionIntro
        eyebrow="Étape 3 sur 5"
        title="Format de la page"
        description="Le format change la manière dont le visiteur découvre la campagne. Tu peux revenir ici à tout moment."
      />

      <div
        role="radiogroup"
        aria-label="Format de la campagne"
        className="grid gap-4 md:grid-cols-2"
      >
        <FormatCard
          selected={content.format === 'tale'}
          title="Tale"
          description="Une histoire immersive en chapitres, parcourue écran par écran."
          icon={<BookOpenText className="size-6" aria-hidden />}
          onSelect={() => onFormatChange('tale')}
        />
        <FormatCard
          selected={content.format === 'gallery'}
          title="Gallery"
          description="Une galerie visuelle avec toutes les images et vidéos accessibles directement."
          icon={<GalleryHorizontalEnd className="size-6" aria-hidden />}
          onSelect={() => onFormatChange('gallery')}
        />
      </div>

      <div className="mt-8 border border-white/10 bg-black/15 p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <BookOpenText className="mt-0.5 size-5 shrink-0 text-[#f4bb52]" aria-hidden />
          <div>
            <h4 className="text-base font-medium">Texte du Tale</h4>
            <p className="mt-1 text-xs leading-5 text-white/45">
              Il reste enregistré même si le format Gallery est choisi aujourd’hui.
            </p>
          </div>
        </div>
        <div className="mt-6 space-y-5">
          <Field id="campaign-tale-title" label="Titre du Tale">
            <TextInput
              id="campaign-tale-title"
              value={content.tale.title}
              onChange={(event) => onTaleChange({ title: event.target.value })}
            />
          </Field>
          <Field id="campaign-tale-body" label="Texte du Tale">
            <TextArea
              id="campaign-tale-body"
              rows={10}
              value={content.tale.body}
              onChange={(event) => onTaleChange({ body: event.target.value })}
              className="min-h-64"
            />
          </Field>
        </div>
      </div>
    </section>
  );
}

function FormatCard({
  selected,
  title,
  description,
  icon,
  onSelect,
}: {
  selected: boolean;
  title: string;
  description: string;
  icon: ReactNode;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        'relative min-h-48 border p-5 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-[#f4bb52] sm:p-6',
        selected
          ? 'border-[#f4bb52] bg-[#f4bb52]/[0.08]'
          : 'border-white/15 bg-white/[0.025] hover:border-white/30 hover:bg-white/[0.045]'
      )}
    >
      <span
        className={cn(
          'flex size-11 items-center justify-center border',
          selected ? 'border-[#f4bb52] text-[#f4bb52]' : 'border-white/20 text-white/55'
        )}
      >
        {icon}
      </span>
      <span className="mt-6 block text-xl font-medium">{title}</span>
      <span className="mt-2 block max-w-sm text-sm leading-6 text-white/55">{description}</span>
      <span
        className={cn(
          'absolute right-4 top-4 flex size-7 items-center justify-center border',
          selected ? 'border-[#f4bb52] bg-[#f4bb52] text-black' : 'border-white/20 text-transparent'
        )}
        aria-hidden
      >
        <Check className="size-4" />
      </span>
    </button>
  );
}

function MediaSection({
  content,
  slug,
  onShowcaseChange,
  onTaleChange,
}: {
  content: CampaignEditorContent;
  slug: string;
  onShowcaseChange: (patch: Partial<CampaignShowcase>) => void;
  onTaleChange: (patch: Partial<CampaignTaleContent>) => void;
}) {
  const { showcase, tale } = content;
  const hero = showcase.hero;

  return (
    <section aria-labelledby="campaign-media-title">
      <SectionIntro
        eyebrow="Étape 4 sur 5"
        title="Images et vidéos"
        description="Envoie un fichier, vérifie son aperçu, puis place les médias dans l’ordre souhaité."
      />

      <div className="space-y-8">
        <fieldset className="border border-white/10 p-4 sm:p-6">
          <legend className="px-2 text-sm font-medium text-white/85">Média principal</legend>
          <div className="mt-2 grid gap-5 xl:grid-cols-2">
            <Field id="campaign-hero-type" label="Type de média">
              <select
                id="campaign-hero-type"
                value={hero.type}
                onChange={(event) =>
                  onShowcaseChange({
                    hero: {
                      ...hero,
                      type: event.target.value as ShowcaseMedia['type'],
                    },
                  })
                }
                className={inputClass}
              >
                <option value="image" className="bg-[#17120e]">
                  Image
                </option>
                <option value="video" className="bg-[#17120e]">
                  Vidéo
                </option>
              </select>
            </Field>
            <Field id="campaign-hero-aspect" label="Format du cadre">
              <select
                id="campaign-hero-aspect"
                value={hero.aspectRatio ?? 'landscape'}
                onChange={(event) =>
                  onShowcaseChange({
                    hero: {
                      ...hero,
                      aspectRatio: event.target.value as NonNullable<ShowcaseMedia['aspectRatio']>,
                    },
                  })
                }
                className={inputClass}
              >
                <option value="landscape" className="bg-[#17120e]">
                  Paysage
                </option>
                <option value="portrait" className="bg-[#17120e]">
                  Portrait
                </option>
                <option value="square" className="bg-[#17120e]">
                  Carré
                </option>
              </select>
            </Field>
          </div>
          <div className="mt-5">
            <CampaignMediaUploadField
              label="Fichier principal"
              value={hero.src}
              onChange={(src) => onShowcaseChange({ hero: { ...hero, src } })}
              kind={hero.type}
              accept={hero.type === 'image' ? 'image/*' : 'video/mp4,video/webm,video/quicktime'}
              help="L’ancien fichier reste disponible tant que tu n’enregistres pas ce brouillon."
            />
          </div>
          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            <Field id="campaign-hero-alt" label="Description du média">
              <TextInput
                id="campaign-hero-alt"
                value={hero.alt}
                onChange={(event) =>
                  onShowcaseChange({ hero: { ...hero, alt: event.target.value } })
                }
                placeholder="Décris ce que l’on voit"
              />
            </Field>
            <Field id="campaign-hero-caption" label="Légende facultative">
              <TextInput
                id="campaign-hero-caption"
                value={hero.caption ?? ''}
                onChange={(event) =>
                  onShowcaseChange({
                    hero: { ...hero, caption: event.target.value || undefined },
                  })
                }
              />
            </Field>
            <Field id="campaign-hero-loop" label="Texte associé à la boucle vidéo">
              <TextInput
                id="campaign-hero-loop"
                value={hero.loopLabel ?? ''}
                onChange={(event) =>
                  onShowcaseChange({
                    hero: { ...hero, loopLabel: event.target.value || undefined },
                  })
                }
              />
            </Field>
          </div>
          {hero.type === 'video' ? (
            <div className="mt-5">
              <CampaignMediaUploadField
                label="Image affichée avant la vidéo"
                value={hero.poster ?? ''}
                onChange={(poster) =>
                  onShowcaseChange({ hero: { ...hero, poster: poster || undefined } })
                }
                kind="image"
                accept="image/*"
              />
            </div>
          ) : null}
        </fieldset>

        <GalleryEditor
          slug={slug}
          values={showcase.gallery}
          onChange={(gallery) => onShowcaseChange({ gallery })}
        />

        <fieldset className="border border-white/10 p-4 sm:p-6">
          <legend className="px-2 text-sm font-medium text-white/85">Médias du Tale</legend>
          <p className="mt-2 text-xs leading-5 text-white/45">
            Ils restent enregistrés même lorsque la campagne utilise le format Gallery.
          </p>
          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <CampaignMediaUploadField
              label="Vidéo d’ouverture du Tale"
              value={tale.heroVideo ?? ''}
              onChange={(heroVideo) => onTaleChange({ heroVideo: heroVideo || undefined })}
              kind="video"
              accept="video/mp4,video/webm,video/quicktime"
            />
            <CampaignMediaUploadField
              label="Vidéo du chapitre histoire"
              value={tale.storyVideo ?? ''}
              onChange={(storyVideo) => onTaleChange({ storyVideo: storyVideo || undefined })}
              kind="video"
              accept="video/mp4,video/webm,video/quicktime"
            />
          </div>
          <div className="mt-8 grid gap-8 2xl:grid-cols-2">
            <AssetListEditor
              label="Images du Tale"
              slug={slug}
              kind="image"
              values={tale.images}
              onChange={(images) => onTaleChange({ images })}
            />
            <AssetListEditor
              label="Vidéos supplémentaires du Tale"
              slug={slug}
              kind="video"
              values={tale.videos}
              onChange={(videos) => onTaleChange({ videos })}
            />
          </div>
        </fieldset>
      </div>
    </section>
  );
}

function ListingSection({
  content,
  slug,
  onListingChange,
}: {
  content: CampaignEditorContent;
  slug: string;
  onListingChange: (patch: Partial<CampaignEditorContent['listing']>) => void;
}) {
  const { listing } = content;

  return (
    <section aria-labelledby="campaign-listing-title">
      <SectionIntro
        eyebrow="Étape 5 sur 5"
        title="Fiche campagne"
        description="Cette partie contrôle la carte dans All Campaigns et les informations de production."
      />
      <div className="space-y-8">
        <fieldset className="border border-white/10 p-4 sm:p-6">
          <legend className="px-2 text-sm font-medium text-white/85">
            Carte dans All Campaigns
          </legend>
          <div className="mt-3 grid gap-7 xl:grid-cols-2">
            <div>
              <CampaignMediaUploadField
                label="Image de la carte"
                value={listing.thumbnail.src}
                onChange={(src) => onListingChange({ thumbnail: { ...listing.thumbnail, src } })}
                kind="image"
                accept="image/*"
                help={`Campagne : ${slug}`}
              />
              <div className="mt-4">
                <Field id="campaign-thumbnail-alt" label="Description de l’image">
                  <TextInput
                    id="campaign-thumbnail-alt"
                    value={listing.thumbnail.alt}
                    onChange={(event) =>
                      onListingChange({
                        thumbnail: { ...listing.thumbnail, alt: event.target.value },
                      })
                    }
                  />
                </Field>
              </div>
            </div>
            <div>
              <CampaignMediaUploadField
                label="Logo de la marque"
                value={listing.logo.src}
                onChange={(src) => onListingChange({ logo: { ...listing.logo, src } })}
                kind="image"
                accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
                help="Les nouveaux SVG ne sont pas acceptés. Utilise PNG ou WebP."
              />
              <div className="mt-4">
                <Field id="campaign-logo-alt" label="Description du logo">
                  <TextInput
                    id="campaign-logo-alt"
                    value={listing.logo.alt}
                    onChange={(event) =>
                      onListingChange({ logo: { ...listing.logo, alt: event.target.value } })
                    }
                  />
                </Field>
              </div>
            </div>
            <CampaignMediaUploadField
              label="Vidéo animée de la carte"
              value={listing.backgroundVideo ?? ''}
              onChange={(backgroundVideo) =>
                onListingChange({ backgroundVideo: backgroundVideo || undefined })
              }
              kind="video"
              accept="video/mp4,video/webm,video/quicktime"
            />
            <CampaignMediaUploadField
              label="Image d’attente de la vidéo"
              value={listing.cardPoster ?? ''}
              onChange={(cardPoster) => onListingChange({ cardPoster: cardPoster || undefined })}
              kind="image"
              accept="image/*"
            />
          </div>
        </fieldset>

        <fieldset className="border border-white/10 p-4 sm:p-6">
          <legend className="px-2 text-sm font-medium text-white/85">
            Crédits de production affichés
          </legend>
          <div className="mt-3 grid gap-5 md:grid-cols-2">
            <Field id="campaign-art-director" label="Direction artistique">
              <TextInput
                id="campaign-art-director"
                value={listing.artDirector}
                onChange={(event) => onListingChange({ artDirector: event.target.value })}
              />
            </Field>
            <Field id="campaign-talent" label="Talent principal">
              <TextInput
                id="campaign-talent"
                value={listing.talent}
                onChange={(event) => onListingChange({ talent: event.target.value })}
              />
            </Field>
            <Field id="campaign-dop" label="Direction de la photographie">
              <TextInput
                id="campaign-dop"
                value={listing.dop}
                onChange={(event) => onListingChange({ dop: event.target.value })}
              />
            </Field>
          </div>
          <div className="mt-7 grid gap-7 xl:grid-cols-3">
            <StringListEditor
              idBase="campaign-production-team"
              label="Équipe de production"
              values={listing.productionTeam}
              addLabel="Ajouter une personne"
              compact
              onChange={(productionTeam) => onListingChange({ productionTeam })}
            />
            <StringListEditor
              idBase="campaign-models"
              label="Modèles"
              values={listing.models}
              addLabel="Ajouter un modèle"
              compact
              onChange={(models) => onListingChange({ models })}
            />
            <StringListEditor
              idBase="campaign-makeup"
              label="Make-up artists"
              values={listing.makeupArtists}
              addLabel="Ajouter une personne"
              compact
              onChange={(makeupArtists) => onListingChange({ makeupArtists })}
            />
          </div>
        </fieldset>
      </div>
    </section>
  );
}

function StringListEditor({
  idBase,
  label,
  values,
  addLabel,
  compact = false,
  onChange,
}: {
  idBase: string;
  label: string;
  values: string[];
  addLabel: string;
  compact?: boolean;
  onChange: (values: string[]) => void;
}) {
  const move = (from: number, to: number) => {
    if (to < 0 || to >= values.length) return;
    const next = [...values];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <fieldset className="min-w-0 border border-white/10 p-4 sm:p-5">
      <legend className="px-2 text-sm font-medium text-white/85">{label}</legend>
      <div className="mt-2 space-y-3">
        {values.length === 0 ? (
          <p className="border border-dashed border-white/15 px-3 py-5 text-center text-xs text-white/40">
            Aucun élément pour le moment.
          </p>
        ) : null}
        {values.map((value, index) => {
          const id = `${idBase}-${index}`;
          return (
            <div key={`${idBase}-${index}`} className="border border-white/10 bg-black/15 p-3">
              <label htmlFor={id} className="mb-2 block text-xs text-white/50">
                {label} {index + 1}
              </label>
              {compact ? (
                <TextInput
                  id={id}
                  value={value}
                  onChange={(event) => {
                    const next = [...values];
                    next[index] = event.target.value;
                    onChange(next);
                  }}
                />
              ) : (
                <TextArea
                  id={id}
                  rows={3}
                  value={value}
                  onChange={(event) => {
                    const next = [...values];
                    next[index] = event.target.value;
                    onChange(next);
                  }}
                />
              )}
              <ReorderButtons
                label={`${label} ${index + 1}`}
                first={index === 0}
                last={index === values.length - 1}
                onUp={() => move(index, index - 1)}
                onDown={() => move(index, index + 1)}
                onRemove={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))}
              />
            </div>
          );
        })}
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={() => onChange([...values, ''])}
        className={cn(
          'mt-4 min-h-11 w-full rounded-none border-white/20 bg-transparent text-white hover:bg-white/[0.06] hover:text-white',
          actionFocusClass
        )}
      >
        <Plus className="size-4" aria-hidden /> {addLabel}
      </Button>
    </fieldset>
  );
}

function CreditsEditor({
  values,
  onChange,
}: {
  values: Array<{ role: string; value: string }>;
  onChange: (values: Array<{ role: string; value: string }>) => void;
}) {
  const move = (from: number, to: number) => {
    if (to < 0 || to >= values.length) return;
    const next = [...values];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <fieldset className="border border-white/10 p-4 sm:p-5">
      <legend className="px-2 text-sm font-medium text-white/85">Crédits libres</legend>
      <div className="mt-2 space-y-3">
        {values.length === 0 ? (
          <p className="border border-dashed border-white/15 px-3 py-5 text-center text-xs text-white/40">
            Aucun crédit pour le moment.
          </p>
        ) : null}
        {values.map((credit, index) => (
          <div key={`credit-${index}`} className="border border-white/10 bg-black/15 p-3">
            <div className="grid gap-3 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
              <Field id={`campaign-credit-role-${index}`} label={`Rôle ${index + 1}`}>
                <TextInput
                  id={`campaign-credit-role-${index}`}
                  value={credit.role}
                  onChange={(event) => {
                    const next = [...values];
                    next[index] = { ...credit, role: event.target.value };
                    onChange(next);
                  }}
                  placeholder="Ex. Art direction"
                />
              </Field>
              <Field id={`campaign-credit-value-${index}`} label="Nom ou valeur">
                <TextInput
                  id={`campaign-credit-value-${index}`}
                  value={credit.value}
                  onChange={(event) => {
                    const next = [...values];
                    next[index] = { ...credit, value: event.target.value };
                    onChange(next);
                  }}
                />
              </Field>
            </div>
            <ReorderButtons
              label={`Crédit ${index + 1}`}
              first={index === 0}
              last={index === values.length - 1}
              onUp={() => move(index, index - 1)}
              onDown={() => move(index, index + 1)}
              onRemove={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))}
            />
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={() => onChange([...values, { role: '', value: '' }])}
        className={cn(
          'mt-4 min-h-11 w-full rounded-none border-white/20 bg-transparent text-white hover:bg-white/[0.06] hover:text-white',
          actionFocusClass
        )}
      >
        <Plus className="size-4" aria-hidden /> Ajouter un crédit
      </Button>
    </fieldset>
  );
}

function GalleryEditor({
  slug,
  values,
  onChange,
}: {
  slug: string;
  values: ShowcaseMedia[];
  onChange: (values: ShowcaseMedia[]) => void;
}) {
  const move = (from: number, to: number) => {
    if (to < 0 || to >= values.length) return;
    const next = [...values];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };
  const add = (type: ShowcaseMedia['type']) => {
    const suffix =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    onChange([
      ...values,
      {
        id: `${slug}-${type}-${suffix}`,
        type,
        src: '',
        alt: '',
        aspectRatio: type === 'video' ? 'landscape' : 'portrait',
      },
    ]);
  };

  return (
    <fieldset className="border border-white/10 p-4 sm:p-6">
      <legend className="px-2 text-sm font-medium text-white/85">Galerie dans l’ordre</legend>
      <p className="mt-2 text-xs leading-5 text-white/45">
        Le premier bloc apparaît en premier. Utilise les flèches pour changer l’ordre.
      </p>
      <div className="mt-5 space-y-4">
        {values.length === 0 ? (
          <p className="border border-dashed border-white/15 px-4 py-8 text-center text-sm text-white/40">
            La galerie est vide.
          </p>
        ) : null}
        {values.map((media, index) => (
          <div key={media.id} className="border border-white/10 bg-black/15 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center border border-[#f4bb52]/40 text-[#f4bb52]">
                  {media.type === 'video' ? (
                    <Video className="size-4" aria-hidden />
                  ) : (
                    <ImageIcon className="size-4" aria-hidden />
                  )}
                </span>
                <div>
                  <h4 className="text-sm font-medium">Média {index + 1}</h4>
                  <p className="mt-0.5 text-xs text-white/40">
                    {media.type === 'video' ? 'Vidéo' : 'Image'}
                  </p>
                </div>
              </div>
              <span className="text-xs text-white/30">
                {index + 1}/{values.length}
              </span>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-2">
              <Field id={`campaign-gallery-type-${index}`} label="Type">
                <select
                  id={`campaign-gallery-type-${index}`}
                  value={media.type}
                  onChange={(event) => {
                    const next = [...values];
                    next[index] = {
                      ...media,
                      type: event.target.value as ShowcaseMedia['type'],
                    };
                    onChange(next);
                  }}
                  className={inputClass}
                >
                  <option value="image" className="bg-[#17120e]">
                    Image
                  </option>
                  <option value="video" className="bg-[#17120e]">
                    Vidéo
                  </option>
                </select>
              </Field>
              <Field id={`campaign-gallery-aspect-${index}`} label="Format du cadre">
                <select
                  id={`campaign-gallery-aspect-${index}`}
                  value={media.aspectRatio ?? 'portrait'}
                  onChange={(event) => {
                    const next = [...values];
                    next[index] = {
                      ...media,
                      aspectRatio: event.target.value as NonNullable<ShowcaseMedia['aspectRatio']>,
                    };
                    onChange(next);
                  }}
                  className={inputClass}
                >
                  <option value="portrait" className="bg-[#17120e]">
                    Portrait
                  </option>
                  <option value="landscape" className="bg-[#17120e]">
                    Paysage
                  </option>
                  <option value="square" className="bg-[#17120e]">
                    Carré
                  </option>
                </select>
              </Field>
            </div>

            <div className="mt-5">
              <CampaignMediaUploadField
                label="Fichier"
                value={media.src}
                onChange={(src) => {
                  const next = [...values];
                  next[index] = { ...media, src };
                  onChange(next);
                }}
                kind={media.type}
                accept={media.type === 'image' ? 'image/*' : 'video/mp4,video/webm,video/quicktime'}
              />
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-2">
              <Field id={`campaign-gallery-alt-${index}`} label="Description du média">
                <TextInput
                  id={`campaign-gallery-alt-${index}`}
                  value={media.alt}
                  onChange={(event) => {
                    const next = [...values];
                    next[index] = { ...media, alt: event.target.value };
                    onChange(next);
                  }}
                  placeholder="Décris ce que l’on voit"
                />
              </Field>
              <Field id={`campaign-gallery-caption-${index}`} label="Légende facultative">
                <TextInput
                  id={`campaign-gallery-caption-${index}`}
                  value={media.caption ?? ''}
                  onChange={(event) => {
                    const next = [...values];
                    next[index] = {
                      ...media,
                      caption: event.target.value || undefined,
                    };
                    onChange(next);
                  }}
                />
              </Field>
            </div>

            {media.type === 'video' ? (
              <div className="mt-5">
                <CampaignMediaUploadField
                  label="Image affichée avant la vidéo"
                  value={media.poster ?? ''}
                  onChange={(poster) => {
                    const next = [...values];
                    next[index] = { ...media, poster: poster || undefined };
                    onChange(next);
                  }}
                  kind="image"
                  accept="image/*"
                />
              </div>
            ) : null}

            <ReorderButtons
              label={`Média ${index + 1}`}
              first={index === 0}
              last={index === values.length - 1}
              onUp={() => move(index, index - 1)}
              onDown={() => move(index, index + 1)}
              onRemove={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))}
            />
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => add('image')}
          className={cn(
            'min-h-11 rounded-none border-white/20 bg-transparent text-white hover:bg-white/[0.06] hover:text-white',
            actionFocusClass
          )}
        >
          <ImageIcon className="size-4" aria-hidden /> Ajouter une image
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => add('video')}
          className={cn(
            'min-h-11 rounded-none border-white/20 bg-transparent text-white hover:bg-white/[0.06] hover:text-white',
            actionFocusClass
          )}
        >
          <Video className="size-4" aria-hidden /> Ajouter une vidéo
        </Button>
      </div>
    </fieldset>
  );
}

function AssetListEditor({
  label,
  kind,
  values,
  onChange,
}: {
  label: string;
  slug: string;
  kind: 'image' | 'video';
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const move = (from: number, to: number) => {
    if (to < 0 || to >= values.length) return;
    const next = [...values];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <fieldset className="min-w-0 border border-white/10 p-4">
      <legend className="px-2 text-sm font-medium text-white/85">{label}</legend>
      <div className="mt-2 space-y-4">
        {values.length === 0 ? (
          <p className="border border-dashed border-white/15 px-3 py-5 text-center text-xs text-white/40">
            Aucun fichier pour le moment.
          </p>
        ) : null}
        {values.map((value, index) => (
          <div key={`${kind}-${index}-${value}`} className="border border-white/10 bg-black/15 p-3">
            <CampaignMediaUploadField
              label={`${kind === 'image' ? 'Image' : 'Vidéo'} ${index + 1}`}
              value={value}
              onChange={(url) => {
                const next = [...values];
                next[index] = url;
                onChange(next);
              }}
              kind={kind}
              accept={kind === 'image' ? 'image/*' : 'video/mp4,video/webm,video/quicktime'}
            />
            <ReorderButtons
              label={`${label} ${index + 1}`}
              first={index === 0}
              last={index === values.length - 1}
              onUp={() => move(index, index - 1)}
              onDown={() => move(index, index + 1)}
              onRemove={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))}
            />
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={() => onChange([...values, ''])}
        className={cn(
          'mt-4 min-h-11 w-full rounded-none border-white/20 bg-transparent text-white hover:bg-white/[0.06] hover:text-white',
          actionFocusClass
        )}
      >
        <Plus className="size-4" aria-hidden /> Ajouter{' '}
        {kind === 'image' ? 'une image' : 'une vidéo'}
      </Button>
    </fieldset>
  );
}

function ReorderButtons({
  label,
  first,
  last,
  onUp,
  onDown,
  onRemove,
}: {
  label: string;
  first: boolean;
  last: boolean;
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="mt-3 flex flex-wrap items-center justify-end gap-2 border-t border-white/10 pt-3">
      <button
        type="button"
        onClick={onUp}
        disabled={first}
        aria-label={`Monter ${label}`}
        className="flex min-h-11 min-w-11 items-center justify-center border border-white/15 text-white/60 outline-none transition hover:border-[#f4bb52]/50 hover:text-[#f4bb52] focus-visible:ring-2 focus-visible:ring-[#f4bb52] disabled:cursor-not-allowed disabled:opacity-25"
      >
        <ArrowUp className="size-4" aria-hidden />
      </button>
      <button
        type="button"
        onClick={onDown}
        disabled={last}
        aria-label={`Descendre ${label}`}
        className="flex min-h-11 min-w-11 items-center justify-center border border-white/15 text-white/60 outline-none transition hover:border-[#f4bb52]/50 hover:text-[#f4bb52] focus-visible:ring-2 focus-visible:ring-[#f4bb52] disabled:cursor-not-allowed disabled:opacity-25"
      >
        <ArrowDown className="size-4" aria-hidden />
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Retirer ${label}`}
        className="flex min-h-11 items-center justify-center gap-2 border border-red-300/20 px-3 text-sm text-red-200/75 outline-none transition hover:border-red-300/45 hover:text-red-100 focus-visible:ring-2 focus-visible:ring-red-300"
      >
        <Trash2 className="size-4" aria-hidden /> Retirer
      </button>
    </div>
  );
}

function PublishDialog({
  open,
  dirty,
  title,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  dirty: boolean;
  title: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="w-full max-w-lg border border-white/15 bg-[#17120e] p-5 text-white shadow-[0_30px_100px_rgba(0,0,0,0.65)] sm:p-7">
          <DialogHeader>
            <DialogTitle className="text-xl leading-7">Publier {title} ?</DialogTitle>
            <DialogDescription className="text-sm leading-6 text-white/55">
              Cette action remplace la version actuellement visible sur le site public.
              {dirty
                ? ' Tes dernières modifications seront d’abord enregistrées dans le brouillon.'
                : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="my-6 border-l-2 border-[#f4bb52] bg-[#f4bb52]/[0.07] px-4 py-3 text-sm leading-6 text-white/75">
            Après publication, ouvre la campagne sur le site et vérifie son texte ainsi que tous ses
            médias.
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="min-h-11 rounded-none border-white/20 bg-transparent text-white hover:bg-white/[0.06] hover:text-white focus-visible:ring-[#f4bb52]"
              >
                Annuler
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={onConfirm}
              className="min-h-11 rounded-none bg-[#f4bb52] text-black hover:bg-[#ffd27a] focus-visible:ring-[#f4bb52]"
            >
              <Send className="size-4" aria-hidden /> Oui, publier
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
