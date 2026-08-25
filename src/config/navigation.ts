export type MainNavItem = {
  label: string;
  labelKey?: string;
  href: string;
  index: `${number}${number}`;
  iconSrc: string;
};

export const mainNav = [
  {
    label: 'Concept',
    labelKey: 'navigation.concept',
    href: '/concept',
    index: '02',
    iconSrc: '/assets/icones/Ico Gold BEE-05.svg',
  },
  {
    label: 'Journeys',
    labelKey: 'navigation.journeys',
    href: '/journeys',
    index: '14',
    iconSrc: '/assets/icones/Ico Gold BEE-14.svg',
  },
  {
    label: 'Campaigns',
    labelKey: 'navigation.campaigns',
    href: '/campaigns',
    index: '06',
    iconSrc: '/assets/icones/Ico Gold BEE-06.svg',
  },
  {
    label: 'Community',
    labelKey: 'navigation.community',
    href: '/contact',
    index: '13',
    iconSrc: '/assets/icones/Ico Gold BEE-13.svg',
  },
] as const satisfies readonly MainNavItem[];
