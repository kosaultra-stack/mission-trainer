import { describe, expect, it } from 'vitest';
import { isNightSol, levelRules } from '../content/balance';
import { expert, idle, noBatteries, play, sensible, type Strategy } from './strategies';

/** 30 різних seed. На подіях боти завжди обирають перший варіант. */
const SEEDS = Array.from({ length: 30 }, (_, i) => 1000 + i * 37);
const share = (flags: boolean[]) => flags.filter(Boolean).length / flags.length;
const wins = (bot: Strategy, level: number) => share(SEEDS.map((seed) => play(seed, bot, level).status === 'won'));

describe('баланс: рівень 1 «Перша ніч»', () => {
  it('а) «нічого не робити» — програє до 20-го сола в усіх seed', () => {
    for (const run of SEEDS.map((seed) => play(seed, idle))) {
      expect(run.status).toBe('lost');
      expect(run.sol).toBeLessThan(20);
    }
  });

  it('б) «без акумуляторів» — програє вночі щонайменше у 80% seed', () => {
    const runs = SEEDS.map((seed) => play(seed, noBatteries));
    const lostAtNight = share(runs.map((run) => run.status === 'lost' && isNightSol(levelRules(1), run.sol)));
    expect(lostAtNight).toBeGreaterThanOrEqual(0.8);
  });

  it('в) «розумна» старими модулями — виграє щонайменше у 80% seed', () => {
    expect(wins(sensible, 1)).toBeGreaterThanOrEqual(0.8);
  });

  it('г) «досвідчена» з новими модулями — теж виграє щонайменше у 80% seed', () => {
    expect(wins(expert, 1)).toBeGreaterThanOrEqual(0.8);
  });
});

describe.each([
  [2, 'Південний полюс'],
  [3, 'Довга вахта'],
])('баланс: рівень %i «%s»', (level) => {
  it('«нічого не робити» програє в усіх seed', () => {
    for (const seed of SEEDS) expect(play(seed, idle, level).status).toBe('lost');
  });

  it('старої тактики з першого рівня вже замало: виграє менш ніж у половині seed', () => {
    expect(wins(sensible, level)).toBeLessThan(0.5);
  });

  it('з новими модулями рівень прохідний: «досвідчена» виграє щонайменше у 80% seed', () => {
    expect(wins(expert, level)).toBeGreaterThanOrEqual(0.8);
  });
});
