import { isNightAt } from '../../content/levels';

interface Props {
  sol: number;
  maxSol: number;
  isNight: boolean;
  /** Номер місії — щоб показати на смужці, коли буде темно. */
  level?: number;
}

/** Смужка прогресу місії: пройдені соли, поточний, майбутні. Нічні соли — сині, тож видно, скільки лишилося до темряви. */
export function MissionProgress({ sol, maxSol, isNight, level }: Props) {
  return (
    <div
      className="flex items-center gap-[3px]"
      role="progressbar"
      aria-label="Прогрес місії"
      aria-valuemin={1}
      aria-valuemax={maxSol}
      aria-valuenow={sol}
    >
      {Array.from({ length: maxSol }, (_, i) => {
        const n = i + 1;
        const dark = isNightAt(level, n);
        const look =
          n < sol
            ? `h-1.5 ${dark ? 'bg-indigo-400/70' : 'bg-slate-400/80'}`
            : n === sol
              ? `h-2.5 ${isNight ? 'bg-indigo-300 shadow-[0_0_8px_1px] shadow-indigo-300/70' : 'bg-amber-300 shadow-[0_0_8px_1px] shadow-amber-300/70'}`
              : `h-1.5 ${dark ? 'bg-indigo-500/45' : 'bg-slate-700/80'}`;
        return <div key={n} title={`Сол ${n}${dark ? ' — ніч' : ''}`} className={`flex-1 rounded-full transition-all duration-500 ${look}`} />;
      })}
    </div>
  );
}
