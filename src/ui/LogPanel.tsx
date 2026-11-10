export function LogPanel({ log }: { log: string[] }) {
  return (
    <section className="rounded-2xl border border-slate-700/80 bg-slate-900/80 p-4">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-400">Журнал місії</h2>
      <ol className="max-h-40 space-y-1 overflow-y-auto font-mono text-xs text-slate-300">
        {[...log].reverse().map((line, i) => (
          <li key={i} className={i === 0 ? 'text-slate-100' : ''}>› {line}</li>
        ))}
      </ol>
    </section>
  );
}
