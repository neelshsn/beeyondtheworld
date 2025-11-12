import localFont from 'next/font/local';

export const love = localFont({
  src: [{ path: '../../../fonts/Love.otf', weight: '400', style: 'normal' }],
  variable: '--font-love',
  display: 'swap',
});

export const adam = localFont({
  src: [
    { path: '../../../fonts/Adam-Light.ttf', weight: '300', style: 'normal' },
    { path: '../../../fonts/Adam-Medium.ttf', weight: '500', style: 'normal' },
    { path: '../../../fonts/Adam-Bold.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-adam',
  display: 'swap',
});

export const avenir = localFont({
  src: [
    { path: '../../../fonts/AvenirLTStd-Light.otf', weight: '300', style: 'normal' },
    { path: '../../../fonts/AvenirLTStd-Book.otf', weight: '400', style: 'normal' },
    { path: '../../../fonts/AvenirLTStd-BookOblique.otf', weight: '400', style: 'italic' },
    { path: '../../../fonts/AvenirLTStd-MediumOblique.otf', weight: '500', style: 'italic' },
    { path: '../../../fonts/AvenirLTStd-Heavy.otf', weight: '700', style: 'normal' },
    { path: '../../../fonts/AvenirLTStd-HeavyOblique.otf', weight: '700', style: 'italic' },
    { path: '../../../fonts/AvenirLTStd-Black.otf', weight: '900', style: 'normal' },
  ],
  variable: '--font-avenir',
  display: 'swap',
});

export const saintBartogenia = localFont({
  src: [
    {
      path: '../../../fonts/SaintBartogenia_PERSONAL_USE_ONLY.otf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-saint',
  display: 'swap',
});
