'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Globe2,
  MapPin,
  NotebookPen,
  Users,
} from 'lucide-react';

import type { CastingRecord } from '@/data/admin-dashboard';
import { cn } from '@/lib/utils';

import { GlowTitle } from '@/components/primitives';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  adminKpis,
  castingRecords as castingSeed,
  clientJourneyRecords as clientSeed,
  deliverableRecords as deliverableSeed,
  freelancerRecords,
  productionPipeline as pipelineSeed,
  prospectRecords as prospectSeed,
} from '@/data/admin-dashboard';
import { StatusPill } from '@/app/admin/_components/status-pill';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Beeyondtheworld',
  description:
    'Orchestrate brand dreams across production phases, freelancers, contracts, deliverables, and castings in one luminous console.',
};

type PipelineStageKey = 'pre-production' | 'production' | 'post-production';
const pipelineOrder: PipelineStageKey[] = ['pre-production', 'production', 'post-production'];

const stageLabels: Record<PipelineStageKey, string> = {
  'pre-production': 'Pre-production constellation',
  production: 'Production constellation',
  'post-production': 'Post-production bloom',
};

const stageStatusTone: Record<string, string> = {
  dreaming: 'dreaming',
  crafting: 'crafting',
  delivering: 'delivering',
  'first-contact': 'dreaming',
  'deck-sent': 'crafting',
  budgeting: 'crafting',
  'awaiting-signature': 'delivering',
};

const statusToneMap: Record<string, string> = {
  'on-track': 'on-track',
  'at-risk': 'at-risk',
  complete: 'complete',
  'in-progress': 'in-progress',
  'awaiting-approval': 'awaiting-approval',
  delivered: 'delivered',
  open: 'open',
  locked: 'locked',
  wrapped: 'wrapped',
  now: 'now',
  soon: 'soon',
  booking: 'booking',
};

const prospectStageFlow: ProspectStage[] = [
  'first-contact',
  'deck-sent',
  'budgeting',
  'awaiting-signature',
];

type ProspectStage = (typeof prospectStageFlow)[number];

const trendIcon = {
  up: <ArrowUpRight className="size-3" aria-hidden />,
  down: <ArrowUpRight className="size-3 rotate-180" aria-hidden />,
  steady: <ArrowUpRight className="size-3 rotate-90" aria-hidden />,
};

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: 12, transition: { duration: 0.3 } },
});

