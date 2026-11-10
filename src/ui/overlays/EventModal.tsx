import type { GameEvent } from '../../shared/types';
import { Icon, type IconName } from '../icons';
import { Modal } from './Modal';

/** Іконка за ідентифікатором події; для невідомих — загальна. */
const EVENT_ICON: Record<string, IconName> = { 'solar-flare': 'sun', 'supply-drop': 'crate' };

export function EventModal({ event, onChoose }: { event: GameEvent; onChoose: (choiceId: string) => void }) {
  return (
    <Modal label={event.title} tone="border-amber-400/50">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-300 ring-1 ring-amber-300/40">
          <Icon name={EVENT_ICON[event.id] ?? 'alert'} className="h-7 w-7" />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300">Подія</p>
          <h2 className="text-xl font-bold leading-tight text-white">{event.title}</h2>
        </div>
      </div>
      <p className="mb-5 text-slate-300">{event.text}</p>
      <div className="space-y-2">
        {event.choices.map((choice, i) => (
          <button
            key={choice.id}
            autoFocus={i === 0}
            onClick={() => onChoose(choice.id)}
            className="flex w-full items-center gap-3 rounded-xl border border-slate-600 bg-slate-800/80 px-3 py-3 text-left transition hover:border-amber-300 hover:bg-slate-700"
          >
            <kbd className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-950/60 text-sm font-bold text-amber-300">{i + 1}</kbd>
            <span>
              <span className="block font-semibold text-slate-50">{choice.label}</span>
              <span className="block text-sm text-slate-400">{choice.hint}</span>
            </span>
          </button>
        ))}
      </div>
    </Modal>
  );
}
