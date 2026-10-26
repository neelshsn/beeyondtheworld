'use client';
/* eslint-disable @next/next/no-img-element -- authenticated media URLs cannot use the public Next image loader */

import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Download,
  ExternalLink,
  FileCheck2,
  Film,
  ImageIcon,
  Link2,
  LoaderCircle,
  LogOut,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Upload,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import Link from 'next/link';
import type {
  AssetKit,
  CreativeAsset,
  CreatorApplication,
  EcosystemConnectionSummary,
  EcosystemEntityType,
  EcosystemRole,
  EcosystemSnapshot,
  LocalPartner,
  PartnerType,
  ReviewGate,
} from '@/lib/ecosystem/types';
import { DashboardCarousel } from '@/components/dashboard/dashboard-carousel';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import './ecosystem.css';

type CreatorTab = 'application' | 'kit';
type StudioTab = 'creators' | 'assets' | 'partners';
type Tab = CreatorTab | StudioTab;
type Drawer =
  | { kind: 'asset'; entity: CreativeAsset }
  | { kind: 'kit'; entity: AssetKit }
  | { kind: 'creator'; entity: CreatorApplication }
  | { kind: 'partner'; entity: LocalPartner }
  | { kind: 'new-partner' }
  | null;

type UploadState = {
  assetId: string;
  progress: number;
  status: 'reading' | 'uploading' | 'finishing';
};
type Spotlight = { kind: 'asset' | 'kit' | 'creator' | 'partner'; id: string } | null;

const demoRoles: { value: EcosystemRole; label: string }[] = [
  { value: 'creator', label: 'Visual Poet' },
  { value: 'curator', label: 'Creative curator' },
  { value: 'production', label: 'Head of Production' },
  { value: 'bee', label: 'BEE studio' },
];
const partnerLabels: Record<PartnerType, string> = {
  association: 'Impact organisation',
  territorial: 'Territorial partner',
  hospitality: 'Stay',
  food: 'Food',
  transport: 'Transport',
  guide: 'Guide',
  artisan: 'Artisan',
  venue: 'Venue',
  local_producer: 'Local producer',
};
const gates: {
  key: keyof Pick<CreativeAsset, 'authenticity' | 'rights' | 'safety' | 'humanCreative'>;
  label: string;
}[] = [
  { key: 'authenticity', label: 'Authenticity reviewed' },
  { key: 'rights', label: 'Usage rights reviewed' },
  { key: 'safety', label: 'Safety reviewed' },
  { key: 'humanCreative', label: 'Human creative review' },
];
const partnerSteps = [
  'Identity & contact',
  'Ethical fit',
  'Evidence',
  'Availability',
  'Quote or terms',
  'Budget or exchange value',
  'Safety',
  'Production approval',
];

const pretty = (value: string) =>
  value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
const formatDateTime = (value: unknown) => {
  if (typeof value !== 'string' || !value.trim()) return 'Date unavailable';
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toLocaleString('en-GB') : 'Date unavailable';
};
function normalizeSnapshot(value: EcosystemSnapshot): EcosystemSnapshot {
  const crm = value.crm
    ? {
        ...value.crm,
        companies: Array.isArray(value.crm.companies) ? value.crm.companies : [],
        opportunities: Array.isArray(value.crm.opportunities) ? value.crm.opportunities : [],
        productions: Array.isArray(value.crm.productions) ? value.crm.productions : [],
      }
    : null;
  return {
    ...value,
    applications: Array.isArray(value.applications)
      ? value.applications.map((application) => ({
          ...application,
          languages: Array.isArray(application.languages) ? application.languages : [],
          coveredDestinations: Array.isArray(application.coveredDestinations)
            ? application.coveredDestinations
            : [],
        }))
      : [],
    destinations: Array.isArray(value.destinations) ? value.destinations : [],
    kits: Array.isArray(value.kits) ? value.kits : [],
    assets: Array.isArray(value.assets) ? value.assets : [],
    partners: Array.isArray(value.partners)
      ? value.partners.map((partner) => ({
          ...partner,
          description: partner.description || '',
        }))
      : [],
    links: Array.isArray(value.links) ? value.links : [],
    targetOptions: Array.isArray(value.targetOptions) ? value.targetOptions : [],
    readiness: value.readiness && typeof value.readiness === 'object' ? value.readiness : {},
    destinationReadiness:
      value.destinationReadiness && typeof value.destinationReadiness === 'object'
        ? value.destinationReadiness
        : {},
    crm,
  };
}
function normalizeConnectionSummary(value: EcosystemConnectionSummary): EcosystemConnectionSummary {
  return {
    ...value,
    summary: {
      ...value.summary,
      kits: Array.isArray(value.summary.kits) ? value.summary.kits : [],
      destinations: Array.isArray(value.summary.destinations) ? value.summary.destinations : [],
      partnerStatuses:
        value.summary.partnerStatuses && typeof value.summary.partnerStatuses === 'object'
          ? value.summary.partnerStatuses
          : {},
    },
  };
}
const roleLabel = (role: EcosystemRole) =>
  role === 'commercial'
    ? 'CRM contributor'
    : demoRoles.find((item) => item.value === role)?.label || pretty(role);
const endpointFor = (
  scope: 'studio' | 'demo',
  context: string,
  role?: EcosystemRole,
  detailed = true
) =>
  `/api/community/ecosystem?scope=${scope}${detailed ? '&detail=1' : ''}${context}${scope === 'demo' && role ? `&role=${role}` : ''}`;
const mediaEndpoint = (
  id: string,
  scope: CreativeAsset['scope'],
  role?: EcosystemRole,
  download = false
) =>
  `/api/community/ecosystem/media?id=${encodeURIComponent(id)}&scope=${scope}${scope === 'demo' && role ? `&role=${role}` : ''}${download ? '&download=1' : ''}`;
const mediaActionEndpoint = (asset: CreativeAsset, role?: EcosystemRole) =>
  `/api/community/ecosystem/media?scope=${asset.scope}${asset.scope === 'demo' && role ? `&role=${role}` : ''}`;

