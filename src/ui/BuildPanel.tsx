import { MODULES } from '../content/modules';
import type { ModuleType } from '../shared/types';
import { spriteUrl } from './look';

const TYPES = Object.keys(MODULES) as ModuleType[];

interface Props {
  selected: ModuleType | null;
  onSelect: (t: ModuleType | null) => void;
}

export function BuildPanel({ selected, onSelect }: Props) {
  return (
    <section className="rounded-2xl border border-slate-700/80 bg-slate-900/80 p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">Будівництво</h2>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {TYPES.map((t) => {
          const info = MODULES[t];
          const active = selected === t;
          return (
            <li key={t}>
              <button
                onClick={() => onSelect(active ? null : t)}
                title={info.description}
                className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left transition ${
                  active ? 'border-orange-400 bg-orange-500/15' : 'border-slate-700 bg-slate-800/60 hover:border-slate-500'
                }`}
              >
                <img src={spriteUrl(t)} alt="" className="h-9 w-9 shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-100">{info.name}</span>
                  <span className="hidden text-xs text-slate-400 lg:block">{info.description}</span>
                </span>
                <span className="shrink-0 text-sm tabular-nums text-slate-300">🔧{info.cost}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {selected && <p className="mt-3 text-xs text-orange-200">Оберіть порожню ділянку на мапі.</p>}
    </section>
  );
}
