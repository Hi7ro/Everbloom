import { createMockSnapshot } from '../data/mock-data';
import {
  advanceGamePeriod,
  formatWeekLabel,
  isValidDayKey,
  startGamePeriod,
  weekStart,
} from './game-periods';
import { Activity, GameSnapshot } from './models';
import { recordActivity } from './progression';

function activity(dayKey: string, xp: number, requestId = dayKey): Activity {
  return { requestId, dayKey, skillId: 'running', minutes: 20, rewardedMinutes: xp / 3, xp };
}

function freezeRecursively(value: unknown): void {
  if (value !== null && typeof value === 'object') {
    Object.values(value).forEach(freezeRecursively);
    Object.freeze(value);
  }
}

describe('civil calendar periods', () => {
  it.each(['2024-02-29', '2000-02-29', '2026-01-01', '2026-12-31', '0001-01-01', '0099-12-31'])(
    'accepts real calendar dates: %s',
    (day) => {
      expect(isValidDayKey(day)).toBe(true);
    },
  );

  it.each([
    '2026-02-29',
    '1900-02-29',
    '2026-04-31',
    '2026-00-10',
    '2026-13-01',
    '2026-01-00',
    '2026-01-32',
    '2026-1-01',
    '2026-01-1',
    '0000-01-01',
    '2026-09-08T00:00:00Z',
    '',
    ' 2026-09-08',
    null,
    undefined,
    20260908,
  ])('rejects malformed or impossible calendar dates: %s', (day) => {
    expect(isValidDayKey(day)).toBe(false);
  });

  it.each([
    ['2026-09-07', '2026-09-07'],
    ['2026-09-13', '2026-09-07'],
    ['2026-09-14', '2026-09-14'],
    ['2026-10-01', '2026-09-28'],
    ['2027-01-01', '2026-12-28'],
    ['2024-02-29', '2024-02-26'],
  ])('finds the Monday for %s', (day, expected) => {
    expect(weekStart(day)).toBe(expected);
  });

  it('labels ordinary weeks and month/year boundaries without ambiguous ranges', () => {
    expect(formatWeekLabel('2026-09-08')).toBe('07. – 13. September');
    expect(formatWeekLabel('2026-10-01')).toBe('28. September – 04. Oktober');
    expect(formatWeekLabel('2027-01-01')).toBe('28. Dezember 2026 – 03. Januar 2027');
  });

  it('rejects invalid date inputs before changing a snapshot', () => {
    const snapshot = createMockSnapshot();
    expect(() => weekStart('2026-02-30')).toThrow(/Kalendertag/);
    expect(() => formatWeekLabel('2026-02-30')).toThrow(/Kalendertag/);
    expect(() => startGamePeriod(snapshot, '2026-02-30')).toThrow(/Kalendertag/);
    expect(() => advanceGamePeriod(snapshot, '2026-02-30')).toThrow(/Kalendertag/);
    expect(() => advanceGamePeriod({ ...snapshot, dayKey: 'bad' }, '2026-09-08')).toThrow(
      /Kalendertag/,
    );
  });
});

describe('game period initialization', () => {
  it('reanchors the demo without rewarding XP or erasing seed progress', () => {
    const snapshot = createMockSnapshot();
    snapshot.quests[0] = { ...snapshot.quests[0], claimed: true, progressMinutes: 20 };
    const before = structuredClone(snapshot);
    freezeRecursively(snapshot);

    const result = startGamePeriod(snapshot, '2027-01-01');

    expect(snapshot).toEqual(before);
    expect(result.dayKey).toBe('2027-01-01');
    expect(result.boss.hp).toBe(1460);
    expect(result.boss.maxHp).toBe(2400);
    expect(result.boss.weekLabel).toBe('28. Dezember 2026 – 03. Januar 2027');
    expect(result.quests).toBe(snapshot.quests);
    expect(result.character).toBe(snapshot.character);
    expect(result.skills).toBe(snapshot.skills);
    expect(result.activities).toBe(snapshot.activities);
    expect(result.momentum.value).toBe(76);
    expect(result.momentum.lastRewardDay).toBe('2026-12-31');
    expect(result.momentum.rhythm).toEqual([
      { label: 'Mo', status: 'rest' },
      { label: 'Di', status: 'rest' },
      { label: 'Mi', status: 'rest' },
      { label: 'Do', status: 'rest' },
      { label: 'Fr', status: 'today' },
      { label: 'Sa', status: 'upcoming' },
      { label: 'So', status: 'upcoming' },
    ]);
  });

  it('uses the actual previous civil date across a leap day', () => {
    expect(startGamePeriod(createMockSnapshot(), '2024-03-01').momentum.lastRewardDay).toBe(
      '2024-02-29',
    );
  });
});

