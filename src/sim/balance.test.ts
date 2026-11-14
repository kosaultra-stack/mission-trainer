import { describe, expect, it } from 'vitest';
import { BALANCE } from '../content/balance';
import { idle, noBatteries, play, sensible } from './strategies';

/** 30 різних seed. На подіях боти завжди обирають перший варіант. */
const SEEDS = Array.from({ length: 30 }, (_, i) => 1000 + i * 37);
const share = (flags: boolean[]) => flags.filter(Boolean).length / flags.length;

describe('баланс', () => {
  it('а) «нічого не робити» — програє до 20-го сола в усіх seed', () => {
    const runs = SEEDS.map((seed) => play(seed, idle));
    for (const run of runs) {
      expect(run.status).toBe('lost');
      expect(run.sol).toBeLessThan(20);
    }
  });

  it('б) «без акумуляторів» — програє вночі щонайменше у 80% seed', () => {
    const runs = SEEDS.map((seed) => play(seed, noBatteries));
    const lostAtNight = share(runs.map((run) => run.status === 'lost' && run.sol >= BALANCE.nightFrom && run.sol <= BALANCE.nightTo));
    expect(lostAtNight).toBeGreaterThanOrEqual(0.8);
  });

  it('в) «розумна» — виграє щонайменше у 80% seed', () => {
    const runs = SEEDS.map((seed) => play(seed, sensible));
    expect(share(runs.map((run) => run.status === 'won'))).toBeGreaterThanOrEqual(0.8);
  });
});
