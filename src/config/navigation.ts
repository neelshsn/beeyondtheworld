export type MainNavItem = {
  label: string;
  labelKey?: string;
  href: string;
  index: `${number}${number}`;
};

export const mainNav = [
  { label: 'Home', labelKey: 'navigation.home', href: '/', index: '01' },
  { label: 'Concept', labelKey: 'navigation.concept', href: '/concept', index: '02' },
  { label: 'Campaigns', labelKey: 'navigation.campaigns', href: '/campaigns', index: '03' },
  { label: 'Journeys', labelKey: 'navigation.journeys', href: '/journeys', index: '04' },
  { label: 'Contact', labelKey: 'navigation.contact', href: '/contact', index: '05' },
] as const satisfies readonly MainNavItem[];
