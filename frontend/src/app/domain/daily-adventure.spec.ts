import { createMockSnapshot } from '../data/mock-data';
import { buildDailyAdventure } from './daily-adventure';
import { Activity } from './models';
import { recordActivity } from './progression';

function activity(
  requestId: string,
  dayKey: string,
  skillId: string,
  minutes: number,
  xp: number,
): Activity {
  return { requestId, dayKey, skillId, minutes, rewardedMinutes: minutes, xp };
}

describe('daily adventure suggestions', () => {
  it('keeps the chosen focus order and previews exact existing quest rewards', () => {
    const result = buildDailyAdventure(createMockSnapshot(), [
      'meditation',
      'calisthenics',
      'programming',
      'running',
    ]);
    expect(result.recommendations.map((card) => card.skillId)).toEqual([
      'meditation',
      'calisthenics',
      'programming',
    ]);
    expect(result.recommendations[0]).toMatchObject({
      minutes: 10,
      kind: 'quest',
      questId: 'q-mind',
      preview: { activityXp: 30, questXp: 30, totalXp: 60, bossDamage: 60 },
    });
    expect(result.recommendations[1]).toMatchObject({
      minutes: 20,
      preview: { activityXp: 80, questXp: 50, totalXp: 130, bossDamage: 160 },
    });
    expect(result.recommendations[2]).toMatchObject({
      minutes: 20,
      preview: { activityXp: 40, questXp: 0, totalXp: 40, bossDamage: 80 },
    });
  });

  it('previews only the remaining quest minutes after an activity', () => {
    const { snapshot } = recordActivity(createMockSnapshot(), {
      requestId: 'partial-quest',
      skillId: 'programming',
      minutes: 20,
    });
    expect(buildDailyAdventure(snapshot, ['programming']).recommendations[0]).toMatchObject({
      minutes: 10,
      preview: { activityXp: 20, questXp: 40, totalXp: 60, bossDamage: 40 },
    });
  });

  it('omits completed quests without deleting any earned skill or character XP', () => {
    const { snapshot } = recordActivity(createMockSnapshot(), {
      requestId: 'finished',
      skillId: 'calisthenics',
      minutes: 20,
    });
    const before = structuredClone(snapshot);
    expect(
      buildDailyAdventure(snapshot, ['calisthenics', 'reading']).recommendations.map(
        (card) => card.skillId,
      ),
    ).toEqual(['reading']);
    expect(snapshot).toEqual(before);
  });

  it('omits exhausted skills and caps suggestions at remaining rewarded minutes', () => {
    const first = recordActivity(createMockSnapshot(), {
      requestId: 'run',
      skillId: 'running',
      minutes: 53,
    }).snapshot;
    expect(buildDailyAdventure(first, ['running']).recommendations[0]).toMatchObject({
      minutes: 7,
      remainingRewardMinutes: 7,
      preview: { activityXp: 21, questXp: 0, totalXp: 21, bossDamage: 42 },
    });
    const second = recordActivity(first, {
      requestId: 'run-more',
      skillId: 'running',
      minutes: 5,
    }).snapshot;
    expect(buildDailyAdventure(second, ['running']).recommendations).toEqual([]);
    const exhausted = recordActivity(second, {
      requestId: 'run-end',
      skillId: 'running',
      minutes: 20,
    }).snapshot;
    expect(buildDailyAdventure(exhausted, ['running']).recommendations).toEqual([]);
  });

  it('only counts today toward daily reward limits', () => {
    const snapshot = createMockSnapshot();
    snapshot.activities.push(activity('yesterday', '2026-09-07', 'running', 60, 180));
    expect(buildDailyAdventure(snapshot, ['running']).recommendations[0]).toMatchObject({
      minutes: 15,
      remainingRewardMinutes: 60,
    });
  });

  it('keeps preview damage within remaining weekly boss HP, including a defeated boss', () => {
    const snapshot = createMockSnapshot();
    snapshot.boss.hp = 7;
    expect(
      buildDailyAdventure(snapshot, ['calisthenics']).recommendations[0].preview.bossDamage,
    ).toBe(7);
    snapshot.boss.hp = 0;
    expect(buildDailyAdventure(snapshot, ['calisthenics']).recommendations[0].preview).toEqual({
      activityXp: 80,
      membershipXp: 0,
      questXp: 50,
      totalXp: 130,
      bossDamage: 0,
    });
  });

  it('offers optional care instead of workouts on recovery and rest days', () => {
    const snapshot = createMockSnapshot();
    const rest = buildDailyAdventure(snapshot, ['calisthenics', 'running'], 'rest');
    expect(rest.restFriendly).toBe(true);
    expect(rest.recommendations.map((card) => [card.skillId, card.minutes, card.kind])).toEqual([
      ['recovery', 5, 'care'],
      ['meditation', 5, 'care'],
      ['breathwork', 5, 'care'],
    ]);
    expect(rest.recommendations[0].description).toContain('Pause ohne Eintrag');
    const recovery = buildDailyAdventure(snapshot, ['calisthenics'], 'recovery');
    expect(recovery.recommendations.map((card) => [card.skillId, card.minutes])).toEqual([
      ['recovery', 10],
      ['meditation', 10],
      ['breathwork', 5],
    ]);
    snapshot.skills = snapshot.skills.filter((skill) => skill.skillId === 'calisthenics');
    expect(buildDailyAdventure(snapshot, ['calisthenics'], 'rest').recommendations).toEqual([]);
    expect(buildDailyAdventure(snapshot, ['calisthenics'], 'rest').week.activityXp).toBe(0);
  });

  it('ignores unknown, duplicate and untracked focus skills', () => {
    const snapshot = createMockSnapshot();
    snapshot.skills = snapshot.skills.filter((skill) => skill.skillId !== 'reading');
    expect(
      buildDailyAdventure(snapshot, [
        'missing',
        'running',
        'running',
        'reading',
        'meditation',
      ]).recommendations.map((card) => card.skillId),
    ).toEqual(['running', 'meditation']);
    expect(buildDailyAdventure(snapshot, []).recommendations.map((card) => card.skillId)).toEqual([
      'calisthenics',
      'running',
      'meditation',
    ]);
  });

  it('does not mutate the snapshot or focus choices, including earned aura boundaries', () => {
    const snapshot = createMockSnapshot();
    snapshot.character.totalXp = 56_990;
    snapshot.boss.hp = 1;
    const before = structuredClone(snapshot);
    const focus = ['calisthenics', 'meditation'];
    const result = buildDailyAdventure(snapshot, focus);
    expect(result.recommendations[0].preview.totalXp).toBe(130);
    expect(snapshot).toEqual(before);
    expect(focus).toEqual(['calisthenics', 'meditation']);
    expect(snapshot.unlockedAuras).toEqual([]);
  });

  it('does not accidentally reuse an earlier recorded preview-shaped request ID', () => {
    const snapshot = createMockSnapshot();
    snapshot.activities.push(
      activity('adventure-preview:2026-09-08:running', snapshot.dayKey, 'running', 5, 15),
    );
    expect(buildDailyAdventure(snapshot, ['running']).recommendations[0].preview.activityXp).toBe(
      45,
    );
  });

  it('keeps every suggestion between 5 and 20 whole minutes', () => {
    const snapshot = createMockSnapshot();
    for (const skill of snapshot.skills) {
      for (const mode of ['balanced', 'focus', 'recovery', 'rest'] as const) {
        for (const card of buildDailyAdventure(snapshot, [skill.skillId], mode).recommendations) {
          expect(Number.isInteger(card.minutes)).toBe(true);
          expect(card.minutes).toBeGreaterThanOrEqual(5);
          expect(card.minutes).toBeLessThanOrEqual(20);
          expect(card.minutes).toBeLessThanOrEqual(card.remainingRewardMinutes);
        }
      }
    }
  });
});

