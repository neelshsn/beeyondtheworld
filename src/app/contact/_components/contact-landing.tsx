'use client';

import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';

type ContactStage = 'entry' | 'audience' | 'form';
type AudienceKey = 'BRANDS' | 'AGENCIES' | 'CREATORS' | 'TALENTS' | 'NJOS' | 'MEDIAS';

type StepDefinition =
  | {
      id: string;
      title: string;
      helper: string;
      kind: 'choice';
      options: string[];
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

const CONTACT_AUDIENCE_ROWS = [
  {
    icon: '/assets/icones/Ico White BEE-13.svg',
    left: 'BRANDS',
    right: 'AGENCIES',
  },
  {
    icon: '/assets/icones/Ico White BEE-14.svg',
    left: 'CREATORS',
    right: 'TALENTS',
  },
  {
    icon: '/assets/icones/Ico White BEE-06.svg',
    left: 'NJOS',
    right: 'MEDIAS',
  },
] as const;

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
  CREATORS: {
    eyebrow: 'PROFILE SELECTED',
    title: 'Creators',
    body: 'Tell us your craft, availability and creative direction to curate the best journey with you.',
  },
  TALENTS: {
    eyebrow: 'PROFILE SELECTED',
    title: 'Talents',
    body: 'We prepare the right productions, destinations and team chemistry around your talent profile.',
  },
  NJOS: {
    eyebrow: 'PROFILE SELECTED',
    title: 'NJOS',
    body: 'Share your impact focus and partnership needs so we can build a meaningful first exchange.',
  },
  MEDIAS: {
    eyebrow: 'PROFILE SELECTED',
    title: 'Medias',
    body: 'We align on editorial angle, audience and collaboration format before setting the conversation.',
  },
};

