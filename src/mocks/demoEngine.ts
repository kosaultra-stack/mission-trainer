import { MODULES } from '../content/modules';
import type { Action, GameEvent, GameState, ModuleType, ResourceId } from '../shared/types';
import { solarFlareEvent, startState, supplyDropEvent } from './states';

/**
 * ДЕМО-рушій для верстки інтерфейсу, поки справжній рушій у src/sim не готовий.
 *
 * Правила навмисно найпростіші, без випадковості, і НЕ є балансом гри —
 * справжні правила пише власник src/sim. Інтерфейс сам перемикається на
 * справжній рушій, щойно reduce() перестане кидати 'not implemented'
 * (див. src/ui/engine.ts).
 */

const GRID_W = 8;
const GRID_H = 6;
const NIGHT_FROM = 15;
const NIGHT_TO = 28;

/** Події за розкладом: номер сола → подія. */
const SCHEDULE: Record<number, GameEvent> = { 6: supplyDropEvent, 16: solarFlareEvent };

const clamp = (v: number) => Math.max(0, Math.min(100, v));
const isNightSol = (sol: number) => sol >= NIGHT_FROM && sol <= NIGHT_TO;
const active = (s: GameState, type: ModuleType) => s.modules.filter((m) => m.type === type && m.on).length;

function deltas(s: GameState) {
  const consumers = active(s, 'habitat') + active(s, 'greenhouse') + active(s, 'recycler') + active(s, 'shield');
  return {
    power: (s.isNight ? active(s, 'battery') * 3 : active(s, 'solar') * 6) - consumers * 2,
    life: active(s, 'recycler') * 4 - active(s, 'habitat') * 3,
    food: active(s, 'greenhouse') * 4 - 3,
    radiation: 3 - active(s, 'shield') * 4,
  };
}

/** Наслідки рішень: `${eventId}:${choiceId}`. */
const EFFECTS: Record<string, (s: GameState) => Partial<GameState>> = {
  'solar-flare:hide': (s) => ({
    radiation: clamp(s.radiation + 5),
    resources: { ...s.resources, food: clamp(s.resources.food - 8) },
  }),
  'solar-flare:work': (s) => ({ radiation: clamp(s.radiation + 20) }),
  'supply-drop:parts': (s) => ({ parts: s.parts + 4 }),
  'supply-drop:food': (s) => ({ resources: { ...s.resources, food: clamp(s.resources.food + 15) } }),
};

function withLossCheck(s: GameState): GameState {
  const reason =
    s.resources.power <= 0 ? 'Енергія закінчилася — системи бази вимкнулися.'
    : s.resources.life <= 0 ? 'Життєзабезпечення відмовило — екіпажу нічим дихати.'
    : s.resources.food <= 0 ? 'Їжа закінчилася — екіпаж не може продовжувати місію.'
    : s.radiation >= 100 ? 'Радіація сягнула смертельного рівня.'
    : null;
  if (!reason) return s;
  return { ...s, status: 'lost', lostReason: reason, pendingEvent: null, log: [...s.log, `Сол ${s.sol}: місію провалено.`] };
}

function newGame(): GameState {
  return { ...startState, resources: { ...startState.resources }, modules: startState.modules.map((m) => ({ ...m })), log: [...startState.log] };
}

function reduce(state: GameState, action: Action): GameState {
  if (state.status !== 'playing') return state;

  switch (action.type) {
    case 'build': {
      if (state.pendingEvent) return state;
      const { module, x, y } = action;
      const { cost, name } = MODULES[module];
      const inGrid = x >= 0 && x < GRID_W && y >= 0 && y < GRID_H;
      const free = !state.modules.some((m) => m.x === x && m.y === y);
      if (!inGrid || !free || state.parts < cost) return state;
      const lastId = state.modules.reduce((max, m) => Math.max(max, Number(m.id.slice(1)) || 0), 0);
      return {
        ...state,
        parts: state.parts - cost,
        modules: [...state.modules, { id: `m${lastId + 1}`, type: module, x, y, on: true }],
        log: [...state.log, `Сол ${state.sol}: збудовано — ${name.toLowerCase()}.`],
      };
    }

    case 'toggle':
      return { ...state, modules: state.modules.map((m) => (m.id === action.moduleId ? { ...m, on: !m.on } : m)) };

    case 'choose': {
      const event = state.pendingEvent;
      const choice = event?.choices.find((c) => c.id === action.choiceId);
      if (!event || !choice) return state;
      const effect = EFFECTS[`${event.id}:${choice.id}`];
      return withLossCheck({
        ...state,
        ...(effect ? effect(state) : {}),
        pendingEvent: null,
        log: [...state.log, `Сол ${state.sol}: рішення — ${choice.label.toLowerCase()}.`],
      });
    }

    case 'nextSol': {
      if (state.pendingEvent) return state;
      if (state.sol >= state.maxSol) {
        return { ...state, status: 'won', log: [...state.log, `Сол ${state.sol}: місію виконано!`] };
      }
      const d = deltas(state);
      const sol = state.sol + 1;
      const isNight = isNightSol(sol);
      const event = SCHEDULE[sol] ?? null;
      const log = [...state.log];
      if (isNight && !state.isNight) log.push(`Сол ${sol}: настала місячна ніч.`);
      if (!isNight && state.isNight) log.push(`Сол ${sol}: світанок — Сонце повернулося.`);
      if (event) log.push(`Сол ${sol}: ${event.title.toLowerCase()}!`);
      return withLossCheck({
        ...state,
        sol,
        isNight,
        resources: {
          power: clamp(state.resources.power + d.power),
          life: clamp(state.resources.life + d.life),
          food: clamp(state.resources.food + d.food),
        },
        radiation: clamp(state.radiation + d.radiation),
        parts: state.parts + 1,
        pendingEvent: event,
        log,
      });
    }
  }
}

function forecast(state: GameState): Record<ResourceId, number> {
  const d = deltas(state);
  return { power: d.power, life: d.life, food: d.food };
}

export const demoEngine = { newGame, reduce, forecast };
