import { describe, expect, it } from 'vitest';
import type { GameState } from '../shared/types';
import { BALANCE } from './balance';
import { EVENTS, findEvent } from './events';

/** Багатий нічний стан, у якому можлива будь-яка подія. */
const rich: GameState = {
  sol: 20,
  maxSol: 30,
  isNight: true,
  resources: { power: 50, life: 50, food: 50 },
  radiation: 50,
  parts: 10,
  modules: (['habitat', 'solar', 'battery', 'greenhouse', 'recycler', 'shield'] as const).map((type, i) => ({ id: `m${i + 1}`, type, x: i, y: 0, on: true })),
  pendingEvent: null,
  status: 'playing',
  log: [],
};

const FACTS = ['night', 'power', 'life', 'food', 'radiation'];

/** Чи стало хоч щось гірше: менше ресурсу чи запчастин, більше радіації або вимкнувся модуль. */
function hasPrice(before: GameState, after: GameState): boolean {
  return (
    after.resources.power < before.resources.power ||
    after.resources.life < before.resources.life ||
    after.resources.food < before.resources.food ||
    after.parts < before.parts ||
    after.radiation > before.radiation ||
    after.modules.filter((m) => m.on).length < before.modules.filter((m) => m.on).length
  );
}

describe('події', () => {
  it('їх вісім, з унікальними id', () => {
    expect(EVENTS).toHaveLength(8);
    expect(new Set(EVENTS.map((def) => def.event.id)).size).toBe(8);
  });

  it('є всі обов’язкові', () => {
    for (const id of ['solar-flare', 'supply-drop', 'micrometeorite', 'air-leak', 'sick-crew', 'cold-battery']) {
      expect(findEvent(id)).toBeDefined();
    }
  });

  it.each(EVENTS.map((def) => [def.event.id, def] as const))('%s: 2–3 вибори, тема довідки, тексти', (_, def) => {
    const { event } = def;
    expect(event.choices.length).toBeGreaterThanOrEqual(2);
    expect(event.choices.length).toBeLessThanOrEqual(3);
    expect(FACTS).toContain(event.factId);
    expect(event.title.length).toBeGreaterThan(3);
    expect(event.text.length).toBeGreaterThan(20);
    expect(Object.keys(def.effects).sort()).toEqual(event.choices.map((c) => c.id).sort());
    for (const choice of event.choices) {
      expect(choice.label.length).toBeGreaterThan(3);
      expect(choice.hint.length).toBeGreaterThan(10);
    }
  });

  it.each(EVENTS.map((def) => [def.event.id, def] as const))('%s: кожен вибір має ціну й не змінює переданий стан', (_, def) => {
    for (const choice of def.event.choices) {
      const snapshot = JSON.stringify(rich);
      const after = def.effects[choice.id](rich);
      expect(JSON.stringify(rich)).toBe(snapshot);
      expect(hasPrice(rich, after), `${def.event.id}:${choice.id}`).toBe(true);
    }
  });

  it.each(EVENTS.map((def) => [def.event.id, def] as const))('%s: підказка називає ті самі числа, що й баланс', (id, def) => {
    const numbers = BALANCE.choices[id as keyof typeof BALANCE.choices] as Record<string, Record<string, number>>;
    for (const choice of def.event.choices) {
      for (const value of Object.values(numbers[choice.id])) {
        expect(choice.hint, `${id}:${choice.id}`).toContain(String(Math.abs(value)));
      }
    }
  });

  it('подія не стається, коли на її вибір бракує запчастин або немає потрібного модуля', () => {
    const poor = { ...rich, parts: 0 };
    expect(findEvent('micrometeorite')!.canHappen(poor)).toBe(false);
    expect(findEvent('air-leak')!.canHappen(poor)).toBe(false);
    expect(findEvent('cold-battery')!.canHappen(poor)).toBe(false);
    expect(findEvent('cold-battery')!.canHappen({ ...rich, isNight: false })).toBe(false);
    expect(findEvent('moon-dust')!.canHappen(rich)).toBe(false);
    expect(findEvent('moon-dust')!.canHappen({ ...rich, isNight: false })).toBe(true);
    expect(findEvent('solar-flare')!.canHappen({ ...rich, sol: 4 })).toBe(false);
  });

  it('мікрометеорит без ремонту вимикає одну сонячну панель', () => {
    const after = findEvent('micrometeorite')!.effects.leave(rich);
    expect(after.modules.find((m) => m.type === 'solar')?.on).toBe(false);
    expect(after.parts).toBe(rich.parts);
  });
});
