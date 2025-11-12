'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  Mail,
  MessageCircle,
  Phone,
} from 'lucide-react';

import { GlowTitle } from '@/components/primitives';
import { GlassCard } from '@/components/primitives/glass-card';
import SplitText from '@/components/SplitText';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CampaignDetail, JourneySummary } from '@/types/content';

type StepId = 'identity' | 'project' | 'preferences';

interface ContactExperienceProps {
  journeys: JourneySummary[];
  campaigns: CampaignDetail[];
}

type ContactFormState = {
  name: string;
  email: string;
  brand: string;
  journeyId: string;
  campaignId: string;
  projectNotes: string;
  contactMethods: string[];
  preferredDate: string;
  honeytoken: string;
};

const INITIAL_FORM_STATE: ContactFormState = {
  name: '',
  email: '',
  brand: '',
  journeyId: '',
  campaignId: '',
  projectNotes: '',
  contactMethods: ['email'],
  preferredDate: '',
  honeytoken: '',
};

const CONTACT_METHOD_OPTIONS = [
  {
    value: 'email',
    label: 'Email',
    description: 'A detailed reply in your inbox within 24h.',
    icon: Mail,
  },
  {
    value: 'whatsapp',
    label: 'WhatsApp',
    description: 'A quick voice note or text tailored to your timezone.',
    icon: MessageCircle,
  },
  {
    value: 'call',
    label: 'Call',
    description: 'Schedule a tailored conversation with our producers.',
    icon: Phone,
  },
] as const;

const CONTACT_LABELS = {
  email: 'Email',
  whatsapp: 'WhatsApp',
  call: 'Call',
} as const;

const STEPS: Array<{
  id: StepId;
  title: string;
  eyebrow: string;
  description: string;
  accent: 'honey' | 'rose' | 'peach';
}> = [
  {
    id: 'identity',
    title: 'Identity',
    eyebrow: 'Step 1',
    description: 'Let us know who is reaching out so we can tailor our reply.',
    accent: 'peach',
  },
  {
    id: 'project',
    title: 'Project Info',
    eyebrow: 'Step 2',
    description: 'Select the journey and campaign inspirations guiding your brief.',
    accent: 'rose',
  },
  {
    id: 'preferences',
    title: 'Preferences',
    eyebrow: 'Step 3',
    description: 'Tell us how to reach you and when you would like to connect.',
    accent: 'honey',
  },
];

const STEP_QUOTES: Record<StepId, string> = {
  identity: '"Every journey begins with a name."',
  project: '"Inspiration becomes a destination when it is shared."',
  preferences: '"Connection flows sweetest when intention leads."',
};

const HONEY_GRADIENT =
  'linear-gradient(90deg, rgba(240,188,112,0.95) 0%, rgba(243,205,156,0.9) 55%, rgba(248,236,214,0.85) 100%)';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_REQUIRED_ERROR = 'Email is required to receive our proposal.';
const EMAIL_INVALID_ERROR = 'Enter a valid email address.';

const SUCCESS_MESSAGE = 'Your journey begins here - we will be in touch soon.';

const CARD_EASE = [0.16, 1, 0.3, 1] as const;
const SHAKE_EASE = [0.42, 0, 0.58, 1] as const;
const CARD_VARIANTS = {
  enter: ({
    direction,
    orientation,
  }: {
    direction: 1 | -1;
    orientation: 'horizontal' | 'vertical';
  }) => ({
    opacity: 0,
    x: orientation === 'horizontal' ? direction * 140 : 0,
    y: orientation === 'vertical' ? direction * 95 : 0,
    scale: 0.96,
    rotate: direction * -1.75,
    filter: 'blur(18px)',
  }),
  center: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    rotate: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.65,
      ease: CARD_EASE,
    },
  },
  exit: ({
    direction,
    orientation,
  }: {
    direction: 1 | -1;
    orientation: 'horizontal' | 'vertical';
  }) => ({
    opacity: 0,
    x: orientation === 'horizontal' ? direction * -120 : 0,
    y: orientation === 'vertical' ? direction * -80 : 0,
    scale: 0.96,
    rotate: direction * 1.5,
    filter: 'blur(18px)',
    transition: {
      duration: 0.55,
      ease: CARD_EASE,
    },
  }),
};

