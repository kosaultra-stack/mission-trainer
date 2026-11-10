import { Icon } from '../icons';
import type { SolBannerInfo } from '../useGame';

/** Коротка заставка поверх мапи, коли настає новий сол. */
export function SolBanner({ sol, isNight, phaseChanged }: SolBannerInfo) {
  return (
    <div className="anim-banner pointer-events-none absolute inset-0 z-20 flex items-center justify-center" aria-hidden>
      <div className="rounded-2xl border border-white/15 bg-slate-950/85 px-8 py-4 text-center shadow-2xl backdrop-blur-sm">
        <div className={`flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] ${isNight ? 'text-indigo-300' : 'text-amber-300'}`}>
          <Icon name={isNight ? 'moon' : 'sun'} className="h-3.5 w-3.5" />
          {isNight ? 'Місячна ніч' : 'Місячний день'}
        </div>
        <div className="mt-1 text-4xl font-black tabular-nums text-white sm:text-5xl">Сол {sol}</div>
        {phaseChanged && (
          <div className="mt-1 text-sm font-semibold text-slate-200">{isNight ? 'Сонце сховалося за обрій' : 'Світанок! Сонце повернулося'}</div>
        )}
      </div>
    </div>
  );
}