describe('game period advancement', () => {
  it('restarts daily quests and restores daily capacity while preserving earned progress', () => {
    const initial = startGamePeriod(createMockSnapshot(), '2026-09-08');
    const first = recordActivity(initial, {
      requestId: 'first-day',
      skillId: 'calisthenics',
      minutes: 90,
    }).snapshot;
    const before = structuredClone(first);
    freezeRecursively(first);

    const next = advanceGamePeriod(first, '2026-09-09');

    expect(first).toEqual(before);
    expect(next.quests.every((quest) => !quest.claimed && quest.progressMinutes === 0)).toBe(true);
    expect(next.boss).toBe(first.boss);
    expect(next.activities).toBe(first.activities);
    expect(next.character).toBe(first.character);
    expect(next.skills).toBe(first.skills);
    expect(next.momentum.value).toBe(first.momentum.value);
    expect(next.momentum.lastRewardDay).toBe('2026-09-08');
    const newWorkout = recordActivity(next, {
      requestId: 'second-day',
      skillId: 'calisthenics',
      minutes: 90,
    });
    expect(newWorkout.reward.activityXp).toBe(360);
    expect(newWorkout.reward.questXp).toBe(50);
    expect(newWorkout.snapshot.momentum.value).toBe(first.momentum.value + 5);
    expect(newWorkout.snapshot.activities).toHaveLength(2);
  });

  it('keeps a damaged or defeated boss until the next Monday', () => {
    const snapshot = startGamePeriod(createMockSnapshot(), '2026-09-07');
    for (const hp of [1460, 0]) {
      const current = { ...snapshot, boss: { ...snapshot.boss, hp } };
      expect(advanceGamePeriod(current, '2026-09-13').boss.hp).toBe(hp);
      expect(advanceGamePeriod(current, '2026-09-14').boss.hp).toBe(2400);
    }
  });

  it('resets the boss once across Sunday to Monday and leaves other rewards untouched', () => {
    const snapshot = startGamePeriod(createMockSnapshot(), '2026-09-13');
    snapshot.unlockedAuras = ['moss-spirit'];
    snapshot.character.appearance.aura = 'moss-spirit';
    const result = advanceGamePeriod(snapshot, '2026-09-14');
    expect(result.boss).toEqual({ ...snapshot.boss, hp: 2400, weekLabel: '14. – 20. September' });
    const mutableKeys = ['dayKey', 'quests', 'boss', 'momentum'];
    for (const key of Object.keys(snapshot) as (keyof GameSnapshot)[]) {
      if (!mutableKeys.includes(key)) expect(result[key]).toBe(snapshot[key]);
    }
    expect(result.momentum.value).toBe(snapshot.momentum.value);
    expect(advanceGamePeriod(result, '2026-09-14')).toBe(result);
  });

  it('does not reset a boss merely because the month or year changed within one week', () => {
    for (const [before, after] of [
      ['2026-09-30', '2026-10-01'],
      ['2026-12-31', '2027-01-01'],
    ]) {
      const snapshot = startGamePeriod(createMockSnapshot(), before);
      expect(advanceGamePeriod(snapshot, after).boss).toBe(snapshot.boss);
    }
  });

  it('skips inactive days and weeks without losing momentum or replaying rewards', () => {
    const snapshot = startGamePeriod(createMockSnapshot(), '2024-02-28');
    const result = advanceGamePeriod(snapshot, '2026-09-08');
    expect(result.boss.hp).toBe(2400);
    expect(result.momentum.value).toBe(snapshot.momentum.value);
    expect(result.momentum.lastRewardDay).toBe(snapshot.momentum.lastRewardDay);
    expect(result.character.totalXp).toBe(snapshot.character.totalXp);
    expect(result.skills).toBe(snapshot.skills);
    expect(result.activities).toBe(snapshot.activities);
  });

  it.each([
    ['2026-03-28', '2026-03-29', '2026-03-30'],
    ['2026-10-24', '2026-10-25', '2026-10-26'],
    ['2026-03-07', '2026-03-08', '2026-03-09'],
    ['2026-10-31', '2026-11-01', '2026-11-02'],
  ])(
    'crosses daylight-saving weekends using dates rather than 24-hour durations: %s',
    (saturday, sunday, monday) => {
      const snapshot = startGamePeriod(createMockSnapshot(), saturday);
      const weekend = advanceGamePeriod(snapshot, sunday);
      expect(weekend.dayKey).toBe(sunday);
      expect(weekend.boss.hp).toBe(snapshot.boss.hp);
      expect(weekend.momentum.rhythm[6].status).toBe('today');
      const next = advanceGamePeriod(weekend, monday);
      expect(next.dayKey).toBe(monday);
      expect(next.boss.hp).toBe(2400);
      expect(next.momentum.rhythm[0].status).toBe('today');
    },
  );

  it('keeps leap day in the same week and carries the actual date through rollover', () => {
    const snapshot = startGamePeriod(createMockSnapshot(), '2024-02-28');
    const leapDay = advanceGamePeriod(snapshot, '2024-02-29');
    const march = advanceGamePeriod(leapDay, '2024-03-01');
    expect(leapDay.dayKey).toBe('2024-02-29');
    expect(march.dayKey).toBe('2024-03-01');
    expect(march.boss.hp).toBe(snapshot.boss.hp);
    expect(march.momentum.rhythm[4].status).toBe('today');
  });

  it('never reopens an earlier day or week when the device clock goes backwards', () => {
    const snapshot = startGamePeriod(createMockSnapshot(), '2026-09-15');
    for (const pastDay of ['2026-09-14', '2026-09-08', '2025-09-15']) {
      expect(advanceGamePeriod(snapshot, pastDay)).toBe(snapshot);
    }
  });

  it('is idempotent while refreshing stale presentation data on the same date', () => {
    const snapshot = startGamePeriod(createMockSnapshot(), '2026-09-09');
    expect(advanceGamePeriod(snapshot, snapshot.dayKey)).toBe(snapshot);
    const stale = {
      ...snapshot,
      boss: { ...snapshot.boss, weekLabel: 'Altes Datum' },
      momentum: { ...snapshot.momentum, rhythm: [] },
    };
    const updated = advanceGamePeriod(stale, stale.dayKey);
    expect(updated.boss.hp).toBe(stale.boss.hp);
    expect(updated.boss.weekLabel).toBe('07. – 13. September');
    expect(updated.momentum.rhythm).toHaveLength(7);
    expect(updated.quests).toBe(stale.quests);
    expect(advanceGamePeriod(updated, updated.dayKey)).toBe(updated);
  });

  it('derives this week only from rewarded activity history and treats pauses neutrally', () => {
    const snapshot = startGamePeriod(createMockSnapshot(), '2026-09-11');
    snapshot.activities = [
      activity('2026-09-06', 60),
      activity('2026-09-07', 60),
      activity('2026-09-08', 0),
      activity('2026-09-09', 1),
      activity('2026-09-11', 60),
      activity('2026-09-12', 60),
    ];
    const result = advanceGamePeriod(snapshot, snapshot.dayKey);
    expect(result.momentum.rhythm).toEqual([
      { label: 'Mo', status: 'done' },
      { label: 'Di', status: 'rest' },
      { label: 'Mi', status: 'done' },
      { label: 'Do', status: 'rest' },
      { label: 'Fr', status: 'today' },
      { label: 'Sa', status: 'upcoming' },
      { label: 'So', status: 'upcoming' },
    ]);
    expect(result.momentum.value).toBe(snapshot.momentum.value);
    expect(result.momentum.lastRewardDay).toBe(snapshot.momentum.lastRewardDay);
    expect(result.activities).toBe(snapshot.activities);
  });
});
