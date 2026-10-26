'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { DashboardCarousel } from '@/components/dashboard/dashboard-carousel';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import type { Workspace } from '@/lib/community/types';
import {
  dashboardProjectArtwork,
  dashboardProgress,
  projectDate,
  projectRoleLabel,
  visibleDashboardStages,
} from '../_lib/dashboard-model';
import { dashboardProjectHref, dashboardProjectRouteHref } from '../_lib/routes';
import { resolveDashboardFallback } from '../_lib/dashboard-access';

type LoadState = 'loading' | 'ready' | 'signed-out' | 'error';

export function DashboardHome() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [selectedId, setSelectedId] = useState('');
  const [state, setState] = useState<LoadState>('loading');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    setState('loading');
    setError('');
    try {
      const response = await fetch('/api/community/workspace', { cache: 'no-store' });
      const data = await response.json();
      if (response.status === 401) {
        const fallback = await resolveDashboardFallback(fetch);
        if (fallback.kind === 'signed-out') {
          setState('signed-out');
          return;
        }
        if (fallback.kind === 'ecosystem') {
          window.location.replace(`/dashboard/ecosystem?scope=${fallback.scope}`);
          return;
        }
        setError('This account has no assigned production journey.');
        setState('error');
        return;
      }
      if (!response.ok) throw new Error(data.error || 'The dashboard could not be loaded.');
      const next = data as Workspace;
      setWorkspace(next);
      setSelectedId(next.project.id);
      setState('ready');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The dashboard could not be loaded.');
      setState('error');
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const selected =
    workspace?.projects.find((project) => project.id === selectedId) || workspace?.project;
  const selectedIsLoaded = selected?.id === workspace?.project.id;
  const stages = useMemo(
    () => (workspace && selectedIsLoaded ? visibleDashboardStages(workspace) : []),
    [workspace, selectedIsLoaded]
  );
  const progress = dashboardProgress(stages);

  if (state === 'loading') {
    return (
      <DashboardShell
        image="/assets/community/horizon/morocco-landscape.webp"
        eyebrow="Bee Community"
        title="Opening your journeys"
        description="Loading the projects assigned to your account."
        layout="stacked"
      >
        <p className="dashboard-status" role="status">
          Loading your dashboard…
        </p>
      </DashboardShell>
    );
  }

  if (state === 'signed-out') {
    return (
      <DashboardShell
        image="/assets/community/horizon/morocco-landscape.webp"
        eyebrow="Private workspace"
        title="Enter your journeys"
        description="Use the account assigned by Bee to access your projects and production stages."
        layout="stacked"
        backHref="/community"
        backLabel="Discover the Community"
      >
        <form
          className="dashboard-login"
          onSubmit={async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setBusy(true);
            setError('');
            const form = new FormData(event.currentTarget);
            try {
              const response = await fetch('/api/community/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
              });
              const data = await response.json();
              if (!response.ok) throw new Error(data.error || 'Sign-in failed.');
              await load();
            } catch (cause) {
              setError(cause instanceof Error ? cause.message : 'Sign-in failed.');
            } finally {
              setBusy(false);
            }
          }}
        >
          <LockKeyhole aria-hidden size={20} />
          <label>
            Email address
            <input type="email" name="email" autoComplete="username" required />
          </label>
          <label>
            Password
            <input type="password" name="password" autoComplete="current-password" required />
          </label>
          {error && <p role="alert">{error}</p>}
          <button type="submit" disabled={busy}>
            {busy ? 'Opening…' : 'Open dashboard'} <ArrowRight aria-hidden size={17} />
          </button>
          <Link href="/community/reset-password">Forgot your password?</Link>
        </form>
      </DashboardShell>
    );
  }

  if (!workspace || !selected || state === 'error') {
    return (
      <DashboardShell
        image="/assets/community/horizon/morocco-landscape.webp"
        eyebrow="Private workspace"
        title="The dashboard is unavailable"
        description={error || 'No assigned journey could be found.'}
        layout="stacked"
        actions={<button onClick={() => void load()}>Try again</button>}
      >
        <p className="dashboard-status" role="alert">
          Your project data has not been changed.
        </p>
      </DashboardShell>
    );
  }

  const items = workspace.projects.map((project) => ({
    id: project.id,
    title: project.territory,
    subtitle: project.title,
    image: dashboardProjectArtwork(project),
    meta: project.season,
    badge: projectRoleLabel(project),
  }));
  const href = dashboardProjectRouteHref(selected.id);
  const metadata = [
    selected.title,
    selected.season,
    projectDate(selected.starts_on, selected.ends_on),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <DashboardShell
      image={dashboardProjectArtwork(selected)}
      eyebrow={`${workspace.projects.length} assigned ${workspace.projects.length === 1 ? 'journey' : 'journeys'}`}
      title={selected.territory}
      meta={metadata}
      description={`You are viewing this journey as ${projectRoleLabel(selected)}.`}
      layout="atlas"
      scope={selected.is_demo ? 'demo' : 'studio'}
      backHref="/community"
      backLabel="Community"
      actions={
        <Link className="dashboard-open-project" href={href}>
          Open project <ArrowRight aria-hidden size={17} />
        </Link>
      }
    >
      <DashboardCarousel
        label="All journeys"
        items={items}
        selectedId={selected.id}
        onSelect={setSelectedId}
        onOpen={(id) => {
          window.location.assign(dashboardProjectRouteHref(id));
        }}
        openLabel="Open project"
        layout="atlas"
      />
      <details className="dashboard-stage-preview">
        <summary>
          <span>Production stages</span>
          {selectedIsLoaded ? (
            <p>
              {progress.documented} documented · {progress.started} started · {progress.total}{' '}
              visible steps
            </p>
          ) : (
            <p>Open this project to load its permission-filtered stages.</p>
          )}
        </summary>
        {selectedIsLoaded ? (
          <ol>
            {stages.map((stage) => (
              <li key={stage.id}>
                <Link href={dashboardProjectHref(selected.id, stage.firstPageId)}>
                  <small>
                    {stage.documented}/{stage.total} documented
                  </small>
                  <strong>{stage.title}</strong>
                  <span>{stage.started ? `${stage.started} started` : 'Not started'}</span>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <Link className="dashboard-stage-empty" href={href}>
            View this project’s stages <ArrowRight aria-hidden size={17} />
          </Link>
        )}
      </details>
    </DashboardShell>
  );
}
