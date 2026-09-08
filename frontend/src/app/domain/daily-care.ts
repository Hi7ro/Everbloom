export type DailyCareMode = 'balanced' | 'focus' | 'recovery' | 'rest';
export type DailyEnergy = 'low' | 'steady' | 'high';

export interface DailyCheckIn {
  readonly dayKey: string;
  readonly mode: DailyCareMode;
  readonly energy: DailyEnergy;
}

export const DAILY_CARE_MODES = [
  { id: 'balanced', label: 'Ausgewogen', description: 'Platz für verschiedene Dinge', symbol: '◇' },
  { id: 'focus', label: 'Fokus', description: 'Eine Sache nach der anderen', symbol: '◎' },
  { id: 'recovery', label: 'Erholung', description: 'In deinem Tempo auftanken', symbol: '✧' },
  { id: 'rest', label: 'Ruhetag', description: 'Heute hat eine Pause Platz', symbol: '☾' },
] as const satisfies readonly {
  id: DailyCareMode;
  label: string;
  description: string;
  symbol: string;
}[];

export const DAILY_ENERGIES = [
  { id: 'low', label: 'Ruhig' },
  { id: 'steady', label: 'Ausgeglichen' },
  { id: 'high', label: 'Voller Energie' },
] as const satisfies readonly { id: DailyEnergy; label: string }[];

export type DailyCareRecord =
  | { readonly version: 1; readonly dayKey: string; readonly skipped: true; readonly checkIn: null }
  | {
      readonly version: 1;
      readonly dayKey: string;
      readonly skipped: false;
      readonly checkIn: DailyCheckIn;
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function isLocalDayKey(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(value + 'T12:00:00Z');
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

/** Local calendar date, intentionally independent from the fixed mock game's day. */
export function localDayKey(date: Date = new Date()): string {
  if (!Number.isFinite(date.getTime())) throw new Error('Ungültiges Datum.');
  return [
    String(date.getFullYear()).padStart(4, '0'),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

export function normalizeDailyCheckIn(value: unknown): DailyCheckIn | null {
  if (!isRecord(value) || !isLocalDayKey(value['dayKey'])) return null;
  const mode = DAILY_CARE_MODES.find((option) => option.id === value['mode'])?.id;
  const energy = DAILY_ENERGIES.find((option) => option.id === value['energy'])?.id;
  return mode && energy ? { dayKey: value['dayKey'], mode, energy } : null;
}

/** Validate device-local input and strip unrelated properties, including any game rewards. */
export function normalizeDailyCareRecord(value: unknown): DailyCareRecord | null {
  if (!isRecord(value) || value['version'] !== 1 || !isLocalDayKey(value['dayKey'])) return null;
  if (value['skipped'] === true && value['checkIn'] === null) {
    return { version: 1, dayKey: value['dayKey'], skipped: true, checkIn: null };
  }
  if (value['skipped'] !== false) return null;
  const checkIn = normalizeDailyCheckIn(value['checkIn']);
  return checkIn && checkIn.dayKey === value['dayKey']
    ? { version: 1, dayKey: value['dayKey'], skipped: false, checkIn }
    : null;
}
