import type { Action, GameState, ResourceId } from '../shared/types';

/** Створює нову гру. seed — для детермінованої випадковості. */
export function newGame(seed: number = 1): GameState {
  void seed; // TODO(sim): використати seed для ГПВЧ
  return {
    sol: 1,
    maxSol: 30,
    isNight: false,
    resources: { power: 80, life: 80, food: 80 },
    radiation: 0,
    parts: 10,
    modules: [],
    pendingEvent: null,
    status: 'playing',
    log: ['Сол 1: базу розгорнуто.'],
  };
}

/** Чиста функція: застосовує дію до стану й повертає новий стан. */
export function reduce(state: GameState, action: Action): GameState {
  void state;
  void action;
  throw new Error('not implemented');
}

/** Прогноз зміни ресурсів за наступний сол (дельти). */
export function forecast(state: GameState): Record<ResourceId, number> {
  void state;
  return { power: 0, life: 0, food: 0 };
}
