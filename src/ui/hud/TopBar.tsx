import { useState } from 'react';
import { levelInfo } from '../../content/levels';
import { MOCK_STATES } from '../../mocks/states';
import type { GameState } from '../../shared/types';
import { Logo } from '../art';
import { Icon } from '../icons';
import { MissionProgress } from './MissionProgress';
import { NextSolButton } from './NextSolButton';

const MOCK_LABELS: Record<keyof typeof MOCK_STATES, string> = {
  startState: 'Початок',
  nightEventState: 'Ніч + подія',
  lostState: 'Програш',
  wonState: 'Перемога',
};

/** Позначка демо-режиму. За нею — меню з готовими мок-станами для верстки. */
function DemoMenu({ onLoad }: { onLoad: (s: GameState) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        title="Рушій гри ще в розробці. Інтерфейс працює на демо-правилах."
        className="rounded-lg bg-violet-500/15 px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-violet-300 ring-1 ring-violet-400/40 hover:bg-violet-500/25"
      >
        Демо
      </button>
      {open && <button aria-label="Закрити меню" tabIndex={-1} onClick={() => setOpen(false)} className="fixed inset-0 z-30 !cursor-default" />}
      {open && (
        <div className="anim-rise absolute right-0 top-full z-40 mt-2 w-44 rounded-xl border border-slate-600 bg-slate-900 p-1.5 shadow-2xl">
          <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Мок-стани</p>
          {(Object.keys(MOCK_STATES) as (keyof typeof MOCK_STATES)[]).map((key) => (
            <button
              key={key}
              onClick={() => {
                onLoad(MOCK_STATES[key]);
                setOpen(false);
              }}
              className="block w-full rounded-lg px-2 py-1.5 text-left text-sm text-slate-200 hover:bg-slate-800"
            >
              {MOCK_LABELS[key]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface Props {
  state: GameState;
  canAct: boolean;
  isDemo: boolean;
  onNextSol: () => void;
  onHelp: () => void;
  onScience: () => void;
  onHome: () => void;
  onLoadMock: (s: GameState) => void;
}

export function TopBar({ state, canAct, isDemo, onNextSol, onHelp, onScience, onHome, onLoadMock }: Props) {
  const { sol, maxSol, isNight } = state;
  const mission = levelInfo(state.level);
  return (
    <header className="panel relative z-30 flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2 lg:gap-x-5 lg:px-4">
      <button onClick={onHome} title="На головну" className="flex items-center gap-2 rounded-lg">
        <Logo className="h-8 w-8" />
        <span className="hidden text-left leading-tight xl:block">
          <span className="block text-[10px] font-semibold uppercase tracking-widest text-orange-300">Місія {mission.id}</span>
          <span className="block text-sm font-extrabold tracking-tight text-white">{mission.name}</span>
        </span>
      </button>

      <div className="flex items-baseline gap-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Сол</span>
        <span className="text-2xl font-black leading-none tabular-nums text-white">{sol}</span>
        <span className="text-sm tabular-nums text-slate-500">/ {maxSol}</span>
      </div>

      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 transition-colors duration-700 ${
          isNight ? 'bg-indigo-500/20 text-indigo-200 ring-indigo-400/50' : 'bg-amber-400/15 text-amber-200 ring-amber-300/50'
        }`}
      >
        <Icon name={isNight ? 'moon' : 'sun'} className="h-3.5 w-3.5" />
        <span className="sm:hidden">{isNight ? 'Ніч' : 'День'}</span>
        <span className="hidden sm:inline">{isNight ? 'Місячна ніч' : 'Місячний день'}</span>
      </span>

      <div className="order-last basis-full md:order-none md:min-w-0 md:flex-1 md:basis-0">
        <MissionProgress sol={sol} maxSol={maxSol} isNight={isNight} level={state.level} />
      </div>

      <div className="ml-auto flex items-center gap-2 md:ml-0">
        {isDemo && <DemoMenu onLoad={onLoadMock} />}
        <button
          onClick={onScience}
          title="Наукова довідка"
          aria-label="Наукова довідка"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-sky-300 ring-1 ring-sky-400/30 hover:bg-sky-400/15"
        >
          <Icon name="book" />
        </button>
        <button
          onClick={onHelp}
          title="Як грати"
          aria-label="Як грати"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 ring-1 ring-white/10 hover:bg-slate-800 hover:text-white"
        >
          <Icon name="help" />
        </button>
        <NextSolButton isLast={sol >= maxSol} disabled={!canAct} onClick={onNextSol} className="hidden lg:flex" />
      </div>
    </header>
  );
}
