import Link from 'next/link';

type LegalSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export function LegalPage({
  eyebrow,
  title,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <main className="min-h-screen bg-[#efe3d1] px-6 pb-20 pt-32 text-[#1b130e] sm:px-10 lg:px-20">
      <div className="mx-auto max-w-4xl">
        <p className="font-display text-[10px] uppercase tracking-[0.38em] text-[#9b6a2d]">
          {eyebrow}
        </p>
        <h1 className="mt-5 font-title text-[clamp(3rem,9vw,7rem)] uppercase leading-[0.82]">
          {title}
        </h1>
        <p className="mt-8 max-w-3xl text-base leading-8 text-[#1b130e]/75">{intro}</p>

        <div className="mt-14 space-y-12">
          {sections.map((section) => (
            <section key={section.title} className="border-t border-[#1b130e]/15 pt-7">
              <h2 className="font-display text-sm uppercase tracking-[0.24em]">{section.title}</h2>
              <div className="text-[#1b130e]/72 mt-5 space-y-4 text-sm leading-7">
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.bullets ? (
                  <ul className="list-disc space-y-2 pl-5">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap gap-6 border-t border-[#1b130e]/15 pt-7 font-display text-[9px] uppercase tracking-[0.2em]">
          <Link href="/" className="underline underline-offset-4">
            Home
          </Link>
          <Link href="/legal" className="underline underline-offset-4">
            Legal notice
          </Link>
          <Link href="/privacy" className="underline underline-offset-4">
            Privacy
          </Link>
          <Link href="/cookies" className="underline underline-offset-4">
            Cookies
          </Link>
        </div>
      </div>
    </main>
  );
}
