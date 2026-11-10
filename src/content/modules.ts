import type { ModuleType } from '../shared/types';

export interface ModuleInfo {
  name: string;
  cost: number; // в запчастях (parts)
  description: string;
}

export const MODULES: Record<ModuleType, ModuleInfo> = {
  solar: {
    name: 'Солнечная панель',
    cost: 2,
    description: 'Даёт энергию днём. Лунной ночью (около 14 земных суток) не работает.',
  },
  battery: {
    name: 'Аккумулятор',
    cost: 3,
    description: 'Запасает энергию днём и отдаёт её ночью.',
  },
  habitat: {
    name: 'Жилой модуль',
    cost: 4,
    description: 'Дом для экипажа. Потребляет энергию и жизнеобеспечение.',
  },
  greenhouse: {
    name: 'Оранжерея',
    cost: 3,
    description: 'Выращивает еду. Нужны свет и энергия.',
  },
  recycler: {
    name: 'Система переработки',
    cost: 3,
    description: 'Очищает воду и воздух, поддерживает жизнеобеспечение.',
  },
  shield: {
    name: 'Радиационный щит',
    cost: 4,
    description: 'Защищает базу от космической радиации и солнечных вспышек.',
  },
};
