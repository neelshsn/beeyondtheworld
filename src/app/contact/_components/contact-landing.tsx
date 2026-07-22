'use client';

import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

import { BeeButton } from '@/components/primitives/bee-button';

type ContactStage = 'entry' | 'audience' | 'form';
export type AudienceKey = 'BRANDS' | 'AGENCIES' | 'NJOS' | 'MEDIAS';

type ContactLandingProps = {
  initialAudience?: AudienceKey;
  journeySlug?: string;
  onExit?: () => void;
};

type ChoiceOption = {
  label: string;
  icon?: string;
};

type StepDefinition =
  | {
      id: string;
      title: string;
      helper?: string;
      kind: 'choice';
      options: ChoiceOption[];
      columns?: 2 | 3;
      allowMultiple?: boolean;
    }
  | {
      id: string;
      title: string;
      helper: string;
      kind: 'fields';
      fields: Array<{
        id: string;
        label: string;
        placeholder: string;
      }>;
    }
  | {
      id: string;
      title: string;
      helper: string;
      kind: 'date';
    };

type StepAnswer = string | string[] | Record<string, string>;
type SubmissionState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; reference: string }
  | { status: 'error'; message: string };

const ICONO_BASE = '/assets/icones/icono';

const CONTACT_AUDIENCES: Array<{ key: AudienceKey; icon: string }> = [
  { key: 'BRANDS', icon: `${ICONO_BASE}/ecosystem/brands.svg` },
  { key: 'AGENCIES', icon: `${ICONO_BASE}/ecosystem/agencies.svg` },
  { key: 'NJOS', icon: `${ICONO_BASE}/ecosystem/njos.svg` },
  { key: 'MEDIAS', icon: `${ICONO_BASE}/ecosystem/distribution.svg` },
];

const AUDIENCE_INTROS: Record<AudienceKey, { eyebrow: string; title: string; body: string }> = {
  BRANDS: {
    eyebrow: 'PROFILE SELECTED',
    title: 'Brands',
    body: 'Let us shape your positioning, budget, timing and creative ambition before we meet.',
  },
  AGENCIES: {
    eyebrow: 'PROFILE SELECTED',
    title: 'Agencies',
    body: 'We map your speciality, scope and rhythm so the meeting starts with the right project frame.',
  },
  NJOS: {
    eyebrow: 'PROFILE SELECTED',
    title: 'NJOs',
    body: 'Share your impact focus and partnership needs so we can build a meaningful first exchange.',
  },
  MEDIAS: {
    eyebrow: 'PROFILE SELECTED',
    title: 'Medias',
    body: 'We align on editorial angle, audience and collaboration format before setting the conversation.',
  },
};

const SIGNATURE_WORLDS_STEP: StepDefinition = {
  id: 'visual-territory',
  title: 'Shape your signature worlds',
  kind: 'choice',
  columns: 3,
  allowMultiple: true,
  options: [
    { label: 'DESERT REVERIES', icon: `${ICONO_BASE}/landscape/desert-reveries.svg` },
    { label: 'OCEAN & SEA WONDERS', icon: `${ICONO_BASE}/landscape/ocean-sea-wonders.svg` },
    { label: 'HERITAGE CITIES', icon: `${ICONO_BASE}/landscape/heritage-cities.svg` },
    { label: 'HIGHLAND REALMS', icon: `${ICONO_BASE}/landscape/highland-realms.svg` },
    { label: 'SLOW LIVING STORIES', icon: `${ICONO_BASE}/landscape/slow-living-stories.svg` },
  ],
};

const MEETING_STEP: StepDefinition = {
  id: 'meeting-date',
  title: 'Meet the bees',
  helper: 'Pick the date that works best for your first call.',
  kind: 'date',
};

