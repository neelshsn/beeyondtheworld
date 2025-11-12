'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  CalendarDays,
  Check,
  HeartHandshake,
  Mail,
  Sparkles,
  Users,
  Waves,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

const FOCUS_OPTIONS = [
  {
    id: 'film',
    label: 'Film',
    description: 'Hero film, underwater loops et capsules socials',
    icon: Sparkles,
  },
  {
    id: 'editorial',
    label: 'Editorial',
    description: 'Series photo pour lookbook, retail et PR',
    icon: Mail,
  },
  {
    id: 'underwater',
    label: 'Underwater',
    description: 'Immersions subaquatiques et macro coral studio',
    icon: Waves,
  },
  {
    id: 'community',
    label: 'Community',
    description: 'Ateliers avec artisans et collecte de storytelling',
    icon: HeartHandshake,
  },
] as const;

type FocusOption = (typeof FOCUS_OPTIONS)[number];

type FormState = {
  marque: string;
  contact: string;
  email: string;
  phone: string;
  timeframe: string;
  crewSize: string;
  message: string;
  focus: string[];
};

const DEFAULT_STATE: FormState = {
  marque: '',
  contact: '',
  email: '',
  phone: '',
  timeframe: '',
  crewSize: '8',
  message: '',
  focus: ['film', 'underwater'],
};