export default function AdminDashboardPage() {
  const [selectedStage, setSelectedStage] = useState<PipelineStageKey>('pre-production');
  const [pipelineState, setPipelineState] = useState(() =>
    pipelineSeed.map((stage) => ({
      ...stage,
      steps: stage.steps.map((step) => ({ ...step })),
    }))
  );
  const [clientState] = useState(clientSeed);
  const [prospects, setProspects] = useState(prospectSeed);
  const [deliverables, setDeliverables] = useState(deliverableSeed);
  const [castingState, setCastingState] = useState(castingSeed);

  const pipelineByStage = useMemo(() => {
    const grouped = new Map<PipelineStageKey, typeof pipelineState>();
    pipelineOrder.forEach((key) => grouped.set(key, []));
    pipelineState.forEach((item) => {
      const stages = grouped.get(item.stage);
      if (stages) {
        stages.push(item);
      }
    });
    return grouped;
  }, [pipelineState]);

  const visibleStages = pipelineByStage.get(selectedStage) ?? [];

  const handleStepToggle = useCallback((stageId: string, stepId: string) => {
    setPipelineState((prev) =>
      prev.map((stage) =>
        stage.id === stageId
          ? {
              ...stage,
              steps: stage.steps.map((step) =>
                step.id === stepId ? { ...step, completed: !step.completed } : step
              ),
            }
          : stage
      )
    );
  }, []);

  const handleAdvanceProspect = useCallback((prospectId: string) => {
    setProspects((prev) =>
      prev.map((prospect) => {
        if (prospect.id !== prospectId) return prospect;
        const currentIndex = prospectStageFlow.indexOf(prospect.stage);
        const nextStage =
          prospectStageFlow[Math.min(currentIndex + 1, prospectStageFlow.length - 1)];
        return {
          ...prospect,
          stage: nextStage,
          notes:
            currentIndex + 1 >= prospectStageFlow.length
              ? 'Awaiting signature - gently nudged legal guardian.'
              : prospect.notes,
        };
      })
    );
  }, []);

  const handleDeliverableToggle = useCallback((deliverableId: string) => {
    setDeliverables((prev) =>
      prev.map((item) =>
        item.id === deliverableId
          ? {
              ...item,
              status: item.status === 'delivered' ? 'in-progress' : 'delivered',
            }
          : item
      )
    );
  }, []);

  const handleCastingStatus = useCallback((castingId: string) => {
    setCastingState((prev) =>
      prev.map((item) => {
        if (item.id !== castingId) return item;
        const order: CastingRecord['status'][] = ['open', 'locked', 'wrapped'];
        const next = order[(order.indexOf(item.status) + 1) % order.length];
        return { ...item, status: next };
      })
    );
  }, []);

  const progressForStage = useCallback((stage: (typeof visibleStages)[number]) => {
    const total = stage.steps.length || 1;
    const done = stage.steps.filter((step) => step.completed).length;
    return Math.round((done / total) * 100);
  }, []);

  const journeyStageTone = useCallback(
    (status: string) => stageStatusTone[status] ?? 'dreaming',
    []
  );
  const productionStatusTone = useCallback(
    (status: string) => statusToneMap[status] ?? 'on-track',
    []
  );
  const deliverableTone = useCallback(
    (status: string) => statusToneMap[status] ?? 'in-progress',
    []
  );
  const castingTone = useCallback((status: string) => statusToneMap[status] ?? 'open', []);

  return (
    <main className="flex flex-col gap-20 bg-gradient-to-br from-[#fdf9ee] via-white to-[#f5f6fb] pb-32 text-slate-900">
      <motion.section
        {...fadeIn()}
        className="relative isolate overflow-hidden px-6 pb-20 pt-24 sm:px-10 lg:px-20"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(238,226,190,0.48),transparent_62%),radial-gradient(circle_at_78%_12%,rgba(173,206,255,0.55),transparent_60%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white via-transparent" />
        <div className="relative z-10 flex flex-col gap-8">
          <StatusPill tone="dreaming" className="w-fit bg-white/60 text-slate-700 shadow-sm">
            admin orbit
          </StatusPill>
          <GlowTitle
            eyebrow="Beeyondtheworld admin"
            title="Dream orchestration console"
            description="Follow every brand tale, from whispering ideation to luminous delivery, with a control surface designed like our journeys."
            align="left"
            glowTone="honey"
          />
          <p className="max-w-4xl text-base leading-relaxed text-slate-700">
            The dashboard keeps freelancers, clients, production phases, proposals, contracts,
            deliverables, and casting circles aligned. Mark steps complete, advance prospects, and
            open shared assets without leaving this orbit.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Button
              asChild
              className="border border-slate-200 bg-white/80 px-6 py-3 text-slate-900 shadow-sm transition hover:bg-white"
            >
              <Link
                href="#production-pipeline"
                className="flex items-center gap-2 text-[11px] uppercase tracking-[0.4em]"
              >
                Open production flow <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button
              variant="ghost"
              asChild
              className="border border-transparent px-6 py-3 text-slate-600 transition hover:border-slate-200 hover:bg-white"
            >
              <Link
                href="#freelancer-hub"
                className="flex items-center gap-2 text-[11px] uppercase tracking-[0.4em]"
              >
                Freelancer atlas <NotebookPen className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </motion.section>

      <motion.section {...fadeIn(0.1)} className="px-6 sm:px-10 lg:px-20" id="kpis">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {adminKpis.map((kpi) => (
            <motion.div
              key={kpi.id}
              whileHover={{ y: -6, scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            >
              <Card className="h-full border border-slate-200/60 bg-white/80 shadow-sm">
                <CardHeader className="gap-4">
                  <CardTitle className="text-xs uppercase tracking-[0.42em] text-slate-500">
                    {kpi.label}
                  </CardTitle>
                  <CardDescription className="font-title text-4xl uppercase tracking-[0.22em] text-slate-900">
                    {kpi.value}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <p className="text-xs leading-relaxed text-slate-500">{kpi.deltaLabel}</p>
                  <StatusPill tone={kpi.trend}>
                    {trendIcon[kpi.trend]}
                    trend
                  </StatusPill>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section {...fadeIn(0.2)} className="px-6 sm:px-10 lg:px-20" id="production-pipeline">
        <div className="flex flex-col gap-8">
          <GlowTitle
            eyebrow="Production constellation"
            title="Step-by-step checklists across every phase"
            description="Pre-production, production, and post-production are surfaced with detailed rituals you can mark complete."
            align="left"
            glowTone="dawn"
          />
          <div className="flex flex-wrap gap-3">
            {pipelineOrder.map((stage) => (
              <Button
                key={stage}
                onClick={() => setSelectedStage(stage)}
                className={cn(
                  'rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.4em] shadow-sm transition',
                  selectedStage === stage
                    ? 'border-slate-800 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                )}
              >
                {stageLabels[stage]}
              </Button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedStage}
              {...fadeIn(0.05)}
              className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3"
            >
              {visibleStages.map((stage) => {
                const progress = progressForStage(stage);
                return (
                  <Card
                    key={stage.id}
                    className="flex h-full flex-col gap-4 border border-slate-200 bg-white/85 shadow-sm"
                  >
                    <CardHeader className="gap-3">
                      <CardTitle className="text-base uppercase tracking-[0.32em] text-slate-900">
                        {stage.title}
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-600">
                        {stage.notes}
                      </CardDescription>
                      <CardAction>
                        <StatusPill tone={productionStatusTone(stage.status)}>
                          {stage.status}
                        </StatusPill>
                      </CardAction>
                    </CardHeader>
                    <CardContent className="space-y-5 text-sm text-slate-700">
                      <div className="grid gap-3 text-xs uppercase tracking-[0.3em] text-slate-500">
                        <span className="flex items-center gap-2">
                          <Users className="size-4" aria-hidden /> {stage.owner}
                        </span>
                        <span className="flex items-center gap-2">
                          <CalendarDays className="size-4" aria-hidden /> Due {stage.due}
                        </span>
                        <div className="flex items-center gap-3 text-slate-500">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                              className="h-full rounded-full bg-gradient-to-r from-[#f6c452] via-[#f3a9b3] to-[#7fa7ff]"
                            />
                          </div>
                          <span>{progress}%</span>
                        </div>
                      </div>

                      <div className="grid gap-3">
                        {stage.steps.map((step) => (
                          <motion.button
                            key={step.id}
                            whileHover={{ y: -2 }}
                            onClick={() => handleStepToggle(stage.id, step.id)}
                            className={cn(
                              'flex items-start gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition',
                              step.completed
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                            )}
                          >
                            <span className="mt-0.5">
                              <CheckCircle2
                                className={cn(
                                  'size-5 transition',
                                  step.completed ? 'text-emerald-500' : 'text-slate-300'
                                )}
                                aria-hidden
                              />
                            </span>
                            <span>
                              <span className="block font-medium">{step.label}</span>
                              <span className="block text-xs text-slate-500">
                                {step.description}
                              </span>
                              <span className="mt-1 block text-[11px] uppercase tracking-[0.32em] text-slate-400">
                                {step.owner} • due {step.due}
                              </span>
                            </span>
                          </motion.button>
                        ))}
                      </div>

                      {stage.links?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {stage.links.map((link) => (
                            <Link
                              key={link.label}
                              href={link.href}
                              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-[11px] uppercase tracking-[0.35em] text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                            >
                              <ExternalLink className="size-3" aria-hidden /> {link.label}
                            </Link>
                          ))}
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.section>

      <motion.section {...fadeIn(0.25)} className="px-6 sm:px-10 lg:px-20" id="brand-ledger">
        <GlowTitle
          eyebrow="Brand ledger"
          title="Clients, contacts, and portals"
          description="Every brand card exposes contacts, timelines, and direct links to proposals, contracts, and deliverable kits."
          align="left"
          glowTone="honey"
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {clientState.map((record, index) => (
            <motion.div key={record.id} {...fadeIn(index * 0.05)} className="h-full">
              <Card className="h-full border border-slate-200 bg-white/85 shadow-sm">
                <CardHeader className="gap-3">
                  <CardTitle className="font-display text-xl uppercase tracking-[0.3em] text-slate-900">
                    {record.brand}
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-600">
                    {record.journeyName}
                  </CardDescription>
                  <CardAction>
                    <StatusPill tone={journeyStageTone(record.stageStatus)}>
                      {record.stageStatus}
                    </StatusPill>
                  </CardAction>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-slate-700">
                  <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.3em] text-slate-500">
                    <Users className="size-4" aria-hidden /> {record.pointOfContact}
                    <span className="mx-2">•</span>
                    {record.timezone}
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.3em] text-slate-500">
                    <span className="flex items-center gap-2">
                      <CalendarDays className="size-4" aria-hidden /> {record.productionWindow}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock3 className="size-4" aria-hidden /> {record.nextMilestone}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={record.proposalLink}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-[11px] uppercase tracking-[0.35em] text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      <ExternalLink className="size-3" aria-hidden /> Proposal
                    </Link>
                    <Link
                      href={record.contractLink}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-[11px] uppercase tracking-[0.35em] text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      <ExternalLink className="size-3" aria-hidden /> Contract
                    </Link>
                    <Link
                      href={record.deliverableLink}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-[11px] uppercase tracking-[0.35em] text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      <ExternalLink className="size-3" aria-hidden /> Deliverables
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section {...fadeIn(0.3)} className="px-6 sm:px-10 lg:px-20" id="prospection">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="border border-slate-200 bg-white/85 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg uppercase tracking-[0.35em] text-slate-900">
                Prospection & proposal tracker
              </CardTitle>
              <CardDescription className="text-sm text-slate-600">
                Advance discussion stages with a single tap and keep notes visible.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {prospects.map((item, index) => (
                <motion.div
                  key={item.id}
                  {...fadeIn(index * 0.05)}
                  className="grid gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm md:grid-cols-[1.2fr_auto]"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-500">
                      <Globe2 className="size-4" aria-hidden /> {item.brand}
                    </div>
                    <p className="text-sm leading-relaxed text-slate-700">{item.focus}</p>
                    <p className="text-xs text-slate-500">Lead: {item.owner}</p>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <StatusPill tone={journeyStageTone(item.stage)}>{item.stage}</StatusPill>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                      {item.followUp}
                    </p>
                    <p className="max-w-[18rem] text-right text-xs text-slate-500">{item.notes}</p>
                    <div className="flex items-center gap-2">
                      {item.deckLink ? (
                        <Link
                          href={item.deckLink}
                          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-slate-600 transition hover:text-slate-900"
                        >
                          <ExternalLink className="size-3" aria-hidden /> Deck
                        </Link>
                      ) : null}
                      <Button
                        onClick={() => handleAdvanceProspect(item.id)}
                        className="rounded-full border border-slate-200 bg-white px-4 py-1 text-[11px] uppercase tracking-[0.35em] text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        Advance
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white/85 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg uppercase tracking-[0.35em] text-slate-900">
                Casting constellation
              </CardTitle>
              <CardDescription className="text-sm text-slate-600">
                Toggle casting status as sessions move from open to wrapped.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {castingState.map((casting, index) => (
                <motion.div
                  key={casting.id}
                  {...fadeIn(index * 0.05)}
                  className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-900">
                        {casting.title}
                      </h4>
                      <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-500">
                        {casting.journey}
                      </p>
                    </div>
                    <button type="button" onClick={() => handleCastingStatus(casting.id)}>
                      <StatusPill tone={castingTone(casting.status)}>{casting.status}</StatusPill>
                    </button>
                  </div>
                  <div className="mt-4 space-y-2 text-xs text-slate-600">
                    <p className="flex items-center gap-2 uppercase tracking-[0.3em]">
                      <CalendarDays className="size-4" aria-hidden /> {casting.date}
                    </p>
                    <p className="flex items-center gap-2 uppercase tracking-[0.3em]">
                      <MapPin className="size-4" aria-hidden /> {casting.location}
                    </p>
                    <p className="leading-relaxed">{casting.notes}</p>
                  </div>
                  <div className="mt-3">
                    <Link
                      href={casting.rosterLink}
                      className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.35em] text-slate-600 transition hover:text-slate-900"
                    >
                      <ExternalLink className="size-3" aria-hidden /> View roster
                    </Link>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>
      </motion.section>

      <motion.section {...fadeIn(0.35)} className="px-6 sm:px-10 lg:px-20" id="freelancer-hub">
        <GlowTitle
          eyebrow="Global crew atlas"
          title="Freelancers ready to weave the next journey"
          description="Availability, specialties, and active journeys for each dream steward."
          align="left"
          glowTone="dawn"
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {freelancerRecords.map((freelancer, index) => (
            <motion.div key={freelancer.id} {...fadeIn(index * 0.05)}>
              <Card className="border border-slate-200 bg-white/85 shadow-sm">
                <CardHeader className="gap-2">
                  <CardTitle className="text-base uppercase tracking-[0.28em] text-slate-900">
                    {freelancer.name}
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-600">
                    {freelancer.role}
                  </CardDescription>
                  <CardAction>
                    <StatusPill tone={statusToneMap[freelancer.availability] ?? 'now'}>
                      {freelancer.availability}
                    </StatusPill>
                  </CardAction>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-slate-700">
                  <div className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    {freelancer.region}
                  </div>
                  <ul className="space-y-2 text-xs text-slate-600">
                    {freelancer.specialties.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 size-3.5 text-slate-300" aria-hidden />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div>
                    <h5 className="text-xs uppercase tracking-[0.3em] text-slate-500">
                      Active journeys
                    </h5>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      {freelancer.activeJourneys.join(', ')}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{freelancer.dayRate} / day</span>
                    <Link
                      href={`mailto:${freelancer.contact}`}
                      className="text-[11px] uppercase tracking-[0.35em] text-slate-600 transition hover:text-slate-900"
                    >
                      Contact
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section {...fadeIn(0.4)} className="px-6 sm:px-10 lg:px-20" id="deliverables">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card className="border border-slate-200 bg-white/85 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg uppercase tracking-[0.35em] text-slate-900">
                Contracts & deliverables
              </CardTitle>
              <CardDescription className="text-sm text-slate-600">
                Toggle delivery status and open the bundle instantly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {deliverables.map((file, index) => (
                <motion.div
                  key={file.id}
                  {...fadeIn(index * 0.05)}
                  className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-900">
                        {file.title}
                      </h4>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                        {file.brand} • {file.journey}
                      </p>
                    </div>
                    <button type="button" onClick={() => handleDeliverableToggle(file.id)}>
                      <StatusPill tone={deliverableTone(file.status)}>{file.status}</StatusPill>
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.3em] text-slate-500">
                    <CalendarDays className="size-4" aria-hidden /> Due {file.due}
                  </div>
                  <div className="mt-3">
                    <Link
                      href={file.link}
                      className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.35em] text-slate-600 transition hover:text-slate-900"
                    >
                      <ExternalLink className="size-3" aria-hidden /> Open folder
                    </Link>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white/85 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg uppercase tracking-[0.35em] text-slate-900">
                Journey control center
              </CardTitle>
              <CardDescription className="text-sm text-slate-600">
                Shortcut to the most frequent admin rituals.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm text-slate-700">
              {[
                { label: 'Production flow', href: '#production-pipeline' },
                { label: 'Brand ledger', href: '#brand-ledger' },
                { label: 'Casting hub', href: '#prospection' },
                { label: 'Talent clusters', href: '#freelancer-hub' },
              ].map((action) => (
                <motion.div
                  key={action.label}
                  whileHover={{ x: 6 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                >
                  <Link
                    href={action.href}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <span className="uppercase tracking-[0.35em]">{action.label}</span>
                    <ArrowUpRight className="size-4" aria-hidden />
                  </Link>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>
      </motion.section>
    </main>
  );
}
