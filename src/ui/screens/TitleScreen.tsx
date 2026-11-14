import { useState } from 'react';
import { levelInfo, LEVELS, type LevelInfo } from '../../content/levels';
import { Earth } from '../art';
import { Icon } from '../icons';
import { MODULE_TYPES, spriteUrl } from '../look';
import { PRIMARY_BTN, SECONDARY_BTN } from '../overlays/Modal';
import { loadProgress, type LevelResult, type Progress } from '../progress';

/** Обрій Місяця з базою. Коло радіуса R із центром далеко внизу; модулі стоять на дузі. */
const R = 2360;
const CX = 800;
const CY = 2500;
/** Відстань між модулями на обрії: широко на великому екрані, щільно на телефоні. */
const LAYOUTS = [
  { step: 128, size: 104, show: 'hidden sm:block' },
  { step: 64, size: 62, show: 'sm:hidden' },
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
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[34vh] min-h-52 w-full"
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

const DIFFICULTY_LOOK: Record<LevelInfo['difficulty'], string> = {
  Легко: 'bg-emerald-400/15 text-emerald-300 ring-emerald-400/40',
  Середньо: 'bg-amber-400/15 text-amber-300 ring-amber-400/40',
  Складно: 'bg-rose-400/15 text-rose-300 ring-rose-400/40',
};

/** «5–9, 14–19 і 24–28» — коли на цій місії темно. */
const nightsText = (level: LevelInfo) => level.rules.nights.map(([from, to]) => `${from}–${to}`).join(', ');

function LevelCard({ level, result, selected, onSelect }: { level: LevelInfo; result?: LevelResult; selected: boolean; onSelect: () => void }) {
  return (
    <button
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`relative flex flex-row items-center gap-3 rounded-2xl border p-3 text-left transition sm:flex-col sm:items-stretch sm:gap-1.5 ${
        selected
          ? 'border-orange-400 bg-orange-500/15 shadow-[0_0_22px_-4px] shadow-orange-500/70'
          : 'border-white/10 bg-slate-900/70 hover:border-slate-400 hover:bg-slate-800/80'
      }`}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 sm:inline">Місія {level.id}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950/60 text-lg font-black text-white sm:hidden">{level.id}</span>
        <span className={`hidden rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 sm:inline ${DIFFICULTY_LOOK[level.difficulty]}`}>
          {level.difficulty}
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-extrabold leading-tight text-white sm:text-lg">{level.name}</span>
        <span className="block truncate text-xs text-slate-400">{level.place}</span>
      </span>
      <span className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:justify-between">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 sm:hidden ${DIFFICULTY_LOOK[level.difficulty]}`}>
          {level.difficulty}
        </span>
        <span className="flex gap-0.5" aria-label={result ? `Найкраща оцінка: ${result.stars} з 3` : 'Ще не пройдено'}>
          {[1, 2, 3].map((n) => (
            <Icon key={n} name="star" className={`h-4 w-4 ${result && n <= result.stars ? 'text-amber-300' : 'text-slate-700'}`} />
          ))}
        </span>
        {result?.won && <span className="hidden text-[10px] font-bold uppercase tracking-wide text-emerald-300 sm:inline">Пройдено</span>}
      </span>
    </button>
  );
}

interface Props {
  isDemo: boolean;
  /** Місія, обрана востаннє (щоб після повернення на заставку вона лишалася вибраною). */
  initialLevel: number;
  onStart: (level: number) => void;
  onHelp: () => void;
}

export function TitleScreen({ isDemo, initialLevel, onStart, onHelp }: Props) {
  const [progress] = useState<Progress>(loadProgress);
  const [selectedId, setSelectedId] = useState(initialLevel);
  const selected = levelInfo(selectedId);

  return (
    <main className="relative flex min-h-dvh flex-col items-center overflow-hidden px-4 pb-[36vh] pt-[10vh] text-center sm:px-6 sm:pt-[5vh]">
      <Earth className="anim-float absolute right-3 top-3 h-14 w-14 sm:right-[6%] sm:top-[6%] sm:h-24 sm:w-24" shade={0.4} />

      <p className="anim-rise text-[11px] font-semibold uppercase tracking-[0.3em] text-orange-300 sm:text-xs">NASA Space Apps Challenge 2026</p>
      <h1 className="anim-rise mt-2 text-5xl font-black leading-none tracking-tight text-white sm:text-6xl lg:text-7xl">
        Mission <span className="bg-linear-to-b from-orange-300 to-orange-500 bg-clip-text text-transparent">Trainer</span>
      </h1>
      <p className="anim-rise mt-3 max-w-xl text-sm text-slate-300 sm:text-base">
        Ти — командир бази на Місяці. Будуй модулі, стеж за енергією, повітрям та їжею і допоможи екіпажу пережити місячну ніч.
      </p>

      <div role="radiogroup" aria-label="Місія" className="anim-rise relative z-10 mt-5 grid w-full max-w-3xl gap-2 sm:grid-cols-3">
        {LEVELS.map((level) => (
          <LevelCard key={level.id} level={level} result={progress[level.id]} selected={level.id === selected.id} onSelect={() => setSelectedId(level.id)} />
        ))}
      </div>
      <div className="anim-rise relative z-10 mt-3 max-w-3xl rounded-xl bg-slate-950/60 px-4 py-2.5 text-left text-sm text-slate-300 ring-1 ring-white/10" aria-live="polite">
        <p>{selected.description}</p>
        <p className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-400">
          <span>
            <b className="text-slate-200">{selected.rules.maxSol}</b> солів
          </span>
          <span>
            Темрява: соли <b className="text-indigo-200">{nightsText(selected)}</b>
          </span>
          <span className="text-amber-200/90">Порада: {selected.tip}</span>
        </p>
      </div>

      <div className="anim-rise relative z-10 mt-5 flex flex-wrap justify-center gap-3">
        <button autoFocus onClick={() => onStart(selected.id)} className={`${PRIMARY_BTN} px-7 py-3 text-lg`}>
          Почати місію {selected.id}
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
