import type { GameEvent } from '../shared/types';

export function EventModal({ event, onChoose }: { event: GameEvent; onChoose: (choiceId: string) => void }) {
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal className="w-full max-w-md rounded-2xl border border-amber-400/50 bg-slate-900 p-6 shadow-2xl shadow-amber-500/10">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-amber-300">⚠️ Подія</p>
        <h2 className="mb-2 text-xl font-bold text-slate-50">{event.title}</h2>
        <p className="mb-5 text-slate-300">{event.text}</p>
        <div className="space-y-2">
          {event.choices.map((c) => (
            <button
              key={c.id}
              onClick={() => onChoose(c.id)}
              className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-left transition hover:border-amber-300 hover:bg-slate-700"
            >
              <span className="block font-medium text-slate-100">{c.label}</span>
              <span className="block text-sm text-slate-400">{c.hint}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
