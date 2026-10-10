const paths: Record<string, string> = {
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  back: 'm14 6-6 6 6 6',
  left: 'm14 6-6 6 6 6',
  right: 'm10 6 6 6-6 6',
  folder: 'M3 6V4h7l2 3h9v14H3Z',
  check: 'm5 12 4 4L19 6',
  plus: 'M12 4v16M4 12h16',
  circle: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18',
  user: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 21v-2a8 8 0 0 1 16 0v2',
  users:
    'M15 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0M5 21v-2a7 7 0 0 1 14 0v2M3 7a3 3 0 0 0 0 6m18-6a3 3 0 0 1 0 6',
  pin: 'M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0M14 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0',
  sun: 'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2',
  moon: 'M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10',
  camera: 'M3 7h4l2-3h6l2 3h4v14H3ZM16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  film: 'M3 5h13v14H3ZM16 10l5-3v10l-5-3',
  image: 'M3 3h18v18H3ZM3 17l6-6 4 4 3-3 5 5M16 7h.01',
  feather: 'M20 3c-8-2-14 4-12 12 8 2 14-4 12-12ZM4 21 17 7M8 15h5M12 11V6',
  leaf: 'M20 3c-11-1-17 5-15 12 5 6 17 2 15-12ZM3 21 16 8',
  flower: 'M12 12C0 9 7 0 12 9c6-11 13-1 2 3 12 6 2 13-2 2-6 11-13 2-2-2Z',
  hanger: 'M10 6a2 2 0 1 1 3 2v3l8 7v2H3v-2l10-7',
  bag: 'M4 7h16l1 14H3ZM8 7V5a4 4 0 0 1 8 0v2',
  layers: 'm12 3 10 5-10 5L2 8Zm-10 10 10 5 10-5M2 18l10 5 10-5',
  spark: 'm12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z',
  calendar: 'M4 5h16v16H4ZM8 2v6m8-6v6M4 11h16',
  clock: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M12 6v6l4 2',
  globe: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18',
  message: 'M3 3h18v14H8l-5 4ZM7 8h10M7 12h7',
  book: 'M12 5v16M3 3l9 2 9-2v16l-9 2-9-2Z',
  wallet: 'M3 5h17v15H3ZM16 11h6v5h-6ZM3 5V3h13',
  ruler: 'm3 16 13-13 5 5L8 21Zm9-9 2 2m-6 2 2 2m-6 2 2 2',
  flag: 'M4 22V3c6-5 11 5 16 0v12c-6 5-11-5-16 0',
  shield: 'm12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6Zm-4 10 3 3 5-6',
  lock: 'M5 10h14v12H5ZM8 10V6a4 4 0 0 1 8 0v4',
  file: 'M5 2h9l5 5v15H5Zm9 0v6h5M8 13h8m-8 4h6',
  mail: 'M3 5h18v14H3Zm0 0 9 8 9-8',
  link: 'm9 15 6-6m-5-4 2-2c7-5 14 2 9 9l-2 2M5 10l-2 2c-5 7 2 14 9 9l2-2',
  home: 'm2 10 10-8 10 8M5 8v14h14V8M10 22v-8h4v8',
  compass: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0m-6-3-2 5-5 2 2-5Z',
  plane: 'm2 12 8-2 1-8h2l1 8 8 2v2l-8-1-1 7 3 2H8l3-2-1-7-8 1Z',
  car: 'M3 10 5 4h14l2 6v10h-3v-3H6v3H3ZM3 10h18M6 14h2m8 0h2',
  upload: 'M12 16V2M6 8l6-6 6 6M3 16v6h18v-6',
  download: 'M12 2v14m-6-6 6 6 6-6M3 16v6h18v-6',
  palette: 'M21 11c0 7-6 2-7 5-1 2 2 4-2 5A9 9 0 1 1 21 11ZM8 7h.1m5-2h.1m4 4h.1M6 12h.1',
  bell: 'M5 16h14l-2-4V7a5 5 0 0 0-10 0v5Zm4 4h6',
};
export function Icon({ name, className = '' }: { name: string; className?: string }) {
  return (
    <svg
      className={`icon ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.spark} />
    </svg>
  );
}
