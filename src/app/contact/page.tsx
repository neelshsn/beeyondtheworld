'use client';

import { useMemo, useState } from 'react';

import { AssetPlaceholder, GlowTitle } from '@/components/primitives';
import SplitText from '@/components/SplitText';
import { Button } from '@/components/ui/button';

const heroPlaceholder = {
  label: 'Contact hero still',
  fileName: 'contact-hero.jpg',
  placement: 'public/assets/contact',
  recommendedDimensions: '2560x1440 | JPG',
  type: 'image' as const,
};

const steps = [
  {
    id: 'brand',
    title: 'Your brand',
    fields: [
      {
        id: 'brandName',
        label: 'Brand name',
        type: 'text',
        placeholder: 'Maison, label or agency',
      },
      { id: 'contactEmail', label: 'Contact email', type: 'email', placeholder: 'name@brand.com' },
      { id: 'website', label: 'Website', type: 'url', placeholder: 'https://' },
    ],
  },
  {
    id: 'journey',
    title: 'Project focus',
    fields: [
      {
        id: 'destination',
        label: 'Desired destination',
        type: 'text',
        placeholder: 'City or landscape',
      },
      { id: 'timeline', label: 'Timeline', type: 'text', placeholder: 'Example: April 2026' },
      {
        id: 'shootType',
        label: 'Shoot type',
        type: 'text',
        placeholder: 'Campaign, editorial, content, etc.',
      },
    ],
  },
  {
    id: 'details',
    title: 'Additional notes',
    fields: [
      {
        id: 'objectives',
        label: 'Objectives',
        type: 'textarea',
        placeholder: 'What story do you want to tell?',
      },
      { id: 'budget', label: 'Budget frame', type: 'text', placeholder: 'Optional' },
      { id: 'team', label: 'Team size', type: 'text', placeholder: 'Photographers, talents, crew' },
    ],
  },
];

export default function ContactPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const activeStep = steps[stepIndex];
  const progress = useMemo(() => ((stepIndex + 1) / steps.length) * 100, [stepIndex]);

  function updateField(id: string, value: string) {
    setFormValues((current) => ({ ...current, [id]: value }));
  }

  function handleNext() {
    if (stepIndex < steps.length - 1) {
      setStepIndex((current) => current + 1);
    }
  }

  function handlePrevious() {
    if (stepIndex > 0) {
      setStepIndex((current) => current - 1);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = new URLSearchParams(formValues).toString().replace(/&/g, '%0A');
    window.location.href = `mailto:hello@beeyondtheworld.com?subject=Start%20a%20project&body=${body}`;
  }

  return (
    <main className="flex flex-col gap-24 pb-32">
      <section className="relative flex min-h-[60vh] flex-col justify-end gap-10 px-6 pt-24 sm:px-10 lg:px-20">
        <AssetPlaceholder
          {...heroPlaceholder}
          className="absolute inset-0 h-full w-full rounded-none"
        />
        <div className="relative z-10 space-y-8 rounded-[48px] border border-white/40 bg-white/75 p-10 backdrop-blur">
          <GlowTitle
            eyebrow="Start a project"
            title={
              <SplitText
                text="Start your co-travel conversation"
                tag="h2"
                splitType="words"
                className="font-display text-4xl uppercase leading-[1.1] text-foreground sm:text-5xl md:text-6xl"
                textAlign="left"
              />
            }
            description="This form is for maisons exploring Beeyondtheworld. Share the essentials and we will suggest the right co-travel, budget frame, and companion brands within 48 hours."
            align="left"
            glowTone="umber"
          />
        </div>
      </section>

      <section className="px-6 sm:px-10 lg:px-20">
        <div className="rounded-[40px] border border-foreground/15 bg-white/65 px-6 py-10 shadow-[0_40px_120px_-60px_rgba(87,62,38,0.4)] sm:px-10">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-foreground/55">
            <span>{activeStep.title}</span>
            <span>
              Step {stepIndex + 1} / {steps.length}
            </span>
          </div>
          <div className="mt-4 h-1 rounded-full bg-foreground/10">
            <div
              className="h-full rounded-full bg-foreground/60"
              style={{ width: `${progress}%` }}
            />
          </div>

          <form className="mt-8 grid gap-6" onSubmit={handleSubmit}>
            {activeStep.fields.map((field) => (
              <label key={field.id} className="space-y-2">
                <span className="font-display text-xs uppercase tracking-[0.35em] text-foreground/55">
                  {field.label}
                </span>
                {field.type === 'textarea' ? (
                  <textarea
                    id={field.id}
                    value={formValues[field.id] ?? ''}
                    onChange={(event) => updateField(field.id, event.target.value)}
                    placeholder={field.placeholder}
                    rows={4}
                    className="w-full rounded-2xl border border-foreground/25 bg-white/70 px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 focus:border-foreground focus:outline-none"
                  />
                ) : (
                  <input
                    id={field.id}
                    type={field.type}
                    value={formValues[field.id] ?? ''}
                    onChange={(event) => updateField(field.id, event.target.value)}
                    placeholder={field.placeholder}
                    className="w-full rounded-2xl border border-foreground/25 bg-white/70 px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 focus:border-foreground focus:outline-none"
                  />
                )}
              </label>
            ))}

            <div className="flex flex-wrap justify-between gap-4 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={handlePrevious}
                disabled={stepIndex === 0}
                className="rounded-full border border-foreground/25 px-6 py-3 text-xs uppercase tracking-[0.35em]"
              >
                Previous
              </Button>
              {stepIndex < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="rounded-full px-6 py-3 text-xs uppercase tracking-[0.35em]"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="rounded-full px-6 py-3 text-xs uppercase tracking-[0.35em]"
                >
                  Send request
                </Button>
              )}
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
