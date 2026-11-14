/**
 * ГПВЧ mulberry32. Стан — одне 32-бітне число, яке лежить у GameState.rng.
 * Чиста функція: той самий стан завжди дає те саме число й той самий наступний стан.
 */
export function nextRandom(state: number): { state: number; value: number } {
  const next = (state + 0x6d2b79f5) | 0;
  let t = Math.imul(next ^ (next >>> 15), 1 | next);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return { state: next, value: ((t ^ (t >>> 14)) >>> 0) / 4294967296 };
}
