import type { GameState } from '../shared/types';

/** Початок гри: перший сол, день, пара модулів. */
export const startState: GameState = {
  sol: 1,
  maxSol: 30,
  isNight: false,
  resources: { power: 80, life: 80, food: 80 },
  radiation: 5,
  parts: 10,
  modules: [
    { id: 'm1', type: 'habitat', x: 3, y: 2, on: true },
    { id: 'm2', type: 'solar', x: 4, y: 2, on: true },
  ],
  pendingEvent: null,
  status: 'playing',
  log: ['Сол 1: базу розгорнуто.'],
};

/** Місячна ніч, висить подія з вибором. */
export const nightEventState: GameState = {
  sol: 16,
  maxSol: 30,
  isNight: true,
  resources: { power: 35, life: 60, food: 45 },
  radiation: 40,
  parts: 3,
  modules: [
    { id: 'm1', type: 'habitat', x: 3, y: 2, on: true },
    { id: 'm2', type: 'solar', x: 4, y: 2, on: true },
    { id: 'm3', type: 'solar', x: 5, y: 2, on: true },
    { id: 'm4', type: 'battery', x: 3, y: 3, on: true },
    { id: 'm5', type: 'greenhouse', x: 2, y: 2, on: true },
    { id: 'm6', type: 'recycler', x: 2, y: 3, on: false },
  ],
  pendingEvent: {
    id: 'solar-flare',
    title: 'Сонячний спалах',
    text: 'Датчики фіксують потужний спалах на Сонці. За годину радіація різко зросте.',
    choices: [
      { id: 'hide', label: 'Сховатися в житловому модулі', hint: 'Радіації менше, але оранжерея без нагляду' },
      { id: 'work', label: 'Продовжити роботу', hint: 'Їжа в порядку, але екіпаж отримає дозу' },
    ],
    factId: 'solar-flares',
  },
  status: 'playing',
  log: ['Сол 15: настала місячна ніч.', 'Сол 16: сонячний спалах!'],
};

/** Програш: закінчилася енергія вночі. */
export const lostState: GameState = {
  sol: 19,
  maxSol: 30,
  isNight: true,
  resources: { power: 0, life: 12, food: 20 },
  radiation: 55,
  parts: 0,
  modules: [
    { id: 'm1', type: 'habitat', x: 3, y: 2, on: true },
    { id: 'm2', type: 'solar', x: 4, y: 2, on: true },
    { id: 'm4', type: 'battery', x: 3, y: 3, on: false },
  ],
  pendingEvent: null,
  status: 'lost',
  lostReason: 'Енергія закінчилася посеред місячної ночі — системи життєзабезпечення вимкнулися.',
  log: ['Сол 18: акумулятор розряджено.', 'Сол 19: енергія на нулі. Місію провалено.'],
};

export const MOCK_STATES = { startState, nightEventState, lostState };