describe('weekly adventure milestones', () => {
  it('uses real rewarded days, skill families and care days without extra rewards', () => {
    const snapshot = createMockSnapshot();
    snapshot.dayKey = '2026-09-10';
    snapshot.activities = [
      activity('strength', '2026-09-07', 'calisthenics', 10, 40),
      activity('run', '2026-09-07', 'running', 10, 30),
      activity('mind', '2026-09-08', 'meditation', 10, 30),
      activity('code', '2026-09-10', 'programming', 20, 40),
    ];
    const week = buildDailyAdventure(snapshot, ['reading']).week;
    expect(week).toMatchObject({
      startDay: '2026-09-07',
      endDay: '2026-09-13',
      activityXp: 140,
      activeDays: 3,
      skillCount: 4,
      familyCount: 3,
      careDays: 1,
    });
    expect(
      week.milestones.map((goal) => [
        goal.id,
        goal.progress,
        goal.target,
        goal.complete,
        goal.rewardXp,
      ]),
    ).toEqual([
      ['active-days', 3, 3, true, 0],
      ['variety', 2, 2, true, 0],
      ['care', 1, 1, true, 0],
    ]);
  });

  it('excludes old weeks, future days, invalid dates, unearned activities and duplicate IDs', () => {
    const snapshot = createMockSnapshot();
    const earned = activity('earned', '2026-09-08', 'running', 10, 30);
    snapshot.activities = [
      earned,
      { ...earned },
      activity('old', '2026-09-06', 'running', 60, 180),
      activity('future', '2026-09-09', 'programming', 10, 20),
      activity('next-week', '2026-09-14', 'meditation', 10, 30),
      activity('bad-date', '2026-09-31', 'running', 10, 30),
      activity('unearned', '2026-09-07', 'meditation', 10, 0),
      { ...activity('no-minutes', '2026-09-07', 'reading', 10, 20), rewardedMinutes: 0 },
      activity('unknown', '2026-09-07', 'unknown', 10, 20),
    ];
    expect(buildDailyAdventure(snapshot, ['reading']).week).toMatchObject({
      activityXp: 30,
      activeDays: 1,
      skillCount: 1,
      familyCount: 1,
      careDays: 0,
    });
  });

  it('handles weeks across a year boundary and resets only the derived weekly view on Monday', () => {
    const snapshot = createMockSnapshot();
    snapshot.dayKey = '2027-01-03';
    snapshot.activities = [
      activity('monday', '2026-12-28', 'running', 10, 30),
      activity('friday', '2027-01-01', 'reading', 10, 20),
      activity('sunday', '2027-01-03', 'recovery', 10, 20),
      activity('old-sunday', '2026-12-27', 'calisthenics', 20, 80),
    ];
    expect(buildDailyAdventure(snapshot, ['running']).week).toMatchObject({
      startDay: '2026-12-28',
      endDay: '2027-01-03',
      activityXp: 70,
      activeDays: 3,
    });
    snapshot.dayKey = '2027-01-04';
    expect(buildDailyAdventure(snapshot, ['running']).week).toMatchObject({
      startDay: '2027-01-04',
      endDay: '2027-01-10',
      activityXp: 0,
      activeDays: 0,
    });
    expect(snapshot.activities).toHaveLength(4);
  });

  it('counts only logged activity XP, without inventing historical quest bonuses', () => {
    const snapshot = recordActivity(createMockSnapshot(), {
      requestId: 'quest',
      skillId: 'calisthenics',
      minutes: 20,
    }).snapshot;
    expect(snapshot.character.totalXp).toBe(26056);
    expect(buildDailyAdventure(snapshot, ['reading']).week.activityXp).toBe(80);
  });

  it('allows an empty week or rest day without negative progress or penalties', () => {
    const snapshot = createMockSnapshot();
    const before = structuredClone(snapshot);
    const result = buildDailyAdventure(snapshot, [], 'rest');
    expect(result.week).toMatchObject({ activityXp: 0, activeDays: 0, skillCount: 0, careDays: 0 });
    expect(
      result.week.milestones.every(
        (goal) => goal.progress === 0 && !goal.complete && goal.rewardXp === 0,
      ),
    ).toBe(true);
    expect(snapshot).toEqual(before);
  });
});
