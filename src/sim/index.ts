import { BALANCE, isNightSol, levelRules, type Delta } from '../content/balance';
import { applyDelta, nearActiveHub } from '../content/effects';
import { EVENTS, findEvent } from '../content/events';
import { MODULES } from '../content/modules';
import type { Action, GameEvent, GameState, ResourceId } from '../shared/types';
import { nextRandom } from './rng';

/**
 * Рушій гри: чисті функції без React і DOM.
 * Випадковість — лише через ГПВЧ, стан якого лежить у GameState.rng.
 */

const LOST_REASON = {
  power: 'Енергія закінчилася — системи бази вимкнулися.',
  life: 'Життєзабезпечення відмовило — екіпажу нічим дихати.',
  food: 'Їжа закінчилася — екіпаж не може продовжувати місію.',
  radiation: 'Радіація сягнула смертельного рівня.',
};

const DELTA_KEYS = ['power', 'life', 'food', 'radiation', 'parts'] as const;

/**
 * Єдиний розрахунок сола: на скільки зміняться показники за наступний nextSol
 * (без подій і без обмеження 0..100). Його використовують і nextSol, і forecast.
 * День чи ніч береться зі state.isNight, тож прогноз на ніч — це той самий стан з isNight: true.
 */
export function solDelta(state: GameState): Required<Delta> {
  const rules = levelRules(state.level);
  const total: Required<Delta> = { power: 0, life: 0, food: 0, radiation: 0, parts: 0 };
  for (const key of DELTA_KEYS) total[key] += rules.perSol[key] ?? 0;

  for (const module of state.modules) {
    if (!module.on) continue;
    const effect: Delta = BALANCE.modules[module.type][state.isNight ? 'night' : 'day'];
    for (const key of DELTA_KEYS) total[key] += effect[key] ?? 0;
    // Сонячна панель: скільки дає вдень — залежить від рівня (висоти Сонця).
    if (module.type === 'solar' && !state.isNight) total.power += rules.solarPower;
    // Енерговузол: сусідній модуль споживає менше (але не менше нуля).
    const use = -(effect.power ?? 0);
    if (use > 0 && nearActiveHub(state.modules, module)) total.power += Math.min(use, BALANCE.hubSaving);
  }
  return total;
}

function withLossCheck(state: GameState): GameState {
  const reason =
    state.resources.power <= 0 ? LOST_REASON.power
    : state.resources.life <= 0 ? LOST_REASON.life
    : state.resources.food <= 0 ? LOST_REASON.food
    : state.radiation >= 100 ? LOST_REASON.radiation
    : null;
  if (!reason) return state;
  return {
    ...state,
    status: 'lost',
    lostReason: reason,
    pendingEvent: null,
    log: [...state.log, `Сол ${state.sol}: місію провалено.`],
  };
}

/** Кидає кубик: чи буде подія цього сола і яка саме (з урахуванням ваги подій на рівні). Повертає й новий стан ГПВЧ. */
function rollEvent(state: GameState): { rng: number; event: GameEvent | null } {
  const rules = levelRules(state.level);
  const chance = nextRandom(state.rng ?? 0);
  if (chance.value >= rules.eventChance) return { rng: chance.state, event: null };
  const pick = nextRandom(chance.state);
  const possible = EVENTS.filter((def) => def.canHappen(state));
  const weight = (id: string) => rules.eventWeights[id] ?? 1;
  let ticket = pick.value * possible.reduce((sum, def) => sum + weight(def.event.id), 0);
  for (const def of possible) {
    ticket -= weight(def.event.id);
    if (ticket < 0) return { rng: pick.state, event: def.event };
  }
  return { rng: pick.state, event: null };
}

/**
 * Створює нову гру. Той самий seed і ті самі дії завжди дають ту саму гру.
 * level — номер місії (див. src/content/levels.ts); невідомий номер — перша місія.
 */
