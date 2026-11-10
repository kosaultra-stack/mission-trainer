import { MODULES } from '../content/modules';
import type { GameState, ModuleType } from '../shared/types';
import { GRID_H, GRID_W, MODULE_LOOK } from './look';

interface Props {
  state: GameState;
  selected: ModuleType | null;
  onBuild: (x: number, y: number) => void;
  onToggle: (moduleId: string) => void;
}

export function BaseGrid({ state, selected, onBuild, onToggle }: Props) {
  const coords = Array.from({ length: GRID_W * GRID_H }, (_, i) => ({ x: i % GRID_W, y: Math.floor(i / GRID_W) }));
  const cells = coords.map(({ x, y }) => {
      const m = state.modules.find((mod) => mod.x === x && mod.y === y);
      if (m) {
        const look = MODULE_LOOK[m.type];
        return (
          <button
            key={`${x}-${y}`}
            onClick={() => onToggle(m.id)}
            title={`${MODULES[m.type].name} — ${m.on ? 'увімкнено' : 'вимкнено'}. Натисніть, щоб перемкнути.`}
            className={`relative flex aspect-square flex-col items-center justify-center rounded-lg border-2 transition hover:scale-105 ${look.tile} ${m.on ? '' : 'opacity-40 grayscale'}`}
          >
            <span className="text-2xl sm:text-3xl" aria-hidden>{look.icon}</span>
            <span className="hidden truncate px-1 text-[10px] leading-tight text-slate-200 md:block">{MODULES[m.type].name}</span>
            <span className={`absolute right-1 top-1 h-2 w-2 rounded-full ${m.on ? 'bg-lime-400 shadow-[0_0_6px] shadow-lime-400' : 'bg-slate-500'}`} />
          </button>
        );
      }
        return (
          <button
            key={`${x}-${y}`}
            onClick={() => onBuild(x, y)}
            disabled={!selected}
            aria-label={`Порожня ділянка ${x},${y}`}
            className={`aspect-square rounded-lg border border-slate-600/30 bg-slate-500/10 transition ${
              selected ? 'border-dashed border-orange-300/60 hover:bg-orange-400/20' : 'cursor-default'
            }`}
          />
        );
  });

  return (
    <section
      className={`relative overflow-hidden rounded-2xl border border-slate-700/80 p-3 transition-colors duration-700 ${
        state.isNight ? 'bg-gradient-to-b from-slate-950 to-indigo-950' : 'bg-gradient-to-b from-slate-600 to-slate-800'
      }`}
    >
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${GRID_W}, minmax(0, 1fr))` }}>
        {cells}
      </div>
      {state.isNight && <div className="pointer-events-none absolute inset-0 bg-indigo-950/30" />}
    </section>
  );
}
