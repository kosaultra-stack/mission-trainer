import { useState } from 'react';
import { changeTone, type ChangeId } from '../changes';

const TONE = {
  good: 'bg-emerald-400 text-emerald-950',
  bad: 'bg-rose-500 text-white',
  neutral: 'bg-slate-200 text-slate-900',
} as const;

/**
 * Спливає на мить після дії: на скільки щойно змінився показник.
 * Стоїть поверх сусідів (absolute), тож не зсуває верстку, і сама зникає, коли анімація скінчилась.
 */
export function ChangeChip({ id, value, className }: { id: ChangeId; value: number; className: string }) {
  const [done, setDone] = useState(false);
  if (done) return null;
  return (
    <span
      aria-hidden
      onAnimationEnd={() => setDone(true)}
      className={`anim-change pointer-events-none absolute z-10 rounded-md px-1.5 py-0.5 text-[11px] font-bold leading-none tabular-nums shadow-md shadow-black/40 ${TONE[changeTone(id, value)]} ${className}`}
    >
      {value > 0 ? '+' : '−'}
      {Math.abs(value)}
    </span>
  );
}
