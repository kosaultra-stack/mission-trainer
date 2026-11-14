import type { GameState } from '../../shared/types';
import { GAUGE_LOOK, type GaugeId } from '../look';

const W = 560;
const H = 170;
const PAD = { l: 26, r: 8, t: 8, b: 20 };

const SERIES: { id: GaugeId; color: string; dash?: string }[] = [
  { id: 'power', color: '#fbbf24' },
  { id: 'life', color: '#38bdf8' },
  { id: 'food', color: '#84cc16' },
  { id: 'radiation', color: '#e879f9', dash: '5 4' },
];

const value = (s: GameState, id: GaugeId) => (id === 'radiation' ? s.radiation : s.resources[id]);

/** Графік ресурсів по солах: нічні соли затінено, червона зона позначена. */
export function MissionChart({ points, maxSol }: { points: GameState[]; maxSol: number }) {
  const span = Math.max(maxSol, 2);
  const x = (sol: number) => PAD.l + ((sol - 1) / (span - 1)) * (W - PAD.l - PAD.r);
  const y = (v: number) => PAD.t + (1 - v / 100) * (H - PAD.t - PAD.b);
  const step = (W - PAD.l - PAD.r) / (span - 1);

  return (
    <figure className="rounded-xl bg-slate-950/50 p-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Графік ресурсів бази по солах">
        {/* Ніч */}
        {points
          .filter((p) => p.isNight)
          .map((p) => (
            <rect key={p.sol} x={x(p.sol) - step / 2} y={PAD.t} width={step} height={H - PAD.t - PAD.b} fill="#6366f1" opacity=".14" />
          ))}
        {/* Червона зона */}
        <rect x={PAD.l} y={y(25)} width={W - PAD.l - PAD.r} height={y(0) - y(25)} fill="#f43f5e" opacity=".08" />
        {[0, 50, 100].map((v) => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} stroke="#334155" strokeWidth="1" />
            <text x={PAD.l - 5} y={y(v) + 3} textAnchor="end" fontSize="10" fill="#64748b">
              {v}
            </text>
          </g>
        ))}
        {[1, Math.round(span / 2), span].map((sol, i) => (
          <text key={sol} x={x(sol)} y={H - 5} textAnchor={(['start', 'middle', 'end'] as const)[i]} fontSize="10" fill="#64748b">
            сол {sol}
          </text>
        ))}
        {SERIES.map(({ id, color, dash }) => (
          <polyline
            key={id}
            points={points.map((p) => `${x(p.sol)},${y(value(p, id))}`).join(' ')}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeDasharray={dash}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
      </svg>
      <figcaption className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 px-1 text-[11px] text-slate-400">
        {SERIES.map(({ id, color, dash }) => (
          <span key={id} className="inline-flex items-center gap-1">
            <svg width="16" height="6" aria-hidden>
              <line x1="0" x2="16" y1="3" y2="3" stroke={color} strokeWidth="2.5" strokeDasharray={dash ? '4 3' : undefined} />
            </svg>
            {GAUGE_LOOK[id].label.replace('­', '')}
          </span>
        ))}
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-3 rounded-sm bg-indigo-500/40" />
          Ніч
        </span>
      </figcaption>
    </figure>
  );
}
