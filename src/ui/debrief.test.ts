import { describe, expect, it } from 'vitest';
import type { GameState } from '../shared/types';
import { makeDebrief, timeline } from './debrief';

const base: GameState = {
  sol: 1,
  maxSol: 30,
  isNight: false,
  resources: { power: 80, life: 80, food: 80 },
  radiation: 0,
  parts: 10,
  modules: [],
  pendingEvent: null,
  status: 'playing',
  log: [],
};

const at = (sol: number, patch: Partial<GameState> = {}): GameState => ({ ...base, sol, ...patch });

describe('розбір місії', () => {
  it('фінальний стан замінює знімок того самого сола', () => {
    const history = [at(1), at(2), at(3)];
    const final = at(3, { status: 'lost' });
    const points = timeline(history, final);
    expect(points.map((p) => p.sol)).toEqual([1, 2, 3]);
    expect(points[2]).toBe(final);
  });

  it('програш уночі: урок про енергію вночі й повернення до ночі', () => {
    const history = [at(1), at(2), at(3), at(4, { isNight: true }), at(5, { isNight: true }), at(6, { isNight: true })];
    const final = at(6, { isNight: true, status: 'lost', resources: { power: 0, life: 60, food: 60 } });
    const d = makeDebrief(history, final);
    expect(d.stars).toBe(1);
    expect(d.lessons[0].text).toContain('Енергія впала до 0 на солі 6 — уночі');
    expect(d.lessons[0].topic).toBe('night');
    expect(d.rewindTo).toEqual([
      { sol: 3, label: 'На 3 соли назад (сол 3)' },
    ]);
  });

  it('пропонує повернутися за сол до ночі, якщо це інший сол', () => {
    const history = Array.from({ length: 10 }, (_, i) => at(i + 1, { isNight: i + 1 >= 4 }));
    const final = at(10, { isNight: true, status: 'lost', resources: { power: 0, life: 50, food: 50 } });
    const d = makeDebrief(history, final);
    expect(d.rewindTo.map((r) => r.sol)).toEqual([7, 3]);
  });

  it('перемога без проблем — три зірки й похвала', () => {
    const history = [at(1), at(2, { isNight: true }), at(3)];
    const final = at(3, { status: 'won' });
    const d = makeDebrief(history, final);
    expect(d.stars).toBe(3);
    expect(d.rewindTo).toEqual([]);
    expect(d.lessons.map((l) => l.tone)).toEqual(['good', 'good']);
  });

  it('перемога з високою радіацією — дві зірки', () => {
    const final = at(2, { status: 'won', radiation: 80 });
    const d = makeDebrief([at(1), at(2)], final);
    expect(d.stars).toBe(2);
    expect(d.lessons.some((l) => l.topic === 'radiation')).toBe(true);
  });
});
