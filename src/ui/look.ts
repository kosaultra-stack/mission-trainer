import type { ModuleType, ResourceId } from '../shared/types';

/** Лише оформлення: підписи, іконки, кольори. Жодної ігрової логіки. */
export const RESOURCE_LOOK: Record<ResourceId, { label: string; icon: string; bar: string }> = {
  power: { label: 'Енергія', icon: '⚡', bar: 'bg-amber-400' },
  life: { label: 'Життєзабезпечення', icon: '🫁', bar: 'bg-sky-400' },
  food: { label: 'Їжа', icon: '🥔', bar: 'bg-lime-400' },
};

export const MODULE_LOOK: Record<ModuleType, { tile: string }> = {
  solar: { tile: 'bg-amber-500/25 border-amber-400/70' },
  battery: { tile: 'bg-yellow-500/20 border-yellow-300/70' },
  habitat: { tile: 'bg-slate-200/20 border-slate-100/70' },
  greenhouse: { tile: 'bg-lime-500/20 border-lime-400/70' },
  recycler: { tile: 'bg-sky-500/20 border-sky-400/70' },
  shield: { tile: 'bg-violet-500/25 border-violet-400/70' },
};

/** Шлях до спрайта модуля з public/sprites (враховує base з vite.config). */
export const spriteUrl = (type: ModuleType) => `${import.meta.env.BASE_URL}sprites/${type}.svg`;

export const GRID_W = 8;
export const GRID_H = 6;
