import { BALANCE, levelRules } from '../content/balance';
import { MODULES } from '../content/modules';
import type { GameState, ModuleType } from '../shared/types';
import { forecast, newGame, reduce, solDelta } from './index';

/**
 * Прості боти для перевірки балансу. Грають лише через reduce/forecast, як справжній гравець.
 * На подіях завжди обирають перший варіант.
 */

export type Strategy = (state: GameState) => GameState;

/** Модуль і ділянка, де його ставити. */
type Spot = [type: ModuleType, x: number, y: number];

const count = (state: GameState, type: ModuleType) => state.modules.filter((m) => m.type === type).length;

/** Скільки ще солів триватиме темрява, рахуючи цей. Удень — 0. */
function nightLeft(state: GameState): number {
  const night = levelRules(state.level).nights.find(([from, to]) => state.sol >= from && state.sol <= to);
  return night ? night[1] - state.sol + 1 : 0;
}

/** Будує модуль на першій вільній ділянці, якщо вистачає запчастин. */
function tryBuild(state: GameState, module: ModuleType): GameState {
  if (state.parts < MODULES[module].cost) return state;
  for (let y = 0; y < BALANCE.grid.height; y++) {
    for (let x = 0; x < BALANCE.grid.width; x++) {
      if (!state.modules.some((m) => m.x === x && m.y === y)) return reduce(state, { type: 'build', module, x, y });
    }
  }
  return state;
}

/** Будує за списком бажаного: перший пункт, якого ще бракує. Поки на нього не вистачає — чекає. */
function buildByPlan(state: GameState, plan: [ModuleType, number][]): GameState {
  let current = state;
  for (const [type, wanted] of plan) {
    while (count(current, type) < wanted) {
      const built = tryBuild(current, type);
      if (built === current) return current;
      current = built;
    }
  }
  return current;
}

/** Будує за кресленням: модулі на конкретних ділянках, по черзі. Поки на черговий не вистачає — чекає. */
function buildBySpots(state: GameState, spots: Spot[]): GameState {
  let current = state;
  for (const [module, x, y] of spots) {
    if (current.modules.some((m) => m.x === x && m.y === y)) continue;
    const built = reduce(current, { type: 'build', module, x, y });
    if (built === current) return current;
    current = built;
  }
  return current;
}

function setOn(state: GameState, type: ModuleType, on: boolean): GameState {
  let current = state;
  for (const m of state.modules) {
    if (m.type === type && m.on !== on) current = reduce(current, { type: 'toggle', moduleId: m.id });
  }
  return current;
}

const SWITCHABLE = ['solar', 'battery', 'greenhouse', 'recycler', 'shield', 'reactor', 'printer', 'hub'] as const;
const allOn = (state: GameState) => SWITCHABLE.reduce((s, type) => setOn(s, type, true), state);

/**
 * Економія: якщо заряду не вистачить на найближчі `left` солів, вимикає те, без чого можна прожити.
 * Спершу принтер, потім щит, оранжерею й переробку — але лише коли запасу вистачає.
 */
function conserve(state: GameState, left: number): GameState {
  const reserve = 10;
  const enough = (s: GameState) => s.resources.power + forecast(s).power * left > reserve;
  let current = state;
  if (!enough(current)) current = setOn(current, 'printer', false);
  if (!enough(current)) {
    const off = setOn(current, 'shield', false);
    if (off.radiation + solDelta(off).radiation * (left + 2) < 90) current = off;
  }
  if (!enough(current)) {
    const off = setOn(current, 'greenhouse', false);
    if (off.resources.food + solDelta(off).food * (left + 2) > reserve) current = off;
  }
  if (!enough(current)) {
    const off = setOn(current, 'recycler', false);
    if (off.resources.life + solDelta(off).life * (left + 2) > reserve) current = off;
  }
  return current;
}

/** а) Нічого не робити. */
export const idle: Strategy = (state) => state;

/** б) Без акумуляторів: лише оранжерея, переробка й сонячні панелі. */
export const noBatteries: Strategy = (state) =>
  state.isNight ? state : buildByPlan(state, [['greenhouse', 1], ['recycler', 1], ['solar', 6]]);

/** в) Розумна, лише старими модулями: оранжерея, переробка, панелі, акумулятори й щит; уночі вимикає зайве. */
export const sensible: Strategy = (state) => {
  if (state.isNight) return conserve(allOn(state), nightLeft(state));
  return buildByPlan(allOn(state), [
    ['greenhouse', 1],
    ['recycler', 1],
    ['solar', 2],
    ['battery', 2],
    ['shield', 1],
    ['battery', 3],
    ['solar', 3],
  ]);
};

/**
 * Креслення бази довкола енерговузлів. Стартові модулі: житловий (3,2) і панель (4,2).
 * Вузол A (3,3) обслуговує житловий модуль, оранжерею, переробку й щит; вузол B (5,3) — принтер та акумулятори.
 */
const SPOT = {
  hubA: ['hub', 3, 3], greenhouse: ['greenhouse', 2, 3], recycler: ['recycler', 4, 3], shield: ['shield', 3, 4],
  hubB: ['hub', 5, 3], printer: ['printer', 5, 2], battery1: ['battery', 6, 3], battery2: ['battery', 5, 4],
  hubC: ['hub', 2, 4], shield2: ['shield', 1, 4], battery3: ['battery', 2, 5],
  solar2: ['solar', 0, 0], solar3: ['solar', 1, 0], solar4: ['solar', 2, 0], solar5: ['solar', 3, 0], solar6: ['solar', 4, 0],
  reactor: ['reactor', 7, 5], reactor2: ['reactor', 6, 5],
} satisfies Record<string, Spot>;

const EXPERT_PLANS: Record<number, Spot[]> = {
  1: [SPOT.greenhouse, SPOT.recycler, SPOT.hubA, SPOT.solar2, SPOT.printer, SPOT.shield, SPOT.battery1, SPOT.battery2, SPOT.hubB, SPOT.solar3],
  2: [SPOT.greenhouse, SPOT.recycler, SPOT.hubA, SPOT.solar2, SPOT.solar3, SPOT.printer, SPOT.shield, SPOT.solar4, SPOT.battery1, SPOT.hubB, SPOT.battery2, SPOT.solar5],
  3: [SPOT.greenhouse, SPOT.recycler, SPOT.hubA, SPOT.shield, SPOT.solar2, SPOT.printer, SPOT.battery1, SPOT.hubB, SPOT.battery2, SPOT.shield2, SPOT.hubC, SPOT.reactor, SPOT.solar3],
};

/** г) Досвідчена: користується новими модулями — енерговузлами, 3D-принтером і реактором. */
export const expert: Strategy = (state) => {
  const built = buildBySpots(allOn(state), EXPERT_PLANS[state.level ?? 1] ?? EXPERT_PLANS[1]);
  return conserve(built, state.isNight ? nightLeft(state) : 2);
};

export interface Outcome {
  status: GameState['status'];
  sol: number;
  isNight: boolean;
  reason?: string;
}

/** Грає одну місію до кінця. */
export function play(seed: number, strategy: Strategy, level: number = 1): Outcome {
  let state = newGame(seed, level);
  for (let step = 0; step < 1000 && state.status === 'playing'; step++) {
    if (state.pendingEvent) {
      state = reduce(state, { type: 'choose', choiceId: state.pendingEvent.choices[0].id });
      continue;
    }
    state = reduce(strategy(state), { type: 'nextSol' });
  }
  return { status: state.status, sol: state.sol, isNight: state.isNight, reason: state.lostReason };
}
