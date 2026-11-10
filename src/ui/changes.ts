import type { GameState } from '../shared/types';
import type { GaugeId } from './look';

export type ChangeId = GaugeId | 'parts';
export type Changes = Record<ChangeId, number>;

/** Зміни після однієї дії. id зростає з кожною дією, щоб анімація запускалася знову. */
export interface ChangePulse {
  id: number;
  values: Changes;
}

/** Різниця між тим, що було на екрані, і тим, що повернув рушій. Лише для показу. */
export function diffState(prev: GameState, next: GameState): Changes {
  return {
    power: next.resources.power - prev.resources.power,
    life: next.resources.life - prev.resources.life,
    food: next.resources.food - prev.resources.food,
    radiation: next.radiation - prev.radiation,
    parts: next.parts - prev.parts,
  };
}

export const hasChanges = (changes: Changes) => Object.values(changes).some((v) => v !== 0);

/** Як підсвітити зміну: радіація добра, коли падає; витрата запчастин — нейтральна. */
export function changeTone(id: ChangeId, value: number): 'good' | 'bad' | 'neutral' {
  if (id === 'radiation') return value < 0 ? 'good' : 'bad';
  if (id === 'parts') return value > 0 ? 'good' : 'neutral';
  return value > 0 ? 'good' : 'bad';
}
