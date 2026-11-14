import type { ModuleType, PlacedModule, ResourceId } from '../shared/types';

/**
 * Усі числа балансу гри — в одному місці.
 * Рушій (src/sim) і події (src/content/events.ts) беруть значення тільки звідси.
 * Ціни модулів у запчастинах лежать у src/content/modules.ts.
 */

/** Зміна показників: ресурси, радіація, запчастини. */
export type Delta = Partial<Record<ResourceId | 'radiation' | 'parts', number>>;

export const BALANCE = {
  /** Тривалість місії та місячна ніч (соли включно). */
  maxSol: 30,
  nightFrom: 15,
  nightTo: 28,

  grid: { width: 8, height: 6 },

  start: {
    resources: { power: 80, life: 80, food: 80 },
    radiation: 0,
    parts: 10,
    modules: [
      { id: 'm1', type: 'habitat', x: 3, y: 2, on: true },
      { id: 'm2', type: 'solar', x: 4, y: 2, on: true },
    ] satisfies PlacedModule[],
  },

  /** Що відбувається щосола незалежно від модулів: екіпаж їсть і дихає, радіація накопичується, прибувають запчастини. */
  perSol: { life: -3, food: -5, radiation: 3, parts: 1 } satisfies Delta,

  /** Що дає й споживає кожен увімкнений модуль за сол — удень і вночі. */
  modules: {
    solar: { day: { power: 6 }, night: {} },
    battery: { day: { power: -1 }, night: { power: 4 } },
    habitat: { day: { power: -2 }, night: { power: -2 } },
    greenhouse: { day: { food: 7, power: -3 }, night: { food: 7, power: -4 } },
    recycler: { day: { life: 5, power: -2 }, night: { life: 5, power: -2 } },
    shield: { day: { radiation: -3, power: -1 }, night: { radiation: -3, power: -1 } },
  } satisfies Record<ModuleType, { day: Delta; night: Delta }>,

  events: {
    /** Імовірність події на початку нового сола: приблизно одна на 3–4 соли. */
    chance: 0.3,
    /** Сонячний спалах не раніше цього сола. */
    flareFromSol: 5,
  },

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
  } satisfies Record<string, Record<string, Delta>>,
};
