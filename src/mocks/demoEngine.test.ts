import { describe, expect, it } from 'vitest';
import { demoEngine } from './demoEngine';
import { startState } from './states';

const { newGame, reduce, forecast } = demoEngine;

describe('демо-рушій', () => {
  it('починає з першого сола й не псує мок-стан', () => {
    const s = newGame();
    expect(s.sol).toBe(1);
    expect(s).not.toBe(startState);
    reduce(s, { type: 'build', module: 'solar', x: 0, y: 0 });
    expect(startState.modules).toHaveLength(2);
  });

  it('будує модуль за запчастини й не будує на зайнятій ділянці', () => {
    const s = reduce(newGame(), { type: 'build', module: 'battery', x: 0, y: 0 });
    expect(s.modules).toHaveLength(3);
    expect(s.parts).toBe(7);
    expect(reduce(s, { type: 'build', module: 'solar', x: 0, y: 0 })).toBe(s);
  });

  it('не будує, коли бракує запчастин', () => {
    const poor = { ...newGame(), parts: 1 };
    expect(reduce(poor, { type: 'build', module: 'shield', x: 0, y: 0 })).toBe(poor);
  });

  it('перемикає модуль', () => {
    const s = reduce(newGame(), { type: 'toggle', moduleId: 'm2' });
    expect(s.modules.find((m) => m.id === 'm2')?.on).toBe(false);
  });

  it('наступний сол змінює ресурси так, як обіцяв прогноз', () => {
    const s = newGame();
    const f = forecast(s);
    const next = reduce(s, { type: 'nextSol' });
    expect(next.sol).toBe(2);
    expect(next.resources.power).toBe(s.resources.power + f.power);
    expect(next.resources.food).toBe(s.resources.food + f.food);
  });

  it('показує подію і чекає на рішення', () => {
    let s = newGame();
    while (!s.pendingEvent) s = reduce(s, { type: 'nextSol' });
    expect(s.sol).toBe(6);
    expect(reduce(s, { type: 'nextSol' })).toBe(s);
    const after = reduce(s, { type: 'choose', choiceId: 'parts' });
    expect(after.pendingEvent).toBeNull();
    expect(after.parts).toBe(s.parts + 4);
  });

  it('на 15-й сол настає ніч', () => {
    let s = { ...newGame(), sol: 14, resources: { power: 100, life: 100, food: 100 } };
    s = reduce(s, { type: 'nextSol' });
    expect(s.isNight).toBe(true);
  });

  it('гра завершується поразкою, коли ресурс вичерпано', () => {
    const s = reduce({ ...newGame(), resources: { power: 80, life: 80, food: 2 } }, { type: 'nextSol' });
    expect(s.status).toBe('lost');
    expect(s.lostReason).toBeTruthy();
  });

  it('після останнього сола — перемога', () => {
    const s = reduce({ ...newGame(), sol: 30 }, { type: 'nextSol' });
    expect(s.status).toBe('won');
  });
});
