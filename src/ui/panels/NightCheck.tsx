import type { GameState } from '../../shared/types';
import { engine } from '../engine';
import { Icon } from '../icons';
import { H2, NIGHT_SOLS } from '../look';

/**
 * «Що буде вночі?» Питає в рушія прогноз для того самого стану, але в темряві,
 * і показує, на скільки солів вистачить заряду. Сам нічого не моделює.
 */
export function NightCheck({ state, onWhy }: { state: GameState; onWhy: () => void }) {
  if (state.status !== 'playing') return null;

  const nightPower = engine.forecast({ ...state, isNight: true }).power;
  const power = state.resources.power;
  const lasts = nightPower >= 0 ? Infinity : Math.floor(power / -nightPower);
  const enough = lasts >= NIGHT_SOLS;
  const shown = Math.min(lasts, NIGHT_SOLS);

  const title = state.isNight ? 'Ніч триває' : 'Перевірка перед ніччю';
  const text =
    nightPower >= 0
      ? 'Уночі енергія не падатиме. База готова до темряви!'
      : state.isNight
        ? `Заряду вистачить ще приблизно на ${lasts} ${solWord(lasts)}. Вимикай зайве, щоб дотягнути до світанку.`
        : enough
          ? `Якби ніч настала зараз, заряду вистачило б на всю ніч (~${NIGHT_SOLS} солів).`
          : `Якби ніч настала зараз, заряду вистачило б лише на ~${lasts} із ${NIGHT_SOLS} солів. Збудуй акумулятори або плануй вимикати модулі.`;
  const tone = nightPower >= 0 || enough ? 'text-emerald-300' : lasts >= NIGHT_SOLS / 2 ? 'text-amber-300' : 'text-rose-300';
  const bar = nightPower >= 0 || enough ? 'bg-emerald-400' : lasts >= NIGHT_SOLS / 2 ? 'bg-amber-400' : 'bg-rose-400';

  return (
    <section className="panel p-3" aria-label={title}>
      <div className="mb-1.5 flex items-center gap-2">
        <Icon name="moon" className="h-4 w-4 text-indigo-300" />
        <h2 className={`${H2} flex-1`}>{title}</h2>
        <button onClick={onWhy} aria-label="Чому ніч така небезпечна?" title="Чому ніч така небезпечна?" className="rounded-md p-1 text-sky-300 ring-1 ring-sky-400/30 hover:bg-sky-400/15">
          <Icon name="book" className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <span className={`flex items-center gap-1 text-sm font-bold tabular-nums ${tone}`}>
          <Icon name="bolt" className="h-4 w-4" />
          {nightPower >= 0 ? '∞' : `${lasts}`}
        </span>
        <div className="flex h-2 min-w-0 flex-1 gap-[2px]" aria-hidden>
          {Array.from({ length: NIGHT_SOLS }, (_, i) => (
            <span key={i} className={`flex-1 rounded-sm ${i < shown || nightPower >= 0 ? bar : 'bg-slate-800'}`} />
          ))}
        </div>
        <span className="text-[11px] tabular-nums text-slate-500">{NIGHT_SOLS} солів</span>
      </div>
      <p className="mt-1.5 text-xs leading-snug text-slate-300">{text}</p>
      {nightPower < 0 && <p className="mt-1 text-[11px] text-slate-500">Уночі енергія змінюватиметься на {nightPower} за сол.</p>}
    </section>
  );
}

function solWord(n: number) {
  const d = n % 10;
  const dd = n % 100;
  if (d === 1 && dd !== 11) return 'сол';
  if (d >= 2 && d <= 4 && (dd < 12 || dd > 14)) return 'соли';
  return 'солів';
}