const FIELD_SHAKE_VARIANTS: Variants = {
  steady: { x: 0 },
  shake: {
    x: [0, -5, 5, -4, 4, -2, 2, 0],
    transition: { duration: 0.45, ease: SHAKE_EASE },
  },
};

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia(query);
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
    setMatches(mediaQuery.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

export function ContactExperience({ journeys, campaigns }: ContactExperienceProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [formState, setFormState] = useState<ContactFormState>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormState, string>>>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [contactMethodShake, setContactMethodShake] = useState(false);

  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const orientation = isDesktop ? 'horizontal' : 'vertical';

  const activeStep = STEPS[stepIndex];
  const totalSteps = STEPS.length;
  const progress = ((stepIndex + 1) / totalSteps) * 100;

  const journeyOptions = useMemo(
    () =>
      journeys.map((journey) => ({
        value: journey.id,
        label: journey.title,
        subtitle: journey.location,
      })),
    [journeys]
  );

  const campaignOptions = useMemo(
    () =>
      campaigns.map((campaign) => ({
        value: campaign.id,
        label: campaign.title,
      })),
    [campaigns]
  );

  const journeySelection = useMemo(
    () => journeyOptions.find((option) => option.value === formState.journeyId) ?? null,
    [formState.journeyId, journeyOptions]
  );
  const campaignSelection = useMemo(
    () => campaignOptions.find((option) => option.value === formState.campaignId) ?? null,
    [formState.campaignId, campaignOptions]
  );
  const readableDate = useMemo(() => {
    if (!formState.preferredDate) return null;
    const date = new Date(formState.preferredDate);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, [formState.preferredDate]);

  const trimmedEmail = formState.email.trim();
  const emailIsValid = trimmedEmail ? EMAIL_REGEX.test(trimmedEmail) : false;
  const emailSuccessMessage =
    trimmedEmail && emailIsValid ? 'Perfect - we will reach out to this inbox shortly.' : undefined;

  useEffect(() => {
    if (!trimmedEmail) {
      setErrors((prev) => {
        if (!prev?.email || prev.email === EMAIL_REQUIRED_ERROR) {
          return prev;
        }
        const next = { ...prev };
        delete next.email;
        return Object.keys(next).length ? next : {};
      });
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setErrors((prev) => {
        if (prev?.email === EMAIL_INVALID_ERROR) {
          return prev;
        }
        return { ...prev, email: EMAIL_INVALID_ERROR };
      });
      return;
    }

    setErrors((prev) => {
      if (!prev?.email) {
        return prev;
      }
      const next = { ...prev };
      delete next.email;
      return Object.keys(next).length ? next : {};
    });
  }, [trimmedEmail]);

  const updateField = useCallback(
    <K extends keyof ContactFormState>(key: K, value: ContactFormState[K]) => {
      setFormState((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        if (!prev) return prev;

        if (key === 'email') {
          if (!prev.email) {
            return prev;
          }
          const next = { ...prev };
          delete next.email;
          return Object.keys(next).length ? next : {};
        }

        if (!prev[key]) {
          return prev;
        }

        const next = { ...prev };
        delete next[key];
        return Object.keys(next).length ? next : {};
      });
    },
    []
  );

  const toggleContactMethod = useCallback((value: string) => {
    setFormState((prev) => {
      const exists = prev.contactMethods.includes(value);
      const contactMethods = exists
        ? prev.contactMethods.filter((method) => method !== value)
        : [...prev.contactMethods, value];
      return { ...prev, contactMethods };
    });
    setErrors((prev) => {
      if (!prev?.contactMethods) return prev;
      const next = { ...prev };
      delete next.contactMethods;
      return next;
    });
  }, []);

  useEffect(() => {
    if (errors.contactMethods) {
      setContactMethodShake(true);
    }
  }, [errors.contactMethods]);

  const validateStep = useCallback(
    (stepId: StepId) => {
      const stepErrors: Partial<Record<keyof ContactFormState, string>> = {};

      if (stepId === 'identity') {
        if (!formState.name.trim()) {
          stepErrors.name = 'Name is required to personalise our reply.';
        }
        if (!trimmedEmail) {
          stepErrors.email = EMAIL_REQUIRED_ERROR;
        } else if (!EMAIL_REGEX.test(trimmedEmail)) {
          stepErrors.email = EMAIL_INVALID_ERROR;
        }
      }

      if (stepId === 'preferences' && !formState.contactMethods.length) {
        stepErrors.contactMethods = 'Select at least one channel so we know how to reach you.';
      }

      if (Object.keys(stepErrors).length) {
        setErrors((prev) => ({ ...prev, ...stepErrors }));
        return false;
      }

      return true;
    },
    [formState.contactMethods.length, formState.name, trimmedEmail]
  );

  const changeStep = useCallback(
    (nextIndex: number) => {
      setDirection(nextIndex > stepIndex ? 1 : -1);
      setStepIndex(nextIndex);
      setSubmissionMessage('');
    },
    [stepIndex]
  );

  const handleNext = useCallback(() => {
    if (status === 'submitting' || status === 'success') return;
    if (stepIndex >= totalSteps - 1) return;
    const isValid = validateStep(activeStep.id);
    if (!isValid) return;
    changeStep(stepIndex + 1);
  }, [activeStep.id, changeStep, status, stepIndex, totalSteps, validateStep]);

  const handlePrevious = useCallback(() => {
    if (status === 'submitting' || status === 'success') return;
    if (stepIndex === 0) return;
    changeStep(stepIndex - 1);
  }, [changeStep, status, stepIndex]);

  const handleStepClick = useCallback(
    (index: number) => {
      if (status === 'submitting' || status === 'success') return;
      if (index === stepIndex) return;
      if (index > stepIndex && !validateStep(activeStep.id)) {
        return;
      }
      changeStep(index);
    },
    [activeStep.id, changeStep, status, stepIndex, validateStep]
  );

  const handleReset = useCallback(() => {
    setFormState(INITIAL_FORM_STATE);
    setErrors({});
    setStatus('idle');
    setSubmissionMessage('');
    changeStep(0);
  }, [changeStep]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (status === 'submitting') return;

      const identityValid = validateStep('identity');
      if (!identityValid) {
        changeStep(0);
        setStatus('idle');
        return;
      }

      const preferencesValid = validateStep('preferences');
      if (!preferencesValid) {
        setStatus('idle');
        return;
      }

      if (formState.honeytoken.trim()) {
        setStatus('success');
        setSubmissionMessage(SUCCESS_MESSAGE);
        return;
      }

      setStatus('submitting');
      setSubmissionMessage('');

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formState.name,
            email: formState.email,
            brand: formState.brand,
            journeyId: formState.journeyId,
            journeyTitle: journeySelection?.label ?? null,
            campaignId: formState.campaignId,
            campaignTitle: campaignSelection?.label ?? null,
            projectNotes: formState.projectNotes,
            contactMethods: formState.contactMethods,
            preferredDate: formState.preferredDate,
            honeytoken: formState.honeytoken,
          }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          if (data?.fieldErrors) {
            setErrors((prev) => ({ ...prev, ...data.fieldErrors }));
          }
          throw new Error(data?.error ?? 'Unable to send your request. Please try again.');
        }

        setStatus('success');
        setSubmissionMessage(data?.message ?? SUCCESS_MESSAGE);
      } catch (error) {
        console.error(error);
        setStatus('error');
        setSubmissionMessage(
          error instanceof Error
            ? error.message
            : 'Something went wrong while sending your request. Please try again.'
        );
      }
    },
    [
      campaignSelection?.label,
      changeStep,
      formState.brand,
      formState.campaignId,
      formState.contactMethods,
      formState.email,
      formState.honeytoken,
      formState.journeyId,
      formState.name,
      formState.preferredDate,
      formState.projectNotes,
      journeySelection?.label,
      status,
      validateStep,
    ]
  );

  const renderStepContent = () => {
    if (activeStep.id === 'identity') {
      return (
        <div className="grid gap-6 md:grid-cols-2">
          <FloatingField
            id="name"
            label="Name"
            autoComplete="name"
            required
            value={formState.name}
            onChange={(value: string) => updateField('name', value)}
            error={errors.name}
            helper="Introduce yourself or the key stakeholder."
          />
          <FloatingField
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={formState.email}
            onChange={(value: string) => updateField('email', value)}
            error={errors.email}
            helper="We reply from hello@beeyondtheworld.com."
            success={emailSuccessMessage}
          />
          <FloatingField
            id="brand"
            label="Brand / Company"
            autoComplete="organization"
            value={formState.brand}
            onChange={(value: string) => updateField('brand', value)}
            placeholder="Maison, label or agency"
            helper="Optional  helps us align the creative tone."
          />
        </div>
      );
    }

    if (activeStep.id === 'project') {
      return (
        <div className="grid gap-6">
          <FloatingSelect
            id="journey"
            label="Select Journey"
            value={formState.journeyId}
            onChange={(value: string) => updateField('journeyId', value)}
            options={journeyOptions}
            placeholder="Choose a journey inspiration"
          />
          <FloatingSelect
            id="campaign"
            label="Select Campaign"
            value={formState.campaignId}
            onChange={(value: string) => updateField('campaignId', value)}
            options={campaignOptions}
            placeholder="Choose a campaign narrative"
          />
          <FloatingField
            id="projectNotes"
            label="Tell us more about your project"
            type="textarea"
            value={formState.projectNotes}
            onChange={(value: string) => updateField('projectNotes', value)}
            placeholder="What story are you ready to tell?"
            helper="Share objectives, locations, timelines or collaborators."
            rows={5}
          />
        </div>
      );
    }

    if (status === 'success') {
      return (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: CARD_EASE }}
          className="space-y-6"
        >
          <div className="space-y-3">
            <p className="font-display text-xs uppercase tracking-[0.5em] text-foreground/55">
              Submission received
            </p>
            <h3 className="font-title text-2xl uppercase tracking-[0.18em] text-foreground">
              {submissionMessage || SUCCESS_MESSAGE}
            </h3>
            <p className="text-sm leading-relaxed text-foreground/70">
              Thank you {formState.name || 'there'}. Our producers will curate a tailored response
              referencing your selected inspirations and reach out via your chosen channel.
            </p>
          </div>
          <div className="grid gap-4 rounded-[28px] border border-white/45 bg-white/55 p-6">
            {journeySelection ? (
              <SummaryRow label="Journey focus" value={journeySelection.label} />
            ) : null}
            {campaignSelection ? (
              <SummaryRow label="Campaign inspiration" value={campaignSelection.label} />
            ) : null}
            {formState.brand ? <SummaryRow label="Brand" value={formState.brand} /> : null}
            {formState.contactMethods.length ? (
              <SummaryRow
                label="Preferred contact"
                value={formState.contactMethods
                  .map((method) => CONTACT_LABELS[method as keyof typeof CONTACT_LABELS] ?? method)
                  .join('  ')}
              />
            ) : null}
            {readableDate ? <SummaryRow label="Desired date" value={readableDate} /> : null}
          </div>
        </motion.div>
      );
    }

    return (
      <div className="space-y-8">
        <motion.div
          className="grid gap-4 lg:grid-cols-3"
          variants={FIELD_SHAKE_VARIANTS}
          animate={contactMethodShake ? 'shake' : 'steady'}
          onAnimationComplete={(definition) => {
            if (definition === 'shake') {
              setContactMethodShake(false);
            }
          }}
        >
          {CONTACT_METHOD_OPTIONS.map((option) => (
            <ContactMethodToggle
              key={option.value}
              option={option}
              selected={formState.contactMethods.includes(option.value)}
              onToggle={() => toggleContactMethod(option.value)}
            />
          ))}
        </motion.div>
        <AnimatePresence mode="wait">
          {errors.contactMethods ? (
            <motion.p
              key="contact-method-error"
              className="text-sm text-[#e08c8a]"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {errors.contactMethods}
            </motion.p>
          ) : null}
        </AnimatePresence>
        <div className="grid gap-6 md:grid-cols-2">
          <FloatingField
            id="preferredDate"
            label="Preferred meeting date"
            type="date"
            value={formState.preferredDate}
            onChange={(value: string) => updateField('preferredDate', value)}
            helper="We'll confirm the closest available slot."
          />
          <div className="hidden" aria-hidden>
            <FloatingField
              id="honeytoken"
              label="Leave this empty"
              value={formState.honeytoken}
              onChange={(value: string) => updateField('honeytoken', value)}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="relative min-h-[100svh] overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-20"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/assets/concept/sustainable.webm" type="video/webm" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-[#fbe8d7]/85 via-[#f4ddea]/35 to-[#f5f0e7]/20 backdrop-blur-[14px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,205,170,0.25),transparent_55%),radial-gradient(circle_at_80%_10%,rgba(246,196,215,0.18),transparent_60%),radial-gradient(circle_at_45%_85%,rgba(248,236,210,0.4),transparent_68%)]" />
        <div className="grain-overlay absolute inset-0 opacity-35 mix-blend-soft-light" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center px-6 pb-24 pt-32 sm:px-10 lg:px-16">
        <div className="w-full max-w-6xl">
          <header className="mb-16">
            <GlowTitle
              eyebrow="Begin a journey"
              glowTone="umber"
              align="left"
              title={
                <SplitText
                  text="Craft a contact that feels like arrival"
                  tag="h1"
                  splitType="words"
                  className="text-balance font-title text-3xl uppercase leading-[1.1] text-foreground sm:text-4xl lg:text-5xl"
                  textAlign="left"
                />
              }
              description="Three cinematic cards capture who you are, which horizons inspire you, and the way you prefer to connect."
            />
          </header>

          <section className="space-y-12">
            <div className="space-y-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between font-display text-[11px] uppercase tracking-[0.45em] text-foreground/55">
                  <span>{activeStep.eyebrow}</span>
                  <span>
                    {String(stepIndex + 1).padStart(2, '0')} / {String(totalSteps).padStart(2, '0')}
                  </span>
                </div>
                <div className="relative h-3 overflow-hidden rounded-full border border-white/35 bg-white/45 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.45)]">
                  <motion.div
                    role="presentation"
                    className="honey-flow absolute inset-y-0 left-0 rounded-full"
                    style={{ backgroundImage: HONEY_GRADIENT }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`progress-glow-${stepIndex}`}
                      className="pointer-events-none absolute inset-y-0"
                      initial={{ opacity: 0.85, width: `${Math.max(progress, 12)}%` }}
                      animate={{ opacity: [0.85, 0.35, 0.85] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.2, ease: SHAKE_EASE }}
                      style={{
                        left: `calc(${progress}% - 22px)`,
                        width: '48px',
                        background:
                          'radial-gradient(circle, rgba(255, 222, 196, 0.65), transparent 70%)',
                        filter: 'blur(8px)',
                      }}
                    />
                  </AnimatePresence>
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute -top-1.5 size-4 rounded-full bg-[#f6e8ce] shadow-[0_0_18px_rgba(248,214,170,0.75)]"
                    animate={{
                      x: [
                        `calc(${progress}% - 10px)`,
                        `calc(${progress}% - 2px)`,
                        `calc(${progress}% - 10px)`,
                      ],
                      y: ['-2px', '8px', '-2px'],
                    }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: SHAKE_EASE }}
                  />
                </div>
              </div>

              <div className="lg:hidden">
                <div className="relative overflow-hidden rounded-[32px] border border-white/35 bg-white/50 p-2 shadow-[0_25px_60px_-45px_rgba(87,62,38,0.5)] backdrop-blur-xl">
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/55 via-[#f4dcb3]/30 to-[#f1e7d9]/35" />
                  <div className="relative flex items-center justify-between gap-2">
                    {STEPS.map((step, index) => (
                      <StepperPill
                        key={step.id}
                        index={index}
                        step={step}
                        isActive={index === stepIndex}
                        isComplete={index < stepIndex}
                        onSelect={() => handleStepClick(index)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-8 lg:flex-row">
              <aside className="hidden w-full max-w-[240px] flex-shrink-0 lg:flex lg:flex-col lg:gap-4">
                {STEPS.map((step, index) => (
                  <StepperRailItem
                    key={step.id}
                    index={index}
                    step={step}
                    isActive={index === stepIndex}
                    isComplete={index < stepIndex}
                    onSelect={() => handleStepClick(index)}
                  />
                ))}
              </aside>

              <form className="flex-1" onSubmit={handleSubmit} noValidate aria-live="polite">
                <AnimatePresence mode="wait" custom={{ direction, orientation }}>
                  <motion.div
                    key={activeStep.id}
                    variants={CARD_VARIANTS}
                    custom={{ direction, orientation }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                  >
                    <GlassCard
                      accent={activeStep.accent}
                      hoverGlow={false}
                      className="soft-card-texture relative overflow-hidden rounded-[44px] border-white/45 bg-white/35 p-8 shadow-[0_70px_140px_-80px_rgba(87,62,38,0.55)] backdrop-blur-2xl supports-backdrop:bg-white/25 md:p-10"
                    >
                      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-white/85 via-white/35 to-white/5" />
                      <div className="grain-overlay pointer-events-none absolute inset-0 -z-10 opacity-35 mix-blend-soft-light" />

                      <div className="flex flex-col gap-8">
                        <div className="space-y-3">
                          <p className="font-display text-[11px] uppercase tracking-[0.45em] text-foreground/55">
                            {activeStep.title}
                          </p>
                          <p className="max-w-xl text-sm leading-relaxed text-foreground/75">
                            {activeStep.description}
                          </p>
                        </div>

                        <div className="relative space-y-8" data-step={activeStep.id}>
                          {renderStepContent()}
                        </div>

                        <AnimatePresence mode="wait">
                          {status !== 'success' ? (
                            <motion.p
                              key={`quote-${activeStep.id}`}
                              className="text-center text-sm italic text-foreground/55 lg:text-left"
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -12 }}
                              transition={{ duration: 0.5, ease: [0.22, 0.8, 0.2, 1] }}
                            >
                              {STEP_QUOTES[activeStep.id]}
                            </motion.p>
                          ) : null}
                        </AnimatePresence>

                        <div
                          className={cn(
                            'flex flex-wrap items-center justify-between gap-4 pt-4',
                            status !== 'success' &&
                              'sticky bottom-4 z-20 rounded-[32px] border border-white/40 bg-white/80 px-4 py-4 shadow-[0_35px_95px_-70px_rgba(87,62,38,0.6)] backdrop-blur-xl lg:static lg:border-none lg:bg-transparent lg:px-0 lg:py-0 lg:shadow-none'
                          )}
                        >
                          {status === 'success' ? (
                            <div className="flex flex-wrap gap-3">
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={handleReset}
                                className="rounded-full border border-white/65 px-6 py-3 text-xs uppercase tracking-[0.4em] text-foreground/70 shadow-none transition-all hover:border-foreground/60 hover:text-foreground"
                              >
                                Start another request
                              </Button>
                            </div>
                          ) : (
                            <>
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={handlePrevious}
                                disabled={stepIndex === 0 || status === 'submitting'}
                                className="group flex items-center gap-2 rounded-full border border-white/65 px-6 py-3 text-xs uppercase tracking-[0.4em] text-foreground/70 shadow-none transition-all hover:border-foreground/60 hover:text-foreground disabled:opacity-40"
                              >
                                <ArrowLeft
                                  className="size-4 transition-transform duration-300 group-hover:-translate-x-1"
                                  aria-hidden
                                />
                                Back
                              </Button>

                              {activeStep.id === 'preferences' ? (
                                <motion.div layout>
                                  <Button
                                    type="submit"
                                    disabled={status === 'submitting'}
                                    className="group relative overflow-hidden rounded-full bg-gradient-to-r from-[#edc077] via-[#f3d6a3] to-[#f6efe4] px-12 py-4 text-[11px] uppercase tracking-[0.5em] text-foreground shadow-[0_40px_110px_-65px_rgba(237,190,120,0.6)] transition-all hover:shadow-[0_45px_120px_-60px_rgba(237,190,120,0.75)] disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    <span className="flex items-center gap-3">
                                      {status === 'submitting' ? 'Sending' : 'Send your request'}
                                    </span>
                                    {status === 'submitting' ? (
                                      <BeeLoader />
                                    ) : (
                                      <span className="pointer-events-none absolute right-8 top-3 flex flex-col items-center opacity-60 transition-transform duration-500 group-hover:translate-y-3 group-hover:opacity-100">
                                        <span className="h-3 w-3 rounded-full bg-white/80" />
                                        <span className="mt-1 h-6 w-[3px] rounded-full bg-gradient-to-b from-white/70 to-transparent" />
                                      </span>
                                    )}
                                  </Button>
                                </motion.div>
                              ) : (
                                <Button
                                  type="button"
                                  onClick={handleNext}
                                  disabled={status === 'submitting'}
                                  className="group relative flex items-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-[#f0c57d] via-[#f1dab0] to-[#f7f0e5] px-12 py-4 text-[11px] uppercase tracking-[0.5em] text-foreground shadow-[0_40px_110px_-65px_rgba(240,197,125,0.55)] transition-all hover:shadow-[0_45px_120px_-60px_rgba(240,197,125,0.7)] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <span className="flex items-center gap-3">
                                    Next step
                                    <ChevronRight
                                      className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                                      aria-hidden
                                    />
                                  </span>
                                  <span className="pointer-events-none absolute right-9 top-2 flex flex-col items-center opacity-0 transition-all duration-500 group-hover:translate-y-3 group-hover:opacity-100">
                                    <span className="h-3 w-3 rounded-full bg-white/85" />
                                    <span className="mt-1 h-6 w-[3px] rounded-full bg-gradient-to-b from-white/70 to-transparent" />
                                  </span>
                                </Button>
                              )}
                            </>
                          )}
                        </div>

                        <AnimatePresence>
                          {status === 'error' && submissionMessage ? (
                            <motion.p
                              key="submission-error"
                              className="text-sm text-[#e08c8a]"
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              transition={{ duration: 0.4, ease: 'easeOut' }}
                            >
                              {submissionMessage}
                            </motion.p>
                          ) : null}
                        </AnimatePresence>
                      </div>
                    </GlassCard>
                  </motion.div>
                </AnimatePresence>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

type FloatingFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'textarea' | 'date';
  required?: boolean;
  error?: string;
  autoComplete?: string;
  placeholder?: string;
  helper?: string;
  success?: string;
  rows?: number;
};

function FloatingField({
  id,
  label,
  value,
  onChange,
  type = 'text',
  required,
  error,
  autoComplete,
  placeholder,
  helper,
  success,
  rows = 4,
}: FloatingFieldProps) {
  const isTextArea = type === 'textarea';
  const [shouldShake, setShouldShake] = useState(false);

  useEffect(() => {
    if (error) {
      setShouldShake(true);
    }
  }, [error]);

  const hasSuccess = Boolean(success && !error);

  const baseClasses = cn(
    'peer w-full rounded-[28px] border border-white/55 bg-white/70 px-6 pb-3 pt-6 text-sm text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition-all duration-300 placeholder-transparent focus:border-foreground/60 focus:bg-white/85 focus:shadow-[0_0_0_3px_rgba(247,200,173,0.35)] focus:outline-none',
    isTextArea ? 'min-h-[180px] resize-none md:min-h-[200px]' : 'h-16',
    type === 'date' ? 'text-[13px]' : 'text-base',
    error &&
      'border-transparent shadow-[0_0_0_4px_rgba(248,191,200,0.45)] focus:shadow-[0_0_0_5px_rgba(248,191,200,0.5)]',
    hasSuccess && 'border-transparent shadow-[0_0_0_4px_rgba(244,201,162,0.35)]'
  );

  return (
    <motion.div
      className="space-y-3"
      variants={FIELD_SHAKE_VARIANTS}
      animate={shouldShake ? 'shake' : 'steady'}
      onAnimationComplete={(definition) => {
        if (definition === 'shake') {
          setShouldShake(false);
        }
      }}
    >
      <div className="relative">
        {isTextArea ? (
          <textarea
            id={id}
            name={id}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder=" "
            rows={rows}
            className={baseClasses}
            aria-invalid={Boolean(error)}
          />
        ) : (
          <input
            id={id}
            name={id}
            type={type === 'date' ? 'date' : type}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder=" "
            autoComplete={autoComplete}
            className={baseClasses}
            aria-invalid={Boolean(error)}
          />
        )}
        <label
          htmlFor={id}
          className={cn(
            'pointer-events-none absolute left-6 font-display text-[11px] uppercase tracking-[0.45em] text-foreground/55 transition-all duration-300',
            value ? 'top-3' : 'top-1/2 -translate-y-1/2',
            'peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-[11px] peer-focus:tracking-[0.5em]'
          )}
        >
          {label}
          {!required ? (
            <span className="ml-2 text-[10px] uppercase tracking-[0.3em] text-foreground/35">
              optional
            </span>
          ) : null}
        </label>
      </div>
      {placeholder ? (
        <p className="text-[11px] uppercase tracking-[0.35em] text-foreground/35">{placeholder}</p>
      ) : null}
      {helper ? <p className="text-xs leading-relaxed text-foreground/60">{helper}</p> : null}
      <AnimatePresence mode="wait">
        {error ? (
          <motion.p
            key="field-error"
            className="text-xs text-[#e08c8a]"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {error}
          </motion.p>
        ) : null}
      </AnimatePresence>
      {!error && hasSuccess ? (
        <motion.p
          className="text-xs text-foreground/55"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {success}
        </motion.p>
      ) : null}
    </motion.div>
  );
}

type FloatingSelectOption = {
  value: string;
  label: string;
  subtitle?: string;
};

type FloatingSelectProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FloatingSelectOption[];
  placeholder?: string;
};
function FloatingSelect({ id, label, value, onChange, options, placeholder }: FloatingSelectProps) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <select
          id={id}
          name={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            'peer h-16 w-full appearance-none rounded-[28px] border border-white/55 bg-white/70 px-6 pb-2 pt-6 text-base text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition-all duration-300 focus:border-foreground/60 focus:bg-white/85 focus:shadow-[0_0_0_3px_rgba(247,200,173,0.35)] focus:outline-none',
            !value ? 'text-foreground/60' : 'text-foreground'
          )}
        >
          <option value="" disabled>
            {placeholder ?? 'Select an option'}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
              {option.subtitle ? `  ${option.subtitle}` : ''}
            </option>
          ))}
        </select>
        <label
          htmlFor={id}
          className={cn(
            'pointer-events-none absolute left-6 font-display text-[11px] uppercase tracking-[0.45em] text-foreground/55 transition-all duration-300',
            value ? 'top-3' : 'top-1/2 -translate-y-1/2',
            'peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-[11px] peer-focus:tracking-[0.5em]'
          )}
        >
          {label}
        </label>
        <ChevronDown className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 text-foreground/55" />
      </div>
      {placeholder ? (
        <p className="text-[11px] uppercase tracking-[0.35em] text-foreground/35">{placeholder}</p>
      ) : null}
    </div>
  );
}

