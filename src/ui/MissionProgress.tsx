/** Смужка прогресу місії: пройдені соли, поточний, майбутні. */
export function MissionProgress({ sol, maxSol, isNight }: { sol: number; maxSol: number; isNight: boolean }) {
  return (
    <div className="flex gap-0.5" role="progressbar" aria-valuemin={1} aria-valuemax={maxSol} aria-valuenow={sol} aria-label="Прогрес місії">
      {Array.from({ length: maxSol }, (_, i) => {
        const n = i + 1;
        const cls =
          n < sol ? 'bg-slate-400' : n === sol ? (isNight ? 'bg-indigo-400 ring-2 ring-indigo-300/60' : 'bg-amber-300 ring-2 ring-amber-200/60') : 'bg-slate-700/70';
        return <div key={n} title={`Сол ${n}`} className={`h-2 flex-1 rounded-sm ${cls}`} />;
      })}
    </div>
  );
}
