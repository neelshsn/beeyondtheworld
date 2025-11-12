import type { LucideIcon } from 'lucide-react';
import { Instagram, Linkedin } from 'lucide-react';

export type SocialLink = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const socialLinks = [
  {
    label: 'Instagram',
    href: 'https://instagram.com/beeyondtheworld.co',
    icon: Instagram,
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/beeyondtheworld',
    icon: Linkedin,
  },
] as const satisfies readonly SocialLink[];
