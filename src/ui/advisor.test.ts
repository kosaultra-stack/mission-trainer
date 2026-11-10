import { describe, expect, it } from 'vitest';
import { lostState, nightEventState, startState } from '../mocks/states';
import { getAdvice } from './advisor';

const flat = { power: 0, life: 0, food: 0 };

describe('підказки центру керування', () => {
  it('усе добре — спокійна підказка', () => {
    expect(getAdvice(startState, flat, null).tone).toBe('ok');
  });

  it('попереджає, коли прогноз від’ємний', () => {
    const advice = getAdvice(startState, { power: 2, life: -3, food: -3 }, null);
    expect(advice.tone).toBe('warn');
    expect(advice.text).toContain('їжа');
  });

  it('б’є на сполох, коли ресурсу обмаль', () => {
    const low = { ...startState, resources: { power: 10, life: 80, food: 80 } };
    const advice = getAdvice(low, flat, null);
    expect(advice.tone).toBe('danger');
    expect(advice.text).toContain('Енергії');
  });

  it('пояснює подію, будівництво й ніч', () => {
    expect(getAdvice(nightEventState, flat, null).text).toContain('подія');
    expect(getAdvice(startState, flat, 'greenhouse').text).toContain('оранжерея');
    expect(getAdvice({ ...nightEventState, pendingEvent: null }, flat, null).text).toContain('ніч');
  });

  it('реагує на завершення гри', () => {
    expect(getAdvice(lostState, flat, null).tone).toBe('danger');
  });
});
