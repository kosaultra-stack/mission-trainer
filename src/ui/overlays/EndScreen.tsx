import type { GameState } from '../../shared/types';
import { Icon } from '../icons';
import { GAUGE_LOOK, type GaugeId } from '../look';
import { Modal, PRIMARY_BTN, SECONDARY_BTN } from './Modal';

const GAUGES: GaugeId[] = ['power', 'life', 'food', 'radiation'];

export function EndScreen({ state, onRestart, onHome }: { state: GameState; onRestart: () => void; onHome: () => void }) {
  const won = state.status === 'won';
  const value = (id: GaugeId) => (id === 'radiation' ? state.radiation : state.resources[id]);

  return (
    <Modal label={won ? 'Місію виконано' : 'Місію провалено'} tone={won ? 'border-emerald-400/50' : 'border-rose-500/50'}>
      <div className="text-center">
        <span
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ring-1 ${
            won ? 'bg-emerald-400/15 text-emerald-300 ring-emerald-300/40' : 'bg-rose-500/15 text-rose-300 ring-rose-400/40'
          }`}
        >
          <Icon name={won ? 'flag' : 'alert'} className="h-9 w-9" />
        </span>
        <h2 className={`mt-3 text-2xl font-black ${won ? 'text-emerald-300' : 'text-rose-300'}`}>{won ? 'Місію виконано!' : 'Місію провалено'}</h2>
        <p className="mt-1 text-slate-300">
          {won ? `База протрималася всі ${state.maxSol} солів. Екіпаж пишається своїм командиром!` : state.lostReason}
        </p>
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-slate-950/50 p-2">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Сол</dt>
          <dd className="text-xl font-bold tabular-nums text-white">
            {state.sol}
            <span className="text-sm font-normal text-slate-500"> / {state.maxSol}</span>
          </dd>
        </div>
        <div className="rounded-xl bg-slate-950/50 p-2">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Модулів</dt>
          <dd className="text-xl font-bold tabular-nums text-white">{state.modules.length}</dd>
        </div>
        <div className="rounded-xl bg-slate-950/50 p-2">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Запчастин</dt>
          <dd className="text-xl font-bold tabular-nums text-white">{state.parts}</dd>
        </div>
      </dl>
      <ul className="mt-2 grid grid-cols-4 gap-2">
        {GAUGES.map((id) => (
          <li key={id} className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-950/50 py-2" title={GAUGE_LOOK[id].label}>
            <span className={`flex h-6 w-6 items-center justify-center rounded-md ${GAUGE_LOOK[id].chip}`}>
              <Icon name={GAUGE_LOOK[id].icon} className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm font-bold tabular-nums text-slate-100">{value(id)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
        <button autoFocus onClick={onRestart} className={`${PRIMARY_BTN} flex-1`}>
          <Icon name="restart" className="h-4 w-4" />
          {won ? 'Нова місія' : 'Спробувати ще раз'}
        </button>
        <button onClick={onHome} className={`${SECONDARY_BTN} flex-1`}>
          <Icon name="home" className="h-4 w-4" />
          На головну
        </button>
      </div>
    </Modal>
  );
}
