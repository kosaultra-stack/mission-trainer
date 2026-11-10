/** Смужка прогресу місії: пройдені соли, поточний, майбутні. */
export function MissionProgress({ sol, maxSol, isNight }: { sol: number; maxSol: number; isNight: boolean }) {
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
        const look =
          n < sol
            ? 'h-1.5 bg-slate-400/80'
            : n === sol
              ? `h-2.5 ${isNight ? 'bg-indigo-300 shadow-[0_0_8px_1px] shadow-indigo-300/70' : 'bg-amber-300 shadow-[0_0_8px_1px] shadow-amber-300/70'}`
              : 'h-1.5 bg-slate-700/80';
        return <div key={n} title={`Сол ${n}`} className={`flex-1 rounded-full transition-all duration-500 ${look}`} />;
      })}
    </div>
  );
}