type ContactMethodOption = (typeof CONTACT_METHOD_OPTIONS)[number];

type ContactMethodToggleProps = {
  option: ContactMethodOption;
  selected: boolean;
  onToggle: () => void;
};

function ContactMethodToggle({ option, selected, onToggle }: ContactMethodToggleProps) {
  const Icon = option.icon;

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      className={cn(
        'group relative flex h-full flex-col gap-3 rounded-[28px] border border-white/45 bg-white/65 p-6 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition-all duration-300 hover:-translate-y-1 hover:border-foreground/60 hover:bg-white/80',
        selected &&
          'border-transparent bg-gradient-to-br from-[#f6d7a6]/80 via-[#f3dfc6]/70 to-[#f8eee0]/80 shadow-[0_25px_70px_-45px_rgba(87,62,38,0.45)]'
      )}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: [0.2, 0.8, 0.4, 1] }}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'inline-flex size-12 items-center justify-center rounded-full bg-white/80 text-foreground transition-all duration-300',
            selected &&
              'bg-gradient-to-br from-[#f8cf9d] to-[#f4bbd5] text-foreground/85 shadow-[0_10px_25px_-15px_rgba(87,62,38,0.4)]'
          )}
        >
          <Icon className="size-5" aria-hidden />
        </span>
        <span
          aria-hidden
          className={cn(
            'inline-flex size-6 items-center justify-center rounded-full border border-white/65 text-[11px] font-semibold uppercase tracking-[0.35em] text-foreground/50 transition-all duration-300',
            selected &&
              'border-transparent bg-foreground/90 text-white shadow-[0_0_0_3px_rgba(255,236,210,0.4)]'
          )}
        >
          {selected ? <Check className="size-4" aria-hidden /> : ' '}
        </span>
      </div>
      <div className="space-y-2">
        <p className="font-display text-sm uppercase tracking-[0.28em] text-foreground/80">
          {option.label}
        </p>
        <p className="text-sm leading-relaxed text-foreground/65">{option.description}</p>
      </div>
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-x-6 bottom-4 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#f7d9a8]/60 to-transparent opacity-0 transition-opacity duration-300',
          selected && 'opacity-100'
        )}
      />
    </motion.button>
  );
}

