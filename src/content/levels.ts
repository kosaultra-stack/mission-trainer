import { isNightSol, LEVEL_IDS, levelRules, type LevelRules } from './balance';

/**
 * Місії (рівні): назви й описи для гравця. Самі правила — числа в balance.ts.
 * Інтерфейс бере звідси тексти й розклад ночей, щоб показати їх гравцеві.
 */

export interface LevelInfo {
  id: number;
  name: string;
  place: string;
  difficulty: 'Легко' | 'Середньо' | 'Складно';
  /** Що особливого в цій місії — одним-двома реченнями. */
  description: string;
  /** Коротка порада, з чого почати. */
  tip: string;
  rules: LevelRules;
}

const TEXTS: Record<number, Omit<LevelInfo, 'id' | 'rules'>> = {
  1: {
    name: 'Перша ніч',
    place: 'Море Спокою',
    difficulty: 'Легко',
    description: 'Два тижні світить Сонце, потім настає двотижнева місячна ніч. Встигни підготувати базу до темряви.',
    tip: 'Оранжерея, система переробки й кілька акумуляторів до 15-го сола.',
  },
  2: {
    name: 'Південний полюс',
    place: 'Край кратера Шеклтон',
    difficulty: 'Середньо',
    description: 'Сонце тут низько над обрієм: панелі дають удвічі менше енергії, а тіні гір тричі накривають базу. Заряду на старті мало, зате поруч є водяний лід.',
    tip: 'Перша тінь уже на 5-му солі. Заощаджуй енергію: енерговузол зменшує споживання сусідніх модулів.',
  },
  3: {
    name: 'Довга вахта',
    place: 'Зворотний бік Місяця',
    difficulty: 'Складно',
    description: '45 солів, дві місячні ночі й сезон сонячних бур: радіація росте швидше, а спалахи трапляються частіше.',
    tip: 'Перша ніч уже на 8-му солі, й одного щита замало. Реактор дає енергію і в темряві, а 3D-принтер допоможе з запчастинами.',
  },
};

export const LEVELS: LevelInfo[] = LEVEL_IDS.map((id) => ({ id, ...TEXTS[id], rules: levelRules(id) }));

/** Опис рівня. Невідомий номер або його відсутність — перша місія. */
export const levelInfo = (level?: number): LevelInfo => LEVELS.find((l) => l.id === level) ?? LEVELS[0];

/** Чи буде ніч на цьому солі в цій місії. */
export const isNightAt = (level: number | undefined, sol: number) => isNightSol(levelRules(level), sol);

/** Ніч, що триває на цьому солі, або найближча наступна: [перший сол, останній сол]. Якщо ночей попереду немає — null. */
export function nightAround(level: number | undefined, sol: number): [number, number] | null {
  return levelRules(level).nights.find(([, to]) => sol <= to) ?? null;
}
