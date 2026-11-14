import type { GameState, ResourceId } from '../shared/types';
import { HIGH_RADIATION, LOW_RESOURCE, type GaugeId } from './look';
import type { ScienceId } from './science';

/**
 * Розбір місії. Нічого не моделює — лише читає знімки станів, які вже повернув
 * рушій, і пояснює словами, що відбувалося.
 */

export interface Lesson {
  tone: 'good' | 'bad';
  text: string;
  tip?: string;
  topic?: ScienceId;
}

export interface Debrief {
  /** Знімок на кожен сол, останній — фінальний стан. */
  points: GameState[];
  stars: 0 | 1 | 2 | 3;
  lessons: Lesson[];
  /** Соли, до яких можна повернутися й спробувати інакше (від пізнішого до ранішого). */
  rewindTo: { sol: number; label: string }[];
}

const RESOURCES: ResourceId[] = ['power', 'life', 'food'];

const value = (s: GameState, id: GaugeId) => (id === 'radiation' ? s.radiation : s.resources[id]);

/** Знімки по солах + фінальний стан (він може бути в тому самому солі, що й останній знімок). */
export function timeline(history: GameState[], final: GameState): GameState[] {
  const points = history.filter((s) => s.sol < final.sol);
  return [...points, final];
}

/** Найгірший момент для показника: найменше значення ресурсу або найбільша радіація. */
function worst(points: GameState[], id: GaugeId) {
  let best = points[0];
  for (const p of points) {
    const v = value(p, id);
    if (id === 'radiation' ? v > value(best, id) : v < value(best, id)) best = p;
  }
  return { sol: best.sol, value: value(best, id), night: best.isNight };
}

const BAD_TEXT: Record<ResourceId, (v: number, sol: number, night: boolean) => Lesson> = {
  power: (v, sol, night) => ({
    tone: 'bad',
    text: `Енергія впала до ${v} на солі ${sol}${night ? ' — уночі' : ''}.`,
    tip: night
      ? 'Поки світить Сонце, будуй акумулятори й вимикай зайві модулі перед настанням ночі.'
      : 'Додай сонячних панелей або вимкни модулі, без яких можна обійтися.',
    topic: night ? 'night' : 'power',
  }),
  life: (v, sol) => ({
    tone: 'bad',
    text: `Життєзабезпечення впало до ${v} на солі ${sol}.`,
    tip: 'Система переробки повертає воду й повітря, але їй потрібна енергія.',
    topic: 'life',
  }),
  food: (v, sol) => ({
    tone: 'bad',
    text: `Їжі лишилося лише ${v} на солі ${sol}.`,
    tip: 'Оранжерея вирощує їжу, тож краще збудувати її ще вдень, поки вистачає енергії.',
    topic: 'food',
  }),
};

export function makeDebrief(history: GameState[], final: GameState): Debrief {
  const points = timeline(history, final);
  const won = final.status === 'won';
  const sawNight = points.some((p) => p.isNight);
  const survivedNight = sawNight && (won || !final.isNight || points.findLastIndex((p) => p.isNight) < points.length - 1);

  const lessons: Lesson[] = [];
  for (const id of RESOURCES) {
    const w = worst(points, id);
    if (w.value <= LOW_RESOURCE) lessons.push(BAD_TEXT[id](w.value, w.sol, w.night));
  }
  const rad = worst(points, 'radiation');
  if (rad.value >= HIGH_RADIATION) {
    lessons.push({
      tone: 'bad',
      text: `Радіація піднялася до ${rad.value} на солі ${rad.sol}.`,
      tip: 'Радіаційний щит знижує дозу. Під час сонячного спалаху краще сховатися.',
      topic: 'radiation',
    });
  }
  const troubles = lessons.length;

  if (survivedNight) {
    lessons.unshift({ tone: 'good', text: 'База пережила місячну ніч — найважчу частину місії.', topic: 'night' });
  }
  if (won && troubles === 0) {
    lessons.push({ tone: 'good', text: 'Жодного разу ресурси не опускалися в червону зону. Чудове планування!' });
  }

  const stars: Debrief['stars'] = won ? (troubles === 0 ? 3 : 2) : sawNight ? 1 : 0;

  const rewindTo: Debrief['rewindTo'] = [];
  if (!won) {
    const sols = new Set(history.map((s) => s.sol));
    const back3 = Math.max(1, final.sol - 3);
    if (back3 < final.sol && sols.has(back3)) rewindTo.push({ sol: back3, label: `На 3 соли назад (сол ${back3})` });
    const firstNight = points.find((p) => p.isNight);
    const beforeNight = firstNight ? firstNight.sol - 1 : null;
    if (beforeNight && beforeNight >= 1 && beforeNight !== back3 && beforeNight < final.sol && sols.has(beforeNight)) {
      rewindTo.push({ sol: beforeNight, label: `За сол до ночі (сол ${beforeNight})` });
    }
  }

  return { points, stars, lessons: lessons.slice(0, 4), rewindTo };
}