type StepperPillProps = {
  index: number;
  step: (typeof STEPS)[number];
  isActive: boolean;
  isComplete: boolean;
  onSelect: () => void;
};

function StepperPill({ index, step, isActive, isComplete, onSelect }: StepperPillProps) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      className={cn(
        'group relative flex min-w-[100px] flex-1 items-center justify-center gap-3 rounded-full border border-white/40 bg-white/55 px-4 py-3 text-left font-display text-[10px] uppercase tracking-[0.42em] text-foreground/55 transition-all duration-300',
        isComplete && 'text-foreground/75',
        isActive &&
          'border-transparent bg-gradient-to-r from-[#f6d6a3]/80 via-[#f3e2c9]/75 to-[#f8f2e7]/80 text-foreground shadow-[0_18px_45px_-28px_rgba(247,205,166,0.75)]'
      )}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25, ease: [0.2, 0.8, 0.4, 1] }}
    >
      <span
        className={cn(
          'inline-flex size-8 items-center justify-center rounded-full border border-white/60 text-[11px] font-semibold tracking-[0.3em] transition-all duration-300',
          isActive
            ? 'border-foreground/70 bg-foreground text-white shadow-[0_0_0_3px_rgba(255,236,210,0.35)]'
            : isComplete
              ? 'bg-white/80 text-foreground/70'
              : 'bg-white/60 text-foreground/50'
        )}
      >
        {String(index + 1).padStart(2, '0')}
      </span>
      <span className="flex flex-col items-start text-[9px] tracking-[0.42em]">
        {step.title}
        <span
          className={cn(
            'mt-1 block h-[2px] w-full rounded-full bg-foreground/15 transition-all duration-300',
            isActive && 'bg-gradient-to-r from-[#f5d9ab] to-[#f2e3c9]'
          )}
        />
      </span>
    </motion.button>
  );
}

