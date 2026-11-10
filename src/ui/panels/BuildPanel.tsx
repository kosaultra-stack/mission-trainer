import { useState } from 'react';
import { MODULES } from '../../content/modules';
import type { ModuleType } from '../../shared/types';
import { Icon } from '../icons';
import { H2, MODULE_TYPES, spriteUrl } from '../look';

interface Props {
  parts: number;
  building: ModuleType | null;
  disabled: boolean;
  onPick: (type: ModuleType | null) => void;
}

export function BuildPanel({ parts, building, disabled, onPick }: Props) {
  const [hovered, setHovered] = useState<ModuleType | null>(null);
  const shown = hovered ?? building;
  const lacks = shown !== null && parts < MODULES[shown].cost;

  return (
    <section className="panel p-3" aria-label="Будівництво">
      <h2 className={`${H2} mb-2`}>Будівництво</h2>
      <div className="grid grid-cols-3 gap-2">
        {MODULE_TYPES.map((type, i) => {
          const info = MODULES[type];
          const active = building === type;
          const blocked = disabled || parts < info.cost;
          return (
            <button
              key={type}
              aria-pressed={active}
              aria-disabled={blocked}
              onClick={() => !blocked && onPick(active ? null : type)}
              onMouseEnter={() => setHovered(type)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(type)}
              onBlur={() => setHovered(null)}
              className={`relative flex flex-col items-center rounded-xl border px-1 pb-1.5 pt-2 text-center transition ${
                active
                  ? 'border-orange-400 bg-orange-500/15 shadow-[0_0_14px_-2px] shadow-orange-500/60'
                  : 'border-white/10 bg-slate-950/40'
              } ${blocked ? 'opacity-45' : active ? '' : 'hover:border-slate-400 hover:bg-slate-800/70'}`}
            >
              <img src={spriteUrl(type)} alt="" draggable={false} className="h-12 w-12 drop-shadow-[0_2px_2px_rgba(0,0,0,.5)]" />
              <span className="mt-1 flex min-h-[2.4em] items-center text-[11.5px] font-semibold leading-[1.2] text-slate-100">{info.name}</span>
              <span className="mt-0.5 inline-flex items-center gap-1 rounded-md bg-slate-800/80 px-1.5 py-px text-xs font-semibold tabular-nums text-slate-200">
                <Icon name="nut" className="h-3 w-3 text-slate-400" strokeWidth={2.5} />
                {info.cost}
              </span>
              <kbd className="absolute left-1.5 top-1.5 hidden rounded bg-slate-800 px-1 text-[10px] font-semibold text-slate-400 lg:block">
                {i + 1}
              </kbd>
            </button>
          );
        })}
      </div>
      <p className="mt-2 min-h-[3.4em] text-xs leading-snug text-slate-400">
        {shown ? (
          <>
            {MODULES[shown].description}
            {lacks && <span className="text-rose-300"> Бракує запчастин.</span>}
          </>
        ) : (
          'Обери модуль, а потім вільну ділянку на мапі.'
        )}
      </p>
    </section>
  );
}
