import { createMockSnapshot } from '../data/mock-data';
import { SKILLS } from './catalog';
import { advanceGamePeriod, startGamePeriod } from './game-periods';
import { GameSnapshot } from './models';
import { ProgressReplayEntry, replayProgress } from './progress-replay';
import { recordActivity } from './progression';

const initial = () => startGamePeriod(createMockSnapshot(), '2026-09-08');
const entry = (requestId: string, skillId: string, minutes: number, dayKey = '2026-09-08') => ({
  requestId,
  skillId,
  minutes,
  dayKey,
});

/** The former repository algorithm, retained as an independent compatibility oracle. */
function replayWithFullHistory(snapshot: GameSnapshot, entries: readonly ProgressReplayEntry[]) {
  for (const { dayKey, ...command } of entries) {
    snapshot = recordActivity(advanceGamePeriod(snapshot, dayKey), command).snapshot;
  }
  return advanceGamePeriod(snapshot, snapshot.dayKey);
}

describe('indexed progress replay', () => {
  it('returns an empty journal without changing the baseline', () => {
    const snapshot = initial();
    expect(replayProgress(snapshot, [])).toBe(snapshot);
  });

  it('preserves daily caps, once-only quest bonuses and newest-first input history', () => {
    const entries = [
      entry('first', 'calisthenics', 60),
      entry('capped', 'calisthenics', 60),
      entry('mind', 'meditation', 10),
      entry('tomorrow', 'calisthenics', 20, '2026-09-09'),
      entry('next-week', 'programming', 30, '2026-09-14'),
    ];
    const result = replayProgress(initial(), entries);
    expect(result).toEqual(replayWithFullHistory(initial(), entries));
    expect(result.character.totalXp).toBe(26626);
    expect(result.boss.hp).toBe(2280);
    expect(result.momentum.value).toBe(91);
    expect(result.quests.filter((quest) => quest.claimed).map((quest) => quest.id)).toEqual([
      'q-learn',
    ]);
    expect(result.activities.map((activity) => activity.requestId)).toEqual([
      'next-week',
      'tomorrow',
      'mind',
      'capped',
      'first',
    ]);
    expect(result.activities.find((activity) => activity.requestId === 'capped')).toMatchObject({
      minutes: 60,
      rewardedMinutes: 30,
      xp: 120,
    });
  });

  it('keeps the boss drop when a new week restores the boss', () => {
    const entries = [
      entry('strength', 'calisthenics', 90),
      entry('run', 'running', 60),
      entry('code', 'programming', 90),
      entry('mind', 'meditation', 10),
      entry('new-week', 'meditation', 10, '2026-09-14'),
    ];
    const result = replayProgress(initial(), entries);
    expect(result).toEqual(replayWithFullHistory(initial(), entries));
    expect(result.unlockedAuras).toEqual(['moss-spirit']);
    expect(result.character.totalXp).toBe(26856);
    expect(result.boss.hp).toBe(2340);
  });

  it('keeps level rewards, including a threshold crossed by the quest bonus', () => {
    const snapshot = initial();
    snapshot.character.totalXp = 56946;
    snapshot.quests[0].progressMinutes = 19;
    const entries = [entry('level-up', 'calisthenics', 1), entry('still-owned', 'calisthenics', 1)];
    const result = replayProgress(snapshot, entries);
    expect(result).toEqual(replayWithFullHistory(snapshot, entries));
    expect(result.character.totalXp).toBe(57004);
    expect(result.unlockedAuras).toEqual(['aurora']);
  });

  it('retains every rewarded day when rebuilding the weekly rhythm across a year boundary', () => {
    const snapshot = startGamePeriod(createMockSnapshot(), '2026-12-28');
    const entries = [
      entry('monday', 'running', 5, '2026-12-28'),
      entry('wednesday', 'reading', 10, '2026-12-30'),
      entry('friday', 'meditation', 5, '2027-01-01'),
      entry('sunday', 'languages', 10, '2027-01-03'),
    ];
    const result = replayProgress(snapshot, entries);
    expect(result).toEqual(replayWithFullHistory(snapshot, entries));
    expect(result.momentum.rhythm.map((day) => day.status)).toEqual([
      'done',
      'rest',
      'done',
      'rest',
      'done',
      'rest',
      'today',
    ]);
  });

  it('preserves idempotent retries across days and rejects conflicting request IDs', () => {
    const first = entry('same-id', 'calisthenics', 60);
    const entries = [first, first, { ...first, dayKey: '2026-09-09' }];
    const result = replayProgress(initial(), entries);
    expect(result).toEqual(replayWithFullHistory(initial(), entries));
    expect(result.activities).toHaveLength(1);
    expect(result.character.totalXp).toBe(26216);
    expect(result.quests.every((quest) => !quest.claimed)).toBe(true);
    expect(() => replayProgress(initial(), [first, { ...first, skillId: 'running' }])).toThrow(
      'andere Aktivität',
    );
    expect(() => replayProgress(initial(), [first, { ...first, minutes: 61 }])).toThrow(
      'andere Aktivität',
    );
  });

  it('can continue an existing snapshot without losing its history or daily limit', () => {
    const snapshot = recordActivity(initial(), entry('earlier', 'calisthenics', 80)).snapshot;
    const entries = [entry('new', 'calisthenics', 20)];
    const result = replayProgress(snapshot, entries);
    expect(result).toEqual(replayWithFullHistory(snapshot, entries));
    expect(result.activities[0]).toMatchObject({ rewardedMinutes: 10, xp: 40 });
    expect(result.activities[1].requestId).toBe('earlier');
  });

  it('matches the former algorithm for varied skills, capped inputs and skipped days', () => {
    const entries = Array.from({ length: 500 }, (_, index) => {
      const date = new Date(Date.UTC(2026, 8, 8 + Math.floor(index / 9)));
      return entry(
        String(index),
        SKILLS[index % SKILLS.length].id,
        1 + ((index * 17) % 180),
        date.toISOString().slice(0, 10),
      );
    });
    const snapshot = initial();
    const before = structuredClone({ snapshot, entries });
    expect(replayProgress(snapshot, entries)).toEqual(replayWithFullHistory(snapshot, entries));
    expect({ snapshot, entries }).toEqual(before);
  });
});
