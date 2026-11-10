import type { GameState } from '../shared/types';

/** Начало игры: первый сол, день, пара модулей. */
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
  log: ['Сол 1: база развёрнута.'],
};

/** Лунная ночь, висит событие с выбором. */
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
    title: 'Солнечная вспышка',
    text: 'Датчики фиксируют мощную вспышку на Солнце. Через час радиация резко вырастет.',
    choices: [
      { id: 'hide', label: 'Укрыться в жилом модуле', hint: 'Радиация меньше, но оранжерея без присмотра' },
      { id: 'work', label: 'Продолжить работу', hint: 'Еда в порядке, но экипаж получит дозу' },
    ],
    factId: 'solar-flares',
  },
  status: 'playing',
  log: ['Сол 15: наступила лунная ночь.', 'Сол 16: солнечная вспышка!'],
};

/** Проигрыш: кончилась энергия ночью. */
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
  lostReason: 'Энергия закончилась посреди лунной ночи — системы жизнеобеспечения отключились.',
  log: ['Сол 18: аккумулятор разряжен.', 'Сол 19: энергия на нуле. Миссия провалена.'],
};

export const MOCK_STATES = { startState, nightEventState, lostState };
