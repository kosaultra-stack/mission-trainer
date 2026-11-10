import type { GameState, ResourceId } from '../../shared/types';
import type { ChangePulse } from '../changes';
import { Icon } from '../icons';
import { H2 } from '../look';
import { useAnimatedNumber } from '../useAnimatedNumber';
import { ChangeChip } from './ChangeChip';
import { Gauge } from './Gauge';

const RESOURCES: ResourceId[] = ['power', 'life', 'food'];

export function PartsChip({ parts, pulse, className = 'inline-flex' }: { parts: number; pulse?: ChangePulse | null; className?: string }) {
  const shown = useAnimatedNumber(parts, 400);
  const change = pulse?.values.parts ?? 0;
  return (
    <span className={`items-center gap-1.5 rounded-lg bg-slate-800/80 px-2.5 py-1.5 text-sm text-slate-200 ring-1 ring-white/10 ${className}`}>
      <Icon name="nut" className="h-4 w-4 text-slate-400" />
      <span className="text-slate-400">Запчастини</span>
      <b className="relative tabular-nums text-white">
        {shown}
        {pulse && change !== 0 && <ChangeChip key={pulse.id} id="parts" value={change} className="bottom-full left-1/2 mb-1.5 -translate-x-1/2" />}
      </b>
    </span>
  );
}

interface Props {
  state: GameState;
  forecast: Record<ResourceId, number>;
  pulse: ChangePulse | null;
}

export function ResourcesPanel({ state, forecast, pulse }: Props) {
  return (
    <section className="panel p-3" aria-label="Ресурси бази">
      <h2 className={`${H2} mb-2`}>Ресурси бази</h2>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
        {RESOURCES.map((id) => (
          <Gauge key={id} id={id} value={state.resources[id]} delta={forecast[id]} pulse={pulse} />
        ))}
        <Gauge id="radiation" value={state.radiation} pulse={pulse} />
      </div>
      <PartsChip parts={state.parts} pulse={pulse} className="mt-2 hidden w-full justify-center lg:inline-flex" />
    </section>
  );
}
