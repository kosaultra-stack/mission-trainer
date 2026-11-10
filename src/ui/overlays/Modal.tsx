import type { ReactNode } from 'react';

/** Спільна основа для вікон поверх гри. */
export function Modal({ label, tone = 'border-slate-600', wide, children }: { label: string; tone?: string; wide?: boolean; children: ReactNode }) {
  return (
    <div className="anim-fade fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/75 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal
        aria-label={label}
        className={`anim-rise my-auto w-full rounded-2xl border bg-slate-900 p-5 shadow-2xl shadow-black/70 sm:p-6 ${wide ? 'max-w-3xl' : 'max-w-md'} ${tone}`}
      >
        {children}
      </div>
    </div>
  );
}

export const PRIMARY_BTN =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-b from-orange-400 to-orange-600 px-5 py-2.5 font-bold text-slate-950 shadow-lg shadow-orange-600/30 transition hover:from-orange-300 hover:to-orange-500 active:translate-y-px';
export const SECONDARY_BTN =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-500 bg-slate-800/70 px-5 py-2.5 font-semibold text-slate-100 transition hover:border-slate-300 hover:bg-slate-700';