const AUDIENCE_STEPS: Record<AudienceKey, StepDefinition[]> = {
  BRANDS: [
    {
      id: 'category',
      title: 'Select your category',
      helper: 'Choose the universe that best reflects your brand.',
      kind: 'choice',
      columns: 3,
      options: [
        'SWIMWEAR',
        'APPAREL',
        'SHOES',
        'ACCESSORIES',
        'OPTICAL',
        'COSMETICS',
        'PERFUME',
        'JEWELRY',
        'OTHERS',
      ],
    },
    {
      id: 'brand-core',
      title: 'Tell us about your brand',
      helper: 'We need the essentials to position the collaboration correctly.',
      kind: 'fields',
      fields: [
        { id: 'brand-name', label: 'Brand Name', placeholder: 'Maison Example' },
        { id: 'brand-location', label: 'Location', placeholder: 'Paris, France' },
        { id: 'market-target', label: 'Market Target', placeholder: 'Europe / GCC / US...' },
      ],
    },
    {
      id: 'positioning',
      title: 'What is your positioning?',
      helper: 'Select the market space your brand is evolving in.',
      kind: 'choice',
      options: ['RESORT', 'MIDDLE MARKET', 'HIGH & LUXURY'],
    },
    {
      id: 'role',
      title: 'What is your role?',
      helper: 'This helps us adapt the conversation to your decision level.',
      kind: 'choice',
      columns: 3,
      options: [
        'ASSISTANT',
        'MARKETING DIRECTOR',
        'COMMUNICATION LEAD',
        'FOUNDER',
        'PR AGENCY',
        'STUDIO MANAGER',
      ],
    },
    {
      id: 'budget',
      title: 'What is your seasonal budget range?',
      helper: 'A broad range is enough at this stage.',
      kind: 'choice',
      options: ['6K - 10K', '10K - 20K', '20K - 35K', '35K - 50K', '50K+'],
    },
    {
      id: 'collections',
      title: 'How many collections do you shoot per season?',
      helper: 'Choose the closest rhythm.',
      kind: 'choice',
      options: ['1', '2', '3', '4+'],
    },
    {
      id: 'visual-positioning',
      title: 'What visual territory speaks to you most?',
      helper:
        'We use this to imagine the right destination and creative direction. You can choose multiple options.',
      kind: 'choice',
      columns: 3,
      allowMultiple: true,
      options: ['NATURE', 'CITY', 'SEA', 'DESERT', 'HOTEL', 'STUDIO', 'MOUNTAIN'],
    },
    {
      id: 'meeting-date',
      title: 'Select a meeting date',
      helper: 'Pick the date that works best for your first call.',
      kind: 'date',
    },
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
    {
      id: 'speciality',
      title: 'What is your speciality?',
      helper: 'Choose the area you want us to build around. You can choose multiple options.',
      kind: 'choice',
      columns: 3,
      allowMultiple: true,
      options: [
        'PR',
        'MARKETING',
        'PRODUCTION',
        'CASTING',
        'SOCIAL MEDIA',
        'CREATIVE DIRECTION',
        'EVENTS',
        'BRAND STRATEGY',
        'OTHERS',
      ],
    },
    {
      id: 'clients',
      title: 'What kind of clients do you mostly serve?',
      helper: 'This helps us calibrate the right destinations and logistics.',
      kind: 'choice',
      options: ['LUXURY', 'RESORT', 'CONTEMPORARY', 'BEAUTY', 'LIFESTYLE', 'HOSPITALITY'],
    },
    {
      id: 'collab-role',
      title: 'How do you want to collaborate with us?',
      helper: 'Select the role you expect from Hive.',
      kind: 'choice',
      options: ['LEAD PARTNER', 'LOCAL FIXER', 'PRODUCTION SUPPORT', 'COMMUNICATION SUPPORT'],
    },
    {
      id: 'budget',
      title: 'Typical seasonal project budget',
      helper: 'A range is enough to prepare the conversation.',
      kind: 'choice',
      options: ['6K - 15K', '15K - 30K', '30K - 50K', '50K+'],
    },
    {
      id: 'meeting-date',
      title: 'Select a meeting date',
      helper: 'Pick the date that works best for your first call.',
      kind: 'date',
    },
  ],
  CREATORS: [
    {
      id: 'craft',
      title: 'What is your main craft?',
      helper: 'Choose the creative identity you want to lead with.',
      kind: 'choice',
      columns: 3,
      options: [
        'PHOTOGRAPHY',
        'FILMMAKING',
        'CONTENT CREATION',
        'STYLING',
        'ART DIRECTION',
        'SET DESIGN',
        'MUSIC CURATION',
        'PRODUCTION',
        'OTHERS',
      ],
    },
    {
      id: 'creator-core',
      title: 'Tell us about yourself',
      helper: 'A few details help us imagine the best journey with you.',
      kind: 'fields',
      fields: [
        { id: 'creator-name', label: 'Name', placeholder: 'Your Name' },
        { id: 'creator-location', label: 'Location', placeholder: 'Lisbon, Portugal' },
        {
          id: 'creator-platform',
          label: 'Primary Platform',
          placeholder: 'Instagram / TikTok / Portfolio',
        },
      ],
    },
    {
      id: 'formats',
      title: 'What kind of collaborations are you looking for?',
      helper:
        'Pick the format that feels closest to your ambition. You can choose multiple options.',
      kind: 'choice',
      allowMultiple: true,
      options: [
        'CAMPAIGNS',
        'SOCIAL CONTENT',
        'EDITORIALS',
        'EVENTS',
        'RETREATS',
        'AMBASSADORSHIPS',
      ],
    },
    {
      id: 'visual-territory',
      title: 'Which visual territory attracts you most?',
      helper: 'We use this to orient destinations and storylines. You can choose multiple options.',
      kind: 'choice',
      allowMultiple: true,
      options: ['SEA', 'DESERT', 'NATURE', 'CITY', 'HERITAGE', 'WELLNESS'],
    },
    {
      id: 'availability',
      title: 'When are you most available?',
      helper: 'Select the quarter that feels the most realistic.',
      kind: 'choice',
      options: ['Q1', 'Q2', 'Q3', 'Q4', 'FLEXIBLE'],
    },
    {
      id: 'meeting-date',
      title: 'Select a meeting date',
      helper: 'Pick the date that works best for your first call.',
      kind: 'date',
    },
  ],
  TALENTS: [
    {
      id: 'profile',
      title: 'What kind of talent are you?',
      helper: 'Choose the profile that represents you best.',
      kind: 'choice',
      columns: 3,
      options: [
        'MODEL',
        'ACTOR',
        'DANCER',
        'MUSICIAN',
        'HOST',
        'ATHLETE',
        'WELLNESS',
        'FACE',
        'OTHERS',
      ],
    },
    {
      id: 'talent-core',
      title: 'Tell us about yourself',
      helper: 'These details help us match you with the right projects.',
      kind: 'fields',
      fields: [
        { id: 'talent-name', label: 'Name', placeholder: 'Your Name' },
        { id: 'talent-location', label: 'Location', placeholder: 'Milan, Italy' },
        { id: 'talent-agency', label: 'Agency / Manager', placeholder: 'Optional' },
      ],
    },
    {
      id: 'positioning',
      title: 'What universe do you belong to most?',
      helper: 'Choose the territory you feel closest to.',
      kind: 'choice',
      options: ['FASHION', 'BEAUTY', 'LIFESTYLE', 'WELLNESS', 'TRAVEL', 'LUXURY'],
    },
    {
      id: 'project-type',
      title: 'What projects are you looking for?',
      helper:
        'We will prioritize these opportunities in the call. You can choose multiple options.',
      kind: 'choice',
      allowMultiple: true,
      options: ['CAMPAIGNS', 'EDITORIAL', 'EVENTS', 'CONTENT TRIPS', 'AMBASSADORSHIPS'],
    },
    {
      id: 'availability',
      title: 'When are you most available?',
      helper: 'Choose the timing that is easiest for you.',
      kind: 'choice',
      options: ['IMMEDIATE', 'NEXT MONTH', 'NEXT SEASON', 'FLEXIBLE'],
    },
    {
      id: 'meeting-date',
      title: 'Select a meeting date',
      helper: 'Pick the date that works best for your first call.',
      kind: 'date',
    },
  ],
  NJOS: [
    {
      id: 'focus',
      title: 'What is your main area of impact?',
      helper:
        'Select the focus that defines your organization best. You can choose multiple options.',
      kind: 'choice',
      columns: 3,
      allowMultiple: true,
      options: [
        'EDUCATION',
        'SOCIAL',
        'ENVIRONMENT',
        'SOCIETAL',
        'WOMEN EMPOWERMENT',
        'HEALTH',
        'CRAFT',
        'AGRICULTURE',
        'YOUTH',
      ],
    },
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
      id: 'needs',
      title: 'What kind of partnership are you looking for?',
      helper: 'Select the format that would create the most impact.',
      kind: 'choice',
      options: [
        'FUNDING',
        'VISIBILITY',
        'FIELD ACTIVATION',
        'EDUCATION PROGRAM',
        'DOCUMENTARY SUPPORT',
      ],
    },
    {
      id: 'scale',
      title: 'What scale are you operating at?',
      helper: 'This helps us understand timeline and scope.',
      kind: 'choice',
      options: ['LOCAL PILOT', 'REGIONAL', 'NATIONAL', 'MULTI-REGION', 'LONG-TERM PROGRAM'],
    },
    {
      id: 'meeting-date',
      title: 'Select a meeting date',
      helper: 'Pick the date that works best for your first call.',
      kind: 'date',
    },
  ],
  MEDIAS: [
    {
      id: 'media-type',
      title: 'What kind of media are you?',
      helper: 'Select the format that best describes your platform.',
      kind: 'choice',
      columns: 3,
      options: [
        'PRINT',
        'DIGITAL',
        'TV',
        'PODCAST',
        'NEWSLETTER',
        'SOCIAL',
        'EDITORIAL',
        'LUXURY',
        'OTHERS',
      ],
    },
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
    {
      id: 'coverage',
      title: 'What topics are you most interested in?',
      helper: 'Select the editorial angles you are looking for. You can choose multiple options.',
      kind: 'choice',
      allowMultiple: true,
      options: ['FASHION', 'TRAVEL', 'BEAUTY', 'SUSTAINABILITY', 'CULTURE', 'HOSPITALITY'],
    },
    {
      id: 'format',
      title: 'What collaboration format do you prefer?',
      helper: 'We will prepare the conversation around this.',
      kind: 'choice',
      options: ['FEATURES', 'INTERVIEWS', 'SPONSORED CONTENT', 'LIVE COVERAGE', 'PARTNERSHIPS'],
    },
    {
      id: 'meeting-date',
      title: 'Select a meeting date',
      helper: 'Pick the date that works best for your first call.',
      kind: 'date',
    },
  ],
};

