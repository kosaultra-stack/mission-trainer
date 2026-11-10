import { useEffect, useState } from 'react';
import { MODULES } from '../../content/modules';
import type { GameState, ModuleType } from '../../shared/types';
import { getAdvice } from '../advisor';
import { engine, IS_DEMO } from '../engine';
import { NextSolButton } from '../hud/NextSolButton';
import { PartsChip, ResourcesPanel } from '../hud/ResourcesPanel';
import { TopBar } from '../hud/TopBar';
import { MODULE_TYPES } from '../look';
import { BaseMap } from '../map/BaseMap';
import { EndScreen } from '../overlays/EndScreen';
import { EventModal } from '../overlays/EventModal';
import { HowToPlay } from '../overlays/HowToPlay';
import { Advisor } from '../panels/Advisor';
import { BuildPanel } from '../panels/BuildPanel';
import { LogPanel } from '../panels/LogPanel';
import { useGame } from '../useGame';

const SEEN_KEY = 'mission-trainer:how-to-seen';

function firstVisit(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === null;
  } catch {
    return false;
  }
}

function rememberVisit() {
  try {
    localStorage.setItem(SEEN_KEY, '1');
  } catch {
    /* сховище недоступне — просто покажемо інструктаж ще раз */
  }
}

export function GameScreen({ onHome }: { onHome: () => void }) {
  const { state, banner, pulse, notice, dispatch, load, restart } = useGame();
  const [building, setBuilding] = useState<ModuleType | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(firstVisit);

  const forecast = engine.forecast(state);
  const canAct = state.status === 'playing' && state.pendingEvent === null;
  const advice = getAdvice(state, forecast, building);

  const clearSelection = () => {
    setBuilding(null);
    setSelectedId(null);
  };

  const pickBuilding = (type: ModuleType | null) => {
    setBuilding(type);
    setSelectedId(null);
  };

  const selectModule = (id: string | null) => {
    setSelectedId(id);
    setBuilding(null);
  };

  const build = (x: number, y: number) => {
    if (!building) return;
    const next = dispatch({ type: 'build', module: building, x, y });
    if (next && next.parts < MODULES[building].cost) setBuilding(null);
  };

  const nextSol = () => {
    clearSelection();
    dispatch({ type: 'nextSol' });
  };

  const loadState = (next: GameState) => {
    clearSelection();
    load(next);
  };

  const goHome = () => {
    const inProgress = state.status === 'playing' && state.sol > 1;
    if (!inProgress || window.confirm('Вийти на головну? Поточну місію буде втрачено.')) onHome();
  };

  const closeHelp = () => {
    rememberVisit();
    setHelpOpen(false);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (helpOpen) {
        if (e.key === 'Escape') closeHelp();
        return;
      }
      const digit = /^[1-9]$/.test(e.key) ? Number(e.key) : null;
      if (state.pendingEvent && state.status === 'playing') {
        const choice = digit ? state.pendingEvent.choices[digit - 1] : undefined;
        if (choice) dispatch({ type: 'choose', choiceId: choice.id });
        return;
      }
      if (e.key === 'Escape') return clearSelection();
      if (!canAct) return;
      if (e.code === 'KeyN') return nextSol();
      const type = digit ? MODULE_TYPES[digit - 1] : undefined;
      if (type && state.parts >= MODULES[type].cost) pickBuilding(building === type ? null : type);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="relative mx-auto flex min-h-dvh max-w-[1760px] flex-col gap-3 p-3 pb-24 lg:h-dvh lg:pb-3">
      <TopBar
        state={state}
        canAct={canAct}
        isDemo={IS_DEMO}
        onNextSol={nextSol}
        onHelp={() => setHelpOpen(true)}
        onHome={goHome}
        onLoadMock={loadState}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-3 lg:grid lg:grid-cols-[220px_minmax(0,1fr)_280px] xl:grid-cols-[250px_minmax(0,1fr)_320px]">
        <aside className="scroll-thin contents lg:flex lg:min-h-0 lg:flex-col lg:gap-3 lg:overflow-y-auto">
          <div className="order-1 lg:order-none">
            <ResourcesPanel state={state} forecast={forecast} pulse={pulse} />
          </div>
          <div className="order-4 lg:order-none">
            <Advisor advice={advice} />
          </div>
        </aside>

        <div className="order-2 flex min-h-0 lg:order-none">
          <BaseMap
            state={state}
            building={building}
            selectedId={selectedId}
            canAct={canAct}
            banner={banner}
            onBuild={build}
            onSelect={selectModule}
            onToggle={(moduleId) => dispatch({ type: 'toggle', moduleId })}
            onCancelBuild={() => setBuilding(null)}
          />
        </div>

        <aside className="contents lg:flex lg:min-h-0 lg:flex-col lg:gap-3">
          <div className="order-3 lg:order-none">
            <BuildPanel parts={state.parts} building={building} disabled={!canAct} onPick={pickBuilding} />
          </div>
          <div className="order-5 flex lg:order-none lg:min-h-0 lg:flex-1">
            <LogPanel log={state.log} />
          </div>
        </aside>
      </div>

      {/* Нижня панель дій для телефона */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-2 border-t border-white/10 bg-slate-950/90 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden">
        <PartsChip parts={state.parts} pulse={pulse} />
        <NextSolButton isLast={state.sol >= state.maxSol} disabled={!canAct} onClick={nextSol} className="flex flex-1" />
      </div>

      {notice && (
        <p role="status" className="anim-rise fixed inset-x-4 bottom-20 z-40 mx-auto max-w-sm rounded-xl border border-amber-400/40 bg-slate-900/95 px-4 py-2 text-center text-sm text-amber-200 shadow-xl lg:bottom-6">
          {notice}
        </p>
      )}

      {state.pendingEvent && state.status === 'playing' && !helpOpen && (
        <EventModal event={state.pendingEvent} onChoose={(choiceId) => dispatch({ type: 'choose', choiceId })} />
      )}
      {state.status !== 'playing' && (
        <EndScreen
          state={state}
          onRestart={() => {
            clearSelection();
            restart();
          }}
          onHome={onHome}
        />
      )}
      {helpOpen && <HowToPlay onClose={closeHelp} />}
    </div>
  );
}
