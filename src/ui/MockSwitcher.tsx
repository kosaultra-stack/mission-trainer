import type { GameState } from '../shared/types';
import { MOCK_STATES } from '../mocks/states';

const LABELS: Record<keyof typeof MOCK_STATES, string> = {
  startState: 'Початок',
  nightEventState: 'Ніч + подія',
  lostState: 'Програш',
};

/** Тимчасова панель для верстки: перемикає готові мок-стани. */
export function MockSwitcher({ onPick }: { onPick: (s: GameState) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-1 text-xs">
      <span className="text-slate-500">Мок:</span>
      {(Object.keys(MOCK_STATES) as (keyof typeof MOCK_STATES)[]).map((k) => (
        <button key={k} onClick={() => onPick(MOCK_STATES[k])} className="rounded-md bg-slate-800 px-2 py-1 text-slate-300 ring-1 ring-slate-700 hover:bg-slate-700">
          {LABELS[k]}
        </button>
      ))}
    </div>
  );
}
