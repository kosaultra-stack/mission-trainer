import { describe, expect, it } from 'vitest';
import { demoEngine } from '../mocks/demoEngine';
import { startState } from '../mocks/states';
import { changeTone, diffState, hasChanges } from './changes';

describe('зміни після дії', () => {
  it('без змін — нічого показувати', () => {
    expect(hasChanges(diffState(startState, startState))).toBe(false);
    const toggled = demoEngine.reduce(startState, { type: 'toggle', moduleId: 'm2' });
    expect(hasChanges(diffState(startState, toggled))).toBe(false);
  });

  it('будівництво витрачає лише запчастини', () => {
    const built = demoEngine.reduce(startState, { type: 'build', module: 'battery', x: 0, y: 0 });
    expect(diffState(startState, built)).toEqual({ power: 0, life: 0, food: 0, radiation: 0, parts: -3 });
  });

  it('новий сол змінює ресурси', () => {
    const next = demoEngine.reduce(startState, { type: 'nextSol' });
    const changes = diffState(startState, next);
    expect(hasChanges(changes)).toBe(true);
    expect(changes.power).toBe(next.resources.power - startState.resources.power);
    expect(changes.radiation).toBe(next.radiation - startState.radiation);
  });

  it('радіація добра, коли падає; витрата запчастин нейтральна', () => {
    expect(changeTone('power', 4)).toBe('good');
    expect(changeTone('food', -3)).toBe('bad');
    expect(changeTone('radiation', 3)).toBe('bad');
    expect(changeTone('radiation', -4)).toBe('good');
    expect(changeTone('parts', 1)).toBe('good');
    expect(changeTone('parts', -3)).toBe('neutral');
  });
});
