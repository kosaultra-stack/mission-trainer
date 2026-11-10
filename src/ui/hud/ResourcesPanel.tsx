import type { GameState, ResourceId } from '../../shared/types';
import { Icon } from '../icons';
import { H2 } from '../look';
import { Gauge } from './Gauge';

const RESOURCES: ResourceId[] = ['power', 'life', 'food'];

export function PartsChip({ parts, className = 'inline-flex' }: { parts: number; className?: string }) {
  return (
    <span className={`items-center gap-1.5 rounded-lg bg-slate-800/80 px-2.5 py-1.5 text-sm text-slate-200 ring-1 ring-white/10 ${className}`}>
      <Icon name="nut" className="h-4 w-4 text-slate-400" />
      <span className="text-slate-400">Запчастини</span>
      <b className="tabular-nums text-white">{parts}</b>
    </span>
  );
}

export function ResourcesPanel({ state, forecast }: { state: GameState; forecast: Record<ResourceId, number> }) {
  return (
    <section className="panel p-3" aria-label="Ресурси бази">
      <h2 className={`${H2} mb-2`}>Ресурси бази</h2>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
        {RESOURCES.map((id) => (
          <Gauge key={id} id={id} value={state.resources[id]} delta={forecast[id]} />
        ))}
        <Gauge id="radiation" value={state.radiation} />
      </div>
      <PartsChip parts={state.parts} className="mt-2 hidden w-full justify-center lg:inline-flex" />
    </section>
  );
}
