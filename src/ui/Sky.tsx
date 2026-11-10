/** Небо над базою: зорі, Земля, Сонце вдень. День/ніч перемикається плавно. */
export function Sky({ isNight }: { isNight: boolean }) {
  return (
    <div className="relative h-24 overflow-hidden rounded-t-xl sm:h-28" aria-hidden>
      <div className="stars twinkle absolute inset-0 bg-slate-950" />
      <div className={`absolute inset-0 bg-gradient-to-b from-slate-900/0 to-slate-500/40 transition-opacity duration-1000 ${isNight ? 'opacity-0' : 'opacity-100'}`} />
      {/* Сонце */}
      <div
        className={`absolute left-[12%] h-12 w-12 rounded-full bg-amber-100 shadow-[0_0_40px_12px] shadow-amber-200/60 transition-all duration-1000 ${
          isNight ? 'top-full opacity-0' : 'top-4 opacity-100'
        }`}
      />
      {/* Земля */}
      <div className="absolute right-[14%] top-4 h-10 w-10 overflow-hidden rounded-full bg-sky-600 shadow-[0_0_18px_2px] shadow-sky-400/40">
        <div className="absolute -left-1 top-2 h-4 w-6 rounded-full bg-emerald-500/90" />
        <div className="absolute right-0 top-5 h-3 w-4 rounded-full bg-emerald-500/80" />
        <div className="absolute left-3 top-0 h-2 w-6 rounded-full bg-white/70" />
        <div className={`absolute inset-0 bg-slate-950/60 transition-transform duration-1000 ${isNight ? 'translate-x-1/3' : 'translate-x-full'}`} />
      </div>
      {/* Горизонт */}
      <svg className="absolute inset-x-0 bottom-0 h-10 w-full" viewBox="0 0 400 40" preserveAspectRatio="none">
        <path d="M0 40 V24 Q40 14 80 22 T170 18 Q210 8 250 20 T340 16 Q370 12 400 22 V40 Z" className={`transition-colors duration-1000 ${isNight ? 'fill-slate-800' : 'fill-slate-500'}`} />
        <path d="M0 40 V30 Q60 24 120 30 T260 28 T400 30 V40 Z" className={`transition-colors duration-1000 ${isNight ? 'fill-slate-900' : 'fill-slate-600'}`} />
      </svg>
    </div>
  );
}
