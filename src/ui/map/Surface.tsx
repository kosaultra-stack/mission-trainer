/** Кратери й каміння на поверхні. Розкладені вручну — без випадковості. */
const CRATERS = [
  { x: 150, y: 70, r: 34 }, { x: 655, y: 95, r: 22 }, { x: 430, y: 150, r: 44 }, { x: 95, y: 300, r: 18 },
  { x: 720, y: 310, r: 38 }, { x: 260, y: 450, r: 28 }, { x: 560, y: 520, r: 48 }, { x: 60, y: 540, r: 24 },
  { x: 350, y: 300, r: 14 }, { x: 610, y: 260, r: 12 }, { x: 200, y: 210, r: 10 }, { x: 760, y: 520, r: 14 },
  { x: 470, y: 420, r: 9 }, { x: 40, y: 150, r: 9 }, { x: 540, y: 60, r: 8 }, { x: 330, y: 560, r: 11 },
];

const ROCKS = [
  { x: 310, y: 95 }, { x: 700, y: 190 }, { x: 150, y: 380 }, { x: 430, y: 520 }, { x: 640, y: 420 }, { x: 250, y: 250 }, { x: 30, y: 430 },
];

/** Місячний ґрунт під сіткою 8×6 (viewBox 800×600: одна ділянка — 100×100). */
export function Surface() {
  return (
    <svg viewBox="0 0 800 600" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="regolith" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7b8494" />
          <stop offset="1" stopColor="#59616f" />
        </linearGradient>
        <radialGradient id="crater" cx=".4" cy=".36" r=".62">
          <stop offset="0" stopColor="#1e293b" stopOpacity=".7" />
          <stop offset=".7" stopColor="#334155" stopOpacity=".5" />
          <stop offset=".86" stopColor="#e2e8f0" stopOpacity=".4" />
          <stop offset="1" stopColor="#e2e8f0" stopOpacity="0" />
        </radialGradient>
        <filter id="grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope=".5" />
          </feComponentTransfer>
        </filter>
        <filter id="blotch" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency=".012" numOctaves="3" seed="11" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope=".9" />
          </feComponentTransfer>
        </filter>
      </defs>

      <rect width="800" height="600" fill="url(#regolith)" />
      <rect width="800" height="600" filter="url(#blotch)" opacity=".35" style={{ mixBlendMode: 'soft-light' }} />
      <rect width="800" height="600" filter="url(#grain)" opacity=".4" style={{ mixBlendMode: 'overlay' }} />

      {CRATERS.map((c) => (
        <ellipse key={`${c.x}-${c.y}`} cx={c.x} cy={c.y} rx={c.r} ry={c.r * 0.82} fill="url(#crater)" />
      ))}
      {ROCKS.map((r) => (
        <g key={`${r.x}-${r.y}`} transform={`translate(${r.x} ${r.y})`}>
          <ellipse cx="3" cy="5" rx="9" ry="3" fill="#0f172a" opacity=".3" />
          <path d="M-6 4-3-4 4-6 8 0 6 5Z" fill="#94a3b8" />
          <path d="M-6 4-3-4 4-6 1 1Z" fill="#cbd5e1" />
        </g>
      ))}

      <path
        d="M100 0V600M200 0V600M300 0V600M400 0V600M500 0V600M600 0V600M700 0V600M0 100H800M0 200H800M0 300H800M0 400H800M0 500H800"
        stroke="#fff"
        strokeOpacity=".07"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
