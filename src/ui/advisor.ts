import { MODULES } from '../content/modules';
import type { GameState, ModuleType, ResourceId } from '../shared/types';
import { GAUGE_LOOK, HIGH_RADIATION, LOW_RESOURCE } from './look';

export interface Advice {
  tone: 'ok' | 'info' | 'warn' | 'danger';
  text: string;
}

const LOW_TEXT: Record<ResourceId, string> = {
  power: 'Енергії майже не лишилося! Вимкни модулі, без яких можна обійтися, або додай джерело енергії.',
  life: 'Життєзабезпечення на межі. Перевір, чи працює система переробки.',
  food: 'Їжі обмаль. Оранжерея допоможе виростити врожай.',
};

const RESOURCES: ResourceId[] = ['power', 'life', 'food'];

/**
 * Підказка центру керування. Нічого не рахує — лише пояснює словами те,
 * що вже видно на екрані (стан і прогноз рушія).
 */
export function getAdvice(
  state: GameState,
  forecast: Record<ResourceId, number>,
  building: ModuleType | null,
): Advice {
  if (state.status === 'won') return { tone: 'ok', text: 'Місію виконано! Екіпаж у безпеці.' };
  if (state.status === 'lost') return { tone: 'danger', text: 'Зв’язок із базою втрачено. Спробуймо ще раз?' };
  if (state.pendingEvent) return { tone: 'info', text: 'Увага, подія! Прочитай уважно й обери рішення.' };
  if (building) {
    return { tone: 'info', text: `Обери вільну ділянку на мапі, щоб збудувати: ${MODULES[building].name.toLowerCase()}.` };
  }

  const lowest = [...RESOURCES].sort((a, b) => state.resources[a] - state.resources[b])[0];
  if (state.resources[lowest] <= LOW_RESOURCE) return { tone: 'danger', text: LOW_TEXT[lowest] };
  if (state.radiation >= HIGH_RADIATION) {
    return { tone: 'danger', text: 'Радіація небезпечно висока. Радіаційний щит захистить екіпаж.' };
  }

  const falling = RESOURCES.filter((id) => forecast[id] < 0);
  if (state.isNight) {
    return {
      tone: 'warn',
      text: 'Триває місячна ніч: сонячні панелі не дають енергії. Бережи заряд і вимикай зайве.',
    };
  }
  if (falling.length > 0) {
    const names = falling.map((id) => GAUGE_LOOK[id].label.toLowerCase()).join(', ');
    return { tone: 'warn', text: `Зменшується: ${names}. Подумай, що збудувати або вимкнути.` };
  }
  return { tone: 'ok', text: 'Системи в нормі. Поки світить Сонце, готуй базу до місячної ночі.' };
}
