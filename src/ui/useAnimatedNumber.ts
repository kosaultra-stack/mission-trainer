import { useEffect, useRef, useState } from 'react';

const easeOut = (t: number) => 1 - (1 - t) ** 3;

/** Плавно «докручує» число до нового значення. Якщо увімкнено «менше руху» — змінює одразу. */
export function useAnimatedNumber(target: number, durationMs = 650): number {
  const [shown, setShown] = useState(target);
  const current = useRef(target);

  useEffect(() => {
    const from = current.current;
    if (from === target) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reduced ? 0 : durationMs;
    const startedAt = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const t = duration === 0 ? 1 : Math.min(1, (now - startedAt) / duration);
      const value = Math.round(from + (target - from) * easeOut(t));
      current.current = value;
      setShown(value);
      if (t < 1) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return shown;
}
