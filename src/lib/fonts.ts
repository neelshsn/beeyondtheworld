import localFont from 'next/font/local';

export const adam = localFont({
  src: [
    { path: '../../public/fonts/Adam-Light.ttf', weight: '300', style: 'normal' },
    { path: '../../public/fonts/Adam-Medium.ttf', weight: '500', style: 'normal' },
    { path: '../../public/fonts/Adam-Bold.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-adam',
  display: 'swap',
});

export const avenir = localFont({
  src: [
    { path: '../../public/fonts/AvenirLTStd-Light.otf', weight: '300', style: 'normal' },
    { path: '../../public/fonts/AvenirLTStd-Book.otf', weight: '400', style: 'normal' },
    { path: '../../public/fonts/AvenirLTStd-MediumOblique.otf', weight: '500', style: 'italic' },
    { path: '../../public/fonts/AvenirLTStd-Heavy.otf', weight: '700', style: 'normal' },
    { path: '../../public/fonts/AvenirLTStd-HeavyOblique.otf', weight: '700', style: 'italic' },
    { path: '../../public/fonts/AvenirLTStd-Black.otf', weight: '900', style: 'normal' },
  ],
  variable: '--font-avenir',
  display: 'swap',
});

export const saintBartogenia = localFont({
  src: [{ path: '../../public/fonts/SaintBartogenia_PERSONAL_USE_ONLY.otf', weight: '400' }],
  variable: '--font-saint',
  display: 'swap',
});
