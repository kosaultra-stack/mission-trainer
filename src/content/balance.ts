import type { ModuleType, PlacedModule, ResourceId } from '../shared/types';

/**
 * Усі числа балансу гри — в одному місці.
 * Рушій (src/sim) і події (src/content/events.ts) беруть значення тільки звідси.
 * Ціни модулів у запчастинах лежать у src/content/modules.ts.
 */

/** Зміна показників: ресурси, радіація, запчастини. */
export type Delta = Partial<Record<ResourceId | 'radiation' | 'parts', number>>;

/** Правила однієї місії (рівня). */
export interface LevelRules {
  maxSol: number;
  /** Ночі: проміжки солів [від, до] включно. Решта солів — день. */
  nights: [number, number][];
  start: {
    resources: Record<ResourceId, number>;
    radiation: number;
    parts: number;
    modules: PlacedModule[];
  };
  /** Що відбувається щосола незалежно від модулів: екіпаж їсть і дихає, радіація накопичується, прибувають запчастини. */
  perSol: Delta;
  /** Скільки енергії дає одна сонячна панель удень (залежить від висоти Сонця). */
  solarPower: number;
  /** Імовірність події на початку нового сола. */
  eventChance: number;
  /** Наскільки частіше (або рідше) трапляється подія на цьому рівні. Немає в списку — вага 1. */
  eventWeights: Record<string, number>;
}

const START_MODULES: PlacedModule[] = [
  { id: 'm1', type: 'habitat', x: 3, y: 2, on: true },
  { id: 'm2', type: 'solar', x: 4, y: 2, on: true },
];

const LEVEL_RULES: Record<number, LevelRules> = {
  /** 1. «Перша ніч»: два тижні сонця, потім два тижні темряви. */
  1: {
    maxSol: 30,
    nights: [[15, 28]],
    start: { resources: { power: 80, life: 80, food: 80 }, radiation: 0, parts: 10, modules: START_MODULES },
    perSol: { life: -3, food: -5, radiation: 3, parts: 1 },
    solarPower: 6,
    eventChance: 0.3,
    eventWeights: {},
  },
  /** 2. «Південний полюс»: Сонце низько, панелі слабші, а тіні гір раз у раз накривають базу. Поруч лід. */
  2: {
    maxSol: 30,
    nights: [[5, 9], [14, 19], [24, 28]],
    start: { resources: { power: 40, life: 80, food: 80 }, radiation: 0, parts: 10, modules: START_MODULES },
    perSol: { life: -3, food: -5, radiation: 3, parts: 1 },
    solarPower: 3,
    eventChance: 0.3,
    eventWeights: { 'crater-ice': 3 },
  },
  /** 3. «Довга вахта»: 45 солів, дві ночі й сезон сонячних бур. */
  3: {
    maxSol: 45,
    nights: [[8, 21], [36, 45]],
    start: { resources: { power: 80, life: 80, food: 80 }, radiation: 0, parts: 12, modules: START_MODULES },
    perSol: { life: -3, food: -5, radiation: 5, parts: 1 },
    solarPower: 6,
    eventChance: 0.33,
    eventWeights: { 'solar-flare': 3 },
  },
};

export const BALANCE = {
  grid: { width: 8, height: 6 },

  levels: LEVEL_RULES,

  /** Що дає й споживає кожен увімкнений модуль за сол — удень і вночі. Енергію сонячної панелі вдень задає рівень (solarPower). */
  modules: {
    solar: { day: {}, night: {} },
    battery: { day: { power: -1 }, night: { power: 4 } },
    habitat: { day: { power: -2 }, night: { power: -2 } },
    greenhouse: { day: { food: 7, power: -3 }, night: { food: 7, power: -4 } },
    recycler: { day: { life: 5, power: -2 }, night: { life: 5, power: -2 } },
    shield: { day: { radiation: -3, power: -1 }, night: { radiation: -3, power: -1 } },
    /** Реактор: стабільна енергія і вдень, і вночі, але додає радіації. */
    reactor: { day: { power: 5, radiation: 2 }, night: { power: 5, radiation: 2 } },
    /** 3D-принтер: друкує запчастини з реголіту. */
    printer: { day: { parts: 1, power: -2 }, night: { parts: 1, power: -2 } },
    /** Енерговузол сам нічого не дає — він зменшує споживання сусідів (див. hubSaving). */
    hub: { day: {}, night: {} },
  } satisfies Record<ModuleType, { day: Delta; night: Delta }>,

  /** На скільки менше енергії споживає модуль, що стоїть поруч з увімкненим енерговузлом (зверху, знизу, ліворуч, праворуч). */
  hubSaving: 1,

  /** Сонячний спалах не раніше цього сола. */
  flareFromSol: 5,

  /** Наслідки рішень у подіях: eventId → choiceId → зміна показників. */
  choices: {
    'solar-flare': { hide: { food: -8 }, work: { radiation: 15 } },
    'supply-drop': { parts: { parts: 4, power: -4 }, food: { food: 15, power: -4 } },
    micrometeorite: { repair: { parts: -2 }, leave: { power: -8 } },
    'air-leak': { patch: { parts: -2 }, seal: { life: -12 } },
    'sick-crew': { rest: { food: -8 }, work: { life: -10 } },
    'cold-battery': { heat: { power: -8 }, replace: { parts: -3 } },
    'moon-dust': { clean: { radiation: 6 }, wait: { power: -8 } },
    'crater-ice': { crew: { life: 12, radiation: 5 }, rover: { life: 12, power: -8 } },
    'reactor-heat': { throttle: { power: -10 }, vent: { radiation: 10 } },
    'printer-jam': { reheat: { power: -6 }, stop: { parts: -1 } },
  } satisfies Record<string, Record<string, Delta>>,
};

export const LEVEL_IDS = Object.keys(LEVEL_RULES).map(Number);

/** Правила рівня. Невідомий номер або його відсутність — перша місія. */
export const levelRules = (level?: number): LevelRules => LEVEL_RULES[level ?? 1] ?? LEVEL_RULES[1];

/** Чи припадає сол на ніч за правилами рівня. */
export const isNightSol = (rules: LevelRules, sol: number) => rules.nights.some(([from, to]) => sol >= from && sol <= to);
