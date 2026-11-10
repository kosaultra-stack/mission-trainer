import { describe, expect, it } from 'vitest';
import { newGame } from './index';

describe('newGame', () => {
  it('начинает игру с первого сола', () => {
    expect(newGame().sol).toBe(1);
  });
});
