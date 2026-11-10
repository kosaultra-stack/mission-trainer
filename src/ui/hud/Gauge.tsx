import { Icon } from '../icons';
import { GAUGE_LOOK, isDanger, type GaugeId } from '../look';

function DeltaChip({ delta }: { delta: number }) {
  const tone = delta > 0 ? 'bg-emerald-400/15 text-emerald-300' : delta < 0 ? 'bg-rose-400/15 text-rose-300' : 'bg-slate-700/60 text-slate-400';
  const sign = delta > 0 ? '+' : delta < 0 ? '−' : '±';
  return (
    <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${tone}`} title="Прогноз на наступний сол">
      {sign}
      {Math.abs(delta)}
      <span className="hidden font-normal opacity-70 lg:inline"> / сол</span>
    </span>
  );
}

/** Шкала ресурсу 0..100 із прогнозом рушія на наступний сол. */
export function Gauge({ id, value, delta }: { id: GaugeId; value: number; delta?: number }) {
  const look = GAUGE_LOOK[id];
  const danger = isDanger(id, value);
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div
      className={`rounded-xl border p-2.5 transition-colors duration-500 ${
        danger ? 'anim-danger border-rose-500/60 bg-rose-500/10' : 'border-white/5 bg-slate-950/40'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${look.chip}`}>
          <Icon name={look.icon} className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1 text-xs font-medium leading-tight text-slate-300">{look.label}</span>
        {danger && <Icon name="alert" className="h-4 w-4 shrink-0 text-rose-400" />}
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <span className={`min-w-8 text-xl font-bold leading-none tabular-nums ${danger ? 'text-rose-200' : 'text-slate-50'}`}>{value}</span>
        <div
          className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-800"
          role="meter"
          aria-label={look.label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={value}
        >
          <div className={`h-full rounded-full bg-linear-to-r transition-[width] duration-700 ${look.bar}`} style={{ width: `${pct}%` }} />
        </div>
        {delta !== undefined && <DeltaChip delta={delta} />}
      </div>
    </div>
  );
}