async function inspectFile(file: File) {
  const url = URL.createObjectURL(file);
  try {
    if (file.type.startsWith('image/')) {
      const image = new Image();
      const loaded = new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('Image metadata could not be read.'));
      });
      image.src = url;
      await loaded;
      return { width: image.naturalWidth, height: image.naturalHeight };
    }
    const video = document.createElement('video');
    video.preload = 'metadata';
    const loaded = new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error('Video metadata could not be read.'));
    });
    video.src = url;
    await loaded;
    return {
      width: video.videoWidth,
      height: video.videoHeight,
      ...(Number.isFinite(video.duration) && video.duration > 0
        ? { durationSeconds: video.duration }
        : {}),
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function tabKeyboard(
  e: KeyboardEvent<HTMLButtonElement>,
  tabs: Tab[],
  current: number,
  choose: (tab: Tab) => void
) {
  const next =
    e.key === 'ArrowRight'
      ? (current + 1) % tabs.length
      : e.key === 'ArrowLeft'
        ? (current + tabs.length - 1) % tabs.length
        : e.key === 'Home'
          ? 0
          : e.key === 'End'
            ? tabs.length - 1
            : -1;
  if (next < 0) return;
  e.preventDefault();
  choose(tabs[next]);
  (e.currentTarget.parentElement?.children[next] as HTMLElement | undefined)?.focus();
}

function Status({ value }: { value: string }) {
  const positive = [
    'approved',
    'active',
    'published',
    'ready_to_sell',
    'internally_verified',
  ].includes(value);
  const attention = ['needs_replacement', 'declined', 'rejected'].includes(value);
  return (
    <span
      className={`eco-status ${positive ? 'is-positive' : ''} ${attention ? 'is-attention' : ''}`}
    >
      <i />
      {pretty(value)}
    </span>
  );
}

function EmptyState({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="eco-empty">
      <Circle aria-hidden="true" />
      <h2>{title}</h2>
      <p>{copy}</p>
    </div>
  );
}

function AssetPreview({
  asset,
  role,
  labelledBy,
}: {
  asset: CreativeAsset;
  role: EcosystemRole;
  labelledBy?: string;
}) {
  if (!asset.mediaId) {
    return (
      <div className="eco-asset-placeholder" aria-labelledby={labelledBy}>
        {asset.slot === 'photo' ? <ImageIcon aria-hidden="true" /> : <Film aria-hidden="true" />}
        <span>Original required</span>
      </div>
    );
  }
  if (asset.slot === 'photo') {
    return (
      <img
        src={mediaEndpoint(asset.mediaId, asset.scope, role)}
        alt={asset.title || `Photo ${asset.slotIndex}`}
      />
    );
  }
  return (
    <video
      src={mediaEndpoint(asset.mediaId, asset.scope, role)}
      preload="metadata"
      aria-labelledby={labelledBy}
    />
  );
}

function readinessFor(partner: LocalPartner) {
  const contactReady = Boolean(
    partner.contactName && (partner.contactEmail || partner.contactPhone)
  );
  const collaborationReady =
    partner.collaborationType === 'paid'
      ? partner.budgetAmount !== null
      : partner.exchangeValueAmount !== null &&
        Boolean(partner.exchangeTerms) &&
        Boolean(partner.deliverables);
  return [
    Boolean(partner.name && partner.description && contactReady),
    partner.status !== 'discovered',
    Boolean(partner.evidenceReference),
    Boolean(partner.availabilityNote),
    Boolean(partner.quoteReference || partner.exchangeTerms),
    collaborationReady && Boolean(partner.budgetCurrency),
    Boolean(partner.safetyNote),
    partner.productionValidated,
  ];
}

export function EcosystemWorkspace() {
  const [scope, setScope] = useState<'studio' | 'demo' | null>(null);
  const [contextQuery, setContextQuery] = useState('');
  const [hasCrmContext, setHasCrmContext] = useState(false);
  const [demoRole, setDemoRole] = useState<EcosystemRole | undefined>();
  const [snapshot, setSnapshot] = useState<EcosystemSnapshot | null>(null);
  const [commercialSummary, setCommercialSummary] = useState<EcosystemConnectionSummary | null>(
    null
  );
  const [authRequired, setAuthRequired] = useState(false);
  const [tab, setTab] = useState<Tab>('application');
  const [creatorKitId, setCreatorKitId] = useState('');
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [spotlight, setSpotlight] = useState<Spotlight>(null);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [upload, setUpload] = useState<UploadState | null>(null);
  const [applicationDraft, setApplicationDraft] = useState({
    displayName: '',
    homeDestination: '',
    portfolioUrl: '',
    biography: '',
    languages: '',
    coveredDestinations: '',
  });
  const abortUpload = useRef<AbortController | null>(null);
  const activeMediaId = useRef<string | null>(null);
  const uploadCancelled = useRef(false);
  const uploadInFlight = useRef(false);
  const preferredTab = useRef<Tab | null>(null);
  const drawerClose = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setScope(params.get('scope') === 'demo' ? 'demo' : 'studio');
    const context = new URLSearchParams();
    ['project', 'company', 'production', 'journey', 'booking'].forEach((key) => {
      const value = params.get(key);
      if (value) context.set(key, value);
    });
    setContextQuery(context.size ? `&${context.toString()}` : '');
    setHasCrmContext(Boolean(params.get('company') || params.get('production')));
    const requestedTab = params.get('tab');
    if (requestedTab === 'kits') preferredTab.current = 'assets';
    else if (requestedTab === 'partners') preferredTab.current = 'partners';
    else if (requestedTab === 'studio') preferredTab.current = 'creators';
    if (preferredTab.current) setTab(preferredTab.current);
  }, []);

  const endpoint = scope ? endpointFor(scope, contextQuery, demoRole) : '';

  async function load(signal?: AbortSignal): Promise<EcosystemSnapshot | null> {
    if (!endpoint || !scope) return null;
    const summaryEndpoint = endpointFor(scope, contextQuery, demoRole, false);
    let response = await fetch(hasCrmContext ? summaryEndpoint : endpoint, {
      cache: 'no-store',
      signal,
    });
    let body = (await response.json()) as
      (EcosystemSnapshot & { error?: string }) | (EcosystemConnectionSummary & { error?: string });
    if (response.status === 401) {
      setAuthRequired(!hasCrmContext);
      setSnapshot(null);
      setCommercialSummary(null);
      if (hasCrmContext)
        setError('Sign in to the CRM with the Community email authorised for this record.');
      return null;
    }
    if (!response.ok) throw new Error(body.error || 'The workspace could not be opened.');
    if (!body.viewer) {
      throw new Error('Open this connected record from an authorised CRM session.');
    }
    if ('summary' in body && body.viewer.role === 'commercial') {
      setAuthRequired(false);
      setError('');
      setSnapshot(null);
      setCommercialSummary(normalizeConnectionSummary(body));
      return null;
    }
    if (body.viewer.role === 'commercial') {
      throw new Error('Open a company or production record from the authorised CRM session.');
    }
    if ('summary' in body) {
      response = await fetch(endpoint, { cache: 'no-store', signal });
      body = (await response.json()) as EcosystemSnapshot & { error?: string };
      if (!response.ok) throw new Error(body.error || 'The workspace could not be opened.');
    }
    if ('summary' in body) throw new Error('The detailed workspace is unavailable.');
    const normalized = normalizeSnapshot(body);
    setAuthRequired(false);
    setError('');
    setCommercialSummary(null);
    setSnapshot(normalized);
    if (normalized.viewer.role === 'creator')
      setTab((value) => (value === 'application' || value === 'kit' ? value : 'application'));
    else
      setTab((value) => {
        const preferred = preferredTab.current;
        return preferred && ['creators', 'assets', 'partners'].includes(preferred)
          ? preferred
          : ['creators', 'assets', 'partners'].includes(value)
            ? value
            : 'creators';
      });
    return normalized;
  }

  useEffect(() => {
    if (!endpoint) return;
    const controller = new AbortController();
    setSnapshot(null);
    setCommercialSummary(null);
    setError('');
    load(controller.signal).catch((reason: unknown) => {
      if (reason instanceof DOMException && reason.name === 'AbortError') return;
      setError(reason instanceof Error ? reason.message : 'The workspace could not be opened.');
    });
    return () => controller.abort();
    // load is intentionally rebound to the current endpoint.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  useEffect(() => {
    const application = snapshot?.applications[0];
    if (!application) return;
    setApplicationDraft({
      displayName: application.displayName,
      homeDestination: application.homeDestination,
      portfolioUrl: application.portfolioUrl,
      biography: application.biography,
      languages: application.languages.join(', '),
      coveredDestinations: application.coveredDestinations.join(', '),
    });
  }, [snapshot]);

  useEffect(() => {
    if (!drawer) return;
    lastFocus.current = document.activeElement as HTMLElement;
    const timer = window.setTimeout(() => drawerClose.current?.focus(), 0);
    const close = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setDrawer(null);
      if (event.key !== 'Tab') return;
      const dialog = drawerClose.current?.closest<HTMLElement>('.eco-drawer');
      const focusable = dialog
        ? Array.from(
            dialog.querySelectorAll<HTMLElement>(
              'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])'
            )
          )
        : [];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', close);
    document.body.style.overflow = 'hidden';
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', close);
      document.body.style.overflow = '';
      lastFocus.current?.focus();
    };
  }, [drawer]);

  async function mutate(
    method: 'POST' | 'PATCH',
    payload: Record<string, unknown>,
    success: string
  ) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(body.error || 'The change could not be saved.');
      await load();
      setNotice(success);
      return true;
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The change could not be saved.');
      return false;
    } finally {
      setBusy(false);
    }
  }

  function changeRole(role: EcosystemRole) {
    if (scope !== 'demo' || !snapshot?.viewer.canSwitchDemoRole) return;
    setDemoRole(role);
    setDrawer(null);
  }

  async function signOut() {
    setSigningOut(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch('/api/community/auth', { method: 'DELETE' });
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(body.error || 'Sign out could not be completed.');
      setSnapshot(null);
      setCommercialSummary(null);
      setDrawer(null);
      setDemoRole(undefined);
      setCreatorKitId('');
      setQuery('');
      setApplicationDraft({
        displayName: '',
        homeDestination: '',
        portfolioUrl: '',
        biography: '',
        languages: '',
        coveredDestinations: '',
      });
      setAuthRequired(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Sign out could not be completed.');
    } finally {
      setSigningOut(false);
    }
  }

  async function saveApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const application = snapshot?.applications[0];
    const success = application ? 'Application updated.' : 'Application started.';
    const fields = {
      ...applicationDraft,
      languages: applicationDraft.languages
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
      coveredDestinations: applicationDraft.coveredDestinations
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
    };
    const payload = application
      ? {
          action: 'update-creator',
          entityId: application.id,
          version: application.version,
          ...fields,
        }
      : { action: 'request-creator', ...fields };
    await mutate(application ? 'PATCH' : 'POST', payload, success);
  }

  async function reviewCreator(
    application: CreatorApplication,
    action: 'review-creator' | 'approve-creator' | 'activate-creator' | 'decline-creator'
  ) {
    const ok = await mutate(
      'PATCH',
      { action, entityId: application.id, version: application.version },
      'Creator status updated.'
    );
    if (ok) setDrawer(null);
  }

  async function saveAsset(event: FormEvent<HTMLFormElement>, asset: CreativeAsset) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const ok = await mutate(
      'PATCH',
      {
        action: 'save-asset',
        entityId: asset.id,
        version: asset.version,
        title: String(data.get('title') || ''),
        description: String(data.get('description') || ''),
        location: String(data.get('location') || ''),
        credit: String(data.get('credit') || ''),
        rightsSummary: String(data.get('rightsSummary') || ''),
        rightsEvidence: String(data.get('rightsEvidence') || ''),
        rightsScope: String(data.get('rightsScope') || 'brand_presentation'),
        rightsExpiresAt: data.get('rightsExpiresAt') ? String(data.get('rightsExpiresAt')) : null,
        originalSourceUrl: String(data.get('originalSourceUrl') || ''),
        aiDisclosure: String(data.get('aiDisclosure') || 'none_declared'),
        softFadeConsent: data.get('softFadeConsent') === 'on',
        width: asset.width,
        height: asset.height,
        durationSeconds: asset.durationSeconds,
      },
      'Asset details saved.'
    );
    if (ok) setDrawer(null);
  }

  async function submitAsset(asset: CreativeAsset) {
    const ok = await mutate(
      'PATCH',
      { action: 'submit-asset', entityId: asset.id, version: asset.version },
      'Asset sent to the Studio.'
    );
    if (ok) setDrawer(null);
  }

  async function reviewAsset(event: FormEvent<HTMLFormElement>, asset: CreativeAsset) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const decision = String(data.get('decision') || 'replace');
    const reviewNote = String(data.get('reviewNote') || '');
    if (asset.aiDisclosure === 'ai_generated' && decision === 'approve') {
      if (asset.scope !== 'demo') {
        setError('AI-generated assets cannot be approved for Studio publication.');
        return;
      }
      if (!/\b(demo|demonstration)\b/i.test(reviewNote) || !/\b(ai|ia)\b/i.test(reviewNote)) {
        setError(
          'For a demo AI asset, the private review note must explicitly state “demo” and “AI”.'
        );
        return;
      }
    }
    const review = Object.fromEntries(
      gates.map(({ key }) => [key, String(data.get(key) || 'rejected')])
    ) as Record<string, ReviewGate>;
    const ok = await mutate(
      'PATCH',
      {
        action: 'review-asset',
        entityId: asset.id,
        version: asset.version,
        ...review,
        reviewNote,
        decision,
      },
      'Review saved for this asset.'
    );
    if (ok) setDrawer(null);
  }

  async function preparePublic(asset: CreativeAsset) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch(mediaActionEndpoint(asset, snapshot?.viewer.role), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'prepare-public', assetId: asset.id }),
      });
      const body = (await response.json()) as { mediaId?: string; error?: string };
      if (!response.ok || !body.mediaId)
        throw new Error(body.error || 'The Journeys rendition could not be prepared.');
      await load();
      setDrawer(null);
      setNotice('A rights-aware Journeys rendition is ready for publication review.');
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'The Journeys rendition could not be prepared.'
      );
    } finally {
      setBusy(false);
    }
  }

  async function uploadOriginal(asset: CreativeAsset, file: File) {
    if (!asset.id) return;
    if (uploadInFlight.current) {
      setError('Finish or cancel the current upload before starting another.');
      return;
    }
    const isVideo = file.type.startsWith('video/');
    const max = isVideo ? 200 * 1024 * 1024 : 20 * 1024 * 1024;
    if (!(isVideo || file.type.startsWith('image/'))) {
      setError('Choose an image or video original.');
      return;
    }
    if (file.size > max) {
      setError(`${isVideo ? 'Videos' : 'Images'} must be under ${isVideo ? '200 MB' : '20 MB'}.`);
      return;
    }
    uploadInFlight.current = true;
    uploadCancelled.current = false;
    activeMediaId.current = null;
    const controller = new AbortController();
    abortUpload.current = controller;
    setError('');
    setNotice('');
    setUpload({ assetId: asset.id, progress: 0, status: 'reading' });
    try {
      const technical = await inspectFile(file);
      if (uploadCancelled.current) throw new DOMException('Upload cancelled.', 'AbortError');
      const mediaUrl = mediaActionEndpoint(asset, snapshot?.viewer.role);
      const initResponse = await fetch(mediaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'init',
          assetId: asset.id,
          name: file.name,
          mime: file.type,
          size: file.size,
          ...technical,
        }),
      });
      const init = (await initResponse.json()) as {
        mediaId?: string;
        chunkSize?: number;
        error?: string;
      };
      if (!initResponse.ok || !init.mediaId || !init.chunkSize)
        throw new Error(init.error || 'Upload could not start.');
      activeMediaId.current = init.mediaId;
      if (uploadCancelled.current) {
        await fetch(mediaUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'abort', id: init.mediaId }),
        });
        activeMediaId.current = null;
        throw new DOMException('Upload cancelled.', 'AbortError');
      }
      const chunks = Math.ceil(file.size / init.chunkSize);
      for (let index = 0; index < chunks; index += 1) {
        setUpload({
          assetId: asset.id,
          progress: Math.round((index / chunks) * 100),
          status: 'uploading',
        });
        const chunk = file.slice(
          index * init.chunkSize,
          Math.min(file.size, (index + 1) * init.chunkSize)
        );
        const response = await fetch(
          `${mediaUrl}&id=${encodeURIComponent(init.mediaId)}&index=${index}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: chunk,
            signal: controller.signal,
          }
        );
        if (!response.ok) {
          const body = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error || `Chunk ${index + 1} could not be uploaded.`);
        }
      }
      setUpload({ assetId: asset.id, progress: 100, status: 'finishing' });
      const completeResponse = await fetch(mediaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ action: 'complete', id: init.mediaId }),
      });
      const complete = (await completeResponse.json()) as {
        mediaId?: string;
        metadata?: { durationSeconds?: number; width?: number; height?: number };
        error?: string;
      };
      if (!completeResponse.ok || complete.mediaId !== init.mediaId)
        throw new Error(complete.error || 'The original could not be finalised.');
      activeMediaId.current = null;
      const fresh = await load();
      const updatedAsset = fresh?.assets.find((item) => item.id === asset.id);
      if (updatedAsset && drawer?.kind === 'asset' && drawer.entity.id === asset.id)
        setDrawer({ kind: 'asset', entity: updatedAsset });
      setNotice('Original uploaded. Complete the credits and rights before submission.');
    } catch (reason) {
      const incompleteMediaId = activeMediaId.current;
      if (incompleteMediaId) {
        activeMediaId.current = null;
        await fetch(mediaActionEndpoint(asset, snapshot?.viewer.role), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'abort', id: incompleteMediaId }),
        }).catch(() => undefined);
      }
      if (!(reason instanceof DOMException && reason.name === 'AbortError')) {
        setError(reason instanceof Error ? reason.message : 'Upload failed.');
      }
    } finally {
      abortUpload.current = null;
      uploadCancelled.current = false;
      uploadInFlight.current = false;
      setUpload(null);
    }
  }

  async function cancelUpload() {
    uploadCancelled.current = true;
    abortUpload.current?.abort();
    const mediaId = activeMediaId.current;
    if (!mediaId || !upload) return;
    activeMediaId.current = null;
    const asset = snapshot?.assets.find((item) => item.id === upload.assetId);
    if (!asset) return;
    await fetch(mediaActionEndpoint(asset, snapshot?.viewer.role), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'abort', id: mediaId }),
    }).catch(() => undefined);
  }

  const isCreator = snapshot?.viewer.role === 'creator';
  const creatorTabs: Tab[] = ['application', 'kit'];
  const studioTabs: Tab[] = ['creators', 'assets', 'partners'];
  const tabs = isCreator ? creatorTabs : studioTabs;
  const application = snapshot?.applications[0];
  const creatorKit = snapshot?.kits.find((kit) => kit.id === creatorKitId) || snapshot?.kits[0];
  const viewer = snapshot?.viewer || commercialSummary?.viewer;
  const filteredPartners = useMemo(
    () =>
      (snapshot?.partners || []).filter((partner) =>
        [partner.name, partner.description, partner.type, partner.status]
          .join(' ')
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [query, snapshot]
  );

  const spotlightAsset =
    spotlight?.kind === 'asset'
      ? snapshot?.assets.find((asset) => asset.id === spotlight.id)
      : undefined;
  const spotlightPartner =
    spotlight?.kind === 'partner'
      ? snapshot?.partners.find((partner) => partner.id === spotlight.id)
      : undefined;
  const spotlightCreator =
    spotlight?.kind === 'creator'
      ? snapshot?.applications.find((creator) => creator.id === spotlight.id)
      : undefined;
  const spotlightKit =
    spotlight?.kind === 'kit'
      ? snapshot?.kits.find((kit) => kit.id === spotlight.id)
      : spotlightAsset
        ? snapshot?.kits.find((kit) => kit.id === spotlightAsset.kitId)
        : isCreator
          ? creatorKit
          : undefined;
  const spotlightDestination =
    snapshot?.destinations.find(
      (destination) =>
        destination.id ===
        (spotlightAsset?.destinationId ||
          spotlightPartner?.destinationId ||
          spotlightKit?.destinationId)
    ) || snapshot?.destinations[0];
  const backdropAsset =
    (spotlightAsset?.slot === 'photo' && spotlightAsset.mediaId ? spotlightAsset : undefined) ||
    snapshot?.assets.find(
      (asset) =>
        asset.destinationId === spotlightDestination?.id &&
        asset.slot === 'photo' &&
        Boolean(asset.mediaId)
    ) ||
    snapshot?.assets.find((asset) => asset.slot === 'photo' && Boolean(asset.mediaId));
  const backdropImage =
    backdropAsset?.mediaId && viewer
      ? mediaEndpoint(backdropAsset.mediaId, backdropAsset.scope, viewer.role)
      : '/assets/community/horizon/morocco-landscape.webp';
  const shellTitle =
    spotlightCreator?.homeDestination ||
    (isCreator && tab === 'application' ? application?.homeDestination : undefined) ||
    spotlightDestination?.country ||
    spotlightDestination?.title ||
    (isCreator ? 'Visual Poet' : 'Ecosystem');
  const shellMeta = spotlightKit
    ? `${spotlightKit.title} · ${pretty(spotlightKit.status)}`
    : spotlightPartner
      ? `${partnerLabels[spotlightPartner.type]} · ${pretty(spotlightPartner.status)}`
      : viewer
        ? `${roleLabel(viewer.role)} · ${viewer.scope === 'demo' ? 'Demonstration' : 'Private studio'}`
        : 'Visual Poets · Local partners';

  return (
    <div className="ecosystem-workspace">
      <DashboardShell
        image={backdropImage}
        eyebrow="Visual Poets · Local ecosystem"
        title={shellTitle}
        meta={shellMeta}
        description="Original travel imagery, reviewed by people and connected to trusted local production."
        layout="stacked"
        className="eco-dashboard-shell"
        backHref="/dashboard"
        backLabel="Dashboard"
        scope={scope || undefined}
        topActions={
          <div className="eco-shell-actions">
            {viewer && (
              <div className="eco-session">
                {snapshot?.viewer.canSwitchDemoRole && scope === 'demo' ? (
                  <label>
                    Explore a role
                    <select
                      value={demoRole || snapshot.viewer.role}
                      onChange={(event) => changeRole(event.target.value as EcosystemRole)}
                    >
                      {demoRoles.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <strong>{roleLabel(viewer.role)}</strong>
                )}
              </div>
            )}
            {viewer?.role === 'creator' ? (
              <button
                type="button"
                onClick={signOut}
                disabled={busy || signingOut}
                aria-label="Sign out"
              >
                {signingOut ? (
                  <LoaderCircle className="eco-spin" aria-hidden="true" />
                ) : (
                  <LogOut aria-hidden="true" />
                )}
                <span>Sign out</span>
              </button>
            ) : null}
          </div>
        }
        actions={
          snapshot ? (
            <nav
              className="eco-tabs"
              role="tablist"
              aria-label={isCreator ? 'Visual Poet workspace' : 'Studio workspace'}
            >
              {tabs.map((item, index) => (
                <button
                  key={item}
                  role="tab"
                  aria-selected={tab === item}
                  tabIndex={tab === item ? 0 : -1}
                  className={tab === item ? 'active' : ''}
                  onKeyDown={(event) =>
                    tabKeyboard(event, tabs, index, (nextTab) => {
                      preferredTab.current = nextTab;
                      setTab(nextTab);
                      setSpotlight(null);
                    })
                  }
                  onClick={() => {
                    preferredTab.current = item;
                    setTab(item);
                    setSpotlight(null);
                  }}
                >
                  {item === 'application' && <UserRound aria-hidden="true" />}
                  {item === 'kit' && <ImageIcon aria-hidden="true" />}
                  {item === 'creators' && <UsersRound aria-hidden="true" />}
                  {item === 'assets' && <FileCheck2 aria-hidden="true" />}
                  {item === 'partners' && <Building2 aria-hidden="true" />}
                  {pretty(item)}
                  {item === 'kit' && creatorKit && (
                    <small>{snapshot.readiness[creatorKit.id]?.approved || 0}/14</small>
                  )}
                  {item === 'creators' && <small>{snapshot.applications.length}</small>}
                  {item === 'assets' && (
                    <small>
                      {snapshot.assets.filter((asset) => asset.status !== 'draft').length}
                    </small>
                  )}
                  {item === 'partners' && <small>{snapshot.partners.length}</small>}
                </button>
              ))}
            </nav>
          ) : undefined
        }
      >
        <section className="eco-workspace-body">
          {scope === 'demo' && (
            <p className="eco-demo-note">
              <AlertCircle aria-hidden="true" /> Demonstration records are fictional and are never
              evidence of a real partner, creator or impact result.
            </p>
          )}
          {error && (
            <div className="eco-feedback is-error" role="alert">
              <AlertCircle aria-hidden="true" />
              <span>{error}</span>
              <button onClick={() => void load()}>
                <RefreshCw aria-hidden="true" /> Retry
              </button>
              {hasCrmContext && (
                <a href="/sales/">
                  <ExternalLink aria-hidden="true" /> Sign in to CRM
                </a>
              )}
            </div>
          )}
          {notice && (
            <div className="eco-feedback" role="status">
              <CheckCircle2 aria-hidden="true" />
              {notice}
            </div>
          )}

          {authRequired && <InlineLogin onSuccess={() => void load()} />}

          {commercialSummary && <CommercialSummaryPanel data={commercialSummary} />}

          {snapshot && (
            <>
              {isCreator && tab === 'application' && (
                <CreatorApplicationPanel
                  application={application}
                  draft={applicationDraft}
                  setDraft={setApplicationDraft}
                  onSubmit={saveApplication}
                  busy={busy}
                />
              )}
              {isCreator && tab === 'kit' && (
                <CreatorKitPanel
                  application={application}
                  kit={creatorKit}
                  kits={snapshot.kits}
                  assets={snapshot.assets}
                  role={snapshot.viewer.role}
                  readiness={creatorKit ? snapshot.readiness[creatorKit.id] : undefined}
                  upload={upload}
                  onSpotlight={(asset) => setSpotlight({ kind: 'asset', id: asset.id })}
                  onOpen={(asset) => {
                    setSpotlight({ kind: 'asset', id: asset.id });
                    setDrawer({ kind: 'asset', entity: asset });
                  }}
                  onChooseKit={(kitId) => {
                    setCreatorKitId(kitId);
                    setSpotlight({ kind: 'kit', id: kitId });
                  }}
                  onUpload={uploadOriginal}
                  onCancelUpload={() => void cancelUpload()}
                />
              )}
              {!isCreator && tab === 'creators' && (
                <CreatorReviewPanel
                  applications={snapshot.applications}
                  role={snapshot.viewer.role}
                  busy={busy}
                  onSpotlight={(entity) => setSpotlight({ kind: 'creator', id: entity.id })}
                  onOpen={(entity) => {
                    setSpotlight({ kind: 'creator', id: entity.id });
                    setDrawer({ kind: 'creator', entity });
                  }}
                  mutate={mutate}
                />
              )}
              {!isCreator && tab === 'assets' && (
                <AssetReviewPanel
                  snapshot={snapshot}
                  busy={busy}
                  onSpotlight={(entity) => setSpotlight({ kind: 'asset', id: entity.id })}
                  onOpen={(entity) => {
                    setSpotlight({ kind: 'asset', id: entity.id });
                    setDrawer({ kind: 'asset', entity });
                  }}
                  onOpenKit={(entity) => {
                    setSpotlight({ kind: 'kit', id: entity.id });
                    setDrawer({ kind: 'kit', entity });
                  }}
                  mutate={mutate}
                  onPublish={(kit) =>
                    mutate(
                      'PATCH',
                      { action: 'publish-kit', entityId: kit.id, version: kit.version },
                      snapshot.viewer.scope === 'demo'
                        ? 'Demo publication simulated privately. No Journey was changed.'
                        : 'Kit published to its linked Journey.'
                    )
                  }
                  onUnpublish={(kit) =>
                    mutate(
                      'PATCH',
                      { action: 'unpublish-kit', entityId: kit.id, version: kit.version },
                      snapshot.viewer.scope === 'demo'
                        ? 'Demo publication simulation stopped. No Journey was changed.'
                        : 'Kit unpublished and removed from its Journey.'
                    )
                  }
                />
              )}
              {!isCreator && tab === 'partners' && (
                <PartnersPanel
                  partners={filteredPartners}
                  query={query}
                  setQuery={setQuery}
                  onSpotlight={(entity) => setSpotlight({ kind: 'partner', id: entity.id })}
                  onOpen={(entity) => {
                    setSpotlight({ kind: 'partner', id: entity.id });
                    setDrawer({ kind: 'partner', entity });
                  }}
                  onNew={() => setDrawer({ kind: 'new-partner' })}
                />
              )}

              {!isCreator && (
                <section className="eco-links" aria-labelledby="connected-title">
                  <div>
                    <p className="eco-eyebrow">Connected operations</p>
                    <h2 id="connected-title">One story, shared identifiers.</h2>
                  </div>
                  <div className="eco-link-list">
                    <a href="/sales/">
                      <span>CRM</span>
                      <ExternalLink aria-hidden="true" />
                    </a>
                    <Link href="/dashboard">
                      <span>Dashboard</span>
                      <ExternalLink aria-hidden="true" />
                    </Link>
                    <Link href="/dashboard/creative">
                      <span>Creative Studio</span>
                      <ExternalLink aria-hidden="true" />
                    </Link>
                    <Link href="/journeys">
                      <span>Journeys</span>
                      <ExternalLink aria-hidden="true" />
                    </Link>
                    <Link href="/client">
                      <span>Bookings</span>
                      <ExternalLink aria-hidden="true" />
                    </Link>
                  </div>
                  <p className="eco-link-note">
                    Links preserve Creator, Asset, Destination, Journey and Booking IDs. Commercial
                    catalogues, budgets and brand briefs remain available only in authorised
                    internal systems.
                  </p>
                </section>
              )}
            </>
          )}

          {!snapshot && !commercialSummary && !error && !authRequired && (
            <div className="eco-loading" role="status">
              <LoaderCircle aria-hidden="true" /> Opening the workspace…
            </div>
          )}
        </section>
      </DashboardShell>

      {drawer && snapshot && (
        <div
          className="eco-drawer-layer"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDrawer(null);
          }}
        >
          <aside
            className="eco-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
          >
            <button
              ref={drawerClose}
              className="eco-icon-button eco-drawer-close"
              aria-label="Close details"
              onClick={() => setDrawer(null)}
            >
              <X />
            </button>
            {drawer.kind === 'asset' && (
              <AssetDrawer
                asset={drawer.entity}
                isCreator={isCreator}
                role={snapshot.viewer.role}
                upload={upload}
                busy={busy}
                onSave={saveAsset}
                onSubmit={submitAsset}
                onReview={reviewAsset}
                onUpload={uploadOriginal}
                onCancelUpload={() => void cancelUpload()}
                onPreparePublic={preparePublic}
                links={snapshot.links}
                targetOptions={snapshot.targetOptions}
                mutate={mutate}
              />
            )}
            {drawer.kind === 'kit' && (
              <KitDrawer kit={drawer.entity} snapshot={snapshot} mutate={mutate} />
            )}
            {drawer.kind === 'creator' && (
              <CreatorDrawer
                application={drawer.entity}
                role={snapshot.viewer.role}
                busy={busy}
                onAction={reviewCreator}
                links={snapshot.links}
                targetOptions={snapshot.targetOptions}
                mutate={mutate}
              />
            )}
            {drawer.kind === 'partner' && (
              <PartnerDrawer
                partner={drawer.entity}
                role={snapshot.viewer.role}
                busy={busy}
                mutate={mutate}
                onClose={() => setDrawer(null)}
                links={snapshot.links}
                targetOptions={snapshot.targetOptions}
              />
            )}
            {drawer.kind === 'new-partner' && (
              <NewPartnerDrawer
                destinations={snapshot.destinations}
                busy={busy}
                mutate={mutate}
                onClose={() => setDrawer(null)}
              />
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

function CommercialSummaryPanel({ data }: { data: EcosystemConnectionSummary }) {
  const { counts } = data.summary;
  const metrics = [
    { label: 'Destination kits', value: counts.kits },
    { label: 'Creative assets', value: counts.assets },
    { label: 'Approved assets', value: counts.approvedAssets },
    { label: 'Local partners', value: counts.partners },
    { label: 'Ready partners', value: counts.readyPartners },
  ];
  return (
    <section className="eco-commercial" aria-labelledby="commercial-title">
      <div className="eco-commercial-head">
        <div>
          <p className="eco-eyebrow">Connected CRM record · Read only</p>
          <h2 id="commercial-title">Creative and local delivery at a glance.</h2>
          <p>
            Live operational counts for this company or production. Studio reviews and private
            creator records stay with the authorised BEE team.
          </p>
        </div>
        <a href="/sales/" className="eco-primary">
          Return to CRM <ExternalLink aria-hidden="true" />
        </a>
      </div>

      <div className="eco-commercial-metrics" aria-label="Connected record totals">
        {metrics.map((metric) => (
          <article key={metric.label}>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </article>
        ))}
      </div>

      <div className="eco-commercial-grid">
        <section aria-labelledby="commercial-kits-title">
          <div className="eco-section-label">
            <h3 id="commercial-kits-title">Destination kits</h3>
            <span>
              {counts.approvedAssets}/{counts.assets} assets approved
            </span>
          </div>
          {data.summary.kits.length ? (
            <div className="eco-summary-list">
              {data.summary.kits.map((kit) => (
                <article key={kit.id}>
                  <div>
                    <strong>{kit.title}</strong>
                    <small>
                      {kit.readiness.approved}/{kit.readiness.required} approved
                    </small>
                  </div>
                  <Status value={kit.status} />
                </article>
              ))}
            </div>
          ) : (
            <p className="eco-summary-empty">No connected destination kit yet.</p>
          )}
        </section>

        <section aria-labelledby="commercial-destinations-title">
          <div className="eco-section-label">
            <h3 id="commercial-destinations-title">Destination readiness</h3>
            <span>{data.summary.destinations.length} connected</span>
          </div>
          {data.summary.destinations.length ? (
            <div className="eco-summary-list">
              {data.summary.destinations.map((destination) => (
                <article key={destination.id}>
                  <div>
                    <strong>{destination.title}</strong>
                    <small>
                      {destination.readiness.ready
                        ? 'Ready for internal delivery'
                        : `${destination.readiness.missing.length} checks remaining`}
                    </small>
                  </div>
                  <Status value={destination.readiness.ready ? 'ready_to_sell' : 'in_review'} />
                </article>
              ))}
            </div>
          ) : (
            <p className="eco-summary-empty">No connected destination yet.</p>
          )}
        </section>
      </div>

      {Object.keys(data.summary.partnerStatuses).length > 0 && (
        <div className="eco-commercial-statuses" aria-label="Partner qualification stages">
          {Object.entries(data.summary.partnerStatuses).map(([status, count]) => (
            <span key={status}>
              {pretty(status)} <strong>{count}</strong>
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

function InlineLogin({ onSuccess }: { onSuccess: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/community/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.get('email'), password: data.get('password') }),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(body.error || 'Could not sign in.');
      onSuccess();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="eco-login" aria-labelledby="login-title">
      <div className="eco-login-art" />
      <form onSubmit={submit}>
        <p className="eco-eyebrow">Private creator portal</p>
        <h2 id="login-title">Continue your journey.</h2>
        <p>Your Community account opens only the creator work assigned to you.</p>
        <label>
          Email
          <input required type="email" name="email" autoComplete="email" />
        </label>
        <label>
          Password
          <input required type="password" name="password" autoComplete="current-password" />
        </label>
        {error && (
          <p className="eco-inline-error" role="alert">
            {error}
          </p>
        )}
        <button disabled={busy} className="eco-primary">
          {busy ? <LoaderCircle className="spin" /> : <ArrowRight />} Sign in
        </button>
        <Link href="/community/reset-password">Forgot your password?</Link>
      </form>
    </section>
  );
}

function CreatorApplicationPanel({
  application,
  draft,
  setDraft,
  onSubmit,
  busy,
}: {
  application?: CreatorApplication;
  draft: {
    displayName: string;
    homeDestination: string;
    portfolioUrl: string;
    biography: string;
    languages: string;
    coveredDestinations: string;
  };
  setDraft: (value: {
    displayName: string;
    homeDestination: string;
    portfolioUrl: string;
    biography: string;
    languages: string;
    coveredDestinations: string;
  }) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  busy: boolean;
}) {
  const editable =
    !application || !['active', 'declined', 'suspended'].includes(application.status);
  return (
    <section className="eco-panel eco-application" role="tabpanel">
      <div className="eco-panel-intro">
        <div>
          <p className="eco-eyebrow">Personal portal</p>
          <h2>Become a BEE Visual Poet.</h2>
        </div>
        <div className="eco-stage">
          <span>Application</span>
          <ChevronRight />
          <span>Human review</span>
          <ChevronRight />
          <span>Destination kits</span>
        </div>
      </div>
      {application && (
        <div className="eco-state-banner">
          <div>
            <Status value={application.status} />
            <strong>
              {application.status === 'approved' || application.status === 'active'
                ? 'Your profile is ready for destination kits.'
                : 'The BEE team reviews every application personally.'}
            </strong>
          </div>
          <small>Application ID · {application.id}</small>
        </div>
      )}
      <form className="eco-form" onSubmit={onSubmit}>
        <div className="eco-form-section">
          <span>01</span>
          <div>
            <h3>Your practice</h3>
            <p>Tell us who you are and how you observe a place.</p>
          </div>
        </div>
        <div className="eco-form-grid">
          <label>
            Creator name
            <input
              required
              disabled={!editable}
              value={draft.displayName}
              onChange={(event) => setDraft({ ...draft, displayName: event.target.value })}
            />
          </label>
          <label>
            Home destination
            <input
              required
              disabled={!editable}
              value={draft.homeDestination}
              onChange={(event) => setDraft({ ...draft, homeDestination: event.target.value })}
            />
          </label>
          <label className="is-wide">
            Portfolio URL
            <input
              required
              type="url"
              disabled={!editable}
              value={draft.portfolioUrl}
              onChange={(event) => setDraft({ ...draft, portfolioUrl: event.target.value })}
            />
          </label>
          <label>
            Languages
            <input
              disabled={!editable}
              value={draft.languages}
              onChange={(event) => setDraft({ ...draft, languages: event.target.value })}
              placeholder="English, French"
            />
          </label>
          <label>
            Destinations you cover
            <input
              disabled={!editable}
              value={draft.coveredDestinations}
              onChange={(event) => setDraft({ ...draft, coveredDestinations: event.target.value })}
              placeholder="Morocco, Portugal"
            />
          </label>
          <label className="is-wide">
            Short biography
            <textarea
              required
              rows={5}
              disabled={!editable}
              value={draft.biography}
              onChange={(event) => setDraft({ ...draft, biography: event.target.value })}
            />
          </label>
        </div>
        <div className="eco-form-footer">
          <p>
            Submitting does not publish your work or create a contract. BEE validates applications
            and creative work humanly.
          </p>
          {editable && (
            <button className="eco-primary" disabled={busy}>
              {busy ? <LoaderCircle className="spin" /> : <ArrowRight />}{' '}
              {application ? 'Update application' : 'Send application'}
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

function CreatorKitPanel({
  application,
  kit,
  kits,
  assets,
  role,
  readiness,
  upload,
  onSpotlight,
  onOpen,
  onChooseKit,
  onUpload,
  onCancelUpload,
}: {
  application?: CreatorApplication;
  kit?: AssetKit;
  kits: AssetKit[];
  assets: CreativeAsset[];
  role: EcosystemRole;
  readiness?: {
    approved: number;
    required: 14;
    ready: boolean;
    missing: string[];
    invalid: string[];
  };
  upload: UploadState | null;
  onSpotlight: (asset: CreativeAsset) => void;
  onOpen: (asset: CreativeAsset) => void;
  onChooseKit: (kitId: string) => void;
  onUpload: (asset: CreativeAsset, file: File) => void;
  onCancelUpload: () => void;
}) {
  const [selectedAssetId, setSelectedAssetId] = useState('');
  if (!application || !['approved', 'active'].includes(application.status))
    return (
      <EmptyState
        title="Kits open after approval."
        copy="Your personal workspace will reveal destination assignments once the BEE team approves your application."
      />
    );
  if (!kit)
    return (
      <EmptyState
        title="No destination kit yet."
        copy="Your profile is approved. The BEE team will assign a destination when a kit is ready for you."
      />
    );
  const ordered = assets
    .filter((asset) => asset.kitId === kit.id)
    .sort(
      (a, b) =>
        ['hero', 'reel', 'photo'].indexOf(a.slot) - ['hero', 'reel', 'photo'].indexOf(b.slot) ||
        a.slotIndex - b.slotIndex
    );
  const selectedId = ordered.some((asset) => asset.id === selectedAssetId)
    ? selectedAssetId
    : ordered[0]?.id;
  const slides = ordered.map((asset) => ({
    id: asset.id,
    title: asset.title || `${pretty(asset.slot)} ${asset.slotIndex}`,
    subtitle: asset.slot === 'hero' ? 'Hero · 15–30s' : `${pretty(asset.slot)} ${asset.slotIndex}`,
    meta: asset.reviewNote || asset.location || 'Original and usage details',
    badge: pretty(asset.status),
  }));
  return (
    <section className="eco-panel" role="tabpanel">
      {kits.length > 1 && (
        <label className="eco-kit-switcher">
          Destination assignment
          <select value={kit.id} onChange={(event) => onChooseKit(event.target.value)}>
            {kits.map((option) => (
              <option key={option.id} value={option.id}>
                {option.title} · {pretty(option.status)}
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="eco-kit-head">
        <div>
          <p className="eco-eyebrow">Destination kit</p>
          <h2>{kit.title}</h2>
          <p>
            One hero film, three reels and ten photographs. Upload original files and complete every
            credit and right.
          </p>
        </div>
        <div className="eco-progress-card">
          <div>
            <strong>{readiness?.approved || 0}</strong>
            <span>of 14 approved</span>
          </div>
          <progress max={14} value={readiness?.approved || 0}>
            {readiness?.approved || 0}/14
          </progress>
          <Status value={kit.status} />
        </div>
      </div>
      {ordered.length ? (
        <>
          <DashboardCarousel
            items={slides}
            selectedId={selectedId}
            onSelect={(id) => {
              setSelectedAssetId(id);
              const asset = ordered.find((item) => item.id === id);
              if (asset) onSpotlight(asset);
            }}
            onOpen={(id) => {
              const asset = ordered.find((item) => item.id === id);
              if (asset) onOpen(asset);
            }}
            openLabel="Open asset"
            label={`${kit.title} · 14 asset slots`}
            layout="atlas"
            renderMedia={(item) => {
              const asset = ordered.find((entry) => entry.id === item.id);
              return asset ? <AssetPreview asset={asset} role={role} /> : null;
            }}
          />
          <details className="eco-operational-details">
            <summary>Manage uploads and all 14 slots</summary>
            <div className="eco-assets-grid">
              {ordered.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  role={role}
                  upload={upload}
                  onOpen={onOpen}
                  onUpload={onUpload}
                  onCancelUpload={onCancelUpload}
                />
              ))}
            </div>
          </details>
        </>
      ) : (
        <EmptyState
          title="Asset slots are not available yet."
          copy="The Studio needs to recreate this destination kit before originals can be uploaded."
        />
      )}
    </section>
  );
}

function AssetCard({
  asset,
  role,
  upload,
  onOpen,
  onUpload,
  onCancelUpload,
}: {
  asset: CreativeAsset;
  role: EcosystemRole;
  upload: UploadState | null;
  onOpen: (asset: CreativeAsset) => void;
  onUpload: (asset: CreativeAsset, file: File) => void;
  onCancelUpload: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const active = upload?.assetId === asset.id;
  return (
    <article className={`eco-asset-card is-${asset.slot}`}>
      <button
        className="eco-asset-visual"
        onClick={() => onOpen(asset)}
        aria-labelledby={`asset-${asset.id}`}
      >
        <AssetPreview asset={asset} role={role} labelledBy={`asset-${asset.id}`} />
        <span className="eco-slot">
          {asset.slot === 'hero' ? 'Hero · 15–30s' : `${pretty(asset.slot)} ${asset.slotIndex}`}
        </span>
      </button>
      <div className="eco-asset-body">
        <div>
          <h3 id={`asset-${asset.id}`}>
            {asset.title || `${pretty(asset.slot)} ${asset.slotIndex}`}
          </h3>
          <Status value={asset.status} />
        </div>
        {asset.status === 'needs_replacement' && asset.reviewNote && (
          <p className="eco-review-note">{asset.reviewNote}</p>
        )}
        <div className="eco-card-actions">
          <button onClick={() => onOpen(asset)}>
            Details <ArrowRight />
          </button>
          <input
            ref={input}
            hidden
            type="file"
            accept={asset.slot === 'photo' ? 'image/*' : 'video/*'}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onUpload(asset, file);
              event.currentTarget.value = '';
            }}
          />
          {active ? (
            <button
              className="eco-uploading"
              disabled={upload.status === 'finishing'}
              onClick={onCancelUpload}
            >
              {upload.status === 'finishing' ? <LoaderCircle /> : <X />}{' '}
              {upload.status === 'finishing' ? 'Finalising' : `${upload.progress}%`}
            </button>
          ) : (
            <button disabled={!asset.id || Boolean(upload)} onClick={() => input.current?.click()}>
              <Upload /> {asset.mediaId ? 'Replace' : 'Upload'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function CreatorReviewPanel({
  applications,
  role,
  busy,
  onSpotlight,
  onOpen,
  mutate,
}: {
  applications: CreatorApplication[];
  role: EcosystemRole;
  busy: boolean;
  onSpotlight: (application: CreatorApplication) => void;
  onOpen: (application: CreatorApplication) => void;
  mutate: (
    method: 'POST' | 'PATCH',
    payload: Record<string, unknown>,
    success: string
  ) => Promise<boolean>;
}) {
  const [creating, setCreating] = useState(false);
  const [selectedCreatorId, setSelectedCreatorId] = useState('');
  async function createCreator(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const list = (name: string) =>
      String(data.get(name) || '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
    const ok = await mutate(
      'POST',
      {
        action: 'create-creator',
        email: String(data.get('email') || ''),
        displayName: String(data.get('displayName') || ''),
        homeDestination: String(data.get('homeDestination') || ''),
        portfolioUrl: String(data.get('portfolioUrl') || ''),
        biography: String(data.get('biography') || ''),
        languages: list('languages'),
        coveredDestinations: list('coveredDestinations'),
      },
      'Creator profile created. Review it before preparing a private invitation.'
    );
    if (ok) setCreating(false);
  }
  const selectedId = applications.some((application) => application.id === selectedCreatorId)
    ? selectedCreatorId
    : applications[0]?.id;
  const slides = applications.map((application) => ({
    id: application.id,
    title: application.displayName,
    subtitle: application.homeDestination || 'Visual Poet',
    image: '/assets/community/horizon/morocco-talent.webp',
    meta: application.languages.join(' · ') || application.coveredDestinations.join(' · '),
    badge: pretty(application.status),
  }));
  return (
    <section className="eco-panel" role="tabpanel">
      <div className="eco-panel-intro">
        <div>
          <p className="eco-eyebrow">Creator review</p>
          <h2>People before profiles.</h2>
          <p>Authenticate identity and practice, then make a deliberate creative decision.</p>
        </div>
        {['bee', 'curator'].includes(role) && (
          <button className="eco-primary" onClick={() => setCreating((value) => !value)}>
            {creating ? <X aria-hidden="true" /> : <Plus aria-hidden="true" />}
            {creating ? 'Close form' : 'Add creator'}
          </button>
        )}
      </div>
      {creating && (
        <form className="eco-setup-form" onSubmit={createCreator}>
          <div className="eco-setup-heading">
            <div>
              <p className="eco-eyebrow">Private profile</p>
              <h3>Create before inviting</h3>
            </div>
            <p>
              The creator receives no access until the Studio prepares and shares an invitation.
            </p>
          </div>
          <div className="eco-setup-grid">
            <label>
              Full name
              <input name="displayName" required maxLength={120} />
            </label>
            <label>
              Email
              <input name="email" type="email" required maxLength={254} />
            </label>
            <label>
              Home destination
              <input name="homeDestination" required maxLength={160} />
            </label>
            <label>
              HTTPS portfolio
              <input name="portfolioUrl" type="url" required pattern="https://.*" />
            </label>
            <label>
              Languages
              <input name="languages" required placeholder="French, English" />
            </label>
            <label>
              Covered destinations
              <input name="coveredDestinations" required placeholder="Dakar, Saint-Louis" />
            </label>
            <label className="is-wide">
              Short biography
              <textarea name="biography" required rows={4} maxLength={3000} />
            </label>
          </div>
          <div className="eco-setup-actions">
            <button type="button" onClick={() => setCreating(false)}>
              Cancel
            </button>
            <button className="eco-primary" disabled={busy}>
              Create private profile <ArrowRight aria-hidden="true" />
            </button>
          </div>
        </form>
      )}
      {applications.length ? (
        <>
          <DashboardCarousel
            items={slides}
            selectedId={selectedId}
            onSelect={(id) => {
              setSelectedCreatorId(id);
              const application = applications.find((item) => item.id === id);
              if (application) onSpotlight(application);
            }}
            onOpen={(id) => {
              const application = applications.find((item) => item.id === id);
              if (application) onOpen(application);
            }}
            openLabel="Open profile"
            label="Visual Poet applications"
            layout="atlas"
          />
          <details className="eco-operational-details">
            <summary>Review all applications</summary>
            <div className="eco-table-list">
              {applications.map((application) => (
                <button
                  key={application.id}
                  className="eco-table-row"
                  onClick={() => onOpen(application)}
                >
                  <span className="eco-avatar">
                    <UserRound />
                  </span>
                  <span>
                    <strong>{application.displayName}</strong>
                    <small>{application.homeDestination}</small>
                  </span>
                  <span>
                    <Status value={application.status} />
                  </span>
                  <span className="eco-row-portfolio">
                    {application.portfolioUrl.replace(/^https?:\/\//, '')}
                  </span>
                  <ArrowRight />
                </button>
              ))}
            </div>
          </details>
        </>
      ) : (
        !creating && (
          <EmptyState
            title="No creator applications."
            copy="Create a private profile here, or wait for a creator to apply from their personal workspace."
          />
        )
      )}
    </section>
  );
}

function AssetReviewPanel({
  snapshot,
  busy,
  onSpotlight,
  onOpen,
  onOpenKit,
  onPublish,
  onUnpublish,
  mutate,
}: {
  snapshot: EcosystemSnapshot;
  busy: boolean;
  onSpotlight: (asset: CreativeAsset) => void;
  onOpen: (asset: CreativeAsset) => void;
  onOpenKit: (kit: AssetKit) => void;
  onPublish: (kit: AssetKit) => Promise<boolean>;
  onUnpublish: (kit: AssetKit) => Promise<boolean>;
  mutate: (
    method: 'POST' | 'PATCH',
    payload: Record<string, unknown>,
    success: string
  ) => Promise<boolean>;
}) {
  const [setup, setSetup] = useState<'destination' | 'kit' | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const assets = snapshot.assets.filter((asset) => asset.status !== 'draft');
  const approvedCreators = snapshot.applications.filter((creator) =>
    ['approved', 'active'].includes(creator.status)
  );
  async function createDestination(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const ok = await mutate(
      'POST',
      {
        action: 'create-destination',
        title: String(data.get('title') || ''),
        country: String(data.get('country') || ''),
        territory: String(data.get('territory') || ''),
        description: String(data.get('description') || ''),
        creativeDirectionApproved: data.get('creativeDirectionApproved') === 'on',
        productionApproved: data.get('productionApproved') === 'on',
        globalBudgetReference: String(data.get('globalBudgetReference') || ''),
      },
      'Destination created. You can now assign its first 14-slot kit.'
    );
    if (ok) setSetup('kit');
  }
  async function createKit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const ok = await mutate(
      'POST',
      {
        action: 'create-kit',
        title: String(data.get('title') || ''),
        destinationId: String(data.get('destinationId') || ''),
        creatorId: String(data.get('creatorId') || ''),
      },
      'Kit created and its 14 asset slots assigned to the Visual Poet.'
    );
    if (ok) setSetup(null);
  }
  const selectedId = assets.some((asset) => asset.id === selectedAssetId)
    ? selectedAssetId
    : assets[0]?.id;
  const slides = assets.map((asset) => {
    const destination = snapshot.destinations.find((item) => item.id === asset.destinationId);
    const approvedGates = gates.filter((gate) => asset[gate.key] === 'approved').length;
    return {
      id: asset.id,
      title: asset.title || `${pretty(asset.slot)} ${asset.slotIndex}`,
      subtitle: `${destination?.title || 'Destination'} · ${pretty(asset.slot)} ${asset.slotIndex}`,
      meta: `${approvedGates}/4 human review gates approved`,
      badge: pretty(asset.status),
    };
  });
  return (
    <section className="eco-panel eco-asset-review-panel" role="tabpanel">
      <div className="eco-panel-intro">
        <div>
          <p className="eco-eyebrow">Studio review</p>
          <h2>Verify every frame.</h2>
          <p>Metadata guides the review. It never proves authenticity on its own.</p>
        </div>
        <div className="eco-panel-actions">
          <div className="eco-legend">
            <span>
              <i className="is-pending" /> Pending
            </span>
            <span>
              <i className="is-approved" /> Approved
            </span>
            <span>
              <i className="is-rejected" /> Attention
            </span>
          </div>
          <button className="eco-primary" onClick={() => setSetup('destination')}>
            <Plus aria-hidden="true" /> New destination
          </button>
          <button onClick={() => setSetup('kit')}>
            <ImageIcon aria-hidden="true" /> Assign kit
          </button>
        </div>
      </div>
      {setup === 'destination' && (
        <form className="eco-setup-form" onSubmit={createDestination}>
          <div className="eco-setup-heading">
            <div>
              <p className="eco-eyebrow">Step 1 · Destination</p>
              <h3>Open a place for production</h3>
            </div>
            <p>Start with the place. Approval checks can remain open until evidence is reviewed.</p>
          </div>
          <div className="eco-setup-grid">
            <label>
              Destination name
              <input name="title" required maxLength={160} />
            </label>
            <label>
              Country
              <input name="country" required maxLength={100} />
            </label>
            <label>
              Territory
              <input name="territory" required maxLength={160} />
            </label>
            <label>
              Internal budget reference
              <input name="globalBudgetReference" maxLength={2000} />
            </label>
            <label className="is-wide">
              Context
              <textarea name="description" rows={3} maxLength={3000} />
            </label>
          </div>
          <details className="eco-setup-details">
            <summary>Approval checks</summary>
            <p>Mark these only when the recorded internal approval already exists.</p>
            <label>
              <input name="creativeDirectionApproved" type="checkbox" /> Creative direction approved
            </label>
            <label>
              <input name="productionApproved" type="checkbox" /> Head of Production approved
            </label>
          </details>
          <div className="eco-setup-actions">
            <button type="button" onClick={() => setSetup(null)}>
              Cancel
            </button>
            <button className="eco-primary" disabled={busy}>
              Create destination <ArrowRight aria-hidden="true" />
            </button>
          </div>
        </form>
      )}
      {setup === 'kit' && (
        <form className="eco-setup-form" onSubmit={createKit}>
          <div className="eco-setup-heading">
            <div>
              <p className="eco-eyebrow">Step 2 · Assignment</p>
              <h3>Assign a 14-slot kit</h3>
            </div>
            <p>
              One hero, three reels and ten photos will be created for the selected Visual Poet.
            </p>
          </div>
          <div className="eco-setup-grid">
            <label className="is-wide">
              Kit title
              <input name="title" required maxLength={160} placeholder="Dakar visual story" />
            </label>
            <label>
              Destination
              <select name="destinationId" required defaultValue="">
                <option value="" disabled>
                  Choose destination
                </option>
                {snapshot.destinations.map((destination) => (
                  <option key={destination.id} value={destination.id}>
                    {destination.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Approved Visual Poet
              <select name="creatorId" required defaultValue="">
                <option value="" disabled>
                  Choose creator
                </option>
                {approvedCreators.map((creator) => (
                  <option key={creator.id} value={creator.id}>
                    {creator.displayName} · {creator.homeDestination}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {(!snapshot.destinations.length || !approvedCreators.length) && (
            <p className="eco-setup-warning" role="status">
              <AlertCircle aria-hidden="true" /> Create a destination and approve at least one
              Visual Poet before assigning a kit.
            </p>
          )}
          <div className="eco-setup-actions">
            <button type="button" onClick={() => setSetup(null)}>
              Cancel
            </button>
            <button
              className="eco-primary"
              disabled={busy || !snapshot.destinations.length || !approvedCreators.length}
            >
              Create and assign 14 slots <ArrowRight aria-hidden="true" />
            </button>
          </div>
        </form>
      )}
      {snapshot.kits.length > 0 && (
        <details className="eco-kit-disclosure">
          <summary>
            {snapshot.kits.length} destination {snapshot.kits.length === 1 ? 'kit' : 'kits'} ·
            connections
          </summary>
          <div className="eco-kit-strip" aria-label="Destination kits">
            {snapshot.kits.map((kit) => {
              const readiness = snapshot.readiness[kit.id];
              const kitAssets = snapshot.assets.filter((asset) => asset.kitId === kit.id);
              const renditionsReady =
                kitAssets.length === 14 && kitAssets.every((asset) => asset.publicMediaId);
              const journeyLinks = snapshot.links.filter(
                (link) =>
                  link.entityType === 'kit' &&
                  link.entityId === kit.id &&
                  link.targetType === 'journey'
              );
              const canPublish =
                ['bee', 'curator'].includes(snapshot.viewer.role) &&
                Boolean(readiness?.ready) &&
                renditionsReady &&
                journeyLinks.length === 1 &&
                kit.status !== 'published';
              return (
                <article key={kit.id}>
                  <div className="eco-kit-copy">
                    <small>Kit · {readiness?.approved || 0}/14 approved</small>
                    <strong>{kit.title}</strong>
                  </div>
                  <Status value={kit.status} />
                  <div className="eco-kit-actions">
                    <button onClick={() => onOpenKit(kit)}>
                      {journeyLinks.length === 1 ? 'Connections' : 'Connect Journey'} <Link2 />
                    </button>
                    {canPublish && (
                      <button
                        className="eco-primary"
                        disabled={busy}
                        onClick={() => void onPublish(kit)}
                      >
                        {snapshot.viewer.scope === 'demo'
                          ? 'Simulate publication'
                          : 'Publish to Journey'}{' '}
                        <ArrowRight />
                      </button>
                    )}
                    {kit.status === 'published' &&
                      ['bee', 'curator'].includes(snapshot.viewer.role) && (
                        <button disabled={busy} onClick={() => void onUnpublish(kit)}>
                          {snapshot.viewer.scope === 'demo' ? 'Stop simulation' : 'Unpublish'} <X />
                        </button>
                      )}
                  </div>
                </article>
              );
            })}
          </div>
        </details>
      )}
      {assets.length ? (
        <DashboardCarousel
          items={slides}
          selectedId={selectedId}
          onSelect={(id) => {
            setSelectedAssetId(id);
            const asset = assets.find((item) => item.id === id);
            if (asset) onSpotlight(asset);
          }}
          onOpen={(id) => {
            const asset = assets.find((item) => item.id === id);
            if (asset) onOpen(asset);
          }}
          openLabel="Review asset"
          label="Submitted creative assets"
          layout="atlas"
          renderMedia={(item) => {
            const asset = assets.find((entry) => entry.id === item.id);
            return asset ? <AssetPreview asset={asset} role={snapshot.viewer.role} /> : null;
          }}
        />
      ) : (
        !setup && (
          <EmptyState
            title="No assets awaiting review."
            copy="Set up a destination and assign its first kit, or wait for submitted originals to enter the Studio queue."
          />
        )
      )}
    </section>
  );
}

function PartnersPanel({
  partners,
  query,
  setQuery,
  onSpotlight,
  onOpen,
  onNew,
}: {
  partners: LocalPartner[];
  query: string;
  setQuery: (value: string) => void;
  onSpotlight: (partner: LocalPartner) => void;
  onOpen: (partner: LocalPartner) => void;
  onNew: () => void;
}) {
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const selectedId = partners.some((partner) => partner.id === selectedPartnerId)
    ? selectedPartnerId
    : partners[0]?.id;
  const imageForType = (type: PartnerType) =>
    type === 'artisan'
      ? '/assets/community/horizon/morocco-craft.webp'
      : ['hospitality', 'venue', 'territorial'].includes(type)
        ? '/assets/community/horizon/morocco-landscape.webp'
        : type === 'association'
          ? '/assets/community/horizon/morocco-field.webp'
          : '/assets/community/horizon/morocco-product.webp';
  const slides = partners.map((partner) => {
    const done = readinessFor(partner).filter(Boolean).length;
    return {
      id: partner.id,
      title: partner.name,
      subtitle: partnerLabels[partner.type],
      image: imageForType(partner.type),
      meta: `${done}/8 readiness · ${partner.description.slice(0, 72)}`,
      badge: pretty(partner.status),
    };
  });
  return (
    <section className="eco-panel" role="tabpanel">
      <div className="eco-panel-intro">
        <div>
          <p className="eco-eyebrow">Territorial partners</p>
          <h2>Build from local knowledge.</h2>
          <p>Directory, internal verification and eight-step readiness for production.</p>
        </div>
        <button className="eco-primary" onClick={onNew}>
          <Plus /> Add partner
        </button>
      </div>
      <div className="eco-tools">
        <label className="eco-search">
          <Search />
          <span className="sr-only">Search partners</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, type or status"
          />
        </label>
      </div>
      {partners.length ? (
        <DashboardCarousel
          items={slides}
          selectedId={selectedId}
          onSelect={(id) => {
            setSelectedPartnerId(id);
            const partner = partners.find((item) => item.id === id);
            if (partner) onSpotlight(partner);
          }}
          onOpen={(id) => {
            const partner = partners.find((item) => item.id === id);
            if (partner) onOpen(partner);
          }}
          openLabel="Open partner"
          label="Territorial partners"
          layout="atlas"
        />
      ) : (
        <EmptyState
          title="No partners found."
          copy="Adjust the search or create a partner record for internal qualification."
        />
      )}
    </section>
  );
}

function KitDrawer({
  kit,
  snapshot,
  mutate,
}: {
  kit: AssetKit;
  snapshot: EcosystemSnapshot;
  mutate: (
    method: 'POST' | 'PATCH',
    payload: Record<string, unknown>,
    success: string
  ) => Promise<boolean>;
}) {
  const destination = snapshot.destinations.find((item) => item.id === kit.destinationId);
  const kitAssets = snapshot.assets.filter((asset) => asset.kitId === kit.id);
  const creatorIds = [...new Set(kitAssets.map((asset) => asset.creatorId).filter(Boolean))];
  const creators = snapshot.applications.filter((creator) => creatorIds.includes(creator.id));
  const readiness = snapshot.readiness[kit.id];
  const journeyLinks = snapshot.links.filter(
    (link) => link.entityType === 'kit' && link.entityId === kit.id && link.targetType === 'journey'
  );
  return (
    <>
      <p className="eco-eyebrow">Destination kit · {kit.id}</p>
      <h2 id="drawer-title">{kit.title}</h2>
      <Status value={kit.status} />
      <dl className="eco-details">
        <div>
          <dt>Destination</dt>
          <dd>{destination?.title || 'Unavailable'}</dd>
        </div>
        <div>
          <dt>Visual Poet</dt>
          <dd>{creators.map((creator) => creator.displayName).join(', ') || 'Unassigned'}</dd>
        </div>
        <div>
          <dt>Approved assets</dt>
          <dd>{readiness ? `${readiness.approved}/${readiness.required}` : 'Unavailable'}</dd>
        </div>
        <div>
          <dt>Journeys rendition</dt>
          <dd>
            {kitAssets.filter((asset) => asset.publicMediaId).length}/{kitAssets.length || 14}
          </dd>
        </div>
      </dl>
      <p className="eco-trust-note">
        <Link2 aria-hidden="true" /> Publication requires exactly one connected Journey. Connections
        remain private until a BEE curator publishes a fully approved Studio kit.
      </p>
      {journeyLinks.length > 1 && (
        <p className="eco-inline-error" role="alert">
          Keep one Journey connection before publication.
        </p>
      )}
      <Connections
        entityType="kit"
        entityId={kit.id}
        links={snapshot.links}
        options={snapshot.targetOptions}
        mutate={mutate}
      />
    </>
  );
}

function AssetDrawer({
  asset,
  isCreator,
  role,
  upload,
  busy,
  onSave,
  onSubmit,
  onReview,
  onUpload,
  onCancelUpload,
  onPreparePublic,
  links,
  targetOptions,
  mutate,
}: {
  asset: CreativeAsset;
  isCreator: boolean;
  role: EcosystemRole;
  upload: UploadState | null;
  busy: boolean;
  onSave: (event: FormEvent<HTMLFormElement>, asset: CreativeAsset) => void;
  onSubmit: (asset: CreativeAsset) => void;
  onReview: (event: FormEvent<HTMLFormElement>, asset: CreativeAsset) => void;
  onUpload: (asset: CreativeAsset, file: File) => void;
  onCancelUpload: () => void;
  onPreparePublic: (asset: CreativeAsset) => void;
  links: EcosystemSnapshot['links'];
  targetOptions: EcosystemSnapshot['targetOptions'];
  mutate: (
    method: 'POST' | 'PATCH',
    payload: Record<string, unknown>,
    success: string
  ) => Promise<boolean>;
}) {
  const input = useRef<HTMLInputElement>(null);
  const active = upload?.assetId === asset.id;
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  async function downloadOriginal() {
    if (!asset.mediaId) return;
    setDownloadProgress(0);
    try {
      const metaResponse = await fetch(`${mediaEndpoint(asset.mediaId, asset.scope, role)}&meta=1`);
      const meta = (await metaResponse.json()) as {
        size?: number;
        name?: string;
        mime?: string;
        error?: string;
      };
      if (!metaResponse.ok || !meta.size)
        throw new Error(meta.error || 'File metadata is unavailable.');
      const parts: BlobPart[] = [];
      const chunkSize = 2 * 1024 * 1024;
      for (let offset = 0; offset < meta.size; offset += chunkSize) {
        const end = Math.min(meta.size - 1, offset + chunkSize - 1);
        const response = await fetch(mediaEndpoint(asset.mediaId, asset.scope, role, true), {
          headers: { Range: `bytes=${offset}-${end}` },
        });
        if (response.status !== 206)
          throw new Error('The private range download could not be verified.');
        const contentRange = response.headers.get('content-range');
        if (!contentRange?.startsWith(`bytes ${offset}-${end}/`))
          throw new Error('The server returned an unexpected file range.');
        parts.push(await response.blob());
        setDownloadProgress(Math.round(((end + 1) / meta.size) * 100));
      }
      const objectUrl = URL.createObjectURL(
        new Blob(parts, { type: meta.mime || 'application/octet-stream' })
      );
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = meta.name || 'original';
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
    } catch (reason) {
      window.alert(
        reason instanceof Error ? reason.message : 'The original could not be downloaded.'
      );
    } finally {
      setDownloadProgress(null);
    }
  }
  const gatesApproved = gates.every(({ key }) => asset[key] === 'approved');
  const rightsExpiry = asset.rightsExpiresAt
    ? new Date(asset.rightsExpiresAt).getTime() + 24 * 60 * 60 * 1000
    : 0;
  const publicLicenceReady =
    asset.rightsScope === 'public_journeys' &&
    Boolean(asset.rightsEvidence) &&
    Number.isFinite(rightsExpiry) &&
    rightsExpiry > Date.now();
  return (
    <>
      <p className="eco-eyebrow">Asset ID · {asset.id}</p>
      <h2 id="drawer-title">{asset.title || `${pretty(asset.slot)} ${asset.slotIndex}`}</h2>
      <div className="eco-drawer-media">
        <AssetPreview asset={asset} role={role} />
        {asset.mediaId && (
          <button
            type="button"
            onClick={() => void downloadOriginal()}
            disabled={downloadProgress !== null}
          >
            <Download /> {downloadProgress === null ? 'Original' : `${downloadProgress}%`}
          </button>
        )}
      </div>
      {isCreator ? (
        <form className="eco-drawer-form" onSubmit={(event) => onSave(event, asset)}>
          <label>
            Title
            <input name="title" required defaultValue={asset.title} />
          </label>
          <label>
            Location
            <input name="location" required defaultValue={asset.location} />
          </label>
          <label>
            Description
            <textarea name="description" required rows={4} defaultValue={asset.description} />
          </label>
          <label>
            Credit line
            <input name="credit" required defaultValue={asset.credit} />
          </label>
          <label>
            Rights summary
            <textarea
              name="rightsSummary"
              required
              rows={3}
              defaultValue={asset.rightsSummary}
              placeholder="Territories, term, channels, crops and exclusions"
            />
          </label>
          <label>
            Rights evidence
            <input
              name="rightsEvidence"
              required
              defaultValue={asset.rightsEvidence}
              placeholder="Private licence or consent reference"
            />
          </label>
          <div className="eco-inline-fields">
            <label>
              Rights scope
              <select name="rightsScope" defaultValue={asset.rightsScope}>
                <option value="brand_presentation">Brand presentation</option>
                <option value="public_journeys">Public Journeys</option>
              </select>
            </label>
            <label>
              Rights expiry
              <input
                name="rightsExpiresAt"
                type="date"
                required
                defaultValue={asset.rightsExpiresAt || ''}
              />
            </label>
          </div>
          <label>
            Original source URL
            <input
              name="originalSourceUrl"
              type="url"
              defaultValue={asset.originalSourceUrl}
              placeholder="Optional source or transfer URL"
            />
          </label>
          <label>
            AI declaration
            <select name="aiDisclosure" defaultValue={asset.aiDisclosure}>
              <option value="none_declared">No AI declared</option>
              <option value="retouching_only">Retouching only</option>
              <option value="ai_assisted">AI assisted</option>
              <option value="ai_generated">AI generated</option>
            </select>
          </label>
          <label className="eco-check-control">
            <input name="softFadeConsent" type="checkbox" defaultChecked={asset.softFadeConsent} />{' '}
            I grant permission for the BEE soft-fade photo adaptation.
          </label>
          <div className="eco-file-facts">
            <span>
              {asset.width && asset.height
                ? `${asset.width} × ${asset.height}px`
                : 'Dimensions pending'}
            </span>
            <span>
              {asset.durationSeconds
                ? `${asset.durationSeconds.toFixed(1)} seconds`
                : asset.slot === 'photo'
                  ? 'Still image'
                  : 'Duration pending'}
            </span>
          </div>
          <p className="eco-trust-note">
            <ShieldCheck /> File metadata assists review; it does not prove authenticity.
          </p>
          <input
            ref={input}
            hidden
            type="file"
            accept={asset.slot === 'photo' ? 'image/*' : 'video/*'}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onUpload(asset, file);
              event.currentTarget.value = '';
            }}
          />
          <div className="eco-drawer-actions">
            {active ? (
              <button
                type="button"
                disabled={upload.status === 'finishing'}
                onClick={onCancelUpload}
              >
                {upload.status === 'finishing' ? <LoaderCircle /> : <X />}{' '}
                {upload.status === 'finishing'
                  ? 'Finalising original'
                  : `Cancel ${upload.progress}%`}
              </button>
            ) : (
              <button type="button" onClick={() => input.current?.click()}>
                <Upload /> {asset.mediaId ? 'Replace original' : 'Upload original'}
              </button>
            )}
            <button disabled={busy || active} type="submit">
              Save details
            </button>
            <button
              disabled={busy || active || !asset.mediaId}
              className="eco-primary"
              type="button"
              onClick={() => onSubmit(asset)}
            >
              Submit to Studio <ArrowRight />
            </button>
          </div>
        </form>
      ) : (
        <form className="eco-drawer-form" onSubmit={(event) => onReview(event, asset)}>
          <dl className="eco-details">
            <div>
              <dt>Location</dt>
              <dd>{asset.location || 'Not provided'}</dd>
            </div>
            <div>
              <dt>Credit</dt>
              <dd>{asset.credit || 'Not provided'}</dd>
            </div>
            <div>
              <dt>Description</dt>
              <dd>{asset.description || 'Not provided'}</dd>
            </div>
            <div>
              <dt>Rights summary</dt>
              <dd>{asset.rightsSummary || 'Not provided'}</dd>
            </div>
            <div>
              <dt>Rights evidence</dt>
              <dd>{asset.rightsEvidence || 'Not provided'}</dd>
            </div>
            <div>
              <dt>Rights scope</dt>
              <dd>{pretty(asset.rightsScope)}</dd>
            </div>
            <div>
              <dt>Rights expiry</dt>
              <dd>{asset.rightsExpiresAt || 'Not provided'}</dd>
            </div>
            <div>
              <dt>AI declaration</dt>
              <dd>{pretty(asset.aiDisclosure)}</dd>
            </div>
            <div>
              <dt>Soft-fade consent</dt>
              <dd>{asset.softFadeConsent ? 'Granted' : 'Not granted'}</dd>
            </div>
          </dl>
          <fieldset>
            <legend>Studio gates</legend>
            {gates.map((gate) => (
              <label key={gate.key}>
                {gate.label}
                <select
                  required
                  name={gate.key}
                  defaultValue={asset[gate.key] === 'pending' ? '' : asset[gate.key]}
                >
                  <option value="" disabled>
                    Choose review
                  </option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </label>
            ))}
          </fieldset>
          {asset.aiDisclosure === 'ai_generated' && (
            <p className="eco-trust-note">
              <AlertCircle aria-hidden="true" />
              {asset.scope === 'demo'
                ? 'This simulated asset may be approved only with a private note that explicitly identifies both the demo and its AI origin.'
                : 'AI-generated originals cannot be approved for Studio publication.'}
            </p>
          )}
          <label>
            Private review note
            <textarea
              name="reviewNote"
              rows={4}
              required={asset.aiDisclosure === 'ai_generated' && asset.scope === 'demo'}
              defaultValue={asset.reviewNote}
              placeholder={
                asset.aiDisclosure === 'ai_generated' && asset.scope === 'demo'
                  ? 'Demo only: AI-generated concept used for private workflow simulation.'
                  : 'Explain an asset-specific replacement request.'
              }
            />
          </label>
          <label>
            Decision
            <select required name="decision" defaultValue="">
              <option value="" disabled>
                Choose decision
              </option>
              {(asset.aiDisclosure !== 'ai_generated' || asset.scope === 'demo') && (
                <option value="approve">Approve asset</option>
              )}
              <option value="replace">Request replacement</option>
              <option value="reject">Reject asset</option>
            </select>
          </label>
          <div className="eco-drawer-actions">
            <button disabled={busy} className="eco-primary">
              Save review <ArrowRight />
            </button>
            {gatesApproved && publicLicenceReady && role !== 'creator' && !asset.publicMediaId && (
              <button type="button" disabled={busy} onClick={() => onPreparePublic(asset)}>
                Prepare for Journeys <ImageIcon />
              </button>
            )}
            {gatesApproved && !publicLicenceReady && !asset.publicMediaId && (
              <span className="eco-permission-note">
                A current Public Journeys licence and evidence are required before rendition.
              </span>
            )}
            {asset.publicMediaId && (
              <span className="eco-permission-note">
                Rights-aware Journeys rendition prepared. BEE still controls publication.
              </span>
            )}
          </div>
        </form>
      )}
      {!isCreator && (
        <Connections
          entityType="asset"
          entityId={asset.id}
          links={links}
          options={targetOptions}
          mutate={mutate}
        />
      )}
    </>
  );
}

function CreatorDrawer({
  application,
  role,
  busy,
  onAction,
  links,
  targetOptions,
  mutate,
}: {
  application: CreatorApplication;
  role: EcosystemRole;
  busy: boolean;
  onAction: (
    application: CreatorApplication,
    action: 'review-creator' | 'approve-creator' | 'activate-creator' | 'decline-creator'
  ) => void;
  links: EcosystemSnapshot['links'];
  targetOptions: EcosystemSnapshot['targetOptions'];
  mutate: (
    method: 'POST' | 'PATCH',
    payload: Record<string, unknown>,
    success: string
  ) => Promise<boolean>;
}) {
  const [invite, setInvite] = useState<{ path: string; expiresAt: string } | null>(null);
  const [inviteError, setInviteError] = useState('');
  const [inviteBusy, setInviteBusy] = useState(false);
  async function issueInvite() {
    setInviteBusy(true);
    setInviteError('');
    try {
      const response = await fetch(
        `/api/community/ecosystem/invitations?scope=${application.scope}${application.scope === 'demo' ? `&role=${role}` : ''}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'issue', creatorId: application.id }),
        }
      );
      const body = (await response.json()) as { path?: string; expiresAt?: string; error?: string };
      if (!response.ok || !body.path || !body.expiresAt)
        throw new Error(body.error || 'Invite could not be created.');
      setInvite({ path: body.path, expiresAt: body.expiresAt });
    } catch (reason) {
      setInviteError(reason instanceof Error ? reason.message : 'Invite could not be created.');
    } finally {
      setInviteBusy(false);
    }
  }
  async function copyInvite() {
    if (!invite) return;
    await navigator.clipboard.writeText(new URL(invite.path, window.location.origin).toString());
  }
  return (
    <>
      <p className="eco-eyebrow">Creator ID · {application.id}</p>
      <h2 id="drawer-title">{application.displayName}</h2>
      <Status value={application.status} />
      <dl className="eco-details">
        <div>
          <dt>Email</dt>
          <dd>{application.email}</dd>
        </div>
        <div>
          <dt>Community account</dt>
          <dd>{application.userId ? 'Joined' : 'Not joined yet'}</dd>
        </div>
        <div>
          <dt>Home destination</dt>
          <dd>{application.homeDestination}</dd>
        </div>
        <div>
          <dt>Portfolio</dt>
          <dd>
            <a href={application.portfolioUrl} target="_blank" rel="noreferrer">
              Open portfolio <ExternalLink />
            </a>
          </dd>
        </div>
        <div className="is-wide">
          <dt>Biography</dt>
          <dd>{application.biography}</dd>
        </div>
        <div className="is-wide">
          <dt>Royalty proposal</dt>
          <dd>
            2% proposed, subject to negotiation, contract and attributable collected revenue. This
            record is not a payment commitment.
          </dd>
        </div>
      </dl>
      {!application.userId && ['bee', 'curator'].includes(role) && (
        <div className="eco-invite">
          <p className="eco-eyebrow">Private Community access</p>
          {invite ? (
            <>
              <p>
                This link is shown once. Copy it into the intended private channel; no email is sent
                automatically.
              </p>
              <div>
                <input readOnly value={new URL(invite.path, window.location.origin).toString()} />
                <button onClick={() => void copyInvite()}>
                  <Link2 /> Copy link
                </button>
              </div>
              <small>Expires {formatDateTime(invite.expiresAt)}</small>
            </>
          ) : (
            <button disabled={inviteBusy} onClick={() => void issueInvite()}>
              {inviteBusy ? <LoaderCircle className="spin" /> : <Link2 />} Invite creator
            </button>
          )}
          {inviteError && (
            <p role="alert" className="eco-inline-error">
              {inviteError}
            </p>
          )}
        </div>
      )}
      <Connections
        entityType="creator"
        entityId={application.id}
        links={links}
        options={targetOptions}
        mutate={mutate}
      />
      {['bee', 'curator'].includes(role) && (
        <div className="eco-drawer-actions">
          {application.status === 'requested' && (
            <button disabled={busy} onClick={() => onAction(application, 'review-creator')}>
              Start review
            </button>
          )}
          {['requested', 'review'].includes(application.status) && (
            <>
              <button disabled={busy} onClick={() => onAction(application, 'decline-creator')}>
                Decline
              </button>
              <button
                disabled={busy}
                className="eco-primary"
                onClick={() => onAction(application, 'approve-creator')}
              >
                Approve <Check />
              </button>
            </>
          )}
          {application.status === 'approved' && (
            <button
              disabled={busy}
              className="eco-primary"
              onClick={() => onAction(application, 'activate-creator')}
            >
              Activate destination work <ArrowRight />
            </button>
          )}
        </div>
      )}
    </>
  );
}

