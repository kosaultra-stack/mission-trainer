import type { ModuleType, ResourceId } from '../shared/types';

/** Лише оформлення: підписи, іконки, кольори. Жодної ігрової логіки. */
export const RESOURCE_LOOK: Record<ResourceId, { label: string; icon: string; bar: string }> = {
  power: { label: 'Енергія', icon: '⚡', bar: 'bg-amber-400' },
  life: { label: 'Життєзабезпечення', icon: '🫁', bar: 'bg-sky-400' },
  food: { label: 'Їжа', icon: '🥔', bar: 'bg-lime-400' },
};

export const MODULE_LOOK: Record<ModuleType, { icon: string; tile: string }> = {
  solar: { icon: '☀️', tile: 'bg-amber-500/25 border-amber-400/70' },
  battery: { icon: '🔋', tile: 'bg-yellow-500/20 border-yellow-300/70' },
  habitat: { icon: '🏠', tile: 'bg-slate-200/20 border-slate-100/70' },
  greenhouse: { icon: '🌱', tile: 'bg-lime-500/20 border-lime-400/70' },
  recycler: { icon: '♻️', tile: 'bg-sky-500/20 border-sky-400/70' },
  shield: { icon: '🛡️', tile: 'bg-violet-500/25 border-violet-400/70' },
};

export const GRID_W = 8;
export const GRID_H = 6;
