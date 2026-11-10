import { MODULES } from '../content/modules';
import type { GameState, ModuleType } from '../shared/types';
import { GRID_H, GRID_W, MODULE_LOOK, spriteUrl } from './look';
import { Sky } from './Sky';

interface Props {
  state: GameState;
  selected: ModuleType | null;
  onBuild: (x: number, y: number) => void;
  onToggle: (moduleId: string) => void;
}

/** Декоративні кратери на порожніх ділянках (фіксовані, без випадковості). */
const CRATERS: Record<number, string> = {
  1: 'left-[20%] top-[25%] h-[35%] w-[35%]',
  6: 'left-[45%] top-[50%] h-[25%] w-[25%]',
  12: 'left-[15%] top-[40%] h-[45%] w-[45%]',
  19: 'left-[55%] top-[20%] h-[20%] w-[20%]',
  25: 'left-[30%] top-[30%] h-[30%] w-[30%]',
  33: 'left-[50%] top-[45%] h-[38%] w-[38%]',
  38: 'left-[20%] top-[15%] h-[22%] w-[22%]',
  43: 'left-[35%] top-[35%] h-[40%] w-[40%]',
};

export function BaseGrid({ state, selected, onBuild, onToggle }: Props) {
  const coords = Array.from({ length: GRID_W * GRID_H }, (_, i) => ({ i, x: i % GRID_W, y: Math.floor(i / GRID_W) }));
  const cells = coords.map(({ i, x, y }) => {
    const m = state.modules.find((mod) => mod.x === x && mod.y === y);
    if (m) {
      const info = MODULES[m.type];
      return (
        <button
          key={`${x}-${y}`}
          onClick={() => onToggle(m.id)}
          title={`${info.name} — ${m.on ? 'увімкнено' : 'вимкнено'}. Натисніть, щоб перемкнути.`}
          aria-pressed={m.on}
          className={`group relative flex aspect-square items-center justify-center rounded-lg border-2 transition hover:-translate-y-0.5 ${MODULE_LOOK[m.type].tile}`}
        >
          <img src={spriteUrl(m.type)} alt={info.name} className={`h-[82%] w-[82%] transition ${m.on ? '' : 'opacity-40 grayscale'}`} />
          <span
            className={`absolute right-1 top-1 h-2 w-2 rounded-full ${m.on ? 'bg-lime-400 shadow-[0_0_6px] shadow-lime-400' : 'bg-slate-500'}`}
          />
          {!m.on && <span className="absolute bottom-0.5 rounded bg-slate-950/80 px-1 text-[9px] font-semibold uppercase text-slate-300">вимк</span>}
        </button>
      );
    }
    return (
      <button
        key={`${x}-${y}`}
        onClick={() => onBuild(x, y)}
        disabled={!selected}
        aria-label={selected ? `Побудувати ${MODULES[selected].name} на ділянці ${x},${y}` : `Порожня ділянка ${x},${y}`}
        className={`group relative aspect-square overflow-hidden rounded-lg border bg-slate-400/10 transition ${
          selected ? 'border-dashed border-orange-300/60 hover:bg-orange-400/15' : 'cursor-default border-slate-500/20'
        }`}
      >
        {CRATERS[i] && <span className={`absolute rounded-full bg-slate-900/25 shadow-[inset_2px_2px_3px] shadow-slate-950/40 ${CRATERS[i]}`} />}
        {selected && <img src={spriteUrl(selected)} alt="" className="absolute inset-[9%] opacity-0 transition group-hover:opacity-50" />}
      </button>
    );
  });

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950">
      <Sky isNight={state.isNight} />
      <div
        className={`relative p-3 transition-colors duration-1000 ${
          state.isNight ? 'bg-slate-900' : 'bg-slate-600'
        }`}
      >
        <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${GRID_W}, minmax(0, 1fr))` }}>
          {cells}
        </div>
        <div className={`pointer-events-none absolute inset-0 bg-indigo-950/40 transition-opacity duration-1000 ${state.isNight ? 'opacity-100' : 'opacity-0'}`} />
      </div>
    </section>
  );
}
