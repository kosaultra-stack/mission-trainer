import type { GameState, ModuleType, PlacedModule } from '../shared/types';
import type { Delta } from './balance';

/** Чисті помічники для наслідків: нічого не змінюють на місці, повертають новий стан. */

const clamp = (value: number) => Math.max(0, Math.min(100, value));

/** Застосовує зміну показників. Ресурси й радіація лишаються в межах 0..100, запчастини не йдуть у мінус. */
export function applyDelta(state: GameState, delta: Delta): GameState {
  return {
    ...state,
    resources: {
      power: clamp(state.resources.power + (delta.power ?? 0)),
      life: clamp(state.resources.life + (delta.life ?? 0)),
      food: clamp(state.resources.food + (delta.food ?? 0)),
    },
    radiation: clamp(state.radiation + (delta.radiation ?? 0)),
    parts: Math.max(0, state.parts + (delta.parts ?? 0)),
  };
}

/** Чи є хоч один увімкнений модуль цього типу. */
export const hasActive = (state: GameState, type: ModuleType) => state.modules.some((m) => m.type === type && m.on);

/** Вимикає перший увімкнений модуль цього типу (якщо такий є). */
export function turnOffFirst(state: GameState, type: ModuleType): GameState {
  const target = state.modules.find((m) => m.type === type && m.on);
  if (!target) return state;
  return { ...state, modules: state.modules.map((m) => (m === target ? { ...m, on: false } : m)) };
}

/** «+4» або «−8» — для чесних підказок у подіях. */
export const signed = (value: number) => (value > 0 ? `+${value}` : `−${Math.abs(value)}`);

/** Чи стоїть модуль упритул (зверху, знизу, ліворуч, праворуч) до ввімкненого енерговузла. */
export const nearActiveHub = (modules: PlacedModule[], module: PlacedModule) =>
  modules.some((hub) => hub.type === 'hub' && hub.on && Math.abs(hub.x - module.x) + Math.abs(hub.y - module.y) === 1);
