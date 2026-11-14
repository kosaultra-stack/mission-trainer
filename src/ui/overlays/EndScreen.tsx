import type { GameState } from '../../shared/types';
import { makeDebrief } from '../debrief';
import { Icon } from '../icons';
import type { ScienceId } from '../science';
import { MissionChart } from './MissionChart';
import { Modal, PRIMARY_BTN, SECONDARY_BTN } from './Modal';

interface Props {
  state: GameState;
  history: GameState[];
  onRestart: () => void;
  onHome: () => void;
  onRewind: (sol: number) => void;
  onWhy: (topic: ScienceId) => void;
}

/** Фінал місії з розбором: що сталося, коли було найважче і що спробувати наступного разу. */
export function EndScreen({ state, history, onRestart, onHome, onRewind, onWhy }: Props) {
  const won = state.status === 'won';
  const debrief = makeDebrief(history, state);

  return (
    <Modal label={won ? 'Місію виконано' : 'Місію провалено'} tone={won ? 'border-emerald-400/50' : 'border-rose-500/50'} wide>
      <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
        <span
          className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ring-1 ${
            won ? 'bg-emerald-400/15 text-emerald-300 ring-emerald-300/40' : 'bg-rose-500/15 text-rose-300 ring-rose-400/40'
          }`}
        >
          <Icon name={won ? 'flag' : 'alert'} className="h-9 w-9" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className={`text-2xl font-black ${won ? 'text-emerald-300' : 'text-rose-300'}`}>{won ? 'Місію виконано!' : 'Місію провалено'}</h2>
          <p className="mt-0.5 text-slate-300">
            {won ? `База протрималася всі ${state.maxSol} солів. Екіпаж пишається своїм командиром!` : state.lostReason}
          </p>
        </div>
        <div className="flex flex-col items-center gap-0.5" aria-label={`Оцінка командира: ${debrief.stars} з 3`}>
          <div className="flex gap-1">
            {[1, 2, 3].map((n) => (
              <Icon key={n} name="star" className={`h-7 w-7 ${n <= debrief.stars ? 'text-amber-300 drop-shadow-[0_0_6px_rgba(252,211,77,.6)]' : 'text-slate-700'}`} />
            ))}
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Сол {state.sol} / {state.maxSol} · модулів {state.modules.length}
          </span>
        </div>
      </div>

      <h3 className="mb-1.5 mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Як змінювалися ресурси</h3>
      <MissionChart points={debrief.points} maxSol={state.maxSol} />

      {debrief.lessons.length > 0 && (
        <>
          <h3 className="mb-1.5 mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Розбір польоту</h3>
          <ul className="space-y-2">
            {debrief.lessons.map((lesson) => (
              <li
                key={lesson.text}
                className={`flex items-start gap-2.5 rounded-xl border-l-4 bg-slate-950/50 px-3 py-2 ${
                  lesson.tone === 'good' ? 'border-l-emerald-400' : 'border-l-rose-400'
                }`}
              >
                <Icon
                  name={lesson.tone === 'good' ? 'star' : 'alert'}
                  className={`mt-0.5 h-4 w-4 shrink-0 ${lesson.tone === 'good' ? 'text-emerald-300' : 'text-rose-300'}`}
                />
                <div className="min-w-0 flex-1 text-sm leading-snug">
                  <p className="font-semibold text-slate-100">{lesson.text}</p>
                  {lesson.tip && <p className="text-slate-400">{lesson.tip}</p>}
                </div>
                {lesson.topic && (
                  <button
                    onClick={() => onWhy(lesson.topic!)}
                    className="flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-semibold text-sky-300 ring-1 ring-sky-400/30 hover:bg-sky-400/15"
                  >
                    <Icon name="book" className="h-3.5 w-3.5" />
                    Чому?
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {debrief.rewindTo.length > 0 && (
        <div className="mt-4 rounded-xl border border-sky-400/30 bg-sky-400/5 p-3">
          <p className="text-sm text-sky-100">
            <b>Спробуй інакше:</b> повернися трохи назад і зміни рішення. Справжні екіпажі теж тренуються так на симуляторах.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {debrief.rewindTo.map((r) => (
              <button
                key={r.sol}
                onClick={() => onRewind(r.sol)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-sky-400/15 px-3 py-1.5 text-sm font-semibold text-sky-200 ring-1 ring-sky-400/40 hover:bg-sky-400/25"
              >
                <Icon name="rewind" className="h-4 w-4" />
                {r.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
        <button autoFocus onClick={onRestart} className={`${PRIMARY_BTN} flex-1`}>
          <Icon name="restart" className="h-4 w-4" />
          {won ? 'Нова місія' : 'Почати спочатку'}
        </button>
        <button onClick={onHome} className={`${SECONDARY_BTN} flex-1`}>
          <Icon name="home" className="h-4 w-4" />
          На головну
        </button>
      </div>
    </Modal>
  );
}
