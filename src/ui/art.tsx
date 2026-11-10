import { useId } from 'react';

/** Логотип: Місяць з орбітою. */
export function Logo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <circle cx="32" cy="32" r="19" fill="#cbd5e1" />
      <circle cx="25" cy="26" r="5" fill="#94a3b8" />
      <circle cx="39" cy="38" r="6.500" fill="#94a3b8" />
      <circle cx="40" cy="22" r="3" fill="#94a3b8" />
      <ellipse cx="32" cy="32" rx="28" ry="9" fill="none" stroke="#fb923c" strokeWidth="3" transform="rotate(-24 32 32)" />
      <circle cx="56.500" cy="20.500" r="4" fill="#fb923c" />
    </svg>
  );
}

/** Земля в небі. shade: 0 — повна, 1 — майже вся в тіні. */
export function Earth({ className, shade = 0.35 }: { className?: string; shade?: number }) {
  const id = useId();
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <defs>
        <radialGradient id={`${id}o`} cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#7dd3fc" />
          <stop offset=".6" stopColor="#2563eb" />
          <stop offset="1" stopColor="#1e3a8a" />
        </radialGradient>
        <radialGradient id={`${id}h`}>
          <stop offset=".72" stopColor="#38bdf8" stopOpacity=".5" />
          <stop offset="1" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${id}c`}>
          <circle cx="50" cy="50" r="36" />
        </clipPath>
      </defs>
      <circle cx="50" cy="50" r="50" fill={`url(#${id}h)`} />
      <g clipPath={`url(#${id}c)`}>
        <rect width="100" height="100" fill={`url(#${id}o)`} />
        <path d="M22 34c8-8 20-6 24 2 3 6-3 10-1 16 2 7-6 12-14 8-9-5-15-17-9-26Z" fill="#22c55e" />
        <path d="M58 52c7-4 16 0 18 8 2 9-6 16-14 14-8-2-11-17-4-22Z" fill="#16a34a" />
        <path d="M60 22c5-3 12-1 14 3 1 4-4 7-9 6-5-1-8-6-5-9Z" fill="#4ade80" />
        <path d="M14 56c10-5 28-3 36 3M40 24c12-6 30-4 40 4M30 76c12-4 26-3 34 2" stroke="#fff" strokeOpacity=".75" strokeWidth="4" strokeLinecap="round" fill="none" />
        <circle cx={50 + 72 * (1 - shade)} cy="50" r="40" fill="#020617" opacity=".8" style={{ transition: 'cx 1.5s ease-in-out' }} />
      </g>
    </svg>
  );
}

const EYES = { ok: '#34d399', info: '#38bdf8', warn: '#fbbf24', danger: '#fb7185' } as const;

/** Робот-помічник центру керування. Колір очей показує настрій. */
export function RobotAvatar({ className, tone }: { className?: string; tone: keyof typeof EYES }) {
  const eye = EYES[tone];
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path d="M24 14V8" stroke="#94a3b8" strokeWidth="2" />
      <circle cx="24" cy="6.500" r="2.600" fill={eye} />
      <rect x="3.500" y="22" width="5" height="11" rx="2.500" fill="#94a3b8" />
      <rect x="39.500" y="22" width="5" height="11" rx="2.500" fill="#94a3b8" />
      <rect x="7" y="13" width="34" height="29" rx="10" fill="#e2e8f0" />
      <rect x="7" y="13" width="34" height="14" rx="10" fill="#fff" opacity=".5" />
      <rect x="11.500" y="19" width="25" height="13" rx="6.500" fill="#0f172a" />
      <circle cx="19" cy="25.500" r="3" fill={eye} />
      <circle cx="29" cy="25.500" r="3" fill={eye} />
      <path d="M19.500 37h9" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