const AUDIENCE_STEPS: Record<AudienceKey, StepDefinition[]> = {
  BRANDS: [
    {
      id: 'category',
      title: 'Select your essence',
      helper: 'Choose the universe that best reflects your brand.',
      kind: 'choice',
      columns: 3,
      options: [
        { label: 'SWIMWEAR', icon: `${ICONO_BASE}/brands/swimwear.svg` },
        { label: 'APPAREL', icon: `${ICONO_BASE}/brands/apparel.svg` },
        { label: 'SHOES' },
        { label: 'ACCESSORIES', icon: `${ICONO_BASE}/brands/access.svg` },
        { label: 'OPTICAL', icon: `${ICONO_BASE}/brands/eyewear.svg` },
        { label: 'COSMETICS', icon: `${ICONO_BASE}/brands/makeup-cosmetic.svg` },
        { label: 'PERFUME', icon: `${ICONO_BASE}/brands/perfume.svg` },
        { label: 'JEWELRY' },
        { label: 'OTHERS' },
      ],
    },
    SIGNATURE_WORLDS_STEP,
    MEETING_STEP,
  ],
  AGENCIES: [
    {
      id: 'agency-core',
      title: 'Tell us about your agency',
      helper: 'Start with your identity and where you are based.',
      kind: 'fields',
      fields: [
        { id: 'agency-name', label: 'Agency Name', placeholder: 'Agency Name' },
        { id: 'agency-location', label: 'Location', placeholder: 'London, UK' },
      ],
    },
    SIGNATURE_WORLDS_STEP,
    MEETING_STEP,
  ],
  NJOS: [
    {
      id: 'ngo-core',
      title: 'Tell us about your organization',
      helper: 'We only need the essentials for the first meeting.',
      kind: 'fields',
      fields: [
        { id: 'ngo-name', label: 'Organization Name', placeholder: 'Organization Name' },
        { id: 'ngo-location', label: 'Location', placeholder: 'Delhi, India' },
        {
          id: 'ngo-region',
          label: 'Region of Action',
          placeholder: 'North India / Kerala / Global...',
        },
      ],
    },
    {
      id: 'focus',
      title: 'What is your main area of impact?',
      helper:
        'Select the focus that defines your organization best. You can choose multiple options.',
      kind: 'choice',
      columns: 3,
      allowMultiple: true,
      options: [
        { label: 'ENVIRONMENT', icon: `${ICONO_BASE}/association/njos.svg` },
        { label: 'SOCIAL', icon: `${ICONO_BASE}/association/social.svg` },
        { label: 'SOCIETAL', icon: `${ICONO_BASE}/association/support.svg` },
      ],
    },
    SIGNATURE_WORLDS_STEP,
    MEETING_STEP,
  ],
  MEDIAS: [
    {
      id: 'media-core',
      title: 'Tell us about your media',
      helper: 'We need your name, base and audience overview.',
      kind: 'fields',
      fields: [
        { id: 'media-name', label: 'Media Name', placeholder: 'Publication Name' },
        { id: 'media-location', label: 'Location', placeholder: 'New York, USA' },
        {
          id: 'media-audience',
          label: 'Audience',
          placeholder: 'Luxury travelers / Fashion readers...',
        },
      ],
    },
    SIGNATURE_WORLDS_STEP,
    MEETING_STEP,
  ],
};

const stageEase = [0.22, 1, 0.36, 1] as const;
const audiencePanelMask = 'linear-gradient(to right, transparent 0px, black 132px, black 100%)';
const stepperPanelMask = 'linear-gradient(to right, transparent 0px, black 132px, black 100%)';