const stageEase = [0.22, 1, 0.36, 1] as const;
const heroButtonClass =
  'group relative inline-flex items-center justify-center overflow-hidden rounded-none border border-white/25 bg-white/10 text-white transition-colors duration-300 [transition-timing-function:var(--bee-ease)] hover:border-white/60 hover:bg-white/15 focus-visible:ring-[#f6c452]/35';
const audiencePanelMask = 'linear-gradient(to right, transparent 0px, black 132px, black 100%)';
const stepperPanelMask = 'linear-gradient(to right, transparent 0px, black 132px, black 100%)';

export function ContactLanding() {
  const [stage, setStage] = useState<ContactStage>('entry');
  const [selectedAudience, setSelectedAudience] = useState<AudienceKey | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, StepAnswer>>({});

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

    setStage('audience');
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

  return (
    <main className="relative h-[100svh] overflow-hidden bg-[#d8ccb8] text-white">
      <video
        className="absolute inset-0 h-full w-full object-cover object-center"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/assets/contact/contact-hero-v2.mp4" type="video/mp4" />
        <source src="/assets/contact/contact-hero.mov" type="video/quicktime" />
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

              <button
                type="button"
                onClick={() => setStage('audience')}
                className={`${heroButtonClass} mt-6 min-w-[220px] px-7 py-3 text-center text-[0.62rem] uppercase tracking-[0.35em] [font-family:var(--font-adam)] [text-shadow:0_0_14px_rgba(255,255,255,0.32),0_0_28px_rgba(255,255,255,0.12)] sm:mt-7 sm:min-w-[260px] sm:text-[0.7rem]`}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-0 -translate-x-full bg-gradient-to-r from-transparent via-[#f6c452bf] to-transparent opacity-0 transition-transform duration-500 group-hover:translate-x-full group-hover:opacity-100"
                />
                <span className="relative z-10">BEGIN THE JOURNEY</span>
              </button>
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
                    <div className="w-full max-w-[38rem] space-y-6 sm:space-y-7">
                      {CONTACT_AUDIENCE_ROWS.map((row, index) => (
                        <motion.div
                          key={row.left}
                          initial={{ opacity: 0, y: 24 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.82,
                            delay: 0.12 + index * 0.08,
                            ease: stageEase,
                          }}
                          className="relative flex items-center justify-center"
                        >
                          <div className="absolute left-0 top-1/2 flex -translate-y-1/2 justify-center">
                            <div className="relative h-12 w-12 sm:h-14 sm:w-14">
                              <Image
                                src={
                                  selectedAudience === row.left || selectedAudience === row.right
                                    ? row.icon.replace('Ico White', 'Ico Gold')
                                    : row.icon
                                }
                                alt=""
                                fill
                                className="object-contain opacity-95"
                              />
                            </div>
                          </div>

                          <div className="grid w-full max-w-[24rem] grid-cols-2 gap-x-10 gap-y-4 sm:max-w-[26rem]">
                            {[row.left, row.right].map((label) => (
                              <button
                                key={label}
                                type="button"
                                onClick={() => setSelectedAudience(label as AudienceKey)}
                                className={`group inline-flex w-fit justify-self-center border-b pb-1 text-center text-[0.98rem] uppercase tracking-[0.28em] transition duration-300 [font-family:var(--font-adam)] [text-shadow:0_0_12px_rgba(255,255,255,0.28),0_0_24px_rgba(255,255,255,0.1)] sm:text-[1.08rem] ${
                                  selectedAudience === label
                                    ? 'border-[#f4bb52] text-[#f4bb52] [text-shadow:0_0_16px_rgba(244,187,82,0.5),0_0_30px_rgba(244,187,82,0.18)]'
                                    : 'text-white/88 border-transparent hover:border-[#f4bb52]/80 hover:text-[#f4bb52] hover:[text-shadow:0_0_16px_rgba(244,187,82,0.4),0_0_30px_rgba(244,187,82,0.14)]'
                                }`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      ))}
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
                        <button
                          type="button"
                          onClick={confirmAudience}
                          className={`${heroButtonClass} min-w-[180px] px-6 py-3 text-center text-[0.62rem] uppercase tracking-[0.34em] [font-family:var(--font-adam)] [text-shadow:0_0_14px_rgba(255,255,255,0.32),0_0_28px_rgba(255,255,255,0.12)] sm:min-w-[220px] sm:text-[0.7rem]`}
                        >
                          <span
                            aria-hidden
                            className="pointer-events-none absolute inset-0 z-0 -translate-x-full bg-gradient-to-r from-transparent via-[#f6c452bf] to-transparent opacity-0 transition-transform duration-500 group-hover:translate-x-full group-hover:opacity-100"
                          />
                          <span className="relative z-10">CONFIRM</span>
                        </button>
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
                            <p className="text-white/72 mx-auto mt-3 max-w-[34rem] text-sm uppercase tracking-[0.22em] [font-family:var(--font-adam)] [text-shadow:0_0_10px_rgba(255,255,255,0.18)]">
                              {currentStep.helper}
                            </p>
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
                                    (answers[currentStep.id] as string[]).includes(option)
                                  : answers[currentStep.id] === option;

                                return (
                                  <button
                                    key={option}
                                    type="button"
                                    onClick={() => setChoiceAnswer(currentStep, option)}
                                    className={`min-h-[4.25rem] rounded-none border px-4 py-4 text-center text-[0.74rem] uppercase tracking-[0.24em] transition duration-300 [font-family:var(--font-adam)] sm:text-[0.82rem] ${
                                      isSelected
                                        ? 'border-[#f4bb52] bg-[rgba(244,187,82,0.12)] text-white [box-shadow:0_0_28px_rgba(244,187,82,0.14)]'
                                        : 'text-white/92 border-transparent bg-[rgba(244,187,82,0.09)] hover:border-[rgba(255,244,227,0.14)] hover:bg-[rgba(244,187,82,0.13)]'
                                    }`}
                                  >
                                    {option}
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
                                    className="placeholder:text-white/42 h-14 rounded-[1.1rem] border border-[rgba(255,244,227,0.12)] bg-[rgba(18,12,9,0.16)] px-4 text-sm text-white outline-none transition duration-300 focus:border-[#f4bb52] focus:bg-[rgba(18,12,9,0.22)]"
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
                                  className="h-16 rounded-[1.2rem] border border-[rgba(255,244,227,0.12)] bg-[rgba(18,12,9,0.16)] px-5 text-center text-base text-white outline-none transition duration-300 focus:border-[#f4bb52] focus:bg-[rgba(18,12,9,0.22)]"
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
                                  className="h-16 rounded-[1.2rem] border border-[rgba(255,244,227,0.12)] bg-[rgba(18,12,9,0.16)] px-5 text-center text-base text-white outline-none transition duration-300 focus:border-[#f4bb52] focus:bg-[rgba(18,12,9,0.22)]"
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
                                  className="placeholder:text-white/42 h-16 rounded-[1.2rem] border border-[rgba(255,244,227,0.12)] bg-[rgba(18,12,9,0.16)] px-5 text-center text-base text-white outline-none transition duration-300 focus:border-[#f4bb52] focus:bg-[rgba(18,12,9,0.22)]"
                                />
                              </label>
                            </div>
                          ) : null}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="mx-auto flex w-full max-w-[44rem] items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={goToPreviousStep}
                      className={`${heroButtonClass} min-w-[132px] px-5 py-3 text-[0.66rem] uppercase tracking-[0.3em] [font-family:var(--font-adam)]`}
                    >
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 z-0 -translate-x-full bg-gradient-to-r from-transparent via-[#f6c452bf] to-transparent opacity-0 transition-transform duration-500 group-hover:translate-x-full group-hover:opacity-100"
                      />
                      <span className="relative z-10">Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={goToNextStep}
                      disabled={
                        currentStepIndex === currentSteps.length - 1 || !isCurrentStepComplete
                      }
                      className={`${heroButtonClass} min-w-[152px] px-5 py-3 text-[0.66rem] uppercase tracking-[0.3em] [font-family:var(--font-adam)] disabled:cursor-not-allowed disabled:opacity-45`}
                    >
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 z-0 -translate-x-full bg-gradient-to-r from-transparent via-[#f6c452bf] to-transparent opacity-0 transition-transform duration-500 group-hover:translate-x-full group-hover:opacity-100"
                      />
                      <span className="relative z-10">
                        {currentStepIndex === currentSteps.length - 1
                          ? 'Meeting Ready'
                          : 'Continue'}
                      </span>
                    </button>
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
