import Image from 'next/image';

const ICON_GOLD = '/assets/icones/Ico Gold BEE-13.svg';

const LEGAL_TEXT = `Visual representations of the property, layout plans, and other materials are for illustration purposes only. All information on this website is provided for general informational use and does not constitute an offer or any form of binding commitment. All materials on this website, including design elements, are the intellectual property of the Organization. Any copying, reproduction, distribution (including reposting to other websites or online resources), or other use of these materials is prohibited without the prior written consent of the rights holder.`;

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
    </footer>
  );
}
