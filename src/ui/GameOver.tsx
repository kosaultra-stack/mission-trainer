import type { GameState } from '../shared/types';

export function GameOver({ state, onRestart }: { state: GameState; onRestart: () => void }) {
  const won = state.status === 'won';
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className={`w-full max-w-md rounded-2xl border p-6 text-center shadow-2xl ${won ? 'border-lime-400/60 bg-slate-900' : 'border-rose-500/60 bg-slate-900'}`}>
        <div className="mb-2 text-5xl" aria-hidden>{won ? '🏆' : '💀'}</div>
        <h2 className={`mb-2 text-2xl font-bold ${won ? 'text-lime-300' : 'text-rose-300'}`}>
          {won ? 'Місію виконано!' : 'Місію провалено'}
        </h2>
        <p className="mb-1 text-slate-300">
          {won ? `База протрималася всі ${state.maxSol} солів.` : state.lostReason}
        </p>
        <p className="mb-5 text-sm text-slate-500">Сол {state.sol} з {state.maxSol}</p>
        <button onClick={onRestart} className="rounded-xl bg-orange-500 px-5 py-2 font-semibold text-slate-950 hover:bg-orange-400">
          Почати знову
        </button>
      </div>
    </div>
  );
}