type StepperRailItemProps = StepperPillProps;

function StepperRailItem({ index, step, isActive, isComplete, onSelect }: StepperRailItemProps) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      className={cn(
        'group relative flex w-full items-center gap-4 rounded-[28px] border border-white/30 bg-white/30 px-5 py-5 text-left transition-all duration-300',
        isComplete && 'border-white/50 bg-white/45 text-foreground/70',
        isActive &&
          'border-transparent bg-gradient-to-r from-[#f7ddb5]/75 via-[#f3e4cb]/65 to-[#f8f3e8]/70 text-foreground shadow-[0_30px_70px_-55px_rgba(246,192,146,0.55)]'
      )}
      whileHover={{ x: 4 }}
      transition={{ duration: 0.25, ease: [0.2, 0.8, 0.4, 1] }}
    >
      <span
        className={cn(
          'flex size-10 items-center justify-center rounded-full border border-white/60 text-xs font-semibold uppercase tracking-[0.3em] transition-all duration-300',
          isActive
            ? 'border-foreground/70 bg-foreground text-white shadow-[0_0_0_3px_rgba(255,236,210,0.35)]'
            : isComplete
              ? 'bg-white/80 text-foreground/70'
              : 'bg-white/55 text-foreground/50'
        )}
      >
        {String(index + 1).padStart(2, '0')}
      </span>
      <div className="flex flex-col">
        <span className="font-display text-sm uppercase tracking-[0.32em]">{step.title}</span>
        <span className="text-[11px] uppercase tracking-[0.35em] text-foreground/50">
          {step.description}
        </span>
      </div>
      {isActive ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[28px] border border-white/35 shadow-[0_0_0_1px_rgba(255,255,255,0.35)]"
        />
      ) : null}
    </motion.button>
  );
}

type SummaryRowProps = {
  label: string;
  value: string;
};

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-[11px] uppercase tracking-[0.4em] text-foreground/45">{label}</span>
      <span className="text-sm text-foreground/80 sm:text-right">{value}</span>
    </div>
  );
}

function BeeLoader() {
  return (
    <motion.span
      aria-hidden
      className="ml-3 inline-flex items-center gap-1 text-sm"
      initial="idle"
      animate="buzz"
      variants={{
        idle: { opacity: 0 },
        buzz: {
          opacity: 1,
          transition: { staggerChildren: 0.12, repeat: Infinity },
        },
      }}
    >
      {['??', '??', '??'].map((symbol, index) => (
        <motion.span
          key={index}
          variants={{
            idle: { y: 0, rotate: 0 },
            buzz: {
              y: [-2, 2, -2],
              rotate: [-6, 6, -6],
              transition: { duration: 1.6, repeat: Infinity, ease: SHAKE_EASE },
            },
          }}
        >
          {symbol}
        </motion.span>
      ))}
    </motion.span>
  );
}
