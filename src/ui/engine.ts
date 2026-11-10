import { demoEngine } from '../mocks/demoEngine';
import type { Action, GameState, ResourceId } from '../shared/types';
import * as sim from '../sim';

export interface Engine {
  newGame(seed?: number): GameState;
  reduce(state: GameState, action: Action): GameState;
  forecast(state: GameState): Record<ResourceId, number>;
}

/** Чи готовий справжній рушій: жодна дія не кидає 'not implemented'. */
function simIsReady(): boolean {
  const probes: Action[] = [
    { type: 'nextSol' },
    { type: 'build', module: 'solar', x: 0, y: 0 },
    { type: 'toggle', moduleId: '-' },
    { type: 'choose', choiceId: '-' },
  ];
  try {
    const state = sim.newGame(1);
    sim.forecast(state);
    for (const action of probes) {
      try {
        sim.reduce(state, action);
      } catch (e) {
        if (e instanceof Error && /not implemented/i.test(e.message)) return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

/** true — справжній рушій ще не готовий, інтерфейс працює на демо-рушії з src/mocks. */
export const IS_DEMO = !simIsReady();

/** Єдина точка, через яку інтерфейс змінює стан і бере прогноз. */
export const engine: Engine = IS_DEMO ? demoEngine : sim;
