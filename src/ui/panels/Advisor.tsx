import type { Advice } from '../advisor';
import { RobotAvatar } from '../art';
import { H2 } from '../look';

const BORDER: Record<Advice['tone'], string> = {
  ok: 'border-l-emerald-400',
  info: 'border-l-sky-400',
  warn: 'border-l-amber-400',
  danger: 'border-l-rose-400',
};

/** Центр керування: робот-помічник підказує, на що звернути увагу. */
export function Advisor({ advice }: { advice: Advice }) {
  return (
    <section className={`panel flex items-start gap-3 border-l-4 p-3 transition-colors duration-500 ${BORDER[advice.tone]}`} aria-live="polite">
      <RobotAvatar tone={advice.tone} className="h-12 w-12 shrink-0" />
      <div className="min-w-0">
        <h2 className={`${H2} mb-1 [@media(max-height:820px)]:lg:hidden`}>Центр керування</h2>
        <p className="text-[13px] leading-snug text-slate-200">{advice.text}</p>
      </div>
    </section>
  );
}