export function newGame(seed: number = 1, level: number = 1): GameState {
  const id = level in BALANCE.levels ? level : 1;
  const rules = levelRules(id);
  return {
    sol: 1,
    maxSol: rules.maxSol,
    isNight: isNightSol(rules, 1),
    resources: { ...rules.start.resources },
    radiation: rules.start.radiation,
    parts: rules.start.parts,
    modules: rules.start.modules.map((m) => ({ ...m })),
    pendingEvent: null,
    status: 'playing',
    log: ['Сол 1: базу розгорнуто.'],
    rng: seed | 0,
    level: id,
  };
}

function build(state: GameState, action: Extract<Action, { type: 'build' }>): GameState {
  const { module, x, y } = action;
  const info = MODULES[module];
  if (!info) return state;
  const { width, height } = BALANCE.grid;
  const inGrid = Number.isInteger(x) && Number.isInteger(y) && x >= 0 && x < width && y >= 0 && y < height;
  const free = !state.modules.some((m) => m.x === x && m.y === y);
  if (!inGrid || !free || state.parts < info.cost) return state;
  const lastId = state.modules.reduce((max, m) => Math.max(max, Number(m.id.slice(1)) || 0), 0);
  return {
    ...state,
    parts: state.parts - info.cost,
    modules: [...state.modules, { id: `m${lastId + 1}`, type: module, x, y, on: true }],
    log: [...state.log, `Сол ${state.sol}: збудовано — ${info.name.toLowerCase()}.`],
  };
}

function toggle(state: GameState, moduleId: string): GameState {
  if (!state.modules.some((m) => m.id === moduleId)) return state;
  return { ...state, modules: state.modules.map((m) => (m.id === moduleId ? { ...m, on: !m.on } : m)) };
}

function choose(state: GameState, choiceId: string): GameState {
  const event = state.pendingEvent;
  const choice = event?.choices.find((c) => c.id === choiceId);
  if (!event || !choice) return state;
  const effect = findEvent(event.id)?.effects[choice.id];
  const after = effect ? effect(state) : state;
  return withLossCheck({
    ...after,
    pendingEvent: null,
    log: [...state.log, `Сол ${state.sol}: рішення — ${choice.label.toLowerCase()}.`],
  });
}

function nextSol(state: GameState): GameState {
  if (state.sol >= state.maxSol) {
    return { ...state, status: 'won', log: [...state.log, `Сол ${state.sol}: місію виконано!`] };
  }
  const sol = state.sol + 1;
  const isNight = isNightSol(levelRules(state.level), sol);
  const log = [...state.log];
  if (isNight && !state.isNight) log.push(`Сол ${sol}: настала місячна ніч.`);
  if (!isNight && state.isNight) log.push(`Сол ${sol}: світанок — Сонце повернулося.`);

  const ticked = withLossCheck({ ...applyDelta(state, solDelta(state)), sol, isNight, log });
  const roll = rollEvent(ticked);
  if (ticked.status !== 'playing' || !roll.event) return { ...ticked, rng: roll.rng };
  return {
    ...ticked,
    rng: roll.rng,
    pendingEvent: roll.event,
    log: [...ticked.log, `Сол ${sol}: ${roll.event.title.toLowerCase()}!`],
  };
}

/** Чиста функція: застосовує дію до стану й повертає новий стан. Некоректна дія повертає той самий стан. */
export function reduce(state: GameState, action: Action): GameState {
  if (state.status !== 'playing') return state;
  if (state.pendingEvent && action.type !== 'choose') return state;
  switch (action.type) {
    case 'build':
      return build(state, action);
    case 'toggle':
      return toggle(state, action.moduleId);
    case 'choose':
      return choose(state, action.choiceId);
    case 'nextSol':
      return nextSol(state);
    default:
      return state;
  }
}

/**
 * Прогноз: на скільки зміняться ресурси за наступний nextSol, якщо не станеться події.
 * Це рівно ті самі дельти, що їх застосує nextSol (з урахуванням меж 0..100).
 */
export function forecast(state: GameState): Record<ResourceId, number> {
  const after = applyDelta(state, solDelta(state)).resources;
  return {
    power: after.power - state.resources.power,
    life: after.life - state.resources.life,
    food: after.food - state.resources.food,
  };
}
