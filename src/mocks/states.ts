import type { GameEvent, GameState } from '../shared/types';

/** Подія-заглушка: сонячний спалах. */
export const solarFlareEvent: GameEvent = {
  id: 'solar-flare',
  title: 'Сонячний спалах',
  text: 'Датчики фіксують потужний спалах на Сонці. За годину радіація різко зросте.',
  choices: [
    { id: 'hide', label: 'Сховатися в житловому модулі', hint: 'Радіації менше, але оранжерея без нагляду' },
    { id: 'work', label: 'Продовжити роботу', hint: 'Їжа в порядку, але екіпаж отримає дозу' },
  ],
  factId: 'solar-flares',
};

/** Подія-заглушка: вантажний корабель. */
export const supplyDropEvent: GameEvent = {
  id: 'supply-drop',
  title: 'Вантажний корабель',
  text: 'На орбіті — автоматичний вантажний корабель. Місця мало, тож він може скинути лише один контейнер.',
  choices: [
    { id: 'parts', label: 'Контейнер із запчастинами', hint: 'Більше деталей для будівництва' },
    { id: 'food', label: 'Контейнер із провізією', hint: 'Запас їжі для екіпажу' },
  ],
};

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
  pendingEvent: solarFlareEvent,
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

/** Перемога: база протрималася всі 30 солів. */
export const wonState: GameState = {
  sol: 30,
  maxSol: 30,
  isNight: false,
  resources: { power: 72, life: 64, food: 58 },
  radiation: 31,
  parts: 6,
  modules: [
    { id: 'm1', type: 'habitat', x: 3, y: 2, on: true },
    { id: 'm2', type: 'solar', x: 4, y: 2, on: true },
    { id: 'm3', type: 'solar', x: 5, y: 2, on: true },
    { id: 'm4', type: 'battery', x: 3, y: 3, on: true },
    { id: 'm5', type: 'greenhouse', x: 2, y: 2, on: true },
    { id: 'm6', type: 'recycler', x: 2, y: 3, on: true },
    { id: 'm7', type: 'shield', x: 4, y: 3, on: true },
    { id: 'm8', type: 'battery', x: 5, y: 3, on: true },
    { id: 'm9', type: 'solar', x: 6, y: 2, on: true },
  ],
  pendingEvent: null,
  status: 'won',
  log: ['Сол 29: світанок — Сонце повернулося.', 'Сол 30: місію виконано!'],
};

export const MOCK_STATES = { startState, nightEventState, lostState, wonState };
