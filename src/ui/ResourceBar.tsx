interface Props {
  icon: string;
  label: string;
  value: number;
  bar: string;
  delta?: number;
  danger?: boolean;
}

export function ResourceBar({ icon, label, value, bar, delta, danger }: Props) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="min-w-0">
      <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
        <span className="truncate text-slate-300">
          <span aria-hidden>{icon}</span> {label}
        </span>
        <span className={`tabular-nums font-semibold ${danger ? 'text-rose-400' : 'text-slate-100'}`}>
          {value}
          {delta !== undefined && delta !== 0 && (
            <span className={`ml-1 text-xs ${delta > 0 ? 'text-lime-400' : 'text-rose-400'}`}>
              {delta > 0 ? `+${delta}` : delta}
            </span>
          )}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-800 ring-1 ring-slate-700">
        <div className={`h-full rounded-full transition-all ${bar} ${danger ? 'animate-pulse' : ''}`} style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}
