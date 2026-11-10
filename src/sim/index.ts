import type { Action, GameState, ResourceId } from '../shared/types';

/** Создаёт новую игру. seed — для детерминированной случайности. */
export function newGame(seed: number = 1): GameState {
  void seed; // TODO(sim): использовать seed для ГПСЧ
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
    log: ['Сол 1: база развёрнута.'],
  };
}

/** Чистая функция: применяет действие к состоянию и возвращает новое состояние. */
export function reduce(state: GameState, action: Action): GameState {
  void state;
  void action;
  throw new Error('not implemented');
}

/** Прогноз изменения ресурсов за следующий сол (дельты). */
export function forecast(state: GameState): Record<ResourceId, number> {
  void state;
  return { power: 0, life: 0, food: 0 };
}