export function ContactLanding({ initialAudience, journeySlug, onExit }: ContactLandingProps = {}) {
  const [stage, setStage] = useState<ContactStage>(initialAudience ? 'form' : 'entry');
  const [selectedAudience, setSelectedAudience] = useState<AudienceKey | null>(
    initialAudience ?? null
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, StepAnswer>>({});
  const [consentGiven, setConsentGiven] = useState(false);
  const [honeytoken, setHoneytoken] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [submission, setSubmission] = useState<SubmissionState>({ status: 'idle' });

  useEffect(() => {
    setIdempotencyKey(crypto.randomUUID());
  }, []);

  const currentSteps = useMemo(
    () => (selectedAudience ? AUDIENCE_STEPS[selectedAudience] : []),
    [selectedAudience]
  );
  const currentStep = currentSteps[currentStepIndex] ?? null;
  const progress = currentSteps.length > 1 ? currentStepIndex / (currentSteps.length - 1) : 0;

  const setChoiceAnswer = (step: Extract<StepDefinition, { kind: 'choice' }>, value: string) => {
    setAnswers((current) => {
      if (step.allowMultiple) {
        const previous = Array.isArray(current[step.id]) ? (current[step.id] as string[]) : [];
        const next = previous.includes(value)
          ? previous.filter((entry) => entry !== value)
          : [...previous, value];

        return {
          ...current,
          [step.id]: next,
        };
      }

      return {
        ...current,
        [step.id]: value,
      };
    });
  };

  const setFieldAnswer = (stepId: string, fieldId: string, value: string) => {
    setAnswers((current) => ({
      ...current,
      [stepId]: {
        ...((current[stepId] as Record<string, string> | undefined) ?? {}),
        [fieldId]: value,
      },
    }));
  };

  const confirmAudience = () => {
    if (!selectedAudience) {
      return;
    }

    setCurrentStepIndex(0);
    setAnswers({});
    setConsentGiven(false);
    setSubmission({ status: 'idle' });
    setIdempotencyKey(crypto.randomUUID());
    setStage('form');
  };

  const goToNextStep = () => {
    if (!currentStep) {
      return;
    }

    if (!isCurrentStepComplete) {
      return;
    }

    if (currentStepIndex < currentSteps.length - 1) {
      setCurrentStepIndex((value) => value + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((value) => value - 1);
      return;
    }

    if (initialAudience && onExit) {
      onExit();
      return;
    }

    setStage('audience');
  };

  const submitContact = async () => {
    if (!selectedAudience || !currentStep || !isCurrentStepComplete || !consentGiven) return;

    setSubmission({ status: 'submitting' });
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: journeySlug ? 'journey_booking' : 'contact',
          audience: selectedAudience,
          journeySlug,
          answers,
          consent: consentGiven,
          honeytoken,
          idempotencyKey,
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        reference?: string;
        error?: string;
      };
      if (!response.ok || !payload.reference) {
        throw new Error(payload.error ?? 'Your request could not be saved. Please try again.');
      }
      setSubmission({ status: 'success', reference: payload.reference });
    } catch (cause) {
      setSubmission({
        status: 'error',
        message: cause instanceof Error ? cause.message : 'Your request could not be saved.',
      });
    }
  };

  const isCurrentStepComplete = useMemo(() => {
    if (!currentStep) return false;

    const answer = answers[currentStep.id];

    if (currentStep.kind === 'choice') {
      if (currentStep.allowMultiple) {
        return Array.isArray(answer) && answer.length > 0;
      }

      return typeof answer === 'string' && answer.trim().length > 0;
    }

    if (currentStep.kind === 'fields') {
      if (!answer || typeof answer !== 'object' || Array.isArray(answer)) return false;

      return currentStep.fields.every((field) => {
        const value = answer[field.id];
        return typeof value === 'string' && value.trim().length > 0;
      });
    }

    if (!answer || typeof answer !== 'object' || Array.isArray(answer)) return false;

    return ['date', 'time', 'whatsapp'].every((fieldId) => {
      const value = answer[fieldId];
      return typeof value === 'string' && value.trim().length > 0;
    });
  }, [answers, currentStep]);

  const isFinalStep = currentStepIndex === currentSteps.length - 1;

  return (
    <main className="relative h-[100svh] overflow-hidden border-b border-[#f4bb52]/70 bg-[#d8ccb8] text-white">
      <video
        className="absolute inset-0 h-full w-full object-cover object-center"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/assets/contact/contact-hero-v2.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.08)_0%,rgba(10,10,10,0.06)_36%,rgba(10,10,10,0.28)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,245,227,0.18)_0%,rgba(255,245,227,0.06)_28%,rgba(255,245,227,0)_62%)]" />

      <AnimatePresence mode="wait" initial={false}>
        {stage === 'entry' ? (
          <motion.section
            key="contact-entry"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: stageEase }}
            className="relative z-10 flex h-full items-center justify-center px-5 pb-0 sm:px-8 lg:items-end lg:pb-[10svh]"
          >
            <motion.div
              initial={{ opacity: 0, y: 26, filter: 'blur(12px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.1, ease: stageEase }}
              className="flex w-full max-w-[980px] flex-col items-center"
            >
              <div className="relative flex items-end justify-center">
                <h1 className="flex items-end justify-center gap-3 whitespace-nowrap text-center uppercase leading-none text-white sm:gap-5">
                  <span className="text-[clamp(3rem,10vw,7rem)] tracking-[0.02em] [font-family:var(--font-cannia)] [text-shadow:0_0_18px_rgba(255,255,255,0.42),0_0_38px_rgba(255,255,255,0.16)]">
                    BLOOM
                  </span>
                  <span className="text-[clamp(1.35rem,4vw,2.8rem)] normal-case italic tracking-normal opacity-95 [font-family:var(--font-saint)] [text-shadow:0_0_18px_rgba(255,255,255,0.42),0_0_38px_rgba(255,255,255,0.16)]">
                    the
                  </span>
                  <span className="text-[clamp(3rem,10vw,7rem)] tracking-[0.02em] [font-family:var(--font-cannia)] [text-shadow:0_0_18px_rgba(255,255,255,0.42),0_0_38px_rgba(255,255,255,0.16)]">
                    MAGIC
                  </span>
                </h1>
              </div>

              <BeeButton
                onClick={() => setStage('audience')}
                size="md"
                align="center"
                className="mt-6 [text-shadow:0_0_14px_rgba(255,255,255,0.32),0_0_28px_rgba(255,255,255,0.12)] sm:mt-7"
              >
                BEGIN THE JOURNEY
              </BeeButton>
            </motion.div>
          </motion.section>
        ) : null}

        {stage === 'audience' ? (
          <motion.section
            key="contact-audience"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: stageEase }}
            className="relative z-10 flex h-full items-stretch px-0 py-0"
          >
            <div className="grid h-full w-full grid-cols-1 items-stretch overflow-hidden lg:grid-cols-[1fr_1fr]">
              <motion.div
                initial={{ opacity: 0, x: -42, y: 18, filter: 'blur(14px)' }}
                animate={{ opacity: 1, x: 0, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.95, ease: stageEase }}
                className="hidden min-h-0 items-center justify-center px-5 py-8 sm:px-8 sm:py-10 lg:flex lg:justify-start lg:px-10 lg:py-12"
              >
                <div className="h-full w-full" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 42, y: 18, filter: 'blur(14px)' }}
                animate={{ opacity: 1, x: 0, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 1.05, delay: 0.08, ease: stageEase }}
                className="relative flex min-h-0 items-stretch justify-center overflow-hidden"
              >
                <div
                  className="relative z-10 flex h-full w-full flex-col overflow-hidden border border-[rgba(255,244,227,0.18)] bg-[linear-gradient(180deg,rgba(8,8,8,0.32)_0%,rgba(12,12,12,0.24)_34%,rgba(16,16,16,0.2)_100%)] px-5 py-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-1px_0_rgba(255,255,255,0.04),0_24px_80px_rgba(0,0,0,0.34)] backdrop-blur-[34px] sm:px-8 sm:py-10 lg:px-10 lg:py-12"
                  style={{
                    WebkitMaskImage: audiencePanelMask,
                    maskImage: audiencePanelMask,
                  }}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.05)_18%,rgba(255,255,255,0)_42%),linear-gradient(135deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_36%)]"
                  />
                  <div className="pt-[7svh] text-center lg:pl-[7%] lg:pt-[18svh] lg:text-center">
                    <p className="text-white/82 text-[0.68rem] uppercase tracking-[0.34em] [font-family:var(--font-adam)] [text-shadow:0_0_12px_rgba(255,255,255,0.3),0_0_22px_rgba(255,255,255,0.12)]">
                      WELCOME TO THE HIVE
                    </p>
                    <div className="mt-4 space-y-1">
                      <h2 className="text-[clamp(3.25rem,8vw,6.8rem)] uppercase leading-[0.88] tracking-[0.02em] text-white [font-family:var(--font-cannia)] [text-shadow:0_0_22px_rgba(255,255,255,0.42),0_0_44px_rgba(255,255,255,0.18)]">
                        CREATE
                      </h2>
                      <p className="text-white/94 text-[clamp(0.62rem,1.15vw,0.84rem)] uppercase leading-none tracking-[0.28em] [font-family:var(--font-adam)] [text-shadow:0_0_18px_rgba(255,255,255,0.32),0_0_34px_rgba(255,255,255,0.12)]">
                        BEEYOND THE HORIZONS
                      </p>
                    </div>
                  </div>

                  <div className="mt-[14svh] flex flex-1 items-start justify-center lg:mt-[12svh] lg:flex-none lg:justify-center">
                    <div className="grid w-full max-w-[38rem] grid-cols-2 gap-x-8 gap-y-9 sm:grid-cols-4 sm:gap-x-6">
                      {CONTACT_AUDIENCES.map((audience, index) => {
                        const isSelected = selectedAudience === audience.key;

                        return (
                          <motion.div
                            key={audience.key}
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.82,
                              delay: 0.12 + index * 0.08,
                              ease: stageEase,
                            }}
                            className="flex justify-center"
                          >
                            <button
                              type="button"
                              onClick={() => setSelectedAudience(audience.key)}
                              className="group flex flex-col items-center gap-4"
                            >
                              <span className="relative h-12 w-12 sm:h-14 sm:w-14">
                                <Image
                                  src={audience.icon}
                                  alt=""
                                  fill
                                  className={`object-contain transition duration-300 ${
                                    isSelected
                                      ? 'scale-105 opacity-100'
                                      : 'opacity-85 group-hover:scale-105 group-hover:opacity-100'
                                  }`}
                                />
                              </span>
                              <span
                                className={`border-b pb-1 text-center text-[0.9rem] uppercase tracking-[0.28em] transition duration-300 [font-family:var(--font-adam)] sm:text-[0.98rem] ${
                                  isSelected
                                    ? 'border-[#f4bb52] text-[#f4bb52] [text-shadow:0_0_16px_rgba(244,187,82,0.5),0_0_30px_rgba(244,187,82,0.18)]'
                                    : 'text-white/88 border-transparent [text-shadow:0_0_12px_rgba(255,255,255,0.28),0_0_24px_rgba(255,255,255,0.1)] group-hover:border-[#f4bb52]/80 group-hover:text-[#f4bb52] group-hover:[text-shadow:0_0_16px_rgba(244,187,82,0.4),0_0_30px_rgba(244,187,82,0.14)]'
                                }`}
                              >
                                {audience.key}
                              </span>
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  <AnimatePresence>
                    {selectedAudience ? (
                      <motion.div
                        initial={{ opacity: 0, y: 18, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
                        transition={{ duration: 0.45, ease: stageEase }}
                        className="mt-8 flex justify-center lg:mt-10 lg:flex-1 lg:items-center lg:justify-center"
                      >
                        <BeeButton
                          onClick={confirmAudience}
                          size="md"
                          align="center"
                          className="min-w-[180px] [text-shadow:0_0_14px_rgba(255,255,255,0.32),0_0_28px_rgba(255,255,255,0.12)] sm:min-w-[220px]"
                        >
                          CONFIRM
                        </BeeButton>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </motion.section>
        ) : null}

        {stage === 'form' && selectedAudience && currentStep ? (
          <motion.section
            key={`contact-form-${selectedAudience}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: stageEase }}
            className="relative z-10 flex h-full items-stretch"
          >
            <div className="grid h-full w-full grid-cols-1 overflow-hidden lg:grid-cols-[0.9fr_1.1fr]">
              <motion.div
                initial={{ opacity: 0, x: -34, filter: 'blur(12px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.8, ease: stageEase }}
                className="hidden h-full flex-col justify-between px-10 py-12 lg:flex"
              >
                <div className="hidden space-y-5 pt-[12svh]">
                  <p className="text-white/82 text-[0.68rem] uppercase tracking-[0.34em] [font-family:var(--font-adam)] [text-shadow:0_0_12px_rgba(255,255,255,0.3),0_0_22px_rgba(255,255,255,0.12)]">
                    {AUDIENCE_INTROS[selectedAudience].eyebrow}
                  </p>
                  <h2 className="text-[clamp(3.6rem,8vw,6.6rem)] uppercase leading-[0.88] tracking-[0.02em] text-white [font-family:var(--font-cannia)] [text-shadow:0_0_22px_rgba(255,255,255,0.42),0_0_44px_rgba(255,255,255,0.18)]">
                    {AUDIENCE_INTROS[selectedAudience].title}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setStage('audience')}
                  className="text-white/82 inline-flex hidden w-fit items-center gap-3 text-[0.68rem] uppercase tracking-[0.28em] transition duration-300 [font-family:var(--font-adam)] [text-shadow:0_0_12px_rgba(255,255,255,0.28),0_0_24px_rgba(255,255,255,0.1)] hover:text-white"
                >
                  <span className="text-lg leading-none">←</span>
                  Change Profile
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 34, filter: 'blur(12px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.9, ease: stageEase }}
                className="relative flex h-full min-h-0 flex-col overflow-hidden"
              >
                <motion.div
                  className="relative z-10 flex h-full min-h-0 w-full flex-col overflow-hidden border border-[rgba(255,244,227,0.18)] bg-[linear-gradient(180deg,rgba(8,8,8,0.32)_0%,rgba(12,12,12,0.24)_34%,rgba(16,16,16,0.2)_100%)] px-5 py-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-1px_0_rgba(255,255,255,0.04),0_24px_80px_rgba(0,0,0,0.34)] backdrop-blur-[34px] sm:px-8 sm:py-10 lg:px-12 lg:py-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.75, ease: stageEase }}
                  style={{
                    WebkitMaskImage: stepperPanelMask,
                    maskImage: stepperPanelMask,
                  }}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.05)_18%,rgba(255,255,255,0)_42%),linear-gradient(135deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_36%)]"
                  />
                  <div className="mx-auto w-full max-w-[44rem] pt-4 lg:pt-8">
                    {journeySlug ? (
                      <p className="mb-4 text-center text-[0.62rem] uppercase tracking-[0.34em] text-[#f4bb52] [font-family:var(--font-adam)] [text-shadow:0_0_14px_rgba(244,187,82,0.38)]">
                        Journey selected · {journeySlug}
                      </p>
                    ) : null}
                    <div className="mb-5 text-center lg:hidden">
                      <p className="text-white/82 text-[0.62rem] uppercase tracking-[0.34em] [font-family:var(--font-adam)]">
                        {AUDIENCE_INTROS[selectedAudience].eyebrow}
                      </p>
                      <h2 className="mt-3 text-[clamp(2.7rem,9vw,4.5rem)] uppercase leading-[0.9] tracking-[0.02em] text-white [font-family:var(--font-cannia)] [text-shadow:0_0_22px_rgba(255,255,255,0.42),0_0_44px_rgba(255,255,255,0.18)]">
                        {AUDIENCE_INTROS[selectedAudience].title}
                      </h2>
                    </div>

                    <div className="relative mx-auto h-10 w-full max-w-[28rem]">
                      <div className="absolute left-0 right-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-white/70" />
                      <motion.div
                        className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[#f4bb52]"
                        animate={{ width: `${Math.max(progress * 100, 0)}%` }}
                        transition={{ duration: 0.55, ease: stageEase }}
                      />
                      <motion.div
                        className="absolute top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2"
                        animate={{ left: `${progress * 100}%` }}
                        transition={{ duration: 0.55, ease: stageEase }}
                      >
                        <Image
                          src={
                            currentStepIndex === 0
                              ? '/assets/icones/Ico White BEE-13.svg'
                              : '/assets/icones/Ico Gold BEE-13.svg'
                          }
                          alt=""
                          fill
                          className="object-contain"
                        />
                      </motion.div>
                    </div>
                  </div>

                  <div className="flex min-h-0 flex-1 items-center justify-center py-6 lg:py-8">
                    <div className="w-full max-w-[44rem] px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                          key={currentStep.id}
                          initial={{ opacity: 0, y: 18, filter: 'blur(10px)' }}
                          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                          exit={{ opacity: 0, y: -14, filter: 'blur(8px)' }}
                          transition={{ duration: 0.45, ease: stageEase }}
                        >
                          <div className="mb-8 text-center">
                            <h3 className="text-[clamp(2rem,5vw,3.25rem)] uppercase leading-[0.92] tracking-[0.02em] text-white [font-family:var(--font-cannia)] [text-shadow:0_0_18px_rgba(255,255,255,0.3),0_0_34px_rgba(255,255,255,0.12)]">
                              {currentStep.title}
                            </h3>
                            {currentStep.helper ? (
                              <p className="text-white/72 mx-auto mt-3 max-w-[34rem] text-sm uppercase tracking-[0.22em] [font-family:var(--font-adam)] [text-shadow:0_0_10px_rgba(255,255,255,0.18)]">
                                {currentStep.helper}
                              </p>
                            ) : null}
                          </div>

                          {currentStep.kind === 'choice' ? (
                            <div
                              className={`grid gap-3 ${
                                currentStep.columns === 3
                                  ? 'grid-cols-2 sm:grid-cols-3'
                                  : 'grid-cols-1 sm:grid-cols-2'
                              }`}
                            >
                              {currentStep.options.map((option) => {
                                const isSelected = currentStep.allowMultiple
                                  ? Array.isArray(answers[currentStep.id]) &&
                                    (answers[currentStep.id] as string[]).includes(option.label)
                                  : answers[currentStep.id] === option.label;

                                return (
                                  <button
                                    key={option.label}
                                    type="button"
                                    onClick={() => setChoiceAnswer(currentStep, option.label)}
                                    className={`group flex min-h-[4.25rem] flex-col items-center justify-center gap-3 rounded-none border px-4 py-4 text-center text-[0.74rem] uppercase tracking-[0.24em] transition duration-300 [font-family:var(--font-adam)] sm:text-[0.82rem] ${
                                      isSelected
                                        ? 'border-[#f4bb52] bg-[rgba(244,187,82,0.12)] text-white'
                                        : 'text-white/92 border-transparent bg-[rgba(244,187,82,0.09)] hover:border-[rgba(255,244,227,0.14)] hover:bg-[rgba(244,187,82,0.13)]'
                                    }`}
                                  >
                                    {option.icon ? (
                                      <span className="relative h-10 w-10 sm:h-11 sm:w-11">
                                        <Image
                                          src={option.icon}
                                          alt=""
                                          fill
                                          className={`object-contain transition duration-300 ${
                                            isSelected
                                              ? 'scale-105 opacity-100'
                                              : 'opacity-85 group-hover:scale-105 group-hover:opacity-100'
                                          }`}
                                        />
                                      </span>
                                    ) : null}
                                    <span>{option.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          ) : null}

                          {currentStep.kind === 'fields' ? (
                            <div className="grid gap-4 sm:grid-cols-2">
                              {currentStep.fields.map((field) => (
                                <label key={field.id} className="flex flex-col gap-2">
                                  <span className="text-[0.62rem] uppercase tracking-[0.26em] text-white/70 [font-family:var(--font-adam)]">
                                    {field.label}
                                  </span>
                                  <input
                                    value={
                                      ((answers[currentStep.id] as
                                        | Record<string, string>
                                        | undefined) ?? {})[field.id] ?? ''
                                    }
                                    onChange={(event) =>
                                      setFieldAnswer(currentStep.id, field.id, event.target.value)
                                    }
                                    placeholder={field.placeholder}
                                    className="placeholder:text-white/42 h-14 rounded-none border border-[rgba(255,244,227,0.12)] bg-[rgba(18,12,9,0.16)] px-4 text-sm text-white outline-none transition duration-300 focus:border-[#f4bb52] focus:bg-[rgba(18,12,9,0.22)]"
                                  />
                                </label>
                              ))}
                            </div>
                          ) : null}

                          {currentStep.kind === 'date' ? (
                            <div className="mx-auto max-w-[24rem]">
                              <label className="flex flex-col gap-3">
                                <span className="text-center text-[0.62rem] uppercase tracking-[0.26em] text-white/70 [font-family:var(--font-adam)]">
                                  Meeting Date
                                </span>
                                <input
                                  type="date"
                                  value={
                                    ((answers[currentStep.id] as
                                      | Record<string, string>
                                      | undefined) ?? {})['date'] ?? ''
                                  }
                                  onChange={(event) =>
                                    setFieldAnswer(currentStep.id, 'date', event.target.value)
                                  }
                                  className="h-16 rounded-none border border-[rgba(255,244,227,0.12)] bg-[rgba(18,12,9,0.16)] px-5 text-center text-base text-white outline-none transition duration-300 focus:border-[#f4bb52] focus:bg-[rgba(18,12,9,0.22)]"
                                />
                              </label>
                              <label className="mt-4 flex flex-col gap-3">
                                <span className="text-center text-[0.62rem] uppercase tracking-[0.26em] text-white/70 [font-family:var(--font-adam)]">
                                  Availability Time
                                </span>
                                <input
                                  type="time"
                                  value={
                                    ((answers[currentStep.id] as
                                      | Record<string, string>
                                      | undefined) ?? {})['time'] ?? ''
                                  }
                                  onChange={(event) =>
                                    setFieldAnswer(currentStep.id, 'time', event.target.value)
                                  }
                                  className="h-16 rounded-none border border-[rgba(255,244,227,0.12)] bg-[rgba(18,12,9,0.16)] px-5 text-center text-base text-white outline-none transition duration-300 focus:border-[#f4bb52] focus:bg-[rgba(18,12,9,0.22)]"
                                />
                              </label>
                              <label className="mt-4 flex flex-col gap-3">
                                <span className="text-center text-[0.62rem] uppercase tracking-[0.26em] text-white/70 [font-family:var(--font-adam)]">
                                  WhatsApp Number
                                </span>
                                <input
                                  type="tel"
                                  value={
                                    ((answers[currentStep.id] as
                                      | Record<string, string>
                                      | undefined) ?? {})['whatsapp'] ?? ''
                                  }
                                  onChange={(event) =>
                                    setFieldAnswer(currentStep.id, 'whatsapp', event.target.value)
                                  }
                                  placeholder="+33 6 12 34 56 78"
                                  className="placeholder:text-white/42 h-16 rounded-none border border-[rgba(255,244,227,0.12)] bg-[rgba(18,12,9,0.16)] px-5 text-center text-base text-white outline-none transition duration-300 focus:border-[#f4bb52] focus:bg-[rgba(18,12,9,0.22)]"
                                />
                              </label>
                              <label className="mt-5 flex items-start gap-3 text-left text-xs leading-relaxed text-white/70">
                                <input
                                  type="checkbox"
                                  checked={consentGiven}
                                  onChange={(event) => setConsentGiven(event.target.checked)}
                                  className="mt-0.5 size-4 accent-[#f4bb52]"
                                />
                                <span>
                                  I agree to be contacted by Beeyondtheworld about this request and
                                  have read the{' '}
                                  <a href="/privacy" className="underline underline-offset-4">
                                    privacy notice
                                  </a>
                                  .
                                </span>
                              </label>
                              <label className="absolute -left-[9999px]" aria-hidden>
                                Website
                                <input
                                  type="text"
                                  tabIndex={-1}
                                  autoComplete="off"
                                  value={honeytoken}
                                  onChange={(event) => setHoneytoken(event.target.value)}
                                />
                              </label>
                            </div>
                          ) : null}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>

                  {submission.status === 'success' ? (
                    <p className="mx-auto mb-4 w-full max-w-[44rem] text-center text-sm text-[#f4bb52]">
                      Request saved — reference {submission.reference}. Our team will be in touch
                      soon.
                    </p>
                  ) : null}
                  {submission.status === 'error' ? (
                    <p className="mx-auto mb-4 w-full max-w-[44rem] text-center text-sm text-red-300">
                      {submission.message}
                    </p>
                  ) : null}

                  <div className="mx-auto flex w-full max-w-[44rem] items-center justify-between gap-4">
                    <BeeButton
                      onClick={goToPreviousStep}
                      size="md"
                      align="left"
                      className="min-w-[132px] [text-shadow:0_0_14px_rgba(255,255,255,0.28)]"
                    >
                      Back
                    </BeeButton>
                    <BeeButton
                      onClick={() => (isFinalStep ? void submitContact() : goToNextStep())}
                      disabled={
                        !isCurrentStepComplete ||
                        submission.status === 'submitting' ||
                        submission.status === 'success' ||
                        (isFinalStep && !consentGiven)
                      }
                      size="md"
                      align="right"
                      className="min-w-[152px] [text-shadow:0_0_14px_rgba(255,255,255,0.28)]"
                    >
                      {submission.status === 'submitting'
                        ? 'Saving...'
                        : isFinalStep
                          ? 'Send Request'
                          : 'Continue'}
                    </BeeButton>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
