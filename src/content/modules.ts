import type { ModuleType } from '../shared/types';

export interface ModuleInfo {
  name: string;
  cost: number; // у запчастинах (parts)
  description: string;
}

export const MODULES: Record<ModuleType, ModuleInfo> = {
  solar: {
    name: 'Сонячна панель',
    cost: 2,
    description: 'Дає енергію вдень. Місячної ночі (близько 14 земних діб) не працює.',
  },
  battery: {
    name: 'Акумулятор',
    cost: 3,
    description: 'Запасає енергію вдень і віддає її вночі.',
  },
  habitat: {
    name: 'Житловий модуль',
    cost: 4,
    description: 'Дім для екіпажу. Споживає енергію та життєзабезпечення.',
  },
  greenhouse: {
    name: 'Оранжерея',
    cost: 3,
    description: 'Вирощує їжу. Потрібні світло й енергія.',
  },
  recycler: {
    name: 'Система переробки',
    cost: 3,
    description: 'Очищує воду й повітря, підтримує життєзабезпечення.',
  },
  shield: {
    name: 'Радіаційний щит',
    cost: 4,
    description: 'Захищає базу від космічної радіації та сонячних спалахів.',
  },
};
