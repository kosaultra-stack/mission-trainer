/** Поступ гравця по місіях: зберігається в браузері, щоб на заставці було видно, що вже пройдено. */

export interface LevelResult {
  won: boolean;
  /** Найкраща оцінка командира, 0..3. */
  stars: number;
}

export type Progress = Record<number, LevelResult>;

const KEY = 'mission-trainer:progress';

/** Додає результат і лишає найкраще: перемогу не «забуває», зірок не зменшує. */
export function mergeResult(progress: Progress, level: number, result: LevelResult): Progress {
  const old = progress[level];
  return {
    ...progress,
    [level]: { won: result.won || (old?.won ?? false), stars: Math.max(result.stars, old?.stars ?? 0) },
  };
}

/** Розбирає збережений рядок. Усе незрозуміле відкидає — краще порожній поступ, ніж помилка. */
export function parseProgress(raw: string | null): Progress {
  if (!raw) return {};
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== 'object') return {};
    const progress: Progress = {};
    for (const [key, value] of Object.entries(data)) {
      const level = Number(key);
      if (!Number.isInteger(level) || !value || typeof value !== 'object') continue;
      const { won, stars } = value as Partial<LevelResult>;
      if (typeof won !== 'boolean' || typeof stars !== 'number') continue;
      progress[level] = { won, stars: Math.max(0, Math.min(3, Math.round(stars))) };
    }
    return progress;
  } catch {
    return {};
  }
}

export function loadProgress(): Progress {
  try {
    return parseProgress(localStorage.getItem(KEY));
  } catch {
    return {};
  }
}

export function saveResult(level: number, result: LevelResult): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(mergeResult(loadProgress(), level, result)));
  } catch {
    /* сховище недоступне — поступ просто не збережеться */
  }
}
