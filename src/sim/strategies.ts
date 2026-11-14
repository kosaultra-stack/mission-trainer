import { BALANCE } from '../content/balance';
import { MODULES } from '../content/modules';
import type { GameState, ModuleType } from '../shared/types';
import { forecast, newGame, reduce } from './index';

/**
 * Прості боти для перевірки балансу. Грають лише через reduce/forecast, як справжній гравець.
 * На подіях завжди обирають перший варіант.
 */

export type Strategy = (state: GameState) => GameState;

const count = (state: GameState, type: ModuleType) => state.modules.filter((m) => m.type === type).length;

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

function setOn(state: GameState, type: ModuleType, on: boolean): GameState {
  let current = state;
  for (const m of state.modules) {
    if (m.type === type && m.on !== on) current = reduce(current, { type: 'toggle', moduleId: m.id });
  }
  return current;
}

/** а) Нічого не робити. */
export const idle: Strategy = (state) => state;

/** б) Без акумуляторів: лише оранжерея, переробка й сонячні панелі. */
export const noBatteries: Strategy = (state) =>
  state.isNight ? state : buildByPlan(state, [['greenhouse', 1], ['recycler', 1], ['solar', 6]]);

/** в) Розумна: до ночі — оранжерея, переробка, друга панель, акумулятори й щит; уночі вимикає зайве. */
export const sensible: Strategy = (state) => {
  if (!state.isNight) {
    const all = (['solar', 'battery', 'greenhouse', 'recycler', 'shield'] as const).reduce((s, type) => setOn(s, type, true), state);
    return buildByPlan(all, [
      ['greenhouse', 1],
      ['recycler', 1],
      ['solar', 2],
      ['battery', 2],
      ['shield', 1],
      ['battery', 3],
      ['solar', 3],
    ]);
  }
  // Уночі: якщо заряду не вистачить до світанку, вимикаємо те, без чого можна прожити.
  const left = BALANCE.nightTo - state.sol + 1;
  const reserve = 10;
  let current = (['greenhouse', 'recycler', 'shield'] as const).reduce((s, type) => setOn(s, type, true), state);
  const enough = (s: GameState) => s.resources.power + forecast(s).power * left > reserve;
  if (!enough(current) && current.radiation + BALANCE.perSol.radiation * (left + 2) < 90) current = setOn(current, 'shield', false);
  if (!enough(current) && current.resources.food + BALANCE.perSol.food * (left + 2) > reserve) current = setOn(current, 'greenhouse', false);
  if (!enough(current) && current.resources.life + BALANCE.perSol.life * (left + 2) > reserve) current = setOn(current, 'recycler', false);
  return current;
};

export interface Outcome {
  status: GameState['status'];
  sol: number;
  isNight: boolean;
  reason?: string;
}

/** Грає одну місію до кінця. */
export function play(seed: number, strategy: Strategy): Outcome {
  let state = newGame(seed);
  for (let step = 0; step < 500 && state.status === 'playing'; step++) {
    if (state.pendingEvent) {
      state = reduce(state, { type: 'choose', choiceId: state.pendingEvent.choices[0].id });
      continue;
    }
    state = reduce(strategy(state), { type: 'nextSol' });
  }
  return { status: state.status, sol: state.sol, isNight: state.isNight, reason: state.lostReason };
}
