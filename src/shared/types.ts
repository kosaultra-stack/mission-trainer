export type ResourceId = 'power' | 'life' | 'food';
export type ModuleType = 'solar' | 'battery' | 'habitat' | 'greenhouse' | 'recycler' | 'shield';
export interface PlacedModule { id: string; type: ModuleType; x: number; y: number; on: boolean; }
export interface EventChoice { id: string; label: string; hint: string; }
export interface GameEvent { id: string; title: string; text: string; choices: EventChoice[]; factId?: string; }
export interface GameState {
  sol: number; maxSol: number; isNight: boolean;
  resources: Record<ResourceId, number>;   // 0..100
  radiation: number;                       // 0..100
  parts: number;
  modules: PlacedModule[];                 // сітка 8x6: x 0..7, y 0..5
  pendingEvent: GameEvent | null;
  status: 'playing' | 'won' | 'lost';
  lostReason?: string;
  log: string[];
  rng?: number;                            // стан ГПВЧ рушія (mulberry32)
}
export type Action =
  | { type: 'build'; module: ModuleType; x: number; y: number }
  | { type: 'toggle'; moduleId: string }
  | { type: 'choose'; choiceId: string }
  | { type: 'nextSol' };
