import { Icon } from '../icons';

interface Props {
  isLast: boolean;
  disabled: boolean;
  onClick: () => void;
  className?: string;
}

export function NextSolButton({ isLast, disabled, onClick, className = '' }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`items-center justify-center gap-2 rounded-xl bg-linear-to-b from-orange-400 to-orange-600 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-orange-600/30 transition hover:from-orange-300 hover:to-orange-500 active:translate-y-px disabled:from-slate-600 disabled:to-slate-700 disabled:text-slate-400 disabled:shadow-none ${className}`}
    >
      {isLast ? 'Завершити місію' : 'Наступний сол'}
      <Icon name={isLast ? 'flag' : 'play'} className="h-4 w-4" />
      <kbd className="hidden rounded bg-slate-950/20 px-1.5 text-[10px] font-semibold lg:block">N</kbd>
    </button>
  );
}
