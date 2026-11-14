import { nightAround } from '../../content/levels';
import type { GameState } from '../../shared/types';
import { engine } from '../engine';
import { Icon } from '../icons';
import { H2 } from '../look';

/**
 * «Що буде вночі?» Питає в рушія прогноз для того самого стану, але в темряві,
 * і показує, на скільки солів вистачить заряду. Сам нічого не моделює.
 * Коли саме й на скільки настане темрява — бере з розкладу місії.
 */
export function NightCheck({ state, onWhy }: { state: GameState; onWhy: () => void }) {
  const night = nightAround(state.level, state.sol);
  if (state.status !== 'playing' || !night) return null;

  const [from, to] = night;
  /** Скільки солів темряви попереду: решта цієї ночі або вся наступна. */
  const need = state.isNight ? to - state.sol + 1 : to - from + 1;
  const startsIn = from - state.sol;

  const nightPower = engine.forecast({ ...state, isNight: true }).power;
  const power = state.resources.power;
  const lasts = nightPower >= 0 ? Infinity : Math.floor(power / -nightPower);
  const enough = lasts >= need;
  const shown = Math.min(lasts, need);

  /** Заголовок одразу каже головне: скільки лишилося до темряви або до світанку. */
  const title = state.isNight ? `До світанку ${need} ${solWord(need)}` : `Ніч через ${startsIn} ${solWord(startsIn)}`;
  const text =
    nightPower >= 0
      ? 'Уночі енергія не падатиме. База готова до темряви!'
      : state.isNight
        ? enough
          ? 'Заряду вистачить до світанку.'
          : `Заряду вистачить лише на ~${lasts} ${solWord(lasts)}. Вимикай зайве, щоб дотягнути до світанку.`
        : enough
          ? `Якби ніч настала зараз, заряду вистачило б на всі ${need} ${solWord(need)} темряви.`
          : `Якби ніч настала зараз, заряду вистачило б лише на ~${lasts} із ${need} ${solWord(need)}. Збудуй акумулятори або плануй вимикати модулі.`;
  const good = nightPower >= 0 || enough;
  const tone = good ? 'text-emerald-300' : lasts >= need / 2 ? 'text-amber-300' : 'text-rose-300';
  const bar = good ? 'bg-emerald-400' : lasts >= need / 2 ? 'bg-amber-400' : 'bg-rose-400';

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
          {Array.from({ length: need }, (_, i) => (
            <span key={i} className={`flex-1 rounded-sm ${i < shown || nightPower >= 0 ? bar : 'bg-slate-800'}`} />
          ))}
        </div>
        <span className="text-[11px] tabular-nums text-slate-400" title="Як змінюватиметься енергія вночі">
          {nightPower > 0 ? `+${nightPower}` : nightPower < 0 ? `−${-nightPower}` : '±0'} / сол
        </span>
      </div>
      <p className="mt-1.5 text-xs leading-snug text-slate-300">{text}</p>
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
