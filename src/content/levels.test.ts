import { describe, expect, it } from 'vitest';
import { BALANCE } from './balance';
import { isNightAt, levelInfo, LEVELS, nightAround } from './levels';
import { MODULES } from './modules';

describe('рівні', () => {
  it('їх три, складність зростає, у кожного є назва, місце, опис і порада', () => {
    expect(LEVELS.map((l) => l.id)).toEqual([1, 2, 3]);
    expect(LEVELS.map((l) => l.difficulty)).toEqual(['Легко', 'Середньо', 'Складно']);
    for (const level of LEVELS) {
      expect(level.name.length).toBeGreaterThan(3);
      expect(level.place.length).toBeGreaterThan(3);
      expect(level.description.length).toBeGreaterThan(30);
      expect(level.tip.length).toBeGreaterThan(20);
      expect(level.rules).toBe(BALANCE.levels[level.id]);
    }
  });

  it('ночі не перетинаються, ідуть по порядку й не виходять за межі місії', () => {
    for (const { rules } of LEVELS) {
      let last = 1;
      for (const [from, to] of rules.nights) {
        expect(from).toBeGreaterThan(last);
        expect(to).toBeGreaterThanOrEqual(from);
        expect(to).toBeLessThanOrEqual(rules.maxSol);
        last = to;
      }
      expect(rules.nights[0][0]).toBeGreaterThan(1);
    }
  });

  it('тексти порад називають справжній сол першої ночі', () => {
    expect(levelInfo(1).tip).toContain(`${levelInfo(1).rules.nights[0][0]}-го`);
    expect(levelInfo(2).tip).toContain(`${levelInfo(2).rules.nights[0][0]}-му`);
    expect(levelInfo(3).tip).toContain(`${levelInfo(3).rules.nights[0][0]}-му`);
  });

  it('levelInfo, isNightAt і nightAround розуміють невідомий рівень як перший', () => {
    expect(levelInfo(undefined).id).toBe(1);
    expect(levelInfo(42).id).toBe(1);
    expect(isNightAt(undefined, 15)).toBe(true);
    expect(isNightAt(2, 15)).toBe(true);
    expect(isNightAt(2, 10)).toBe(false);
    expect(nightAround(1, 3)).toEqual([15, 28]);
    expect(nightAround(2, 7)).toEqual([5, 9]);
    expect(nightAround(2, 10)).toEqual([14, 19]);
    expect(nightAround(1, 29)).toBeNull();
  });
});

describe('модулі', () => {
  it('їх дев’ять, у кожного є назва, ціна, опис і числа балансу', () => {
    const types = Object.keys(MODULES);
    expect(types).toHaveLength(9);
    expect(Object.keys(BALANCE.modules).sort()).toEqual([...types].sort());
    for (const info of Object.values(MODULES)) {
      expect(info.name.length).toBeGreaterThan(3);
      expect(info.cost).toBeGreaterThan(0);
      expect(info.description.length).toBeGreaterThan(20);
    }
  });

  it('опис енерговузла називає справжню економію', () => {
    expect(MODULES.hub.description).toContain(`на ${BALANCE.hubSaving} енергії менше`);
  });
});
