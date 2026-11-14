import { describe, expect, it, vi } from 'vitest';
import { BALANCE, levelRules } from '../content/balance';
import { EVENTS } from '../content/events';
import { startState } from '../mocks/states';
import type { Action, GameState, PlacedModule } from '../shared/types';
import { forecast, newGame, reduce, solDelta } from './index';
import { expert, sensible, type Strategy } from './strategies';

const NEXT: Action = { type: 'nextSol' };

/** Стан без випадкових подій: зручно перевіряти самі правила. */
const calm = (patch: Partial<GameState> = {}): GameState => ({ ...newGame(1), ...patch });

const withModules = (...types: PlacedModule['type'][]): PlacedModule[] =>
  types.map((type, i) => ({ id: `m${i + 1}`, type, x: i, y: 0, on: true }));

const flare = EVENTS.find((def) => def.event.id === 'solar-flare')!.event;

/** Грає ботом і збирає всі стани, через які пройшла гра. */
function trace(seed: number, level = 1, bot: Strategy = sensible): GameState[] {
  const states = [newGame(seed, level)];
  let state = states[0];
  for (let step = 0; step < 1000 && state.status === 'playing'; step++) {
    state = state.pendingEvent
      ? reduce(state, { type: 'choose', choiceId: state.pendingEvent.choices[0].id })
      : reduce(bot(state), NEXT);
    states.push(state);
  }
  return states;
}

