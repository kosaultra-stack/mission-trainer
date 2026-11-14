import type { IconName } from './icons';

/**
 * Наукова довідка: справжні факти NASA та наукових місій, що пояснюють,
 * чому в грі все працює саме так. Лише тексти й посилання, жодної ігрової логіки.
 */

export type ScienceId = 'power' | 'life' | 'food' | 'radiation' | 'night';

export interface ScienceTopic {
  title: string;
  icon: IconName;
  chip: string;
  /** Головний факт — коротко, для дітей 10–14 років. */
  fact: string;
  /** Як це пов'язано з грою. */
  inGame: string;
  source: { label: string; url: string };
}

export const SCIENCE_ORDER: ScienceId[] = ['night', 'power', 'life', 'food', 'radiation'];

export const SCIENCE: Record<ScienceId, ScienceTopic> = {
  night: {
    title: 'Місячна ніч',
    icon: 'moon',
    chip: 'bg-indigo-400/15 text-indigo-300',
    fact:
      'Місяць обертається дуже повільно, тож ніч у будь-якому місці триває близько двох земних тижнів. На сонці поверхня нагрівається приблизно до +127 °C, а в темряві охолоджується до −173 °C.',
    inGame:
      'Тому головне випробування гри — ніч. Поки світить Сонце, треба встигнути запасти енергію й підготувати базу до довгої темряви.',
    source: { label: 'NASA Science: Earth’s Moon — Facts', url: 'https://science.nasa.gov/moon/facts/' },
  },
  power: {
    title: 'Енергія',
    icon: 'bolt',
    chip: 'bg-amber-400/15 text-amber-300',
    fact:
      'Сонячні панелі в темряві не працюють, а акумуляторів на два тижні ночі потрібно дуже багато. Тому NASA розробляє невеликий ядерний реактор (Fission Surface Power), який даватиме не менше 40 кіловатів удень і вночі.',
    inGame:
      'Удень енергію дають сонячні панелі, вночі — лише те, що запасли акумулятори. Вимикай модулі, без яких можна обійтися, щоб заряду вистачило до світанку.',
    source: {
      label: 'NASA: Fission System to Power Exploration on the Moon’s Surface',
      url: 'https://www.nasa.gov/humans-in-space/fission-system-to-power-exploration-on-the-moons-surface-and-beyond/',
    },
  },
  life: {
    title: 'Життєзабезпечення',
    icon: 'heart',
    chip: 'bg-sky-400/15 text-sky-300',
    fact:
      'На Міжнародній космічній станції система життєзабезпечення ECLSS повертає в обіг 98% води: очищує навіть піт і вологу з дихання астронавтів. Що менше води й кисню треба везти з Землі, то довше може тривати місія.',
    inGame:
      'Система переробки підтримує повітря й воду для екіпажу. Без неї життєзабезпечення швидко закінчується, а для роботи вона потребує енергії.',
    source: {
      label: 'NASA: Water Recovery Milestone on the Space Station',
      url: 'https://www.nasa.gov/missions/station/iss-research/nasa-achieves-water-recovery-milestone-on-international-space-station',
    },
  },
  food: {
    title: 'Їжа',
    icon: 'leaf',
    chip: 'bg-lime-400/15 text-lime-300',
    fact:
      'Астронавти вже вирощують салат, капусту й інші рослини в камері Veggie на МКС. Замість Сонця рослинам світять червоні, сині та зелені світлодіоди — а отже, теплиця потребує енергії.',
    inGame:
      'Оранжерея дає їжу, але споживає енергію. Вночі це особливо відчутно: доводиться вирішувати, що важливіше — світло для рослин чи заряд для бази.',
    source: {
      label: 'NASA Science: Astronauts Plant Seed Pillows (VEG-03)',
      url: 'https://science.nasa.gov/directorates/smd/astronauts-plant-seed-pillows-in-new-space-agriculture-study/',
    },
  },
  radiation: {
    title: 'Радіація',
    icon: 'radiation',
    chip: 'bg-fuchsia-400/15 text-fuchsia-300',
    fact:
      'У Місяця немає ні щільної атмосфери, ні магнітного поля. Прилад місії Chang’e 4 виміряв на поверхні близько 1369 мікрозівертів на добу — приблизно у 200 разів більше, ніж на Землі, і в 2,6 раза більше, ніж на МКС.',
    inGame:
      'Радіація накопичується з кожним солом, а сонячні спалахи різко її підвищують. Радіаційний щит (наприклад, шар місячного ґрунту) захищає екіпаж.',
    source: {
      label: 'Science Advances: First measurements of the radiation dose on the lunar surface (2020)',
      url: 'https://www.science.org/doi/10.1126/sciadv.aaz1334',
    },
  },
};
