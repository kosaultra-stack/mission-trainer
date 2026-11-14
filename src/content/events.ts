import type { GameEvent, GameState } from '../shared/types';
import { BALANCE } from './balance';
import { applyDelta, hasActive, signed, turnOffFirst } from './effects';

/**
 * Події місії. Тут лише дані й чисті функції-наслідки; коли й яку подію показати,
 * вирішує рушій (src/sim). Підказки (hint) збираються з чисел балансу, тож завжди
 * чесно кажуть, що дасть вибір і чого він коштуватиме.
 */

/** Теми наукової довідки, на які може посилатися подія. */
export type FactId = 'night' | 'power' | 'life' | 'food' | 'radiation';

export interface EventDef {
  event: GameEvent & { factId: FactId };
  /** Чи може подія статися в цьому стані (сол уже новий, isNight уже оновлено). */
  canHappen: (state: GameState) => boolean;
  /** Наслідки рішень: choiceId → чиста функція. Застосовує їх рушій. */
  effects: Record<string, (state: GameState) => GameState>;
}

const C = BALANCE.choices;
const abs = Math.abs;

export const EVENTS: EventDef[] = [
  {
    event: {
      id: 'solar-flare',
      title: 'Сонячний спалах',
      text: 'Датчики фіксують потужний спалах на Сонці. За годину до бази долетить хвиля радіації.',
      choices: [
        {
          id: 'hide',
          label: 'Сховатися в укритті',
          hint: `Радіація не зросте, але оранжерея лишиться без догляду: ${signed(C['solar-flare'].hide.food)} їжі`,
        },
        {
          id: 'work',
          label: 'Продовжити роботу',
          hint: `Їжа ціла, але екіпаж отримає дозу: ${signed(C['solar-flare'].work.radiation)} радіації`,
        },
      ],
      factId: 'radiation',
    },
    canHappen: (s) => s.sol >= BALANCE.events.flareFromSol,
    effects: {
      hide: (s) => applyDelta(s, C['solar-flare'].hide),
      work: (s) => applyDelta(s, C['solar-flare'].work),
    },
  },
  {
    event: {
      id: 'supply-drop',
      title: 'Вантажний корабель',
      text: 'На орбіті — автоматичний вантажний корабель. Він може скинути лише один контейнер, а ровер витратить заряд, щоб привезти його на базу.',
      choices: [
        {
          id: 'parts',
          label: 'Контейнер із запчастинами',
          hint: `${signed(C['supply-drop'].parts.parts)} запчастини, ${signed(C['supply-drop'].parts.power)} енергії на перевезення`,
        },
        {
          id: 'food',
          label: 'Контейнер із провізією',
          hint: `${signed(C['supply-drop'].food.food)} їжі, ${signed(C['supply-drop'].food.power)} енергії на перевезення`,
        },
      ],
      factId: 'food',
    },
    canHappen: () => true,
    effects: {
      parts: (s) => applyDelta(s, C['supply-drop'].parts),
      food: (s) => applyDelta(s, C['supply-drop'].food),
    },
  },
  {
    event: {
      id: 'micrometeorite',
      title: 'Мікрометеорит',
      text: 'Мікрометеорит пошкодив сонячну панель. На Місяці немає атмосфери, у якій він міг би згоріти.',
      choices: [
        {
          id: 'repair',
          label: 'Відремонтувати панель',
          hint: `${signed(C.micrometeorite.repair.parts)} запчастини, панель працює далі`,
        },
        {
          id: 'leave',
          label: 'Залишити як є',
          hint: `Запчастини цілі, але панель вимкнеться, а замикання забере ${abs(C.micrometeorite.leave.power)} енергії`,
        },
      ],
      factId: 'power',
    },
    canHappen: (s) => hasActive(s, 'solar') && s.parts >= abs(C.micrometeorite.repair.parts),
    effects: {
      repair: (s) => applyDelta(s, C.micrometeorite.repair),
      leave: (s) => applyDelta(turnOffFirst(s, 'solar'), C.micrometeorite.leave),
    },
  },
  {
    event: {
      id: 'air-leak',
      title: 'Витік повітря',
      text: 'У житловому модулі падає тиск: десь з’явилася тонка тріщина, і повітря виходить назовні.',
      choices: [
        {
          id: 'patch',
          label: 'Залатати тріщину',
          hint: `${signed(C['air-leak'].patch.parts)} запчастини, повітря збережено`,
        },
        {
          id: 'seal',
          label: 'Перекрити відсік',
          hint: `Запчастини цілі, але частину повітря втрачено: ${signed(C['air-leak'].seal.life)} життєзабезпечення`,
        },
      ],
      factId: 'life',
    },
    canHappen: (s) => s.parts >= abs(C['air-leak'].patch.parts),
    effects: {
      patch: (s) => applyDelta(s, C['air-leak'].patch),
      seal: (s) => applyDelta(s, C['air-leak'].seal),
    },
  },
  {
    event: {
      id: 'sick-crew',
      title: 'Хворий член екіпажу',
      text: 'Інженерка прокинулася з температурою. До найближчої лікарні — 384 тисячі кілометрів.',
      choices: [
        {
          id: 'rest',
          label: 'Дати відпочити й посилити раціон',
          hint: `Екіпаж одужає, але піде більше провізії: ${signed(C['sick-crew'].rest.food)} їжі`,
        },
        {
          id: 'work',
          label: 'Працювати далі за графіком',
          hint: `Їжа ціла, але хвороба виснажує екіпаж: ${signed(C['sick-crew'].work.life)} життєзабезпечення`,
        },
      ],
      factId: 'life',
    },
    canHappen: () => true,
    effects: {
      rest: (s) => applyDelta(s, C['sick-crew'].rest),
      work: (s) => applyDelta(s, C['sick-crew'].work),
    },
  },
  {
    event: {
      id: 'cold-battery',
      title: 'Акумулятор замерз',
      text: 'Уночі надворі близько −170 °C. Один з акумуляторів переохолодився й перестав тримати заряд.',
      choices: [
        {
          id: 'heat',
          label: 'Прогріти обігрівачем',
          hint: `Запчастини цілі, але обігрів забере ${abs(C['cold-battery'].heat.power)} енергії`,
        },
        {
          id: 'replace',
          label: 'Замінити замерзлий елемент',
          hint: `Енергія ціла, але ${signed(C['cold-battery'].replace.parts)} запчастини`,
        },
      ],
      factId: 'night',
    },
    canHappen: (s) => s.isNight && hasActive(s, 'battery') && s.parts >= abs(C['cold-battery'].replace.parts),
    effects: {
      heat: (s) => applyDelta(s, C['cold-battery'].heat),
      replace: (s) => applyDelta(s, C['cold-battery'].replace),
    },
  },
  {
    event: {
      id: 'moon-dust',
      title: 'Місячний пил',
      text: 'Дрібний і гострий місячний пил налип на сонячні панелі й заважає їм ловити світло.',
      choices: [
        {
          id: 'clean',
          label: 'Вийти й почистити панелі',
          hint: `Енергія ціла, але вихід назовні — це доза: ${signed(C['moon-dust'].clean.radiation)} радіації`,
        },
        {
          id: 'wait',
          label: 'Чекати, доки пил осяде',
          hint: `Радіація не зросте, але панелі недодадуть: ${signed(C['moon-dust'].wait.power)} енергії`,
        },
      ],
      factId: 'power',
    },
    canHappen: (s) => !s.isNight && hasActive(s, 'solar'),
    effects: {
      clean: (s) => applyDelta(s, C['moon-dust'].clean),
      wait: (s) => applyDelta(s, C['moon-dust'].wait),
    },
  },
  {
    event: {
      id: 'crater-ice',
      title: 'Лід у кратері',
      text: 'Розвідка знайшла водяний лід у затіненому кратері неподалік. З льоду можна отримати воду й кисень.',
      choices: [
        {
          id: 'crew',
          label: 'Відправити екіпаж',
          hint: `${signed(C['crater-ice'].crew.life)} життєзабезпечення, але ${signed(C['crater-ice'].crew.radiation)} радіації за вихід назовні`,
        },
        {
          id: 'rover',
          label: 'Відправити ровер',
          hint: `${signed(C['crater-ice'].rover.life)} життєзабезпечення, але ${signed(C['crater-ice'].rover.power)} енергії на дорогу`,
        },
      ],
      factId: 'life',
    },
    canHappen: () => true,
    effects: {
      crew: (s) => applyDelta(s, C['crater-ice'].crew),
      rover: (s) => applyDelta(s, C['crater-ice'].rover),
    },
  },
];

export const findEvent = (id: string) => EVENTS.find((def) => def.event.id === id);
