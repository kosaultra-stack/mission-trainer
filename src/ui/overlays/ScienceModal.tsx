import { useState } from 'react';
import { Icon } from '../icons';
import { SCIENCE, SCIENCE_ORDER, type ScienceId } from '../science';
import { Modal, PRIMARY_BTN } from './Modal';

/** Наукова довідка: справжні факти, що стоять за правилами гри. */
export function ScienceModal({ topic, onClose }: { topic: ScienceId; onClose: () => void }) {
  const [current, setCurrent] = useState<ScienceId>(topic);
  const info = SCIENCE[current];

  return (
    <Modal label="Наукова довідка" wide>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-300">Наукова довідка</p>
          <h2 className="text-2xl font-black text-white">Чому так?</h2>
        </div>
        <button onClick={onClose} aria-label="Закрити" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white">
          <Icon name="close" />
        </button>
      </div>

      <div role="tablist" aria-label="Теми" className="mt-4 flex flex-wrap gap-2">
        {SCIENCE_ORDER.map((id) => {
          const t = SCIENCE[id];
          const active = id === current;
          return (
            <button
              key={id}
              role="tab"
              aria-selected={active}
              onClick={() => setCurrent(id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ring-1 transition ${
                active ? 'bg-slate-100 text-slate-950 ring-white' : 'bg-slate-800/70 text-slate-300 ring-white/10 hover:bg-slate-700'
              }`}
            >
              <Icon name={t.icon} className="h-4 w-4" />
              {t.title}
            </button>
          );
        })}
      </div>

      <article key={current} role="tabpanel" className="anim-rise mt-4 grid gap-3 sm:grid-cols-[auto_1fr]">
        <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${info.chip}`}>
          <Icon name={info.icon} className="h-8 w-8" />
        </span>
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-white">{info.title}</h3>
          <p className="leading-relaxed text-slate-200">{info.fact}</p>
          <p className="rounded-xl border-l-4 border-l-orange-400 bg-slate-950/50 px-3 py-2 text-sm leading-snug text-slate-300">
            <b className="text-orange-300">У грі:</b> {info.inGame}
          </p>
          <a
            href={info.source.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-start gap-1.5 text-sm text-sky-300 underline-offset-2 hover:underline"
          >
            <Icon name="link" className="mt-0.5 h-4 w-4 shrink-0" />
            Джерело: {info.source.label}
          </a>
        </div>
      </article>

      <div className="mt-6 flex justify-end">
        <button autoFocus onClick={onClose} className={`${PRIMARY_BTN} w-full sm:w-auto`}>
          Повернутися до місії
        </button>
      </div>
    </Modal>
  );
}
