import { useState } from 'react';
import type { Action, GameState } from '../shared/types';
import { diffState, hasChanges, type ChangePulse } from './changes';
import { engine } from './engine';

export interface SolBannerInfo {
  id: number;
  sol: number;
  isNight: boolean;
  phaseChanged: boolean;
}

/** Тримає стан гри. Змінює його тільки через reduce() з рушія. */
export function useGame() {
  const [state, setState] = useState<GameState>(() => engine.newGame(1));
  const [banner, setBanner] = useState<SolBannerInfo | null>(null);
  const [pulse, setPulse] = useState<ChangePulse | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  /** Застосовує дію. Повертає новий стан або null, якщо рушій дію відхилив. */
  const dispatch = (action: Action): GameState | null => {
    let next: GameState;
    try {
      next = engine.reduce(state, action);
    } catch {
      setNotice('Цю дію зараз виконати не можна.');
      return null;
    }
    if (next.sol !== state.sol) {
      setBanner((prev) => ({
        id: (prev?.id ?? 0) + 1,
        sol: next.sol,
        isNight: next.isNight,
        phaseChanged: next.isNight !== state.isNight,
      }));
    }
    const values = diffState(state, next);
    if (hasChanges(values)) setPulse((prev) => ({ id: (prev?.id ?? 0) + 1, values }));
    setState(next);
    setNotice(null);
    return next;
  };

  /** Завантажити готовий стан (мок або нова гра). */
  const load = (next: GameState) => {
    setState(next);
    setBanner(null);
    setPulse(null);
    setNotice(null);
  };

  const restart = () => load(engine.newGame(Date.now() % 2147483647));

  return { state, banner, pulse, notice, dispatch, load, restart };
}