function PartnerDrawer({
  partner,
  role,
  busy,
  mutate,
  onClose,
  links,
  targetOptions,
}: {
  partner: LocalPartner;
  role: EcosystemRole;
  busy: boolean;
  mutate: (
    method: 'POST' | 'PATCH',
    payload: Record<string, unknown>,
    success: string
  ) => Promise<boolean>;
  onClose: () => void;
  links: EcosystemSnapshot['links'];
  targetOptions: EcosystemSnapshot['targetOptions'];
}) {
  const checks = readinessFor(partner);
  const [collaborationType, setCollaborationType] = useState<LocalPartner['collaborationType']>(
    partner.collaborationType
  );
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const ok = await mutate(
      'PATCH',
      {
        action: 'save-partner',
        entityId: partner.id,
        version: partner.version,
        name: String(data.get('name') || ''),
        type: String(data.get('type') || ''),
        description: String(data.get('description') || ''),
        contactName: String(data.get('contactName') || ''),
        contactEmail: String(data.get('contactEmail') || ''),
        contactPhone: String(data.get('contactPhone') || ''),
        website: String(data.get('website') || ''),
        collaborationType: String(data.get('collaborationType') || 'paid'),
        exchangeValueAmount: data.get('exchangeValueAmount')
          ? Number(data.get('exchangeValueAmount'))
          : null,
        exchangeTerms: String(data.get('exchangeTerms') || ''),
        deliverables: String(data.get('deliverables') || ''),
        evidenceReference: String(data.get('evidenceReference') || ''),
        quoteReference: String(data.get('quoteReference') || ''),
        budgetAmount: data.get('budgetAmount') ? Number(data.get('budgetAmount')) : null,
        budgetCurrency: String(data.get('budgetCurrency') || ''),
        availabilityNote: String(data.get('availabilityNote') || ''),
        safetyNote: String(data.get('safetyNote') || ''),
        impactNote: String(data.get('impactNote') || ''),
        productionValidated: data.get('productionValidated') === 'on',
      },
      'Partner record updated.'
    );
    if (ok) onClose();
  }
  async function transition(status: LocalPartner['status']) {
    const ok = await mutate(
      'PATCH',
      { action: 'transition-partner', entityId: partner.id, version: partner.version, status },
      'Partner status updated.'
    );
    if (ok) onClose();
  }
  return (
    <>
      <p className="eco-eyebrow">{partnerLabels[partner.type]} · internal record</p>
      <h2 id="drawer-title">{partner.name}</h2>
      <Status value={partner.status} />
      <ol className="eco-checklist">
        {partnerSteps.map((step, index) => (
          <li key={step} className={checks[index] ? 'done' : ''}>
            {checks[index] ? <Check /> : <Circle />}
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <form className="eco-drawer-form" onSubmit={save}>
        <label>
          Partner name
          <input required name="name" defaultValue={partner.name} />
        </label>
        <label>
          Partner type
          <select required name="type" defaultValue={partner.type}>
            {Object.entries(partnerLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Description
          <textarea name="description" rows={3} defaultValue={partner.description} />
        </label>
        <details className="eco-progressive" open={!partner.contactName}>
          <summary>Contact details</summary>
          <p>
            Private operational contact. An email or phone is required before production validation.
          </p>
          <div className="eco-inline-fields">
            <label>
              Contact name
              <input name="contactName" defaultValue={partner.contactName} />
            </label>
            <label>
              Contact email
              <input name="contactEmail" type="email" defaultValue={partner.contactEmail} />
            </label>
            <label>
              Contact phone
              <input name="contactPhone" type="tel" defaultValue={partner.contactPhone} />
            </label>
          </div>
          <label>
            HTTPS website
            <input name="website" type="url" pattern="https://.*" defaultValue={partner.website} />
          </label>
        </details>
        <label>
          Evidence reference
          <input
            name="evidenceReference"
            defaultValue={partner.evidenceReference}
            placeholder="Internal file or source reference"
          />
        </label>
        <label>
          Availability
          <textarea name="availabilityNote" rows={2} defaultValue={partner.availabilityNote} />
        </label>
        <label>
          Safety
          <textarea name="safetyNote" rows={2} defaultValue={partner.safetyNote} />
        </label>
        <div className="eco-inline-fields">
          <label>
            Quote reference
            <input name="quoteReference" defaultValue={partner.quoteReference} />
          </label>
          <label>
            Budget amount
            <input
              name="budgetAmount"
              type="number"
              min="0"
              step="0.01"
              defaultValue={partner.budgetAmount ?? ''}
            />
          </label>
          <label>
            Currency
            <input name="budgetCurrency" defaultValue={partner.budgetCurrency} />
          </label>
        </div>
        <details
          className="eco-progressive"
          open={partner.collaborationType !== 'paid' && !partner.exchangeTerms}
        >
          <summary>Collaboration structure</summary>
          <p>
            Document the working basis for internal review. This record is not a contract or payment
            authorisation.
          </p>
          <label>
            Collaboration type
            <select
              name="collaborationType"
              value={collaborationType}
              onChange={(event) =>
                setCollaborationType(event.target.value as LocalPartner['collaborationType'])
              }
            >
              <option value="paid">Paid</option>
              <option value="content_exchange">Content exchange</option>
              <option value="mixed">Mixed</option>
            </select>
          </label>
          {collaborationType !== 'paid' && (
            <>
              <label>
                Documented exchange value
                <input
                  name="exchangeValueAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  defaultValue={partner.exchangeValueAmount ?? ''}
                />
              </label>
              <label>
                Exchange and rights terms
                <textarea
                  name="exchangeTerms"
                  rows={3}
                  required
                  defaultValue={partner.exchangeTerms}
                  placeholder="Usage rights, term, territory and exclusions"
                />
              </label>
              <label>
                Deliverables
                <textarea
                  name="deliverables"
                  rows={3}
                  required
                  defaultValue={partner.deliverables}
                />
              </label>
            </>
          )}
        </details>
        <label>
          Impact note
          <textarea name="impactNote" rows={3} defaultValue={partner.impactNote} />
        </label>
        <label className="eco-check-control">
          <input
            name="productionValidated"
            type="checkbox"
            defaultChecked={partner.productionValidated}
            disabled={!['bee', 'production'].includes(role)}
          />
          Head of Production validation
        </label>
        <p className="eco-trust-note">
          <ShieldCheck /> References remain private internal evidence until qualified. No payment,
          sale or impact result is guaranteed.
        </p>
        <div className="eco-drawer-actions">
          <button disabled={busy}>Save record</button>
          {partner.status === 'discovered' && (
            <button type="button" onClick={() => void transition('under_review')}>
              Start verification
            </button>
          )}
          {partner.status === 'under_review' && (
            <button type="button" onClick={() => void transition('internally_verified')}>
              Mark internally verified
            </button>
          )}
          {partner.status === 'internally_verified' && (
            <button type="button" onClick={() => void transition('impact_documented')}>
              Impact documented
            </button>
          )}
          {partner.status === 'impact_documented' && (
            <button
              type="button"
              className="eco-primary"
              disabled={!partner.productionValidated}
              onClick={() => void transition('ready_to_sell')}
            >
              Production approval <Check />
            </button>
          )}
        </div>
      </form>
      <Connections
        entityType="partner"
        entityId={partner.id}
        links={links}
        options={targetOptions}
        mutate={mutate}
      />
    </>
  );
}

function Connections({
  entityType,
  entityId,
  links,
  options,
  mutate,
}: {
  entityType: EcosystemEntityType;
  entityId: string;
  links: EcosystemSnapshot['links'];
  options: EcosystemSnapshot['targetOptions'];
  mutate: (
    method: 'POST' | 'PATCH',
    payload: Record<string, unknown>,
    success: string
  ) => Promise<boolean>;
}) {
  const connected = links.filter(
    (link) => link.entityType === entityType && link.entityId === entityId
  );
  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const selected = String(data.get('target') || '');
    const separator = selected.indexOf('::');
    if (separator < 0) return;
    const targetType = selected.slice(0, separator);
    const targetId = selected.slice(separator + 2);
    const option = options.find((item) => item.type === targetType && item.id === targetId);
    if (!option) return;
    const ok = await mutate(
      'POST',
      {
        action: 'add-link',
        entityType,
        entityId,
        targetType,
        targetId,
        label: option.label,
      },
      'Connection added.'
    );
    if (ok) form.reset();
  }
  return (
    <section className="eco-connections" aria-labelledby={`connections-${entityId}`}>
      <p className="eco-eyebrow">Connected records</p>
      <h3 id={`connections-${entityId}`}>Keep the story traceable.</h3>
      {connected.length > 0 && (
        <div className="eco-connection-list">
          {connected.map((link) => (
            <span key={link.id}>
              <span>
                <Link2 /> {link.label}
                <small>{pretty(link.targetType)}</small>
              </span>
              <button
                aria-label={`Remove connection to ${link.label}`}
                onClick={() =>
                  void mutate(
                    'PATCH',
                    { action: 'remove-link', entityId: link.id, version: 0 },
                    'Connection removed.'
                  )
                }
              >
                <X />
              </button>
            </span>
          ))}
        </div>
      )}
      <form onSubmit={add}>
        <label>
          Business record
          <select required name="target" defaultValue="">
            <option value="" disabled>
              Choose by name
            </option>
            {options.map((option) => (
              <option key={`${option.type}:${option.id}`} value={`${option.type}::${option.id}`}>
                {pretty(option.type)} · {option.label}
              </option>
            ))}
          </select>
        </label>
        <button disabled={!options.length}>
          <Plus /> Connect
        </button>
      </form>
    </section>
  );
}

function NewPartnerDrawer({
  destinations,
  busy,
  mutate,
  onClose,
}: {
  destinations: EcosystemSnapshot['destinations'];
  busy: boolean;
  mutate: (
    method: 'POST' | 'PATCH',
    payload: Record<string, unknown>,
    success: string
  ) => Promise<boolean>;
  onClose: () => void;
}) {
  const [collaborationType, setCollaborationType] =
    useState<LocalPartner['collaborationType']>('paid');
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const ok = await mutate(
      'POST',
      {
        action: 'create-partner',
        destinationId: String(data.get('destinationId') || ''),
        name: String(data.get('name') || ''),
        type: String(data.get('type') || ''),
        description: String(data.get('description') || ''),
        contactName: String(data.get('contactName') || ''),
        contactEmail: String(data.get('contactEmail') || ''),
        contactPhone: String(data.get('contactPhone') || ''),
        website: String(data.get('website') || ''),
        collaborationType: String(data.get('collaborationType') || 'paid'),
        exchangeValueAmount: data.get('exchangeValueAmount')
          ? Number(data.get('exchangeValueAmount'))
          : null,
        exchangeTerms: String(data.get('exchangeTerms') || ''),
        deliverables: String(data.get('deliverables') || ''),
      },
      'Partner added for qualification.'
    );
    if (ok) onClose();
  }
  return (
    <>
      <p className="eco-eyebrow">Territorial partner</p>
      <h2 id="drawer-title">Start with the essentials.</h2>
      <p className="eco-drawer-copy">
        Create a private lead, then qualify evidence, safety, availability and production readiness
        step by step.
      </p>
      <form className="eco-drawer-form" onSubmit={create}>
        <label>
          Name
          <input required name="name" />
        </label>
        <label>
          Type
          <select required name="type">
            {Object.entries(partnerLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Destination
          <select required name="destinationId">
            <option value="">Choose a destination</option>
            {destinations.map((destination) => (
              <option key={destination.id} value={destination.id}>
                {destination.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Description
          <textarea required name="description" rows={5} />
        </label>
        <details className="eco-progressive">
          <summary>Contact details</summary>
          <p>Add operational contacts now, or complete them during verification.</p>
          <label>
            Contact name
            <input name="contactName" />
          </label>
          <div className="eco-inline-fields">
            <label>
              Contact email
              <input name="contactEmail" type="email" />
            </label>
            <label>
              Contact phone
              <input name="contactPhone" type="tel" />
            </label>
          </div>
          <label>
            HTTPS website
            <input name="website" type="url" pattern="https://.*" />
          </label>
        </details>
        <details className="eco-progressive">
          <summary>Collaboration structure</summary>
          <p>
            Record an expected structure for review. No payment, contract or legal validation is
            created here.
          </p>
          <label>
            Collaboration type
            <select
              name="collaborationType"
              value={collaborationType}
              onChange={(event) =>
                setCollaborationType(event.target.value as LocalPartner['collaborationType'])
              }
            >
              <option value="paid">Paid</option>
              <option value="content_exchange">Content exchange</option>
              <option value="mixed">Mixed</option>
            </select>
          </label>
          {collaborationType !== 'paid' && (
            <>
              <label>
                Documented exchange value
                <input name="exchangeValueAmount" type="number" min="0" step="0.01" required />
              </label>
              <label>
                Exchange and rights terms
                <textarea name="exchangeTerms" rows={3} required />
              </label>
              <label>
                Deliverables
                <textarea name="deliverables" rows={3} required />
              </label>
            </>
          )}
        </details>
        <div className="eco-drawer-actions">
          <button disabled={busy} className="eco-primary">
            Create private record <ArrowRight />
          </button>
        </div>
      </form>
    </>
  );
}
