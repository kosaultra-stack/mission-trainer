import { describe, expect, it, vi } from 'vitest';
import { BALANCE } from '../content/balance';
import { EVENTS } from '../content/events';
import { startState } from '../mocks/states';
import type { Action, GameState, PlacedModule } from '../shared/types';
import { forecast, isNightSol, newGame, reduce, solDelta } from './index';
import { sensible } from './strategies';

const NEXT: Action = { type: 'nextSol' };

/** Стан без випадкових подій: зручно перевіряти самі правила. */
const calm = (patch: Partial<GameState> = {}): GameState => ({ ...newGame(1), ...patch });

const withModules = (...types: PlacedModule['type'][]): PlacedModule[] =>
  types.map((type, i) => ({ id: `m${i + 1}`, type, x: i, y: 0, on: true }));

const flare = EVENTS.find((def) => def.event.id === 'solar-flare')!.event;

/** Грає розумним ботом і збирає всі стани, через які пройшла гра. */
function trace(seed: number): GameState[] {
  const states = [newGame(seed)];
  let state = states[0];
  for (let step = 0; step < 500 && state.status === 'playing'; step++) {
    state = state.pendingEvent
      ? reduce(state, { type: 'choose', choiceId: state.pendingEvent.choices[0].id })
      : reduce(sensible(state), NEXT);
    states.push(state);
  }
  return states;
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

describe('newGame', () => {
  it('починає з першого сола, удень, зі стартовими запасами', () => {
    const s = newGame(7);
    expect(s).toMatchObject({ sol: 1, maxSol: 30, isNight: false, radiation: 0, parts: 10, status: 'playing', pendingEvent: null });
    expect(s.resources).toEqual({ power: 80, life: 80, food: 80 });
  });

  it('стартові модулі — як у мок-стані інтерфейсу', () => {
    expect(newGame().modules).toEqual(startState.modules);
  });

  it('стан ГПВЧ береться із seed', () => {
    expect(newGame(42).rng).toBe(42);
    expect(newGame(1).rng).not.toBe(newGame(2).rng);
  });
});

describe('будівництво', () => {
  it('ставить модуль, списує запчастини й пише в журнал', () => {
    const s = reduce(newGame(), { type: 'build', module: 'battery', x: 0, y: 0 });
    expect(s.modules).toHaveLength(3);
    expect(s.modules[2]).toEqual({ id: 'm3', type: 'battery', x: 0, y: 0, on: true });
    expect(s.parts).toBe(7);
    expect(s.log.at(-1)).toBe('Сол 1: збудовано — акумулятор.');
  });

  it('видає унікальні id: m1, m2, m3…', () => {
    let s = calm({ parts: 99 });
    for (let x = 0; x < 6; x++) s = reduce(s, { type: 'build', module: 'solar', x, y: 5 });
    const ids = s.modules.map((m) => m.id);
    expect(ids).toEqual(['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8']);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('не будує, коли бракує запчастин', () => {
    const poor = calm({ parts: 3 });
    expect(reduce(poor, { type: 'build', module: 'shield', x: 0, y: 0 })).toBe(poor);
  });

  it('не будує на зайнятій ділянці та поза сіткою 8×6', () => {
    const s = newGame();
    expect(reduce(s, { type: 'build', module: 'solar', x: 3, y: 2 })).toBe(s);
    for (const [x, y] of [[-1, 0], [8, 0], [0, -1], [0, 6], [1.5, 2]]) {
      expect(reduce(s, { type: 'build', module: 'solar', x, y })).toBe(s);
    }
    expect(reduce(s, { type: 'build', module: 'solar', x: 7, y: 5 })).not.toBe(s);
  });
});

describe('перемикання модулів', () => {
  it('вимикає й знову вмикає модуль', () => {
    const off = reduce(newGame(), { type: 'toggle', moduleId: 'm2' });
    expect(off.modules.find((m) => m.id === 'm2')?.on).toBe(false);
    const on = reduce(off, { type: 'toggle', moduleId: 'm2' });
    expect(on.modules.find((m) => m.id === 'm2')?.on).toBe(true);
  });

  it('невідомий moduleId нічого не змінює й не кидає помилок', () => {
    const s = newGame();
    expect(reduce(s, { type: 'toggle', moduleId: 'немає' })).toBe(s);
  });

  it('вимкнений модуль нічого не дає й не споживає', () => {
    const s = calm({ modules: withModules('habitat', 'solar', 'greenhouse') });
    const off = reduce(s, { type: 'toggle', moduleId: 'm3' });
    expect(solDelta(off).food).toBe(BALANCE.perSol.food);
    expect(solDelta(off).power).toBe(solDelta(s).power - BALANCE.modules.greenhouse.day.power);
  });
});

describe('наступний сол', () => {
  it('удень рахує за таблицею балансу', () => {
    const s = calm({ modules: withModules('habitat', 'solar', 'battery', 'greenhouse', 'recycler', 'shield') });
    expect(solDelta(s)).toEqual({ power: 6 - 1 - 2 - 3 - 2 - 1, life: -3 + 5, food: -5 + 7, radiation: 3 - 3, parts: 1 });
  });

  it('уночі панелі мовчать, акумулятор віддає заряд, оранжерея споживає більше', () => {
    const s = calm({ isNight: true, modules: withModules('habitat', 'solar', 'battery', 'greenhouse', 'recycler', 'shield') });
    expect(solDelta(s)).toEqual({ power: 0 + 4 - 2 - 4 - 2 - 1, life: -3 + 5, food: -5 + 7, radiation: 3 - 3, parts: 1 });
  });

  it('застосовує зміни й переходить на наступний сол', () => {
    const s = newGame();
    const next = reduce(s, NEXT);
    expect(next.sol).toBe(2);
    expect(next.resources).toEqual({ power: 80 + 6 - 2, life: 77, food: 75 });
    expect(next.radiation).toBe(3);
    expect(next.parts).toBe(11);
  });

  it('тримає ресурси й радіацію в межах 0..100', () => {
    const full = reduce(calm({ resources: { power: 99, life: 80, food: 80 } }), NEXT);
    expect(full.resources.power).toBe(100);
    const clean = reduce(calm({ modules: withModules('habitat', 'solar', 'shield', 'shield') }), NEXT);
    expect(clean.radiation).toBe(0);
  });

  it('день — соли 1–14, ніч — 15–28, світанок — 29–30', () => {
    expect([1, 14, 15, 28, 29, 30].map(isNightSol)).toEqual([false, false, true, true, false, false]);
    const dusk = reduce(calm({ sol: 14 }), NEXT);
    expect(dusk.isNight).toBe(true);
    expect(dusk.log).toContain('Сол 15: настала місячна ніч.');
    const dawn = reduce(calm({ sol: 28, isNight: true }), NEXT);
    expect(dawn.isNight).toBe(false);
    expect(dawn.log).toContain('Сол 29: світанок — Сонце повернулося.');
  });
});

describe('події', () => {
  const during = (): GameState => calm({ sol: 6, pendingEvent: flare });

  it('поки подія чекає на рішення, дозволено лише вибір', () => {
    const s = during();
    expect(reduce(s, NEXT)).toBe(s);
    expect(reduce(s, { type: 'build', module: 'solar', x: 0, y: 0 })).toBe(s);
    expect(reduce(s, { type: 'toggle', moduleId: 'm2' })).toBe(s);
  });

  it('вибір застосовує наслідок із контенту й знімає подію', () => {
    const s = during();
    const hid = reduce(s, { type: 'choose', choiceId: 'hide' });
    expect(hid.pendingEvent).toBeNull();
    expect(hid.resources.food).toBe(s.resources.food + BALANCE.choices['solar-flare'].hide.food);
    expect(hid.log.at(-1)).toBe('Сол 6: рішення — сховатися в укритті.');
    const worked = reduce(s, { type: 'choose', choiceId: 'work' });
    expect(worked.radiation).toBe(s.radiation + BALANCE.choices['solar-flare'].work.radiation);
  });

  it('невідомий choiceId і вибір без події нічого не змінюють', () => {
    const s = during();
    expect(reduce(s, { type: 'choose', choiceId: 'немає' })).toBe(s);
    const idle = newGame();
    expect(reduce(idle, { type: 'choose', choiceId: 'hide' })).toBe(idle);
  });

  it('наслідок вибору може призвести до поразки', () => {
    const s = reduce(calm({ sol: 6, radiation: 90, pendingEvent: flare }), { type: 'choose', choiceId: 'work' });
    expect(s.status).toBe('lost');
    expect(s.lostReason).toBe('Радіація сягнула смертельного рівня.');
  });

  it('на першому солі подій немає, сонячний спалах — не раніше п’ятого', () => {
    for (let seed = 1; seed <= 60; seed++) {
      const states = trace(seed);
      expect(states[0].pendingEvent).toBeNull();
      for (const s of states) {
        if (s.pendingEvent?.id === 'solar-flare') expect(s.sol).toBeGreaterThanOrEqual(BALANCE.events.flareFromSol);
      }
    }
  });

  it('трапляються приблизно раз на 3–4 соли й бувають різні', () => {
    let events = 0;
    let sols = 0;
    const seen = new Set<string>();
    for (let seed = 1; seed <= 60; seed++) {
      const states = trace(seed);
      sols += states.at(-1)!.sol - 1;
      for (let i = 1; i < states.length; i++) {
        const event = states[i].pendingEvent;
        if (event && !states[i - 1].pendingEvent) {
          events++;
          seen.add(event.id);
        }
      }
    }
    expect(sols / events).toBeGreaterThan(2.5);
    expect(sols / events).toBeLessThan(4.5);
    expect(seen.size).toBe(EVENTS.length);
  });
});

describe('кінець гри', () => {
  it.each([
    ['power', { power: 2, life: 80, food: 80 }, 0, 'Енергія закінчилася — системи бази вимкнулися.'],
    ['life', { power: 80, life: 3, food: 80 }, 0, 'Життєзабезпечення відмовило — екіпажу нічим дихати.'],
    ['food', { power: 80, life: 80, food: 5 }, 0, 'Їжа закінчилася — екіпаж не може продовжувати місію.'],
    ['radiation', { power: 80, life: 80, food: 80 }, 97, 'Радіація сягнула смертельного рівня.'],
  ])('поразка: %s', (_, resources, radiation, reason) => {
    const modules = withModules('habitat');
    const s = reduce(calm({ resources, radiation, modules }), NEXT);
    expect(s.status).toBe('lost');
    expect(s.lostReason).toBe(reason);
    expect(s.pendingEvent).toBeNull();
    expect(s.log.at(-1)).toBe('Сол 2: місію провалено.');
  });

  it('nextSol на 30-му солі — перемога', () => {
    const s = reduce(calm({ sol: 30 }), NEXT);
    expect(s.status).toBe('won');
    expect(s.sol).toBe(30);
    expect(s.log.at(-1)).toBe('Сол 30: місію виконано!');
  });

  it('після кінця гри стан більше не змінюється', () => {
    for (const status of ['won', 'lost'] as const) {
      const over = calm({ status });
      const actions: Action[] = [NEXT, { type: 'build', module: 'solar', x: 0, y: 0 }, { type: 'toggle', moduleId: 'm1' }, { type: 'choose', choiceId: 'hide' }];
      for (const action of actions) expect(reduce(over, action)).toBe(over);
    }
  });
});

describe('прогноз', () => {
  it('збігається з тим, що справді дає nextSol', () => {
    let checked = 0;
    for (let seed = 1; seed <= 20; seed++) {
      const states = trace(seed);
      for (let i = 1; i < states.length; i++) {
        const before = states[i - 1];
        const after = states[i];
        if (after.sol === before.sol) continue; // це був вибір у події або фінал
        // стратегія могла щось збудувати чи вимкнути перед nextSol — відтворюємо той самий стан
        const prepared = sensible(before);
        const predicted = forecast(prepared);
        expect(after.resources.power - prepared.resources.power).toBe(predicted.power);
        expect(after.resources.life - prepared.resources.life).toBe(predicted.life);
        expect(after.resources.food - prepared.resources.food).toBe(predicted.food);
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(400);
  });

  it('з isNight: true показує, що буде вночі', () => {
    const s = calm({ modules: withModules('habitat', 'solar', 'battery') });
    expect(forecast(s).power).toBe(6 - 1 - 2);
    expect(forecast({ ...s, isNight: true }).power).toBe(4 - 2);
  });

  it('враховує межі 0..100', () => {
    expect(forecast(calm({ resources: { power: 99, life: 80, food: 80 } })).power).toBe(1);
    expect(forecast(calm({ resources: { power: 80, life: 80, food: 2 } })).food).toBe(-2);
  });
});

describe('детермінізм і чистота', () => {
  it('той самий seed і ті самі дії дають ту саму гру', () => {
    expect(trace(123)).toEqual(trace(123));
  });

  it('різні seed дають різні ігри', () => {
    const story = (seed: number) => trace(seed).map((s) => `${s.sol}:${s.pendingEvent?.id ?? '-'}`).join(' ');
    const stories = new Set([1, 2, 3, 4, 5, 6, 7, 8].map(story));
    expect(stories.size).toBeGreaterThan(6);
  });

  it('не користується Math.random', () => {
    const spy = vi.spyOn(Math, 'random');
    trace(5);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('не змінює переданий стан', () => {
    let state = deepFreeze(newGame(9));
    for (let step = 0; step < 200 && state.status === 'playing'; step++) {
      const action: Action = state.pendingEvent ? { type: 'choose', choiceId: state.pendingEvent.choices[0].id } : NEXT;
      const prepared = state.pendingEvent ? state : deepFreeze(sensible(state));
      state = deepFreeze(reduce(prepared, action));
    }
    expect(state.status).not.toBe('playing');
  });

  it('не кидає помилок на некоректні дії', () => {
    const s = newGame();
    const junk = [{ type: 'щось' }, { type: 'build', module: 'палац', x: 0, y: 0 }, { type: 'toggle' }, { type: 'choose' }] as unknown as Action[];
    for (const action of junk) expect(reduce(s, action)).toBe(s);
  });
});
