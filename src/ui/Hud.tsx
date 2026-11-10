import { forecast } from '../sim';
import type { GameState, ResourceId } from '../shared/types';
import { RESOURCE_LOOK } from './look';
import { MissionProgress } from './MissionProgress';
import { ResourceBar } from './ResourceBar';

const IDS: ResourceId[] = ['power', 'life', 'food'];

export function Hud({ state, onNextSol }: { state: GameState; onNextSol: () => void }) {
  const delta = forecast(state);
  return (
    <header className="rounded-2xl border border-slate-700/80 bg-slate-900/80 p-4 backdrop-blur">
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="text-2xl font-bold tracking-tight text-slate-50">
          Сол {state.sol}
          <span className="text-base font-normal text-slate-400"> / {state.maxSol}</span>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            state.isNight ? 'bg-indigo-500/20 text-indigo-200 ring-1 ring-indigo-400/50' : 'bg-amber-400/20 text-amber-200 ring-1 ring-amber-300/50'
          }`}
        >
          {state.isNight ? '🌙 Місячна ніч' : '☀️ Місячний день'}
        </span>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-200 ring-1 ring-slate-600">
          🔧 Запчастини: <b className="tabular-nums">{state.parts}</b>
        </span>
        <button
          onClick={onNextSol}
          disabled={state.status !== 'playing' || state.pendingEvent !== null}
          className="ml-auto rounded-xl bg-orange-500 px-4 py-2 font-semibold text-slate-950 shadow-lg shadow-orange-500/20 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Наступний сол ▶
        </button>
      </div>
      <div className="mb-4">
        <MissionProgress sol={state.sol} maxSol={state.maxSol} isNight={state.isNight} />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {IDS.map((id) => (
          <ResourceBar
            key={id}
            {...RESOURCE_LOOK[id]}
            value={state.resources[id]}
            delta={delta[id]}
            danger={state.resources[id] <= 20}
          />
        ))}
        <ResourceBar icon="☢️" label="Радіація" value={state.radiation} bar="bg-rose-500" danger={state.radiation >= 70} />
      </div>
    </header>
  );
}
