import { useState } from 'react';
import { reduce } from '../sim';
import type { Action, GameState } from '../shared/types';

/** Тримає стан гри. Змінює його тільки через reduce() з рушія. */
export function useGame(initial: GameState) {
  const [state, setState] = useState(initial);
  const [notice, setNotice] = useState<string | null>(null);

  const dispatch = (action: Action) => {
    try {
      setState(reduce(state, action));
      setNotice(null);
    } catch {
      setNotice('Рушій ще не готовий — дію не застосовано. Перемикайте моки вгорі.');
    }
  };

  /** Завантажити готовий стан (мок або нова гра). */
  const load = (next: GameState) => {
    setState(next);
    setNotice(null);
  };

  return { state, load, dispatch, notice };
}
