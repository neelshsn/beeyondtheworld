import Image from 'next/image';
import Link from 'next/link';

const ICON_GOLD = '/assets/icones/Ico Gold BEE-13.svg';

const LEGAL_TEXT = `BEEYONDTHEWORLD LIMITED · COMPANY NO. 14163182 · VAT GB450245815 · REGISTERED IN ENGLAND AND WALES.`;

export function HomeFooter() {
  return (
    /* T-008 : bloc final compact — plus de panel pleine hauteur, paddings resserrés */
    <footer
      data-footer
      className="relative flex flex-col items-center gap-6 bg-[#efe3d1] px-8 py-10 sm:px-12 lg:px-20"
    >
      {/* Centered icon */}
      <Image
        src={ICON_GOLD}
        alt="Beeyondtheworld"
        width={120}
        height={120}
        className="h-14 w-14 lg:h-16 lg:w-16"
      />

      {/* Legal text */}
      <p className="max-w-4xl text-center font-display text-[7px] uppercase leading-[2] tracking-[0.12em] text-[#1b130e]/40 sm:text-[8px]">
        {LEGAL_TEXT}
      </p>
      <nav
        aria-label="Legal information"
        className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 font-display text-[8px] uppercase tracking-[0.18em] text-[#1b130e]/55"
      >
        <Link href="/legal" className="transition hover:text-[#1b130e]">
          Legal notice
        </Link>
        <Link href="/privacy" className="transition hover:text-[#1b130e]">
          Privacy
        </Link>
        <Link href="/cookies" className="transition hover:text-[#1b130e]">
          Cookies
        </Link>
      </nav>
    </footer>
  );
}
