import type { ReactNode, SVGProps } from 'react';

const line = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

const ICONS = {
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" fill="currentColor" />,
  heart: (
    <>
      <path d="M12 20.500 4.200 12.700a5 5 0 0 1 7.100-7.100l.7.7.7-.7a5 5 0 0 1 7.100 7.100L12 20.500Z" fill="currentColor" />
      <path d="M6.500 12.500h3l1.500-2.500 2 5 1.500-2.500h3" {...line} stroke="#0f172a" strokeWidth={1.4} />
    </>
  ),
  leaf: (
    <>
      <path d="M5 19C5 10 11 5 20 4c-1 9-6 15-15 15Z" fill="currentColor" />
      <path d="M5 19 13 11" {...line} stroke="#0f172a" strokeWidth={1.4} />
    </>
  ),
  radiation: (
    <g fill="currentColor">
      <circle cx="12" cy="12" r="1.700" />
      <path d="M10.400 9.230 7.250 3.770A9.500 9.500 0 0 1 16.750 3.770L13.600 9.230A3.200 3.200 0 0 0 10.400 9.230Z" />
      <path d="M15.200 12H21.500A9.500 9.500 0 0 1 16.750 20.230L13.600 14.770A3.200 3.200 0 0 0 15.200 12Z" />
      <path d="M10.400 14.770 7.250 20.230A9.500 9.500 0 0 1 2.500 12H8.800A3.200 3.200 0 0 0 10.400 14.770Z" />
    </g>
  ),
  nut: (
    <>
      <path d="M12 2.500 20.200 7.250v9.500L12 21.500 3.800 16.750v-9.500Z" {...line} />
      <circle cx="12" cy="12" r="3.300" {...line} />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4.200" fill="currentColor" />
      <path d="M12 2.500v2.500M12 19v2.500M2.500 12H5M19 12h2.500M5.300 5.300l1.800 1.800M16.900 16.900l1.800 1.800M5.300 18.700l1.800-1.800M16.900 7.100l1.800-1.800" {...line} />
    </>
  ),
  moon: <path d="M20 14.500A8.500 8.500 0 1 1 9.500 4a7 7 0 0 0 10.500 10.500Z" fill="currentColor" />,
  play: <path d="M7 4.500v15l12-7.500Z" fill="currentColor" />,
  help: (
    <>
      <circle cx="12" cy="12" r="9.500" {...line} />
      <path d="M9.300 9.300a2.800 2.800 0 1 1 4.200 2.400c-.9.5-1.500 1.100-1.500 2.300M12 17.300v.2" {...line} />
    </>
  ),
  close: <path d="M6 6l12 12M18 6 6 18" {...line} />,
  power: <path d="M12 3v9M6.300 6.800a8 8 0 1 0 11.400 0" {...line} />,
  alert: (
    <>
      <path d="M12 3.500 22 20H2Z" {...line} />
      <path d="M12 10v4.500M12 17.200v.2" {...line} />
    </>
  ),
  flag: (
    <>
      <path d="M5 21.500V3.500" {...line} />
      <path d="M5 4.500h13l-3 4.500 3 4.500H5Z" fill="currentColor" />
    </>
  ),
  home: <path d="M4 11.500 12 4l8 7.500V20h-5.500v-5.500h-5V20H4Z" {...line} />,
  restart: <path d="M4.500 12a7.500 7.500 0 1 1 2.200 5.300M4.500 19.500v-5h5" {...line} />,
  crate: (
    <>
      <path d="M3.500 8 12 3.500 20.500 8v8L12 20.500 3.500 16Z" {...line} />
      <path d="M3.500 8 12 12.500 20.500 8M12 12.500v8" {...line} />
    </>
  ),
  cursor: <path d="M5 3.500 19 11l-6 1.800L11 19Z" {...line} />,
  book: (
    <>
      <path d="M12 6.500C10 5 7 4.500 3.500 5v13c3.500-.5 6.500 0 8.500 1.500 2-1.500 5-2 8.500-1.500V5C17 4.500 14 5 12 6.500Z" {...line} />
      <path d="M12 6.500v13" {...line} />
    </>
  ),
  star: <path d="m12 3 2.700 5.600 6.100.8-4.500 4.200 1.100 6.100L12 16.800l-5.400 2.900 1.100-6.100-4.500-4.200 6.100-.8Z" fill="currentColor" />,
  rewind: (
    <>
      <path d="M11 6.500 4.500 12l6.500 5.500Z" fill="currentColor" />
      <path d="M19.500 6.500 13 12l6.500 5.500Z" fill="currentColor" />
    </>
  ),
  link: <path d="M14 4.500h5.500V10M19.500 4.500 11 13M17 14v5.500H4.500V7H10" {...line} />,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof ICONS;

export function Icon({ name, className = 'h-5 w-5', ...rest }: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...rest}>
      {ICONS[name]}
    </svg>
  );
}