/** Номери солів, на яких з'явилася подія з таким id. */
const eventSols = (states: GameState[], id: string) =>
  states.filter((s, i) => s.pendingEvent?.id === id && !states[i - 1]?.pendingEvent).map((s) => s.sol);

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
    expect(solDelta(off).food).toBe(levelRules(1).perSol.food);
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
    for (const { sol, isNight } of trace(3)) expect(isNight, `сол ${sol}`).toBe(sol >= 15 && sol <= 28);
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
        if (s.pendingEvent?.id === 'solar-flare') expect(s.sol).toBeGreaterThanOrEqual(BALANCE.flareFromSol);
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
    // події реактора й принтера трапляються лише там, де ці модулі збудовано
    for (let seed = 1; seed <= 60; seed++) {
      for (const state of trace(seed, 3, expert)) if (state.pendingEvent) seen.add(state.pendingEvent.id);
    }
    expect([...seen].sort()).toEqual(EVENTS.map((def) => def.event.id).sort());
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
  it('збігається з тим, що справді дає nextSol, — на всіх рівнях', () => {
    let checked = 0;
    for (const level of [1, 2, 3]) {
      for (const bot of [sensible, expert]) {
        for (let seed = 1; seed <= 10; seed++) {
          const states = trace(seed, level, bot);
          for (let i = 1; i < states.length; i++) {
            const before = states[i - 1];
            const after = states[i];
            if (after.sol === before.sol) continue; // це був вибір у події або фінал
            // бот міг щось збудувати чи вимкнути перед nextSol — відтворюємо той самий стан
            const prepared = bot(before);
            const predicted = forecast(prepared);
            expect(after.resources.power - prepared.resources.power).toBe(predicted.power);
            expect(after.resources.life - prepared.resources.life).toBe(predicted.life);
            expect(after.resources.food - prepared.resources.food).toBe(predicted.food);
            checked++;
          }
        }
      }
    }
    expect(checked).toBeGreaterThan(1000);
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
    expect(trace(123, 3, expert)).toEqual(trace(123, 3, expert));
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

describe('нові модулі', () => {
  const at = (type: PlacedModule['type'], x: number, y: number, on = true): PlacedModule => ({ id: `${type}-${x}-${y}`, type, x, y, on });

  it('реактор дає енергію і вдень, і вночі, але додає радіації', () => {
    const base = calm({ modules: [] });
    const withReactor = calm({ modules: [at('reactor', 0, 0)] });
    for (const isNight of [false, true]) {
      const before = solDelta({ ...base, isNight });
      const after = solDelta({ ...withReactor, isNight });
      expect(after.power - before.power).toBe(5);
      expect(after.radiation - before.radiation).toBe(2);
    }
  });

  it('3D-принтер друкує запчастину щосола й споживає енергію', () => {
    const s = calm({ modules: [at('printer', 0, 0)] });
    expect(solDelta(s).parts).toBe(levelRules(1).perSol.parts! + 1);
    expect(solDelta(s).power).toBe(-2);
    expect(reduce(s, NEXT).parts).toBe(s.parts + 2);
  });

  it('енерговузол зменшує споживання сусідів зверху, знизу, ліворуч і праворуч', () => {
    const consumers = [at('habitat', 3, 2), at('greenhouse', 2, 3), at('recycler', 4, 3), at('shield', 3, 4)];
    const without = solDelta(calm({ modules: consumers })).power;
    const withHub = solDelta(calm({ modules: [...consumers, at('hub', 3, 3)] })).power;
    expect(withHub - without).toBe(4 * BALANCE.hubSaving);
  });

  it('енерговузол не діє по діагоналі, вимкнений і на тих, хто нічого не споживає', () => {
    const diagonal = [at('habitat', 2, 2), at('hub', 3, 3)];
    expect(solDelta(calm({ modules: diagonal })).power).toBe(solDelta(calm({ modules: [diagonal[0]] })).power);
    const off = [at('habitat', 3, 2), at('hub', 3, 3, false)];
    expect(solDelta(calm({ modules: off })).power).toBe(-2);
    const producers = [at('solar', 3, 2), at('reactor', 2, 3), at('hub', 3, 3)];
    expect(solDelta(calm({ modules: producers })).power).toBe(6 + 5);
  });

  it('економія не перевищує споживання модуля, а два вузли не складаються', () => {
    // щит споживає 1: з вузлом — 0, а не «плюс»
    expect(solDelta(calm({ modules: [at('shield', 3, 2), at('hub', 3, 3)] })).power).toBe(0);
    // акумулятор удень заряджається за 1: з вузлом — безкоштовно; уночі він віддає заряд, і вузол тут ні до чого
    const battery = [at('battery', 3, 2), at('hub', 3, 3)];
    expect(solDelta(calm({ modules: battery })).power).toBe(0);
    expect(solDelta(calm({ modules: battery, isNight: true })).power).toBe(4);
    // житловий модуль між двома вузлами все одно заощаджує лише раз
    const twoHubs = [at('habitat', 3, 2), at('hub', 3, 3), at('hub', 3, 1)];
    expect(solDelta(calm({ modules: twoHubs })).power).toBe(-2 + BALANCE.hubSaving);
  });

  it('нові модулі будуються за свою ціну', () => {
    let s = calm({ parts: 15 });
    s = reduce(s, { type: 'build', module: 'reactor', x: 0, y: 0 });
    s = reduce(s, { type: 'build', module: 'printer', x: 1, y: 0 });
    s = reduce(s, { type: 'build', module: 'hub', x: 2, y: 0 });
    expect(s.modules.slice(2).map((m) => m.type)).toEqual(['reactor', 'printer', 'hub']);
    expect(s.parts).toBe(15 - 8 - 4 - 3);
  });
});

describe('рівні', () => {
  it('newGame(seed, level) бере правила рівня; невідомий рівень — перший', () => {
    expect(newGame(1)).toMatchObject({ level: 1, maxSol: 30 });
    expect(newGame(1, 2)).toMatchObject({ level: 2, maxSol: 30, resources: { power: 40, life: 80, food: 80 } });
    expect(newGame(1, 3)).toMatchObject({ level: 3, maxSol: 45, parts: 12 });
    expect(newGame(1, 99).level).toBe(1);
    expect(newGame(1, 0).level).toBe(1);
  });

  it('стан без поля level грає за правилами першої місії', () => {
    const { level: _, ...legacy } = newGame(4);
    expect(solDelta(legacy)).toEqual(solDelta(newGame(4)));
    expect(reduce(legacy, NEXT).resources).toEqual(reduce(newGame(4), NEXT).resources);
  });

  it.each([1, 2, 3])('рівень %i: ночі настають за розкладом, про них пише журнал', (level) => {
    const rules = levelRules(level);
    const states = trace(11, level, expert);
    expect(states.at(-1)!.status).toBe('won');
    expect(states.at(-1)!.sol).toBe(rules.maxSol);
    for (const s of states) {
      const expected = rules.nights.some(([from, to]) => s.sol >= from && s.sol <= to);
      expect(s.isNight, `сол ${s.sol}`).toBe(expected);
    }
    const log = states.at(-1)!.log;
    for (const [from, to] of rules.nights) {
      expect(log).toContain(`Сол ${from}: настала місячна ніч.`);
      if (to < rules.maxSol) expect(log).toContain(`Сол ${to + 1}: світанок — Сонце повернулося.`);
    }
  });

  it('на полюсі сонячна панель дає менше, а на третьому рівні радіація росте швидше', () => {
    const solar = (level: number) => solDelta({ ...newGame(1, level), modules: withModules('solar') }).power;
    expect(solar(1)).toBe(6);
    expect(solar(2)).toBe(3);
    expect(solDelta(newGame(1, 1)).radiation).toBe(3);
    expect(solDelta(newGame(1, 3)).radiation).toBe(5);
  });

  it('на третьому рівні спалахи частіші, на другому частіше знаходять лід', () => {
    const total = (level: number, id: string) => {
      let n = 0;
      for (let seed = 1; seed <= 80; seed++) n += eventSols(trace(seed, level, expert), id).length;
      return n / levelRules(level).maxSol;
    };
    expect(total(3, 'solar-flare')).toBeGreaterThan(total(1, 'solar-flare') * 1.5);
    expect(total(2, 'crater-ice')).toBeGreaterThan(total(1, 'crater-ice') * 1.5);
  });
});
