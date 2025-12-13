import React, { type ComponentType } from 'react';

export type SocialLink = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

const InstagramGoldIcon: ComponentType<{ className?: string }> = ({ className }) =>
  React.createElement('img', {
    src: '/assets/icones/Ico Gold BEE-11.svg',
    alt: '',
    className,
    loading: 'lazy',
  });

const LinkedinGoldIcon: ComponentType<{ className?: string }> = ({ className }) =>
  React.createElement('img', {
    src: '/assets/icones/Ico Gold BEE-09.svg',
    alt: '',
    className,
    loading: 'lazy',
  });

export const socialLinks = [
  {
    label: 'Instagram',
    href: 'https://instagram.com/beeyondtheworld.co',
    icon: InstagramGoldIcon,
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/beeyondtheworld',
    icon: LinkedinGoldIcon,
  },
] as const satisfies readonly SocialLink[];
