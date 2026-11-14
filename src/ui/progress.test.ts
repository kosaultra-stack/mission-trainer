import { describe, expect, it } from 'vitest';
import { mergeResult, parseProgress } from './progress';

describe('поступ по місіях', () => {
  it('запам’ятовує найкращий результат', () => {
    let p = mergeResult({}, 1, { won: false, stars: 1 });
    expect(p).toEqual({ 1: { won: false, stars: 1 } });
    p = mergeResult(p, 1, { won: true, stars: 2 });
    p = mergeResult(p, 1, { won: false, stars: 0 });
    expect(p[1]).toEqual({ won: true, stars: 2 });
    p = mergeResult(p, 3, { won: true, stars: 3 });
    expect(Object.keys(p)).toEqual(['1', '3']);
  });

  it('не змінює переданий об’єкт', () => {
    const before = { 1: { won: true, stars: 2 } };
    mergeResult(before, 1, { won: true, stars: 3 });
    expect(before).toEqual({ 1: { won: true, stars: 2 } });
  });

  it('читає збережене й відкидає сміття', () => {
    expect(parseProgress(null)).toEqual({});
    expect(parseProgress('не json')).toEqual({});
    expect(parseProgress('[1,2]')).toEqual({});
    expect(parseProgress('{"1":{"won":true,"stars":3},"2":{"won":"так"},"x":{"won":true,"stars":1},"3":{"won":false,"stars":9}}')).toEqual({
      1: { won: true, stars: 3 },
      3: { won: false, stars: 3 },
    });
  });
});
