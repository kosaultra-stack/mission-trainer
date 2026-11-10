import { Icon, type IconName } from '../icons';
import { Modal, PRIMARY_BTN } from './Modal';

const STEPS: { icon: IconName; tone: string; title: string; text: string }[] = [
  { icon: 'flag', tone: 'bg-orange-400/15 text-orange-300', title: 'Мета', text: 'Протримайся 30 солів. Сол — це одна доба на базі.' },
  {
    icon: 'bolt',
    tone: 'bg-amber-400/15 text-amber-300',
    title: 'Ресурси',
    text: 'Стеж за енергією, життєзабезпеченням та їжею — вони не повинні закінчитися. А радіація, навпаки, не має зростати.',
  },
  {
    icon: 'moon',
    tone: 'bg-indigo-400/15 text-indigo-300',
    title: 'День і ніч',
    text: 'Удень сонячні панелі дають енергію. Місячна ніч довга й темна — готуйся до неї заздалегідь.',
  },
  {
    icon: 'nut',
    tone: 'bg-slate-400/15 text-slate-200',
    title: 'Будівництво',
    text: 'Обери модуль на панелі й клацни вільну ділянку на мапі. Кожен модуль коштує запчастин.',
  },
  {
    icon: 'power',
    tone: 'bg-lime-400/15 text-lime-300',
    title: 'Керування модулями',
    text: 'Клацни модуль на мапі, щоб вимкнути або ввімкнути його. Так можна заощаджувати енергію.',
  },
  {
    icon: 'alert',
    tone: 'bg-rose-400/15 text-rose-300',
    title: 'Події',
    text: 'Іноді стаються несподіванки. Уважно читай і обирай рішення — кожне має наслідки.',
  },
];

export function HowToPlay({ onClose }: { onClose: () => void }) {
  return (
    <Modal label="Як грати" wide>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-300">Інструктаж</p>
      <h2 className="text-2xl font-black text-white">Як грати</h2>
      <ul className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {STEPS.map((step) => (
          <li key={step.title} className="rounded-xl border border-white/5 bg-slate-950/50 p-3">
            <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${step.tone}`}>
              <Icon name={step.icon} />
            </span>
            <h3 className="mt-2 font-bold text-slate-50">{step.title}</h3>
            <p className="mt-0.5 text-sm leading-snug text-slate-400">{step.text}</p>
          </li>
        ))}
      </ul>
      <p className="mt-4 rounded-xl bg-sky-400/10 px-3 py-2 text-sm text-sky-200">
        <b>Цікаво:</b> на Місяці небо чорне навіть удень, бо там немає повітря, яке розсіює сонячне світло.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="hidden text-xs text-slate-500 lg:block">
          Клавіші: <kbd className="rounded bg-slate-800 px-1">1</kbd>–<kbd className="rounded bg-slate-800 px-1">6</kbd> — модуль,{' '}
          <kbd className="rounded bg-slate-800 px-1">N</kbd> — наступний сол, <kbd className="rounded bg-slate-800 px-1">Esc</kbd> — скасувати
        </p>
        <button autoFocus onClick={onClose} className={`${PRIMARY_BTN} w-full sm:ml-auto sm:w-auto`}>
          Зрозуміло, полетіли!
        </button>
      </div>
    </Modal>
  );
}