export function PhilippinesBookingForm() {
  const shouldReduceMotion = useReducedMotion();
  const [state, setState] = useState<FormState>(DEFAULT_STATE);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const selectedFocus = useMemo(
    () => FOCUS_OPTIONS.filter((option) => state.focus.includes(option.id)),
    [state.focus]
  );

  const completion = useMemo(() => {
    const fields = [state.marque, state.contact, state.email, state.timeframe];
    const filled = fields.filter((value) => value.trim().length > 0).length;
    return Math.round(((filled + (state.message ? 1 : 0)) / (fields.length + 1)) * 100);
  }, [state]);

  const handleToggleFocus = (option: FocusOption) => {
    setState((previous) => {
      const isSelected = previous.focus.includes(option.id);
      return {
        ...previous,
        focus: isSelected
          ? previous.focus.filter((value) => value !== option.id)
          : [...previous.focus, option.id],
      };
    });
  };

  const handleChange = (field: keyof FormState) => (value: string) => {
    setState((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3600);
  };

  return (
    <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-white/95 shadow-[0_48px_140px_rgba(6,22,33,0.18)] backdrop-blur">
      <div className="absolute inset-x-10 top-10 z-0 h-24 rounded-full bg-gradient-to-r from-[#0f3b52]/10 via-[#0f3b52]/35 to-transparent" />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 grid gap-10 p-8 sm:p-12 lg:grid-cols-[1.1fr_0.9fr]"
      >
        <div className="space-y-10">
          <header className="space-y-3 text-left">
            <p className="text-xs uppercase tracking-[0.42em] text-foreground/50">
              Booker ce voyage
            </p>
            <h3 className="font-display text-3xl uppercase leading-[1.05] text-foreground sm:text-4xl">
              Composez votre voyage Philippines
            </h3>
            <p className="max-w-xl text-sm leading-relaxed text-foreground/70">
              Indiquez-nous les besoins clefs pour activer le camp creatif itinerant. Notre
              productrice vous recontacte en moins de 24h avec la feuille de route personnalisee.
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-2">
            <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.32em] text-foreground/60">
              marque / Brand
              <div className="rounded-2xl border border-foreground/15 bg-white px-4 py-3 text-[13px] uppercase tracking-[0.32em] text-foreground">
                <input
                  value={state.marque}
                  onChange={(event) => handleChange('marque')(event.target.value)}
                  type="text"
                  placeholder="Nom de la marque"
                  className="w-full bg-transparent text-sm uppercase tracking-[0.2em] text-foreground focus:outline-none"
                  required
                />
              </div>
            </label>
            <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.32em] text-foreground/60">
              Nom & Prenom
              <div className="rounded-2xl border border-foreground/15 bg-white px-4 py-3 text-[13px] uppercase tracking-[0.32em] text-foreground">
                <input
                  value={state.contact}
                  onChange={(event) => handleChange('contact')(event.target.value)}
                  type="text"
                  placeholder="Contact principal"
                  className="w-full bg-transparent text-sm uppercase tracking-[0.2em] text-foreground focus:outline-none"
                  required
                />
              </div>
            </label>
            <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.32em] text-foreground/60">
              Email direct
              <div className="rounded-2xl border border-foreground/15 bg-white px-4 py-3 text-[13px] uppercase tracking-[0.32em] text-foreground">
                <input
                  value={state.email}
                  onChange={(event) => handleChange('email')(event.target.value)}
                  type="email"
                  placeholder="hello@marque.com"
                  className="w-full bg-transparent text-sm uppercase tracking-[0.2em] text-foreground focus:outline-none"
                  required
                />
              </div>
            </label>
            <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.32em] text-foreground/60">
              WhatsApp / Telephone
              <div className="rounded-2xl border border-foreground/15 bg-white px-4 py-3 text-[13px] uppercase tracking-[0.32em] text-foreground">
                <input
                  value={state.phone}
                  onChange={(event) => handleChange('phone')(event.target.value)}
                  type="tel"
                  placeholder="+33 6 00 00 00 00"
                  className="w-full bg-transparent text-sm uppercase tracking-[0.2em] text-foreground focus:outline-none"
                />
              </div>
            </label>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.32em] text-foreground/60">
              Fenetre de tournage souhaitee
              <div className="flex items-center gap-3 rounded-2xl border border-foreground/15 bg-white px-4 py-3 text-[13px] uppercase tracking-[0.32em] text-foreground">
                <CalendarDays className="size-4 text-foreground/60" aria-hidden />
                <input
                  value={state.timeframe}
                  onChange={(event) => handleChange('timeframe')(event.target.value)}
                  type="text"
                  placeholder="Octobre 2025"
                  className="w-full bg-transparent text-sm uppercase tracking-[0.2em] text-foreground focus:outline-none"
                  required
                />
              </div>
            </label>
            <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.32em] text-foreground/60">
              Taille de l&apos;equipe marque
              <div className="flex items-center gap-3 rounded-2xl border border-foreground/15 bg-white px-4 py-3 text-[13px] uppercase tracking-[0.32em] text-foreground">
                <Users className="size-4 text-foreground/60" aria-hidden />
                <select
                  value={state.crewSize}
                  onChange={(event) => handleChange('crewSize')(event.target.value)}
                  className="w-full bg-transparent text-sm uppercase tracking-[0.2em] text-foreground focus:outline-none"
                >
                  <option value="6">6 personnes</option>
                  <option value="8">8 personnes</option>
                  <option value="10">10 personnes</option>
                  <option value="12">12 personnes</option>
                </select>
              </div>
            </label>
          </div>

          <fieldset className="space-y-3">
            <legend className="text-xs uppercase tracking-[0.42em] text-foreground/55">
              Focus immersifs
            </legend>
            <div className="flex flex-wrap gap-3">
              {FOCUS_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isActive = state.focus.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleToggleFocus(option)}
                    className={`group relative flex min-w-[200px] flex-1 flex-col gap-2 rounded-3xl border px-5 py-4 text-left transition ${
                      isActive
                        ? 'border-foreground/50 bg-foreground/5 text-foreground'
                        : 'border-foreground/15 bg-white text-foreground/70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase tracking-[0.34em]">
                        {option.label}
                      </span>
                      {isActive ? (
                        <Check className="size-4" aria-hidden />
                      ) : (
                        <Icon className="size-4" aria-hidden />
                      )}
                    </div>
                    <p className="text-[12px] leading-relaxed text-foreground/65">
                      {option.description}
                    </p>
                    {isActive ? (
                      <motion.span
                        layoutId="philippines-focus"
                        transition={
                          shouldReduceMotion
                            ? undefined
                            : { duration: 0.45, ease: [0.33, 1, 0.68, 1] }
                        }
                        className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-[#0f3b52]/15 via-[#0f3b52]/5 to-transparent"
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.32em] text-foreground/60">
            Objectifs narratifs
            <div className="rounded-3xl border border-foreground/15 bg-white px-4 py-3 text-[13px] uppercase tracking-[0.32em] text-foreground">
              <textarea
                value={state.message}
                onChange={(event) => handleChange('message')(event.target.value)}
                placeholder="Racontez-nous le lancement, les produits, l'evenement..."
                className="h-32 w-full resize-none bg-transparent text-sm uppercase tracking-[0.16em] text-foreground focus:outline-none"
              />
            </div>
          </label>

          <div className="flex flex-wrap items-center gap-4">
            <Button
              type="submit"
              className="inline-flex items-center gap-3 rounded-full border border-foreground/15 bg-foreground px-7 py-3 text-[11px] uppercase tracking-[0.4em] text-white shadow-[0_18px_45px_rgba(4,20,30,0.25)] transition hover:bg-foreground/90"
            >
              Envoyer la demande
              <ArrowRight className="size-4" aria-hidden />
            </Button>
            <span className="text-[11px] uppercase tracking-[0.34em] text-foreground/50">
              Completion formulaire : {completion}%
            </span>
          </div>

          <AnimatePresence>
            {isSubmitted ? (
              <motion.p
                key="submitted"
                initial={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
                animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={
                  shouldReduceMotion ? undefined : { duration: 0.4, ease: [0.33, 1, 0.68, 1] }
                }
                className="text-xs uppercase tracking-[0.38em] text-foreground"
              >
                Merci ! Nous vous recontactons sous 24h pour verrouiller la feuille de route.
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>

        <aside className="flex flex-col justify-between gap-8 rounded-3xl border border-foreground/10 bg-gradient-to-br from-[#edf3f5] via-white to-white p-8 shadow-[0_28px_120px_rgba(8,32,48,0.12)]">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.42em] text-foreground/55">
              Resume dynamique
            </p>
            <h4 className="font-display text-2xl uppercase leading-tight text-foreground">
              Caler le camp marque aux Philippines
            </h4>
            <div className="space-y-4 text-sm leading-relaxed text-foreground/70">
              <p>
                Crew marque estime :{' '}
                <strong className="font-semibold text-foreground">{state.crewSize} guests</strong>.
                Fenetre visee :{' '}
                <strong className="font-semibold text-foreground">{state.timeframe || '-'}</strong>.
              </p>
              <p>
                Focus immersifs retenus :
                {selectedFocus.length > 0 ? (
                  <ul className="mt-2 space-y-2 text-[12px] uppercase tracking-[0.24em] text-foreground">
                    {selectedFocus.map((option) => (
                      <li key={option.id} className="flex items-center gap-3">
                        <span className="size-2 rounded-full bg-foreground/40" aria-hidden />
                        {option.label}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="ml-2 text-foreground/50">Aucun focus coche</span>
                )}
              </p>
              <p>
                Objectifs :{' '}
                {state.message
                  ? state.message
                  : 'Nous articulons vos enjeux marque, retail, RP et contenus digitaux.'}
              </p>
            </div>
          </div>

          <div className="space-y-3 rounded-3xl border border-foreground/10 bg-white px-6 py-5 text-[11px] uppercase tracking-[0.34em] text-foreground/65">
            <p className="flex items-center gap-2">
              <Sparkles className="size-4" aria-hidden />
              Inclus : Director + DOP + Impact concierge
            </p>
            <p className="flex items-center gap-2">
              <HeartHandshake className="size-4" aria-hidden />
              Pourcentage reverse aux gardiens de recifs
            </p>
            <p className="flex items-center gap-2">
              <Waves className="size-4" aria-hidden />
              Logistique 100% reef-safe et basse emission
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
