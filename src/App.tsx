import { useState } from 'react';
import { startState } from './mocks/states';
import type { ModuleType } from './shared/types';
import { BaseGrid } from './ui/BaseGrid';
import { BuildPanel } from './ui/BuildPanel';
import { EventModal } from './ui/EventModal';
import { GameOver } from './ui/GameOver';
import { Hud } from './ui/Hud';
import { LogPanel } from './ui/LogPanel';
import { MockSwitcher } from './ui/MockSwitcher';
import { useGame } from './ui/useGame';

export default function App() {
  const { state, load, dispatch, notice } = useGame(startState);
  const [selected, setSelected] = useState<ModuleType | null>(null);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#1e293b,_#020617_70%)] text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-lg font-bold tracking-tight">
            🌕 Mission Trainer <span className="font-normal text-slate-400">— місячна база</span>
          </h1>
          <div className="relative z-30">
            <MockSwitcher onPick={(s) => { load(s); setSelected(null); }} />
          </div>
        </div>

        <Hud state={state} onNextSol={() => dispatch({ type: 'nextSol' })} />

        <div className="grid items-start gap-4 lg:grid-cols-[1fr_300px]">
          <BaseGrid
            state={state}
            selected={selected}
            onBuild={(x, y) => selected && dispatch({ type: 'build', module: selected, x, y })}
            onToggle={(moduleId) => dispatch({ type: 'toggle', moduleId })}
          />
          <div className="flex flex-col gap-4">
            <BuildPanel selected={selected} onSelect={setSelected} />
            <LogPanel log={state.log} />
          </div>
        </div>
      </div>

      {state.pendingEvent && state.status === 'playing' && (
        <EventModal event={state.pendingEvent} onChoose={(choiceId) => dispatch({ type: 'choose', choiceId })} />
      )}
      {state.status !== 'playing' && <GameOver state={state} onRestart={() => load(startState)} />}
      {notice && (
        <p role="status" className="fixed inset-x-4 bottom-4 z-30 mx-auto max-w-md rounded-xl border border-amber-400/40 bg-slate-900/95 px-4 py-2 text-center text-sm text-amber-200 shadow-xl">
          {notice}
        </p>
      )}
    </div>
  );
}
