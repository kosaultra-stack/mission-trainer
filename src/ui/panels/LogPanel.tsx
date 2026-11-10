import { H2 } from '../look';

const SOL_PREFIX = /^Сол (\d+):\s*(.*)$/;

export function LogPanel({ log }: { log: string[] }) {
  return (
    <section className="panel flex max-h-56 min-h-0 w-full flex-col p-3 lg:max-h-none" aria-label="Журнал місії">
      <h2 className={`${H2} mb-2`}>Журнал місії</h2>
      <ol className="scroll-thin min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
        {[...log].reverse().map((entry, i) => {
          const match = SOL_PREFIX.exec(entry);
          return (
            <li key={log.length - i} className={`flex items-start gap-2 text-xs leading-snug ${i === 0 ? 'text-slate-100' : 'text-slate-400'}`}>
              {match ? (
                <>
                  <span className="shrink-0 rounded bg-slate-800 px-1.5 py-px font-mono text-[10px] text-slate-300">С{match[1]}</span>
                  <span className="first-letter:uppercase">{match[2]}</span>
                </>
              ) : (
                <span>{entry}</span>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
