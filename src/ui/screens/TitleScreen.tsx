import { Earth } from '../art';
import { Icon } from '../icons';
import { MODULE_TYPES, spriteUrl } from '../look';
import { PRIMARY_BTN, SECONDARY_BTN } from '../overlays/Modal';

/** Обрій Місяця з базою. Коло радіуса R із центром далеко внизу; модулі стоять на дузі. */
const R = 2360;
const CX = 800;
const CY = 2500;
/** Відстань між модулями на обрії: широко на великому екрані, щільно на телефоні. */
const LAYOUTS = [
  { step: 150, size: 110, show: 'hidden sm:block' },
  { step: 100, size: 92, show: 'sm:hidden' },
];
const HORIZON_CRATERS = [
  { x: 180, y: 340, rx: 90, ry: 20 }, { x: 520, y: 250, rx: 60, ry: 12 }, { x: 1010, y: 290, rx: 110, ry: 24 },
  { x: 1380, y: 380, rx: 120, ry: 28 }, { x: 760, y: 400, rx: 150, ry: 34 }, { x: 330, y: 470, rx: 130, ry: 32 },
  { x: 1180, y: 480, rx: 100, ry: 26 }, { x: 640, y: 205, rx: 30, ry: 6 }, { x: 1250, y: 235, rx: 40, ry: 8 },
];

function MoonHorizon() {
  return (
    <svg
      viewBox="0 0 1600 500"
      preserveAspectRatio="xMidYMin slice"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[44vh] min-h-64 w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="moon-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#aab3c2" />
          <stop offset=".25" stopColor="#7b8494" />
          <stop offset="1" stopColor="#2a3140" />
        </linearGradient>
        <radialGradient id="moon-crater" cx=".42" cy=".3" r=".65">
          <stop offset="0" stopColor="#0f172a" stopOpacity=".55" />
          <stop offset=".75" stopColor="#1e293b" stopOpacity=".35" />
          <stop offset=".9" stopColor="#e2e8f0" stopOpacity=".3" />
          <stop offset="1" stopColor="#e2e8f0" stopOpacity="0" />
        </radialGradient>
        <clipPath id="moon-clip">
          <circle cx={CX} cy={CY} r={R} />
        </clipPath>
      </defs>
      <circle cx={CX} cy={CY} r={R + 6} fill="#e2e8f0" opacity=".12" />
      <circle cx={CX} cy={CY} r={R} fill="url(#moon-ground)" />
      <g clipPath="url(#moon-clip)">
        {HORIZON_CRATERS.map((c) => (
          <ellipse key={c.x} cx={c.x} cy={c.y} rx={c.rx} ry={c.ry} fill="url(#moon-crater)" />
        ))}
      </g>
      {LAYOUTS.map(({ step, size, show }) => (
        <g key={step} className={show}>
          {MODULE_TYPES.map((type, i) => {
            const dx = (i - (MODULE_TYPES.length - 1) / 2) * step;
            const y = CY - Math.sqrt(R * R - dx * dx);
            const angle = (Math.asin(dx / R) * 180) / Math.PI;
            return (
              <image
                key={type}
                href={spriteUrl(type)}
                x={-size / 2}
                y={-size * 0.89}
                width={size}
                height={size}
                transform={`translate(${CX + dx} ${y}) rotate(${angle})`}
              />
            );
          })}
        </g>
      ))}
    </svg>
  );
}

export function TitleScreen({ isDemo, onStart, onHelp }: { isDemo: boolean; onStart: () => void; onHelp: () => void }) {
  return (
    <main className="relative flex min-h-dvh flex-col items-center overflow-hidden px-6 pb-[40vh] pt-[11vh] sm:pt-[8vh] text-center">
      <Earth className="anim-float absolute right-3 top-3 h-14 w-14 sm:right-[8%] sm:top-[7%] sm:h-28 sm:w-28" shade={0.4} />

      <p className="anim-rise text-[11px] font-semibold uppercase tracking-[0.3em] text-orange-300 sm:text-xs">NASA Space Apps Challenge 2026</p>
      <h1 className="anim-rise mt-3 text-5xl font-black leading-none tracking-tight text-white sm:text-7xl lg:text-8xl">
        Mission <span className="bg-linear-to-b from-orange-300 to-orange-500 bg-clip-text text-transparent">Trainer</span>
      </h1>
      <p className="anim-rise mt-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Місячна база · 30 солів</p>
      <p className="anim-rise mt-5 max-w-xl text-base text-slate-300 sm:text-lg">
        Ти — командир першої бази на Місяці. Будуй модулі, стеж за енергією, повітрям та їжею і допоможи екіпажу пережити довгу місячну ніч.
      </p>

      <div className="anim-rise relative z-10 mt-8 flex flex-wrap justify-center gap-3">
        <button autoFocus onClick={onStart} className={`${PRIMARY_BTN} px-7 py-3 text-lg`}>
          Почати місію
          <Icon name="play" />
        </button>
        <button onClick={onHelp} className={`${SECONDARY_BTN} px-6 py-3 text-lg`}>
          <Icon name="help" />
          Як грати
        </button>
      </div>
      {isDemo && (
        <p className="relative z-10 mt-4 rounded-full bg-violet-500/15 px-3 py-1 text-xs text-violet-200 ring-1 ring-violet-400/30">
          Демо-режим: рушій гри ще в розробці, правила спрощені
        </p>
      )}

      <MoonHorizon />
    </main>
  );
}
