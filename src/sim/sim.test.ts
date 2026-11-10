import { describe, expect, it } from 'vitest';
import { newGame } from './index';

describe('newGame', () => {
  it('починає гру з першого сола', () => {
    expect(newGame().sol).toBe(1);
  });
});
