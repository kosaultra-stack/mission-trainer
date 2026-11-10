import { MODULES } from '../../content/modules';
import type { GameState, ModuleType, PlacedModule } from '../../shared/types';
import { Icon } from '../icons';
import { GRID_H, GRID_W, spriteUrl } from '../look';
import type { SolBannerInfo } from '../useGame';
import { Sky } from './Sky';
import { SolBanner } from './SolBanner';
import { Surface } from './Surface';

interface Props {
  state: GameState;
  building: ModuleType | null;
  selectedId: string | null;
  canAct: boolean;
  banner: SolBannerInfo | null;
  onBuild: (x: number, y: number) => void;
  onSelect: (moduleId: string | null) => void;
  onToggle: (moduleId: string) => void;
  onCancelBuild: () => void;
}

const CELLS = Array.from({ length: GRID_W * GRID_H }, (_, i) => ({ x: i % GRID_W, y: Math.floor(i / GRID_W) }));

function ModuleCell({ module: m, night, selected, onSelect }: { module: PlacedModule; night: boolean; selected: boolean; onSelect: () => void }) {
  const info = MODULES[m.type];
  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${info.name}: ${m.on ? 'увімкнено' : 'вимкнено'}`}
      title={info.name}
      className="group relative flex items-center justify-center"
    >
      {night && m.on && (
        <span className="pointer-events-none absolute -inset-[30%] rounded-full bg-[radial-gradient(circle,rgba(253,230,138,.3),transparent_62%)]" />
      )}
      <span
        className={`absolute inset-[5%] rounded-[16%] border transition ${
          selected
            ? 'border-orange-300 bg-orange-400/20 shadow-[0_0_0_2px_rgba(251,146,60,.55)]'
            : 'border-white/15 bg-white/5 group-hover:border-white/50 group-hover:bg-white/10'
        }`}
      />
      <span className="anim-dust pointer-events-none absolute inset-[12%] rounded-full bg-slate-100/50" />
      <img
        src={spriteUrl(m.type)}
        alt=""
        draggable={false}
        className={`anim-pop relative h-[86%] w-[86%] drop-shadow-[0_3px_3px_rgba(0,0,0,.45)] transition duration-500 ${
          m.on ? (night ? 'brightness-90' : '') : 'opacity-55 grayscale'
        }`}
      />
      <span
        className={`absolute right-[11%] top-[11%] h-[9%] min-h-1.5 w-[9%] min-w-1.5 rounded-full ${
          m.on ? 'anim-led bg-lime-400 shadow-[0_0_6px_1px] shadow-lime-400/80' : 'bg-slate-500'
        }`}
      />
      {!m.on && (
        <span className="absolute bottom-[9%] rounded bg-slate-950/85 px-1 text-[8px] font-bold uppercase tracking-wide text-slate-300 sm:text-[9px]">
          вимк
        </span>
      )}
    </button>
  );
}

function EmptyCell({ x, y, building, canAct, onBuild }: { x: number; y: number; building: ModuleType | null; canAct: boolean; onBuild: () => void }) {
  const ready = building !== null && canAct;
  return (
    <button
      onClick={onBuild}
      disabled={!ready}
      tabIndex={ready ? 0 : -1}
      aria-label={building ? `Збудувати тут: ${MODULES[building].name} (ділянка ${x + 1}, ${y + 1})` : `Вільна ділянка ${x + 1}, ${y + 1}`}
      className={`group relative ${ready ? '' : '!cursor-default'}`}
    >
      {ready && (
        <>
          <span className="absolute inset-[5%] rounded-[16%] border border-dashed border-orange-200/45 bg-orange-300/5 transition group-hover:border-solid group-hover:border-orange-300 group-hover:bg-orange-400/20 group-focus-visible:border-orange-300" />
          <img
            src={spriteUrl(building)}
            alt=""
            draggable={false}
            className="absolute inset-[7%] h-[86%] w-[86%] opacity-0 transition group-hover:opacity-60 group-focus-visible:opacity-60"
          />
        </>
      )}
    </button>
  );
}

/** Картка обраного модуля: що він робить і вимикач. Стає з протилежного боку мапи, щоб не закривати модуль. */
function Inspector({ module: m, canAct, onToggle, onClose }: { module: PlacedModule; canAct: boolean; onToggle: () => void; onClose: () => void }) {
  const info = MODULES[m.type];
  return (
    <div
      role="dialog"
      aria-label={info.name}
      className={`anim-rise absolute inset-x-2 z-10 mx-auto flex max-w-xl items-center gap-2.5 rounded-xl border border-slate-500/70 bg-slate-900/95 p-2.5 shadow-2xl backdrop-blur sm:gap-3 ${
        m.y >= GRID_H / 2 ? 'top-2' : 'bottom-2'
      }`}
    >
      <img src={spriteUrl(m.type)} alt="" className={`h-12 w-12 shrink-0 sm:h-14 sm:w-14 ${m.on ? '' : 'opacity-60 grayscale'}`} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2">
          <h3 className="text-sm font-bold text-white">{info.name}</h3>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${m.on ? 'text-lime-300' : 'text-slate-400'}`}>
            {m.on ? '● Увімкнено' : '○ Вимкнено'}
          </span>
        </div>
        <p className="mt-0.5 text-[11px] leading-snug text-slate-400 sm:text-xs">{info.description}</p>
      </div>
      <button
        onClick={onToggle}
        disabled={!canAct}
        className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-bold transition disabled:opacity-40 ${
          m.on ? 'bg-slate-700 text-slate-100 hover:bg-slate-600' : 'bg-lime-400 text-slate-950 hover:bg-lime-300'
        }`}
      >
        <Icon name="power" className="h-4 w-4" />
        {m.on ? 'Вимкнути' : 'Увімкнути'}
      </button>
      <button onClick={onClose} aria-label="Закрити" className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white">
        <Icon name="close" className="h-4 w-4" />
      </button>
    </div>
  );
}

export function BaseMap({ state, building, selectedId, canAct, banner, onBuild, onSelect, onToggle, onCancelBuild }: Props) {
  const night = state.isNight;
  const byCell = new Map(state.modules.map((m) => [`${m.x},${m.y}`, m]));
  const selected = state.modules.find((m) => m.id === selectedId) ?? null;

  return (
    <div className="map-fit flex min-h-0 w-full flex-1 items-center justify-center">
      <div className="map-box relative overflow-hidden rounded-2xl border border-slate-600/60 bg-black shadow-2xl shadow-black/70">
        <Sky isNight={night} />

        <div className="absolute inset-x-0 bottom-0 h-[80%]">
          <Surface />
          <div
            className={`pointer-events-none absolute inset-0 bg-[#0a0f24] transition-opacity duration-1000 ${night ? 'opacity-[.78]' : 'opacity-0'}`}
          />
          <div
            className="absolute inset-0 grid"
            style={{ gridTemplateColumns: `repeat(${GRID_W}, 1fr)`, gridTemplateRows: `repeat(${GRID_H}, 1fr)` }}
          >
            {CELLS.map(({ x, y }) => {
              const m = byCell.get(`${x},${y}`);
              return m ? (
                <ModuleCell key={m.id} module={m} night={night} selected={m.id === selectedId} onSelect={() => onSelect(m.id === selectedId ? null : m.id)} />
              ) : (
                <EmptyCell key={`${x},${y}`} x={x} y={y} building={building} canAct={canAct} onBuild={() => onBuild(x, y)} />
              );
            })}
          </div>
          {selected && (
            <Inspector key={selected.id} module={selected} canAct={canAct} onToggle={() => onToggle(selected.id)} onClose={() => onSelect(null)} />
          )}
        </div>

        {building && (
          <div className="anim-rise absolute inset-x-0 top-2 z-10 flex justify-center px-2">
            <div className="flex items-center gap-2 rounded-full border border-orange-300/50 bg-slate-950/90 py-1 pl-3 pr-1 text-xs text-orange-100 shadow-lg">
              <Icon name="cursor" className="h-3.5 w-3.5 shrink-0 text-orange-300" />
              <span>
                Будуємо: <b>{MODULES[building].name.toLowerCase()}</b>. Обери вільну ділянку
              </span>
              <button onClick={onCancelBuild} className="rounded-full bg-slate-800 px-2 py-0.5 font-semibold text-slate-200 hover:bg-slate-700">
                Скасувати
              </button>
            </div>
          </div>
        )}

        {banner && <SolBanner key={banner.id} {...banner} />}
      </div>
    </div>
  );
}
