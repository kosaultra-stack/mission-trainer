import type { ModuleType, ResourceId } from '../shared/types';
import type { IconName } from './icons';

/** Лише оформлення: підписи, іконки, кольори. Жодної ігрової логіки. */

export const GRID_W = 8;
export const GRID_H = 6;

export const MODULE_TYPES: ModuleType[] = ['solar', 'battery', 'habitat', 'greenhouse', 'recycler', 'shield', 'reactor', 'printer', 'hub'];

/** Шлях до спрайта модуля з public/sprites (враховує base з vite.config). */
export const spriteUrl = (type: ModuleType) => `${import.meta.env.BASE_URL}sprites/${type}.svg`;

export type GaugeId = ResourceId | 'radiation';

export const GAUGE_LOOK: Record<GaugeId, { label: string; icon: IconName; chip: string; bar: string }> = {
  power: { label: 'Енергія', icon: 'bolt', chip: 'bg-amber-400/15 text-amber-300', bar: 'from-amber-500 to-yellow-300' },
  life: { label: 'Життє\u00ADзабезпечення', icon: 'heart', chip: 'bg-sky-400/15 text-sky-300', bar: 'from-sky-500 to-cyan-300' },
  food: { label: 'Їжа', icon: 'leaf', chip: 'bg-lime-400/15 text-lime-300', bar: 'from-green-500 to-lime-300' },
  radiation: { label: 'Радіація', icon: 'radiation', chip: 'bg-fuchsia-400/15 text-fuchsia-300', bar: 'from-fuchsia-600 to-rose-400' },
};

/** Пороги лише для підсвічування в інтерфейсі; правила гри визначає рушій. */
export const LOW_RESOURCE = 25;
export const HIGH_RADIATION = 70;

export const isDanger = (id: GaugeId, value: number) =>
  id === 'radiation' ? value >= HIGH_RADIATION : value <= LOW_RESOURCE;

/** Заголовок секції на панелі. */
export const H2 = 'text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400';
