import { GameSnapshot, RhythmDay } from './models';

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] as const;
const MONTHS = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
] as const;

/** The caller supplies the device-local date; arithmetic uses a UTC civil calendar. */
export function isValidDayKey(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return false;
  const date = civilDate(year, month, day);
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

/** Monday of the ISO calendar week, including weeks crossing a month or year. */
export function weekStart(dayKey: string): string {
  const date = parseDay(dayKey);
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  return toDayKey(date);
}

export function formatWeekLabel(dayKey: string): string {
  const start = parseDay(weekStart(dayKey));
  const end = addDays(start, 6);
  const first = twoDigits(start.getUTCDate());
  const last = twoDigits(end.getUTCDate());
  const firstMonth = MONTHS[start.getUTCMonth()];
  const lastMonth = MONTHS[end.getUTCMonth()];
  if (start.getUTCFullYear() !== end.getUTCFullYear()) {
    return `${first}. ${firstMonth} ${start.getUTCFullYear()} – ${last}. ${lastMonth} ${end.getUTCFullYear()}`;
  }
  if (start.getUTCMonth() !== end.getUTCMonth()) {
    return `${first}. ${firstMonth} – ${last}. ${lastMonth}`;
  }
  return `${first}. – ${last}. ${firstMonth}`;
}

/** Set the demo's baseline date once without discarding its existing quest or boss progress. */
export function startGamePeriod(snapshot: GameSnapshot, startDay: string): GameSnapshot {
  const date = parseDay(startDay);
  return {
    ...snapshot,
    dayKey: startDay,
    boss: { ...snapshot.boss, weekLabel: formatWeekLabel(startDay) },
    momentum: {
      ...snapshot.momentum,
      lastRewardDay: toDayKey(addDays(date, -1)),
      rhythm: weekRhythm(snapshot, startDay),
    },
  };
}

/**
 * Advance only forwards: daily quests restart, and Monday begins a fresh weekly boss.
 * History and permanent rewards survive. Calling again also refreshes rhythm after a new activity.
 * A clock rollback keeps the current period; the repository rejects new backdated entries.
 */
export function advanceGamePeriod(snapshot: GameSnapshot, dayKey: string): GameSnapshot {
  parseDay(snapshot.dayKey);
  parseDay(dayKey);
  if (dayKey < snapshot.dayKey) return snapshot;

  const newDay = dayKey > snapshot.dayKey;
  const newWeek = weekStart(dayKey) !== weekStart(snapshot.dayKey);
  const weekLabel = formatWeekLabel(dayKey);
  const rhythm = weekRhythm(snapshot, dayKey);
  const sameRhythm =
    rhythm.length === snapshot.momentum.rhythm.length &&
    rhythm.every((day, index) => {
      const previous = snapshot.momentum.rhythm[index];
      return previous.label === day.label && previous.status === day.status;
    });
  const bossChanged = newWeek || snapshot.boss.weekLabel !== weekLabel;
  if (!newDay && !bossChanged && sameRhythm) return snapshot;

  return {
    ...snapshot,
    dayKey,
    quests: newDay
      ? snapshot.quests.map((quest) => ({ ...quest, progressMinutes: 0, claimed: false }))
      : snapshot.quests,
    boss: bossChanged
      ? { ...snapshot.boss, weekLabel, hp: newWeek ? snapshot.boss.maxHp : snapshot.boss.hp }
      : snapshot.boss,
    momentum: sameRhythm ? snapshot.momentum : { ...snapshot.momentum, rhythm },
  };
}

function weekRhythm(snapshot: GameSnapshot, dayKey: string): RhythmDay[] {
  const monday = parseDay(weekStart(dayKey));
  const rewardedDays = new Set(
    snapshot.activities.filter((activity) => activity.xp > 0).map((activity) => activity.dayKey),
  );
  return WEEKDAYS.map((label, index) => {
    const date = toDayKey(addDays(monday, index));
    const status =
      date === dayKey
        ? 'today'
        : date > dayKey
          ? 'upcoming'
          : rewardedDays.has(date)
            ? 'done'
            : 'rest';
    return { label, status };
  });
}

function parseDay(dayKey: string): Date {
  if (!isValidDayKey(dayKey)) throw new Error('Ungültiger Kalendertag. Erwartet wird JJJJ-MM-TT.');
  const [year, month, day] = dayKey.split('-').map(Number);
  return civilDate(year, month, day);
}

function civilDate(year: number, month: number, day: number): Date {
  const date = new Date(0);
  // setUTCFullYear avoids the Date constructor's special treatment of years 00–99.
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function toDayKey(date: Date): string {
  return `${String(date.getUTCFullYear()).padStart(4, '0')}-${twoDigits(date.getUTCMonth() + 1)}-${twoDigits(date.getUTCDate())}`;
}

function twoDigits(value: number): string {
  return String(value).padStart(2, '0');
}
